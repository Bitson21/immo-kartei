// Immo-Kartei – Google Apps Script
// Brücke zwischen der App und deinem Google Drive: speichert Objekte in dieser
// Google-Tabelle und Fotos im Drive-Ordner „Immo-Kartei Fotos“.
// Einrichtung: siehe README.md im Projekt („Google Drive verbinden“).

// ▼▼▼ Hier deinen eigenen Zugangscode eintragen (mind. 8 Zeichen) ▼▼▼
const ZUGANGSCODE = 'HIER-EIGENEN-CODE-EINTRAGEN';
// ▲▲▲

const ORDNER_NAME = 'Immo-Kartei Fotos';

// Spaltenreihenfolge in der Tabelle. Bitte die Spalten in der Tabelle nicht umsortieren.
const OBJEKTE = {
  blatt: 'Objekte',
  spalten: ['id', 'unternehmen', 'objektname', 'strasse', 'plz', 'ort', 'lat', 'lon',
            'geoStatus', 'status', 'notizen', 'bearbeitetAm', 'geaendertAm'],
};
const FOTOS = {
  blatt: 'Fotos',
  spalten: ['id', 'objektId', 'dateiId', 'dateiname', 'lat', 'lon', 'genauigkeit',
            'aufgenommenAm', 'hochgeladenAm'],
};

// ---------- Eingang ----------

// Aufruf im Browser: zeigt nur, dass das Skript läuft
function doGet() {
  return ContentService.createTextOutput('Immo-Kartei-Skript läuft.');
}

// Alle Anfragen der App kommen als POST mit JSON: { code, aktion, ... }
function doPost(e) {
  let antwort;
  try {
    if (ZUGANGSCODE === 'HIER-EIGENEN-CODE-EINTRAGEN' || ZUGANGSCODE.length < 8) {
      throw new Error('Im Google-Skript ist noch kein eigener Zugangscode (mind. 8 Zeichen) eingetragen.');
    }
    const anfrage = JSON.parse(e.postData.contents);
    if (anfrage.code !== ZUGANGSCODE) throw new Error('Falscher Zugangscode.');
    const aktion = AKTIONEN[anfrage.aktion];
    if (!aktion) throw new Error('Unbekannte Aktion: ' + anfrage.aktion);
    antwort = Object.assign({ ok: true }, aktion(anfrage));
  } catch (fehler) {
    antwort = { ok: false, fehler: String(fehler && fehler.message || fehler) };
  }
  return ContentService.createTextOutput(JSON.stringify(antwort))
    .setMimeType(ContentService.MimeType.JSON);
}

const AKTIONEN = {
  // Alles laden: { objekte: [...], fotos: [...] }
  laden: () => ({
    objekte: zeilenLesen(OBJEKTE),
    fotos: zeilenLesen(FOTOS),
  }),

  // Objekte anlegen oder aktualisieren (anhand der id): { objekte: [...] }
  objekteSpeichern: anfrage => mitSperre(() => {
    const jetzt = new Date().toISOString();
    const zeilen = zeilenLesen(OBJEKTE);
    const index = {};
    zeilen.forEach((z, i) => { index[z.id] = i; });
    anfrage.objekte.forEach(o => {
      const neu = Object.assign({}, o, { geaendertAm: jetzt });
      if (o.id in index) zeilen[index[o.id]] = neu;
      else { index[o.id] = zeilen.length; zeilen.push(neu); }
    });
    zeilenSchreiben(OBJEKTE, zeilen);
    return { anzahl: anfrage.objekte.length };
  }),

  // Objekte löschen: { ids: [...] } oder { alle: true }. Fotos bleiben erhalten.
  objekteLoeschen: anfrage => mitSperre(() => {
    const weg = new Set(anfrage.ids || []);
    const zeilen = anfrage.alle ? [] : zeilenLesen(OBJEKTE).filter(z => !weg.has(z.id));
    zeilenSchreiben(OBJEKTE, zeilen);
    return { anzahl: zeilen.length };
  }),

  // Foto speichern: { objektId, ordnerName, bild (Base64-JPEG), lat, lon, genauigkeit, aufgenommenAm }
  fotoHochladen: anfrage => {
    const id = 'f' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    const zeit = anfrage.aufgenommenAm || new Date().toISOString();
    const dateiname = zeit.slice(0, 19).replace(/[T:]/g, '-') + '_' + id + '.jpg';
    const blob = Utilities.newBlob(Utilities.base64Decode(anfrage.bild), 'image/jpeg', dateiname);
    const datei = unterordner(anfrage.ordnerName || anfrage.objektId).createFile(blob);
    const foto = {
      id: id, objektId: anfrage.objektId, dateiId: datei.getId(), dateiname: dateiname,
      lat: anfrage.lat, lon: anfrage.lon, genauigkeit: anfrage.genauigkeit,
      aufgenommenAm: zeit, hochgeladenAm: new Date().toISOString(),
    };
    mitSperre(() => {
      const zeilen = zeilenLesen(FOTOS);
      zeilen.push(foto);
      zeilenSchreiben(FOTOS, zeilen);
    });
    return { foto: foto };
  },

  // Foto als Base64 holen: { dateiId }
  fotoLaden: anfrage => {
    const datei = DriveApp.getFileById(anfrage.dateiId);
    return { bild: Utilities.base64Encode(datei.getBlob().getBytes()) };
  },

  // Foto löschen: { id }. Die Datei kommt in den Drive-Papierkorb (dort 30 Tage wiederherstellbar).
  fotoLoeschen: anfrage => mitSperre(() => {
    const zeilen = zeilenLesen(FOTOS);
    const foto = zeilen.find(z => z.id === anfrage.id);
    if (foto && foto.dateiId) {
      try { DriveApp.getFileById(foto.dateiId).setTrashed(true); } catch (e) { /* Datei schon weg */ }
    }
    zeilenSchreiben(FOTOS, zeilen.filter(z => z.id !== anfrage.id));
    return {};
  }),
};

