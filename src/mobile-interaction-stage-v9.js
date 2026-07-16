const phoneStageEnabled=matchMedia('(max-width:760px)').matches;
if(phoneStageEnabled){
  const stage=document.createElement('section');
  stage.id='phoneInteractionStage';
  stage.setAttribute('role','dialog');
  stage.setAttribute('aria-modal','true');
  stage.setAttribute('aria-label','Your turn, Ed');
  stage.innerHTML='<div class="pis-label">Your turn, Ed</div><div class="pis-content"></div>';
  document.body.appendChild(stage);
  const content=stage.querySelector('.pis-content');
  const moved=[];
  const interactionMap={memory:['.choice-row'],manual:['.ask'],teach:['#contribution','#route'],router:['[data-approve]'],mandate:['.doors']};
  let opening=false;
  function restore(){
    for(const item of moved.splice(0))item.placeholder.replaceWith(item.node);
    stage.classList.remove('open');
    document.body.classList.remove('phone-interaction-open');
    content.replaceChildren();
    opening=false;
  }
  function activeScene(){return document.querySelector('.chapter.active')}
  function openStage(){
    if(opening||!document.body.classList.contains('awaiting-ed'))return;
    const scene=activeScene();
    const selectors=interactionMap[scene?.id];
    if(!selectors)return;
    restore();opening=true;
    for(const selector of selectors){
      const node=scene.querySelector(selector);
      if(!node)continue;
      const placeholder=document.createComment(`phone-stage:${selector}`);
      node.replaceWith(placeholder);
      moved.push({node,placeholder});
      node.classList.remove('interaction-ready');
      content.appendChild(node);
    }
    if(!moved.length){opening=false;return}
    document.querySelector('#caption')?.classList.remove('show');
    stage.classList.add('open');
    document.body.classList.add('phone-interaction-open');
    requestAnimationFrame(()=>content.querySelector('button,input,textarea')?.focus({preventScroll:true}));
  }
  const bodyObserver=new MutationObserver(()=>{
    if(document.body.classList.contains('awaiting-ed'))setTimeout(openStage,80);
    else if(stage.classList.contains('open'))restore();
  });
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  const filmObserver=new MutationObserver(()=>{if(stage.classList.contains('open'))restore()});
  filmObserver.observe(document.querySelector('#film'),{subtree:true,attributes:true,attributeFilter:['class']});
  stage.addEventListener('click',event=>{
    if(event.target.closest('button,[data-memory],[data-q],[data-approve],[data-mandate],#route,[data-next]'))setTimeout(restore,30);
  });
  document.querySelector('#restart')?.addEventListener('click',restore);
  document.querySelector('#back')?.addEventListener('click',restore);
  document.querySelector('#next')?.addEventListener('click',restore);
  window.visualViewport?.addEventListener('resize',()=>{
    const height=window.visualViewport.height;
    document.documentElement.style.setProperty('--xen-visual-height',`${height}px`);
  });
}
