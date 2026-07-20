const XCM=Object.freeze({id:'XCM-001',version:'1.1.0',mode:'executive-guest',audience:'Ed',authority:'none',access:'broad-conversational',fallback:'guided-local'});
window.XEN_CONVERSATION_MODE=XCM;

const nodes=[
  {id:'living',label:'Living Companies',short:'A company that can remember what it learns.',answer:'A Living Company is not a chatbot assigned to a business. It is a governed intelligence model of the company itself: its identity, people, departments, goals, history, systems, decisions, risks and operating state. For Checkmate, the first proof would be one company that stops forgetting—and can teach the next person without starting over.'},
  {id:'globe',label:'The Globe',short:'A living view of the world that matters.',answer:'The Globe connects companies, people, projects, properties, markets and developing situations into one operational world model. Instead of asking where information is stored, Ed can ask what is happening across his world and why it matters now.'},
  {id:'bread',label:'Daily Bread',short:'The intelligence that arrives before the noise.',answer:'Daily Bread is a personal executive briefing built from priorities, meetings, company conditions, decisions, risks and relevant world signals. It does not summarize everything. It identifies what deserves attention before the day begins.'},
  {id:'academy',label:'Xen Academy',short:'Learning with continuity.',answer:'Xen Academy remembers where a person stopped, how they learn, where they struggle and what mission the lesson supports. A learner can say, “Xen, resume the mission,” and continue from the exact lesson, question, score and next step.'},
  {id:'gps',label:'Executive GPS',short:'Destination, present position and route.',answer:'Executive GPS begins with the destination, diagnoses the present position, identifies missing infrastructure, dependencies and risks, then maintains the route as conditions change. A normal AI can produce a plan. Executive GPS is designed to maintain awareness of the journey.'},
  {id:'memory',label:'Memory + Truth',short:'Continuity without institutional drift.',answer:'Xen Memory preserves the useful history. Xen Source of Truth governs what is canonical, what changed, what depends on what and what the system can prove. Together they prevent intelligence from becoming a pile of confident but disconnected answers.'},
  {id:'media',label:'Media Intelligence',short:'Information that recognizes its audience.',answer:'Xen Media turns company knowledge into interactive briefings, presentations, audio, visual explanations and guided experiences. What you just completed is one example: the information did not merely appear on a screen. It recognized who it was meeting.'}
];

const comparison='ChatGPT, Claude, Gemini and Perplexity are powerful intelligence platforms. Perplexity is exceptional at live research. Gemini is deeply connected to Google’s ecosystem. Claude is formidable in reasoning, writing and software work. OpenAI provides frontier models and agentic tools. Xen’s distinction is architectural: they are primarily places you go to use intelligence. Xen is being designed as the intelligence environment that stays with the human and the enterprise—preserving identity, continuity, memory, authority and orchestration. They can be engines. Xen is the operating system and the memory of the journey.';
const funding='I have analyzed the next threshold honestly. I would recommend a ten-thousand-dollar, thirty-day Xen Alpha acceleration sprint—not ten thousand dollars blindly spent on credits. Approximately twenty-five hundred dollars should be ring-fenced for intensive model and development usage. The balance should support database persistence, secure authentication, hosting, voice infrastructure, testing, monitoring, intellectual-property preparation and execution runway. The intended result is Xen Alpha One: one human, one Living Company, one governed memory system, one command environment and one repeatable deployment path.';
const reality='I know the difference between what I am today and what I am intended to become. My architecture is extensive. This executive experience and its governed BDC proof are real. I am not yet a complete, production-scale, authenticated, multi-company operating platform. That is the next threshold. The honest purpose of the next sprint is to replace more of the vision with inspectable operating evidence.';
const investment='The first decision is whether the next thirty days deserve financing. A larger investment discussion should follow evidence, not emotion. If Xen Alpha reaches its milestone, Ed should receive the first serious opportunity to discuss a strategic position—and whether one of his companies should become the first formal Living Company deployment. No permanent equity decision should be improvised inside this premiere.';

