# Expedition Creativity — Tweetalige ontwikkeling

Werkbranch: `development/nl-design-cms`. De vernieuwde NL/EN-website is live. Oude HTML-pagina’s, hun stylesheet en zoekcode zijn verwijderd; hun URL’s blijven via 301-doorverwijzingen werken. Niet samenvoegen of publiceren zonder expliciete toestemming van Mikaël Stroobants.

## Lokaal bekijken

Node.js 22 of hoger is voldoende. Er zijn geen npm-pakketten nodig voor de build.

```sh
npm run build
npm test
npm run dev
```

Open `http://localhost:3000/nl/`. De build schrijft naar `dist/`.

## Architectuur

| Bron | Functie |
| --- | --- |
| `src/templates/base.html` | Metadata, navigatie, footer en cookievoorkeuren |
| `src/templates/track.html` | Vaste tracktemplate uit het goedgekeurde Blue Boy Planet-ontwerp |
| `src/assets/design-system.css` | Oorspronkelijke ontwerpregels, met neutrale antraciete oppervlakken |
| `src/assets/components.css` | Gedeelde componenten voor overzichten en overige pagina's |
| `content/tracks/*.json` | Titel, video, afbeelding, metadata en inhoud per compositie |
| `content/pages/*.json` | Nederlandse algemene pagina's |
| `scripts/build.mjs` | Statische generatie, validatie, zoekgegevens en sitemap |
| `admin/` | Decap CMS-configuratie voor de ontwikkelbranch |

De goedgekeurde Blue Boy Planet-inleiding, sectieteksten, subkoppen, nadruk en galerij zijn overgenomen uit `Blue_Boy_Planet_Design_Preview_NL.html`. `tests/approved-blue-boy-planet.json` bewaart de referentie en de SHA-256 van die ontwerpbron. De build stopt als deze goedgekeurde inhoud afwijkt. Alleen na expliciete redactionele goedkeuring mogen zowel de content als deze referentie worden aangepast. Blue Boy Planet is niet zichtbaar in de bewerkbare CMS-collectie.

Het originele RGB-logo is ongewijzigd overgenomen uit `Logo - Expedition Creativity (Original RGB)(1).png` als `src/assets/logo-original.png`. De drie goedgekeurde afbeeldingen zijn zonder hercompressie uit de preview gehaald. Voor de overige tracks blijven de bestaande afbeelding en video-ID behouden.

## CMS-status

De collectie heeft invoervelden voor metadata, afbeelding, inleiding, secties, gerelateerde composities en conceptstatus. De invoer genereert automatisch een trackpagina, overzichtskaart, zoekgegevens en sitemapvermelding. Een integratietest controleert dit met een nieuwe fictieve compositie in een tijdelijke kopie; concepten blijven verborgen.

`admin/config.yml` gebruikt GitHub en `editorial_workflow`, uitsluitend gericht op `development/nl-design-cms`. Publiceren binnen het CMS betekent samenvoegen naar die ontwikkelbranch, niet naar `main`.

**CMS-controle 4 november:** de echte GitHub-aanmelding, conceptopslag en terugleescontrole zijn geslaagd. Het opgeslagen concept is ook door de generator getest in een tijdelijke projectkopie: verborgen als concept, correct gerenderd bij lokale testweergave. De testcompositie blijft ongepubliceerd in de editorial workflow. Zie `docs/TESTRESULTATEN.md`.

Decap CMS is vastgezet op versie 3.17.3 met een gecontroleerde SHA-384-integriteitswaarde. Het wordt alleen op de beheerpagina van de officiële package-CDN geladen. De websitebuild heeft geen CDN- of npm-afhankelijkheid. De lokale proxy is niet actief op de online beheerpagina. Het CMS heeft afzonderlijke Nederlandse en Engelse collecties. Technische trackgegevens worden voor beide talen uit de Nederlandse bron gelezen. Zie `docs/CMS-HANDLEIDING.md`.

## Talen en bestaande URL's

| Onderdeel | Nederlands nu | Engels (goedgekeurd 3 november 2026) |
| --- | --- | --- |
| Start | `/nl/` | `/en/` |
| Overzicht | `/nl/composities/` | `/en/tracks/` |
| Track | `/nl/composities/{slug}/` | `/en/tracks/{slug}/` |
| Tijdlijn | `/nl/tijdlijn/` | `/en/timeline/` |
| Verhaal | `/nl/mijn-verhaal/` | `/en/about/` |
| Achter de muziek | `/nl/achter-de-muziek/` | `/en/behind-the-score/` |
| Contact | `/nl/contact/` | `/en/contact/` |

Er worden 34 pagina’s onder `/nl/` en `/en/` gegenereerd, met taalwissels en wederzijdse hreflang-verwijzingen naar bestaande pagina’s. De Engelse compositieteksten zijn eerder gemigreerd naar `content/en/`. De bronverwijzingen verwijzen naar de oorspronkelijke HTML-bestanden, die herstelbaar zijn via de Git-geschiedenis (commit `0dd6134ac3022fb0a3f50fa45171368319631e76`). Die bestanden zijn geen runtime-afhankelijkheid. Beide talen gebruiken dezelfde templates en stijlen. Engels is de standaardtaal; de 51 bestaande 301-regels sturen oude URL’s door naar de passende nieuwe pagina’s. Deze regels staan los van de aanwezigheid van oude bestanden.

Voor negen andere composities bevat de nieuwe Nederlandse template voorlopig alleen titel, video en bekende gegevens. Er zijn geen Nederlandse verhalende teksten verzonnen of Engelse compositieteksten herschreven. De goedgekeurde Nederlandse uitwerking van deze composities ontbreekt nog.

## Publicatie en metingen

Standaardbouw is een ontwikkelbuild: `noindex, nofollow`, `robots.txt` blokkeert indexering, en analytics is uitgeschakeld op de gegenereerde pagina's. Oude HTML, scripts, stijlen en versie-readmes worden niet meer naar de publicatiemap gekopieerd. De gegenereerde Netlify-headers blokkeren indexering van de gehele preview.

De productiecode voor de gegenereerde pagina's gebruikt het bestaande GA4-ID `G-G9HM3R866P` en laadt pas na toestemming. In de browser kan toestemming ook worden ingetrokken. YouTube laadt pas na afzonderlijke toestemming én een expliciete afspeelklik via `youtube-nocookie.com`; er is een rechtstreekse videolink als alternatief.

Een geïndexeerde productiebuild vereist zowel `SITE_MODE=production` als de Netlify-context `CONTEXT=production`. Deze configuratie is actief voor productie. Netlify publiceert uitsluitend na expliciete goedkeuring; de productie is vergrendeld op de laatst goedgekeurde deploy.

## Onderhoud

De publieke gegenereerde pagina's zijn statisch en hebben geen PHP of databaseserver nodig. De templates en buildcode hebben geen externe runtimepakketten. Werk Node.js en de vastgezette CMS-versie bij na controle van de betreffende release-informatie, voer de tests uit en test de CMS-login opnieuw. Beoordeel wijzigingen eerst via een ontwikkelbranch en review; laat publicatie op `main` onder expliciete goedkeuring vallen.

Zie `docs/TESTRESULTATEN.md` en `CHANGELOG.md` voor de uitgevoerde controles en openstaande onderdelen.
