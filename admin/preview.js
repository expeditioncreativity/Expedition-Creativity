import {richText} from '/assets/rich-text.js';
const {CMS,h,createClass}=window;
CMS.registerPreviewStyle('/assets/design-system.css');
CMS.registerPreviewStyle('/assets/components.css');
CMS.registerPreviewStyle('body{padding:24px;background:#f7f7f2;color:#222}.cms-preview-note{font:14px sans-serif;border-left:3px solid #ddb313;padding:12px;background:#fff}.content-section{padding:24px 0}.prose{overflow-wrap:anywhere}',{raw:true});
function preview(en){return createClass({render(){
  const data=this.props.entry.get('data').toJS();
  const fields=en?[['story','The Story Behind the Music'],['journey','The Musical Journey'],['orchestration','Orchestration & Instrumentation'],['instrumentation','Instrumentation'],['performance.body','Scores & Performance'],['behind','Behind the Score']]:[['story','Het verhaal achter de muziek'],['journey','De muzikale reis'],['orchestration','Orkestratie en instrumentatie'],['instrumentation','Instrumentatie'],['performance.body','Partituren en uitvoering'],['behind','Achter de partituur']];
  const render=value=>h('div',{className:'prose',dangerouslySetInnerHTML:{__html:richText(String(value||''))}});
  return h('article',{},h('p',{className:'cms-preview-note'},'Inhoudsvoorbeeld. Controleer de volledige pagina via de deploypreview na opslaan. Een nieuw concept is nog niet zichtbaar op de publieke website.'),h('h1',{},data.title||''),render(data.intro),...fields.flatMap(([key,title])=>{const value=key.split('.').reduce((v,k)=>v?.[k],data);return value?.trim()?[h('section',{className:'content-section',key},h('h2',{},title),render(value))]:[]}));
}});}
CMS.registerPreviewTemplate('tracks',preview(false));
CMS.registerPreviewTemplate('tracks_en',preview(true));
