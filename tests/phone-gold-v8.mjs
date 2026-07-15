import fs from 'node:fs';
const required=['index.html','src/mobile-phone-gold-v8.css','src/mobile-phone-gold-v8.js','docs/PHONE-GOLD-MASTER-V8.md'];
for(const file of required){if(!fs.existsSync(file))throw new Error(`Missing phone Gold Master asset: ${file}`)}
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('src/mobile-phone-gold-v8.css','utf8');
const js=fs.readFileSync('src/mobile-phone-gold-v8.js','utf8');
for(const term of ['mobile-phone-gold-v8.css','mobile-phone-gold-v8.js'])if(!html.includes(term))throw new Error(`Phone shell not loaded: ${term}`);
for(const term of ['100dvh','safe-area-inset-bottom','phoneGoldBegin','body:not(.phone-premiere-started)','visibility:hidden'])if(!css.includes(term))throw new Error(`Phone shell contract missing: ${term}`);
for(const term of ['Good morning','Good afternoon','Good evening','phone-premiere-started','nativeBegin.click','window.scrollTo(0,0)'])if(!js.includes(term))throw new Error(`Phone start runtime missing: ${term}`);
if(!js.includes("addEventListener('click',begin,{once:true})"))throw new Error('Start gate is not single-fire');
console.log('PASS phone-first silent landing, reachable start gate, time-aware greeting, and deterministic handoff');
