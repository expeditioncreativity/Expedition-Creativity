# QA — Blue Boy Planet NL, ontwikkelversie

Test: 3 november 2026. Nulmeting van een lokaal, op de bron ontworpen prototype.

## Geslaagd

- `python scripts/build_site.py` genereert `/nl/track-blue-boy-planet/index.html` uit **één JSON-contentrecord**.
- HTML `lang=nl-BE`, SEO-title, meta-description, canonical, OG-tags en schema.org `MusicComposition` gegenereerd.
- Geen fictieve videopublicatiedatum verzonnen: `VideoObject` wordt pas toegevoegd als exacte metadata beschikbaar is.
- Reviewpagina heeft `noindex,nofollow` zolang publicatie niet is goedgekeurd.
- Interne ankers, echte galerijbestanden en lokale CSS-link bestaan.
- Een **tweede testcompositie** wordt zonder handmatig kopiëren van HTML gebouwd; optionele secties verdwijnen correct.
- Nederlandstalige Home en Tracks zijn gegenereerd uit centrale gegevens, met tien echte trackrecords.
- Tracks: zoeken, jaarfilter en sortering getest in Chromium op desktop en mobiel.
- Beide gerelateerde composities krijgen echte YouTube-thumbnail-URL's.
- Geen horizontale overflow op 1440px en 390px. Weergave en galerie-lightbox werken.
- Mobiel menu werkt; getest in headless Chromium.
- Geen JavaScript-fouten tijdens lokale interfaceproeven.

## Nog niet geverifieerd / open

- YouTube-player op een echte HTTPS-Netlify-preview: de fout 153 kan niet volledig vanuit de lokale renderomgeving worden vastgesteld. De pagina heeft een werkende fallback-link naar YouTube.
- Externe thumbnailafbeeldingen: lokale browser blokkeert netwerkverzoeken; de geldige `i.ytimg.com`-adressen zijn ingevuld maar online laadgedrag nog niet vastgesteld.
- Pages CMS-accountlogin en GitHub-autorisatie: eigenaar dient toegang te verbinden.
- Vijf bijkomende Nederlandse reviewpagina’s (Over, Tijdlijn, Achter de muziek, Contact, Cookiebeleid) zijn **technisch opgesteld en lokaal getest**. Inhoudelijke goedkeuring en live-integratie blijven open.
- **De Engelse versies worden pas na de expliciete go van de eigenaar gemaakt.**
- Google Search Console / live indexering na publicatie: nog niet van toepassing.
- Inpassing in Netlify-build / behoud van de bestaande site moet vóór livegang worden bevestigd.

## Aanvullende QA - Nederlandstalige sitepreview

- Home / Tracks: Chromium desktop (1440px) en mobiel (390px), mobiel menu, 10 kaarten, zoekfunctie en jaarfilters: geslaagd.
- Over, Tijdlijn, Achter de muziek, Contact en Cookiebeleid: statische SEO/taal-/navigatietests en mobiele/desktop screenshot-proeven: geslaagd.
- Hergebruik tracktemplate via tweede testcompositie met andere slug, video en optionele blokken: geslaagd.
- CMS ".pages.yml" als geldige YAML uitgelezen (8 contentsecties). **Pages CMS-authenticatie en daadwerkelijk opslaan zijn nog niet getest.**
- Automatische GitHub Actions workflow op de ontwikkelbranch: bij de vorige versie geslaagd. Na elke push opnieuw valideren.
- Juridische/privacy-tekst en cookietoestemming bij publicatie opnieuw controleren; de NL cookiepagina is concept.

## Ontwerpbeslissingen

- Actuele layout is gebaseerd op de bestaande **goedgekeurde Blue Boy Planet-preview**, niet opnieuw ontworpen.
- Correct originele logo; antraciet en goud `#DDB313`, lichte tekstachtergronden.
- Introductie, muziekverhaal, muzikale reis, orkestratie, instrumentatie, partituurinfo en galerie zijn gescheiden CMS-velden.
- Nederlandse inhoud blijft identiek in betekenis; toegevoegde subkoppen en vet zijn redactionele opmaak van de goedgekeurde preview.