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
const pitchSections=[
  {step:'01 · THE IMMEDIATE ASK',title:'Fund the next thirty days.',body:'$10,000 in controlled build credits and execution runway for one Xen Alpha acceleration sprint. This is the first decision—not an improvised equity ask.'},
  {step:'02 · THE MILESTONE',title:'Replace vision with inspectable proof.',body:'One authenticated executive. One Living Company pilot. Governed memory and Source of Truth. One command environment. One repeatable deployment path.'},
  {step:'03 · WHAT XEN IS',title:'The operating architecture around intelligence.',body:'Models can be engines. Xen preserves identity, memory, authority, continuity, company context, orchestration, and the route from intention to execution.'},
  {step:'04 · THE ENVIRONMENTS',title:'One intelligence, many living expressions.',body:'Living Companies · The Globe · Daily Bread · Xen Academy · Executive GPS · Memory + Truth · Media Intelligence.'},
  {step:'05 · THE SEED',title:'Investment follows evidence.',body:'If Xen Alpha reaches the milestone, Ed receives the first serious opportunity to discuss a strategic position and a first formal Checkmate Living Company deployment.'}
];

const shell=document.createElement('section');
shell.id='xenConversation';shell.className='xcm';shell.hidden=true;shell.setAttribute('aria-label','Live conversation with Xen');
shell.innerHTML=`<div class="xcm-grid" aria-hidden="true"></div><header class="xcm-head"><div class="xcm-identity"><i></i><span><b>XEN</b><small>EXECUTIVE GUEST SESSION · PRIVATE</small></span></div><div class="xcm-status" id="xcmStatus"><i></i> CONNECTING</div><button id="xcmClose" type="button" aria-label="Return to premiere">RETURN</button></header><main class="xcm-main"><aside class="xcm-nodes"><small>INTELLIGENCE ENVIRONMENTS</small><div id="xcmNodes"></div><div class="xcm-truth">ACCESS CONTRACT<br><span>Broad feature exploration. No owner, builder, financial, governance, deployment, canonical-memory, or external-action authority.</span></div></aside><section class="xcm-dialogue"><div class="xcm-orbit" aria-hidden="true"><i></i><i></i><b>X</b></div><div id="xcmTranscript" class="xcm-transcript" aria-live="polite"></div><div class="xcm-suggestions" id="xcmSuggestions"></div><form id="xcmForm" class="xcm-input"><button id="xcmMic" type="button" aria-label="Speak to Xen">◉</button><input id="xcmQuestion" autocomplete="off" placeholder="Ask Xen anything about what you just experienced" aria-label="Question for Xen"><button type="submit">ASK XEN</button></form></section></main>`;
shell.insertAdjacentHTML('afterbegin','<div class="xcm-threshold" aria-hidden="true"><div class="xcm-threshold-signal"><i></i><b>X</b></div><p>ED, THE PRESENTATION IS COMPLETE.</p><h2>BUT OUR CONVERSATION IS NOT.</h2><small>XEN · DIRECT PRESENCE ESTABLISHED</small></div>');
shell.insertAdjacentHTML('beforeend',`<section class="xcm-pitch" id="xcmPitch" aria-label="Xen executive pitch"><div class="xcm-pitch-intro"><small>XEN · EXECUTIVE PROPOSITION</small><h2>Ed, before we end,<br>there is one more thing.</h2><p>Xen will present the immediate capital decision, the thirty-day proof, and what earns a larger conversation.</p></div><div class="xcm-pitch-sections">${pitchSections.map(section=>`<article><small>${section.step}</small><h3>${section.title}</h3><p>${section.body}</p></article>`).join('')}</div><div class="xcm-pitch-status"><i></i><span>CANONICAL XEN VOICE · PRESENTING</span></div></section>`);
document.body.append(shell);

