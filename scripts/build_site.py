#!/usr/bin/env python3
"""Build NL review pages from Pages CMS JSON, never deploy or modify main."""
from __future__ import annotations
import argparse, html, json, re, shutil, sys
from pathlib import Path
from urllib.parse import urlparse
from jinja2 import Environment, FileSystemLoader, select_autoescape
import mistune
from bs4 import BeautifulSoup

BASE=Path(__file__).resolve().parents[1]
TEMPLATE=BASE/'studio/templates'
RECORDS=BASE/'content/tracks/nl'
MEDIA=BASE/'studio/media'
MARKDOWN=mistune.create_markdown(escape=True,plugins=['strikethrough'])

def plain(value:object)->str:
    return str(value or '').strip()

def render_markdown(value:object)->str:
    return MARKDOWN(plain(value))

def safe_slug(slug:str)->str:
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):
        raise ValueError(f'Onveilige slug: {slug!r}')
    return slug

def resolve_media(path:str)->str:
    # The NL page is located at /nl/track-<slug>/index.html.
    if path.startswith('/media/'):
        if '..' in Path(path).parts: raise ValueError('Media path traversal forbidden')
        return '../../media/'+path.removeprefix('/media/')
    if path.startswith(('https://','http://')): return path
    raise ValueError(f'Ongeldige media-URL: {path!r}')

def make_context(data:dict)->dict:
    slug=safe_slug(data['slug'])
    title=plain(data['title'])
    if not title:raise ValueError('Titel is verplicht')
    first,*rest=title.split(' ')
    last=' '.join(rest)
    if not last:first,last=title,''
    ctx={**data,'title_first':first,'title_last':last,
         'intro_html':render_markdown(data.get('intro','')).removeprefix('<p>').removesuffix('</p>\n'),
         'story_html':render_markdown(data.get('story','')),
         'journey_html':render_markdown(data.get('journey','')),
         'orchestration_html':render_markdown(data.get('orchestration','')),
         'instrumentation_html':render_markdown(data.get('instrumentation','')),
         'performance_html':render_markdown(data.get('performance','')),
         'canonical':f'https://expeditioncreativity.com/nl/track-{slug}/',
         'og_image':'https://expeditioncreativity.com'+data['hero_image'],
         'tags':[x.strip() for x in plain(data.get('genre','')).split('·') if x.strip()]+[str(data.get('year','')),plain(data.get('duration',''))]}
    ctx['gallery']=[{**g,'src':resolve_media(g['image'])} for g in data.get('gallery',[]) if g.get('image')]
    ctx['related']=[{**r,'href':f'https://expeditioncreativity.com/track-{safe_slug(r["slug"])}',
      'thumbnail':f'https://i.ytimg.com/vi/{r["youtube_id"]}/hqdefault.jpg'} for r in data.get('related',[]) if r.get('youtube_id')]
    json_ld={'@context':'https://schema.org','@type':'MusicComposition','name':title,
     'composer':{'@type':'Person','name':plain(data.get('composer'))},
     'genre':plain(data.get('genre')),'inLanguage':'nl-BE',
     'url':ctx['canonical'],'description':plain(data.get('seo_description'))}
    ctx['json_ld']=json.dumps(json_ld,ensure_ascii=False).replace('</','<\\/')
    return ctx

def build(output:Path, include_drafts:bool=True)->list[Path]:
    output=output.resolve()
    output.mkdir(parents=True,exist_ok=True)
    shutil.copytree(BASE/'studio/assets',output/'assets',dirs_exist_ok=True)
    shutil.copytree(MEDIA,output/'media',dirs_exist_ok=True)
    env=Environment(loader=FileSystemLoader(TEMPLATE),autoescape=select_autoescape(['html']))
    template=env.get_template('track_nl.html')
    built=[]
    for file in sorted(RECORDS.glob('*.json')):
        data=json.loads(file.read_text(encoding='utf-8'))
        if data.get('locale') not in ('nl','nl-BE'):raise ValueError(f'Ongeldige taal in {file}')
        if not include_drafts and data.get('status')!='published':continue
        ctx=make_context(data)
        assets={'css':'../../assets/track.css','logo':'../../media/expedition-creativity-original-logo.webp',
                'hero_image':resolve_media(data['hero_image'])}
        page=template.render(page=ctx,assets=assets)
        # Omit optional sections when fields are intentionally empty.
        soup=BeautifulSoup(page,'html.parser')
        for key,empty in [('partituren',not plain(data.get('performance'))),('achter-de-partituur',not ctx['gallery']),('orkestratie',not plain(data.get('orchestration')) and not plain(data.get('instrumentation')) )]:
            if empty:
                section=soup.find(id=key)
                if section:section.decompose()
                for a in soup.select(f'a[href="#{key}"]'):
                    if a.parent and 'sidecard' in a.parent.get('class',[]):a.decompose()
        if not ctx['related']:
            sec=soup.find(id='meer-muziek')
            if sec:sec.decompose()
        dest=output/'nl'/f'track-{data["slug"]}'/'index.html'
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text('<!doctype html>\n'+str(soup),encoding='utf-8')
        built.append(dest)
    return built

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=BASE/'preview')
    args=parser.parse_args()
    outputs=build(args.output)
    for out in outputs:print(out)
    if not outputs:raise SystemExit('Geen NL-content gevonden')