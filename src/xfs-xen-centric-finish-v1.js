const XFS_RELEASE=Object.freeze({studio:'XFS',version:'1.0.0',xenCentric:true,institutionalMemory:true,proofLinks:true,commercialReview:true,controllerOwner:'src/ed-premiere-clean-v1.js'});window.XFS_RELEASE=XFS_RELEASE;document.documentElement.dataset.xfs='1.0.0';

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
  3:'Marisol left the role. Vianka inherited the operating memory. The department did not start over.',
  4:'A Living Company learns when leadership teaches Xen what must endure.',
  5:'One approved principle becomes operating memory across every authorized layer.',
  6:'Once Xen proves what works in one company, the ecosystem can compound it.',
  7:'The next question is simple. Where should Xen prove itself next?',
  8:'The BDC was not Xen’s destination. It was proof Xen works.'
});
const narration=document.querySelector('#directorNarration');
function applyNarration(){if(!narration)return;const i=Number(document.body.dataset.scene||0);if(narrationByScene[i])narration.textContent=narrationByScene[i]}
new MutationObserver(applyNarration).observe(document.body,{attributes:true,attributeFilter:['data-scene']});
applyNarration();

const badge=document.createElement('div');badge.className='xfs-proof-badge';badge.innerHTML='<b>XEN</b> · PROOF + FINISH';document.body.append(badge);

for(const link of document.querySelectorAll('.proof-links a'))link.addEventListener('click',event=>event.stopPropagation());

window.dispatchEvent(new CustomEvent('xfs:ready',{detail:XFS_RELEASE}));
import('./xli-living-interface-v1.js');