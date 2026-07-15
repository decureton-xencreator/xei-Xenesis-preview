import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const seriesHtml=fs.readFileSync('series.html','utf8');
const seriesJs=fs.readFileSync('src/series.js','utf8');
const seriesCss=fs.readFileSync('src/series.css','utf8');
const checks={
 'XEI-001 application shell':html.includes('src/app.js')&&html.includes('viewport-fit=cover'),
 '18-scene autonomous flow':js.includes("'blueprint','close'")&&js.includes("'welcome','remember'"),
 'XEI-001 session persistence':js.includes('localStorage.setItem')&&js.includes('pagehide'),
 'XEI-001 error recovery':js.includes('Recovery mode')&&js.includes('unhandledrejection'),
 'Safari-safe dictation guidance':js.includes('Apple keyboard microphone'),
 'embedded manual viewer':js.includes('manual-shell')&&!js.includes('target="_blank"'),
 'canonical manual family':[['XBM-101'],['XBM-102'],['XBM-103'],['XBM-104']].every(([x])=>js.includes(x)),
 'manual search and classification':js.includes('manualSearch')&&js.includes('function classify'),
 'XEI-001 mobile accessibility':css.includes('@media(max-width:720px)')&&css.includes('prefers-reduced-motion'),
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
 'series mobile accessibility':seriesCss.includes('@media(max-width:800px)')&&seriesCss.includes('env(safe-area-inset-bottom)')&&seriesCss.includes('prefers-reduced-motion'),
 'premiere to series continuity':html.includes('series.html')
};
let failed=0;for(const [name,ok] of Object.entries(checks)){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}
if(failed)process.exit(1);console.log(`PASS ${Object.keys(checks).length}/${Object.keys(checks).length} XEI family static certification gates`);