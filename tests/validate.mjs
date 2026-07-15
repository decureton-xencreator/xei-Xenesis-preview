import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app-v4.js','utf8');
const css=fs.readFileSync('src/styles-v4.css','utf8');
const cursor=fs.readFileSync('src/cursor-v4.js','utf8');
const seriesHtml=fs.readFileSync('series.html','utf8');
const seriesJs=fs.readFileSync('src/series.js','utf8');
const seriesCss=fs.readFileSync('src/series.css','utf8');
const premiereScenes=['intro','memory','living','origin','bilingual','manual','evolve','propagate','orchestra','purpose','close'];
const checks={
 'XEI-001 Executive Symphony shell':html.includes('src/app-v4.js')&&html.includes('src/styles-v4.css')&&html.includes('viewport-fit=cover'),
 'approved 11-scene symphony flow':premiereScenes.every(x=>js.includes(`'${x}'`)),
 'automatic XVS opening':js.includes("window.addEventListener('load'")&&js.includes('Welcome to Executive Symphony'),
 'British female XVS resolver':js.includes('femaleNames')&&js.includes('en-gb')&&js.includes('pickXVSVoice'),
 'company memory question':js.includes('Can your company remember?'),
 'Living Company centred on Ed purpose':js.includes("ED'S<br>PURPOSE")&&js.includes("scene==='living'"),
 'correct Checkmate ownership narrative':html.includes('Edward, owner of Checkmate Holding Group')&&js.includes('Ed built the first real Checkmate BDC department in Panama.'),
 'BDC proof before Xen reveal':js.indexOf("scene==='manual'")<js.indexOf("scene==='orchestra'"),
 'bilingual operating infrastructure':js.includes('ENGLISH')&&js.includes('ESPAÑOL')&&js.includes('Comprende antes de persuadir'),
 'interactive living manual':js.includes('manualViewer')&&js.includes('manualSearch')&&js.includes('Ask the manual'),
 'living manual evolution':js.includes('LIVING MANUAL ADD-ON')&&js.includes('Propagate my judgment'),
 'visible governed propagation':js.includes('VISIBLE PROPAGATION')&&js.includes('ATTRIBUTED TO ED'),
 'Executive Symphony reveal':js.includes('The manual was only the first instrument.')&&js.includes('Xen conducts the company.'),
 '24-company purpose orchestration':js.includes('all 24 companies')&&js.includes('Every company directed toward its purpose'),
 'executive-summary close':js.includes('The BDC system is the proof. Your enterprise is the opportunity.'),
 'diamond cursor runtime':html.includes('src/cursor-v4.js')&&cursor.includes('--mx')&&css.includes('body:after'),
 'large-monitor visual architecture':css.includes('min(1420px,100%)')&&css.includes('.enterprise-orbit'),
 'Diamond mobile architecture':css.includes('@media(max-width:620px)')&&css.includes('env(safe-area-inset-bottom)'),
 'motion accessibility':css.includes('prefers-reduced-motion'),
 'keyboard accessibility':js.includes('ArrowLeft')&&js.includes('ArrowRight'),
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
console.log(`PASS ${Object.keys(checks).length}/${Object.keys(checks).length} XEI Executive Symphony certification gates`);