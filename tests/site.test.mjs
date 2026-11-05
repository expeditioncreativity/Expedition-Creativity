import test from 'node:test';
import {linkIcons} from '../scripts/icons.mjs';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {cp,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {root,out,tracks,allTracks,validate,markdown,escapeHtml} from '../scripts/build.mjs';
const read=path=>readFile(path,'utf8');
const manifest=JSON.parse(await read(join(out,'build-manifest.json')));
const pages=await Promise.all(manifest.pages.map(async p=>({...p,html:await read(join(out,p.path,'index.html'))})));

test('34 bilingual pages are built with the correct document language and no unresolved slots',()=>{
  assert.equal(pages.length,34);
  for(const p of pages){assert.ok(p.html.includes(`<html lang="${p.path.startsWith('/en/')?'en':'nl'}">`));assert.doesNotMatch(p.html,/\{\{[A-Z_]+\}\}/);assert.match(p.html,/<h1>/);assert.equal((p.html.match(/<h1>/g)||[]).length,1);}
});
test('all internal links, assets, gallery images and fragment targets exist',async()=>{
  for(const p of pages){
    for(const [,attr,value] of p.html.matchAll(/\b(href|src|data-lightbox)="([^"]+)"/g)){
      if(value.startsWith('#')) {assert.ok(p.html.includes(`id="${value.slice(1)}"`),`${p.path} ${value}`);continue;}
      if(!value.startsWith('/'))continue;
      const url=new URL(value,'https://example.test');if(url.pathname==='/.netlify/images'){assert.match(url.searchParams.get('url'),/^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/hqdefault\.jpg$/);continue;}const target=join(out,url.pathname,extname(url.pathname)?'':'index.html');
      await assert.doesNotReject(access(target),`${p.path} ${attr} ${value}`);
    }
  }
});
test('approved Blue Boy Planet narrative, subheads, emphasis and galleries survive unchanged',async()=>{
  const approved=JSON.parse(await read(join(root,'tests/approved-blue-boy-planet.json')));
  const track=allTracks.find(t=>t.slug==='blue-boy-planet');
  assert.equal(track.intro,approved.intro);assert.deepEqual(track.sections,approved.sections);
  const page=pages.find(p=>p.path.includes('blue-boy-planet')).html;
  assert.ok(page.includes(approved.intro));
  for(const section of approved.sections)assert.ok(page.includes(linkIcons(section.body.replaceAll('https://expeditioncreativity.com/contact','/nl/contact/'))),section.title);
});
test('original reusable media remain byte-for-byte unchanged after legacy cleanup',async()=>{
  const names=execFileSync('git',['ls-tree','-r','--name-only','0dd6134ac3022fb0a3f50fa45171368319631e76'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(name=>/\.(png|jpe?g|ico|svg|webmanifest)$/i.test(name));
  for(const name of names){const before=execFileSync('git',['show',`0dd6134ac3022fb0a3f50fa45171368319631e76:${name}`],{cwd:root,maxBuffer:30*1024*1024});const now=await readFile(join(root,name));assert.ok(before.equals(now),name);}
});
test('metadata and structured composition/recording data are present and parseable',()=>{
  for(const p of pages){assert.ok(p.html.includes(`rel="canonical" href="https://expeditioncreativity.com${p.path}"`));assert.match(p.html,/<meta name="description" content="[^"]+"/);assert.match(p.html,/property="og:image"/);assert.match(p.html,/twitter:card/);const schema=JSON.parse(p.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(schema['@context'],'https://schema.org');if(p.path.match(/composities\/.+\//)){assert.ok(schema['@graph'].some(x=>x['@type']==='MusicComposition'));assert.ok(schema['@graph'].some(x=>x['@type']==='MusicRecording'));}}
});
test('preview is noindex, has no advertising, GA script or eager YouTube iframe',async()=>{
  assert.equal(manifest.mode,'preview');
  for(const p of pages){assert.match(p.html,/data-site-mode="preview"/);assert.match(p.html,/content="noindex, nofollow"/);assert.doesNotMatch(p.html,/<iframe/);assert.doesNotMatch(p.html,/<script[^>]+src="https:\/\/www.googletagmanager/);}
  assert.match(await read(join(out,'robots.txt')),/Disallow: \//);
  assert.match(await read(join(out,'_headers')),/X-Robots-Tag: noindex, nofollow/);
});
test('each video uses the corresponding composition ID; chronological order includes month',()=>{
  for(const t of tracks){const p=pages.find(p=>p.path===`/nl/composities/${t.slug}/`);assert.ok(p.html.includes(`data-video="${t.video_id}"`));assert.ok(p.html.includes(`aria-label="Speel ${escapeHtml(t.title)} af via YouTube"`));}
  assert.ok(tracks.findIndex(t=>t.slug==='chills-of-antarctica')<tracks.findIndex(t=>t.slug==='turtle-travel'));
  assert.ok(tracks.findIndex(t=>t.slug==='dreamcatcher')<tracks.findIndex(t=>t.slug==='migration'));
});
test('invalid CMS content fails early instead of generating broken URLs',()=>{
  const t=tracks[0];assert.throws(()=>validate({...t,slug:'../../escape'}));assert.throws(()=>validate({...t,video_id:'bad'}));assert.throws(()=>validate({...t,duration:'4:99'}));assert.throws(()=>validate({...t,related:['unknown-track']}));assert.throws(()=>validate({...t,sections:[{id:'duplicate'},{id:'duplicate'}]}));
});
test('supported CMS formatting is rendered and new prose is escaped',()=>{
  assert.equal(markdown('### Titel\n\nEen **belangrijk** en *zacht* thema.'),'<h3 class="subhead">Titel</h3>\n<p>Een <strong>belangrijk</strong> en <em>zacht</em> thema.</p>');assert.match(markdown('Tekst met <script>alert(1)</script>'),/&lt;script&gt;/);
});
test('CMS publishes to main through editorial workflow, protects approved text and pins its script',async()=>{
  const config=await read(join(root,'admin/config.yml'));assert.match(config,/branch: main/);assert.match(config,/publish_mode: editorial_workflow/);assert.match(config,/filter:\s+field: approved\s+value: false/);assert.match(await read(join(root,'admin/index.html')),/decap-cms@3\.17\.3/);assert.match(await read(join(root,'admin/index.html')),/integrity="sha384-/);
});
test('language alternates point to existing matching pages in both directions',()=>{
  for(const p of pages){
    const alternates=[...p.html.matchAll(/hreflang="(nl|en)" href="https:\/\/expeditioncreativity.com([^"]+)"/g)];
    assert.equal(alternates.length,2,p.path);
    for(const [,lang,path] of alternates){assert.ok(path.startsWith('/'+lang+'/'));assert.ok(pages.some(x=>x.path===path),path);}
  }
});
test('English track narrative matches the original published website paragraphs',async()=>{
  for(const t of tracks.filter(t=>t.slug!=='blue-boy-planet')){
    const source=execFileSync('git',['show',`0dd6134ac3022fb0a3f50fa45171368319631e76:track-${t.slug}.html`],{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024});
    const story=source.split('<h2>The Story</h2>')[1].split('<div class="track-card-tags')[0];
    const english=pages.find(p=>p.path===`/en/tracks/${t.slug}/`).html;
    for(const paragraph of story.match(/<p>.*?<\/p>/gs)||[])assert.ok(english.replaceAll('&#39;',"'").replaceAll('&quot;','"').includes(paragraph),t.slug);
  }
});
test('a new CMS composition reaches its page, search index, catalogue and sitemap; drafts stay hidden',async()=>{
  const temp=await mkdtemp(join(tmpdir(),'ec-content-test-'));
  try {
    for(const dir of ['scripts','src','admin','content','tests'])await cp(join(root,dir),join(temp,dir),{recursive:true});
    const fixture={...tracks[0],title:'Testcompositie',slug:'testcompositie',approved:false,intro:'Een **nieuw** muzikaal verhaal.',sections:undefined,story:'### Een begin\n\nEen **origineel** thema.',journey:'Een reis.',instrumentation:'Hoorn en strijkers.',performance:{availability:'unspecified',contact_cta:false},behind:'Een schets.',gallery:[{image:tracks[0].image,alt:'Testbeeld',caption:'Testonderschrift'}],status:'published'};
    await writeFile(join(temp,'content/tracks/testcompositie.json'),JSON.stringify(fixture));
    await writeFile(join(temp,'content/tracks/concept.json'),JSON.stringify({...fixture,slug:'concept',status:'draft'}));
    await writeFile(join(temp,'content/en/tracks/testcompositie.json'),JSON.stringify({title:'Test composition',slug:'testcompositie',world:'Space',type:'Orchestral music',status:'published',intro:'An **original** story.',story:'A new **beginning**.',journey:'A journey.',instrumentation:'Horn and strings.',behind:'A sketch.',gallery:[{image:tracks[0].image,alt:'Test artwork',caption:'Test caption'}],translation_status:'complete'}));
    await writeFile(join(temp,'content/tracks/zonder-vertaling.json'),JSON.stringify({...fixture,slug:'zonder-vertaling'}));
    execFileSync(process.execPath,[join(temp,'scripts/build.mjs')],{cwd:temp});
    for(const path of ['nl/composities/testcompositie/index.html','nl/composities/index.html','sitemap.xml','assets/search-index.json'])assert.match(await read(join(temp,'dist',path)),/testcompositie/);
    assert.match(await read(join(temp,'dist/nl/composities/testcompositie/index.html')),/<strong>nieuw<\/strong>/);
    const rendered=await read(join(temp,'dist/nl/composities/testcompositie/index.html'));
    assert.match(rendered,/<figcaption>Testonderschrift<\/figcaption>/);assert.match(rendered,/Hoorn en strijkers/);assert.doesNotMatch(rendered,/id="partituren"/);
    const ids=['verhaal','reis','orkestratie','gegevens','achter-de-partituur'];for(let i=1;i<ids.length;i++)assert.ok(rendered.indexOf(`id="${ids[i-1]}"`)<rendered.indexOf(`id="${ids[i]}"`));
    const english=await read(join(temp,'dist/en/tracks/testcompositie/index.html'));
    assert.match(english,/<strong>original<\/strong>/);assert.match(english,/<strong>beginning<\/strong>/);assert.ok(english.includes(`data-video="${fixture.video_id}"`));
    assert.doesNotMatch(await read(join(temp,'dist/nl/composities/zonder-vertaling/index.html')),/hreflang="en"/);
    await assert.rejects(access(join(temp,'dist/en/tracks/zonder-vertaling/index.html')));

    await assert.rejects(access(join(temp,'dist/nl/composities/concept/index.html')));
    assert.doesNotMatch(await read(join(temp,'dist/assets/search-index.json')),/\/concept\//);
  } finally {await rm(temp,{recursive:true,force:true});}
});

import {trackSections,validateEditorial,missingTranslationSections,hasContent} from '../scripts/track-content.mjs';
const render=(t,lang='nl')=>trackSections(t,lang,{markdown,escapeHtml});
test('migration retains all existing section text, ordering, media, metadata and SEO',async()=>{
 for(const folder of ['content/tracks','content/en/tracks'])for(const file of await readdir(`${root}/${folder}`)){
  const path=`${folder}/${file}`;
  if(path==='content/en/tracks/blue-boy-planet.json')continue; // Explicit full translation replaces the earlier short English copy; archived separately.
  const before=JSON.parse(execFileSync('git',['show',`4192984ad07417ef6eff25d781e10e192ecda27a:${path}`],{cwd:root,encoding:'utf8'}));
  const after=JSON.parse(await readFile(`${root}/${path}`,'utf8'));
  for(const [key,value] of Object.entries(before))if(key!=='sections')assert.deepEqual(after[key],value,`${path}: ${key}`);
  if(file==='turtle-travel.json') { assert.ok(after.story?.trim()); continue; } // Owner added NL story; EN translated while retaining original paragraph.
  assert.deepEqual(render(after,folder.includes('/en/')?'en':'nl').map(({id,body})=>({id,body:body.replaceAll('&#39;',"'").replaceAll('&quot;','"').replace(/>\s+</g,'><')})),(before.sections||[]).map(({id,body})=>({id,body:body.replace(/>\s+</g,'><')})),path);
 }
});
test('fixed sections omit empty content and do not invent availability',()=>{
 assert.deepEqual(render({story:' ',performance:{availability:'unspecified',contact_cta:false},gallery:[]}),[]);
 const t={story:'### Begin\n\nEen **thema**.',journey:'Reis',instrumentation:'Hoorn',performance:{availability:'on_request',body:'Toelichting',contact_cta:true},behind:'Werkplek',gallery:[{image:'/assets/approved-1.webp',alt:'Werkplek',caption:'Eerste schets'}]};
 const sections=render(t);
 assert.deepEqual(sections.map(s=>s.id),['verhaal','reis','orkestratie','partituren','achter-de-partituur']);
 assert.match(sections[0].body,/<h3 class="subhead">Begin<\/h3>/);assert.match(sections[0].body,/<strong>thema<\/strong>/);
 assert.match(sections[2].body,/Instrumentatie/);assert.match(sections[3].body,/\/nl\/contact\//);
 assert.match(sections[4].body,/<figcaption>Eerste schets<\/figcaption>/);assert.match(sections[4].body,/alt="Werkplek"/);
 assert.match(render(t,'en')[3].body,/\/en\/contact\//);
});
test('invalid gallery, availability and field types fail before rendering',()=>{
 assert.throws(()=>validateEditorial({gallery:[{image:'/a.jpg',alt:''}]}));
 assert.throws(()=>validateEditorial({gallery:[{image:'javascript:alert(1)',alt:'Test'}]}));
 assert.throws(()=>validateEditorial({performance:{availability:'invented'}}));
 assert.throws(()=>validateEditorial({story:42}));
});

test('English default and legacy redirects have real targets and sitemap excludes old URLs',async()=>{
 const rules=(await read(join(out,'_redirects'))).trim().split('\n').map(line=>line.split(' '));
 assert.ok(rules.some(([from,to])=>from==='/'&&to==='/en/'));
 assert.equal(new Set(rules.map(r=>r[0])).size,rules.length);
 for(const [from,to,status] of rules){assert.equal(status,'301!');assert.ok(pages.some(p=>p.path===to),from);assert.ok(!rules.some(r=>r[0]===to),'redirect chain '+from);}
 for(const t of tracks)assert.ok(rules.some(([from,to])=>from===`/track-${t.slug}.html`&&to===`/en/tracks/${t.slug}/`));
 const sitemap=await read(join(out,'sitemap.xml'));assert.equal((sitemap.match(/<loc>/g)||[]).length,34);assert.doesNotMatch(sitemap,/<loc>https:\/\/expeditioncreativity.com\/track-/);
 for(const p of pages)assert.match(p.html,/hreflang="x-default" href="https:\/\/expeditioncreativity.com\/en\//);
});
test('production metadata is enabled only in production context',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'ec-production-test-'));
 try{
  for(const dir of ['scripts','src','admin','content','tests'])await cp(join(root,dir),join(temp,dir),{recursive:true});
  for(const context of ['deploy-preview','production']){
   execFileSync(process.execPath,[join(temp,'scripts/build.mjs')],{cwd:temp,env:{...process.env,SITE_MODE:'production',CONTEXT:context}});
   const html=await read(join(temp,'dist/en/index.html'));
   assert.ok(html.includes(context==='production'?'content="index, follow"':'content="noindex, nofollow"'));
   const robots=await read(join(temp,'dist/robots.txt'));
   assert.ok(robots.includes(context==='production'?'Allow: /':'Disallow: /'));
  }
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('full English Blue Boy Planet preserves the source structure, emphasis, images and performance information',async()=>{
 const nl=allTracks.find(t=>t.slug==='blue-boy-planet');
 const en=JSON.parse(await read(join(root,'content/en/tracks/blue-boy-planet.json')));
 assert.deepEqual(missingTranslationSections(nl,en),[]);
 const a=render(nl),b=render(en,'en');assert.equal(a.length,b.length);
 for(let i=0;i<a.length;i++)for(const tag of ['p','h3','strong','em','img','a']){
  const count=body=>(body.match(new RegExp(`<${tag}(?:>|\\s)`,'g'))||[]).length;
  assert.equal(count(a[i].body),count(b[i].body),`${i} ${tag}`);
 }
 assert.match(en.performance.body,/virtual orchestral instruments/);assert.match(en.performance.body,/digital orchestral simulation/);assert.match(en.performance.body,/individual instrumental parts/);
 assert.equal(en.performance.availability,'on_request');assert.equal(en.gallery.length,3);
 assert.equal(en.previous_english.story,JSON.parse(execFileSync('git',['show','e297864991b1af504fa09c077a2df6b09b6869d0:content/en/tracks/blue-boy-planet.json'],{cwd:root,encoding:'utf8'})).story);
 const page=pages.find(p=>p.path==='/en/tracks/blue-boy-planet/').html;
 assert.match(page,/For conductors and musicians/);assert.match(page,/href="\/en\/contact\/"/);assert.match(page,/data-caption="Detail of the orchestral arrangement in Ableton Live"/);
});
test('blank rich text, unreviewed/partial translations and empty score CTAs are excluded',()=>{
 assert.equal(hasContent('<p><br></p>'),false);assert.equal(hasContent('<p>&nbsp;\u200b</p>'),false);
 assert.deepEqual(render({story:'<p><br></p>',journey:' ',instrumentation:'** **',performance:{body:'<p></p>',availability:'unspecified',contact_cta:false}}),[]);
 assert.ok(missingTranslationSections({story:'Een volledig verhaal',journey:'Reis'},{story:'Summary',translation_status:'complete'}).includes('journey'));
 assert.ok(missingTranslationSections({story:'Verhaal'},{story:'Story'}).includes('translation_review'));
 assert.ok(missingTranslationSections({story:'Verhaal'},{story:'Story',translation_status:'complete',translation_source_hash:'stale'}).includes('source_changed'));
});
test('visible track sections and navigation use consecutive numbers in both languages',()=>{
 for(const p of pages.filter(p=>/\/(tracks|composities)\/.+\//.test(p.path))){
  const nums=[...p.html.matchAll(/class="section-no">(\d+)<\/span>/g)].map(m=>Number(m[1]));
  assert.deepEqual(nums,nums.map((_,i)=>i+1),p.path);
  const nav=[...p.html.matchAll(/class="index">(\d+)<\/span>/g)].map(m=>Number(m[1]));
  assert.deepEqual(nav,nav.map((_,i)=>i+1),p.path);
  if(!p.path.includes('blue-boy-planet'))assert.doesNotMatch(p.html,/class="side-cta"/);
 }
});

test('a partial English BBP cannot surface as a full translation and leaves NL and legacy links usable',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'ec-partial-translation-'));
 try{
  for(const dir of ['scripts','src','admin','content','tests'])await cp(join(root,dir),join(temp,dir),{recursive:true});
  const file=join(temp,'content/en/tracks/blue-boy-planet.json');const en=JSON.parse(await read(file));en.journey='';await writeFile(file,JSON.stringify(en));
  execFileSync(process.execPath,[join(temp,'scripts/build.mjs')],{cwd:temp});
  await assert.rejects(access(join(temp,'dist/en/tracks/blue-boy-planet/index.html')));
  const nl=await read(join(temp,'dist/nl/composities/blue-boy-planet/index.html'));assert.doesNotMatch(nl,/hreflang="en"/);
  assert.match(await read(join(temp,'dist/_redirects')),/\/track-blue-boy-planet.html \/nl\/composities\/blue-boy-planet\/ 301!/);
  assert.doesNotMatch(await read(join(temp,'dist/en/index.html')),/href="\/en\/tracks\/blue-boy-planet\//);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('review fixes: one preference launcher, explicit independent opt-ins, back to top and no emoji arrows',()=>{
  for(const p of pages){
    assert.equal((p.html.match(/data-cookie-settings/g)||[]).length,1,p.path);
    assert.match(p.html,/data-consent="rejected"/);assert.match(p.html,/data-consent="custom"/);assert.match(p.html,/data-consent="accepted"/);
    assert.match(p.html,/id="consent-analytics" type="checkbox">/);assert.match(p.html,/id="consent-media" type="checkbox">/);
    assert.match(p.html,/class="back-to-top" href="#top"/);assert.doesNotMatch(p.html,/↗/);
    assert.doesNotMatch(p.html,/<(?:img|script|iframe)[^>]+src="https:\/\//);
    assert.doesNotMatch(p.html,/url\(['"]?https:\/\//);
  }
  for(const path of ['/nl/composities/','/en/tracks/']){
    const html=pages.find(p=>p.path===path).html;
    assert.equal((html.match(/class="related-img card-play"/g)||[]).length,10);
    assert.equal((html.match(/class="preview-play"/g)||[]).length,10);
    assert.equal((html.match(/class="track-detail-link"/g)||[]).length,10);
  }
});


test('obsolete root pages and their scripts are absent; all current pages still exist',async()=>{
  assert.deepEqual((await readdir(root)).filter(name=>name.endsWith('.html')),[]);
  assert.deepEqual((await readdir(out)).filter(name=>name.endsWith('.html')),[]);
  for(const name of ['style.css','search.js','README_V7_1_4_PLAYBUTTON_README_CLEANUP.txt']){await assert.rejects(access(join(root,name)));await assert.rejects(access(join(out,name)));}
  assert.equal(manifest.legacyRoutesPreserved,15);
  for(const p of manifest.pages)await access(join(out,p.path,'index.html'));
  await access(join(out,'admin/index.html'));
});
