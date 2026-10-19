# 🏠 Immo-Kartei

Web-App zum Besichtigen von Immobilien: Adressen aus Excel laden, Route planen, vor Ort Fotos (mit Standort) und Notizen erfassen und alles als Karteikarte ansehen.

## Stand

- ✅ Schritt 1: Excel laden, Adressen auf der Karte und in einer Liste
- ⏳ Schritt 2: Tagesroute mit Google Maps
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

## Datenschutz

Excel-Dateien sind per `.gitignore` vom Repo ausgeschlossen. Adressen, Fotos und Notizen sollen nur im eigenen Google Drive liegen, nie im Code.
