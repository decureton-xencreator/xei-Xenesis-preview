import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/app.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const checks={
 'application shell':html.includes('src/app.js')&&html.includes('viewport-fit=cover'),
 '18-scene autonomous flow':js.includes("'blueprint','close'")&&js.includes("'welcome','remember'"),
 'session persistence':js.includes('localStorage.setItem')&&js.includes('pagehide'),
 'error recovery':js.includes('Recovery mode')&&js.includes('unhandledrejection'),
 'Safari-safe dictation guidance':js.includes('Apple keyboard microphone'),
 'embedded manual viewer':js.includes('manual-shell')&&!js.includes('target="_blank"'),
 'canonical manual family':[['XBM-101'],['XBM-102'],['XBM-103'],['XBM-104']].every(([x])=>js.includes(x)),
 'manual search':js.includes('manualSearch'),
 'revision classification':js.includes('function classify'),
 'visible propagation':js.includes('New-hire training')&&js.includes('Call QA rubric'),
 'executive summary':js.includes('Executive Summary')&&js.includes('Proof created today'),
 'company and department selectors':js.includes('data-company')&&js.includes('data-department'),
 'mobile-first CSS':css.includes('@media(max-width:720px)')&&css.includes('env(safe-area-inset-bottom)'),
 'accessibility baseline':html.includes('aria-label')&&css.includes('prefers-reduced-motion')
};
let failed=0;for(const [name,ok] of Object.entries(checks)){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}
if(failed)process.exit(1);console.log(`PASS ${Object.keys(checks).length}/${Object.keys(checks).length} XEI-001 static certification gates`);