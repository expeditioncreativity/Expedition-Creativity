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

## Eerste feedbackronde

- De 12 geautomatiseerde controles zijn opnieuw uitgevoerd en slagen.
- Carrouselbediening verplaatst het overzicht horizontaal (gemeten scrollLeft 399 px, totale inhoudsbreedte 3851 px versus 1140 px viewport).
- De permanent zichtbare cookieknop opent de dialoog; Alleen noodzakelijk sluit die correct.
- Tijdlijn, Contact, Mijn verhaal, Composities en Startpagina bij 360 px framebreedte: documentbreedte en scrollbreedte beide 345 px, dus geen horizontale pagina-overflow.
- Miniatuurkaders zijn in de browser op 16:9 gecontroleerd: 362 × 203,625 px. De juiste bronafbeelding wordt daarin met cover weergegeven.
- Externe YouTube-miniaturen waren tijdens deze ronde niet beschikbaar in de testomgeving (naturalWidth 0); de exacte visuele uitsnede van die externe beelden kon daarom niet opnieuw worden beoordeeld. De lokale Blue Boy Planet-afbeelding en het originele logo laden wel.
- Contactkaarten, nadruk, ruimere uitlijning en tijdlijniconen zijn visueel gecontroleerd. De goedgekeurde Blue Boy Planet-inhoud bleef ongewijzigd.

## Tweede feedbackronde en Engelse versie — 3 november 2026

- `npm test`: 13 tests, allemaal geslaagd. 34 gegenereerde pagina’s; interne links, assets, fragmenten, documenttaal, metadata en JSON-LD gecontroleerd.
- Bestaande Nederlandse BBP-tekst en oorspronkelijke bestanden blijven beschermd. Engelse trackverhalen worden per alinea met de oorspronkelijke HTML vergeleken.
- Wederzijdse hreflang gecontroleerd; een CMS-track zonder Engelse vertaling krijgt geen dode taalwissel. Integratietest maakt een nieuwe tweetalige compositie, erft technische metadata en houdt concepten verborgen.
- Browser: taalwissel EN→NL werkt, Engelse zoekopdracht `planet` geeft `1 composition`. Homepage, catalogus en tijdlijn op 360px: documentbreedte en scrollbreedte beide 345px, dus geen horizontale pagina-overflow.
- Visuele homepagecontrole: gouden play-iconen en nieuwe verhaalpassage aanwezig; carrouselbediening heeft extra ondermarge. Tijdlijn begint met Blue Boy Planet, gevolgd door Chills of Antarctica en Turtle Travel.
- CMS-login en echte online opslaan-/terugleescyclus nog niet voltooid: Netlify toont een aanmeldscherm. Geen credentials of productie-instellingen gewijzigd.

## 4 november 2026 — acceptatie vaste CMS-velden

Deze aanvulling vervangt eerdere CMS-statusmeldingen waar die afwijken.

- `npm test`: 16 tests geslaagd; 34 NL/EN-pagina's en 15 bestaande routes behouden.
- Alle twintig JSON-tracks vergeleken met commit `4192984`: bestaande tekst, sectietitels/ankers/volgorde, media, metadata en SEO zonder verlies. Nederlandse Blue Boy Planet blijft op het oorspronkelijke beschermde model.
- Nieuwe vaste velden in een tijdelijke projectkopie opgeslagen en teruggelezen door de generator. NL/EN-pagina, automatische gegevens, galerieonderschrift, instrumentatie, sectievolgorde, zoekindex en sitemap gecontroleerd. Concepten blijven verborgen; lege partiturenvelden leveren geen sectie of beschikbaarheidsclaim op.
- Decap 3.17.3 daadwerkelijk in de browser geopend met dezelfde collecties/velden, maar een geïsoleerde **test-repo**-backend (geen GitHub-toegang). De vaste velden staan standaard klaar en de partiturenopties zijn uitgeklapt. Testcompositie `cms-controletest` opgeslagen en via het collectieoverzicht opnieuw geopend: titel, jaar, verhaal en conceptstatus behouden. Dit is nadrukkelijk geen online GitHub-opslagtest.
- Mobiele editor gecontroleerd in een 390 × 844 iframe. Oorspronkelijke 800px-minimumbreedte gecorrigeerd met admin/editor.css; documentbreedte en viewport beide 390px. Velden en opslagknop zichtbaar zonder horizontaal scrollen. Desktopformulier eveneens gecontroleerd.
- Online Netlify OAuth verwijst naar het normale GitHub-inlogscherm met de bestaande app. Voor deze browsersessie ontbreken nog de login en vervolgens de echte editorial-workflow-opslag-/terugleescontrole. Dit acceptatiepunt blijft open; geen succes geclaimd op basis van de testbackend.
- Alleen ontwikkelbranch/PR #3. Geen merge naar main of productiepublicatie uitgevoerd. Handmatige goedkeuring blijft nodig voor livepublicatie en eventuele wijziging van beschermde compositieteksten.
