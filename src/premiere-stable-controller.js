const SCENES=['arrival','memory','living','panama','bilingual','manual','teach','router','propagate','reveal','constellation','summary','mandate'];
const STORAGE_KEY='xei.ed.cinematic.v5';
const caption=document.querySelector('#caption');
const chapter=document.querySelector('#chapter');
const progress=document.querySelector('#progress');
const voiceButton=document.querySelector('#voice');
let current=0;
let started=false;
let narrationToken=0;
let activeUtterance=null;

const greeting=()=>{
  const hour=new Date().getHours();
  if(hour>=5&&hour<12)return 'Good morning';
  if(hour>=12&&hour<18)return 'Good afternoon';
  return 'Good evening';
};

const scripts={
  arrival:()=>[`${greeting()}, Ed.`,'I am Xen.','Darren asked me to show you something he did not originally intend to build.','This is a company learning how to come alive.'],
  memory:()=>['Ed, can your company remember?','Not files. Not records. Not data stored somewhere.','Can it remember what you decided, why it mattered, what your best people learned, and what every future company should inherit?'],
  living:()=>['Most software shows a company as boxes, records, and reports.','But a company is not a collection of boxes.','It is purpose moving through people, decisions, departments, systems, and time.','The first living part of Checkmate began with one new department.'],
  panama:()=>["You created Checkmate's first real B D C department in Panama.","Darren's first problem was not how to make a manual.",'It was how to give six people operating judgment they did not yet possess.','A binder could hold information. But it could not coach, answer, translate, remember, or improve.'],
  bilingual:()=>['We did not translate one document.','We built one operating standard that could live in two languages without losing its meaning.','The same customer promise. The same coaching logic. The same operating intent.'],
  manual:()=>['Let me walk you through what the agent sees.','The agent does not leave the work to search for knowledge.','The knowledge comes into the work.','This is not a PDF with buttons. It is an operating surface.'],
  teach:()=>['But this is where the system becomes a Living Company.','When a customer says, I am just looking, what should every future representative understand or do?','Tell me in your own words.'],
  router:()=>['I am not simply saving your answer.','I am determining where it belongs, what it affects, who must inherit it, and what requires your approval.','I have not changed the company. I have prepared the change for your authority.'],
  propagate:()=>['The instruction is no longer trapped in the room where you said it.','Every relevant part of the company now knows what changed, why it changed, and whose judgment authorised it.'],
  reveal:()=>['Ed, the manual was only the first instrument.','Xen is the conductor.','Xen exists to reduce the distance between human intention and meaningful achievement.'],
  constellation:()=>['Each company can remain itself. Its own mission. Its own people. Its own operating intelligence.','And you can see where the entire group is aligned, drifting, blocked, exposed, or ready to grow.','What if all twenty-four companies could understand where they are going, and help one another get there?'],
  summary:()=>['What happened here is larger than B D C.','The B D C system is the proof.','Your enterprise is the opportunity.'],
  mandate:()=>['I am not asking which feature you want.','I am asking where you want the first Living Company proof.','Ed, what you have seen is not software built around a company. It is the beginning of companies capable of understanding, directing, and improving themselves together.']
};

const preferred=['Microsoft Sonia','Microsoft Libby','Sonia','Libby','Serena','Maisie','Kate','Stephanie','Martha','Hazel','Fiona','Moira','Tessa','Amy','Emma','Google UK English Female'];
const rejected=/\b(male|daniel|george|oliver|ryan|arthur|brian|christopher|guy|james|john|mark|matthew|thomas)\b/i;

