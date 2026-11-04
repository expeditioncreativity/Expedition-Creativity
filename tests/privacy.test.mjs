import test from 'node:test';
import assert from 'node:assert/strict';
import {readConsent,saveConsent,CONSENT_KEY,analyticsAllowed,analyticsCookieNames} from '../src/assets/privacy.js';
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
test('privacy defaults deny both categories, including malformed and legacy choices',()=>{
  const s=storage();
  for(const value of [null,'broken','{}','{"version":2,"analytics":"true","media":true}','{"version":1,"analytics":true,"media":true}']){if(value)s.setItem(CONSENT_KEY,value);const c=readConsent(s);assert.equal(c.analytics,false);assert.equal(c.media,false);assert.equal(c.decided,false);}
  s.removeItem(CONSENT_KEY);s.setItem('ec_cookie_consent_v1','accepted');assert.equal(readConsent(s).analytics,false);
  assert.equal(readConsent({getItem(){throw Error('disabled storage');}}).media,false);
});
test('rejection persists and analytics/media are independently controlled',()=>{
  const s=storage();
  for(const choice of [{analytics:false,media:false},{analytics:true,media:false},{analytics:false,media:true},{analytics:true,media:true}]){saveConsent(s,choice);assert.deepEqual(readConsent(s),{version:2,...choice,decided:true});}
  s.setItem('ec_cookie_consent_v1','accepted');saveConsent(s,{analytics:false,media:false});assert.equal(s.getItem('ec_cookie_consent_v1'),null);
});
test('tracking requires explicit analytics opt-in AND production context AND the production hostname',()=>{
  for(const analytics of [false,true])for(const media of [false,true])for(const mode of ['preview','production'])for(const host of ['localhost','deploy-preview-4--expeditioncreativity.netlify.app','expeditioncreativity.com'])assert.equal(analyticsAllowed({analytics,media},mode,host),analytics&&mode==='production'&&host==='expeditioncreativity.com');
});
test('withdrawal targets GA cookies without deleting unrelated first-party preferences',()=>{
  assert.deepEqual(analyticsCookieNames('_ga=abc; _ga_G9HM3R866P=abc; _gid=x; _gat=1; _gat_custom=1; session=keep; ec_privacy_v2=keep'),['_ga','_ga_G9HM3R866P','_gid','_gat','_gat_custom']);
});
