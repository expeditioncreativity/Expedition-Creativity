# Composities beheren

Open `https://expeditioncreativity.com/admin/` en meld aan met GitHub. Het CMS gebruikt `main`: opslaan bewaart een workflowconcept, Publiceren voegt de goedgekeurde inhoud samen naar main. Netlify bouwt en publiceert daarna automatisch. De GitHub-koppeling van ChatGPT en de browsersessie van de editor zijn afzonderlijke aanmeldingen.

## Nieuwe compositie

1. Kies **Composities — Nederlands → Item van type Compositie maken**. Vul de basisgegevens in: titel, URL-naam, jaar, maand, duur, wereld, genre, YouTube-ID en cover. Gebruik een cover zonder zwarte balken, bij voorkeur 16:9.
2. De vaste velden **Het verhaal achter de muziek**, **Een muzikale reis**, **Orkestratie** en **Instrumentatie** staan al klaar. Gebruik de knoppen voor vet/cursief en kies H3 in het menu Hoofdtekst. In Markdown kan dat met `**vet**`, `*cursief*` en `### Subkop`.
3. **Compositiegegevens** worden automatisch uit de basisgegevens opgebouwd. Je hoeft geen sectiekoppen, ankers of technische gegevens opnieuw in te voeren.
4. Kies bij **Partituren & uitvoering** alleen een bevestigde beschikbaarheid. Standaard is niets vermeld en staat de contactknop uit. Vul eventueel toelichting in.
5. Vul **Achter de partituur** in en voeg desgewenst meerdere afbeeldingen toe. Iedere afbeelding vraagt een beschrijvende alt-tekst; een onderschrift is optioneel. De website biedt een vergrootweergave.
6. Kies bestaande composities bij **Ontdek meer muziek**. Ook de beschermde Blue Boy Planet kan als verwijzing worden gekozen. Vul eventueel SEO-titel, metabeschrijving en een aparte deelafbeelding in; zonder deelafbeelding wordt de cover gebruikt.
7. Laat **Status: Concept** staan bij een proef of onvolledige compositie. Sla op via de editorial workflow. Concepten verschijnen niet op de website, in zoekresultaten of in de sitemap.
8. Zet de contentstatus op **Zichtbaar na publiceren** en gebruik **Publiceren** wanneer de inhoud live mag. Na een geslaagde Netlify-build verschijnt de wijziging op de website; dit duurt doorgaans enkele minuten. Alleen opslaan publiceert niets. Bij een mislukte build blijft de vorige liveversie staan.

Lege optionele onderdelen en hun navigatielinks worden niet getoond. De vaste volgorde en nummering worden automatisch opgebouwd. Bestaande gemigreerde sectietitels en ankers blijven bewaard.

## Engelse versie

Maak eerst de Nederlandse compositie. Kies **Composities — English** en gebruik exact dezelfde URL-naam. Dezelfde vaste tekstvelden staan klaar. Jaar, maand, duur, video en cover komen automatisch uit de Nederlandse bron; voer die niet opnieuw in. Titel, wereld, genre, verhaal en SEO zijn taalgebonden.

Een Engelse pagina verschijnt pas wanneer beide taalversies zichtbaar zijn. Zonder vertaling verschijnt geen taalwissel naar een ontbrekende pagina. Bestaande Engelse teksten zijn overgenomen van de oorspronkelijke website.

## Controle en bescherming

Controleer de previewpagina, mobiele weergave, sectielinks, galerij, compositiekaart, zoeken/filteren, tijdlijn en taalwissel. Nederlandse Blue Boy Planet-teksten zijn beschermd, uitgesloten van de bewerkbare collectie en bewaakt door een buildcontrole. De bestaande teksten zijn niet herschreven.

De mobiele editor gebruikt een kleine CSS-aanpassing voor de vastgezette Decap-versie 3.17.3. Controleer die opnieuw bij een CMS-upgrade.

## Aanmeldstatus en publicatie

Op 4 november 2026 zijn de echte GitHub-aanmelding, conceptopslag en het teruglezen na herladen geslaagd. Het testitem **CMS controletest — niet publiceren** blijft ongepubliceerd in de workflow. De werkelijk opgeslagen JSON is ook getest op conceptuitsluiting en correcte paginarendering in een tijdelijke projectkopie.

