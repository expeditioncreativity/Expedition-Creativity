# Changelog

## 2026-11-03 — Nederlandse ontwikkelversie

- Repository geanalyseerd vanaf `0dd6134ac3022fb0a3f50fa45171368319631e76`: losse statische HTML-pagina's, gedeelde CSS en zoekscript; geen bestaande CMS- of buildconfiguratie.
- Ontwikkelbranch `development/nl-design-cms` aangemaakt; `main` en de livewebsite niet gewijzigd.
- Goedgekeurd Blue Boy Planet-ontwerp omgezet naar een herbruikbare tracktemplate met goud, donker antraciet en het originele RGB-logo.
- Goedgekeurde Nederlandse compositietekst, subkoppen, nadruk en afbeeldingen beschermd tegen onbedoelde wijzigingen.
- 17 Nederlandse pagina's gegenereerd: start, overzicht, tijdlijn, verhaal, achtergrond, contact, cookies en tien trackpagina's.
- Contentbestanden gescheiden van templates; negen tracks hebben voorlopig alleen bekende metadata en video, zonder nieuwe verhaalteksten.
- Decap CMS voorbereid met concepten en review op de ontwikkelbranch. OAuth-login en echte online opslaan-cyclus nog niet getest.
- Zoekfunctie, gecombineerde filters, deelbare filter-URL's, sortering en nulresultaatmelding toegevoegd.
- Gerelateerde composities krijgen echte miniaturen; de afbeeldingengalerij opent een vergroting.
- YouTube-video's laden op aanvraag; juiste compositietitel en videokoppeling vervangen foutgevoelige kopieën in de nieuwe template.
- Unieke metadata, canonicals, sociale metadata, MusicComposition/MusicRecording en breadcrumbs toegevoegd.
- Nederlandse URL-structuur geïmplementeerd; Engelse routes en hreflang wachten op goedkeuring. Bestaande routes blijven behouden.
- Preview-indexering en Nederlandse preview-analytics uitgeschakeld; productie-analytics blijft achter toestemming en expliciete productieconfiguratie.
- Twaalf geautomatiseerde controles geslaagd; browsercontroles uitgevoerd voor zoeken, filters, YouTube-speler, galerij en responsieve layouts.

## 2026-11-03 — Eerste feedbackronde

- Tijdlijn aangevuld met kleine, klikbare miniaturen en de bestaande compositie-icoontjes.
- Algemene inhoudssecties uitgelijnd op dezelfde breedte als de kop; selectieve nadruk toegevoegd in Mijn verhaal en Achter de muziek, zonder de tekstinhoud te herschrijven.
- Contact hersteld als drie kaarten voor YouTube, LinkedIn en e-mail, met Nederlandse tekst en merkgebonden knoppen.
- Blijvend zichtbare cookievoorkeurenknop toegevoegd, naast de footerknop en de link naar Cookiebeleid.
- Startpagina uitgebreid met een horizontale carrousel voor alle tien tracks, zichtbare scrollbar, bediening en automatische voortgang om de vijf seconden. Pauzeert bij hover, focus en verborgen browservenster; respecteert verminderde beweging.
- Kaartminiaturen in vaste 16:9-kaders geplaatst met cover-uitsnede om de in 4:3-miniaturen ingebakken zwarte balken buiten beeld te houden.
- Logoherstel via de bestaande lokale logoasset en cacheversies voor stylesheets, script en logo.
- Twaalf bestaande tests geslaagd; extra browsercontroles voor cookievenster, carrouselbediening en mobiele overflow uitgevoerd.

## 3 november 2026 — homepage, Engels en tweetalig CMS

- Meer ruimte onder carrouselbediening; zichtbare gouden play-iconen op de homepagevisual en alle carrouselminiaturen.
- Dubbele homepage-inleiding vervangen door de eerste verhaalpassage met Lees meer; bestaande kaart behouden.
- Tijdlijn van nieuw naar oud, inclusief maandvolgorde.
- 17 Engelse pagina’s toegevoegd met bestaande Engelse trackverhalen, dezelfde templates, taalwissels en wederzijdse hreflang.
- Twee foutieve oude korte teksten (Dreamcatcher-inleiding en Elephant-SEO-beschrijving) vervangen door bestaande zinnen uit hun eigen trackverhaal. De verhaalteksten zelf zijn ongewijzigd.
- CMS uitgebreid met Nederlandse/Engelse collecties en gedeelde technische metadata; gebruikshandleiding toegevoegd. OAuth naar vaste Netlify-site ingesteld; echte login en online opslaan nog geblokkeerd door ontbrekende aanmelding.
- Geen productiepublicatie, merge of wijziging aan oorspronkelijke websitebestanden.

## 4 november 2026 — vaste CMS-tracktemplate

- Generieke sectielijst vervangen door vaste NL/EN-verhaalvelden, reis, orkestratie, instrumentatie, partituren/uitvoering, galerij, relaties en SEO.
- Automatische compositiegegevens en sectienavigatie; lege optionele onderdelen verborgen; beschikbaarheid en contactknop zonder onbevestigde standaardclaims.
- Bestaande inhoud verliesvrij gemigreerd; goedgekeurde Nederlandse Blue Boy Planet ongewijzigd en vergrendeld.
- Meerdere galerijafbeeldingen met alt-tekst, onderschriften en vergrootweergave; optionele OG-afbeelding.
- Mobiele beheerinterface aangepast aan smalle schermen; handleiding uitgebreid.
- Zestien geautomatiseerde controles geslaagd. Online CMS-opslag blijft een afzonderlijke acceptatiestap totdat deze browsersessie is aangemeld.

- Online acceptatietest afgerond: GitHub-login, echte conceptopslag, teruglezen na herladen en rendering van daadwerkelijk opgeslagen JSON gecontroleerd. Het testitem blijft ongepubliceerd.

## 4 november 2026 — Engelse standaard en publicatievoorbereiding

- Engels als gekozen standaard, directe legacy-301s, behoud van oude homepage-/videofragmenten.
- Sitemap beperkt tot nieuwe canonieke routes; Engelse x-default toegevoegd.
- Productiecontext voorbereid; preview blijft uitgesloten van indexering en analytics.
- Publicatie- en herstelprocedure toegevoegd; 18 tests geslaagd. Geen livepublicatie.

## 4 november 2026 — volledige Engelse referentie en uniforme tracksecties

- Blue Boy Planet volledig vanuit de goedgekeurde Nederlandse bron vertaald: verhaal, reis, orkestratie, instrumentatie, partituren, media, CTA's en SEO. Nederlandse inhoud ongewijzigd; eerdere Engelse tekst gearchiveerd.
- Uniforme sectietitels en vaste volgorde; lege rich-textvelden verdwijnen; beschikbare secties en navigatie doorlopend genummerd.
- Volledige EN/NL-pariteit gecontroleerd op paragrafen, H3's, nadruk en afbeeldingen. De andere negen Engelse verhalen behouden.
- CMS-vertaalcontrole voorkomt dat gedeeltelijke/onbeoordeelde vertalingen als volledig worden aangeboden. Geen automatische tekstoverschrijving.
- Overzicht van alle composities en resterende redactionele aanvullingen toegevoegd; 22 tests slagen.
- Engelse bronvelden verliesvrij naar bewerkbare Markdown omgezet nadat de editorcontrole zichtbare HTML-code aantoonde. Echte nieuwe conceptopslag met H3/vet/cursief en bestaande-compositiebewerking gecontroleerd via GitHub.
