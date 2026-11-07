import {createHash} from 'node:crypto';
// Fixed editorial slots; protected/legacy sections keep their original structure.
export function hasContent(value){return typeof value==='string' && Boolean(value.replace(/<[^>]*>/g,'').replace(/&(?:nbsp|#160);/g,' ').replace(/[\s\u200b\ufeff*_#]/g,''));}

export function trackSections(t, language, {markdown, escapeHtml:e}) {
  if(t.sections) return t.sections.filter(s=>hasContent(s.body)||/<(?:img|button)\b/.test(s.body));
  const en=language==='en', sections=[];
  function add(key,id,title,body){if(!hasContent(body)&&!/<(?:img|button)\b/.test(body))return;const meta=t.section_meta?.[key]||{};sections.push({id:meta.id||id,title,body,key});}
  const prose=value=>hasContent(value)?markdown(value):'';
  add('story',en?'story':'verhaal',en?'The Story Behind the Music':'Het verhaal achter de muziek',prose(t.story));
  add('journey',en?'journey':'reis',en?'The Musical Journey':'De muzikale reis',prose(t.journey));
  add('orchestration',en?'orchestration':'orkestratie',en?'Orchestration & Instrumentation':'Orkestratie en instrumentatie',prose(t.orchestration)+(hasContent(t.instrumentation)?`<div class="instrument-box"><h3>${en?'Instrumentation':'Instrumentatie'}</h3>${prose(t.instrumentation)}</div>`:''));
  const p=t.performance||{};
  const availability={on_request:en?'Score available on request.':'Partituur op aanvraag beschikbaar.',unavailable:en?'Score not available.':'Partituur niet beschikbaar.'};
  const performanceBody=(availability[p.availability]&&!hasContent(p.body)?`<p><strong>${availability[p.availability]}</strong></p>`:'')+prose(p.body)+(p.contact_cta?`<a class="btn btn-primary" href="/${language}/contact/">${en?'Get in touch':'Contact opnemen'} <span aria-hidden="true">↗</span></a>`:'');
  add('performance',en?'scores':'partituren',en?'Scores & Performance':'Partituren en uitvoering',performanceBody?`<div class="performance"><div class="eyebrow" style="margin-bottom:17px">${en?'For conductors and musicians':'Voor dirigenten en muzikanten'}</div>${performanceBody}</div>`:'');
  const referenceGallery=t.slug==='blue-boy-planet';
  const gallery=(t.gallery||[]).map((item,i)=>`${referenceGallery?'':'<figure>'}<button type="button" class="${referenceGallery?(i===0?'art':'daw'):'gallery-image'}" data-lightbox="${e(item.image)}" data-caption="${e(item.caption||'')}" aria-label="${en?'Enlarge image:':'Vergroot afbeelding:'} ${e(item.alt)}"><img src="${e(item.image)}" alt="${e(item.alt)}" loading="lazy" width="1450" height="816"></button>${item.caption&&!referenceGallery?`<figcaption>${e(item.caption)}</figcaption>`:''}${referenceGallery?'':'</figure>'}`).join('');
  add('behind',en?'behind-the-score':'achter-de-partituur',en?'Behind the Score':'Achter de partituur',prose(t.behind)+(gallery?`<div class="gallery${referenceGallery?'':' editorial-gallery'}">${gallery}</div>`:''));
  // Known slots always follow the shared template; legacy extra content is retained.
  const result=[...sections,...(t.legacy_sections||[]).filter(s=>hasContent(s.body))];
  return result;
}
export function validateEditorial(t){
  if(t.translation_status&&!['incomplete','complete','legacy_source'].includes(t.translation_status))throw Error('Invalid translation status');
  const validImage=u=>typeof u==='string'&&(/^(https:\/\/|\/(?!\/))/.test(u));
  for(const key of ['story','journey','orchestration','instrumentation','behind'])if(t[key]!=null&&typeof t[key]!=='string')throw Error('Invalid editorial field: '+key);
  if(t.performance?.availability&&!['unspecified','on_request','unavailable'].includes(t.performance.availability))throw Error('Invalid score availability');
  if(t.performance?.contact_cta!=null&&typeof t.performance.contact_cta!=='boolean')throw Error('Invalid contact CTA');
  if(t.gallery!=null&&!Array.isArray(t.gallery))throw Error('Invalid gallery');
  for(const item of t.gallery||[])if(!validImage(item.image)||!item.alt?.trim())throw Error('Gallery requires an image and meaningful alt text');
  if(t.og_image&&!validImage(t.og_image))throw Error('Invalid OG image');
}

// A published translation may not silently omit populated source sections.
export function translationSourceHash(nl){return createHash('sha256').update(JSON.stringify(Object.fromEntries(['intro','sections','description','seo_title'].map(key=>[key,nl[key]])))).digest('hex');}
export function missingTranslationSections(nl,en){
 const source=nl.sections?Object.fromEntries(nl.sections.map(s=>[({'verhaal':'story','reis':'journey','orkestratie':'orchestration','partituren':'performance','achter-de-partituur':'behind'})[s.id]||s.id,s.body])):nl;
 if(nl.sections){source.instrumentation=(source.orchestration?.match(/<div class="instrument-box">[\s\S]*/)||[])[0]||'';}
 const missing=['intro','story','journey','orchestration','instrumentation','performance','behind'].filter(key=>{
  const original=key==='intro'?nl.intro:source[key];
  // Keep the optional prose field separate from the optional image gallery.\n  const populated=key==='performance'?hasContent(original?.body||original)||original?.contact_cta||original?.availability&&original.availability!=='unspecified':hasContent(original);
  const target=en[key];
  const translated=key==='performance'?hasContent(target?.body)||target?.contact_cta||target.availability&&target.availability!=='unspecified':hasContent(target);
  return populated&&!translated;
 });
 if((hasContent(nl.intro)||nl.sections?.some(s=>hasContent(s.body))||['story','journey','orchestration'].some(k=>hasContent(nl[k])))&&en.translation_status!=='complete'&&en.translation_status!=='legacy_source')missing.push('translation_review');
 const sourceGallery=nl.sections?[...(source.behind||'').matchAll(/data-caption="([^"]*)"/g)].map(m=>({caption:m[1]})):(nl.gallery||[]);
 if(sourceGallery.length>(en.gallery||[]).length||sourceGallery.some((item,i)=>item.caption&&!hasContent(en.gallery?.[i]?.caption)))missing.push('gallery_translation');
 if(en.translation_source_hash&&en.translation_source_hash!==translationSourceHash(nl))missing.push('source_changed');
 return missing;
}
