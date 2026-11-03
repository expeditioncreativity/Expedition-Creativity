# Expedition Creativity — NL websitevernieuwing (ontwerpbranch)

Dit is **geen live-publicatie**. De bestaande website op `main` blijft onaangeroerd.

## Wat werkt al?

- Herbruikbare Nederlandstalige tracktemplate in `studio/templates/track_nl.html`.
- Design in `studio/assets/track.css`: **goud + antraciet**, lichte leesblokken, mobile-first.
- Officieel logo en de drie afbeeldingen uit de door de eigenaar aangeleverde Blue Boy Planet-PDF.
- Oorspronkelijke Nederlandse Blue Boy Planet-content als CMS-record in `content/tracks/nl/blue-boy-planet.json` (de pagina blijft in draft en krijgt `noindex`).
- `Pages CMS`-invulvelden via `.pages.yml`: verhaal, muzikale reis, orkestratie, instrumentatie, partituren, afbeeldingen, YouTube-video, gerelateerde tracks en SEO.
- Lokale previewbuilder en technische/visuele basistests.
- **Nederlandstalige Home en Tracks-overzichtspagina**, inclusief tien tracks, zoeken, filteren en sorteren.
- GitHub Actions bouwcontrole op de ontwikkelbranch. Geen automatische publicatie.

## Preview genereren

```bash
python -m pip install -r requirements.txt
python scripts/build_site.py --output preview
```

Open met een lokale webserver de paden `preview/nl/`, `preview/nl/tracks/` en `preview/nl/track-blue-boy-planet/`. De builder zet bewust geen wijzigingen door naar `main` of de livewebsite.

## CMS gebruiken

1. Ga naar https://app.pagescms.org/ en meld je aan met GitHub.
2. Autoriseer de Pages CMS GitHub App voor `expeditioncreativity/Expedition-Creativity`.
3. Kies de **ontwikkelbranch** `work/nl-redesign-cms`. Controleer dat je niet op `main` werkt.
4. Open **Composities (Nederlands)**. Bewerk de Nederlandstalige tekst met de rich-text-opmaakeditor.
5. Opslaan veroorzaakt een GitHub-commit in de gekozen branch. Een site-build is nodig om wijzigingen zichtbaar te maken.

De CMS-login en het opslaan vanuit de webinterface kunnen pas worden getest nadat de eigenaar de Pages CMS-app heeft geautoriseerd. Het bestaan van `.pages.yml` betekent dus **niet** dat de persoonlijke CMS-login al geactiveerd is.

## Werkwijze & publicatie

1. De Nederlandstalige Blue Boy Planet-designpreview goedkeuren.
2. CMS-invoer aan de gekozen branch koppelen en end-to-end beproeven.
3. Overige websiteonderdelen en trackpagina's gefaseerd migreren zonder hun URL's te breken.
4. SEO, analytics, cookietoestemming, video-embeds en responsive regressiecontrole.
5. Alleen na expliciete toestemming een gecontroleerde productiedeploy/merge uitvoeren.
6. Pas na expliciet akkoord Engelstalige contentvertalingen starten.

**Ref:** [GitHub Issue #1](https://github.com/expeditioncreativity/Expedition-Creativity/issues/1).