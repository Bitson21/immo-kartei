# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

„Immo-Kartei“: Web-App für das Besichtigen von ca. 50 Immobilien über 3 Tage. Adressen kommen aus einer Excel-Datei, vor Ort werden Fotos mit GPS-Standort und Notizen erfasst, danach gibt es pro Immobilie eine „Karteikarte“ mit Karte und Foto-Punkten. Die ganze App steckt in einer einzigen Datei, `index.html` (HTML, CSS und JS inline). Kein Build, keine Tests, kein Linter. Bibliotheken kommen per CDN (cdnjs): Leaflet 1.9.4 (Karte), SheetJS 0.18.5 (Excel).

**Ausführen:** über den Testserver `immo-kartei` aus `../.claude/launch.json` (Python-Webserver auf Port 8765). Direkt als Datei öffnen geht auch, aber Nominatim kann Anfragen ohne Referer ablehnen.

**Gerät des Nutzers:** iPhone (Safari), später auch Computer. Es gibt immer Mobilfunk, Offline-Betrieb ist nicht nötig.

## Geplante Schritte (siehe README „Stand“)

1. ✅ Excel-Import, Geocoding, Karte und Liste
2. Tagesroute: Startpunkt/Standort + Anzahl Stopps, Auswahl aus den **offenen** Adressen, eigene Reihenfolge-Optimierung (Nächster Nachbar + 2-opt), Übergabe an Google Maps in Etappen à max. 9 Zwischenstopps (Google-Maps-URL-Grenze)
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
- **Liste leeren:** Knopf `#leeren`, nur sichtbar, wenn Adressen da sind, mit `confirm()`-Abfrage.

## Hinweise

- UI-Texte und Kommentare auf Deutsch.
- Echte Adresslisten (`*.xlsx`, `*.csv`) nie committen, sie sind per `.gitignore` ausgeschlossen.
- Test im Browser: In der Konsole mit `XLSX.utils.aoa_to_sheet` eine Mappe bauen und `importieren(XLSX.write(wb, {type:'array', bookType:'xlsx'}))` aufrufen.
