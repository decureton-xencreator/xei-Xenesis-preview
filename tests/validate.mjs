import fs from 'node:fs';
import crypto from 'node:crypto';

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
 ,'xen-choice-config.json'
 ,'src/choice-telemetry.js'
 ,'tracking-worker/src/index.js'
 ,'tracking-worker/wrangler.jsonc'
 ,'tracking-worker/migrations/0001_choice_reporting.sql'
 ,'choice-report.html'
 ,'scripts/xen-mastered-narration-copy-v1.mjs'
 ,'scripts/generate-xen-mastered-narration.mjs'
 ,'scripts/verify-xen-mastered-narration.mjs'
 ,'.github/workflows/generate-xen-mastered-narration.yml'
 ,'assets/checkmate-executive-mark.svg'
 ,'src/executive-arrival-v1.css'
 ,'src/executive-arrival-v1.js'
 ,'src/xps-diamond-publication-lock-v1.css'
 ,'executive-rollout-kit.html'
 ,'governance/AM-002-BRAND-INTEGRITY.json'
 ,'Reports/SWS-AM002-DIAMOND-PUBLICATION-PASS-2026-07-20.md'
 ,'Reports/SWS-XBE-AM002-WARDEN-CLOSE-2026-07-19.md'
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
const telemetry=fs.readFileSync('src/choice-telemetry.js','utf8');
const trackingWorker=fs.readFileSync('tracking-worker/src/index.js','utf8');
const trackingMigration=fs.readFileSync('tracking-worker/migrations/0001_choice_reporting.sql','utf8');
const choiceReport=fs.readFileSync('choice-report.html','utf8');
const css=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8')+fs.readFileSync('src/xfs-xen-centric-finish-v1.css','utf8')+fs.readFileSync('src/xli-living-interface-v1.css','utf8')+fs.readFileSync('src/xps-diamond-publication-lock-v1.css','utf8');
const masteredCopy=fs.readFileSync('scripts/xen-mastered-narration-copy-v1.mjs','utf8');
const masteredGenerator=fs.readFileSync('scripts/generate-xen-mastered-narration.mjs','utf8');
const masteredWorkflow=fs.readFileSync('.github/workflows/generate-xen-mastered-narration.yml','utf8');
const rolloutKit=fs.readFileSync('executive-rollout-kit.html','utf8');
const brandIntegrity=JSON.parse(fs.readFileSync('governance/AM-002-BRAND-INTEGRITY.json','utf8'));

const protectedLogoHash=crypto.createHash('sha256').update(fs.readFileSync(brandIntegrity.protected_asset)).digest('hex');
if(protectedLogoHash!==brandIntegrity.protected_asset_sha256)throw new Error('AM-002 Warden blocked an unapproved logo artwork change');
if(!brandIntegrity.approval_required_for_asset_change||!brandIntegrity.prohibited_without_new_approval.includes('crop'))throw new Error('AM-002 logo-protection mandate is incomplete');
for(const term of ['object-fit:contain','background-size:contain','--visible-center-shift-x:0px!important'])if(!css.includes(term))throw new Error(`Diamond publication lock missing: ${term}`);
for(const term of ['@media print','break-inside:avoid-page','page-break-inside:avoid','.logo{display:block','object-fit:contain'])if(!rolloutKit.includes(term))throw new Error(`Executive rollout publication gate missing: ${term}`);

new Function(runtime);
new Function(finish);
new Function(solutionsRuntime);
for(const term of ['Ed’s package','Kim’s package','Ahmer’s package','AM-002 v1.3 · Warden truth boundary','viewer=ed','viewer=kim','viewer=ahmer','Copy Ed’s email','Copy Kim’s email','Copy Ahmer’s email'])if(!rolloutKit.includes(term))throw new Error(`Executive rollout kit contract missing: ${term}`);
const canonicalPremiereBase='https://decureton-xencreator.github.io/xei-Xenesis-preview/';
for(const viewer of ['ed','kim','ahmer'])if(rolloutKit.split(canonicalPremiereBase+`?viewer=${viewer}`).length-1!==3)throw new Error(`Canonical ${viewer} premiere route must appear exactly three times`);
if(rolloutKit.includes('https://decureton-xencreator.github.io/xei-genesis-preview/'))throw new Error('Case-broken GitHub Pages route restored');
if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Nine-scene documentary contract failed');
if((html.match(/<script type="module"/g)||[]).length!==3)throw new Error('Unexpected production runtime count');
for(const asset of ['executive-arrival-v1.js?v=bespoke-1','executive-arrival-v1.css?v=bespoke-1','ed-premiere-clean-v1.js?v=mastered-audio-v3','xfs-xen-centric-finish-v1.js?v=solutions-gateway-2','xfs-xen-centric-finish-v1.css?v=commercial-rollout-1'])if(!html.includes(asset))throw new Error(`Active finish asset missing: ${asset}`);
for(const term of ['A BESPOKE EXECUTIVE EXPERIENCE','data-arrival-name','Checkmate Holding Group','Nine scenes · Governed proof · Your decision'])if(!html.includes(term))throw new Error(`Bespoke executive arrival contract missing: ${term}`);
if((html.match(/checkmate-bdc-operating-system\.pages\.dev/g)||[]).length<5)throw new Error('Canonical BDC manual links missing');

