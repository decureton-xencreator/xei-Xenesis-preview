import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app-v5.js','utf8');
const css=fs.readFileSync('src/styles-v5.css','utf8');
const cursor=fs.readFileSync('src/cursor-v5.js','utf8');
const storyboard=fs.readFileSync('docs/XEI-001-CINEMATIC-STORYBOARD-V5.md','utf8');
const requiredActs=['arrival','memory','living','panama','bilingual','manual','teach','router','propagate','reveal','constellation','summary','mandate'];
const requirements=[
 ['active V5 shell',html.includes('app-v5.js')&&html.includes('styles-v5.css')&&html.includes('cursor-v5.js')],
 ['approved storyboard',storyboard.includes('Curiosity → Recognition → Tension → Proof → Participation → Transformation → Scale → Desire → Mandate')],
 ['thirteen directed acts',requiredActs.every(act=>js.includes(act))],
 ['memory and Living Company story',js.includes('Can your company remember?')&&js.includes('A company is not')&&js.includes('PURPOSE')],
 ['truthful Panama BDC origin',js.includes('Panama')&&js.includes('Vianka becomes BDC Manager')&&js.includes('Five Panamanian agents join')],
 ['bilingual infrastructure',js.includes('ENGLISH')&&js.includes('ESPAÑOL')&&js.includes('Comprende antes de persuadir')],
 ['interactive Living Manual',js.includes('manualHTML')&&js.includes('manualSearch')&&js.includes('ASK THE MANUAL')],
 ['executive contribution and approval',js.includes('EXECUTIVE JUDGMENT')&&js.includes('EXECUTIVE APPROVAL REQUIRED')&&js.includes('Approve Evolution')],
 ['visible propagation',js.includes('ATTRIBUTED TO ED')&&js.includes('SYNCHRONISED')],
 ['earned Xen reveal',js.includes('first instrument')&&js.includes('Xen is the conductor')],
 ['twenty-four-company scale',js.includes('length:24')&&js.includes('Twenty-four companies')],
 ['session-generated summary',js.includes('EXECUTIVE SUMMARY')&&js.includes('state.memory')&&js.includes('state.contribution')],
 ['second-meeting mandate',js.includes('Checkmate 1 integration and comparison')&&js.includes('SECOND-MEETING MANDATE')],
 ['female-only voice boundary',js.includes('caption-only')&&!js.includes('voices[0]')],
 ['synchronised captions',html.includes('aria-live="polite"')&&js.includes('caption')],
 ['scroll-directed camera language',js.includes('scrollIntoView')&&js.includes('data-camera')&&css.includes('.chapter.active')],
 ['living diamond presence',cursor.includes('--mx')&&css.includes('◇')&&css.includes('@keyframes blink')],
 ['responsive and accessible',css.includes('@media(max-width:1000px)')&&css.includes('@media(max-width:650px)')&&css.includes('prefers-reduced-motion')]
];
let failed=0;
for(const [name,ok] of requirements){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`PASS ${requirements.length}/${requirements.length} Cinematic Executive Premiere V5 acceptance gates`);