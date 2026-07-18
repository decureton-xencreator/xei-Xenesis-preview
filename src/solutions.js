const SUITE='https://checkmate-bdc-operating-system.pages.dev';
const reportChoice=(type,path=null)=>import('./choice-telemetry.js').then(module=>module.reportChoice(type,path));
const manuals=[
 ['XBM-101','BDC Manager Operating System','Leadership, coaching, control, escalation, and daily management.'],
 ['XBM-102','BDC Agent Field Guide','Customer promise, qualification, appointments, follow-up, and CRM discipline.'],
 ['XBM-103','Objection Response Fieldbook','Customer-first responses, approved frameworks, and escalation discipline.'],
 ['XBM-104','BDC Script Playbook','Opening, discovery, appointment, follow-up, and communication language.'],
 ['XBM-105','Objection Handling + Sales Psychology','How customers decide and how representatives preserve trust.'],
 ['XBM-106','Coaching + Performance Operating System','Calibration, coaching rhythm, accountability, and improvement.'],
 ['XBM-107','Analytics + KPI Operating System','Measurement, reporting, diagnosis, and performance visibility.'],
 ['XBM-108','BDC Academy + Certification System','Role-based learning, practice, assessment, and certification.'],
 ['XBM-109','Franchise Replication System','Governed replication across locations, teams, and operating layers.']
];
const routes={
 bdc:{code:'BDC DEPLOYMENT + MEASUREMENT SESSION',title:'Complete the BDC proof.',body:'Use a focused working session to determine the deployment boundary, operating owner, rollout sequence, and measurable proof.',agenda:['Confirm the department and executive sponsor','Review current workflows and approved publications','Define the operating problem and adoption plan','Select the first measurable proof and review cadence']},
 company:{code:'LIVING COMPANY BLUEPRINT SESSION',title:'Build one Living Company.',body:'Before Xen builds, Xen must understand. This session maps the real organization deeply enough to recommend one truthful company-layer pilot.',agenda:['Map company leadership and decision authority','Identify departments, systems, and workflow dependencies','Locate knowledge loss and operating friction','Define the pilot outcome and measurable proof']},
 compare:{code:'CHECKMATE OPERATING-LAYER COMPARISON',title:'Design an honest Checkmate 1 comparison.',body:'Compare complementary and overlapping capability through one controlled use case—without pretending to know systems that have not yet been inspected.',agenda:['Choose one inspectable operating use case','Define fair capability and outcome criteria','Map system boundaries and integration assumptions','Agree on evidence, owners, and the next decision']}
};
const params=new URLSearchParams(location.search);const incomingViewer=params.get('viewer');if(incomingViewer)sessionStorage.setItem('xen_gateway_viewer',incomingViewer);const viewer=incomingViewer||sessionStorage.getItem('xen_gateway_viewer');const viewerQuery=viewer?'?viewer='+encodeURIComponent(viewer):'';
for(const id of ['premiereLink','returnPremiere']){const link=document.getElementById(id);if(link)link.href='index.html'+viewerQuery}
const grid=document.getElementById('manualGrid');
for(const [id,title,description] of manuals){const card=document.createElement('article');card.className='manual-card';const href=`${SUITE}/${id}/manual.html`;card.innerHTML=`<small>${id}</small><h3>${title}</h3><p>${description}</p><div><a href="${href}" target="_blank" rel="noopener">Open full manual ↗</a><button type="button" data-copy="${href}">Copy link</button></div>`;grid.append(card)}
const toast=document.getElementById('toast');let toastTimer=0;function announce(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('visible');toastTimer=setTimeout(()=>toast.classList.remove('visible'),2400)}
async function copy(value,label){try{await navigator.clipboard.writeText(value);announce(label+' copied.')}catch{announce('Copy unavailable. Select the address from your browser.')}}
document.addEventListener('click',event=>{const button=event.target.closest('[data-copy]');if(button)copy(button.dataset.copy,'Manual link')});
document.getElementById('copySuite').addEventListener('click',()=>copy(SUITE,'Complete suite link'));
const brief=document.getElementById('appointmentBrief');const agenda=document.getElementById('appointmentAgenda');const copyBrief=document.getElementById('copyBrief');const printBrief=document.getElementById('printBrief');let selected=null;
function renderBrief(key,{focus=true,report=false}={}){selected=routes[key];if(!selected)return;sessionStorage.setItem('xen_gateway_path',key);if(report)void reportChoice('second_appointment_continued',key);document.querySelectorAll('[data-appointment]').forEach(button=>button.classList.toggle('selected',button.dataset.appointment===key));brief.querySelector('small').textContent=selected.code;brief.querySelector('h3').textContent=selected.title;brief.querySelector('p').textContent=selected.body;agenda.innerHTML=selected.agenda.map(item=>`<li>${item}</li>`).join('');copyBrief.disabled=false;printBrief.disabled=false;if(focus)requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('appointment').scrollIntoView({behavior:'smooth',block:'start'})))}
document.getElementById('appointmentOptions').addEventListener('click',event=>{const button=event.target.closest('[data-appointment]');if(button)renderBrief(button.dataset.appointment,{report:true})});
document.addEventListener('click',event=>{const button=event.target.closest('[data-select-path]');if(button)renderBrief(button.dataset.selectPath,{report:true})});
copyBrief.addEventListener('click',()=>{if(!selected)return;copy([selected.code,selected.title,selected.body,'AGENDA',...selected.agenda.map((item,index)=>`${index+1}. ${item}`)].join('\n\n'),'Appointment brief')});
printBrief.addEventListener('click',()=>{if(selected)window.print()});
const legacyPath=params.get('path');const savedPath=sessionStorage.getItem('xen_gateway_path');const initial=routes[legacyPath]?legacyPath:routes[savedPath]?savedPath:null;if(legacyPath)history.replaceState(null,'','solutions.html#appointment');if(initial)renderBrief(initial,{focus:location.hash==='#appointment'||Boolean(legacyPath)});