// ---------- Tabelle ----------

function blatt(def) {
  const tabelle = SpreadsheetApp.getActiveSpreadsheet();
  let b = tabelle.getSheetByName(def.blatt);
  if (!b) b = tabelle.insertSheet(def.blatt);
  if (b.getLastRow() === 0) {
    b.getRange(1, 1, 1, def.spalten.length).setValues([def.spalten]).setFontWeight('bold');
    b.setFrozenRows(1);
  }
  return b;
}

// Alle Datenzeilen als Objekte { spalte: wert }
function zeilenLesen(def) {
  const b = blatt(def);
  const anzahl = b.getLastRow() - 1;
  if (anzahl < 1) return [];
  return b.getRange(2, 1, anzahl, def.spalten.length).getValues()
    .filter(z => z[0] !== '')
    .map(z => {
      const o = {};
      def.spalten.forEach((k, i) => { o[k] = z[i] instanceof Date ? z[i].toISOString() : z[i]; });
      return o;
    });
}

// Alle Datenzeilen ersetzen. Als Text gespeichert, damit z. B. die PLZ „01067“ ihre Null behält.
function zeilenSchreiben(def, zeilen) {
  const b = blatt(def);
  const breite = def.spalten.length;
  const alt = b.getLastRow() - 1;
  if (alt > 0) b.getRange(2, 1, alt, breite).clearContent();
  if (!zeilen.length) return;
  const werte = zeilen.map(o => def.spalten.map(k => (o[k] === null || o[k] === undefined) ? '' : String(o[k])));
  b.getRange(2, 1, werte.length, breite).setNumberFormat('@').setValues(werte);
}

// Verhindert, dass zwei gleichzeitige Anfragen sich gegenseitig überschreiben
function mitSperre(fn) {
  const sperre = LockService.getScriptLock();
  sperre.waitLock(30000);
  try { return fn(); } finally { sperre.releaseLock(); }
}

// ---------- Drive ----------

function hauptordner() {
  const einstellungen = PropertiesService.getScriptProperties();
  const id = einstellungen.getProperty('ordnerId');
  if (id) {
    try {
      const ordner = DriveApp.getFolderById(id);
      if (!ordner.isTrashed()) return ordner;
    } catch (e) { /* Ordner gelöscht, neu anlegen */ }
  }
  const ordner = DriveApp.createFolder(ORDNER_NAME);
  einstellungen.setProperty('ordnerId', ordner.getId());
  return ordner;
}

// Ein Unterordner pro Immobilie (z. B. „Rathaus – Marienplatz 1, 80331 München“)
function unterordner(name) {
  const sauber = String(name).replace(/[\/\\]/g, '-').slice(0, 120);
  const haupt = hauptordner();
  const treffer = haupt.getFoldersByName(sauber);
  return treffer.hasNext() ? treffer.next() : haupt.createFolder(sauber);
}

// Zum Testen im Skript-Editor: legt die Blätter und den Foto-Ordner an.
// Oben „einrichten“ auswählen und auf „Ausführen“ klicken.
function einrichten() {
  blatt(OBJEKTE);
  blatt(FOTOS);
  const ordner = hauptordner();
  Logger.log('Fertig. Foto-Ordner: ' + ordner.getUrl());
}