for(const term of [
 "version:'2.2.0-finish'",
 "experienceStandard:'XPS'",
 "releaseGrade:'DIAMOND'",
 "finishCertified:true",
 "audienceProfiles:['ed','kim','ahmer','faith']",
 'const VIEWER_PROFILES',
 'const AUDIENCE_NARRATION',
 "kim:Object.freeze",
 "ahmer:Object.freeze",
 "Hello Kim.",
 "Hello Ahmer.",
 "viewerKey==='kim'",
 "viewerKey==='ahmer'",
 "const masteredAudio=document.createElement('audio')",
 "start.addEventListener('pointerdown',begin)",
 "document.body.dataset.audioState='playing'",
 "masteredAudio.setAttribute('playsinline','')",
 'masteredAudio.currentTime',
 'function clipUrl(id)',
 'finaleReady=true',
 'completed||!finaleReady||!runWarden()',
 "next.addEventListener('click'",
 "querySelectorAll('.constellation>span').length===12",
 "voiceProfile==='mastered-v1'",
 "speakText(personalizedVoice,{force:true,advance:false})",
 'runWarden()'
])if(!runtime.includes(term))throw new Error(`Runtime certification capability missing: ${term}`);
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','DISTRIBUTED_SYSTEM_TTS_ENABLED'])if(runtime.includes(forbidden))throw new Error(`Unmastered voice fallback restored: ${forbidden}`);

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
for(const term of ['xen_invite_token','crypto.randomUUID()','credentials:\'omit\'','keepalive:true'])if(!telemetry.includes(term))throw new Error(`Choice telemetry client missing: ${term}`);
for(const term of ['origin_not_allowed','payload_too_large','crypto.subtle.timingSafeEqual','INSERT OR IGNORE INTO events','revoked_at IS NULL','/v1/admin/report','/v1/admin/invites'])if(!trackingWorker.includes(term))throw new Error(`Choice reporting security contract missing: ${term}`);
for(const term of ['CHECK (audience IN','CHECK (event_type IN','FOREIGN KEY (invite_hash)','CREATE INDEX events_invite_created_idx'])if(!trackingMigration.includes(term))throw new Error(`Choice reporting D1 contract missing: ${term}`);
if(!finish.includes("reportChoice('path_selected',path)")||!solutionsRuntime.includes("reportChoice('second_appointment_continued',key)"))throw new Error('Choice reporting instrumentation missing');
for(const term of ["voice = 'marin'",'XVS-001-MARIN-EXCLUSIVE-v1','Hello Ed.','Hello Kim.','Hello Ahmer.','Hello Faith.','roughly six months','Read the question, then choose one of the three answers below.','requiresExplicitContinue: true'])if(!masteredCopy.includes(term))throw new Error(`Mastered narration source contract missing: ${term}`);
for(const term of ["model: 'gpt-4o-mini-tts'",'assets/narration/mastered-v1','manifest.json','voiceContract','instructionsSha256'])if(!masteredGenerator.includes(term))throw new Error(`Mastered narration generator contract missing: ${term}`);
for(const term of ['workflow_dispatch','Warden asset verification','verify-xen-mastered-narration.mjs'])if(!masteredWorkflow.includes(term))throw new Error(`Mastered narration workflow contract missing: ${term}`);
for(const term of ['Private choice report.','Create a private premiere link','/v1/admin/report','/v1/admin/invites','never stored by this page'])if(!choiceReport.includes(term))throw new Error(`Owner choice report missing: ${term}`);
const rollout=JSON.parse(fs.readFileSync('governance/XLC-ROLL-001-COMMERCIAL-MANIFEST.json','utf8'));if(rollout.standard!=='XLC-ROLL-001'||rollout.publications.length!==9||!rollout.truth_boundary.no_invented_pricing)throw new Error('Commercial rollout governance failed');
if(!rollout.single_gateway)throw new Error('Single canonical gateway rule missing');

for(const term of [
 'XLI-016 VISIBLE-FRAME CENTER LOCK',
 'XLI-018 FINISH MODE',
 'XLI-019 CONTENT PLANE',
 '.manual-research-viewer',
 '--visible-center-shift-x:0px!important',
 'xli-page-ring-glimmer',
 'xli-finish-box-glimmer',
 'prefers-reduced-motion',
 'safe-area-inset-bottom',
 'touch-action:manipulation'
])if(!css.includes(term))throw new Error(`XPS visual gate missing: ${term}`);

for(const term of ['XMP-M4 PRESENTATION KIT INHERITANCE','height:100dvh','grid-template-rows:auto minmax(0,1fr) auto','content before chrome','@media(min-width:900px)','@media(max-width:899px)','@media(max-width:620px)','focus-visible','prefers-reduced-motion'])if(!css.includes(term))throw new Error(`XMP presentation standard missing: ${term}`);

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
console.log('PASS private invite choice reporting · D1 · owner-only reports');
console.log('CERTIFIED XDE 2.3.1 SINGLE-GATEWAY ROLLOUT · XPS · DIAMOND');
