const XFS_RELEASE=Object.freeze({studio:'XFS',version:'1.2.1',xenCentric:true,institutionalMemory:true,proofLinks:true,manualReturn:true,contentPlane:true,solutionsGateway:true,singleGateway:true,commercialReview:true,controllerOwner:'src/ed-premiere-clean-v1.js',finaleNarrationOwner:'branch-controller'});window.XFS_RELEASE=XFS_RELEASE;document.documentElement.dataset.xfs='1.2.1';
const reportChoice=(type,path=null)=>import('./choice-telemetry.js').then(module=>module.reportChoice(type,path));
document.querySelector('#start')?.addEventListener('click',()=>{void reportChoice('premiere_started')},{once:true});let completionReported=false;new MutationObserver(()=>{if(!completionReported&&document.body.dataset.completed==='true'){completionReported=true;void reportChoice('premiere_completed',sessionStorage.getItem('xen_gateway_path'))}}).observe(document.body,{attributes:true,attributeFilter:['data-completed']});

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
  3:'Marisol worked with Checkmate for roughly six months. During that time, she used the operating knowledge base you created with Xen. When she left the role, that shared knowledge did not leave with her. Xen preserved the connected department, its standards, and the reasoning already built into the work. Vianka inherited governed operating memory instead of an empty chair. Browse the complete manuals below and choose one governed publication to inspect the proof.',
  4:'A Living Company learns when leadership teaches Xen what must endure.',
  5:'One approved principle becomes operating memory across every authorized layer.',
  6:'Once Xen proves what works in one company, the ecosystem can compound it.',
  7:'The next question is simple. Where should Xen prove itself next?'

});
const narration=document.querySelector('#directorNarration');
function applyNarration(){if(!narration)return;if(['kim','ahmer'].includes(document.body.dataset.viewer))return;const i=Number(document.body.dataset.scene||0);if(i>=8)return;if(narrationByScene[i])narration.textContent=narrationByScene[i]}
new MutationObserver(applyNarration).observe(document.body,{attributes:true,attributeFilter:['data-scene']});
applyNarration();

const badge=document.createElement('div');badge.className='xfs-proof-badge';badge.innerHTML='<b>XEN</b> · PROOF + FINISH';document.body.append(badge);

const proofLinks=[...scene.querySelectorAll('.proof-links a')];
const reviewInvitation=document.createElement('section');reviewInvitation.className='review-invitation canonical-library';reviewInvitation.innerHTML='<small>CANONICAL MANUAL LIBRARY</small><h3>Browse the complete manuals.</h3><p>Every link below opens the full governed publication—never a summary, sample, or knockoff.</p><strong id="reviewPrompt">Choose one full manual to inspect the proof.</strong>';
const proofLinksContainer=scene.querySelector('.proof-links');if(proofLinksContainer)proofLinksContainer.insertAdjacentElement('beforebegin',reviewInvitation);
const viewer=new URLSearchParams(location.search).get('viewer');if(viewer)sessionStorage.setItem('xen_gateway_viewer',viewer);const solutionsLink=document.createElement('a');solutionsLink.className='solutions-gateway-link';solutionsLink.href='solutions.html#paths';solutionsLink.textContent='Explore licensing, deployment, and Living Company paths →';reviewInvitation.append(solutionsLink);
const manualViewer=document.createElement('section');manualViewer.className='manual-research-viewer';manualViewer.hidden=true;manualViewer.setAttribute('aria-label','Canonical manual research viewer');manualViewer.innerHTML='<header class="manual-research-toolbar"><button class="manual-research-back" type="button">← Back to Xen Demo</button><strong id="manualResearchTitle">Canonical XBM publication</strong><a class="manual-research-external" target="_blank" rel="noopener">Open in new tab ↗</a></header><iframe class="manual-research-frame" title="Canonical Checkmate BDC manual" loading="eager" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"></iframe>';document.body.append(manualViewer);
const manualFrame=manualViewer.querySelector('.manual-research-frame');const manualTitle=manualViewer.querySelector('#manualResearchTitle');const manualExternal=manualViewer.querySelector('.manual-research-external');const manualBack=manualViewer.querySelector('.manual-research-back');let returnLink=null;
function openManualResearch(link){returnLink=link;proofLinks.forEach(node=>node.classList.toggle('selected',node===link));const title=link.textContent.trim();reviewInvitation.querySelector('#reviewPrompt').textContent='Opening full publication: '+title+'.';manualTitle.textContent=title;manualExternal.href=link.href;manualFrame.src=link.href;manualViewer.hidden=false;document.body.dataset.manualResearch='open';window.dispatchEvent(new CustomEvent('xen:hold'));manualBack.focus({preventScroll:true})}
function closeManualResearch(){if(manualViewer.hidden)return;manualViewer.hidden=true;manualFrame.src='about:blank';document.body.dataset.manualResearch='closed';window.dispatchEvent(new CustomEvent('xen:resume'));returnLink?.focus({preventScroll:true})}
manualBack.addEventListener('click',closeManualResearch);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!manualViewer.hidden){event.preventDefault();closeManualResearch()}});
for(const link of proofLinks){link.dataset.canonical='full-publication';link.setAttribute('aria-label',link.textContent.trim()+' — open full governed publication in the research viewer');link.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openManualResearch(link)})}

const completion=document.querySelector('.premiere-complete');if(completion){const rolloutLink=solutionsLink.cloneNode(true);rolloutLink.classList.add('final-rollout-link');rolloutLink.textContent='Continue into the Xen Solutions Gateway →';completion.append(rolloutLink)}
const pathByMandate={'Finish the BDC operating system':'bdc','Build one company operating layer':'company','Run a Checkmate 1 comparison':'compare'};document.addEventListener('click',event=>{const choice=event.target.closest('[data-mandate],.branch-option[data-branch]');if(!choice)return;const mandate=choice.dataset.mandate||choice.dataset.branch;const path=pathByMandate[mandate];if(path){sessionStorage.setItem('xen_gateway_path',path);void reportChoice('path_selected',path);document.querySelectorAll('.solutions-gateway-link').forEach(link=>{link.href='solutions.html#appointment'})}});

window.dispatchEvent(new CustomEvent('xfs:ready',{detail:XFS_RELEASE}));
import('./xli-living-interface-v1.js');
