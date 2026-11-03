# Testresultaten — 3 november 2026

## Geautomatiseerd

`npm test`: **12 geslaagd, 0 mislukt**. De teststart voert ook de volledige statische build uit.

| Controle | Resultaat |
| --- | --- |
| 17 Nederlandse pagina's, correcte documenttaal, één h1 en geen oningevulde templateslots | Geslaagd |
| Interne links, lokale assets, galerijafbeeldingen en ankers | Geslaagd |
| Goedgekeurde Blue Boy Planet-inleiding, secties, subkoppen en nadruk | Ongewijzigd |
| Alle oorspronkelijke getrackte websitebestanden versus de uitgangscommit | Byte voor byte gelijk |
| Unieke canonicals, beschrijvingen, sociale metadata en parsebare JSON-LD | Geslaagd |
| Preview-noindex, robots, headers, geen direct geladen GA-script of video-iframe op NL-pagina's | Geslaagd |
| Compositiegebonden video-ID en titel, chronologie inclusief maand | Geslaagd |
| Afwijzen van ongeldige slugs, videogegevens, tijdsduren, relaties en dubbele sectie-ankers | Geslaagd |
| Ondersteunde CMS-tekstopmaak en escaping | Geslaagd |
| CMS richt op ontwikkelbranch, sluit goedgekeurde inhoud uit en gebruikt een vastgezette scriptversie | Geslaagd |
| Geen nieuwe Engelse routes of fictieve taalalternatieven | Geslaagd |
| Nieuwe compositie uit CMS-formaat verschijnt in pagina, overzicht, zoekindex en sitemap; concept blijft verborgen | Geslaagd in tijdelijke projectkopie |

## Browser

| Handeling | Waargenomen resultaat |
| --- | --- |
| Zoeken op `planet` | Alleen Blue Boy Planet, telling 1 |
| Zoekterm `planet` combineren met jaar 2024 | Nul resultaten met duidelijke melding |
| Filters wissen en wereld Oceaan selecteren | Alleen Turtle Travel |
| Eerste Ableton-afbeelding vergroten en sluiten | Correcte afbeelding, bijschrift en sluitknop |
| Blue Boy Planet afspelen aanklikken | YouTube-speler laadt juiste titel, kanaal en duur 4:41; geen embedfout zichtbaar |
| Track en overzicht in frames van 360, 768 en 1280 px | Geen horizontale overflow; gemeten clientWidth en scrollWidth respectievelijk 345/345, 753/753 en 1265/1265 px op beide pagina's |
| Mobiel menu op 360 px openen | `aria-expanded=true`; menu reageert |
| Desktopweergave | Goedgekeurde tweekolomshero, goud/antraciet en leesbare contentsecties zichtbaar |

Responsieve controles zijn uitgevoerd in browserframes met de genoemde breedtes, niet op fysieke mobiele toestellen. Browserbeelden zijn alleen intern gebruikt voor QA.

## Niet geverifieerd of nog open

- CMS OAuth-login en online opslaan/teruglezen: Netlify-accountconfiguratie ontbreekt.
- Nederlandse verhaalteksten voor de negen andere composities zijn niet aangeleverd of goedgekeurd.
- Engelse content en definitieve tweetalige migratie wachten op expliciete goedkeuring.
- GA4-ontvangst in de productieproperty is niet getest; ontwikkeling stuurt geen Nederlandse preview-events.
- Werkelijke videoweergave met audio tot het einde is niet getest; laden van de juiste speler wel.
- Externe afbeeldingen worden deels van YouTube geladen; beschikbaarheid en snelheid zijn afhankelijk van YouTube.
- Geen Lighthouse-audit, schermlezercontrole, volledige crossbrowsercontrole of test op fysieke mobiele toestellen uitgevoerd.
- Netlify-productiebranch, actuele accountinstellingen, OAuth en deploypreviewconfiguratie zijn niet via Netlify bevestigd.
- Er is niets samengevoegd naar `main` en er is geen productiepublicatie uitgevoerd.
