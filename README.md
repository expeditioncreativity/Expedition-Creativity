# Expedition Creativity — Tweetalige ontwikkeling

Werkbranch: `development/nl-design-cms`. Bestaande productiebestanden en routes zijn behouden. Niet samenvoegen of publiceren zonder expliciete toestemming van Mikaël Stroobants.

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

**Nog niet operationeel geverifieerd:** de afzonderlijke CMS-login via Netlify/GitHub OAuth. De GitHub-koppeling van ChatGPT verleent het CMS geen eigen login. Het Netlify-project toont in deze browsersessie een inlogscherm; aanmelding is nog nodig. Er zijn geen OAuth-clients, secrets, Netlify-instellingen of rechten aangemaakt of gewijzigd. De CMS-login en een echte opslaan/teruglezen-cyclus moeten op een goedgekeurde testomgeving worden voltooid voordat dit als gebruiksklaar CMS wordt opgeleverd.

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

Er worden 34 pagina’s onder `/nl/` en `/en/` gegenereerd, met taalwissels en wederzijdse hreflang-verwijzingen naar bestaande pagina’s. De Engelse compositieteksten komen ongewijzigd uit de oorspronkelijke HTML-bestanden; `content/en/` bevat de bronverwijzingen. Beide talen gebruiken dezelfde templates en stijlen. De oorspronkelijke routes blijven behouden; redirects en de uiteindelijke standaardtaal worden pas bij goedgekeurde publicatie ingesteld.

Voor negen andere composities bevat de nieuwe Nederlandse template voorlopig alleen titel, video en bekende gegevens. Er zijn geen Nederlandse verhalende teksten verzonnen of Engelse compositieteksten herschreven. De goedgekeurde Nederlandse uitwerking van deze composities ontbreekt nog.

## Publicatie en metingen

Standaardbouw is een ontwikkelbuild: `noindex, nofollow`, `robots.txt` blokkeert indexering, en analytics is uitgeschakeld op de gegenereerde pagina's. De oorspronkelijke pagina's zijn bewust ongewijzigd gekopieerd en bevatten hun oorspronkelijke scripts; hun analyticsgedrag is niet herbouwd. De gegenereerde Netlify-headers blokkeren indexering van de gehele preview.

De productiecode voor de gegenereerde pagina's gebruikt het bestaande GA4-ID `G-G9HM3R866P` en laadt pas na toestemming. In de browser kan toestemming ook worden ingetrokken. YouTube laadt pas na een expliciete afspeelklik via `youtube-nocookie.com`; er is een rechtstreekse videolink als alternatief.

Een geïndexeerde productiebuild vereist zowel `SITE_MODE=production` als de Netlify-context `CONTEXT=production`. Deze configuratie is niet geactiveerd. Doe dat pas als onderdeel van een expliciet goedgekeurde publicatie, na controle van CMS-login, redactie, redirects, canonicals, analytics en de definitieve homepagekeuze. De Netlify-productiebranch en domeinkoppelingen zijn niet gecontroleerd via het Netlify-account en zijn niet gewijzigd.

## Onderhoud

De publieke gegenereerde pagina's zijn statisch en hebben geen PHP of databaseserver nodig. De templates en buildcode hebben geen externe runtimepakketten. Werk Node.js en de vastgezette CMS-versie bij na controle van de betreffende release-informatie, voer de tests uit en test de CMS-login opnieuw. Beoordeel wijzigingen eerst via een ontwikkelbranch en review; laat publicatie op `main` onder expliciete goedkeuring vallen.

Zie `docs/TESTRESULTATEN.md` en `CHANGELOG.md` voor de uitgevoerde controles en openstaande onderdelen.
