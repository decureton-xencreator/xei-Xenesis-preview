const phoneControlsEnabled=matchMedia('(max-width:760px)').matches;
if(phoneControlsEnabled){
  const controls=document.createElement('div');
  controls.id='xenPhoneControls';
  controls.innerHTML='<button id="xenPause" type="button" aria-pressed="false">Ⅱ Pause</button><button id="xenCaptions" type="button" aria-pressed="true">CC On</button>';
  const mount=()=>{
    const chrome=document.querySelector('.chrome');
    if(chrome&&!controls.isConnected)chrome.appendChild(controls);
  };
  mount();
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
  const pause=controls.querySelector('#xenPause');
  const captions=controls.querySelector('#xenCaptions');
  let hardPaused=false;
  let captionsOn=true;
  function render(){
    pause.textContent=hardPaused?'▶ Resume':'Ⅱ Pause';
    pause.setAttribute('aria-pressed',String(hardPaused));
    captions.textContent=captionsOn?'CC On':'CC Off';
    captions.setAttribute('aria-pressed',String(captionsOn));
    document.body.classList.toggle('xen-hard-paused',hardPaused);
    document.body.classList.toggle('xen-captions-off',!captionsOn);
  }
  pause.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    hardPaused=!hardPaused;
    if('speechSynthesis'in window)speechSynthesis.cancel();
    render();
    if(!hardPaused){
      const voice=document.querySelector('#voice');
      setTimeout(()=>voice?.click(),80);
    }
  },true);
  captions.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    captionsOn=!captionsOn;render();
  },true);
  const reset=()=>{hardPaused=false;captionsOn=true;render()};
  document.querySelector('#restart')?.addEventListener('click',reset,true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!hardPaused){hardPaused=true;if('speechSynthesis'in window)speechSynthesis.cancel();render()}});
  render();
}
