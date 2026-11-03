# Expedition Creativity — ontwikkelrichtlijnen

> Status: ontwerp-/ontwikkelplan. Nog geen productiewijzigingen. Beheer: GitHub Issue #1.
> Branch: `work/nl-redesign-cms`.

## Doel

De statische muziekwebsite moderniseren met één herbruikbare tracktemplate, een eenvoudige redactionele CMS-workflow en een samenhangend designsysteem. De bestaande website blijft tijdens ontwikkeling op `main` staan.

## Niet-onderhandelbare eisen

1. **Eerst Nederlands**. Engels uitsluitend na expliciete goedkeuring van de finale NL-trackpagina.
2. *Blue Boy Planet* is de goedgekeurde visuele referentie. Layout, editorial secties, subkoppen en subtiele bolding behouden.
3. Gebruik het **juiste originele Expedition Creativity-logo** (door eigenaar aangeleverd); goud `#DDB313`, diep antraciet en lichte, neutrale contentvlakken. Geen blauwe basiskleur.
4. Gebruik de definitieve Nederlandse inhoud uit `Blue Boy Planet.pdf` (door eigenaar verstrekt); passages gemarkeerd `[niet meenemen]` nooit publiceren.
5. **Geen wijzigingen aan livewebsite** en geen merge naar `main` zonder expliciete goedkeuring.
6. Houd bestaande SEO-URL's intact of voeg gecontroleerde redirects toe; voorkom inhoudsdubbels.
7. Gebruik geen onbevestigde feiten, muziekinstrumenten of auteursinformatie in de inhoud.

## Huidige repository — vaststellingen (3 november 2026)

- Statische HTML-pagina's in repositoryroot: `index.html`, `tracks.html`, `about.html`, `timeline.html`, `track-*.html`, `cookie-policy.html`.
- Gedeelde stijl in `style.css`, zoekfunctie in `search.js`.
- Tien individuele `track-*.html`-pagina's.
- `sitemap.xml` en `robots.txt` bestaan.
- Video-ID van *Blue Boy Planet* in huidige pagina: `CbFn2igUChI`.
- Een foutieve meta-omschrijving op `track-an-elephants-day-in-life.html` verwijst naar Antarctica; corrigeren bij revisie.
- In de repository staat nog geen CMS-configuratie of generator voor dynamisch bouwen van trackpagina's.
- Het aangeleverde NL-designprototype bestaat als los HTML-ontwerp buiten de live-repository; niet zonder QA als productiecode inzetten.

## Voorgestelde architectuur

- Eén gedeelde set responsieve componenten en CSS-design tokens.
- Eén datamodel per track (velden NL plus toekomstige optionele EN-velden).
- **Static site generation**: gestructureerde tracks automatisch bouwen tot toegankelijke statische pagina's; behoud van de huidige publieke URL's.
- **CMS via GitHub**: vergelijk Pages CMS en Decap CMS; kies op basis van daadwerkelijke login-/autorisatieflow en GitHub-koppeling. Geen nieuwe afhankelijkheid van verouderde Netlify Identity/Git Gateway.
- Sitebrede content is los van presentatie; navigatie, footer en SEO-componenten blijven centraal beheerd.
- Optionele velden renderen geen lege secties. Rich text laat opmaak zoals subkoppen en vetgedrukte passages toe.

## Datamodel track

### Verplicht
- `slug`, `status` (draft/published), `title`, `locale`, `year`, `duration`, `genre`
- `intro`, `story`, `journey`, `orchestration`, `instrumentation`
- `youtube_id`, `hero_image`, `seo_title`, `seo_description`

### Optioneel
- `composer`, `release_date`, `world`, `type`, `tags`
- `score_available`, `score_details`, `performance_details`, `contact_cta`
- `gallery` (met alt-teksten), `behind_the_score`, `related_tracks`
- `og_image`, `video_thumbnail`, `video_chapters`, `language_alternate`

### Videoweergave
- YouTube-player met poster en klik-om-te-laden waar nodig; voorspelbare fallback 'Open op YouTube'.
- Verifieer playerfout 153 in productieomgeving. Ga niet uit van automatische oplossing bij deployment.

## Beoordelingscriteria

- Visueel identiek aan goedgekeurde *Blue Boy Planet*-richting, op mobiel en desktop.
- Wijziging van één contentrecord via CMS bouwt één correcte trackpagina.
- Alle bestaande links, zoekfilters en media werken.
- SEO-title/description, canonicals, Open Graph, JSON-LD waar relevant, sitemap en robots zijn correct.
- Later: per taal aparte URL en `hreflang`-koppeling (EN pas na toestemming).
- Geen regressie in cookietoestemming, analytics of YouTube-statistieken.
- Iedere fase heeft screenshots/testresultaten en een kort changelog.

## Uitvoeringsvolgorde

1. Bestaande site auditen en CMS-selectie technisch onderbouwen.
2. Design tokens, gedeelde layout en originele logo vastleggen.
3. NL *Blue Boy Planet* als eerste track laten genereren uit gestructureerde content.
4. CMS-invoer, media, previews en build pipeline testen.
5. Andere tracks migreren en daarna Home, Tracks, About, Timeline, Behind the Score en Contact moderniseren.
6. SEO-/toegankelijkheids-/responsive-/security-testen.
7. Draft pull request voor eindcontrole. **Niet mergen zonder goedkeuring.**

## Regie en rollen

- Coördinatie: bewaakt samenhang en afhankelijkheden.
- Design & UX: ontwerp, typografie, kleuren, mobiel.
- Development: templates, build en navigatie.
- CMS: invoerinterface, contentmodel en media.
- SEO & QA: metadata, indexering, testen en regressiecontroles.

Dit zijn werkstromen; een statisch document creëert geen autonome agents en start geen achtergrondwerk.
