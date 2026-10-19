# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

„Immo-Kartei“: Web-App für das Besichtigen von ca. 50 Immobilien über 3 Tage. Adressen kommen aus einer Excel-Datei, vor Ort werden Fotos mit GPS-Standort und Notizen erfasst, danach gibt es pro Immobilie eine „Karteikarte“ mit Karte und Foto-Punkten. Die ganze App steckt in einer einzigen Datei, `index.html` (HTML, CSS und JS inline). Kein Build, keine Tests, kein Linter. Bibliotheken kommen per CDN (cdnjs): Leaflet 1.9.4 (Karte), SheetJS 0.18.5 (Excel).

**Ausführen:** über den Testserver `immo-kartei` aus `../.claude/launch.json` (Python-Webserver auf Port 8765). Direkt als Datei öffnen geht auch, aber Nominatim kann Anfragen ohne Referer ablehnen.

**Gerät des Nutzers:** iPhone (Safari), später auch Computer. Es gibt immer Mobilfunk, Offline-Betrieb ist nicht nötig.

## Geplante Schritte (siehe README „Stand“)

1. ✅ Excel-Import, Geocoding, Karte und Liste
2. ✅ Tagesroute: Startpunkt/Standort + Anzahl Stopps, Auswahl aus den **offenen** Adressen, eigene Reihenfolge-Optimierung nach **Auto-Fahrzeit** (Nächster Nachbar + 2-opt; der Nutzer will ausdrücklich keine Luftlinie), Übergabe an Google Maps in Etappen à 10 Adressen (9 Zwischenstopps + Ziel, Grenze der Google-Maps-App)
3. ✅ Speicher in Google Drive: Google-Tabelle + Drive-Ordner für Fotos über ein Apps-Script-Web-App (`apps-script/Code.gs`), geschützt mit Zugangscode.
4. ✅ Vor Ort: Fotos **in der App aufnehmen** und dabei `navigator.geolocation` speichern (iOS entfernt EXIF-GPS beim Hochladen aus der Galerie oft), Notizen, Status „bearbeitet“
5. ✅ Karteikarte: Karte mit Foto-Punkten, Klick zeigt Foto, Notizen darunter
6. ✅ GitHub Pages (Repo öffentlich, enthält keine Daten). Wurde vor Schritt 5 gezogen, damit der Nutzer Kamera/GPS am iPhone testen kann.

Später: Zugriff für weitere Personen.

## GitHub

- Remote `Bitson21/immo-kartei` (**öffentlich**). Live über GitHub Pages aus Branch `main`: https://bitson21.github.io/immo-kartei/ – jeder Merge auf `main` geht nach 1–2 Minuten live. Per `<meta name="robots" content="noindex">` für Suchmaschinen gesperrt.
- Änderungen laufen über PRs (eigener Branch, nicht direkt auf `main`).
- **Bei jeder Änderung an `index.html` die Konstante `APP_VERSION` hochsetzen** (Format `JJJJ-MM-TT.N`). GitHub Pages schickt `max-age=600`, und die iPhone-Home-Bildschirm-App lädt oft noch länger aus dem Zwischenspeicher. `aufUpdatePruefen()` holt `index.html` mit `cache: 'no-store'`, vergleicht `APP_VERSION` und zeigt sonst den Hinweis `#updateHinweis`. „Aktualisieren“ lädt über `?v=<version>` neu (neue Adresse = am Cache vorbei). Geprüft wird beim Start, bei `visibilitychange` und alle 30 Minuten.
- Weil öffentlich: nie echte Adressen, Web-App-Adressen, Zugangscodes oder E-Mail-Adressen committen. Commit-Autor ist `Bitson21 <335550459+Bitson21@users.noreply.github.com>` (lokal im Repo eingestellt).
- `apple-touch-icon.png` (180×180) ist das Home-Bildschirm-Icon. Am iPhone hat die Home-Bildschirm-App einen eigenen `localStorage`, getrennt von Safari.

## Architektur (alles in `index.html` im `<script>`)