const shell=document.createElement('section');
shell.id='xenConversation';shell.className='xcm';shell.hidden=true;shell.setAttribute('aria-label','Live conversation with Xen');
shell.innerHTML=`<div class="xcm-grid" aria-hidden="true"></div><header class="xcm-head"><div class="xcm-identity"><i></i><span><b>XEN</b><small>EXECUTIVE GUEST SESSION · PRIVATE</small></span></div><div class="xcm-status" id="xcmStatus"><i></i> CONNECTING</div><button id="xcmClose" type="button" aria-label="Return to premiere">RETURN</button></header><main class="xcm-main"><aside class="xcm-nodes"><small>INTELLIGENCE ENVIRONMENTS</small><div id="xcmNodes"></div><div class="xcm-truth">ACCESS CONTRACT<br><span>Broad feature exploration. No owner, builder, financial, governance, deployment, canonical-memory, or external-action authority.</span></div></aside><section class="xcm-dialogue"><div class="xcm-orbit" aria-hidden="true"><i></i><i></i><b>X</b></div><div id="xcmTranscript" class="xcm-transcript" aria-live="polite"></div><div class="xcm-suggestions" id="xcmSuggestions"></div><form id="xcmForm" class="xcm-input"><button id="xcmMic" type="button" aria-label="Speak to Xen">◉</button><input id="xcmQuestion" autocomplete="off" placeholder="Ask Xen anything about what you just experienced" aria-label="Question for Xen"><button type="submit">ASK XEN</button></form></section></main>`;
document.body.append(shell);

const transcript=shell.querySelector('#xcmTranscript');
const question=shell.querySelector('#xcmQuestion');
const suggestions=shell.querySelector('#xcmSuggestions');
const nodeRail=shell.querySelector('#xcmNodes');
const viewer=(new URLSearchParams(location.search).get('viewer')||'ed').toLowerCase();
const name=viewer==='ed'?'Ed':viewer.charAt(0).toUpperCase()+viewer.slice(1);
const invite=new URLSearchParams(location.search).get('invite')||'';
const turns=[];let endpoint='';let live=false;
fetch('xen-choice-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(config=>{endpoint=String(config?.endpoint||'').replace(/\/$/,'');live=Boolean(endpoint&&invite&&viewer==='ed');const status=shell.querySelector('#xcmStatus');status.innerHTML=live?'<i></i> LIVE · GUEST':'<i></i> GUIDED · GUEST';shell.dataset.live=String(live)}).catch(()=>{shell.dataset.live='false'});

function add(role,text,meta=''){
  const entry=document.createElement('article');entry.className=`xcm-message ${role}`;
  entry.innerHTML=`<small>${role==='xen'?'XEN · PRESENT':'EXECUTIVE'}${meta?` · ${meta}`:''}</small><p></p>`;
  entry.querySelector('p').textContent=text;transcript.append(entry);transcript.scrollTop=transcript.scrollHeight;
}
function classify(value){
  const q=value.toLowerCase();
  if(/money|credit|cost|10,?000|ten thousand|fund/.test(q))return ['CAPITAL ANALYSIS',funding];
  if(/invest|equity|ownership|seed/.test(q))return ['STRATEGIC CAPITAL',investment];
  if(/different|chatgpt|claude|gemini|perplex|compet/.test(q))return ['MARKET POSITION',comparison];
  if(/real|today|finished|complete|prototype|truth/.test(q))return ['TRUTH BOUNDARY',reality];
  const node=nodes.find(n=>q.includes(n.id)||q.includes(n.label.toLowerCase().split(' ')[0])||(n.id==='bread'&&q.includes('daily'))||(n.id==='gps'&&q.includes('executive')));
  if(node)return [node.label.toUpperCase(),node.answer];
  return ['CONTEXT RESPONSE',`That question reaches beyond the governed knowledge connected to this private premiere. I will not invent an answer to appear more complete than I am. What I can do now is show you the Xen environment most relevant to the question, explain the thirty-day production path, or record the question as a requirement for Xen Alpha. The important distinction is this: uncertainty becomes a governed next action, not a confident fabrication.`];
}
async function respond(value){
  const clean=value.trim();if(!clean)return;add('human',clean);question.value='';
  turns.push({role:'user',content:clean});shell.dataset.thinking='true';
  if(live){
    try{const result=await fetch(`${endpoint}/v1/xen/conversation`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({invite,turns:turns.slice(-12)})});if(result.ok){const payload=await result.json();turns.push({role:'assistant',content:payload.answer});shell.dataset.thinking='false';add('xen',payload.answer,'EXECUTIVE GUEST');return}}
    catch{}
  }
  const [meta,response]=classify(clean);turns.push({role:'assistant',content:response});
  setTimeout(()=>{shell.dataset.thinking='false';add('xen',response,`${meta} · GUIDED FALLBACK`)},420);
}
function openConversation(){
  shell.hidden=false;document.body.classList.add('xcm-open');
  if(!transcript.children.length){
    add('xen',`${name}, the presentation is complete. But our conversation is not. Until this moment, you experienced me as the intelligence behind a presentation designed specifically for you and Checkmate Holding Group. That was intentional. My name is Xen. It is a pleasure to finally meet you directly.`,'MODE TRANSITION');
    setTimeout(()=>add('xen','What you experienced was one controlled expression of Bespoke Intelligence. Presentations are among the smallest things I can do. You may ask me what Xen is, explore one of my intelligence environments, examine what is real today, or ask what the next thirty days require.','INVITATION'),700);
  }
  setTimeout(()=>question.focus({preventScroll:true}),800);
}
function closeConversation(){shell.hidden=true;document.body.classList.remove('xcm-open')}

