# Uitvoeringsvolgorde na mijlpaal 1

1. **CMS-eindtest:** Pages CMS verbinden, één veld veranderen op ontwikkelbranch, preview opnieuw bouwen, wijziging terugzetten. Nooit live mergen.
2. **Statische build-integratie:** bestaande root-HTML en assets naar staging-distributie kopiëren; bestaande URL's behouden; Netlify-preview branch koppelen.
3. **Layout-componenten:** navigatie, footer, metadata, kaarten en video geschikt maken voor Home, Tracks, About, Journey/Timeline, Behind the Score, Contact.
4. **Website-inhoud:** NL-teksten voor algemene pagina's redigeren; compositorische teksten nooit zonder akkoord herschrijven.
5. **Tweetaligheid:** het datamodel heeft een `locale`; EN-publicatie en `hreflang` pas na expliciete toestemming.
6. **SEO en privacy:** sitemap, schema voor video alleen met echte uploadDate, canonical, cookie-consent, GA4, Search Console; restore meta-omschrijving van Elephant.
7. **Release:** screenshots en tests per pagina, goedkeuring, gecontroleerde merge en productievalidatie.


## Voortgang huidige sessie

- De technische reviewstructuur is uitgerold naar acht Nederlandstalige previewpagina’s. Alle previewpagina’s zijn nog niet gepubliceerd.
- GitHub Actions controleert automatisch de statische generatie en metadata op de ontwikkelbranch.
- **Eerste menselijke review**: Blue Boy Planet en de algemene sitevormgeving beoordelen aan de hand van HTML-preview en screenshots.
- Daarna: CMS autoriseren (Pages CMS via GitHub) en een testwijziging uitsluitend op de ontwikkelbranch opslaan; automatische preview-build controleren.
- Pas daarna: andere trackteksten valideren, externe video-embeds op een HTTPS-preview testen, analytics/cookietoestemming en SEO-hreflang implementeren na taalakkoord.