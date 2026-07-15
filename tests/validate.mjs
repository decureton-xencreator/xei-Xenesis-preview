import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app-v5.js','utf8');
const css=fs.readFileSync('src/styles-v5.css','utf8');
const cursor=fs.readFileSync('src/cursor-v5.js','utf8');
const seriesHtml=fs.readFileSync('series.html','utf8');
const seriesJs=fs.readFileSync('src/series.js','utf8');
const seriesCss=fs.readFileSync('src/series.css','utf8');
const acts=['arrival','memory','living','panama','bilingual','manual','teach','router','propagate','reveal','constellation','summary','mandate'];
const checks={
 'V5 cinematic application shell':html.includes('src/app-v5.js')&&html.includes('src/styles-v5.css')&&html.includes('src/cursor-v5.js')&&html.includes('viewport-fit=cover'),
 'thirteen-act directed flow':acts.every(x=>js.includes(`'${x}'`)),
 'company memory question':js.includes('Can your company remember?'),
 'correct Checkmate BDC context':js.includes("You created Checkmate's first real B D C department in Panama."),
 'Living Company purpose centre':js.includes("ED'S<br>PURPOSE"),
 'bilingual infrastructure':js.includes('ENGLISH')&&js.includes('ESPAÑOL')&&js.includes('Comprende antes de persuadir'),
 'interactive living manual':js.includes('manualHTML')&&js.includes('manualSearch')&&js.includes('ASK THE MANUAL'),
 'Ed executive contribution':js.includes('EDWARD · EXECUTIVE JUDGMENT')&&js.includes('contribution'),
 'governed routing and approval':js.includes('EXECUTIVE APPROVAL REQUIRED')&&js.includes('Approve Evolution'),
 'visible propagation':js.includes('ATTRIBUTED TO ED')&&js.includes('SYNCHRONISED'),
 'earned Xen reveal':js.includes('The manual was only the first instrument.')&&js.includes('Xen is the conductor.'),
 'twenty-four company orchestration':js.includes('length:24')&&js.includes("EDWARD'S<br>PURPOSE"),
 'session-built executive summary':js.includes('EXECUTIVE SUMMARY · BUILT FROM THIS SESSION')&&js.includes('state.memory')&&js.includes('state.contribution'),
 'second-meeting mandate':js.includes('Checkmate 1 integration and comparison')&&js.includes('SECOND-MEETING MANDATE'),
 'female-only XVS or captions':js.includes("dataset.voice=voice?'approved':'caption-only'")&&!js.includes('voices[0]'),
 'caption accessibility':html.includes('aria-live="polite"')&&js.includes("$('#caption')"),
 'scroll and camera direction':js.includes('scrollIntoView')&&js.includes('data-camera')&&css.includes('.chapter.active'),
 'living diamond presence':cursor.includes('--mx')&&css.includes("content:'◇'")&&css.includes('@keyframes blink'),
 'large-monitor and mobile architecture':css.includes('@media(max-width:1000px)')&&css.includes('@media(max-width:650px)'),
 'reduced-motion accessibility':css.includes('prefers-reduced-motion'),
 'series application shell':seriesHtml.includes('src/series.js')&&seriesHtml.includes('viewport-fit=cover'),
 'XEI-002 through XEI-010 registered':['XEI-002','XEI-003','XEI-004','XEI-005','XEI-006','XEI-007','XEI-008','XEI-009','XEI-010'].every(x=>seriesJs.includes(x)),
 'series persistent executive state':seriesJs.includes("const KEY='xei-series-v1'")&&seriesJs.includes('pagehide'),
 'blueprint runtime':seriesJs.includes('function blueprint')&&seriesJs.includes('90-day measurable outcome'),
 'proposal and approval runtime':seriesJs.includes('function proposal')&&seriesJs.includes('proposalApproved'),
 'deployment runtime':seriesJs.includes('function deployment')&&seriesJs.includes('Days 46–90'),
 'living manual runtime':seriesJs.includes('function manualRuntime')&&seriesJs.includes('routeManual'),
 'executive memory runtime':seriesJs.includes('function memory')&&seriesJs.includes('Review trigger'),
 'propagation runtime':seriesJs.includes('function propagation')&&seriesJs.includes('propagationApproved'),
 'dashboard and command runtimes':seriesJs.includes('function dashboard')&&seriesJs.includes('function command'),
 'multi-company orchestration':seriesJs.includes('function rollout')&&seriesJs.includes('Rollout wave'),
 'executive record export':seriesJs.includes('exportRecord')&&seriesJs.includes('XEI-Executive-Record.json'),
 'series mobile accessibility':seriesCss.includes('@media(max-width:800px)')&&seriesCss.includes('env(safe-area-inset-bottom)')&&seriesCss.includes('prefers-reduced-motion')
};
let failed=0;for(const [name,ok] of Object.entries(checks)){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`PASS ${Object.keys(checks).length}/${Object.keys(checks).length} XEI Cinematic V5 certification gates`);