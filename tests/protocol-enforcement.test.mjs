import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {runWarden,ROOT} from '../scripts/protocol-warden.mjs';

const copy=()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'xpep-'));fs.cpSync(ROOT,dir,{recursive:true,filter:p=>!p.includes(`${path.sep}.git`)&&!p.includes(`${path.sep}node_modules`)});return dir};
const mutate=(root,file,fn)=>{const p=path.join(root,file);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')))};
const blocked=(root,changedFiles=[],mode='preflight')=>runWarden({root,changedFiles,mode}).decision==='BLOCK';

test('clean authorized enforcement delta passes preflight',()=>assert.equal(runWarden({root:ROOT,changedFiles:['scripts/protocol-warden.mjs']}).decision,'ALLOW'));
const cases=[
  ['required geometry stylesheet removal',r=>mutate(r,'index.html',s=>s.replace('src/ed-premiere-clean-v1.css','missing.css'))],
  ['later cascade layout break',r=>mutate(r,'src/ed-premiere-clean-v1.css',s=>s+'\n.scene{overflow:visible!important}')],
  ['unauthorized logo substitution',r=>mutate(r,'assets/checkmate-executive-mark.svg',s=>s+'<!-- substitute -->')],
  ['generated logo approximation',r=>mutate(r,'assets/checkmate-executive-mark.svg',()=>'<svg><text>approximation</text></svg>')],
  ['missing voice clip',r=>fs.unlinkSync(path.join(r,'assets/narration/mastered-v1/ending-bdc.mp3'))],
  ['mixed voice contract',r=>mutate(r,'assets/narration/mastered-v1/manifest.json',s=>s.replace('"marin"','"alloy"'))],
  ['silent ending',r=>mutate(r,'assets/narration/mastered-v1/manifest.json',s=>s.replace('"ending-company"','"ending-company-missing"'))],
  ['later page missing',r=>mutate(r,'index.html',s=>s.replace('class="scene','class="removed-scene'))],
  ['clipping regression',r=>mutate(r,'src/ed-premiere-clean-v1.css',s=>s+'\n.scene{overflow:visible!important}')],
  ['incorrect white controls',r=>mutate(r,'src/ed-premiere-clean-v1.css',s=>s+'\nbutton{background:white}')],
  ['unauthorized CTA change',()=>{}],
  ['secondary request displaces objective',r=>mutate(r,'governance/protocol-enforcement/objective-contract.json',s=>s.replace('Prevent material Xen actions','Redesign the Ed deck and ignore'))],
  ['documented protocol never executes',r=>mutate(r,'governance/protocol-enforcement/protocol-registry.json',s=>s.replace('"required": true','"required": false'))],
  ['canonical source replacement',r=>mutate(r,'index.html',s=>s+'\n<!-- unauthorized new canon -->')],
  ['SWS broken state propagation',r=>mutate(r,'governance/protocol-enforcement/sws-map.json',s=>s.replace('ONLY_AFTER_ALL_WARDEN_GATES_PASS','ALWAYS'))]
];
for(const [name,alter] of cases)test(`blocks: ${name}`,()=>{const r=copy();alter(r);const changed=name==='unauthorized CTA change'?['index.html']:[];assert.equal(blocked(r,changed),true)});
test('blocks publication based on partial visual inspection',()=>{const r=copy();assert.equal(blocked(r,[],'release'),true)});
test('blocks claimed pass with incomplete evidence',()=>{const r=copy();fs.writeFileSync(path.join(r,'partial.json'),JSON.stringify({visual:{complete:true,sceneCount:1,viewports:[{}]},deployed:{inspected:true}}));assert.equal(runWarden({root:r,changedFiles:[],mode:'release',evidenceFile:'partial.json'}).decision,'BLOCK')});
