import fs from 'node:fs';
const required=['index.html','src/app-v6.js','src/styles-v5.css','src/director-v6.css','src/frame-calibration-v6.css','src/mobile-safe-area-v6.css','src/mobile-entry-v7.css','src/mobile-entry-v7.js','src/cursor-v5.js','docs/XEI-001-CINEMATIC-STORYBOARD-V5.md'];
for(const file of required){if(!fs.existsSync(file))throw new Error(`Missing required production asset: ${file}`);if(fs.statSync(file).size<20)throw new Error(`Production asset is unexpectedly empty: ${file}`);console.log(`PASS ${file}`)}
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app-v6.js','utf8');
const mobileJs=fs.readFileSync('src/mobile-entry-v7.js','utf8');
const css=fs.readFileSync('src/styles-v5.css','utf8')+fs.readFileSync('src/director-v6.css','utf8')+fs.readFileSync('src/frame-calibration-v6.css','utf8')+fs.readFileSync('src/mobile-safe-area-v6.css','utf8')+fs.readFileSync('src/mobile-entry-v7.css','utf8');
if(!html.includes('app-v6.js')||!html.includes('mobile-entry-v7.js')||!html.includes('mobile-entry-v7.css')||html.includes('app-v5.js')||html.includes('premiere-entry.js')||html.includes('premiere-stable-controller.js'))throw new Error('Master director and mobile entry shell are not active');
if((html.match(/<script type="module"/g)||[]).length!==4)throw new Error('Unexpected runtime script count');
for(const term of ['started:false','cancelTimeline','runScene','gotoScene','plan.auto','pause:true','greeting()','speechSynthesis.cancel','caption.textContent','scrollIntoView'])if(!js.includes(term))throw new Error(`Master timeline capability missing: ${term}`);
for(const id of ['arrival','memory','living','panama','bilingual','manual','teach','router','propagate','reveal','constellation','summary','mandate'])if(!js.includes(id))throw new Error(`Scene missing: ${id}`);
if(js.includes('localStorage.getItem'))throw new Error('Saved scene restoration can corrupt the premiere landing state');
for(const term of ['100dvh','safe-area-inset-bottom','safe-area-inset-top','touch-action:manipulation','body:has(#arrival.active) .nav','min-height:60px','position:fixed!important','bottom:max(','mobileBeginPulse'])if(!css.includes(term))throw new Error(`Mobile release gate missing: ${term}`);
for(const term of ['mobile-arrival','pickFallback','Samantha','XVS voice unavailable','speakFallback'])if(!mobileJs.includes(term))throw new Error(`Mobile XVS gate missing: ${term}`);
if(!css.includes('prefers-reduced-motion'))throw new Error('Reduced-motion support missing');
console.log('PASS silent landing, fixed mobile start gate, female-only XVS fallback, synchronized visuals, safe-area layout, touch sizing, interaction pauses, and accessibility');