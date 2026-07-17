const XFS_RELEASE=Object.freeze({studio:'XFS',version:'1.0.1',xenCentric:true,institutionalMemory:true,proofLinks:true,commercialReview:true,controllerOwner:'src/ed-premiere-clean-v1.js',finaleNarrationOwner:'branch-controller'});window.XFS_RELEASE=XFS_RELEASE;document.documentElement.dataset.xfs='1.0.1';

const scene=[...document.querySelectorAll('.scene')][3];
if(!scene)throw new Error('Institutional-memory scene is missing');
const set=(selector,text)=>{const node=scene.querySelector(selector);if(node)node.textContent=text};
set('.eyebrow','03 · INSTITUTIONAL MEMORY');
set('h1','People can leave without the company starting over.');
const body=scene.querySelector(':scope > p');
if(body)body.textContent='When Marisol left the role, Vianka inherited a governed operating department—not an empty chair and a folder of disconnected files.';
scene.dataset.label='Open the Living Department';
scene.dataset.emotion='institutional-memory';
scene.dataset.proof='XBM-SUITE';

const narrationByScene=Object.freeze({
  1:'Growth creates knowledge. Xen makes sure growth does not lose what it teaches.',
  2:'Most companies answer that risk with documents. Xen preserves the judgment behind them.',
  3:'Marisol carried years of operating judgment inside the role. When she left, the knowledge did not leave with her. Xen preserved the connected department, its standards, and the reasoning behind the work. Vianka inherited operating memory instead of an empty chair. Browse the complete manuals below and choose one governed publication to inspect the proof.',
  4:'A Living Company learns when leadership teaches Xen what must endure.',
  5:'One approved principle becomes operating memory across every authorized layer.',
  6:'Once Xen proves what works in one company, the ecosystem can compound it.',
  7:'The next question is simple. Where should Xen prove itself next?'

});
const narration=document.querySelector('#directorNarration');
function applyNarration(){if(!narration)return;const i=Number(document.body.dataset.scene||0);if(i>=8)return;if(narrationByScene[i])narration.textContent=narrationByScene[i]}
new MutationObserver(applyNarration).observe(document.body,{attributes:true,attributeFilter:['data-scene']});
applyNarration();

const badge=document.createElement('div');badge.className='xfs-proof-badge';badge.innerHTML='<b>XEN</b> · PROOF + FINISH';document.body.append(badge);

const proofLinks=[...scene.querySelectorAll('.proof-links a')];
const reviewInvitation=document.createElement('section');reviewInvitation.className='review-invitation canonical-library';reviewInvitation.innerHTML='<small>CANONICAL MANUAL LIBRARY</small><h3>Browse the complete manuals.</h3><p>Every link below opens the full governed publication—never a summary, sample, or knockoff.</p><strong id="reviewPrompt">Choose one full manual to inspect the proof.</strong>';
const proofLinksContainer=scene.querySelector('.proof-links');if(proofLinksContainer)proofLinksContainer.insertAdjacentElement('beforebegin',reviewInvitation);
for(const link of proofLinks){link.dataset.canonical='full-publication';link.setAttribute('aria-label',link.textContent.trim()+' — open full governed publication');link.addEventListener('click',event=>{event.stopPropagation();proofLinks.forEach(node=>node.classList.toggle('selected',node===link));reviewInvitation.querySelector('#reviewPrompt').textContent='Opening full publication: '+link.textContent.trim()+'.';window.dispatchEvent(new CustomEvent('xen:hold'))})}

window.dispatchEvent(new CustomEvent('xfs:ready',{detail:XFS_RELEASE}));
import('./xli-living-interface-v1.js');