- **Einstellungen oben:** `SPEICHER_KEY`, `GEOCODER_PAUSE_MS` (Nominatim erlaubt max. 1 Anfrage/s), `START_ANSICHT`, `SPALTEN` (Pflichtspalten Strasse_hausnummer/PLZ/Ort) und `SPALTEN_OPTIONAL` (Unternehmen/Objektname). Spaltennamen ohne Beachtung von Groß-/Kleinschreibung.
- **Zustand:** `objekte` = Array von `{ id, unternehmen, objektname, strasse, plz, ort, lat, lon, geoStatus: 'ok'|'fehlt'|'offen', status: 'offen'|'bearbeitet', notizen }`. Nach **jeder** Änderung `speichern(ids)` aufrufen (ohne ids = alle): schreibt `localStorage` und merkt die ids zum Hochladen vor. Gelöschte Objekte über `loeschenVormerken(ids)`. `lesen()`/`merken()` kapseln `localStorage` mit `try/catch`.
- **IDs:** neue Objekte bekommen `idAusAdresse(schluessel, praefix)` (FNV-Hash), damit nach „Liste leeren“ + erneutem Import Fotos (`objektId`) wieder passen. Doppelte Adressen bekommen ein angehängtes `x`. Präfix `o` = aus Excel, `m` = von Hand eingegeben (`istManuell()`). So braucht es keine eigene Spalte in der Google-Tabelle (Code.gs bleibt unverändert).
- **Von Hand eingeben:** Formular `#neuPanel`/`#neuForm`, geöffnet über Knöpfe `[data-neu]` in `listeZeichnen()`. Prüft Duplikate über `schluessel()` (öffnet dann die vorhandene Karteikarte), legt das Objekt mit `m`-ID an und ruft `koordinatenSuchen()`. `importieren()` hängt manuelle Objekte, die nicht in der Excel stehen, wieder an.
- **Adresse entfernen:** Knopf `#kkEntfernen` in der Karteikarte (für alle Adressen), `loeschenVormerken([id])`, Fotos bleiben.
- **Import:** `zeilenAusExcel()` liest das erste Blatt und füllt PLZ wieder auf 5 Stellen auf. `importieren()` übernimmt bekannte Adressen (Schlüssel `schluessel()`, nur die Adresse) samt Koordinaten, Status und Notizen, Unternehmen/Objektname kommen immer neu aus der Excel. Nicht mehr enthaltene Adressen werden auch in Google gelöscht.
- **Geocoding:** `geocode()` nutzt Nominatim strukturiert (`street`, `postalcode`, `city`, `countrycodes=de`). `koordinatenSuchen()` arbeitet alle `geoStatus: 'offen'` nacheinander ab. Netzwerkfehler lassen den Status auf `offen`, beim nächsten Laden wird erneut gesucht. `suchLauf` ist ein Zähler: „Liste leeren“ erhöht ihn, dann bricht ein laufender Suchlauf ab.
- **Anzeige:** `karteZeichnen()` (Leaflet-`circleMarker`, blau = offen, grün = bearbeitet), `listeZeichnen()` (nicht gefundene zuerst, rot). Überschrift über `titel()` (Objektname, sonst Straße), darunter `unterzeilen()`. Nutzertexte immer mit `esc()` einsetzen.
- **Liste leeren:** Knopf `#leeren` unter der Liste (in `listeZeichnen()` erzeugt), `listeLeeren()` mit `confirm()`-Abfrage. Löscht auch die Route und (bei Verbindung) die Zeilen in der Google-Tabelle, nicht die Fotos.
- **Google Drive:** `verbindung = { url, code }` unter `VERBINDUNG_KEY`. `api(aktion, daten)` macht `fetch` POST **ohne eigene Header** (sonst CORS-Preflight, den Apps Script nicht beantwortet). Aktionen siehe `AKTIONEN` in `apps-script/Code.gs`: `laden`, `objekteSpeichern` (Upsert per id), `objekteLoeschen`, `fotoHochladen`, `fotoLaden`, `fotoLoeschen`. Die Tabelle speichert alles als Text, `normalisieren()` wandelt zurück (Zahlen, PLZ-Nullen).
- **Synchronisierung:** `ausstehend = { speichern: Set, loeschen: Set }` unter `AUSSTEHEND_KEY`. `hochladenPlanen()` (1,5 s Verzögerung) → `hochladen()`; bei Fehler zurück in die Sets und neuer Versuch nach 15 s. `synchronisieren()` beim Start/Verbinden: erst hochladen, dann `laden`; die Google-Tabelle gewinnt, ist sie leer, werden die lokalen Objekte hochgeladen. Status im Knopf `#cloudBtn` über `cloudStatus()`. Die Route bleibt pro Gerät lokal.
- **Karteikarte:** Vollbild-Overlay `#karteikarte`, `karteikarteOeffnen(id)` (aus Liste, Routenliste und Popup-Knopf `[data-oeffnen]`; der Klick-Listener auf `#karte` läuft in der Capture-Phase, weil Leaflet Klicks in Popups stoppt). `history.pushState` + `popstate`, damit Zurück/Wischen am iPhone die Karteikarte schließt. `karteikarteZeichnen()` zeichnet alles neu.
- **Fotos:** `<input type=file accept=image/* capture=environment>`. Standort: `standortStarten()` beim Öffnen der Karteikarte (`watchPosition`, `standortStoppen()` beim Schließen), Anzeige in `#kkStandort` über `standortAnzeigen()` mit Fehlergrund (`standortFehler` 1/2/3/'fehlt') und iPhone-Anleitung. Beim Foto: `frischerStandort()` (max. `STANDORT_MAX_ALTER_MS` alt) + ein `standortHolen(10000)` nach dem Auslösen, `genauere()` nimmt den genaueren; bei „nicht erlaubt“ wird nicht gewartet. **Nicht** beim Tippen auf den Foto-Knopf nach dem Standort fragen: Am iPhone ging die Erlaubnis-Frage dabei unter der Kamera unter, alle Fotos kamen ohne Standort an. `bildVerkleinern()` (Canvas, `FOTO_MAX_PX`, `FOTO_QUALITAET`), dann `uploadSchlange` → `uploadsAbarbeiten()` nacheinander, bei Fehler alle 10 s neu (nur im Arbeitsspeicher, `beforeunload` warnt). Vorschaubilder über `fotoLaden` in `fotoCache` (Blob-URLs). `fotos` = Foto-Zeilen aus der Tabelle, kommen mit `laden`.
- **Foto-Karte:** `fotoKarteZeichnen(o, liste)` in `#kkKarte` (zweite Leaflet-Karte `kkKarte`, einmal angelegt, danach `invalidateSize()`). Haus = `nummerIcon('🏠','haus')`, Fotos = `nummerIcon(nr,'foto')` (orange), Nummer = Index in `fotosVon()` + 1, wie im Badge der Foto-Reihe. `kkFotoMarker[index]` (null ohne Standort, `hatStandort()`). Neu gezoomt wird nur, wenn sich `kkKarteStand` (Objekt + Foto-IDs) ändert. Popup-Bild lädt erst bei `popupopen`.
- **Bilder laden:** immer über `fotoUrl(dateiId)` (Cache `fotoCache` + `fotoLadend` gegen doppelte Anfragen).
- **Vollbild:** `#vollbild`, `vollbildOeffnen(index)`/`vollbildZeigen()`/`vollbildSchliessen()`, Blättern per Knöpfe, Pfeiltasten, Wischen (> 50 px). Eigener Verlaufseintrag `{ karteikarte, vollbild }`; der `popstate`-Handler schließt erst das Vollbild, dann die Karteikarte. Drive-Link `drive.google.com/file/d/<dateiId>/view` (nur für den Besitzer sichtbar).
- **Notizen/Status:** `notizSpeichern()` (1 s nach Tippen und beim Verlassen), Status-Knopf setzt `status`/`bearbeitetAm`. Beides über `speichern([id])`.
- **Code.gs ändern:** Nutzer muss neu bereitstellen (README). Darum Code.gs möglichst stabil halten; der Zugangscode steht nur in der Google-Kopie, im Repo bleibt der Platzhalter.
- **Tagesroute:** Zustand `route = { start: { text, ziel, lat, lon }, ids, rund, km, minuten, basis: 'strasse'|'luftlinie' }` unter `ROUTE_KEY`. `routeBerechnen()` holt mit `fahrMatrix()` eine Fahrzeit-/Streckentabelle vom öffentlichen OSRM-Demo-Server (`OSRM_URL`, Table-Service, max. `OSRM_MAX_PUNKTE`, eine Anfrage pro Berechnung) und optimiert mit `optimieren(start, punkte, rund, dist)` über **alle** offenen Adressen; davon die ersten n (bei Rundtour danach die n noch einmal als Rundtour optimiert). `dist` = Mittelwert aus Hin- und Rück-Fahrzeit (2-opt braucht symmetrische Werte), Summen für km/Minuten in Fahrtrichtung. Fällt OSRM aus, wird mit `km()` (Luftlinie, Haversine) gerechnet und gewarnt. `start.ziel` ist der Text für Google Maps (Adresse oder `lat,lon` bei „Mein Standort“). `standortPos` wird beim Tippen ins Startfeld verworfen.
- **Etappen:** `routeZeichnen()` teilt in Blöcke à `ETAPPE_STOPPS` (10), `mapsLink()` baut `google.com/maps/dir/?api=1` **ohne `origin`** (= aktueller Standort). Bearbeitete Stopps fallen aus dem Link heraus. Im Safari ohne Google-Maps-App erlaubt Google nur 3 Zwischenstopps.
- **Karte mit Route:** Routenstopps als nummerierte `L.divIcon` (`.nr`), Start als „S“. Linie = `route.linie` (Straßenverlauf vom OSRM-Route-Service `OSRM_ROUTE_URL`, `strassenverlauf(routePfad())`, auf 5 Nachkommastellen gerundet, mit der Route im `localStorage`). Fehlt sie, gestrichelte gerade Linie und `strassenverlaufNachholen()` (einmal pro Route). Nicht eingeplante Adressen werden blass gezeigt.
- **Kartenhintergrund:** `kartenHintergrund(karte, merkKey, standard)` legt „Karte“ (OSM) und „Satellit“ (Esri World_Imagery + Reference/World_Transportation + Reference/World_Boundaries_and_Places, ohne API-Schlüssel) mit `L.control.layers` an und merkt die Wahl (`immoKartei.hintergrund`, `immoKartei.hintergrundKarteikarte`). Übersicht startet mit Karte, Karteikarte mit Satellit (`fitBounds` max. Zoom 18, Luftbild bei 19 oft unscharf). Kopfzeile hat `z-index: 1100`, damit Leaflet-Knöpfe (1000) beim Scrollen darunter bleiben.
- **Test der Optimierung:** In der Konsole für 8 Zufallspunkte alle Permutationen durchrechnen und mit `streckeKm(start, optimieren(...), rund)` vergleichen (Stand: Ø +0,6 %, schlechtester Fall ca. +6 %). OSRM-Ausfall testen, indem `window.fetch` für `project-osrm` kurz einen Fehler liefert.
- **Beim Testen:** Im Browser-Bereich liegen echte Adressen des Nutzers im `localStorage`. Testdaten nur im Arbeitsspeicher (`objekte = …`) setzen, alle `immoKartei.*`-Schlüssel vorher sichern und danach wiederherstellen.
- **Der Browser-Bereich ist mit dem echten Google Drive des Nutzers verbunden.** Vor Tests, die schreiben, `window.fetch` für `script.google.com` durch eine Attrappe ersetzen, und beim Aufräumen erst `localStorage` wiederherstellen (inkl. `immoKartei.ausstehend`), dann neu laden, sonst landen Testdaten in der echten Tabelle. Kamera per `DataTransfer` auf `#kamera` + `change`-Event, GPS per Überschreiben von `navigator.geolocation.getCurrentPosition` simulieren.
- **Google-Skript testen ohne Google:** `window.fetch` für `https://script.google.com/` durch eine Attrappe ersetzen, die `AKTIONEN` aus Code.gs nachbildet (Werte als Text speichern, Zugangscode prüfen).

## Hinweise

- UI-Texte und Kommentare auf Deutsch.
- Echte Adresslisten (`*.xlsx`, `*.csv`) nie committen, sie sind per `.gitignore` ausgeschlossen.
- Test im Browser: In der Konsole mit `XLSX.utils.aoa_to_sheet` eine Mappe bauen und `importieren(XLSX.write(wb, {type:'array', bookType:'xlsx'}))` aufrufen.
