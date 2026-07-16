import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('src/ed-premiere-clean-v1.js','utf8');
const baseCss=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8');
const rolloutCss=fs.readFileSync('src/xde-rollout-v1.css','utf8');
const manifest=JSON.parse(fs.readFileSync('site.webmanifest','utf8'));
const rolloutCanon=fs.readFileSync('docs/XDE-ROLL-001-EXECUTIVE-DOCUMENTARY-ROLLOUT-STANDARD.md','utf8');

for(const file of ['assets/xde-mark.svg','assets/xde-share-card.svg','site.webmanifest','src/xde-rollout-v1.css']){
  if(!fs.existsSync(file))throw new Error(`Missing rollout asset: ${file}`);
}
if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Rollout must preserve the nine-scene skeleton');
for(const term of ['apple-mobile-web-app-capable','og:title','twitter:card','site.webmanifest','data-emotion="arrival"','data-emotion="mandate"','id="selectedMandate"','id="sceneTitle"']){
  if(!html.includes(term))throw new Error(`Rollout shell missing: ${term}`);
}
for(const term of ["version:'2.0.0-rollout'","rolloutStyle.href='src/xde-rollout-v1.css'","start.addEventListener('click',begin)","selectedMandate.textContent","event.key==='Escape'","start.focus({preventScroll:true})"]){
  if(!js.includes(term))throw new Error(`Rollout runtime missing: ${term}`);
}
if(js.includes("start.addEventListener('click',begin,{once:true})"))throw new Error('Restart regression: start listener may not be single-use');
for(const term of ['100dvh','safe-area-inset-bottom','prefers-reduced-motion'])if(!baseCss.includes(term))throw new Error(`Base device resilience missing: ${term}`);
for(const term of ['filmLift','focus-visible','max-height:700px','min-width:761px','mandate-result','footer-center'])if(!rolloutCss.includes(term))throw new Error(`Rollout visual contract missing: ${term}`);
if(manifest.display!=='standalone'||manifest.theme_color!=='#050708'||manifest.icons.length<1)throw new Error('Installable rollout manifest is incomplete');
for(const term of ['One branded route','Repeatable session','Domain readiness','URL activation contract','No placeholder hostname'])if(!rolloutCanon.includes(term))throw new Error(`Rollout canon missing: ${term}`);
for(const forbidden of ['phone-gold-runtime','app-v6.js','speechSynthesis','requestAnimationFrame'])if(html.includes(forbidden)||js.includes(forbidden))throw new Error(`Deprecated rollout dependency detected: ${forbidden}`);
console.log('PASS XDE rollout v1: nine-scene documentary, premium motion layer, repeatable restart, visible selection inheritance, installable/share identity, device resilience, and custom-domain readiness');