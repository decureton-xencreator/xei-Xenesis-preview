const isPhone=window.matchMedia('(max-width:760px)').matches;
if(isPhone){
  const html=document.documentElement;
  const body=document.body;
  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Good morning':h>=12&&h<18?'Good afternoon':'Good evening'};
  const shell=document.createElement('section');
  shell.id='phoneGold';
  shell.setAttribute('aria-label','Xen Executive Premiere opening');
  shell.innerHTML=`<div class="pg-brand">XEN <span>◇</span> EXECUTIVE PREMIERE</div><div class="pg-stage"><div class="pg-diamond-wrap" aria-hidden="true"><i class="pg-ring"></i><i class="pg-ring r2"></i><div class="pg-diamond"></div></div><div class="pg-copy"><small>PRIVATE EXECUTIVE PREMIERE</small><h1>${greeting()},<br>Ed.</h1><p>One guided experience. Nothing begins until you do.</p></div></div><div><button id="phoneGoldBegin" type="button">Begin with Xen</button><div class="pg-hint">Tap once to begin the guided premiere</div></div>`;
  body.prepend(shell);
  const beginButton=shell.querySelector('#phoneGoldBegin');
  function showLanding(){
    if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.resume?.()}
    body.classList.remove('phone-premiere-started','xen-hard-paused','xen-captions-off','phone-interaction-open');
    html.classList.add('phone-gold-open');
    shell.hidden=false;
    beginButton.disabled=false;
    window.scrollTo(0,0);
  }
  function begin(){
    beginButton.disabled=true;
    body.classList.add('phone-premiere-started');
    html.classList.remove('phone-gold-open');
    shell.hidden=true;
    window.scrollTo(0,0);
    requestAnimationFrame(()=>{
      const nativeBegin=document.querySelector('#begin');
      if(nativeBegin){nativeBegin.click();return}
      document.querySelector('#voice')?.click();
    });
  }
  beginButton.addEventListener('click',begin);
  document.querySelector('#restart')?.addEventListener('click',()=>requestAnimationFrame(showLanding),true);
  showLanding();
}