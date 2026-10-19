# 🏠 Immo-Kartei

Web-App zum Besichtigen von Immobilien: Adressen aus Excel laden, Route planen, vor Ort Fotos (mit Standort) und Notizen erfassen und alles als Karteikarte ansehen.

## Stand

- ✅ Schritt 1: Excel laden, Adressen auf der Karte und in einer Liste
- ✅ Schritt 2: Tagesroute mit Google Maps
- ⏳ Schritt 3: Speichern in Google Drive
- ⏳ Schritt 4: Fotos mit Standort, Notizen, „bearbeitet“
- ⏳ Schritt 5: Karteikarte mit Foto-Karte
- ⏳ Schritt 6: Online stellen und am iPhone testen

## Benutzen

1. `index.html` im Browser öffnen.
2. Auf **Excel laden** tippen und die Adressliste wählen.
3. Die App sucht alle Adressen auf der Karte (ca. 1 Sekunde pro Adresse).

### Aufbau der Excel-Datei

Erstes Tabellenblatt, erste Zeile sind die Spaltenüberschriften:

| Unternehmen | Objektname | Strasse_hausnummer | PLZ | Ort |
|---|---|---|---|---|
| Muster GmbH | Rathaus | Marienplatz 1 | 80331 | München |

`Strasse_hausnummer`, `PLZ` und `Ort` sind Pflicht, `Unternehmen` und `Objektname` sind freiwillig. Jede Zeile mit Inhalt wird als Adresse übernommen, also nur die gewünschten Adressen in der Datei lassen.

Rot markierte Adressen wurden nicht gefunden. Dann die Schreibweise in der Excel prüfen und die Datei erneut laden. Bereits gefundene Adressen werden dabei nicht noch einmal gesucht.

Mit **Liste leeren** werden alle Adressen gelöscht (mit Sicherheitsabfrage).

### Tagesroute

1. Startpunkt eingeben (z. B. Hotel-Adresse) oder **📍 Mein Standort** tippen.
2. Eintragen, wie viele **Stopps heute** geschafft werden sollen.
3. Optional **Am Ende zurück zum Startpunkt** anhaken.
4. **Route berechnen** tippen.

Die App sucht die Reihenfolge mit der kürzesten **Fahrzeit mit dem Auto** über alle **offenen** Adressen und nimmt davon die gewünschte Anzahl. So ist das Tagesgebiet zusammenhängend, und am nächsten Tag geht es dort weiter. Die Fahrzeiten kommen vom kostenlosen Routendienst OSRM (OpenStreetMap-Straßendaten, ohne Verkehr). Ist er nicht erreichbar, rechnet die App ersatzweise mit Luftlinie und zeigt einen Hinweis.

Die Route wird in Etappen zu je 10 Adressen aufgeteilt. **In Google Maps öffnen** startet die Navigation ab dem aktuellen Standort. Dafür muss die **Google-Maps-App** auf dem iPhone installiert sein (im Safari-Browser erlaubt Google nur 3 Zwischenstopps). Bereits bearbeitete Adressen werden in den Etappen übersprungen.

## Datenschutz

Excel-Dateien sind per `.gitignore` vom Repo ausgeschlossen. Adressen, Fotos und Notizen sollen nur im eigenen Google Drive liegen, nie im Code.
