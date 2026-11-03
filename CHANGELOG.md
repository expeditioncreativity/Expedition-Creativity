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
