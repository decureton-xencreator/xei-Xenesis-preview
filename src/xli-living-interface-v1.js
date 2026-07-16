const XLI_RELEASE=Object.freeze({family:'XLI',version:'1.0.0',controllerOwner:'src/ed-premiere-clean-v1.js',observerOnly:true,purposefulMotion:true,reducedMotion:true,visibilityPause:true,monetizationReview:true});
window.XLI_RELEASE=XLI_RELEASE;
document.documentElement.dataset.xli='1.0.0';

const style=document.createElement('link');
style.rel='stylesheet';style.href='src/xli-living-interface-v1.css';style.dataset.owner='XLI';
document.head.append(style);

const motionPurpose=Object.freeze({
  knowledge:'teach-risk',
  choices:'invite-action',
  institutional:'prove-preservation',
  memory:'show-governed-retention',
  artifacts:'prove-product-value',
  enterprise:'show-propagation',
  presence:'acknowledge-xen-guidance'
});
window.XLI_MOTION_PURPOSE=motionPurpose;

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function applyMotionPreference(){document.documentElement.dataset.xliReduced=String(reduced.matches)}
reduced.addEventListener?.('change',applyMotionPreference);applyMotionPreference();
function applyVisibility(){document.documentElement.dataset.xliPaused=String(document.hidden)}
document.addEventListener('visibilitychange',applyVisibility);applyVisibility();

const propagation=[...document.querySelectorAll('.propagation-map span')];
propagation.forEach((node,index)=>node.style.setProperty('--xli-order',String(index)));

for(const node of document.querySelectorAll('.knowledge-field span,.choice,.branch-option,.proof-link,.inheritance-person,.inheritance-core,.propagation-map span,.constellation span')){
  node.dataset.xliPurpose=node.closest('.knowledge-field')?'teach-risk':node.matches('.choice,.branch-option')?'invite-action':node.closest('.inheritance-flow')?'prove-preservation':node.matches('.proof-link')?'prove-product-value':node.closest('.constellation')?'show-propagation':'show-governed-retention';
}

function syncScenePresence(){
  const active=document.querySelector('.scene.active');
  const narration=document.querySelector('.director-narration.visible');
  document.body.dataset.xliScene=active?.dataset.emotion||'landing';
  document.body.dataset.xliSpeaking=String(Boolean(narration&&narration.textContent.trim()));
}
new MutationObserver(syncScenePresence).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class','data-scene']});
syncScenePresence();

const cards=document.querySelectorAll('.proof-link');
for(const card of cards){
  card.setAttribute('aria-describedby','xli-proof-status');
  card.dataset.product='canonical-proof';
}
if(cards.length){
  const status=document.createElement('span');status.id='xli-proof-status';status.className='sr-only';status.textContent='Opens a canonical Xen operating-system proof artifact in a new tab.';document.body.append(status);
}

window.dispatchEvent(new CustomEvent('xli:ready',{detail:XLI_RELEASE}));