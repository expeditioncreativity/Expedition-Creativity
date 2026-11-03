import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';

export const root = resolve(import.meta.dirname, '..');
export const out = join(root,'dist');
export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHtml;
export const fill = (template, values) => template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=> {if (!(key in values)) throw Error('Missing slot '+key);return String(values[key]);});
const read=path=>readFile(join(root,path),'utf8');
const json=async path=>JSON.parse(await read(path));
const origin='https://expeditioncreativity.com';
const production=process.env.SITE_MODE==='production' && process.env.CONTEXT==='production';
const mode=production?'production':'preview';
export function markdown(text) {
  // Existing approved HTML is retained verbatim. New content supports the editor's
  // deliberately small set: paragraphs, h3, bold and italic. Git authors are trusted.
  if (text.trim().startsWith('<')) return text;
  return text.split(/\n\s*\n/).filter(Boolean).map(p=>{
    const heading=p.startsWith('### ');if(heading)p=p.slice(4);
    const body=e(p).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\n/g,' ');
    return `<${heading?'h3 class="subhead"':'p'}>${body}</${heading?'h3':'p'}>`;
  }).join('\n');
}
const route=t=>`/nl/composities/${t.slug}/`;
const abs=url=>new URL(url,origin).href;
const sourceFiles=(await readdir(join(root,'content/tracks'))).filter(x=>x.endsWith('.json'));
export const allTracks=await Promise.all(sourceFiles.map(x=>json('content/tracks/'+x)));
export const tracks=allTracks.filter(t=>t.status==='published').sort((a,b)=>(b.year*12+(b.release_month||0))-(a.year*12+(a.release_month||0))||a.title.localeCompare(b.title,'nl'));
export function validate(t) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug))throw Error('Invalid slug: '+t.slug);
  if(!t.title || !Number.isInteger(t.year) || t.year<1900 || t.year>2200)throw Error('Invalid track metadata');
  if(!/^[\w-]{11}$/.test(t.video_id))throw Error('Invalid YouTube video: '+t.slug);
  if(!t.image || (!t.image.startsWith('/') && !/^https:\/\//.test(t.image)))throw Error('Invalid image URL');
  if(!['draft','published'].includes(t.status))throw Error('Invalid status');
  if(t.release_month != null && (!Number.isInteger(t.release_month)||t.release_month<1||t.release_month>12))throw Error('Invalid release month');
  if(t.duration && !/^\d+:[0-5]\d$/.test(t.duration))throw Error('Invalid duration');
  const ids=(t.sections||[]).map(s=>s.id);
  if(ids.some(id=>!id || !/^[a-z0-9-]+$/.test(id))||new Set(ids).size!==ids.length||ids.includes('gegevens'))throw Error('Invalid section IDs');
  for(const related of t.related||[])if(!allTracks.some(x=>x.slug===related))throw Error('Unknown related track: '+related);
}
allTracks.forEach(validate);
if(new Set(allTracks.map(t=>t.slug)).size!==allTracks.length)throw Error('Duplicate slug');
const lock=await json('tests/approved-blue-boy-planet.json');
const approved=allTracks.find(t=>t.slug==='blue-boy-planet');
if(approved.intro!==lock.intro || JSON.stringify(approved.sections)!==JSON.stringify(lock.sections))throw Error('Approved Blue Boy Planet text changed; explicit editorial approval required.');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// Preserve all existing routes and files until the separately approved language migration.
for(const entry of await readdir(root,{withFileTypes:true}))if(entry.isFile() && /\.(html|css|js|png|jpe?g|ico|svg|webmanifest|xml|txt)$/i.test(entry.name))await cp(join(root,entry.name),join(out,entry.name));
await cp(join(root,'src/assets'),join(out,'assets'),{recursive:true});
await cp(join(root,'admin'),join(out,'admin'),{recursive:true});
const base=await read('src/templates/base.html');const trackTemplate=await read('src/templates/track.html');
const nav=[['Startpagina','/nl/'],['Composities','/nl/composities/'],['Tijdlijn','/nl/tijdlijn/'],['Mijn verhaal','/nl/mijn-verhaal/'],['Achter de muziek','/nl/achter-de-muziek/'],['Contact','/nl/contact/']];
const built=[];
async function page(path,title,description,body,{image='/hero-blue-boy-planet.png',schema=[],type='website'}={}) {
  const canonical=origin+path;
  const person={'@type':'Person','@id':origin+'/#composer',name:'Mikaël Stroobants',url:origin+'/nl/mijn-verhaal/'};
  const graph={'@context':'https://schema.org','@graph':[person,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/nl/',name:'Expedition Creativity',inLanguage:'nl-BE'},...schema]};
  const result=fill(base,{SEO_TITLE:e(title),DESCRIPTION:e(description),ROBOTS:production?'index, follow':'noindex, nofollow',CANONICAL:e(canonical),OG_TYPE:type,OG_IMAGE:e(abs(image)),SITE_MODE:mode,SCHEMA:JSON.stringify(graph).replace(/</g,'\\u003c'),NAV:nav.map(([label,href])=>`<a href="${href}"${path===href?' class="active" aria-current="page"':''}>${label}</a>`).join(''),BODY:body});
  const dest=join(out,path,'index.html');await mkdir(resolve(dest,'..'),{recursive:true});await writeFile(dest,result);built.push({path,title});
}
const card=t=>`<a class="related-card composition-card" href="${route(t)}" data-title="${e(t.title)}" data-year="${t.year}" data-order="${t.year*12+(t.release_month||0)}" data-world="${e(t.world)}" data-type="${e(t.type)}"><div class="related-img"><img src="${e(t.image)}" alt="Visual bij ${e(t.title)}" loading="lazy" width="640" height="360"></div><div class="related-body"><small>${t.year} · ${e(t.world)}</small><h3>${e(t.title)}</h3>${t.description?`<p>${e(t.description)}</p>`:''}<span>Ontdek de compositie ↗</span></div></a>`;
const heading=(title,lead,eyebrow='Expedition Creativity')=>`<header class="hero page-hero"><div class="shell"><div class="eyebrow">${e(eyebrow)}</div><h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div></header>`;
const section=(title,body)=>`<section class="content-section"><div class="section-header"><h2>${title}</h2></div><div class="prose">${body}</div></section>`;
function localLinks(body) {return body.replaceAll('https://expeditioncreativity.com/contact','/nl/contact/');}
for(const t of tracks){
  const sections=(t.sections||[]).map((s,i)=>`<section id="${e(s.id)}" class="content-section"><div class="section-header"><span class="section-no">${String(i+1+(i>=3?1:0)).padStart(2,'0')}</span><h2>${e(s.title)}</h2></div><div class="prose">${localLinks(markdown(s.body))}</div></section>`);
  const facts=`<section id="gegevens" class="content-section"><div class="section-header"><span class="section-no">${String(Math.min(sections.length+1,4)).padStart(2,'0')}</span><h2>Compositiegegevens</h2></div><div class="fact-grid"><div class="fact"><small>Componist</small><strong>Mikaël Stroobants</strong></div>${t.duration?`<div class="fact"><small>Duurtijd</small><strong>${e(t.duration)}</strong></div>`:''}<div class="fact"><small>Jaar van uitvoering</small><strong>${t.year}</strong></div><div class="fact"><small>Genre</small><strong>${e(t.type)}${t.slug==='blue-boy-planet'?' · Symfonische muziek':''}</strong></div></div></section>`;
  // The approved reference places facts fourth, before score availability.
  sections.splice(Math.min(3,sections.length),0,facts);
  const linkList=(t.sections||[]).map(s=>({id:s.id,title:s.title}));linkList.splice(Math.min(3,linkList.length),0,{id:'gegevens',title:'Compositiegegevens'});
  const related=(t.related||[]).map(slug=>tracks.find(x=>x.slug===slug)).filter(Boolean);
  const body=fill(trackTemplate,{TITLE_HTML:t.slug==='blue-boy-planet'?'Blue Boy<br><em>Planet</em>':e(t.title),TITLE:e(t.title),INTRO:t.intro?`<p class="lead">${markdown(t.intro).replace(/^<p>|<\/p>$/g,'')}</p>`:'',TYPE:e(t.type),IMAGE:e(t.image),VIDEO_ID:e(t.video_id),YEAR:t.year,DURATION:t.duration?`<span class="duration">${e(t.duration)}</span>`:'',PILLS:[t.type,t.slug==='blue-boy-planet'?'Symfonische muziek':t.world,t.year,t.duration].filter(Boolean).map(x=>`<span class="pill">${e(x)}</span>`).join(''),SECTIONS:sections.join(''),SECTION_LINKS:linkList.map((s,i)=>`<a href="#${s.id}"><span class="index">${String(i+1).padStart(2,'0')}</span>${e(s.title)}</a>`).join('')+(related.length?'<a href="#meer-muziek"><span class="index">07</span>Ontdek meer muziek</a>':''),SCORE_CTA:t.slug==='blue-boy-planet'?'<div class="side-cta"><small>Geïnteresseerd in een uitvoering?</small><h3>Breng deze muziek tot leven.</h3><p>Partituren zijn op aanvraag beschikbaar. Neem gerust contact op om de mogelijkheden te bespreken.</p><a class="btn btn-primary" href="/nl/contact/">Vraag de partituur aan ↗</a></div>':'',RELATED:related.length?`<section class="related-band" id="meer-muziek"><div class="shell"><div class="related-intro"><div><div class="eyebrow">Verder op ontdekking</div><h2>Ontdek meer muziek</h2><p>Meer horen? Beluister zeker ook deze tracks:</p></div><a href="/nl/composities/" class="related-link">Bekijk alle composities ↗</a></div><div class="related-grid">${related.map(card).join('')}</div></div></section>`:''});
  const desc=t.description||`Beluister ${t.title}, een compositie van Mikaël Stroobants uit ${t.year}. Ontdek de muziek van Expedition Creativity.`;
  const composition={'@type':'MusicComposition','@id':abs(route(t))+'#composition',name:t.title,url:abs(route(t)),composer:{'@id':origin+'/#composer'},inLanguage:'nl-BE',genre:t.type};
  const recording={'@type':'MusicRecording','@id':abs(route(t))+'#recording',name:t.title,recordingOf:{'@id':composition['@id']},byArtist:{'@id':origin+'/#composer'},url:`https://www.youtube.com/watch?v=${t.video_id}`};
  if(t.duration){const [m,s]=t.duration.split(':');recording.duration=`PT${Number(m)}M${Number(s)}S`;}
  await page(route(t),t.seo_title||`${t.title} – ${t.type} | Expedition Creativity`,desc,body,{image:t.image,schema:[composition,recording,{'@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Startpagina',item:origin+'/nl/'},{'@type':'ListItem',position:2,name:'Composities',item:origin+'/nl/composities/'},{'@type':'ListItem',position:3,name:t.title,item:abs(route(t))}]}]});
}
const opts=values=>[...new Set(values)].sort().map(x=>`<option value="${e(x)}">${e(x)}</option>`).join('');
const controls=`<form class="filters" role="search" onsubmit="return false"><div><label for="query">Zoek een compositie</label><input id="query" name="q" type="search" placeholder="Titel, thema of genre…" autocomplete="off"></div><div><label for="year">Jaar</label><select id="year" name="jaar"><option value="">Alle jaren</option>${opts(tracks.map(t=>t.year))}</select></div><div><label for="world">Wereld</label><select id="world" name="wereld"><option value="">Alle werelden</option>${opts(tracks.map(t=>t.world))}</select></div><div><label for="type">Genre</label><select id="type" name="genre"><option value="">Alle genres</option>${opts(tracks.map(t=>t.type))}</select></div><div><label for="sort">Volgorde</label><select id="sort" name="volgorde"><option value="newest">Nieuwste eerst</option><option value="oldest">Oudste eerst</option><option value="title">Titel A–Z</option></select></div><button class="btn btn-outline" type="reset">Wis filters</button></form><p id="result-count" aria-live="polite">${tracks.length} composities</p>`;
await page('/nl/composities/','Composities | Expedition Creativity','Ontdek de composities van Mikaël Stroobants. Zoek op titel, jaar, wereld en genre.',heading('Elke compositie.<br><em>Een expeditie.</em>','Ontdek de muziek en vind jouw volgende muzikale reis.')+`<main id="inhoud" class="shell catalog">${controls}<div class="catalog-grid" id="composition-grid">${tracks.map(card).join('')}</div><p id="empty-results" hidden>Geen composities gevonden. Probeer een andere zoekterm of wis de filters.</p></main>`);
await page('/nl/','Filmische en symfonische muziek | Expedition Creativity','Originele filmische en symfonische muziek van Mikaël Stroobants. Ontdek muzikale verhalen over natuur, avontuur en verbeelding.',heading('Elke track.<br><em>Een expeditie.</em>','Originele filmische en symfonische muziek. Muzikale verhalen voor harmonieorkest, film, documentaires en visuele media.')+`<main id="inhoud"><section class="shell landing-feature"><div class="section-header"><h2>Ontdek Blue Boy Planet</h2></div><div class="featured-grid">${card(approved)}<div class="prose"><div class="eyebrow">De nieuwste expeditie</div><p>${approved.intro}</p><a class="btn btn-primary" href="${route(approved)}">Bekijk de compositie ↗</a></div></div></section><section class="related-band"><div class="shell"><div class="related-intro"><h2>Verder op ontdekking</h2><a href="/nl/composities/">Bekijk alle composities ↗</a></div><div class="related-grid">${tracks.filter(t=>t.slug!==approved.slug).slice(0,2).map(card).join('')}</div></div></section></main>`);
await page('/nl/tijdlijn/','Tijdlijn | Expedition Creativity','De composities van Expedition Creativity in chronologische volgorde.',heading('De muzikale<br><em>tijdlijn.</em>','Van de eerste orkestrale schetsen tot de nieuwste expeditie.')+`<main id="inhoud" class="shell timeline-list">${[...tracks].reverse().map(t=>`<article class="timeline-entry"><span class="section-no">${t.year}</span><div><p class="eyebrow">${e(t.world)}</p><h2><a href="${route(t)}">${e(t.title)}</a></h2><a href="${route(t)}">Ontdek de compositie ↗</a></div></article>`).join('')}</main>`);
for(const name of await readdir(join(root,'content/pages'))){if(!name.endsWith('.json'))continue;const p=await json('content/pages/'+name);await page(p.path,p.title+' | Expedition Creativity',p.description,heading(p.heading,p.lead)+`<main id="inhoud" class="shell editorial-page">${p.image?`<img class="portrait" src="${e(p.image)}" alt="Mikaël Stroobants" width="500" height="500">`:''}${p.sections.map(s=>section(e(s.title),s.body)).join('')}</main>`);}
await writeFile(join(out,'assets/search-index.json'),JSON.stringify(tracks.map(t=>({title:t.title,year:t.year,world:t.world,type:t.type,url:route(t)}))));
const legacyMap=[['/','index.html'],['/tracks','tracks.html'],['/timeline','timeline.html'],['/about','about.html'],['/cookie-policy','cookie-policy.html'],...allTracks.map(t=>['/track-'+t.slug,'track-'+t.slug+'.html'])];
// Existing root routes remain authoritative until a separately approved redirect migration.
const legacyUrls=legacyMap.map(([p])=>p);
await writeFile(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...legacyUrls,...built.map(p=>p.path)].map(p=>`<url><loc>${origin}${p}</loc></url>`).join('')+'</urlset>');
await writeFile(join(out,'robots.txt'),production?`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await writeFile(join(out,'_headers'),`${production?'':'/*\n  X-Robots-Tag: noindex, nofollow\n'}/admin/*\n  X-Robots-Tag: noindex, nofollow\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
await writeFile(join(out,'build-manifest.json'),JSON.stringify({mode,pages:built,legacyRoutesPreserved:legacyMap.length},null,2));
console.log(`Built ${built.length} Dutch pages; ${legacyMap.length} existing routes preserved; mode=${mode}.`);
