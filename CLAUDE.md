# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

„Immo-Kartei“: Web-App für das Besichtigen von ca. 50 Immobilien über 3 Tage. Adressen kommen aus einer Excel-Datei, vor Ort werden Fotos mit GPS-Standort und Notizen erfasst, danach gibt es pro Immobilie eine „Karteikarte“ mit Karte und Foto-Punkten. Die ganze App steckt in einer einzigen Datei, `index.html` (HTML, CSS und JS inline). Kein Build, keine Tests, kein Linter. Bibliotheken kommen per CDN (cdnjs): Leaflet 1.9.4 (Karte), SheetJS 0.18.5 (Excel).

**Ausführen:** über den Testserver `immo-kartei` aus `../.claude/launch.json` (Python-Webserver auf Port 8765). Direkt als Datei öffnen geht auch, aber Nominatim kann Anfragen ohne Referer ablehnen.

**Gerät des Nutzers:** iPhone (Safari), später auch Computer. Es gibt immer Mobilfunk, Offline-Betrieb ist nicht nötig.

## Geplante Schritte (siehe README „Stand“)

1. ✅ Excel-Import, Geocoding, Karte und Liste
2. ✅ Tagesroute: Startpunkt/Standort + Anzahl Stopps, Auswahl aus den **offenen** Adressen, eigene Reihenfolge-Optimierung nach **Auto-Fahrzeit** (Nächster Nachbar + 2-opt; der Nutzer will ausdrücklich keine Luftlinie), Übergabe an Google Maps in Etappen à 10 Adressen (9 Zwischenstopps + Ziel, Grenze der Google-Maps-App)
3. Speicher in Google Drive: Google-Tabelle + Drive-Ordner für Fotos über ein Apps-Script-Web-App, geschützt mit Zugangscode. `localStorage` ist bis dahin nur ein Provisorium.
4. Vor Ort: Fotos **in der App aufnehmen** und dabei `navigator.geolocation` speichern (iOS entfernt EXIF-GPS beim Hochladen aus der Galerie oft), Notizen, Status „bearbeitet“
5. Karteikarte: Karte mit Foto-Punkten, Klick zeigt Foto, Notizen darunter
6. GitHub Pages (Repo öffentlich, enthält keine Daten), Test am iPhone

Später: Zugriff für weitere Personen.

## Architektur (alles in `index.html` im `<script>`)

- **Einstellungen oben:** `SPEICHER_KEY`, `GEOCODER_PAUSE_MS` (Nominatim erlaubt max. 1 Anfrage/s), `START_ANSICHT`, `SPALTEN` (Pflichtspalten Strasse_hausnummer/PLZ/Ort) und `SPALTEN_OPTIONAL` (Unternehmen/Objektname). Spaltennamen ohne Beachtung von Groß-/Kleinschreibung.
- **Zustand:** `objekte` = Array von `{ id, unternehmen, objektname, strasse, plz, ort, lat, lon, geoStatus: 'ok'|'fehlt'|'offen', status: 'offen'|'bearbeitet' }`, gespeichert über `speichern()`/`laden()`.
- **Import:** `zeilenAusExcel()` liest das erste Blatt und füllt PLZ wieder auf 5 Stellen auf. `importieren()` übernimmt bekannte Adressen (Schlüssel `schluessel()`, nur die Adresse) samt Koordinaten und Status, Unternehmen/Objektname kommen immer neu aus der Excel.
- **Geocoding:** `geocode()` nutzt Nominatim strukturiert (`street`, `postalcode`, `city`, `countrycodes=de`). `koordinatenSuchen()` arbeitet alle `geoStatus: 'offen'` nacheinander ab. Netzwerkfehler lassen den Status auf `offen`, beim nächsten Laden wird erneut gesucht. `suchLauf` ist ein Zähler: „Liste leeren“ erhöht ihn, dann bricht ein laufender Suchlauf ab.
- **Anzeige:** `karteZeichnen()` (Leaflet-`circleMarker`, blau = offen, grün = bearbeitet), `listeZeichnen()` (nicht gefundene zuerst, rot). Überschrift über `titel()` (Objektname, sonst Straße), darunter `unterzeilen()`. Nutzertexte immer mit `esc()` einsetzen.
- **Liste leeren:** Knopf `#leeren`, nur sichtbar, wenn Adressen da sind, mit `confirm()`-Abfrage. Löscht auch die Route.
- **Tagesroute:** Zustand `route = { start: { text, ziel, lat, lon }, ids, rund, km, minuten, basis: 'strasse'|'luftlinie' }` unter `ROUTE_KEY`. `routeBerechnen()` holt mit `fahrMatrix()` eine Fahrzeit-/Streckentabelle vom öffentlichen OSRM-Demo-Server (`OSRM_URL`, Table-Service, max. `OSRM_MAX_PUNKTE`, eine Anfrage pro Berechnung) und optimiert mit `optimieren(start, punkte, rund, dist)` über **alle** offenen Adressen; davon die ersten n (bei Rundtour danach die n noch einmal als Rundtour optimiert). `dist` = Mittelwert aus Hin- und Rück-Fahrzeit (2-opt braucht symmetrische Werte), Summen für km/Minuten in Fahrtrichtung. Fällt OSRM aus, wird mit `km()` (Luftlinie, Haversine) gerechnet und gewarnt. `start.ziel` ist der Text für Google Maps (Adresse oder `lat,lon` bei „Mein Standort“). `standortPos` wird beim Tippen ins Startfeld verworfen.
- **Etappen:** `routeZeichnen()` teilt in Blöcke à `ETAPPE_STOPPS` (10), `mapsLink()` baut `google.com/maps/dir/?api=1` **ohne `origin`** (= aktueller Standort). Bearbeitete Stopps fallen aus dem Link heraus. Im Safari ohne Google-Maps-App erlaubt Google nur 3 Zwischenstopps.
- **Karte mit Route:** Routenstopps als nummerierte `L.divIcon` (`.nr`), Start als „S“, gestrichelte Linie. Nicht eingeplante Adressen werden blass gezeigt.
- **Test der Optimierung:** In der Konsole für 8 Zufallspunkte alle Permutationen durchrechnen und mit `streckeKm(start, optimieren(...), rund)` vergleichen (Stand: Ø +0,6 %, schlechtester Fall ca. +6 %). OSRM-Ausfall testen, indem `window.fetch` für `project-osrm` kurz einen Fehler liefert.
- **Beim Testen:** Im Browser-Bereich liegen echte Adressen des Nutzers im `localStorage`. Testdaten nur im Arbeitsspeicher (`objekte = …`) setzen, die gespeicherte Route vorher sichern und danach wiederherstellen.

## Hinweise

- UI-Texte und Kommentare auf Deutsch.
- Echte Adresslisten (`*.xlsx`, `*.csv`) nie committen, sie sind per `.gitignore` ausgeschlossen.
- Test im Browser: In der Konsole mit `XLSX.utils.aoa_to_sheet` eine Mappe bauen und `importieren(XLSX.write(wb, {type:'array', bookType:'xlsx'}))` aufrufen.
