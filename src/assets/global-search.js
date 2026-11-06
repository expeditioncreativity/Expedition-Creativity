(async()=>{
const field=document.getElementById('search-query'); if(!field)return;
const q=new URLSearchParams(location.search).get('q')||'';field.value=q;
const en=document.documentElement.lang.startsWith('en'), status=document.getElementById('search-status'), results=document.getElementById('search-results');
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
if(!q.trim()){status.textContent=en?'Enter a search term.':'Vul een zoekterm in.';return;}
try{const response=await fetch('/assets/full-search.json');if(!response.ok)throw Error();const data=await response.json();
const decode=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value;};
const terms=normalize(q).trim().split(/\s+/);const hits=data.filter(p=>p.language===(en?'en':'nl')&&terms.every(t=>normalize(decode(p.title+' '+p.text)).includes(t)));
status.textContent=hits.length+(en?' results':' resultaten');for(const p of hits){const a=document.createElement('a');a.href=p.url;a.textContent=p.title.replace(/ \| Expedition Creativity$/,'');const h=document.createElement('h2');h.append(a);const desc=document.createElement('p');const text=decode(p.text);const at=Math.max(0,normalize(text).indexOf(terms[0])-70);desc.textContent=(at?'…':'')+text.slice(at,at+260)+'…';const article=document.createElement('article');article.className='search-result';article.append(h,desc);results.append(article);}}
catch{status.textContent=en?'Search could not load. Please try again.':'Zoeken kon niet laden. Probeer opnieuw.';}
})();