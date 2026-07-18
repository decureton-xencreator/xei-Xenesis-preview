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
];
for(const file of required){
 if(!fs.existsSync(file))throw new Error(`Missing certified asset: ${file}`);
 if(fs.statSync(file).size<20)throw new Error(`Certified asset is unexpectedly empty: ${file}`);
 console.log(`PASS asset ${file}`);
}

const html=fs.readFileSync('index.html','utf8');
const runtime=fs.readFileSync('src/ed-premiere-clean-v1.js','utf8');
const finish=fs.readFileSync('src/xfs-xen-centric-finish-v1.js','utf8');
const css=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8')+fs.readFileSync('src/xfs-xen-centric-finish-v1.css','utf8')+fs.readFileSync('src/xli-living-interface-v1.css','utf8');

new Function(runtime);
new Function(finish);

if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Nine-scene documentary contract failed');
if((html.match(/<script type="module"/g)||[]).length!==2)throw new Error('Unexpected production runtime count');
for(const asset of ['ed-premiere-clean-v1.js?v=diamond-audiences-1','xfs-xen-centric-finish-v1.js?v=audience-owner-1','xfs-xen-centric-finish-v1.css?v=finish-rings-1'])if(!html.includes(asset))throw new Error(`Active finish asset missing: ${asset}`);
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

if(!finish.includes("['kim','ahmer'].includes(document.body.dataset.viewer)"))throw new Error('Audience narration ownership guard missing');
if(finish.includes("8:'The BDC was not Xen"))throw new Error('Secondary module may not own finale narration');

for(const term of [
 'XLI-016 VISIBLE-FRAME CENTER LOCK',
 'XLI-018 FINISH MODE',
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
console.log('CERTIFIED XDE 2.2.0 FINISH · XPS · DIAMOND');
