from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import mimetypes,base64
ROOT=Path(__file__).resolve().parents[1]
for location in ['nl/index.html','nl/tracks/index.html']:
 p=ROOT/'preview'/location
 soup=BeautifulSoup(p.read_text(),'html.parser')
 assert soup.html['lang']=='nl-BE'
 assert soup.select_one('meta[name="robots"]')['content']=='noindex,nofollow'
 assert soup.select_one('meta[property="og:title"]')
 assert soup.select_one('link[rel="canonical"]')
 assert len(soup.select('.site-track-card')) >= 3
 print('Schema / card check passed:',location)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for location,name in [('nl/index.html','home'),('nl/tracks/index.html','tracks')]:
  file=ROOT/'preview'/location
  raw=file.read_text()
  prefix='../' if name=='home' else '../../'
  for cssname in ['track.css','site.css']:
   raw=raw.replace(f'<link rel="stylesheet" href="{prefix}assets/{cssname}">',f'<style>{(ROOT/"studio/assets"/cssname).read_text()}</style>')
  for img in (ROOT/'studio/media').glob('*'):
   data='data:image/webp;base64,'+base64.b64encode(img.read_bytes()).decode()
   raw=raw.replace(prefix+'media/'+img.name,data)
  for mode,w,h in [('desktop',1440,900),('mobile',390,844)]:
   page=b.new_page(viewport={'width':w,'height':h})
   errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
   page.route('**/*',lambda route:route.abort())
   page.set_content(raw,wait_until='domcontentloaded')
   page.screenshot(path=str(ROOT/f'{name}_{mode}_preview.png'))
   assert not page.evaluate('document.documentElement.scrollWidth > innerWidth+1'),f'{name}-{mode} overflow'
   if mode=='mobile':
    page.locator('#menu-toggle').click()
    assert page.locator('#nav-links').evaluate('x=>x.classList.contains("open")')
   if name=='tracks':
    assert page.locator('.site-track-card:visible').count()==10
    page.locator('#track-search').fill('blue boy')
    assert page.locator('.site-track-card:visible').count()==1
    page.locator('#track-search').fill('')
    page.locator('#track-year').select_option('2024')
    assert page.locator('.site-track-card:visible').count()==2
   assert not errors,errors
   print(name,mode,'OK',page.locator('body').evaluate('(x)=>x.scrollHeight'))
   page.close()
 b.close()