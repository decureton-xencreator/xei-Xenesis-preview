const isPhone=matchMedia('(max-width:760px)').matches;
if(isPhone&&'speechSynthesis'in window){
  const downstreamSpeak=speechSynthesis.speak.bind(speechSynthesis);
  const scriptMap=new Map([
    ['Ed, can your company remember?','Ed... I want to ask you something. Can a company remember?'],
    ['Not files. Not records. Not data stored somewhere.','Not files. Not records. Not simply data... stored somewhere.'],
    ['Can it remember what you decided, why it mattered, what your best people learned, and what every future company should inherit?','Can it remember what you decided... why it mattered... what your best people learned... and what every future company should inherit?'],
    ['If the right person leaves, how much of the company leaves with them?','And if the right person leaves... how much of the company leaves with them?']
  ]);
  function cloneUtterance(source,text){
    const next=new SpeechSynthesisUtterance(text);
    next.voice=source.voice;next.lang=source.lang;next.rate=source.rate;next.pitch=source.pitch;next.volume=source.volume;
    next.onstart=source.onstart;next.onend=source.onend;next.onerror=source.onerror;next.onpause=source.onpause;next.onresume=source.onresume;next.onboundary=source.onboundary;next.onmark=source.onmark;
    return next;
  }
  speechSynthesis.speak=utterance=>{
    const revised=scriptMap.get(utterance.text);
    downstreamSpeak(revised?cloneUtterance(utterance,revised):utterance);
  };
  document.documentElement.dataset.xvsDelivery='human-shaped-v10';
}
