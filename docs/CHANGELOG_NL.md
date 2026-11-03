# Changelog — Nederlandstalige websitevernieuwing

## 2026-11-03 — Ontwikkeling op branch `work/nl-redesign-cms`

### Nieuw
- Bestaande statische website geanalyseerd; eigen ontwikkelbranch en draft pull request.
- Herbruikbare Nederlandstalige tracktemplate, met als basis het goedgekeurde Blue Boy Planet-ontwerp.
- Inhoudsrecords in JSON voor Pages CMS; subkoppen en vetgedrukte inhoud via rich-text Markdown.
- Origineel Expedition Creativity-logo en goedgekeurde goud-/antracietkleuren.
- Door de gebruiker aangeleverde artwork en Ableton-screenshots uit de Blue Boy Planet-preview.
- Statische paginagenerator voor een volledige NL-ontwerpmap, voorlopig acht pagina’s:
  - Startpagina; Tracks; Blue Boy Planet; Mijn verhaal; Tijdlijn; Achter de muziek; Contact; Cookiebeleid.
- Trackoverzicht met tien oorspronkelijke video-ID's, thumbnails, zoekveld, jaarfilter en sortering.
- CMS-velden voor algemene websitepagina's en de trackcatalogus.
- SEO-metadata, canonical, Open Graph, `MusicComposition` en `noindex` op alle reviewpagina's.
- GitHub Actions-workflow voor automatische statische bouwcontrole en downloadbaar previewartifact.

### Getest
- Lokale statische bouw en dynamisch aanmaken van een tweede, fictieve testtrack.
- Desktop (1440 px), mobiel (390 px), geen horizontale overflow, menu, beeldvergroting en trackfilters.
- Geldige YAML-configuratie, metadata, lokale paden en Nederlandstalige navigatie.

### Nog open (voor publicatie)
- Finale visuele/inhoudelijke goedkeuring door de eigenaar.
- Pages CMS GitHub OAuth en echte wijziging via het CMS testen; automatische commit-trigger in de praktijk nagaan.
- HTTPS-video-embeds: YouTube fout 153 pas na echte webtest beoordelen.
- Online laden van alle YouTube-thumbnails bevestigen.
- Alle resterende composities inhoudelijk migreren zodra de NL-template en bijbehorende content zijn goedgekeurd.
- Analytics, cookiebeheer, toegankelijkheid en uitgewerkte SEO-structuur inclusief EN/hreflang pas na inhoudsgoedkeuring.
- Geen merge naar `main` of productie-deploy zonder expliciete toestemming.