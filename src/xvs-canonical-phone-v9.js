const isPhone=matchMedia('(max-width:760px)').matches;
const preferred=['Sonia','Microsoft Sonia','Libby','Microsoft Libby','Serena','Maisie','Kate','Stephanie','Martha','Hazel','Fiona','Moira','Tessa','Amy','Emma','Google UK English Female'];
const rejected=/\b(male|daniel|george|oliver|ryan|arthur|brian|christopher|guy|james|john|mark|matthew|thomas)\b/i;
let lockedVoice=null;
function resolveCanonicalVoice(){
 if(lockedVoice)return lockedVoice;
 if(!('speechSynthesis'in window))return null;
 const voices=speechSynthesis.getVoices();
 lockedVoice=voices.find(v=>/^en[-_]GB/i.test(v.lang)&&preferred.some(n=>v.name.toLowerCase().includes(n.toLowerCase())))||voices.find(v=>preferred.some(n=>v.name.toLowerCase().includes(n.toLowerCase()))&&!rejected.test(v.name))||null;
 const label=document.querySelector('#voice');
 if(label&&lockedVoice)label.textContent=`XVS · ${lockedVoice.name.replace(/Microsoft|Google|Online|Natural|\(.*?\)/gi,'').trim()}`;
 return lockedVoice;
}
if('speechSynthesis'in window){
 const nativeSpeak=speechSynthesis.speak.bind(speechSynthesis);
 speechSynthesis.speak=utterance=>{
  const voice=resolveCanonicalVoice();
  if(voice){utterance.voice=voice;utterance.lang=voice.lang||'en-GB'}
  utterance.rate=.86;utterance.pitch=1.05;utterance.volume=1;
  nativeSpeak(utterance);
 };
 speechSynthesis.addEventListener?.('voiceschanged',()=>{if(!lockedVoice)resolveCanonicalVoice()});
}
if(isPhone){
 const nativeScroll=Element.prototype.scrollIntoView;
 Element.prototype.scrollIntoView=function(options){
  const top=this.getBoundingClientRect().top+scrollY-96;
  scrollTo({top:Math.max(0,top),left:0,behavior:'auto'});
 };
 document.documentElement.dataset.phoneDirection='frame-first';
}
resolveCanonicalVoice();
