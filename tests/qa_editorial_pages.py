from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import base64
ROOT=Path(__file__).resolve().parents[1]
ids=['over','tijdlijn','achter-de-muziek','contact','cookiebeleid']
for slug in ids:
    f=ROOT/'preview/nl'/slug/'index.html'
    assert f.exists(),f
    soup=BeautifulSoup(f.read_text(),'html.parser')
    assert soup.html['lang']=='nl-BE'
    assert soup.select_one('meta[name=robots]')['content']=='noindex,nofollow'
    assert soup.select_one('link[rel=canonical]')
    assert soup.select_one('meta[name=description]')
    assert soup.select_one('h1')
    for internal in soup.select('nav a[href^="/nl/"]'):
        href=internal.get('href','').strip('/')
        testpath=ROOT/'preview'/href/'index.html'
        assert testpath.is_file(),(slug,href)
    print('PASS static',slug)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for slug in ids:
        f=ROOT/'preview/nl'/slug/'index.html'
        raw=f.read_text(encoding='utf-8')
        for cssname in ['track.css','site.css']:
            raw=raw.replace(f'<link rel="stylesheet" href="../../assets/{cssname}">',f'<style>{(ROOT/"studio/assets"/cssname).read_text()}</style>')
        for img in (ROOT/'studio/media').glob('*.webp'):
            data='data:image/webp;base64,'+base64.b64encode(img.read_bytes()).decode()
            raw=raw.replace('../../media/'+img.name,data)
        for mode,w,h in [('desktop',1440,900),('mobile',390,844)]:
            page=browser.new_page(viewport={'width':w,'height':h})
            errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
            page.route('**/*',lambda route:route.abort())
            page.set_content(raw,wait_until='domcontentloaded')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'),slug+' '+mode+' overflow'
            if mode=='mobile':
                page.locator('#menu-toggle').click()
                assert page.locator('#nav-links').evaluate('x=>x.classList.contains("open")')
            page.screenshot(path=str(ROOT/f'editorial_{slug}_{mode}.png'))
            assert not errors,(slug,errors)
            print('PASS visual',slug,mode,'height',page.locator('body').evaluate('(x)=>x.scrollHeight'))
            page.close()
    browser.close()