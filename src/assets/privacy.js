// No network or DOM side effects. A preference is essential local storage, not a tracking cookie.
export const CONSENT_KEY='ec_privacy_v2';
export const deniedConsent=()=>({version:2,analytics:false,media:false,decided:false});
export function readConsent(storage){
  try{const value=JSON.parse(storage.getItem(CONSENT_KEY));if(value?.version===2&&typeof value.analytics==='boolean'&&typeof value.media==='boolean')return {...value,decided:true};}catch{}
  return deniedConsent();
}
export function saveConsent(storage,value){const choice={version:2,analytics:value.analytics===true,media:value.media===true};try{storage.setItem(CONSENT_KEY,JSON.stringify(choice));storage.removeItem('ec_cookie_consent_v1');}catch{}return {...choice,decided:true};}
export function analyticsAllowed(choice,mode,hostname){return choice.analytics===true&&mode==='production'&&hostname==='expeditioncreativity.com';}
export function analyticsCookieNames(cookie){return cookie.split(';').map(part=>part.trim().split('=')[0]).filter(name=>name==='_ga'||name.startsWith('_ga_')||name==='_gid'||name==='_gat'||name.startsWith('_gat_'));}