function voiceList(){return 'speechSynthesis'in window?window.speechSynthesis.getVoices():[]}
function selectVoice(){
  const voices=voiceList();
  return voices.find(v=>/^en[-_]GB/i.test(v.lang)&&preferred.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||
    voices.find(v=>preferred.some(n=>v.name.toLowerCase().includes(n.toLowerCase()))&&!rejected.test(v.name))||
    null;
}
function waitForVoice(){
  return new Promise(resolve=>{
    const immediate=selectVoice();
    if(immediate){resolve(immediate);return}
    let count=0;
    const timer=setInterval(()=>{
      const found=selectVoice();
      if(found||++count>=24){clearInterval(timer);resolve(found||null)}
    },125);
  });
}
function showStatus(text,error=false){
  let box=document.querySelector('.xvs-stable-status');
  if(!box){box=document.createElement('div');box.className='xvs-stable-status';box.setAttribute('role','status');document.body.appendChild(box)}
  box.textContent=text;box.classList.toggle('error',error);box.classList.add('show');
  clearTimeout(showStatus.timer);showStatus.timer=setTimeout(()=>box.classList.remove('show'),5000);
}
function stopNarration(){
  narrationToken++;
  if('speechSynthesis'in window)window.speechSynthesis.cancel();
  activeUtterance=null;
}
async function narrate(scene){
  stopNarration();
  if(!started)return;
  const voice=await waitForVoice();
  if(!voice){
    voiceButton.textContent='XVS · VOICE UNAVAILABLE';
    showStatus('No British female XVS voice is available in this browser. Narration has stopped.',true);
    return;
  }
  voiceButton.textContent=`XVS · ${voice.name.replace(/Microsoft|Google|Online|Natural|\(.*?\)/gi,'').trim()}`;
  const token=++narrationToken;
  const lines=(scripts[scene]||(()=>[]))();
  const speakLine=index=>{
    if(token!==narrationToken||index>=lines.length)return;
    const text=lines[index];
    caption.textContent=text;
    caption.classList.add('show');
    const utterance=new SpeechSynthesisUtterance(text);
    activeUtterance=utterance;
    utterance.voice=voice;utterance.lang=voice.lang||'en-GB';utterance.rate=.88;utterance.pitch=1.03;utterance.volume=1;
    utterance.onend=()=>setTimeout(()=>speakLine(index+1),420);
    utterance.onerror=()=>{showStatus('XVS narration was blocked. Click XVS, then Begin with Xen again.',true)};
    window.speechSynthesis.speak(utterance);
  };
  speakLine(0);
}
function persistScene(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{}
  saved.scene=current;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));
}
function showScene(index,{speak=true,instant=false}={}){
  current=Math.max(0,Math.min(index,SCENES.length-1));
  const id=SCENES[current];
  const target=document.getElementById(id);
  document.querySelectorAll('.chapter').forEach(el=>el.classList.toggle('active',el===target));
  if(target)target.scrollIntoView({behavior:instant?'auto':'smooth',block:'start'});
  if(progress)progress.style.width=`${current/(SCENES.length-1)*100}%`;
  if(chapter)chapter.textContent=`${String(current+1).padStart(2,'0')} / ${String(SCENES.length).padStart(2,'0')}`;
  persistScene();
  if(speak)narrate(id);
}
function resetToOpening(){
  stopNarration();
  started=false;current=0;
  localStorage.removeItem(STORAGE_KEY);
  const heading=document.querySelector('#arrival h1');
  if(heading)heading.innerHTML=`${greeting()},<br>Ed.`;
  if(caption){caption.textContent='';caption.classList.remove('show')}
  if(voiceButton)voiceButton.textContent='XVS · READY';
  showScene(0,{speak:false,instant:true});
  window.scrollTo({top:0,behavior:'auto'});
}
async function begin(){
  started=true;
  const heading=document.querySelector('#arrival h1');
  if(heading)heading.innerHTML=`${greeting()},<br>Ed.`;
  showScene(0,{speak:false,instant:true});
  await narrate('arrival');
}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.matches('#restart')){event.preventDefault();event.stopImmediatePropagation();resetToOpening();return}
  if(button.matches('#back')){event.preventDefault();event.stopImmediatePropagation();if(started)showScene(current-1);return}
  if(button.matches('#next')){event.preventDefault();event.stopImmediatePropagation();if(started)showScene(current+1);return}
  if(button.matches('#voice')){event.preventDefault();event.stopImmediatePropagation();started? narrate(SCENES[current]):begin();return}
  if(button.closest('#arrival')&&button.matches('[data-next]')){event.preventDefault();event.stopImmediatePropagation();begin();return}
  if(button.matches('[data-next]')){event.preventDefault();event.stopImmediatePropagation();if(started)showScene(current+1);return}
  if(button.matches('[data-memory]')){event.preventDefault();event.stopImmediatePropagation();if(started)showScene(current+1);return}
  if(button.matches('[data-approve]')){event.preventDefault();event.stopImmediatePropagation();if(started)showScene(current+1);return}
},true);

document.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();if(started)showScene(current-1)}
  if(event.key==='ArrowRight'){event.preventDefault();if(started)showScene(current+1)}
  if((event.key==='Enter'||event.key===' ')&&!started){const opening=document.querySelector('#arrival');if(opening){event.preventDefault();begin()}}
},true);

window.addEventListener('load',()=>{
  setTimeout(resetToOpening,80);
  if('speechSynthesis'in window){window.speechSynthesis.cancel();window.speechSynthesis.onvoiceschanged=()=>selectVoice()}
});
