(() => {
  const $ = s => document.querySelector(s);
  const toggle=$('#menu-toggle'), links=$('#nav-links');
  function closeMenu(){links?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open het navigatiemenu');}
  toggle?.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Sluit het navigatiemenu':'Open het navigatiemenu');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  links?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  const play=$('#play-video'), player=$('#player');
  if(play && player){
    const video=play.dataset.video;
    const fallback=document.createElement('a');fallback.href=`https://www.youtube.com/watch?v=${encodeURIComponent(video)}`;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.className='video-fallback';fallback.textContent='Bekijk rechtstreeks op YouTube ↗';player.parentElement.append(fallback);
    play.addEventListener('click',()=>{
      const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}?autoplay=1&rel=0`;iframe.title=play.getAttribute('aria-label');iframe.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.style.cssText='border:0;position:absolute;inset:0;width:100%;height:100%;z-index:4';player.replaceChildren(iframe);track('video_play',{video_id:video});
    });
  }
  const lightbox=$('#lightbox');
  document.querySelectorAll('[data-lightbox]').forEach(btn=>btn.addEventListener('click',()=>{const image=$('#lightbox-image');image.src=btn.dataset.lightbox;image.alt=btn.querySelector('img')?.alt||'';$('#lightbox-caption').textContent=btn.dataset.caption||'';lightbox.showModal();}));
  $('#lightbox-close')?.addEventListener('click',()=>lightbox.close());lightbox?.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
  const sideLinks=[...document.querySelectorAll('.sidecard a[href^="#"]')];
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.filter(entry=>entry.isIntersecting).forEach(entry=>sideLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))),{rootMargin:'-25% 0px -63% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));}
  const grid=$('#composition-grid'),form=$('.filters');
  const fold=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(grid && form){
    const cards=[...grid.children];const params=new URLSearchParams(location.search);
    [...form.elements].filter(el=>el.name).forEach(el=>{if(params.has(el.name))el.value=params.get(el.name);});
    function filter(){const query=fold($('#query').value.trim()),year=$('#year').value,world=$('#world').value,type=$('#type').value,sort=$('#sort').value||'newest';let count=0;
      cards.sort((a,b)=>sort==='title'?a.dataset.title.localeCompare(b.dataset.title,'nl'):sort==='oldest'?Number(a.dataset.order)-Number(b.dataset.order):Number(b.dataset.order)-Number(a.dataset.order)).forEach(card=>{const d=card.dataset;card.hidden=!(!query||fold(`${d.title} ${d.world} ${d.type} ${d.year}`).includes(query))||Boolean(year&&d.year!==year)||Boolean(world&&d.world!==world)||Boolean(type&&d.type!==type);if(!card.hidden)count++;grid.append(card);});
      $('#result-count').textContent=`${count} ${count===1?'compositie':'composities'}`;$('#empty-results').hidden=count!==0;
      const next=new URLSearchParams();new FormData(form).forEach((value,key)=>{if(value && !(key==='volgorde'&&value==='newest'))next.set(key,value);});history.replaceState(null,'',location.pathname+(next.size?'?'+next:'')+location.hash);
    }
    form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('reset',()=>setTimeout(filter,0));filter();
  }
  const KEY='ec_cookie_consent_v1',dialog=$('#cookie-dialog');let gaLoaded=false;
  const consent=()=>{try{return localStorage.getItem(KEY);}catch{return null;}};
  const production=()=>document.body.dataset.siteMode==='production' && location.hostname==='expeditioncreativity.com';
  function loadAnalytics(){if(gaLoaded||!production()||consent()!=='accepted')return;gaLoaded=true;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id=G-G9HM3R866P';document.head.append(script);window.gtag('js',new Date());window.gtag('config','G-G9HM3R866P');}
  function track(name,params){if(production()&&consent()==='accepted'&&gaLoaded)window.gtag?.('event',name,params);}
  document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
  document.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.consent;try{localStorage.setItem(KEY,value);}catch{}window['ga-disable-G-G9HM3R866P']=value!=='accepted';if(value!=='accepted'){window.gtag?.('consent','update',{analytics_storage:'denied'});document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(n=>n==='_ga'||n.startsWith('_ga_')).forEach(name=>{for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=`${name}=; Max-Age=0; path=/;${domain?' domain='+domain+';':''} SameSite=Lax`;});}else{window.gtag?.('consent','update',{analytics_storage:'granted'});loadAnalytics();}dialog.close();}));
  document.addEventListener('click',event=>{const a=event.target.closest('a');if(!a)return;if(a.href.startsWith('mailto:'))track('email_click',{link_url:a.href});else if(a.href.includes('youtube.com'))track('youtube_click',{link_url:a.href});else if(a.href.includes('linkedin.com'))track('linkedin_click',{link_url:a.href});});
  if(!consent()&&production())dialog.showModal();loadAnalytics();
})();
