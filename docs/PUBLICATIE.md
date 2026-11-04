# Eerste livepublicatie — ter goedkeuring

## Voorbereide overgang

- Eigenaar koos Engels als standaard: `/` verwijst naar `/en/`.
- Nederlands blijft onder `/nl/`, met taalwissels naar bestaande vertalingen.
- Bestaande pagina's (met en zonder `.html`) krijgen een directe 301 naar de bijbehorende Engelse pagina. Oude homepagefragmenten `#contact`, `#behind` en `#journey` worden door de nieuwe homepage naar de juiste pagina geleid; oude trackfragmenten `#watch` gaan naar de speler.
- Sitemap bevat alleen de 34 canonieke NL/EN-pagina's; x-default verwijst naar Engels.
- Netlify production-context activeert de bestaande productiecode. Preview blijft noindex en analytics-vrij, zelfs als SITE_MODE op production staat.
- GA4 `G-G9HM3R866P` wordt uitsluitend op expeditioncreativity.com na toestemming geladen. Realtime ontvangst kan pas na livepublicatie worden geverifieerd.
- CMS blijft naar development/nl-design-cms schrijven. CMS-publicatie publiceert dus niet rechtstreeks naar de livewebsite.

## Nog te beoordelen

Negen Nederlandse tracks bevatten nog geen uitgebreid verhaal. De Engelse verhalen zijn overgenomen uit de bestaande website. Het testconcept blijft ongepubliceerd.

## Uitvoering na expliciet akkoord

1. Controleer PR #3, de laatste preview en de actuele Netlify-productielock. Bewaar de URL/ID van de huidige gepubliceerde deploy als herstelpunt.
2. Merge uitsluitend de beoordeelde PR naar main. Houd de productielock aan totdat de juiste productiebuild klaarstaat.
3. Controleer de productiebuild en publiceer de bedoelde deploy handmatig.
4. Controleer root/legacy-301s, NL/EN, CMS, logo/media, video, zoeken, sitemap/robots/canonicals, cookievoorkeuren en GA4 na toestemming op het echte domein.
5. Bij regressie: publiceer de vastgelegde eerdere deploy opnieuw en houd automatische publicatie geblokkeerd. Herstel zo nodig code via een afzonderlijke revert-PR.

Deze voorbereiding wijzigt geen Netlify-accountinstellingen en publiceert niets live. De originele bronbestanden blijven behouden in Git. Permanente redirects kunnen in browsers worden gecachet; daarom vóór vrijgave hun doelen controleren.
