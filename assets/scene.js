/* Native MPA snapshots where available. Older engines keep real page navigation.
   Loaded in the head so a fallback destination never paints before its reveal. */
(() => {
 'use strict';
 const root=document.documentElement;
 const native='CSSViewTransitionRule' in window && 'onpageswap' in window;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const key='lilou-scene';
 const classes=['scene-arriving','scene-leaving','scene-reduced'];
 let busy=false;
 let safety;
 function reset(){
  root.classList.remove(...classes);
  busy=false;
  clearTimeout(safety);
 }
 let arriving=false;
 try{
  const pending=JSON.parse(sessionStorage.getItem(key)||'null');
  sessionStorage.removeItem(key);
  arriving=!native&&pending&&pending.to===location.pathname+location.search&&Date.now()-pending.at<8000;
 }catch{/* Storage restrictions must never prevent navigation. */}
 if(arriving){
  root.classList.add('scene-arriving');
  if(reduced.matches)root.classList.add('scene-reduced');
  safety=setTimeout(reset,1800);
 }
 document.addEventListener('DOMContentLoaded',()=>{
  if(!arriving)return;
  const target=reduced.matches?document.body:document.querySelector('.scene-curtain');
  const frames=reduced.matches?[{opacity:0},{opacity:1}]:[{transform:'translate3d(0,0,0)'},{transform:'translate3d(110%,0,0)'}];
  const animation=target.animate(frames,{duration:reduced.matches?90:280,easing:'cubic-bezier(.25,.7,.3,1)',fill:'both'});
  animation.finished.catch(()=>{}).finally(()=>{animation.cancel();reset();});
 },{once:true});
 addEventListener('pageshow',event=>{if(event.persisted)reset();});
 addEventListener('pagehide',reset);
 // Native transitions have no click interception, no pre-navigation delay.
 if(native||!Element.prototype.animate)return;
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self')||link.relList.contains('external'))return;
  const to=new URL(link.href,location.href);
  if(to.origin!==location.origin||to.pathname===location.pathname&&to.search===location.search)return;
  if(!/^\/(?:index|projets|parcours|voyages|contact)(?:\.html)?\/?$/.test(to.pathname)&&to.pathname!=='/')return;
  if(busy){event.preventDefault();return;}
  // If sessionStorage is blocked, preserve normal navigation instead of a half-transition.
  try{sessionStorage.setItem(key,JSON.stringify({to:to.pathname+to.search,at:Date.now()}));}catch{return;}
  event.preventDefault();
  busy=true;
  root.classList.add('scene-leaving');
  if(reduced.matches)root.classList.add('scene-reduced');
  const target=reduced.matches?document.body:document.querySelector('.scene-curtain');
  const frames=reduced.matches?[{opacity:1},{opacity:0}]:[{transform:'translate3d(-110%,0,0)'},{transform:'translate3d(0,0,0)'}];
  const animation=target.animate(frames,{duration:reduced.matches?90:280,easing:'cubic-bezier(.7,0,.75,.3)',fill:'both'});
  animation.finished.then(()=>location.assign(to.href),()=>{reset();try{sessionStorage.removeItem(key);}catch{}}); 
  // Failed/aborted navigations must not leave a closed scene on screen.
  safety=setTimeout(()=>{animation.cancel();reset();try{sessionStorage.removeItem(key);}catch{}},2200);
 });
})();
