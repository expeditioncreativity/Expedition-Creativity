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

test('17 Dutch pages are built, with Dutch document language and no unresolved slots',()=>{
  assert.equal(pages.length,17);
  for(const p of pages){assert.match(p.html,/<html lang="nl">/);assert.doesNotMatch(p.html,/\{\{[A-Z_]+\}\}/);assert.match(p.html,/<h1>/);assert.equal((p.html.match(/<h1>/g)||[]).length,1);}
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
  const config=await read(join(root,'admin/config.yml'));assert.match(config,/branch: development\/nl-design-cms/);assert.match(config,/publish_mode: editorial_workflow/);assert.match(config,/filter: \{field: approved, value: false\}/);assert.doesNotMatch(config,/branch: main/);assert.match(await read(join(root,'admin/index.html')),/decap-cms@3\.17\.3/);assert.match(await read(join(root,'admin/index.html')),/integrity="sha384-/);
});
test('no untranslated English routes or fictitious alternates are generated',async()=>{
  assert.ok(pages.every(p=>p.path.startsWith('/nl/')));
  for(const p of pages)assert.doesNotMatch(p.html,/hreflang="en|href="\/en\//);
  await assert.rejects(access(join(out,'en')));
});
test('a new CMS composition reaches its page, search index, catalogue and sitemap; drafts stay hidden',async()=>{
  const temp=await mkdtemp(join(tmpdir(),'ec-content-test-'));
  try {
    for(const dir of ['scripts','src','admin','content','tests'])await cp(join(root,dir),join(temp,dir),{recursive:true});
    const fixture={...tracks[0],title:'Testcompositie',slug:'testcompositie',approved:false,intro:'Een **nieuw** muzikaal verhaal.',sections:[{id:'verhaal',title:'Het verhaal',body:'### Een begin\n\nEen **origineel** thema.'}],status:'published'};
    await writeFile(join(temp,'content/tracks/testcompositie.json'),JSON.stringify(fixture));
    await writeFile(join(temp,'content/tracks/concept.json'),JSON.stringify({...fixture,slug:'concept',status:'draft'}));
    execFileSync(process.execPath,[join(temp,'scripts/build.mjs')],{cwd:temp});
    for(const path of ['nl/composities/testcompositie/index.html','nl/composities/index.html','sitemap.xml','assets/search-index.json'])assert.match(await read(join(temp,'dist',path)),/testcompositie/);
    assert.match(await read(join(temp,'dist/nl/composities/testcompositie/index.html')),/<strong>nieuw<\/strong>/);
    await assert.rejects(access(join(temp,'dist/nl/composities/concept/index.html')));
    assert.doesNotMatch(await read(join(temp,'dist/assets/search-index.json')),/\/concept\//);
  } finally {await rm(temp,{recursive:true,force:true});}
});
