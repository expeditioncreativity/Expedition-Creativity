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
