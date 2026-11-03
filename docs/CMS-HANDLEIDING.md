# Composities beheren

De editor is beschikbaar onder `/admin/` in de ontwikkelpreview. De aanmelding via GitHub moet eerst eenmalig aan Netlify worden gekoppeld; zie de status in README.md.

## Nieuwe compositie

1. Open **Composities — Nederlands** en kies een nieuwe compositie.
2. Vul titel, URL-naam (bijvoorbeeld `nieuwe-expeditie`), jaar, maand, wereld, genre, YouTube-ID en afbeelding in. Upload bij voorkeur een afbeelding zonder ingebakken zwarte balken, in 16:9.
3. Voeg de inleiding en inhoudssecties toe. Elke sectie krijgt een unieke ankernaam. Vet, cursief en subkoppen worden ondersteund.
4. Sla op als concept. Kies **Zichtbaar in ontwikkeling** wanneer de inhoud in de preview mag verschijnen. De editorial workflow bewaart wijzigingen ter beoordeling.
5. Publiceren in de editor schrijft uitsluitend naar `development/nl-design-cms`. De gekoppelde Netlify-preview wordt daarna opnieuw opgebouwd. De livewebsite blijft afhankelijk van een afzonderlijk goedgekeurde merge/publicatie.

## Engelse versie

Open **Composities — English** en gebruik exact dezelfde URL-naam als de Nederlandse compositie. Vul de Engelse titel, wereld, genre, beschrijving, inleiding en secties in. Video, afbeelding, jaar, maand en duur worden automatisch uit de Nederlandse versie overgenomen. Beide taalversies kunnen dus nooit per ongeluk verschillende video's afspelen.

Een Engelse versie verschijnt alleen als de Nederlandse compositie zichtbaar is en ook de Engelse status op **Zichtbaar in ontwikkeling** staat. Zonder Engelse versie verschijnt geen taalwissel naar een ontbrekende trackpagina.

## Controle

Controleer na opslaan de trackpagina, de compositiekaart, zoeken/filteren, de tijdlijn en de taalwissel. Nederlandse Blue Boy Planet-teksten zijn beschermd en worden niet in de Nederlandse editor aangeboden. Wijzig die alleen na expliciete redactionele goedkeuring.

## Aanmelding afronden

De backend gebruikt Netlify OAuth voor GitHub, met de vaste site-ID `expeditioncreativity.netlify.app`; dit voorkomt dat een wisselende deploy-preview-host als apart OAuth-project wordt behandeld. De officiële configuratie staat beschreven op https://decapcms.org/docs/github-backend/ en https://decapcms.org/docs/backends-overview/.

Nog nodig: aanmelden bij het Netlify-project, de bestaande OAuth-provider controleren of configureren, en vervolgens een echte CMS-concept-opslag en terugleescontrole uitvoeren. Eventuele OAuth-clientgeheimen horen uitsluitend in de beveiligde providerinstellingen, nooit in Git of chat. Een nieuwe OAuth-toestemming of credential-aanmaak moet door de eigenaar worden goedgekeurd/uitgevoerd.
