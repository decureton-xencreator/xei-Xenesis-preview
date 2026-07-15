const isMobile=matchMedia('(max-width:760px)').matches;
const femaleNames=['Serena','Martha','Samantha','Karen','Moira','Fiona','Tessa','Ava','Zoe','Victoria','Kate','Stephanie','Sonia','Libby','Maisie','Hazel','Amy','Emma'];
let fallbackVoice=null, fallbackEnabled=false, lastCaption='';
const $=s=>document.querySelector(s);
function voices(){return 'speechSynthesis'in window?speechSynthesis.getVoices():[]}
function pickFallback(){const all=voices();fallbackVoice=all.find(v=>/^en[-_]GB/i.test(v.lang)&&femaleNames.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||all.find(v=>/^en/i.test(v.lang)&&femaleNames.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||null;return fallbackVoice}
function arrivalState(){const arrival=$('#arrival');const active=arrival?.classList.contains('active');document.body.classList.toggle('mobile-arrival',!!active);if(active)document.body.classList.remove('premiere-started')}
function notice(title,body){document.querySelector('.xvs-mobile-notice')?.remove();const n=document.createElement('div');n.className='xvs-mobile-notice';n.innerHTML=`<strong>${title}</strong>${body}`;document.body.append(n);setTimeout(()=>n.remove(),7000)}
function activateFallback(){if(!isMobile)return;const voice=pickFallback();if(voice){fallbackEnabled=true;const label=$('#voice');if(label)label.textContent=`XVS · ${voice.name.replace(/Microsoft|Google|Online|Natural|\(.*?\)/gi,'').trim()}`;return}fallbackEnabled=false;notice('XVS voice unavailable in this in-app browser','The premiere will continue with captions. For spoken narration, open this page directly in Safari, where iPhone voice services are available.')}
function speakFallback(text){if(!fallbackEnabled||!fallbackVoice||!text||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.voice=fallbackVoice;u.lang=fallbackVoice.lang||'en-GB';u.rate=.88;u.pitch=1.04;u.volume=1;speechSynthesis.cancel();speechSynthesis.speak(u)}
const filmObserver=new MutationObserver(arrivalState);filmObserver.observe($('#film'),{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
const caption=$('#caption');if(caption){new MutationObserver(()=>{const text=caption.textContent.trim();if(text&&text!==lastCaption){lastCaption=text;speakFallback(text)}}).observe(caption,{childList:true,characterData:true,subtree:true})}
document.addEventListener('click',e=>{const begin=e.target.closest('#begin');if(begin){document.body.classList.remove('mobile-arrival');document.body.classList.add('premiere-started');activateFallback()}},true);
if('speechSynthesis'in window)speechSynthesis.addEventListener?.('voiceschanged',()=>{if(document.body.classList.contains('premiere-started')&&!fallbackVoice)activateFallback()});
arrivalState();