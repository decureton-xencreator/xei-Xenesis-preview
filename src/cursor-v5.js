const cursor=document.createElement('div');
cursor.id='xen-cursor';
cursor.setAttribute('aria-hidden','true');
cursor.innerHTML='<span>◇</span>';
document.body.appendChild(cursor);
let frame=0;
let x=innerWidth/2;
let y=innerHeight/2;
function paint(){
  cursor.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
  frame=0;
}
addEventListener('pointermove',event=>{
  x=event.clientX;
  y=event.clientY;
  cursor.classList.remove('hidden');
  if(!frame) frame=requestAnimationFrame(paint);
},{passive:true});
addEventListener('pointerdown',()=>{
  cursor.classList.add('active');
  setTimeout(()=>cursor.classList.remove('active'),180);
},{passive:true});
addEventListener('pointerleave',()=>cursor.classList.add('hidden'));
addEventListener('pointerenter',()=>cursor.classList.remove('hidden'));
paint();