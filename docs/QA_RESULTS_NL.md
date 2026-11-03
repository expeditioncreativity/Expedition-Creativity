# QA — Blue Boy Planet NL, ontwikkelversie

Test: 3 november 2026. Nulmeting van een lokaal, op de bron ontworpen prototype.

## Geslaagd

- `python scripts/build_site.py` genereert `/nl/track-blue-boy-planet/index.html` uit **één JSON-contentrecord**.
- HTML `lang=nl-BE`, SEO-title, meta-description, canonical, OG-tags en schema.org `MusicComposition` gegenereerd.
- Geen fictieve videopublicatiedatum verzonnen: `VideoObject` wordt pas toegevoegd als exacte metadata beschikbaar is.
- Reviewpagina heeft `noindex,nofollow` zolang publicatie niet is goedgekeurd.
- Interne ankers, echte galerijbestanden en lokale CSS-link bestaan.
- Beide gerelateerde composities krijgen echte YouTube-thumbnail-URL's.
- Geen horizontale overflow op 1440px en 390px. Weergave en galerie-lightbox werken.
- Mobiel menu werkt; getest in headless Chromium.
- Geen JavaScript-fouten tijdens lokale interfaceproeven.

## Nog niet geverifieerd / open

- YouTube-player op een echte HTTPS-Netlify-preview: de fout 153 kan niet volledig vanuit de lokale renderomgeving worden vastgesteld. De pagina heeft een werkende fallback-link naar YouTube.
- Externe thumbnailafbeeldingen: lokale browser blokkeert netwerkverzoeken; de geldige `i.ytimg.com`-adressen zijn ingevuld maar online laadgedrag nog niet vastgesteld.
- Pages CMS-accountlogin en GitHub-autorisatie: eigenaar dient toegang te verbinden.
- Volledige sitebrede NL-redesign en de opbouw van EN-versies: nog niet afgerond.
- Google Search Console / live indexering na publicatie: nog niet van toepassing.
- Inpassing in Netlify-build / behoud van de bestaande site moet vóór livegang worden bevestigd.

## Ontwerpbeslissingen

- Actuele layout is gebaseerd op de bestaande **goedgekeurde Blue Boy Planet-preview**, niet opnieuw ontworpen.
- Correct originele logo; antraciet en goud `#DDB313`, lichte tekstachtergronden.
- Introductie, muziekverhaal, muzikale reis, orkestratie, instrumentatie, partituurinfo en galerie zijn gescheiden CMS-velden.
- Nederlandse inhoud blijft identiek in betekenis; toegevoegde subkoppen en vet zijn redactionele opmaak van de goedgekeurde preview.