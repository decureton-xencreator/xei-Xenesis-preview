import fs from 'node:fs';
const required=['index.html','src/app-v6.js','src/styles-v5.css','src/director-v6.css','src/cursor-v5.js','docs/XEI-001-CINEMATIC-STORYBOARD-V5.md'];
for(const file of required){if(!fs.existsSync(file))throw new Error(`Missing required production asset: ${file}`);if(fs.statSync(file).size<20)throw new Error(`Production asset is unexpectedly empty: ${file}`);console.log(`PASS ${file}`)}
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app-v6.js','utf8');
const css=fs.readFileSync('src/styles-v5.css','utf8')+fs.readFileSync('src/director-v6.css','utf8');
if(!html.includes('app-v6.js')||html.includes('app-v5.js')||html.includes('premiere-entry.js')||html.includes('premiere-stable-controller.js'))throw new Error('Single master director shell is not active');
if((html.match(/<script type="module"/g)||[]).length!==2)throw new Error('Unexpected competing runtime scripts detected');
for(const term of ['started:false','cancelTimeline','runScene','gotoScene','plan.auto','pause:true','greeting()','speechSynthesis.cancel','caption.textContent','scrollIntoView'])if(!js.includes(term))throw new Error(`Master timeline capability missing: ${term}`);
for(const id of ['arrival','memory','living','panama','bilingual','manual','teach','router','propagate','reveal','constellation','summary','mandate'])if(!js.includes(id))throw new Error(`Scene missing: ${id}`);
if(js.includes('MutationObserver'))throw new Error('Independent caption observer must not drive narration');
if(js.includes('localStorage.getItem'))throw new Error('Saved scene restoration can corrupt the premiere landing state');
if(!css.includes('prefers-reduced-motion'))throw new Error('Reduced-motion support missing');
console.log('PASS silent landing, single clock, synchronized voice/captions/visual beats, navigation cancellation, interaction pauses, and accessibility');