const STORAGE_KEY='xei.ed.cinematic.v5';
function enforceArrival(){
  localStorage.removeItem(STORAGE_KEY);
  const arrival=document.getElementById('arrival');
  if(!arrival){requestAnimationFrame(enforceArrival);return}
  document.querySelectorAll('.chapter').forEach(scene=>scene.classList.toggle('active',scene===arrival));
  const hour=new Date().getHours();
  const greeting=hour>=5&&hour<12?'Good morning':hour>=12&&hour<18?'Good afternoon':'Good evening';
  const heading=arrival.querySelector('h1');
  if(heading)heading.innerHTML=`${greeting},<br>Ed.`;
  const chapter=document.querySelector('#chapter');
  const progress=document.querySelector('#progress');
  const caption=document.querySelector('#caption');
  if(chapter)chapter.textContent='01 / 13';
  if(progress)progress.style.width='0%';
  if(caption){caption.textContent='';caption.classList.remove('show')}
  window.scrollTo({top:0,left:0,behavior:'auto'});
  document.documentElement.classList.remove('premiere-boot-lock');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(enforceArrival),{once:true});
else requestAnimationFrame(enforceArrival);
window.addEventListener('pageshow',()=>requestAnimationFrame(enforceArrival));