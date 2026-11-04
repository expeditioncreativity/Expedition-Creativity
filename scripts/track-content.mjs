// Fixed editorial slots; protected/legacy sections keep their original structure.
export function trackSections(t, language, {markdown, escapeHtml:e}) {
  if(t.sections) return t.sections;
  const en=language==='en', sections=[];
  function add(key,id,title,body){if(!body.trim())return;const meta=t.section_meta?.[key]||{};sections.push({id:meta.id||id,title:meta.title||title,body,key});}
  const prose=value=>value?.trim()?markdown(value):'';
  add('story',en?'story':'verhaal',en?'The story behind the music':'Het verhaal achter de muziek',prose(t.story));
  add('journey',en?'journey':'reis',en?'A musical journey':'Een muzikale reis',prose(t.journey));
  add('orchestration',en?'orchestration':'orkestratie',en?'Orchestration & instrumentation':'Orkestratie & instrumentatie',prose(t.orchestration)+(t.instrumentation?.trim()?`<div class="instrument-box"><h3>${en?'Instrumentation':'Instrumentatie'}</h3>${prose(t.instrumentation)}</div>`:''));
  const p=t.performance||{};
  const availability={on_request:en?'Score available on request.':'Partituur op aanvraag beschikbaar.',unavailable:en?'Score not available.':'Partituur niet beschikbaar.'};
  add('performance',en?'scores':'partituren',en?'Scores & performance':'Partituren & uitvoering',(availability[p.availability]?`<p><strong>${availability[p.availability]}</strong></p>`:'')+prose(p.body)+(p.contact_cta?`<a class="btn btn-primary" href="/${language}/contact/">${en?'Get in touch':'Contact opnemen'} ↗</a>`:''));
  const gallery=(t.gallery||[]).map(item=>`<figure><button type="button" class="gallery-image" data-lightbox="${e(item.image)}" data-caption="${e(item.caption||'')}" aria-label="${en?'Enlarge image:':'Vergroot afbeelding:'} ${e(item.alt)}"><img src="${e(item.image)}" alt="${e(item.alt)}" loading="lazy" width="1450" height="816"></button>${item.caption?`<figcaption>${e(item.caption)}</figcaption>`:''}</figure>`).join('');
  add('behind',en?'behind-the-score':'achter-de-partituur',en?'Behind the score':'Achter de partituur',prose(t.behind)+(gallery?`<div class="gallery editorial-gallery">${gallery}</div>`:''));
  // Retain the order of migrated sections, including any additional legacy sections.
  const result=[...sections,...(t.legacy_sections||[])];
  if(t.section_order)result.sort((a,b)=>{const pos=s=>{const i=t.section_order.indexOf(s.id);return i<0?999:i;};return pos(a)-pos(b);});
  return result;
}
export function validateEditorial(t){
  const validImage=u=>typeof u==='string'&&(/^(https:\/\/|\/(?!\/))/.test(u));
  for(const key of ['story','journey','orchestration','instrumentation','behind'])if(t[key]!=null&&typeof t[key]!=='string')throw Error('Invalid editorial field: '+key);
  if(t.performance?.availability&&!['unspecified','on_request','unavailable'].includes(t.performance.availability))throw Error('Invalid score availability');
  if(t.performance?.contact_cta!=null&&typeof t.performance.contact_cta!=='boolean')throw Error('Invalid contact CTA');
  if(t.gallery!=null&&!Array.isArray(t.gallery))throw Error('Invalid gallery');
  for(const item of t.gallery||[])if(!validImage(item.image)||!item.alt?.trim())throw Error('Gallery requires an image and meaningful alt text');
  if(t.og_image&&!validImage(t.og_image))throw Error('Invalid OG image');
}
