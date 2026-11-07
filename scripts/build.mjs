import {buildCms} from './cms-workflow.mjs';
import {richText} from '../src/assets/rich-text.js';
import {linkIcons} from './icons.mjs';
import { trackSections, validateEditorial, missingTranslationSections } from './track-content.mjs';
import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { translateUI, englishPath } from './languages.mjs';
import { createHash } from 'node:crypto';

export const root = resolve(import.meta.dirname, '..');
export const out = join(root,'dist');
export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHtml;
// Fetch covers through our host: visitors never contact YouTube for thumbnails.
export const firstPartyImage=url=>/^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/(?:hqdefault|maxresdefault)\.jpg$/.test(url)?'/.netlify/images?url='+encodeURIComponent(url):url;
export const fill = (template, values) => template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=> {if (!(key in values)) throw Error('Missing slot '+key);return String(values[key]);});
const read=path=>readFile(join(root,path),'utf8');
const json=async path=>JSON.parse(await read(path));
const origin='https://expeditioncreativity.com';
const production=process.env.SITE_MODE==='production' && process.env.CONTEXT==='production';
const mode=production?'production':'preview';
export const markdown=richText;

const abs=url=>new URL(url,origin).href;
const sourceFiles=(await readdir(join(root,'content/tracks'))).filter(x=>x.endsWith('.json'));
export const allTracks=await Promise.all(sourceFiles.map(x=>json('content/tracks/'+x)));
export const tracks=allTracks.filter(t=>t.status==='published').sort((a,b)=>(b.year*12+(b.release_month||0))-(a.year*12+(a.release_month||0))||a.title.localeCompare(b.title,'nl'));
export function validate(t) {
  validateEditorial(t);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug))throw Error('Invalid slug: '+t.slug);
  if(!t.title || !Number.isInteger(t.year) || t.year<1900 || t.year>2200)throw Error('Invalid track metadata');
  if(!/^[\w-]{11}$/.test(t.video_id))throw Error('Invalid YouTube video: '+t.slug);
  if(!t.image || (!t.image.startsWith('/') && !/^https:\/\//.test(t.image)))throw Error('Invalid image URL');
  if(!['draft','published'].includes(t.status))throw Error('Invalid status');
  if(t.release_month != null && (!Number.isInteger(t.release_month)||t.release_month<1||t.release_month>12))throw Error('Invalid release month');
  if(t.duration && !/^\d+:[0-5]\d$/.test(t.duration))throw Error('Invalid duration');
  const ids=t.sections?t.sections.map(s=>s.id):trackSections(t,'nl',{markdown,escapeHtml}).map(s=>s.id);
  if(ids.some(id=>!id || !/^[a-z0-9-]+$/.test(id))||new Set(ids).size!==ids.length||ids.includes('gegevens'))throw Error('Invalid section IDs');
  for(const related of t.related||[])if(!allTracks.some(x=>x.slug===related))throw Error('Unknown related track: '+related);
}
allTracks.forEach(validate);
if(new Set(allTracks.map(t=>t.slug)).size!==allTracks.length)throw Error('Duplicate slug');
const lock=await json('tests/approved-blue-boy-planet.json');
const approved=allTracks.find(t=>t.slug==='blue-boy-planet');
if(approved.intro!==lock.intro || JSON.stringify(approved.sections)!==JSON.stringify(lock.sections))throw Error('Approved Blue Boy Planet text changed; explicit editorial approval required.');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// Only reusable public media are copied. Pages, scripts and styles come from src/content.
for(const entry of await readdir(root,{withFileTypes:true}))if(entry.isFile() && /\.(png|jpe?g|ico|svg|webmanifest)$/i.test(entry.name))await cp(join(root,entry.name),join(out,entry.name));
await cp(join(root,'src/assets'),join(out,'assets'),{recursive:true});
await cp(join(root,'admin'),join(out,'admin'),{recursive:true});
await buildCms(out);
// Preview editors must never save into an obsolete development workflow.
if(!production) await writeFile(join(out,'admin/index.html'),`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Open het live CMS</title><script>location.replace('https://expeditioncreativity.com/admin/'+location.hash)</script></head><body><p>Composities beheren gebeurt in het live CMS. Opgeslagen concepten blijven daar ongepubliceerd totdat je op Publiceren klikt.</p><a href="https://expeditioncreativity.com/admin/">Open het live CMS</a></body></html>`);
const base=await read('src/templates/base.html');const trackTemplate=await read('src/templates/track.html');
const assetVersion=createHash('sha256').update(await read('src/assets/design-system.css')).update(await read('src/assets/components.css')).update(await read('src/assets/site.js')).update(await read('src/assets/privacy.js')).digest('hex').slice(0,12);
const englishTracks=(await Promise.all((await readdir(join(root,'content/en/tracks'))).filter(x=>x.endsWith('.json')).map(x=>json('content/en/tracks/'+x)))).filter(t=>t.status==='published'&&tracks.some(n=>n.slug===t.slug)&&missingTranslationSections(tracks.find(n=>n.slug===t.slug),t).length===0).map(t=>{const nl=tracks.find(n=>n.slug===t.slug);return {...t,year:nl.year,release_month:nl.release_month,video_id:nl.video_id,image:nl.image,duration:nl.duration,gallery:t.gallery?.length?t.gallery:nl.gallery};});
englishTracks.forEach(validate);
if(new Set(englishTracks.map(t=>t.slug)).size!==englishTracks.length)throw Error('Duplicate English slug');
const built=[]; const fullSearch=[];
async function renderLanguage(language,tracks){
const approved=tracks.find(t=>t.slug==='blue-boy-planet');
const route=t=>`/${language}/${language==='nl'?'composities':'tracks'}/${t.slug}/`;
const nav=[['Startpagina','/nl/'],['Composities','/nl/composities/'],['Tijdlijn','/nl/tijdlijn/'],['Mijn verhaal','/nl/mijn-verhaal/'],['Achter de muziek','/nl/achter-de-muziek/'],['Contact','/nl/contact/']];

async function page(path,title,description,body,{image='/hero-blue-boy-planet.png',schema=[],type='website'}={}) {
  const canonical=origin+path;
  const person={'@type':'Person','@id':origin+'/#composer',name:'Mikaël Stroobants',url:origin+'/nl/mijn-verhaal/'};
  const graph={'@context':'https://schema.org','@graph':[person,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/nl/',name:'Expedition Creativity',inLanguage:'nl-BE'},...schema]};
  let result=fill(base,{ALTERNATES:'',LANGUAGE_SWITCH:'',ASSET_VERSION:assetVersion,SEO_TITLE:e(title),DESCRIPTION:e(description),ROBOTS:production?'index, follow':'noindex, nofollow',CANONICAL:e(canonical),OG_TYPE:type,OG_IMAGE:e(abs(image)),SITE_MODE:mode,SCHEMA:JSON.stringify(graph).replace(/</g,'\\u003c'),NAV:nav.map(([label,href])=>`<a href="${href}"${path===href?' class="active" aria-current="page"':''}>${label}</a>`).join(''),BODY:body});
  result=result.replace('</div><!-- language-switch -->',`<form class="global-search" role="search" action="/${language}/search/"><label class="sr-only" for="global-query">${language==='nl'?'Zoeken op de website':'Search the website'}</label><input id="global-query" name="q" type="search" required placeholder="${language==='nl'?'Zoeken…':'Search…'}"><button type="submit">${language==='nl'?'Zoek':'Search'}</button></form></div><!-- language-switch -->`);
  if(language==='en'){result=translateUI(result);path=englishPath(path);}
  const counterpart=language==='en'?path.replace('/en/','/nl/').replace('/tracks/','/composities/').replace('/timeline/','/tijdlijn/').replace('/about/','/mijn-verhaal/').replace('/behind-the-score/','/achter-de-muziek/').replace('/cookie-policy/','/cookies/'):englishPath(path);
  const hasCounterpart=language==='en'||!path.match(/composities\/.+/)||englishTracks.some(t=>path===`/nl/composities/${t.slug}/`);
  if(hasCounterpart){
    const nl=language==='nl'?path:counterpart,en=language==='en'?path:counterpart;
    result=result.replace('</head>',`<link rel="alternate" hreflang="nl" href="${origin}${nl}"><link rel="alternate" hreflang="en" href="${origin}${en}"><link rel="alternate" hreflang="x-default" href="${origin}${en}"></head>`).replace('<!-- language-switch -->',`<a class="language" href="${counterpart}" hreflang="${language==='nl'?'en':'nl'}" lang="${language==='nl'?'en':'nl'}" aria-label="${language==='nl'?'Switch to English':'Naar Nederlands'}">${language==='nl'?'EN':'NL'}</a>`);
  }

  if(!path.endsWith('/search/')) fullSearch.push({url:path,title,language,text:body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()});
  result=linkIcons(result);
  result=result.replaceAll(/https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/(?:hqdefault|maxresdefault)\.jpg/g,firstPartyImage);
  const dest=join(out,path,'index.html');await mkdir(resolve(dest,'..'),{recursive:true});await writeFile(dest,result);built.push({path,title});
}
await page(`/${language}/search/`,language==='nl'?'Zoeken | Expedition Creativity':'Search | Expedition Creativity',language==='nl'?'Doorzoek alle teksten op Expedition Creativity.':'Search all text on Expedition Creativity.',`<main id="inhoud" class="shell section-pad"><h1>${language==='nl'?'Zoeken op de website':'Search the website'}</h1><form role="search"><label for="search-query">${language==='nl'?'Zoekterm':'Search term'}</label><input id="search-query" type="search" name="q" required><button class="btn btn-primary">${language==='nl'?'Zoeken':'Search'}</button></form><p id="search-status" role="status"></p><div id="search-results"></div></main><script src="/assets/global-search.js" defer></script>`);
const card=(t,play=false)=>`<article class="related-card composition-card" data-title="${e(t.title)}" data-year="${t.year}" data-order="${t.year*12+(t.release_month||0)}" data-world="${e(t.world)}" data-type="${e(t.type)}">${play?`<button type="button" class="related-img card-play" data-video="${e(t.video_id)}" data-video-title="${e(t.title)}" aria-label="Speel ${e(t.title)} af via YouTube">`:`<a class="related-img" href="${route(t)}" aria-label="Bekijk ${e(t.title)}">`}<img src="${e(t.image)}" alt="Visual bij ${e(t.title)}" loading="lazy" width="640" height="360">${play?'<span class="preview-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 11 7-11 7V5Z"/></svg></span></button>':'</a>'}<div class="related-body"><small>${t.year} · ${e(t.world)}</small><h3><a href="${route(t)}">${e(t.title)}</a></h3>${t.description?`<p>${e(t.description)}</p>`:''}<a class="track-detail-link" href="${route(t)}">Ontdek de compositie ↗</a></div></article>`;
const heading=(title,lead,eyebrow='Expedition Creativity')=>`<header class="hero page-hero"><div class="shell"><div class="eyebrow">${e(eyebrow)}</div><h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div></header>`;
const section=(title,body)=>`<section class="content-section"><div class="section-header"><h2>${title}</h2></div><div class="prose">${body}</div></section>`;
function localLinks(body) {return body.replaceAll('https://expeditioncreativity.com/contact','/nl/contact/');}
for(const t of tracks){
  const editorial=trackSections(t,language,{markdown,escapeHtml});
  const factsAt=t.sections?Math.min(3,editorial.length):editorial.filter(s=>['story','journey','orchestration'].includes(s.key)).length;
  const sections=editorial.map((s,i)=>`<section id="${e(s.id)}" class="content-section"><div class="section-header"><span class="section-no">${String(i+1+(i>=factsAt?1:0)).padStart(2,'0')}</span><h2>${e(s.title)}</h2></div><div class="prose">${localLinks(markdown(s.body))}</div></section>`);
  const facts=`<section id="gegevens" class="content-section"><div class="section-header"><span class="section-no">${String(factsAt+1).padStart(2,'0')}</span><h2>Compositiegegevens</h2></div><div class="fact-grid"><div class="fact"><small>Componist</small><strong>Mikaël Stroobants</strong></div>${t.duration?`<div class="fact"><small>Duurtijd</small><strong>${e(t.duration)}</strong></div>`:''}<div class="fact"><small>Jaar van uitvoering</small><strong>${t.year}</strong></div><div class="fact"><small>Genre</small><strong>${e(t.type)}${t.slug==='blue-boy-planet'?' · Symfonische muziek':''}</strong></div></div></section>`;
  // The approved reference places facts fourth, before score availability.
  sections.splice(factsAt,0,facts);
  const linkList=editorial.map(s=>({id:s.id,title:s.title}));linkList.splice(factsAt,0,{id:'gegevens',title:'Compositiegegevens'});
  const related=(t.related||[]).filter(slug=>slug!==t.slug).map(slug=>tracks.find(x=>x.slug===slug)).filter(Boolean);
  const body=fill(trackTemplate,{TITLE_HTML:t.slug==='blue-boy-planet'?'Blue Boy<br><em>Planet</em>':e(t.title),TITLE:e(t.title),INTRO:t.intro?`<p class="lead">${markdown(t.intro).replace(/^<p>|<\/p>$/g,'')}</p>`:'',TYPE:e(t.type),IMAGE:e(t.image),VIDEO_ID:e(t.video_id),YEAR:t.year,DURATION:t.duration?`<span class="duration">${e(t.duration)}</span>`:'',PILLS:[t.type,t.slug==='blue-boy-planet'?'Symfonische muziek':t.world,t.year,t.duration].filter(Boolean).map(x=>`<span class="pill">${e(x)}</span>`).join(''),SECTIONS:sections.join(''),SECTION_LINKS:linkList.map((s,i)=>`<a href="#${s.id}"><span class="index">${String(i+1).padStart(2,'0')}</span>${e(s.title)}</a>`).join('')+(related.length?`<a href="#meer-muziek"><span class="index">${t.approved?'07':String(linkList.length+1).padStart(2,'0')}</span>Ontdek meer muziek</a>`:''),SCORE_CTA:((t.slug==='blue-boy-planet'&&t.approved)||t.performance?.availability==='on_request')?'<div class="side-cta"><small>Geïnteresseerd in een uitvoering?</small><h3>Breng deze muziek tot leven.</h3><p>Partituren zijn op aanvraag beschikbaar. Neem gerust contact op om de mogelijkheden te bespreken.</p><a class="btn btn-primary" href="/nl/contact/">Vraag de partituur aan ↗</a></div>':'',RELATED:related.length?`<section class="related-band" id="meer-muziek"><div class="shell"><div class="related-intro"><div><div class="eyebrow">Verder op ontdekking</div><h2>Ontdek meer muziek</h2><p>Meer horen? Beluister zeker ook deze tracks:</p></div><a href="/nl/composities/" class="related-link">Bekijk alle composities ↗</a></div><div class="related-grid">${related.map(t=>card(t)).join('')}</div></div></section>`:''});
  const desc=t.description||(language==='en'?`Listen to ${t.title}, a composition by Mikaël Stroobants from ${t.year}.`: `Beluister ${t.title}, een compositie van Mikaël Stroobants uit ${t.year}. Ontdek de muziek van Expedition Creativity.`);
  const composition={'@type':'MusicComposition','@id':abs(route(t))+'#composition',name:t.title,url:abs(route(t)),composer:{'@id':origin+'/#composer'},inLanguage:'nl-BE',genre:t.type};
  const recording={'@type':'MusicRecording','@id':abs(route(t))+'#recording',name:t.title,recordingOf:{'@id':composition['@id']},byArtist:{'@id':origin+'/#composer'},url:`https://www.youtube.com/watch?v=${t.video_id}`};
  if(t.duration){const [m,s]=t.duration.split(':');recording.duration=`PT${Number(m)}M${Number(s)}S`;}
  await page(route(t),t.seo_title||`${t.title} – ${t.type} | Expedition Creativity`,desc,body,{image:t.og_image||t.image,schema:[composition,recording,{'@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Startpagina',item:origin+'/nl/'},{'@type':'ListItem',position:2,name:'Composities',item:origin+'/nl/composities/'},{'@type':'ListItem',position:3,name:t.title,item:abs(route(t))}]}]});
}
const opts=values=>[...new Set(values)].sort().map(x=>`<option value="${e(x)}">${e(x)}</option>`).join('');
const controls=`<form class="filters" role="search" onsubmit="return false"><div><label for="query">Zoek een compositie</label><input id="query" name="q" type="search" placeholder="Titel, thema of genre…" autocomplete="off"></div><div><label for="year">Jaar</label><select id="year" name="jaar"><option value="">Alle jaren</option>${opts(tracks.map(t=>t.year))}</select></div><div><label for="world">Wereld</label><select id="world" name="wereld"><option value="">Alle werelden</option>${opts(tracks.map(t=>t.world))}</select></div><div><label for="type">Genre</label><select id="type" name="genre"><option value="">Alle genres</option>${opts(tracks.map(t=>t.type))}</select></div><div><label for="sort">Volgorde</label><select id="sort" name="volgorde"><option value="newest">Nieuwste eerst</option><option value="oldest">Oudste eerst</option><option value="title">Titel A–Z</option></select></div><button class="btn btn-outline" type="reset">Wis filters</button></form><p id="result-count" aria-live="polite">${tracks.length} composities</p>`;
await page('/nl/composities/','Composities | Expedition Creativity','Ontdek de composities van Mikaël Stroobants. Zoek op titel, jaar, wereld en genre.',heading('Elke compositie.<br><em>Een expeditie.</em>','Ontdek de muziek en vind jouw volgende muzikale reis.')+`<main id="inhoud" class="shell catalog">${controls}<div class="catalog-grid" id="composition-grid">${tracks.map(t=>card(t,true)).join('')}</div><p id="empty-results" hidden>Geen composities gevonden. Probeer een andere zoekterm of wis de filters.</p></main>`);
await page('/nl/','Filmische en symfonische muziek | Expedition Creativity','Originele filmische en symfonische muziek van Mikaël Stroobants. Ontdek muzikale verhalen over natuur, avontuur en verbeelding.',heading('Elke track.<br><em>Een expeditie.</em>','Originele filmische en symfonische muziek. Muzikale verhalen voor harmonieorkest, film, documentaires en visuele media.')+`<main id="inhoud">${approved?`<section class="shell landing-feature"><div class="section-header"><h2>Ontdek Blue Boy Planet</h2></div><div class="featured-grid">${card(approved,true)}<div class="prose"><div class="eyebrow">De nieuwste expeditie</div>${(trackSections(approved,language,{markdown,escapeHtml})[0].body.match(/<p>.*?<\/p>/gs)||[]).slice(0,2).join('')}<a class="btn btn-primary" href="${route(approved)}">Lees meer ↗</a></div></div></section>`:''}<section class="related-band"><div class="shell"><div class="related-intro"><h2>Verder op ontdekking</h2><a href="/nl/composities/">Bekijk alle composities ↗</a></div><div class="carousel-controls"><button type="button" data-carousel-prev aria-label="Vorige composities">←</button><button type="button" data-carousel-next aria-label="Volgende composities">→</button><button type="button" data-carousel-pause aria-pressed="false">Pauzeren</button></div><div class="track-carousel" id="track-carousel" tabindex="0" role="region" aria-label="Composities — horizontaal bladeren">${tracks.map(t=>card(t,true)).join('')}</div></div></section></main>`);
const timelineIcons={'migration':'🦓','dreamcatcher':'🛤️','orchestral-overture':'🎬','an-elephants-day-in-life':'🐘','hymn-to-the-giants':'🐘','symphonic-awakening':'🎼','pride-of-the-prairies':'🤠','turtle-travel':'🌊','chills-of-antarctica':'❄️','blue-boy-planet':'🌌'};
await page('/nl/tijdlijn/','Tijdlijn | Expedition Creativity','De composities van Expedition Creativity in chronologische volgorde.',heading('De muzikale<br><em>tijdlijn.</em>','Van de eerste orkestrale schetsen tot de nieuwste expeditie.')+`<main id="inhoud" class="shell timeline-list">${tracks.map(t=>`<article class="timeline-entry"><div class="timeline-meta"><span class="section-no">${t.year}</span><span class="timeline-icon" aria-hidden="true">${timelineIcons[t.slug]||'🎵'}</span></div><a class="timeline-thumb" href="${route(t)}" aria-label="Bekijk ${e(t.title)}"><img src="${e(t.image)}" alt="Visual bij ${e(t.title)}" width="256" height="144" loading="lazy"></a><div><p class="eyebrow">${e(t.world)}</p><h2><a href="${route(t)}">${e(t.title)}</a></h2><a href="${route(t)}">Ontdek de compositie ↗</a></div></article>`).join('')}</main>`);
for(const name of await readdir(join(root,language==='en'?'content/en/pages':'content/pages'))){if(!name.endsWith('.json'))continue;const p=await json((language==='en'?'content/en/pages/':'content/pages/')+name);await page(p.path,p.title+' | Expedition Creativity',p.description,heading(p.heading,p.lead)+`<main id="inhoud" class="shell editorial-page">${p.image?`<img class="portrait" src="${e(p.image)}" alt="Mikaël Stroobants" width="500" height="500">`:''}${p.sections.map(s=>section(e(s.title),s.body)).join('')}</main>`);}
await writeFile(join(out,language==='en'?'assets/search-index-en.json':'assets/search-index.json'),JSON.stringify(tracks.map(t=>({title:t.title,year:t.year,world:t.world,type:t.type,url:route(t)}))));
}
await renderLanguage('nl',tracks);
await renderLanguage('en',englishTracks.sort((a,b)=>(b.year*12+(b.release_month||0))-(a.year*12+(a.release_month||0))||a.title.localeCompare(b.title,'en')));
// Historical aliases must survive removal of their obsolete source files.
const legacyTrackSlugs=["an-elephants-day-in-life", "blue-boy-planet", "chills-of-antarctica", "dreamcatcher", "hymn-to-the-giants", "migration", "orchestral-overture", "pride-of-the-prairies", "symphonic-awakening", "turtle-travel"];
const legacyMap=[['/','index.html'],['/tracks','tracks.html'],['/timeline','timeline.html'],['/about','about.html'],['/cookie-policy','cookie-policy.html'],...legacyTrackSlugs.map(slug=>['/track-'+slug,'track-'+slug+'.html'])];
// English is the chosen default. Old URLs redirect without deploying old HTML.
const redirects=[['/','/en/'],['/index.html','/en/'],['/index','/en/']];
const destinations={'/tracks':'/en/tracks/','/timeline':'/en/timeline/','/about':'/en/about/','/cookie-policy':'/en/cookie-policy/'};
for(const [old,file] of legacyMap.slice(1)){
 let target=destinations[old]||`/en/tracks/${old.slice('/track-'.length)}/`;
 if(!built.some(p=>p.path===target)){const nlTarget=`/nl/composities/${old.slice('/track-'.length)}/`;target=built.some(p=>p.path===nlTarget)?nlTarget:'/en/tracks/';}
 for(const source of [old,old+'/', '/'+file])redirects.push([source,target]);
}
for(const [old,target] of [['/contact','/en/contact/'],['/behind-the-score','/en/behind-the-score/'],['/journey','/en/about/']])redirects.push([old,target],[old+'/',target]);
await writeFile(join(out,'_redirects'),redirects.map(([from,to])=>`${from} ${to} 301!`).join('\n')+'\n');
await writeFile(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+built.map(p=>`<url><loc>${origin}${p.path}</loc></url>`).join('')+'</urlset>');
await writeFile(join(out,'robots.txt'),production?`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await writeFile(join(out,'_headers'),`${production?'':'/*\n  X-Robots-Tag: noindex, nofollow\n'}/admin/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store, max-age=0\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
await writeFile(join(out,'build-manifest.json'),JSON.stringify({mode,pages:built,legacyRoutesPreserved:legacyMap.length},null,2));
console.log(`Built ${built.length} bilingual pages; ${legacyMap.length} existing routes preserved; mode=${mode}.`);

await writeFile(join(out,'assets/full-search.json'),JSON.stringify(fullSearch));

// Production rebuild trigger: ensure the latest CMS gallery data is rendered.
