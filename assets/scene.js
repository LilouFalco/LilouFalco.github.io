/* One arrival-only diagonal pixel wave. Navigation is never held behind a cover. */
(() => {
 'use strict';
 const key='lilou-scene',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let arriving=false;
 try{
  const pending=JSON.parse(sessionStorage.getItem(key)||'null');sessionStorage.removeItem(key);
  arriving=pending&&pending.to===location.pathname+location.search&&Date.now()-pending.at<8000;
 }catch{/* Navigation still works when storage is unavailable. */}
 function clear(){document.querySelector('.scene-wave')?.remove();}
 addEventListener('pageshow',event=>{if(event.persisted)clear();});
 if(arriving)document.addEventListener('DOMContentLoaded',()=>{
  if(reduced.matches)return;
  const wave=document.createElement('div');wave.className='scene-wave';wave.setAttribute('aria-hidden','true');
  const animations=[];
  for(let row=0;row<10;row++)for(let col=0;col<16;col++){
   const pixel=document.createElement('i');wave.append(pixel);
   // Each block is present briefly, then clears, while later diagonals are still entering.
   const animation=pixel.animate([
    {opacity:0,transform:'scale(.6)',offset:0},
    {opacity:.95,transform:'scale(1.02)',offset:.3},
    {opacity:.95,transform:'scale(1.02)',offset:.5},
    {opacity:0,transform:'scale(.8)',offset:1}
   ],{duration:140,delay:(row+col)*15,fill:'both',easing:'linear'});
   animations.push(animation);
  }
  document.body.append(wave);
  Promise.all(animations.map(a=>a.finished)).catch(()=>{}).finally(clear);
  setTimeout(clear,1200);
 },{once:true});
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self')||link.relList.contains('external'))return;
  const to=new URL(link.href,location.href);
  if(to.origin!==location.origin||to.pathname===location.pathname&&to.search===location.search)return;
  if(!/^\/(?:index|projets|parcours|voyages|contact)(?:\.html)?\/?$/.test(to.pathname)&&to.pathname!=='/')return;
  try{sessionStorage.setItem(key,JSON.stringify({to:to.pathname+to.search,at:Date.now()}));}catch{/* Keep normal link behavior. */}
 });
})();
