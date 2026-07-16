const phoneTransportEnabled=matchMedia('(max-width:760px)').matches;
if(phoneTransportEnabled){
  const button=document.createElement('button');
  button.id='xenTransport';
  button.type='button';
  button.setAttribute('aria-label','Pause Xen narration');
  button.innerHTML='<span class="transport-icon">Ⅱ</span><span class="transport-label">Pause Xen</span>';
  document.body.appendChild(button);
  let paused=false;
  function render(){
    button.querySelector('.transport-icon').textContent=paused?'▶':'Ⅱ';
    button.querySelector('.transport-label').textContent=paused?'Resume Xen':'Pause Xen';
    button.setAttribute('aria-label',paused?'Resume Xen narration':'Pause Xen narration');
    document.body.classList.toggle('xen-paused',paused);
  }
  button.addEventListener('click',()=>{
    if(!('speechSynthesis'in window))return;
    paused=!paused;
    if(paused)speechSynthesis.pause();else speechSynthesis.resume();
    render();
  });
  const reset=()=>{if(paused&&'speechSynthesis'in window)speechSynthesis.resume();paused=false;render()};
  document.querySelector('#restart')?.addEventListener('click',reset);
  document.querySelector('#back')?.addEventListener('click',reset);
  document.querySelector('#next')?.addEventListener('click',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&speechSynthesis.speaking&&!speechSynthesis.paused){paused=true;speechSynthesis.pause();render()}});
  render();
}
