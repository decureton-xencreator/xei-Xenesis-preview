const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Good morning':h>=12&&h<18?'Good afternoon':'Good evening'};
const preferred=['Microsoft Sonia','Microsoft Libby','Sonia','Libby','Serena','Maisie','Kate','Stephanie','Martha','Hazel','Fiona','Moira','Tessa','Amy','Emma','Google UK English Female'];
const rejected=/\b(male|daniel|george|oliver|ryan|arthur|brian|christopher|guy|james|john|mark|matthew|thomas)\b/i;
const selectVoice=()=>{if(!('speechSynthesis'in window))return null;const voices=speechSynthesis.getVoices();return voices.find(v=>/^en[-_]GB/i.test(v.lang)&&preferred.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||voices.find(v=>/^en[-_]GB/i.test(v.lang)&&!rejected.test(v.name))||null};
const caption=document.querySelector('#caption');
const voiceButton=document.querySelector('#voice');
const heading=()=>document.querySelector('#arrival h1');
function setGreeting(){const h=heading();if(h)h.innerHTML=`${greeting()},<br>Ed.`}
function status(text,error=false){let box=document.querySelector('.xvs-entry-status');if(!box){box=document.createElement('div');box.className='xvs-stable-status xvs-entry-status';box.setAttribute('role','status');document.body.appendChild(box)}box.textContent=text;box.classList.toggle('error',error);box.classList.add('show');clearTimeout(status.timer);status.timer=setTimeout(()=>box.classList.remove('show'),5000)}
function speakOpening(){
  if(!('speechSynthesis'in window)){status('Narration is not supported in this browser.',true);return}
  const voice=selectVoice();
  if(!voice){status('No British female XVS voice is available. Visual premiere remains active.',true);return}
  speechSynthesis.cancel();
  const lines=[`${greeting()}, Ed.`,'I am Xen.','Darren asked me to show you something he did not originally intend to build.','This is a company learning how to come alive.'];
  let i=0;
  const speakNext=()=>{
    if(i>=lines.length){setTimeout(()=>document.querySelector('#next')?.click(),650);return}
    const text=lines[i++];
    if(caption){caption.textContent=text;caption.classList.add('show')}
    const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang||'en-GB';u.rate=.88;u.pitch=1.03;u.volume=1;u.onend=()=>setTimeout(speakNext,420);u.onerror=()=>status('XVS narration was blocked by the browser. Click Begin with Xen once more.',true);speechSynthesis.speak(u);
  };
  if(voiceButton)voiceButton.textContent=`XVS · ${voice.name.replace(/Microsoft|Google|Online|Natural|\(.*?\)/gi,'').trim()}`;
  speakNext();
}
function install(){
  setGreeting();
  const begin=document.querySelector('#arrival [data-next]');
  if(begin&&!begin.dataset.entryBound){begin.dataset.entryBound='true';begin.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();speakOpening()},{capture:true})}
  if(voiceButton&&!voiceButton.dataset.entryBound){voiceButton.dataset.entryBound='true';voiceButton.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();const v=selectVoice();if(v){voiceButton.textContent=`XVS · ${v.name.replace(/Microsoft|Google|Online|Natural|\(.*?\)/gi,'').trim()}`;status('XVS ready. Click Begin with Xen.')}else status('British female XVS voice unavailable on this browser.',true)},{capture:true})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);
if('speechSynthesis'in window)speechSynthesis.addEventListener?.('voiceschanged',install);
