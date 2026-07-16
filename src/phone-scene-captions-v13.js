const phoneSceneCaptions=matchMedia('(max-width:760px)').matches;
if(phoneSceneCaptions){
  const captions=document.querySelector('.captions');
  const film=document.querySelector('#film');
  const anchorMap={arrival:'.title-stack',memory:'.hero-copy',living:'h1',panama:'h1',bilingual:'h1',manual:'h1',teach:'.hero-copy',router:'h1',propagate:'h1',reveal:'h2',constellation:'h1',summary:'h1',mandate:'h1'};
  function ensureSlot(scene){
    if(!scene)return null;
    let slot=scene.querySelector(':scope > .phone-scene-caption-slot');
    if(!slot){
      slot=document.createElement('div');
      slot.className='phone-scene-caption-slot';
      slot.setAttribute('aria-label','Xen captions');
      const anchor=scene.querySelector(anchorMap[scene.id]||'h1');
      if(anchor)anchor.insertAdjacentElement('afterend',slot);else scene.prepend(slot);
    }
    return slot;
  }
  function placeCaption(){
    const active=film?.querySelector('.chapter.active');
    const slot=ensureSlot(active);
    if(slot&&captions&&captions.parentElement!==slot)slot.appendChild(captions);
  }
  const observer=new MutationObserver(placeCaption);
  if(film)observer.observe(film,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',placeCaption,{passive:true});
  requestAnimationFrame(placeCaption);
}