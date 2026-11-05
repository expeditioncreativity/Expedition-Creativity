import test from 'node:test';
import assert from 'node:assert/strict';
import {richText} from '../src/assets/rich-text.js';
test('extended editorial formatting renders nested lists, emphasis, quotes, headings and safe links',()=>{
 const html=richText('#### Detail\n\n- **Strijkers**\n  - *Viool*\n- Hoorn\n\n1. Begin\n2. Einde\n\n> Een herinnering.\n\n[Contact](/nl/contact/) en `motief`.');
 assert.match(html,/<h4 class="subhead">Detail<\/h4>/);assert.equal((html.match(/<ul>/g)||[]).length,2);assert.match(html,/<strong>Strijkers<\/strong>/);assert.match(html,/<em>Viool<\/em>/);assert.match(html,/<ol>/);assert.match(html,/<blockquote>/);assert.match(html,/<a href="\/nl\/contact\/">Contact<\/a>/);assert.match(html,/<code>motief<\/code>/);
});
test('new Markdown cannot introduce script links or inline active HTML',()=>{
 const html=richText('- [Geen](javascript:alert%281%29)\n- [Geen](data:text/html,test)\n- <script>alert(1)</script>');
 assert.doesNotMatch(html,/<a href="(?:javascript|data):|<script>/);assert.match(html,/&lt;script&gt;/);
});
test('approved HTML is passed through verbatim',()=>{
 const source='<p>Een <strong>herinnering</strong>.</p>\n<h3 class="subhead">Het verhaal</h3>';assert.equal(richText(source),source);
});
