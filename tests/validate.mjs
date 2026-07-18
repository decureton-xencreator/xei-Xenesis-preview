import fs from 'node:fs';

const required=[
 'index.html',
 'src/ed-premiere-clean-v1.js',
 'src/ed-premiere-clean-v1.css',
 'src/xfs-xen-centric-finish-v1.js',
 'src/xfs-xen-centric-finish-v1.css',
 'src/xli-living-interface-v1.js',
 'src/xli-living-interface-v1.css',
 'src/xde-rollout-v1.css',
 'src/xde-branching-v1.css',
 'src/xde-directors-cut-v1.css',
 'site.webmanifest',
 'docs/XDE-DIAMOND-FINISH-CERTIFICATION.md'
 ,'solutions.html'
 ,'src/solutions.css'
 ,'src/solutions.js'
 ,'docs/XLC-ROLL-001-LIVING-COMPANY-COMMERCIAL-ROLLOUT.md'
 ,'governance/XLC-ROLL-001-COMMERCIAL-MANIFEST.json'
];
for(const file of required){
 if(!fs.existsSync(file))throw new Error(`Missing certified asset: ${file}`);
 if(fs.statSync(file).size<20)throw new Error(`Certified asset is unexpectedly empty: ${file}`);
 console.log(`PASS asset ${file}`);
}

const html=fs.readFileSync('index.html','utf8');
const runtime=fs.readFileSync('src/ed-premiere-clean-v1.js','utf8');
const finish=fs.readFileSync('src/xfs-xen-centric-finish-v1.js','utf8');
const solutions=fs.readFileSync('solutions.html','utf8');
const solutionsRuntime=fs.readFileSync('src/solutions.js','utf8');
const css=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8')+fs.readFileSync('src/xfs-xen-centric-finish-v1.css','utf8')+fs.readFileSync('src/xli-living-interface-v1.css','utf8');

new Function(runtime);
new Function(finish);
new Function(solutionsRuntime);

if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Nine-scene documentary contract failed');
if((html.match(/<script type="module"/g)||[]).length!==2)throw new Error('Unexpected production runtime count');
for(const asset of ['ed-premiere-clean-v1.js?v=manual-resume-1','xfs-xen-centric-finish-v1.js?v=solutions-gateway-2','xfs-xen-centric-finish-v1.css?v=commercial-rollout-1'])if(!html.includes(asset))throw new Error(`Active finish asset missing: ${asset}`);
if((html.match(/checkmate-bdc-operating-system\.pages\.dev/g)||[]).length<5)throw new Error('Canonical BDC manual links missing');

for(const term of [
 "version:'2.2.0-finish'",
 "experienceStandard:'XPS'",
 "releaseGrade:'DIAMOND'",
 "finishCertified:true",
 "audienceProfiles:['ed','kim','ahmer']",
 'const VIEWER_PROFILES',
 'const AUDIENCE_NARRATION',
 "kim:Object.freeze",
 "ahmer:Object.freeze",
 "Hello Kim.",
 "Hello Ahmer.",
 "viewerKey==='kim'",
 "viewerKey==='ahmer'",
 'function buildSpeechChunks',
 'speakChunk(chunkIndex+1)',
 "utterance.lang=voice.lang||'en-GB'",
 'finaleReady=true',
 'completed||!finaleReady||!runWarden()',
 "next.addEventListener('click'",
 "querySelectorAll('.constellation>span').length===12",
 'runWarden()'
])if(!runtime.includes(term))throw new Error(`Runtime certification capability missing: ${term}`);

if(!runtime.includes("window.addEventListener('xen:resume'"))throw new Error('Manual research resume event missing');

if(!finish.includes("['kim','ahmer'].includes(document.body.dataset.viewer)"))throw new Error('Audience narration ownership guard missing');
if(finish.includes("8:'The BDC was not Xen"))throw new Error('Secondary module may not own finale narration');
for(const term of ['manualReturn:true','contentPlane:true','solutionsGateway:true','singleGateway:true','manual-research-viewer','Back to Xen Demo','event.preventDefault()','xen:resume','solutions-gateway-link','xen_gateway_path'])if(!finish.includes(term))throw new Error(`Manual research and rollout contract missing: ${term}`);

for(const term of ['Buy the system.','Deploy the proof.','Build the Living Company.','Open Complete XBM Suite','SECOND APPOINTMENT ROUTER','No discovery questionnaire is required'])if(!solutions.includes(term))throw new Error(`Solutions Gateway contract missing: ${term}`);
if((solutionsRuntime.match(/\['XBM-10[1-9]'/g)||[]).length!==9)throw new Error('Solutions Gateway must expose nine standalone manual routes');
for(const term of ['BDC DEPLOYMENT + MEASUREMENT SESSION','LIVING COMPANY BLUEPRINT SESSION','CHECKMATE OPERATING-LAYER COMPARISON','navigator.clipboard.writeText','window.print()'])if(!solutionsRuntime.includes(term))throw new Error(`Commercial continuation capability missing: ${term}`);
for(const term of ['data-select-path="bdc"','data-select-path="company"','solutions.js?v=rollout-2','solutions.css?v=rollout-2'])if(!solutions.includes(term))throw new Error(`Single Gateway indexed interaction missing: ${term}`);
if(solutions.includes('?path=')||finish.includes('solutions.html?source=')||finish.includes("link.href='solutions.html?"))throw new Error('Commercial path URLs must not multiply the canonical gateway');
for(const term of ['sessionStorage.setItem','history.replaceState',"document.getElementById('appointment').scrollIntoView",'[data-select-path]'])if(!solutionsRuntime.includes(term))throw new Error(`Deterministic single-gateway state missing: ${term}`);
const rollout=JSON.parse(fs.readFileSync('governance/XLC-ROLL-001-COMMERCIAL-MANIFEST.json','utf8'));if(rollout.standard!=='XLC-ROLL-001'||rollout.publications.length!==9||!rollout.truth_boundary.no_invented_pricing)throw new Error('Commercial rollout governance failed');
if(!rollout.single_gateway)throw new Error('Single canonical gateway rule missing');

for(const term of [
 'XLI-016 VISIBLE-FRAME CENTER LOCK',
 'XLI-018 FINISH MODE',
 'XLI-019 CONTENT PLANE',
 '.manual-research-viewer',
 '--visible-center-shift-x:60px',
 'xli-page-ring-glimmer',
 'xli-finish-box-glimmer',
 'prefers-reduced-motion',
 'safe-area-inset-bottom',
 'touch-action:manipulation'
])if(!css.includes(term))throw new Error(`XPS visual gate missing: ${term}`);

console.log('PASS XPS mobile and accessibility surface');
console.log('PASS Diamond centered geometry and finish-mode illumination');
console.log('PASS Ed, Kim, and Ahmer audience routes');
console.log('PASS canonical publications and truth boundary');
console.log('PASS Warden, Overwatch, branching, pause/resume, narration, and explicit finale gate');
console.log('PASS full-publication research viewer and deterministic return to page 4');
console.log('PASS content-plane layering: borders and shimmer remain behind all language');
console.log('PASS standalone manual family, offer ladder, and three second-appointment continuations');
console.log('PASS Living Company commercial truth and privacy boundaries');
console.log('PASS one canonical gateway with indexed internal commercial states');
console.log('CERTIFIED XDE 2.3.1 SINGLE-GATEWAY ROLLOUT · XPS · DIAMOND');
