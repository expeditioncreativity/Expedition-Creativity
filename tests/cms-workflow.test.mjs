import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {toolbar,patchCms} from '../scripts/cms-workflow.mjs';
function controls(overrides={}){
 const calls=[];const ctx={fu:(type,props,key)=>({type,props,key}),mF:'save',fF:'publish'};
 const C=vm.runInNewContext(`(class {${toolbar}})`,ctx);
 const instance=new C();instance.props={onPersist:()=>calls.push('save'),onPublish:()=>calls.push('publish'),isPersisting:false,isPublishing:false,useOpenAuthoring:false,hasChanged:false,currentStatus:'draft',collection:new Map([['publish',true]]),...overrides};
 return {buttons:instance.renderWorkflowControls(),calls};
}
test('dirty entry can save but cannot publish',()=>{const{buttons,calls}=controls({hasChanged:true});assert.equal(buttons.length,2);assert.equal(buttons[0].props.disabled,false);assert.equal(buttons[1].props.disabled,true);buttons[0].props.onClick();buttons[1].props.onClick();assert.deepEqual(calls,['save']);});
test('saved draft publishes explicitly without a review-status selector',()=>{const{buttons,calls}=controls();assert.equal(buttons[0].props.disabled,true);assert.equal(buttons[1].props.disabled,false);assert.equal(buttons[1].props.children,'Publiceren');assert.deepEqual(calls,[]);buttons[1].props.onClick();assert.deepEqual(calls,['publish']);});
test('no pending draft and in-progress requests cannot publish',()=>{for(const state of [{currentStatus:null},{isPersisting:true},{isPublishing:true},{useOpenAuthoring:true}]){const{buttons,calls}=controls(state);assert.ok(buttons[1].props.disabled);buttons[1].props.onClick();assert.deepEqual(calls,[]);}});
test('unverified upstream CMS bytes fail closed',()=>assert.throws(()=>patchCms('wrong bundle'),/integrity/));
test('production uses draft workflow targeting main',async()=>{const config=await readFile(new URL('../admin/config.yml',import.meta.url),'utf8');assert.match(config,/branch: main/);assert.match(config,/publish_mode: editorial_workflow/);assert.doesNotMatch(config,/publish_mode: simple/);const html=await readFile(new URL('../admin/index.html',import.meta.url),'utf8');assert.match(html,/admin\/vendor\/decap-cms.js/);});
