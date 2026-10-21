# 🏠 Immo-Kartei

Web-App zum Besichtigen von Immobilien: Adressen aus Excel laden, Route planen, vor Ort Fotos (mit Standort) und Notizen erfassen und alles als Karteikarte ansehen.

## Stand

- ✅ Schritt 1: Excel laden, Adressen auf der Karte und in einer Liste
- ✅ Schritt 2: Tagesroute mit Google Maps
- ✅ Schritt 3: Speichern in Google Drive
- ✅ Schritt 4: Fotos mit Standort, Notizen, „bearbeitet“
- ✅ Schritt 5: Karteikarte mit Foto-Karte
- ✅ Schritt 6: Online stellen (vor Schritt 5 gezogen, damit Kamera und GPS am iPhone testbar sind)

## Benutzen

**Online:** https://bitson21.github.io/immo-kartei/

1. Die Adresse oben im Browser öffnen (oder lokal `index.html`).
2. Auf **Excel laden** tippen und die Adressliste wählen.
3. Die App sucht alle Adressen auf der Karte (ca. 1 Sekunde pro Adresse).

### Aufbau der Excel-Datei

Erstes Tabellenblatt, erste Zeile sind die Spaltenüberschriften:

| Unternehmen | Objektname | Strasse_hausnummer | PLZ | Ort |
|---|---|---|---|---|
| Muster GmbH | Rathaus | Marienplatz 1 | 80331 | München |

`Strasse_hausnummer`, `PLZ` und `Ort` sind Pflicht, `Unternehmen` und `Objektname` sind freiwillig. Jede Zeile mit Inhalt wird als Adresse übernommen, also nur die gewünschten Adressen in der Datei lassen.

Rot markierte Adressen wurden nicht gefunden. Dann die Schreibweise in der Karteikarte über **✏️ Bearbeiten** korrigieren.

**Excel erneut laden:** Die App ist führend. Neue Adressen kommen dazu, bei bekannten Adressen werden nur leere Felder aus der Excel ergänzt. In der App bearbeitete Daten (auch geänderte Adressen), Notizen, Fotos und Status bleiben erhalten. Adressen, die nicht mehr in der Excel stehen, werden entfernt (außer von Hand eingegebene).

### Adresse von Hand eingeben

Über der Adressliste auf **＋ Adresse hinzufügen** tippen, Straße und Hausnummer, PLZ und Ort eintragen (Unternehmen und Objektname sind freiwillig), **Hinzufügen**. Die App sucht die Adresse sofort auf der Karte. Steht die Adresse schon in der Liste, öffnet sich stattdessen ihre Karteikarte.

Von Hand eingegebene Adressen bleiben erhalten, wenn später eine Excel-Datei geladen wird.

Jede Adresse lässt sich über das **🗑** rechts in ihrer Zeile der Adressliste oder in ihrer Karteikarte unten über **🗑 Adresse entfernen** löschen (mit Sicherheitsabfrage). Fotos bleiben im Google Drive. Eine Excel-Adresse kommt beim nächsten Laden der Excel wieder.

Mit **Liste leeren** (unter der Adressliste) werden alle Adressen gelöscht, mit Sicherheitsabfrage. Bei Verbindung zu Google Drive auch in der Tabelle, Fotos bleiben erhalten. Wird dieselbe Excel danach erneut geladen, gehören die Fotos wieder zur richtigen Adresse.

### Tagesroute

1. Startpunkt eingeben (z. B. Hotel-Adresse) oder **📍 Mein Standort** tippen.
2. Bei **Stopps heute** im Auswahlfeld wählen, wie viele Adressen angefahren werden sollen (1 bis Anzahl aller Adressen).
3. Optional **Am Ende zurück zum Startpunkt** anhaken.
4. **Route berechnen** tippen.

Die App sucht die Reihenfolge mit der kürzesten **Fahrzeit mit dem Auto** über alle **offenen** Adressen und nimmt davon die gewünschte Anzahl. So ist das Tagesgebiet zusammenhängend, und am nächsten Tag geht es dort weiter. Die Fahrzeiten kommen vom kostenlosen Routendienst OSRM (OpenStreetMap-Straßendaten, ohne Verkehr). Ist er nicht erreichbar, rechnet die App ersatzweise mit Luftlinie und zeigt einen Hinweis. Bei mehr als 100 Adressen fragt die App die Fahrzeiten in mehreren Teilen ab (Anzeige „Teil 1 von 3“ usw.), das dauert ein paar Sekunden länger.

Auf der Karte ist die Route als Linie entlang der Straßen eingezeichnet (gestrichelte gerade Linien nur, wenn der Routendienst nicht erreichbar ist).

Die Route wird in Etappen zu je 10 Adressen aufgeteilt. **In Google Maps öffnen** öffnet die Etappe in Google Maps. Mit Häkchen **Google Maps ab Startpunkt starten** beginnt Etappe 1 am Startpunkt aus der App und jede weitere beim letzten Stopp davor (Google zeigt dann oft nur eine Vorschau). Ohne Häkchen startet Google Maps am aktuellen Standort, mit Sprachnavigation. Dafür muss die **Google-Maps-App** auf dem iPhone installiert sein (im Safari-Browser erlaubt Google nur 3 Zwischenstopps). Bereits bearbeitete Adressen werden in den Etappen übersprungen.