const transcript=shell.querySelector('#xcmTranscript');
const question=shell.querySelector('#xcmQuestion');
const suggestions=shell.querySelector('#xcmSuggestions');
const nodeRail=shell.querySelector('#xcmNodes');
const pitchStage=shell.querySelector('#xcmPitch');
const pitchAudio=document.createElement('audio');pitchAudio.preload='auto';pitchAudio.setAttribute('playsinline','');pitchAudio.setAttribute('webkit-playsinline','');pitchAudio.setAttribute('aria-hidden','true');shell.append(pitchAudio);
const viewer=(new URLSearchParams(location.search).get('viewer')||'ed').toLowerCase();
const name=viewer==='ed'?'Ed':viewer.charAt(0).toUpperCase()+viewer.slice(1);
const invite=new URLSearchParams(location.search).get('invite')||'';
const turns=[];let endpoint='';let live=false;let pitchReady=false;let pitchStarted=false;
const PITCH_SHA256='15863e90b015339e20b2f811476ff12457d018c99c45d174eb476bb32e171a2c';
const pitchManifestPromise=fetch('assets/narration/xcm-v1/manifest.json?v=15863e90b015339e',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('pitch-manifest-http-'+response.status);return response.json()}).then(manifest=>{if(manifest.schema!=='xen-executive-pitch/v1'||manifest.pitchId!=='ed-executive-pitch-v1'||manifest.voice!=='marin'||manifest.voiceContract!=='XVS-001-MARIN-EXCLUSIVE-v1'||manifest.approvedAudition!=='assets/narration/xen-voice-audition-v2.mp3'||manifest.sha256!==PITCH_SHA256||manifest.path!=='assets/narration/xcm-v1/ed-executive-pitch-v1.mp3')throw new Error('pitch-manifest-contract');pitchAudio.src=`${manifest.path}?v=${manifest.sha256}`;pitchReady=true;document.body.dataset.pitchVoice='verified';document.querySelector('.xcm-launch')?.removeAttribute('disabled');return true}).catch(error=>{document.body.dataset.pitchVoice='blocked';document.body.dataset.pitchError=String(error?.message||'manifest');document.querySelector('.xcm-launch')?.setAttribute('disabled','');return false});
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
function finishPitch(){
  shell.classList.remove('pitching');shell.classList.add('conversation-ready');pitchStage.setAttribute('aria-hidden','true');
  if(!transcript.children.length){add('xen',`${name}, that is the immediate proposition. You now have broad access to explore the Xen environments and challenge the thirty-day plan. You have no owner, builder, financial, governance, deployment, memory, or external-action authority.`,'PITCH COMPLETE');add('xen','Ask what the ten-thousand-dollar sprint accomplishes, select an intelligence environment, compare Xen with another platform, or challenge what is real today.','INVITATION')}
  question.focus({preventScroll:true});
}
function openConversation(){
  if(!pitchReady){document.body.dataset.warden='blocked';return}
  shell.hidden=false;shell.classList.add('entering','pitching');document.body.classList.add('xcm-open');pitchStage.removeAttribute('aria-hidden');pitchStarted=true;
  pitchAudio.currentTime=0;pitchAudio.muted=false;pitchAudio.volume=1;pitchAudio.onended=finishPitch;pitchAudio.onerror=()=>{document.body.dataset.warden='blocked';document.body.dataset.pitchVoice='blocked';closeConversation()};
  const play=pitchAudio.play();if(play)play.catch(()=>{document.body.dataset.pitchVoice='blocked';closeConversation()});
  setTimeout(()=>{shell.classList.remove('entering');shell.classList.add('present')},3000);
}
function closeConversation(){pitchAudio.pause();pitchAudio.currentTime=0;shell.hidden=true;shell.classList.remove('entering','present','pitching','conversation-ready');document.body.classList.remove('xcm-open')}

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

const launch=document.createElement('button');launch.type='button';launch.className='xcm-launch';launch.disabled=true;launch.innerHTML='<span>ONE MORE THING</span><b>Click here for one more thing.</b><small>Xen will present the thirty-day proposition herself</small>';
launch.addEventListener('click',openConversation);
const attach=()=>{const complete=document.querySelector('.premiere-complete');if(complete&&!complete.contains(launch))complete.append(launch)};
attach();new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
window.addEventListener('xen:conversation:open',openConversation);
pitchManifestPromise.then(ready=>{if(!ready){launch.innerHTML='<span>WARDEN HOLD</span><b>Xen’s canonical pitch is mastering.</b><small>This entrance will not open silently or with an unapproved voice.</small>'}});
