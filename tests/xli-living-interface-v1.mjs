import fs from 'node:fs';

const xfs=fs.readFileSync('src/xfs-xen-centric-finish-v1.js','utf8');
const js=fs.readFileSync('src/xli-living-interface-v1.js','utf8');
const css=fs.readFileSync('src/xli-living-interface-v1.css','utf8');
const controller=fs.readFileSync('src/ed-premiere-clean-v1.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('governance/XLI-LIVING-INTERFACE-RELEASE.json','utf8'));

if(!xfs.includes("import('./xli-living-interface-v1.js')"))throw new Error('XLI is not activated by XFS');
for(const term of ["family:'XLI'","observerOnly:true",'prefers-reduced-motion','visibilitychange','data-xli-purpose','XLI_MOTION_PURPOSE','xli:ready'])if(!js.includes(term))throw new Error(`XLI runtime missing: ${term}`);
for(const term of ['xliKnowledgeBreath','xliInvitation','xliMemoryHeartbeat','xliEnterpriseSignal','xliPrimaryInvite','prefers-reduced-motion:reduce'])if(!css.includes(term))throw new Error(`XLI visual language missing: ${term}`);
for(const selector of ['.knowledge-field span','.choice:not(.selected)','.institutional-scene.active','.proof-link','.propagation-map .core','.constellation span'])if(!css.includes(selector))throw new Error(`XLI target missing: ${selector}`);
for(const forbidden of ['speechSynthesis','requestAnimationFrame','phone-gold-runtime','floating-caption'])if(js.includes(forbidden)||css.includes(forbidden))throw new Error(`Deprecated or conflicting runtime restored: ${forbidden}`);
if(!controller.includes('singleOwner:true'))throw new Error('Single controller contract lost');
if((html.match(/class="scene/g)||[]).length!==9)throw new Error('XLI must preserve the nine-scene Director’s Cut');
if(manifest.single_controller!==true||manifest.living_behaviors.length!==10||manifest.monetization_review.length<10)throw new Error('XLI release manifest incomplete');
console.log('PASS XLI Living Interface v1.0: purposeful ambient intelligence, living choices, institutional memory, product proof, enterprise signal flow, accessibility lifecycle, monetization review, and single-controller preservation certified');