OAuth-geheimen horen uitsluitend in beveiligde providerinstellingen, nooit in Git of chat. De eigenaar heeft op 5 november 2026 directe CMS-publicatie goedgekeurd. Zijn klik op Publiceren is de toestemming voor die inhoud. Technische wijzigingen blijven op `development/nl-design-cms` en worden alleen na afzonderlijke goedkeuring naar main samengevoegd. Synchroniseer main vóór nieuw technisch werk om CMS-inhoud te behouden. Netlify auto-publishing moet ingeschakeld blijven.

## Volledige vertaling en broncontrole

Kies bij de Engelse compositie **Vertaalcontrole → Volledige vertaling van Nederlandse bron** pas wanneer alle beschikbare Nederlandse onderdelen zijn vertaald. Alleen de contentstatus op zichtbaar zetten volstaat niet bij een onvolledige vertaling. Gevulde NL-onderdelen die in EN ontbreken blokkeren de Engelse trackpagina en taalwissel; de opgeslagen Engelse inhoud blijft behouden.

Tracks met oorspronkelijke Engelse tekst maar zonder Nederlandse verhaalbron behouden de status **Bestaande Engelse brontekst**. Voeg eerst de ontbrekende Nederlandse bron toe en controleer daarna de vertaling. Zie TRACKCONTROLE.md voor de actuele inhoud per compositie. Er vindt geen automatische overschrijving van vertalingen plaats.

De eerdere korte Engelse Blue Boy Planet-tekst is gearchiveerd. De nieuwe volledige vertaling gebruikt de vaste invoervelden. De bronhash van deze beschermde referentie wordt bij een goedgekeurde bronwijziging technisch bijgewerkt na inhoudelijke controle van de vertaling.

Bestaande Engelse teksten staan nu in gewone bewerkbare Markdown. In rich-textmodus zie je tekst en opmaak in plaats van HTML-tags. De Nederlandse goedgekeurde BBP-pagina blijft beschermd. De testconcepten `cms-controletest` en `cms-templatecontrole-20261104`, plus de ongepubliceerde SEO-test van Chills of Antarctica, zijn controle-items en hoeven niet te worden gepubliceerd.

## Uitgebreide tekstopmaak

Gebruik Nederlands als brontaal. Houd dezelfde URL-naam aan in de Engelse collectie. Technische gegevens worden eenmaal beheerd. Beide taalteksten kunnen onafhankelijk worden aangepast.

De verhalende velden ondersteunen vet, cursief, twee niveaus tussenkoppen, lijsten (ook genest), genummerde lijsten, citaten, links en inline code. Titels, URL-namen, alt-teksten, onderschriften en SEO-velden blijven bewust gewone tekst: HTML in metadata wordt niet weergegeven als opmaak.

Het editorpaneel toont een inhoudsvoorbeeld. De deploypreviewlink wijst naar de betreffende track. Nieuwe composities met status concept blijven verborgen op de gegenereerde website; het inhoudsvoorbeeld werkt wel zonder opslaan. Een volledige preview van nieuwe concepten en automatisch vertalen vereisen nog verdere implementatie.

Automatisch vertalen is nog niet aangesloten. Hiervoor is een door de eigenaar gekozen vertaaldienst met een serversleutel nodig. Gewenste vervolgroute: per veld vertalen, opmaak behouden, resultaat als voorstel bekijken, bestaande vertaling uitsluitend bewust vervangen, als concept opslaan, volledige pagina bekijken en pas daarna publicatie bevestigen. De API-sleutel hoort in Netlify-omgevingsvariabelen, nooit in Git of de browser.


## Editoratelier en vernieuwen

De editor toont nu een antraciet-gouden kop, hulp bij de werkbalk en woord- en tekentellers per rich-textveld. Naast H3/H4 zijn H5/H6 en doorhalen beschikbaar. Gebruik H3 voor gewone tussenkoppen; extra niveaus alleen voor geneste inhoud.

Sluit oude editor-tabbladen na een technische update en open `/admin/` opnieuw. Een reeds geopende oude editor blijft anders zijn oude configuratie gebruiken. Nieuwe versies worden zonder browsercache geladen; vanaf deze versie verschijnt bij een volgende editorupdate een waarschuwing. Er wordt nooit automatisch herladen: sla eerst op als concept, zodat je geen werk verliest.

De melding na Publiceren bevestigt dat de build is aangevraagd, niet dat die al klaar is. Controleer de livepagina na enkele minuten. Nederlands en Engels blijven onafhankelijke velden zonder automatische vertaling.
