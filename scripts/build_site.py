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
    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', plain(data.get('youtube_id'))):
        raise ValueError('YouTube video-ID moet 11 geldige tekens bevatten')
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
    for related in data.get('related',[]):
        if not re.fullmatch(r'[A-Za-z0-9_-]{11}',plain(related.get('youtube_id'))):
            raise ValueError('Ongeldige YouTube video-ID in verwante track')
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
    if (BASE/'studio/assets/site.css').is_file(): shutil.copy2(BASE/'studio/assets/site.css',output/'assets/site.css')
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
        page=template.render(page=ctx,assets=assets,nav={'home':'/nl/','tracks':'/nl/tracks/','about':'/nl/over/','timeline':'/nl/tijdlijn/','behind':'/nl/achter-de-muziek/','contact':'/nl/contact/'})
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
    # Staged NL pages: general site content is an editable record, track metadata is sourced from the existing catalogue.
    site_file=BASE/'content/site/nl.json'
    catalogue_file=BASE/'content/site/catalogue.json'
    if site_file.exists() and catalogue_file.exists():
        site=json.loads(site_file.read_text(encoding='utf-8'))
        catalogue=json.loads(catalogue_file.read_text(encoding='utf-8'))['tracks']
        for track in catalogue:
            safe_slug(track['slug'])
            track['thumb']='https://i.ytimg.com/vi/'+track['youtube_id']+'/hqdefault.jpg'
            track['href']=('/nl/track-'+track['slug']+'/' if (output/'nl'/('track-'+track['slug'])/'index.html').exists() else 'https://expeditioncreativity.com/track-'+track['slug'])
        catalogue.sort(key=lambda a: (-int(a['year']),a['title'].casefold()))
        nav={'home':'/nl/','tracks':'/nl/tracks/','about':'/nl/over/','timeline':'/nl/tijdlijn/','behind':'/nl/achter-de-muziek/','contact':'/nl/contact/','policy':'/nl/cookiebeleid/','blueboy':'/nl/track-blue-boy-planet/'}
        setups=[('home_nl.html',output/'nl'/'index.html','ec-home',site['home_seo_title'],site['home_seo_description'],'https://expeditioncreativity.com/nl/','../',catalogue[:3]),
                ('tracks_nl.html',output/'nl'/'tracks'/'index.html','ec-tracks',site['tracks_seo_title'],site['tracks_seo_description'],'https://expeditioncreativity.com/nl/tracks/','../../',catalogue)]
        for template_name,dest,body_class,seo_title,seo_description,canonical,prefix,featured in setups:
            dest.parent.mkdir(parents=True,exist_ok=True)
            markup=env.get_template(template_name).render(content=site,catalogue=catalogue,featured=featured,
                body_class=body_class,seo_title=seo_title,seo_description=seo_description,canonical=canonical,
                nav=nav,years=sorted({int(x['year']) for x in catalogue},reverse=True),prefix=prefix)
            dest.write_text(markup,encoding='utf-8')
            built.append(dest)
        # Other editorial pages use their own CMS-editable Dutch content records.
        editorials=[('over','over_nl.html','over_nl.json','ec-editorial',['story','purpose']),
                    ('tijdlijn','tijdlijn_nl.html','tijdlijn_nl.json','ec-editorial',[]),
                    ('achter-de-muziek','achter_nl.html','achter_nl.json','ec-editorial',['process','tools']),
                    ('contact','contact_nl.html','contact_nl.json','ec-editorial',['score_body','collaboration_body']),
                    ('cookiebeleid','cookies_nl.html','cookies_nl.json','ec-editorial',['body'])]
        for slug,template_name,json_name,body_class,markdown_fields in editorials:
            data=json.loads((BASE/'content/site'/json_name).read_text(encoding='utf-8'))
            for field in markdown_fields:
                data[field.replace('_body','')+'_html']=render_markdown(data.get(field,''))
            year_groups=[]
            for year in sorted({int(t['year']) for t in catalogue},reverse=True):
                year_groups.append({'year':year,'tracks':[t for t in catalogue if int(t['year'])==year]})
            dest=output/'nl'/slug/'index.html'
            dest.parent.mkdir(parents=True,exist_ok=True)
            markup=env.get_template(template_name).render(page=data,content=site,body_class=body_class,
                seo_title=data['seo_title'],seo_description=data['seo_description'],
                canonical='https://expeditioncreativity.com/nl/'+slug+'/',
                nav=nav,prefix='../../',year_groups=year_groups)
            dest.write_text(markup,encoding='utf-8')
            built.append(dest)
    return built

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=BASE/'preview')
    args=parser.parse_args()
    outputs=build(args.output)
    for out in outputs:print(out)
    if not outputs:raise SystemExit('Geen NL-content gevonden')