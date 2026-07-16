import fs from 'node:fs';
const css=fs.readFileSync('src/ed-premiere-clean-v1.css','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const term of ['.scene>*{flex-shrink:0}','contain:layout paint','overflow-y:auto','overscroll-behavior:contain']){
  if(!css.includes(term))throw new Error(`Missing global compartment protection: ${term}`);
}
for(const term of ['.scene[data-emotion="scale"]','min-height:360px','flex-basis:360px','overflow:hidden','padding-bottom:24px;border-bottom']){
  if(!css.includes(term))throw new Error(`Missing enterprise compartment protection: ${term}`);
}
for(const term of ['knowledge-field','propagation-map','constellation','footer-center']){
  if(!html.includes(term)||!css.includes(`.${term}`))throw new Error(`Missing protected documentary zone: ${term}`);
}
if(!css.includes('@media(max-height:760px)')||!css.includes('@media(max-width:380px)'))throw new Error('Actual short and narrow phone viewport protections are required');
if((html.match(/class="scene/g)||[]).length!==9)throw new Error('Compartment correction must preserve the nine-scene skeleton');
console.log('PASS XDE compartment integrity: visuals cannot flex-shrink into narrative copy, enterprise constellation is isolated, and short/narrow phone viewports have explicit geometry.');