import {readConsent,saveConsent,deniedConsent,analyticsAllowed,analyticsCookieNames} from './privacy.js';
(() => {
  const $ = s => document.querySelector(s);
  const en=document.documentElement.lang==='en';
  // Browser fragments survive legacy HTTP redirects; route former homepage sections.
  if(location.pathname==='/en/'){
    const destination={'#contact':'/en/contact/','#behind':'/en/behind-the-score/','#journey':'/en/about/'}[location.hash];
    if(destination){location.replace(destination+location.search);return;}
  }
  if(location.pathname.startsWith('/en/tracks/')&&location.hash==='#watch')location.hash='luisteren';
  const ui=(nl,english)=>en?english:nl;
  document.querySelectorAll('.brand-logo').forEach(image=>{
    const fallback=()=>{if(!image.dataset.fallback){image.dataset.fallback='true';image.src='/footer-logo.png';}};
    image.addEventListener('error',fallback);if(image.complete&&!image.naturalWidth)fallback();
  });
  const carousel=$('#track-carousel');
  if(carousel){
    const pause=$('[data-carousel-pause]'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let manualPause=false,hover=false,focus=false,timer;
    function advance(direction=1){const step=carousel.firstElementChild.getBoundingClientRect().width+22;const end=carousel.scrollWidth-carousel.clientWidth;const next=carousel.scrollLeft+step*direction;carousel.scrollTo({left:next>end+2?0:next<0?end:next,behavior:reduced.matches?'instant':'smooth'});}
    function schedule(){clearInterval(timer);if(!manualPause&&!hover&&!focus&&!reduced.matches&&!document.hidden)timer=setInterval(()=>advance(),5000);}
    $('[data-carousel-prev]')?.addEventListener('click',()=>{advance(-1);schedule();});$('[data-carousel-next]')?.addEventListener('click',()=>{advance();schedule();});
    pause?.addEventListener('click',()=>{manualPause=!manualPause;pause.setAttribute('aria-pressed',String(manualPause));pause.textContent=manualPause?ui('Hervatten','Resume'):ui('Pauzeren','Pause');schedule();});
    carousel.addEventListener('mouseenter',()=>{hover=true;schedule();});carousel.addEventListener('mouseleave',()=>{hover=false;schedule();});carousel.addEventListener('focusin',()=>{focus=true;schedule();});carousel.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget)){focus=false;schedule();}});
    carousel.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}});
    document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);schedule();
  }
  const toggle=$('#menu-toggle'), links=$('#nav-links');
  function closeMenu(){links?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label',ui('Open het navigatiemenu','Open navigation menu'));}
  toggle?.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?ui('Sluit het navigatiemenu','Close navigation menu'):ui('Open het navigatiemenu','Open navigation menu'));});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  links?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  // Only the consented player connects to YouTube. Card playback stays on this page.
  let choice;try{choice=readConsent(localStorage);}catch{choice=deniedConsent();}
  const privacyDialog=$('#cookie-dialog'),videoDialog=$('#video-dialog');
  const inlinePlayer=$('#player'),inlinePoster=inlinePlayer?.innerHTML;
  let ytPromise,activePlayer,activeSlot,pendingVideo,playToken=0,fallbackTimer,stallTimer,gaLoaded=false;
  const externalIcon='<svg class="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  function clearAnalyticsCookies(){for(const name of analyticsCookieNames(document.cookie))for(const domain of ['',location.hostname,'.'+location.hostname])for(const path of ['/','/nl','/en','/nl/','/en/'])document.cookie=`${name}=; Max-Age=0; path=${path};${domain?' domain='+domain+';':''} SameSite=Lax`;}
  function openPrivacy(forVideo=false){$('#consent-analytics').checked=choice.analytics;$('#consent-media').checked=choice.media;$('#cookie-video-request').hidden=!forVideo;if(!privacyDialog.open)privacyDialog.showModal();}
  function controls(slot){return slot===inlinePlayer?$('#inline-video-controls'):videoDialog.querySelector('.video-controls');}
  function stopVideo(){playToken++;clearTimeout(fallbackTimer);clearTimeout(stallTimer);activePlayer?.destroy?.();activePlayer=null;if(activeSlot===inlinePlayer&&inlinePlayer)inlinePlayer.innerHTML=inlinePoster;if(activeSlot&&activeSlot!==inlinePlayer)activeSlot.replaceChildren();activeSlot=null;}
  function playerAPI(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(!ytPromise)ytPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');let timeout;const failed=()=>{clearTimeout(timeout);script.remove();ytPromise=null;reject(Error('Video unavailable'));};window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);resolve(window.YT);};script.src='https://www.youtube.com/iframe_api';script.dataset.mediaApi='true';script.onerror=failed;timeout=setTimeout(failed,10000);document.head.append(script);});
    return ytPromise;
  }
  async function startVideo(video,slot){
    if(!choice.media){pendingVideo={video,slot};$('#consent-video-external').href=`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;openPrivacy(true);return;}
    stopVideo();activeSlot=slot;const token=playToken;const panel=controls(slot),status=panel.querySelector('[data-video-status]'),sound=panel.querySelector('[data-video-sound]'),retry=panel.querySelector('[data-video-retry]');
    sound.hidden=true;retry.hidden=true;status.textContent=ui('Video laden…','Loading video…');
    panel.querySelector('.video-fallback').href=`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
    if(slot!==inlinePlayer){$('#video-title').textContent=video.title;if(!videoDialog.open)videoDialog.showModal();}
    try{
      const YT=await playerAPI();if(token!==playToken||!choice.media)return;
      const mount=document.createElement('div');slot.replaceChildren(mount);
      function mutedFallback(event){if(token!==playToken||!choice.media)return;event.target.mute();event.target.playVideo();sound.hidden=false;status.textContent=ui('Je browser start zonder geluid. Zet het geluid aan om te luisteren.','Your browser starts playback muted. Turn sound on to listen.');}
      activePlayer=new YT.Player(mount,{host:'https://www.youtube-nocookie.com',videoId:video.id,width:'100%',height:'100%',playerVars:{autoplay:1,playsinline:1,rel:0,origin:location.origin},events:{
        onReady:event=>{if(token!==playToken||!choice.media){event.target.destroy();return;}event.target.playVideo();stallTimer=setTimeout(()=>{if(token===playToken&&event.target.getCurrentTime()===0){status.textContent=ui('De video start nog niet. Probeer opnieuw of open de video op YouTube.','The video has not started. Retry or open it on YouTube.');retry.hidden=false;}},12000);fallbackTimer=setTimeout(()=>{if(token===playToken&&event.target.getPlayerState()!==1)mutedFallback(event);},1800);},
        onAutoplayBlocked:mutedFallback,
        onStateChange:event=>{if(token!==playToken)return;if(event.data===1){clearTimeout(fallbackTimer);retry.hidden=true;const muted=event.target.isMuted();sound.hidden=!muted;if(!muted)status.textContent=ui('Video wordt afgespeeld.','Video is playing.');}},
        onError:()=>{status.textContent=ui('Afspelen lukt hier niet. Open de video op YouTube.','Playback is unavailable here. Open the video on YouTube.');retry.hidden=false;}
      }});
      sound.onclick=()=>{activePlayer?.unMute();activePlayer?.playVideo();sound.hidden=true;status.textContent=ui('Geluid ingeschakeld.','Sound enabled.');};
      retry.onclick=()=>{activePlayer?.playVideo();};
      track('video_play',{video_id:video.id});
    }catch{status.textContent=ui('De video kon niet laden. Open de video op YouTube.','The video could not load. Open the video on YouTube.');}
  }
  function requestVideo(event){const button=event.target.closest('[data-video]');if(!button)return;const slot=button.id==='play-video'?inlinePlayer:$('#dialog-player');startVideo({id:button.dataset.video,title:button.dataset.videoTitle||button.getAttribute('aria-label')},slot);}
  document.addEventListener('click',requestVideo);
  if(inlinePlayer){const panel=document.createElement('div');panel.className='video-controls';panel.id='inline-video-controls';panel.innerHTML=`<p data-video-status aria-live="polite"></p><button type="button" class="btn btn-primary" data-video-sound hidden>${ui('Geluid aan','Enable sound')}</button><button type="button" class="btn btn-outline" data-video-retry hidden>${ui('Start video','Start video')}</button><a class="video-fallback" href="https://www.youtube.com/watch?v=${encodeURIComponent($('#play-video').dataset.video)}" target="_blank" rel="noopener noreferrer">${ui('Open op YouTube','Open on YouTube')} ${externalIcon}</a>`;inlinePlayer.parentElement.append(panel);}
  $('[data-video-close]')?.addEventListener('click',()=>videoDialog.close());videoDialog?.addEventListener('close',stopVideo);
  document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>{pendingVideo=null;openPrivacy();}));
  document.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{
    const previous=choice,value=button.dataset.consent;
    const selected=value==='accepted'?{analytics:true,media:true}:value==='rejected'?{analytics:false,media:false}:{analytics:$('#consent-analytics').checked,media:$('#consent-media').checked};
    try{choice=saveConsent(localStorage,selected);}catch{choice={...selected,decided:true};}
    window['ga-disable-G-G9HM3R866P']=!choice.analytics;
    if(!choice.analytics)clearAnalyticsCookies();
    privacyDialog.close();
    // Unload already-running third-party code when permission is withdrawn.
    if(previous.analytics&&!choice.analytics||previous.media&&!choice.media){stopVideo();videoDialog.close();location.reload();return;}
    loadAnalytics();const pending=pendingVideo;pendingVideo=null;if(pending&&choice.media)startVideo(pending.video,pending.slot);
  }));
  privacyDialog.addEventListener('cancel',()=>{pendingVideo=null;});
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
      cards.sort((a,b)=>sort==='title'?a.dataset.title.localeCompare(b.dataset.title,en?'en':'nl'):sort==='oldest'?Number(a.dataset.order)-Number(b.dataset.order):Number(b.dataset.order)-Number(a.dataset.order)).forEach(card=>{const d=card.dataset;card.hidden=!(!query||fold(`${d.title} ${d.world} ${d.type} ${d.year}`).includes(query))||Boolean(year&&d.year!==year)||Boolean(world&&d.world!==world)||Boolean(type&&d.type!==type);if(!card.hidden)count++;grid.append(card);});
      $('#result-count').textContent=`${count} ${count===1?ui('compositie','composition'):ui('composities','compositions')}`;$('#empty-results').hidden=count!==0;
      const next=new URLSearchParams();new FormData(form).forEach((value,key)=>{if(value && !(key==='volgorde'&&value==='newest'))next.set(key,value);});history.replaceState(null,'',location.pathname+(next.size?'?'+next:'')+location.hash);
    }
    form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('reset',()=>setTimeout(filter,0));filter();
  }
  function loadAnalytics(){if(gaLoaded||!analyticsAllowed(choice,document.body.dataset.siteMode,location.hostname))return;gaLoaded=true;window['ga-disable-G-G9HM3R866P']=false;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id=G-G9HM3R866P';document.head.append(script);window.gtag('js',new Date());window.gtag('config','G-G9HM3R866P');}
  function track(name,params){if(gaLoaded&&analyticsAllowed(choice,document.body.dataset.siteMode,location.hostname))window.gtag?.('event',name,params);}
  document.addEventListener('click',event=>{const a=event.target.closest('a');if(!a)return;if(a.href.startsWith('mailto:'))track('email_click',{link_url:a.href});else if(a.href.includes('youtube.com'))track('youtube_click',{link_url:a.href});else if(a.href.includes('linkedin.com'))track('linkedin_click',{link_url:a.href});});
  window['ga-disable-G-G9HM3R866P']=!choice.analytics;if(!choice.analytics)clearAnalyticsCookies();
  if(!choice.decided)openPrivacy();loadAnalytics();
})();
