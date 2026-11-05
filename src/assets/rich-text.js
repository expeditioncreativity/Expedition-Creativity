import {Marked} from './vendor/marked.esm.js';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parser=new Marked({gfm:true,async:false,renderer:{
  heading({depth,tokens}){const level=Math.max(3,depth);return `<h${level} class="subhead">${this.parser.parseInline(tokens)}</h${level}>\n`;},
  html({text}){return escape(text);},
  link({href,tokens}){const label=this.parser.parseInline(tokens);if(!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href))return label;return `<a href="${escape(href)}">${label}</a>`;},
  image({text}){return escape(text);}
}});
export function richText(text){
  // Approved, trusted editorial HTML is retained verbatim.
  if(text.trim().startsWith('<'))return text;
  // Keep existing published Markdown byte-identical; use the full parser for richer content.
  if(/(^|\n)(?:#{4,6} |\s*[-*+] |\s*\d+\. |> |```)|\[[^\]]+\]\(|`[^`]+`|~~/.test(text))return parser.parse(text).trimEnd();
  return text.split(/\n\s*\n/).filter(Boolean).map(p=>{const heading=p.startsWith('### ');if(heading)p=p.slice(4);const body=escape(p).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\n/g,' ');return `<${heading?'h3 class="subhead"':'p'}>${body}</${heading?'h3':'p'}>`;}).join('\n');
}
