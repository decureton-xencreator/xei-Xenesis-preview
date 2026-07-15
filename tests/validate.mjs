import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const seriesHtml=fs.readFileSync('series.html','utf8');
const seriesJs=fs.readFileSync('src/series.js','utf8');
const seriesCss=fs.readFileSync('src/series.css','utf8');
const premiereScenes=['opening','assessment','mri','origin','manual','contribution','route','propagate','reveal','summary','mandate','close'];
const checks={
 'XEI-001 application shell':html.includes('src/app.js')&&html.includes('viewport-fit=cover'),
 'truth-labeled demonstration environment':html.includes('DEMONSTRATION ENVIRONMENT'),
 'approved 12-scene premiere flow':premiereScenes.every(x=>js.includes(`'${x}'`)),
 'BDC is proof before Xen reveal':js.indexOf("scene === 'manual'")<js.indexOf("scene === 'reveal'"),
 'executive assessment and Enterprise MRI':js.includes('Executive assessment')&&js.includes('Enterprise MRI'),
 'XEI-001 session persistence':js.includes('localStorage.setItem')&&js.includes('localStorage.getItem'),
 'guided voice and interruption control':js.includes('speechSynthesis.cancel')&&js.includes('Voice ·'),
 'canonical manual family':['XBM-101','XBM-102','XBM-103','XBM-104'].every(x=>js.includes(x)),
 'embedded searchable living manual':js.includes('manualViewer')&&js.includes('manualSearch')&&!js.includes('target="_blank"'),
 'executive contribution router':js.includes('function classify')&&js.includes('Route my judgment'),
 'governed approval and propagation':js.includes('Executive approval required')&&js.includes('Visible propagation'),
 'canonical Xen reveal':js.includes('This manual is not actually a manual')&&js.includes('Meet Xen'),
 'executive-summary close':js.includes('Executive summary')&&js.includes('What if every company you own'),
 'second-meeting mandate':js.includes('Where should Xen prove itself next')&&js.includes('Checkmate 1 integration and comparison'),
 'honest Checkmate 1 positioning':js.includes('complement, interrogate, or extend Checkmate 1'),
 'large-monitor visual architecture':css.includes('min(1280px,100%)')&&css.includes('.reveal-orbit'),
 'Diamond mobile architecture':css.includes('@media(max-width:560px)')&&css.includes('100svh'),
 'motion accessibility':css.includes('prefers-reduced-motion'),
 'keyboard accessibility':js.includes("ArrowLeft")&&js.includes("ArrowRight")&&css.includes('focus-visible'),
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
let failed=0;
for(const [name,ok] of Object.entries(checks)){
 console.log(`${ok?'PASS':'FAIL'} ${name}`);
 if(!ok)failed++;
}
if(failed)process.exit(1);
console.log(`PASS ${Object.keys(checks).length}/${Object.keys(checks).length} XEI Diamond certification gates`);