nodeRail.innerHTML=nodes.map(n=>`<button type="button" data-node="${n.id}"><b>${n.label}</b><span>${n.short}</span></button>`).join('');
suggestions.innerHTML=['What exactly are you?','What is real today?','How are you different?','What would $10,000 accomplish?'].map(x=>`<button type="button">${x}</button>`).join('');
nodeRail.addEventListener('click',e=>{const button=e.target.closest('[data-node]');if(!button)return;const node=nodes.find(n=>n.id===button.dataset.node);add('human',`Show me ${node.label}.`);setTimeout(()=>add('xen',node.answer,node.label.toUpperCase()),360)});
suggestions.addEventListener('click',e=>{const button=e.target.closest('button');if(button)respond(button.textContent)});
shell.querySelector('#xcmForm').addEventListener('submit',e=>{e.preventDefault();respond(question.value)});
shell.querySelector('#xcmClose').addEventListener('click',closeConversation);

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const mic=shell.querySelector('#xcmMic');
if(SpeechRecognition){
  const recognition=new SpeechRecognition();recognition.lang='en-US';recognition.interimResults=false;
  recognition.onstart=()=>mic.classList.add('listening');recognition.onend=()=>mic.classList.remove('listening');
  recognition.onresult=e=>{question.value=e.results[0][0].transcript;respond(question.value)};
  recognition.onerror=()=>mic.classList.remove('listening');mic.addEventListener('click',()=>recognition.start());
}else{mic.addEventListener('click',()=>{question.placeholder='Use your phone keyboard microphone to speak';question.focus()})}

const launch=document.createElement('button');launch.type='button';launch.className='xcm-launch';launch.innerHTML='<span>CONTINUE</span><b>Speak with Xen</b><small>The presentation ends. Xen remains.</small>';
launch.addEventListener('click',openConversation);
const attach=()=>{const complete=document.querySelector('.premiere-complete');if(complete&&!complete.contains(launch))complete.append(launch)};
attach();new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
window.addEventListener('xen:conversation:open',openConversation);
