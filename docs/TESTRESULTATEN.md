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

## 4 november 2026 — online acceptatietest afgerond

- Na aanmelding met GitHub: echte CMS-collecties zichtbaar; een nieuwe compositie met vaste velden opgeslagen. De editor bevestigt **Item opgeslagen** en **Status: Concept**.
- Volledig herladen en opnieuw gelezen: titel, URL-naam, jaar, maand, duur, verhaal, reis en SEO-titel behouden.
- GitHub bevestigt commit `b59862d` op de door Decap beheerde editorial-workflowbranch `cms/tracks/cms-controletest-—-niet-publiceren`, gebaseerd op de ontwikkelversie. Dit is de normale conceptworkflow; geen samenvoeging naar development of main uitgevoerd.
- Het werkelijk opgeslagen JSON-bestand uit GitHub in een tijdelijke projectkopie gebouwd: conceptpagina en zoekresultaat ontbreken zoals bedoeld. Alleen in die tijdelijke kopie status op zichtbaar gezet: verhaal, reis en automatische gegevens renderen correct; lege partituren worden verborgen.
- Het herkenbare testitem **CMS controletest — niet publiceren** blijft als ongepubliceerd concept in de workflow staan. Geen testcontent toegevoegd aan de gepubliceerde website.
- Hiermee is de eerder vermelde blokkade van de online opslag-/terugleestest opgeheven. De eerdere 16 geautomatiseerde controles blijven geslaagd.

## Publicatievoorbereiding — Engels als standaard

`npm test`: 18 geslaagd. Nieuwe controles: unieke 301-regels, bestaande doelen zonder redirectketens, alle oude track-HTML-routes, 34 canonieke sitemap-URLs en Engelse x-default. Productiebuild in tijdelijke kopie getest met zowel deploy-preview als production-context: alleen production is indexeerbaar. GA4-ontvangst op het live domein blijft een controle na expliciet goedgekeurde publicatie.

## Volledige Blue Boy Planet en uniforme tracks

`npm test`: 22 geslaagd. Volledige Engelse referentie heeft per onderdeel evenveel paragrafen, H3's, strong/em en afbeeldingen als de goedgekeurde NL-versie. Nederlandse bron/lock ongewijzigd; oorspronkelijke Engelse verhalen van negen andere tracks gecontroleerd. Oude BBP-samenvatting gearchiveerd. Lege editor-HTML, incomplete vertaling, gewijzigde bronhash, sectienummering en navigatie expliciet getest. Een onvolledige Engelse BBP verdwijnt zonder buildfout of dode links; NL blijft beschikbaar.

### Browser- en CMS-controle van deze update

- Netlify-preview van commit d3cffd3 succesvol; rootredirect landt op `/en/`. Via Lees meer de volledige Engelse referentie geopend. Alle secties en subkoppen aanwezig.
- Desktop: hero, logo, video-ID, sectienavigatie en galerie gecontroleerd. Drie galeriebeelden laden op 1450px; vergrootvenster opent met vertaald onderschrift.
- Mobiel: EN/NL naast elkaar in 390px-frames (375px bruikbare viewport door browser-scrollbar), beide documentbreedtes gelijk aan de viewport, zes inhoudssecties, dezelfde video. Geen horizontale overflow.
- Echte CMS-test op bijgewerkte configuratie: nieuw concept `cms-templatecontrole-20261104`, GitHub-commit 7ad105e. H3, vet en cursief exact opgeslagen. Het echte JSON-bestand in tijdelijke projectkopie gebouwd: verborgen als concept, correct gerenderd na uitsluitend lokale testactivatie.
- Bestaande Engelse Chills of Antarctica als workflowconcept bewerkt: alleen SEO-titel aangepast en neutrale partiturenoptie gekozen, commit e01fa92. Na herladen en GitHub-vergelijking bleven alle oorspronkelijke inhoudsvelden exact behouden. Deze workflowwijziging is niet samengevoegd.
- Editorcontrole ontdekte zichtbare HTML-code in oude rich-textvelden. De Engelse velden zijn daarom naar echte Markdown gemigreerd, inclusief volledige BBP-vertaling; behoud van gerenderde paragrafen en opmaak is getest. Nederlandse BBP-bron blijft onaangeroerd. Lege partiturenbeschikbaarheid is ook bij oudere items optioneel, zodat een SEO-bewerking niet om fictieve informatie vraagt.

De testconcepten en de SEO-testwijziging blijven ongepubliceerd in de CMS-workflow. Ze horen niet bij een productie-release en mogen niet automatisch worden samengevoegd. Er zijn geen productie-instellingen via het Netlify-account gewijzigd.
