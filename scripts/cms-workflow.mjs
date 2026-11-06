import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';

// Deliberately pinned: fail the build if upstream bytes or patch anchors change.
export const upstream='https://unpkg.com/decap-cms@3.17.3/dist/decap-cms.js';
export const integrity='RWRzuHfiZSWCt3nEvG7B0v3cMgM1C2UuJmgBSL92GQh4uXmNSkbcthql/mNBqvjr';
export const toolbar=`renderWorkflowControls=()=>{const{onPersist:save,onPublish:publish,hasChanged:changed,currentStatus:status,isPersisting:saving,isPublishing:publishing,useOpenAuthoring:external,collection}=this.props;const busy=saving||publishing;return[fu(mF,{disabled:!changed||busy,onClick:()=>changed&&!busy&&save(),children:saving?"Opslaan…":"Opslaan"},"save-button"),fu(fF,{className:"ec-publish-button",disabled:changed||busy||!status||external||!collection.get("publish"),onClick:()=>!changed&&!busy&&status&&!external&&collection.get("publish")&&publish(),children:publishing?"Publiceren…":"Publiceren"},"publish-button")]};`;
export function patchCms(source){
  if(createHash('sha384').update(source).digest('base64')!==integrity)throw Error('Decap source integrity mismatch');
  const start=source.indexOf('renderWorkflowControls=()=>');
  const end=source.indexOf('renderWorkflowDeployPreviewControls=()=>',start);
  if(start<0||end<start||source.indexOf('renderWorkflowControls=()=>',start+1)!==-1)throw Error('Decap toolbar anchor mismatch');
  source=source.slice(0,start)+toolbar+source.slice(end);
  // Keep Decap's unsaved-change guard, user confirmation and backend merge.
  // A saved draft is publishable without manually moving it through review states.
  const guard='l===Rg.last()?o.get("hasChanged")?window.alert(c("editor.editor.onPublishingWithUnsavedChanges"))';
  if(source.split(guard).length!==2)throw Error('Decap publish guard anchor mismatch');
  return source.replace(guard,'Rg.includes(l)?o.get("hasChanged")?window.alert(c("editor.editor.onPublishingWithUnsavedChanges"))');
}
export async function buildCms(out){
  let source;
  if(process.env.DECAP_SOURCE_FILE)source=await readFile(process.env.DECAP_SOURCE_FILE,'utf8');
  else {const response=await fetch(upstream);if(!response.ok)throw Error('Decap download failed: '+response.status);source=await response.text();}
  await mkdir(join(out,'admin/vendor'),{recursive:true});
  await writeFile(join(out,'admin/vendor/decap-cms.js'),patchCms(source));
}
