const HEADER_OFFSET=92;
const INTERACTIONS={memory:'.choice-row',manual:'.ask',teach:'#contribution',router:'[data-approve]',mandate:'.doors'};
let sceneToken=0,settleTimer=null,lastCaptionChange=Date.now();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function activeScene(){return $('.chapter.active')}
function topFor(el){return Math.max(0,el.getBoundingClientRect().top+window.scrollY-HEADER_OFFSET)}
function frameScene(scene,behavior='smooth'){if(!scene)return;window.scrollTo({top:topFor(scene),left:0,behavior});scene.classList.add('scene-framed')}
function clearInteraction(){$$('.interaction-ready').forEach(el=>el.classList.remove('interaction-ready'));document.body.classList.remove('awaiting-ed')}
function spotlightInteraction(scene){clearInteraction();const sel=INTERACTIONS[scene?.id];if(!sel)return;const target=scene.querySelector(sel);if(!target)return;target.classList.add('interaction-ready');document.body.classList.add('awaiting-ed');const rect=target.getBoundingClientRect(),safeTop=HEADER_OFFSET+40,safeBottom=window.innerHeight-110;if(rect.top<safeTop||rect.bottom>safeBottom){const desired=Math.max(0,rect.top+window.scrollY-(window.innerHeight-rect.height)/2);window.scrollTo({top:desired,left:0,behavior:'smooth'})}target.querySelector('button,input,textarea')?.focus({preventScroll:true})}
function waitForNarrationToSettle(scene,token){clearTimeout(settleTimer);const started=Date.now();const poll=()=>{if(token!==sceneToken||scene!==activeScene())return;const speaking='speechSynthesis'in window&&speechSynthesis.speaking;const cap=$('#caption');const captionVisible=cap?.classList.contains('show')&&cap?.textContent.trim();const captionStable=Date.now()-lastCaptionChange>1250;if((!speaking&&captionVisible&&captionStable&&Date.now()-started>1800)||Date.now()-started>24000){settleTimer=setTimeout(()=>{if(token===sceneToken&&scene===activeScene()&&Date.now()-lastCaptionChange>1250)spotlightInteraction(scene)},500);return}settleTimer=setTimeout(poll,180)};poll()}
function onSceneChange(){sceneToken++;const token=sceneToken;clearTimeout(settleTimer);clearInteraction();const scene=activeScene();if(!scene)return;requestAnimationFrame(()=>requestAnimationFrame(()=>frameScene(scene,'smooth')));if(INTERACTIONS[scene.id])waitForNarrationToSettle(scene,token)}
const nativeScroll=Element.prototype.scrollIntoView;
Element.prototype.scrollIntoView=function(options){const scene=this.closest?.('.chapter');if(scene&&scene.classList.contains('active')){const isBeat=this.matches?.('[data-beat]');if(isBeat&&['memory','living'].includes(scene.id)){frameScene(scene,'smooth');return}if(this.classList?.contains('chapter')){frameScene(this,typeof options==='object'?options.behavior:'smooth');return}}return nativeScroll.call(this,options)};
const observer=new MutationObserver(mutations=>{if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='class'&&m.target.classList?.contains('chapter')))onSceneChange()});
observer.observe($('#film'),{subtree:true,attributes:true,attributeFilter:['class']});
const captionObserver=new MutationObserver(()=>{lastCaptionChange=Date.now()});
captionObserver.observe($('#caption'),{childList:true,characterData:true,subtree:true});
$('#restart')?.addEventListener('click',()=>setTimeout(onSceneChange,80));$('#back')?.addEventListener('click',()=>setTimeout(onSceneChange,80));$('#next')?.addEventListener('click',()=>setTimeout(onSceneChange,80));
document.addEventListener('click',e=>{if(e.target.closest('[data-memory],[data-q],[data-approve],[data-mandate],#route,[data-next]'))clearInteraction()});
window.addEventListener('resize',()=>frameScene(activeScene(),'auto'));setTimeout(onSceneChange,120);
