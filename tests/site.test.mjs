import test from 'node:test';
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
      const url=new URL(value,'https://example.test');const target=join(out,url.pathname,extname(url.pathname)?'':'index.html');
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
  for(const section of approved.sections)assert.ok(page.includes(section.body.replaceAll('https://expeditioncreativity.com/contact','/nl/contact/')),section.title);
});
test('existing tracked website pages, CSS, search and media remain byte-for-byte unchanged',async()=>{
  const names=execFileSync('git',['ls-tree','-r','--name-only','0dd6134ac3022fb0a3f50fa45171368319631e76'],{cwd:root,encoding:'utf8'}).trim().split('\n');
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
test('CMS writes only to development, excludes approved text and pins its script',async()=>{
  const config=await read(join(root,'admin/config.yml'));assert.match(config,/branch: development\/nl-design-cms/);assert.match(config,/publish_mode: editorial_workflow/);assert.match(config,/filter:\s+field: approved\s+value: false/);assert.doesNotMatch(config,/branch: main/);assert.match(await read(join(root,'admin/index.html')),/decap-cms@3\.17\.3/);assert.match(await read(join(root,'admin/index.html')),/integrity="sha384-/);
});
test('language alternates point to existing matching pages in both directions',()=>{
  for(const p of pages){
    const alternates=[...p.html.matchAll(/hreflang="(nl|en)" href="https:\/\/expeditioncreativity.com([^"]+)"/g)];
    assert.equal(alternates.length,2,p.path);
    for(const [,lang,path] of alternates){assert.ok(path.startsWith('/'+lang+'/'));assert.ok(pages.some(x=>x.path===path),path);}
  }
});
test('English track narrative matches the original published website paragraphs',async()=>{
  for(const t of tracks){
    const source=await read(join(root,`track-${t.slug}.html`));
    const story=source.split('<h2>The Story</h2>')[1].split('<div class="track-card-tags')[0];
    const english=pages.find(p=>p.path===`/en/tracks/${t.slug}/`).html;
    for(const paragraph of story.match(/<p>.*?<\/p>/gs)||[])assert.ok(english.includes(paragraph),t.slug);
  }
});
test('a new CMS composition reaches its page, search index, catalogue and sitemap; drafts stay hidden',async()=>{
  const temp=await mkdtemp(join(tmpdir(),'ec-content-test-'));
  try {
    for(const dir of ['scripts','src','admin','content','tests'])await cp(join(root,dir),join(temp,dir),{recursive:true});
    const fixture={...tracks[0],title:'Testcompositie',slug:'testcompositie',approved:false,intro:'Een **nieuw** muzikaal verhaal.',sections:undefined,story:'### Een begin\n\nEen **origineel** thema.',journey:'Een reis.',instrumentation:'Hoorn en strijkers.',performance:{availability:'unspecified',contact_cta:false},behind:'Een schets.',gallery:[{image:tracks[0].image,alt:'Testbeeld',caption:'Testonderschrift'}],status:'published'};
    await writeFile(join(temp,'content/tracks/testcompositie.json'),JSON.stringify(fixture));
    await writeFile(join(temp,'content/tracks/concept.json'),JSON.stringify({...fixture,slug:'concept',status:'draft'}));
    await writeFile(join(temp,'content/en/tracks/testcompositie.json'),JSON.stringify({title:'Test composition',slug:'testcompositie',world:'Space',type:'Orchestral music',status:'published',intro:'An **original** story.',story:'A new **beginning**.'}));
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

import {trackSections,validateEditorial} from '../scripts/track-content.mjs';
const render=(t,lang='nl')=>trackSections(t,lang,{markdown,escapeHtml});
test('migration retains all existing section text, ordering, media, metadata and SEO',async()=>{
 for(const folder of ['content/tracks','content/en/tracks'])for(const file of await readdir(`${root}/${folder}`)){
  const path=`${folder}/${file}`;
  const before=JSON.parse(execFileSync('git',['show',`4192984ad07417ef6eff25d781e10e192ecda27a:${path}`],{cwd:root,encoding:'utf8'}));
  const after=JSON.parse(await readFile(`${root}/${path}`,'utf8'));
  for(const [key,value] of Object.entries(before))if(key!=='sections')assert.deepEqual(after[key],value,`${path}: ${key}`);
  assert.deepEqual(render(after,folder.includes('/en/')?'en':'nl').map(({id,title,body})=>({id,title,body})),before.sections||[],path);
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
