import fs from 'node:fs';

const canonPath='docs/XDE-001-010-EXECUTIVE-DOCUMENTARY-ENGINE-CANON.md';
const manifestPath='governance/XDE-CANON-MANIFEST.json';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/ed-premiere-clean-v1.js','utf8');
const css=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8');
const canon=fs.readFileSync(canonPath,'utf8');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
for(let i=1;i<=10;i++){const id=`XDE-${String(i).padStart(3,'0')}`;if(!canon.includes(id))throw new Error(`Missing canonical standard: ${id}`)}
for(const term of ['Executive Experience Review Board','ESP-001','Five-Second Rule','WOW Ledger','Documentary Budget','Living Company Signature Moments'])if(!canon.includes(term))throw new Error(`Canonical doctrine missing: ${term}`);
if(manifest.status!=='canonical'||manifest.production_skeleton.scene_count!==9)throw new Error('XDE manifest is not canonical or does not preserve the nine-scene skeleton');
if(manifest.review_board.gates.length!==6)throw new Error('EERB must contain six certification gates');
if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Production skeleton must remain nine scenes');
for(const term of ['data-label="Follow the Risk"','data-label="Open the Living Department"','data-label="Teach Xen"','data-label="Watch Xen Learn"','data-label="Complete"'])if(!html.includes(term))throw new Error(`Xen-centric curiosity progression missing: ${term}`);
for(const term of ['knowledge-field','manual-stack','inheritance-flow','manual-proof','propagation-map','constellation','finale'])if(!html.includes(term))throw new Error(`Documentary hero moment missing: ${term}`);
for(const term of ['dataset.label','selectedPrinciple.textContent','function reset()'])if(!js.includes(term))throw new Error(`Documentary interaction contract missing: ${term}`);
for(const term of ['prefers-reduced-motion','height:100dvh','.scene.active'])if(!css.includes(term))throw new Error(`Experience stability contract missing: ${term}`);
console.log('PASS XDE canon: EERB active, nine-scene Xen-centric skeleton preserved, institutional memory and signature documentary moments certified');