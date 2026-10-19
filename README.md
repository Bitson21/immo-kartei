# 🏠 Immo-Kartei

Web-App zum Besichtigen von Immobilien: Adressen aus Excel laden, Route planen, vor Ort Fotos (mit Standort) und Notizen erfassen und alles als Karteikarte ansehen.

## Stand

- ✅ Schritt 1: Excel laden, Adressen auf der Karte und in einer Liste
- ✅ Schritt 2: Tagesroute mit Google Maps
- ✅ Schritt 3: Speichern in Google Drive
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

Mit **Liste leeren** (unter der Adressliste) werden alle Adressen gelöscht, mit Sicherheitsabfrage. Bei Verbindung zu Google Drive auch in der Tabelle, Fotos bleiben erhalten. Wird dieselbe Excel danach erneut geladen, gehören die Fotos wieder zur richtigen Adresse.

### Tagesroute

1. Startpunkt eingeben (z. B. Hotel-Adresse) oder **📍 Mein Standort** tippen.
2. Eintragen, wie viele **Stopps heute** geschafft werden sollen.
3. Optional **Am Ende zurück zum Startpunkt** anhaken.
4. **Route berechnen** tippen.

Die App sucht die Reihenfolge mit der kürzesten **Fahrzeit mit dem Auto** über alle **offenen** Adressen und nimmt davon die gewünschte Anzahl. So ist das Tagesgebiet zusammenhängend, und am nächsten Tag geht es dort weiter. Die Fahrzeiten kommen vom kostenlosen Routendienst OSRM (OpenStreetMap-Straßendaten, ohne Verkehr). Ist er nicht erreichbar, rechnet die App ersatzweise mit Luftlinie und zeigt einen Hinweis.

Die Route wird in Etappen zu je 10 Adressen aufgeteilt. **In Google Maps öffnen** startet die Navigation ab dem aktuellen Standort. Dafür muss die **Google-Maps-App** auf dem iPhone installiert sein (im Safari-Browser erlaubt Google nur 3 Zwischenstopps). Bereits bearbeitete Adressen werden in den Etappen übersprungen.

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
