const PHONE=matchMedia('(max-width:760px)').matches;
if(PHONE){
  const html=document.documentElement;
  const body=document.body;
  const synth='speechSynthesis'in window?window.speechSynthesis:null;
  const nativeSpeak=synth?.speak.bind(synth);
  const nativeCancel=synth?.cancel.bind(synth);
  const runtime={started:false,paused:false,captionsOn:true,restarting:false,active:null};
  window.XenPhoneGoldRuntime=runtime;

  if(synth&&nativeSpeak&&nativeCancel){
    synth.speak=utterance=>{
      const originalEnd=utterance.onend;
      const originalError=utterance.onerror;
      runtime.active={utterance,originalEnd,originalError};
      utterance.onend=event=>{
        if(runtime.paused||runtime.restarting)return;
        runtime.active=null;
        originalEnd?.call(utterance,event);
      };
      utterance.onerror=event=>{
        if(runtime.paused||runtime.restarting||event?.error==='canceled'||event?.error==='interrupted')return;
        runtime.active=null;
        originalError?.call(utterance,event);
      };
      nativeSpeak(utterance);
    };
    synth.cancel=()=>{
      runtime.active=null;
      nativeCancel();
    };
  }

  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Good morning':h>=12&&h<18?'Good afternoon':'Good evening'};
  const shell=document.createElement('section');
  shell.id='phoneGold';
  shell.setAttribute('aria-label','Xen Executive Premiere opening');
  shell.innerHTML=`<div class="pg-brand">XEN <span>◇</span> EXECUTIVE PREMIERE</div><div class="pg-stage"><div class="pg-diamond-wrap" aria-hidden="true"><i class="pg-ring"></i><i class="pg-ring r2"></i><div class="pg-diamond"></div></div><div class="pg-copy"><small>PRIVATE EXECUTIVE PREMIERE</small><h1>${greeting()},<br>Ed.</h1><p>One guided experience. Nothing begins until you do.</p></div></div><div><button id="phoneGoldBegin" type="button">Begin with Xen</button><div class="pg-hint">Tap once to begin the guided premiere</div></div>`;
  body.prepend(shell);
  const beginButton=shell.querySelector('#phoneGoldBegin');

  const controls=document.createElement('div');
  controls.id='xenPhoneControls';
  controls.innerHTML='<button id="xenPause" type="button" aria-pressed="false">Ⅱ Pause</button><button id="xenCaptions" type="button" aria-pressed="true">CC On</button>';
  document.querySelector('.chrome')?.appendChild(controls);
  const pauseButton=controls.querySelector('#xenPause');
  const ccButton=controls.querySelector('#xenCaptions');

  function renderControls(){
    pauseButton.textContent=runtime.paused?'▶ Resume':'Ⅱ Pause';
    pauseButton.setAttribute('aria-pressed',String(runtime.paused));
    ccButton.textContent=runtime.captionsOn?'CC On':'CC Off';
    ccButton.setAttribute('aria-pressed',String(runtime.captionsOn));
    body.classList.toggle('xen-hard-paused',runtime.paused);
    body.classList.toggle('xen-captions-off',!runtime.captionsOn);
  }

  function pauseNarration(){
    if(runtime.paused)return;
    runtime.paused=true;
    if(runtime.active&&nativeCancel)nativeCancel();
    renderControls();
  }

  function resumeNarration(){
    if(!runtime.paused)return;
    runtime.paused=false;
    const active=runtime.active;
    renderControls();
    if(active?.utterance&&nativeSpeak){
      const utterance=active.utterance;
      utterance.onend=event=>{runtime.active=null;active.originalEnd?.call(utterance,event)};
      utterance.onerror=event=>{if(event?.error!=='canceled'&&event?.error!=='interrupted'){runtime.active=null;active.originalError?.call(utterance,event)}};
      nativeSpeak(utterance);
    }
  }

  pauseButton.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    runtime.paused?resumeNarration():pauseNarration();
  },true);
  ccButton.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    runtime.captionsOn=!runtime.captionsOn;
    renderControls();
  },true);

  const captions=document.querySelector('.captions');
  const film=document.querySelector('#film');
  const anchorMap={arrival:'h1',memory:'.hero-copy',living:'h1',panama:'h1',bilingual:'h1',manual:'h1',teach:'.hero-copy',router:'h1',propagate:'h1',reveal:'h2',constellation:'h1',summary:'h1',mandate:'h1'};
  function placeCaption(){
    const scene=film?.querySelector('.chapter.active');
    if(!scene||!captions)return;
    let slot=scene.querySelector(':scope > .phone-scene-caption-slot');
    if(!slot){
      slot=document.createElement('div');
      slot.className='phone-scene-caption-slot';
      slot.setAttribute('aria-label','Xen captions');
      const anchor=scene.querySelector(anchorMap[scene.id]||'h1');
      if(anchor)anchor.insertAdjacentElement('afterend',slot);else scene.prepend(slot);
    }
    if(captions.parentElement!==slot)slot.appendChild(captions);
  }
  new MutationObserver(placeCaption).observe(film,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(placeCaption).observe(document.querySelector('#caption'),{childList:true,characterData:true,subtree:true});

  function showLanding(){
    runtime.restarting=true;
    runtime.started=false;
    runtime.paused=false;
    runtime.captionsOn=true;
    runtime.active=null;
    nativeCancel?.();
    body.classList.remove('phone-premiere-started','xen-hard-paused','xen-captions-off','phone-interaction-open');
    html.classList.add('phone-gold-open');
    shell.hidden=false;
    beginButton.disabled=false;
    document.querySelector('#caption').textContent='';
    window.scrollTo(0,0);
    renderControls();
    setTimeout(()=>{runtime.restarting=false},150);
  }

  function begin(){
    if(runtime.started)return;
    runtime.started=true;
    runtime.restarting=false;
    beginButton.disabled=true;
    body.classList.add('phone-premiere-started');
    html.classList.remove('phone-gold-open');
    shell.hidden=true;
    window.scrollTo(0,0);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      placeCaption();
      document.querySelector('#begin')?.click();
    }));
  }
  beginButton.addEventListener('click',begin);

  document.querySelector('#restart')?.addEventListener('click',()=>{
    runtime.restarting=true;
    nativeCancel?.();
    setTimeout(showLanding,0);
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('#back,#next,[data-memory],[data-next],#route,[data-approve],[data-mandate]')){
      runtime.paused=false;
      runtime.active=null;
      nativeCancel?.();
      renderControls();
    }
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&runtime.started)pauseNarration()});

  renderControls();
  showLanding();
  requestAnimationFrame(placeCaption);
}
