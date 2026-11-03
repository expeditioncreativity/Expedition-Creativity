from pathlib import Path
import base64, mimetypes
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'preview/nl/track-blue-boy-planet/index.html'
soup=BeautifulSoup(HTML.read_text(),'html.parser')
assert soup.html['lang']=='nl-BE'
assert soup.select_one('meta[name="robots"]')['content']=='noindex,nofollow'
assert soup.select_one('meta[name="description"]')['content'].startswith('Ontdek Blue Boy Planet')
assert soup.select_one('link[rel="canonical"]')['href']=='https://expeditioncreativity.com/nl/track-blue-boy-planet/'
assert soup.select_one('meta[property="og:image"]')
assert len(soup.select('#meer-muziek .related-img img')) == 2
assert 'Tonen die doen denken aan vallende sterren' in soup.get_text(' ',strip=True)
assert 'partituur is op aanvraag beschikbaar' in soup.get_text(' ',strip=True)
ids={el.get('id') for el in soup.select('[id]')}
for link in soup.select('a[href^="#"]'):
 h=link.get('href','#')[1:]
 assert not h or h in ids, f'Broken anchor {h}'
for img in soup.select('img[src^="../../media/"]'):
 path=HTML.parent / img['src']
 assert path.resolve().is_file(),f'missing image {path}'
css=HTML.parent/'../../assets/track.css'
assert css.resolve().is_file()
print('Passed: schema metadata, noindex safety, sections, assets, internal anchors, real thumbnails')
render_html=HTML.read_text()
render_html=render_html.replace('<link href="../../assets/track.css" rel="stylesheet"/>','<style>'+css.resolve().read_text()+'</style>')
for img in (ROOT/'preview/media').glob('*'):
    mime=mimetypes.guess_type(img)[0] or 'image/webp'
    data='data:'+mime+';base64,'+base64.b64encode(img.read_bytes()).decode()
    render_html=render_html.replace('../../media/'+img.name,data)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for name,w,h in [('desktop',1440,900),('mobile',390,844)]:
  page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.route('**/*',lambda route: route.abort())
  page.set_content(render_html,wait_until='domcontentloaded',timeout=15000)
  page.screenshot(path=str(ROOT/f'{name}_preview_top.png'))
  page.screenshot(path=str(ROOT/f'{name}_preview_full.png'),full_page=True)
  overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
  imgs=page.locator('img')
  print(name,'height',page.locator('body').evaluate('(el) => el.scrollHeight'),'overflow',overflow,'remote thumbnails blocked in offline QA',page.evaluate("Array.from(document.images).filter(i=>!i.complete || i.naturalWidth === 0).filter(i=>i.src.startsWith('https:')).length"),'js errors',errs)
  assert not overflow, f'{name}: horizontal overflow'
  if name=='mobile':
   page.locator('#menu-toggle').click()
   assert page.locator('#nav-links').evaluate('x=>x.classList.contains("open")')
   page.locator('#menu-toggle').click()
   assert not page.locator('#nav-links').evaluate('x=>x.classList.contains("open")')
  page.locator('[data-lightbox]').first.click()
  assert page.locator('dialog#lightbox').evaluate('(x)=>x.open')
  page.locator('#lightbox-close').click()
  assert not page.locator('dialog#lightbox').evaluate('(x)=>x.open')
  assert not errs, errs
  page.close()
 b.close()
print('Passed: desktop/mobile visual QA, responsive width, mobile menu, lightbox')