### Karte oder Satellit

Beide Karten haben oben rechts einen Umschalter (Ebenen-Symbol): **Karte** oder **Satellit** (Luftbild mit Straßen- und Ortsnamen). Die Übersicht startet mit der Karte, die Karteikarte mit dem Satellitenbild, damit man das Gebäude sieht. Die App merkt sich die zuletzt gewählte Ansicht.

Luftbilder: © Esri, Maxar, Earthstar Geographics. Für eine dauerhafte gewerbliche Nutzung in größerem Umfang verlangt Esri ein (kostenloses) Entwicklerkonto mit Zugangsschlüssel.

### Vor Ort: Karteikarte

Eine Immobilie in der Liste, in der Tagesroute oder im Karten-Popup (**Karteikarte öffnen**) antippen.

- **📷 Foto aufnehmen** öffnet die Kamera. Die App speichert den GPS-Standort zum Foto (Anzeige z. B. „📍 ±6 m“), verkleinert das Foto auf max. 2000 Pixel und lädt es in den Drive-Ordner der Immobilie. Während des Hochladens kann man schon das nächste Foto machen. Ohne Netz wird alle 10 Sekunden neu versucht, dabei die App offen lassen.
- **🗑** auf einem Foto löscht es (Drive-Papierkorb, 30 Tage wiederherstellbar).
- **Notizen** werden beim Tippen automatisch gespeichert.
- **Als bearbeitet markieren**: Punkt wird grün, die Adresse fällt aus den nächsten Tagesrouten. Erneut tippen setzt sie wieder auf „offen“.
- **✏️ Bearbeiten** (unter der Adresse) ändert Unternehmen, Objektname und Adresse. Bei geänderter Adresse sucht die App sie neu auf der Karte. Fotos, Notizen und Status bleiben.
- **🚗 Hin navigieren** öffnet Google Maps mit dieser Adresse.
- **← Zurück** (oder am iPhone vom linken Rand wischen) schließt die Karteikarte.

**Foto-Karte:** Oben in der Karteikarte zeigt eine kleine Karte das Haus (🏠) und jedes Foto als orangen, nummerierten Punkt an der Stelle, wo es aufgenommen wurde. Die Nummern passen zu den Fotos darunter. Fotos ohne Standort stehen nur in der Foto-Reihe.

- Punkt antippen: kleine Vorschau mit Uhrzeit und Genauigkeit.
- Vorschau oder ein Foto in der Reihe antippen: Foto im **Vollbild**. Mit **‹ ›**, Wischen oder den Pfeiltasten blättern. **In Google Drive öffnen** zeigt die Originaldatei (zum Herunterladen oder Teilen).
- **✕ Schließen** oder Zurück-Wischen schließt das Vollbild, das zuletzt angesehene Foto wird auf der Karte markiert.

Fotos gehen nur über die Kamera in der App, nicht aus der Galerie: Das iPhone entfernt bei Galeriefotos oft den Aufnahmeort.

**Originale in der Fotomediathek sichern:** In Google Drive landen verkleinerte Fotos. Die Originale in voller Größe sammelt die App. Unten erscheint dann **📸 … Originale noch nicht in Fotos gesichert**:

1. Auf **In Fotos sichern** tippen (geht auch für mehrere Fotos auf einmal, z. B. am Ende einer Besichtigung).
2. Im Teilen-Menü des iPhones **Bilder sichern** (bzw. „… Bilder sichern“) antippen.

Die Originale enthalten Aufnahmezeit und GPS-Standort, sodass sie in der Fotos-App auf der Karte erscheinen. Apple erlaubt Web-Apps nicht, ohne diesen Tipp in die Fotomediathek zu speichern. Die Originale liegen bis dahin nur im Arbeitsspeicher der App. Vor dem Schließen warnt die App, solange noch Originale offen sind. **✕** verwirft sie (mit Rückfrage).

**Standort:** Beim Öffnen der Karteikarte startet die Ortung, über dem Foto-Knopf steht der Stand: **📍 Standort aktiv · ±8 m** (alles gut), **⏳ Standort wird ermittelt …** oder eine Warnung mit Grund. Steht dort „Standort nicht erlaubt“:

1. iPhone **Einstellungen** → **Datenschutz & Sicherheit** → **Ortungsdienste**.
2. Ganz oben **Ortungsdienste** einschalten.
3. Weiter unten **Safari-Websites** antippen → **Beim Verwenden der App** wählen und **Genauer Standort** einschalten.
4. Die Immo-Kartei ganz schließen (von unten wischen, nach oben wegschieben) und neu öffnen.
5. Eine Karteikarte öffnen. Fragt das iPhone nach dem Standort: **Erlauben**.

## Auf dem iPhone einrichten

