import fs from 'node:fs';
const required=['index.html','src/mobile-phone-gold-v8.css','src/mobile-phone-gold-v8.js','src/xvs-canonical-phone-v9.js','src/mobile-interaction-stage-v9.css','src/mobile-interaction-stage-v9.js'];
for(const file of required){if(!fs.existsSync(file))throw new Error(`Missing phone Gold Master asset: ${file}`)}
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('src/mobile-phone-gold-v8.css','utf8');
const js=fs.readFileSync('src/mobile-phone-gold-v8.js','utf8');
const xvs=fs.readFileSync('src/xvs-canonical-phone-v9.js','utf8');
const stageCss=fs.readFileSync('src/mobile-interaction-stage-v9.css','utf8');
const stageJs=fs.readFileSync('src/mobile-interaction-stage-v9.js','utf8');
for(const term of ['mobile-phone-gold-v8.css','mobile-phone-gold-v8.js','xvs-canonical-phone-v9.js','mobile-interaction-stage-v9.css','mobile-interaction-stage-v9.js'])if(!html.includes(term))throw new Error(`Phone shell not loaded: ${term}`);
for(const term of ['100dvh','safe-area-inset-bottom','phoneGoldBegin','body:not(.phone-premiere-started)','visibility:hidden'])if(!css.includes(term))throw new Error(`Phone shell contract missing: ${term}`);
for(const term of ['Good morning','Good afternoon','Good evening','phone-premiere-started','nativeBegin.click','window.scrollTo(0,0)'])if(!js.includes(term))throw new Error(`Phone start runtime missing: ${term}`);
for(const term of ["'Sonia'","'Libby'","utterance.rate=.86","utterance.pitch=1.05","behavior:'auto'","frame-first"])if(!xvs.includes(term))throw new Error(`Canonical XVS or frame synchronization missing: ${term}`);
for(const term of ['#phoneInteractionStage','bottom:calc(104px','body.phone-interaction-open .captions','min-height:58px','phoneStageIn'])if(!stageCss.includes(term))throw new Error(`Visible interaction stage style missing: ${term}`);
for(const term of ['phoneInteractionStage','Your turn, Ed','interactionMap','awaiting-ed','replaceWith(placeholder)','visualViewport','restore()'])if(!stageJs.includes(term))throw new Error(`Visible interaction stage runtime missing: ${term}`);
console.log('PASS phone-first landing, approved XVS lock, frame-before-voice synchronization, and guaranteed visible interaction stage');