1. In **Safari** die Adresse https://bitson21.github.io/immo-kartei/ öffnen.
2. Unten auf das **Teilen**-Symbol (Quadrat mit Pfeil nach oben) tippen.
3. Nach unten scrollen und **Zum Home-Bildschirm** tippen, dann **Hinzufügen**.
4. Die App über das neue Icon **Immo-Kartei** auf dem Home-Bildschirm öffnen.
5. Oben auf **☁️ Verbinden** tippen, Web-App-Adresse und Zugangscode eintragen, **Verbinden**.
6. Bei der ersten Foto- oder Standort-Frage **Erlauben** tippen.

Die App vom Home-Bildschirm hat einen eigenen Speicher, getrennt von Safari. Deshalb muss die Verbindung dort einmal neu eingetragen werden. Die Web-App-Adresse lässt sich am einfachsten am Mac kopieren und am iPhone einfügen (gleiche Apple-ID, „Handoff“ an).

Für Etappen mit mehr als 3 Stopps muss die **Google-Maps-App** installiert sein.

**Updates:** Gibt es eine neue Version, erscheint unten der Hinweis **🔄 Neue Version verfügbar**. Auf **Aktualisieren** tippen. (Die App prüft das beim Öffnen und beim Zurückkehren in die App.)

## Google Drive verbinden (einmalig, ca. 10 Minuten)

Die Daten liegen in einer Google-Tabelle in deinem Drive, die Fotos in einem Ordner „Immo-Kartei Fotos“. Die Verbindung macht ein kleines Google-Skript ([apps-script/Code.gs](apps-script/Code.gs)).

**A. Tabelle und Skript anlegen**

1. [drive.google.com](https://drive.google.com) öffnen.
2. Links auf **+ Neu** → **Google Tabellen** → **Leere Tabelle** klicken.
3. Oben links auf **Unbenannte Tabelle** klicken, `Immo-Kartei` eintippen, Enter.
4. Im Menü **Erweiterungen** → **Apps Script** klicken. Ein neuer Tab öffnet sich.
5. Oben links auf **Unbenanntes Projekt** klicken, `Immo-Kartei` eintippen, **Umbenennen** klicken.
6. Im Editor den vorhandenen Text komplett markieren (Cmd+A) und löschen.
7. Den Inhalt von `apps-script/Code.gs` einfügen (Cmd+V).
8. In Zeile 7 `HIER-EIGENEN-CODE-EINTRAGEN` durch einen eigenen Zugangscode ersetzen (mind. 8 Zeichen, die Anführungszeichen bleiben stehen). Den Code notieren.
9. Auf das Disketten-Symbol **Projekt speichern** klicken (oder Cmd+S).

**B. Zugriff erlauben**

10. Oben in der Leiste im Auswahlfeld neben **Debuggen** die Funktion **einrichten** auswählen.
11. Auf **Ausführen** klicken.
12. Im Fenster „Autorisierung erforderlich“ auf **Berechtigungen prüfen** klicken und dein Google-Konto wählen.
13. Bei „Google hat diese App nicht überprüft“ auf **Erweitert** klicken, dann auf **Zu Immo-Kartei wechseln (unsicher)**. (Das ist normal bei selbst geschriebenen Skripten.)
14. Falls Häkchen angezeigt werden: **Alle auswählen**. Dann auf **Weiter** bzw. **Zulassen** klicken.
15. Unten im Protokoll steht „Fertig. Foto-Ordner: …“.

**C. Als Web-App veröffentlichen**

16. Rechts oben auf den blauen Knopf **Bereitstellen** → **Neue Bereitstellung** klicken.
17. Links neben „Typ auswählen“ auf das Zahnrad klicken → **Web-App**.
18. Beschreibung: `Immo-Kartei`. **Ausführen als:** „Ich“. **Zugriff:** „Jeder“.
19. Auf **Bereitstellen** klicken.
20. Unter „Web-App“ die Adresse mit **Kopieren** kopieren, dann **Fertig**.

**D. In der Immo-Kartei verbinden**

21. In der App oben auf **☁️ Verbinden** tippen.
22. Die Web-App-Adresse einfügen und den Zugangscode eintragen.
23. **Verbinden** tippen. Sind schon Adressen im Browser, werden sie in die Tabelle hochgeladen.

„Zugriff: Jeder“ heißt nur, dass die App das Skript ohne Google-Anmeldung erreichen kann. Ohne den Zugangscode liefert das Skript nichts.

Danach zeigt der Knopf oben den Stand: **☁️ ✓** alles gespeichert, **☁️ …** speichert gerade, **☁️ ⚠️** Fehler (Änderungen bleiben vorgemerkt und werden erneut gesendet).

**Wichtig:** In der Google-Tabelle keine Spalten umsortieren oder umbenennen. Wird `Code.gs` später geändert, muss es über **Bereitstellen** → **Bereitstellungen verwalten** → Stift-Symbol → Version **Neue Version** → **Bereitstellen** neu veröffentlicht werden (die Adresse bleibt gleich).

## Datenschutz

Excel-Dateien sind per `.gitignore` vom Repo ausgeschlossen. Adressen, Fotos und Notizen sollen nur im eigenen Google Drive liegen, nie im Code.
