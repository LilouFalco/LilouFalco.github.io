/* Progressive enhancement of the local, offline-generated world atlas.
   No tiles, external libraries, remote requests, or tracking. */
(() => {
 'use strict';
 const details={FRA:['🇫🇷'],ESP:['🇪🇸'],PRT:['🇵🇹'],MAR:['🇲🇦','2021'],GIB:['◆'],HRV:['🇭🇷'],DEU:['🇩🇪'],ITA:['🇮🇹'],THA:['🇹🇭','2016'],JPN:['🇯🇵','mai 2023'],KOR:['🇰🇷','déc. 2023'],VNM:['🇻🇳','mars 2026'],CHN:['▣']};
 const ns='http://www.w3.org/2000/svg';
 const visited=new Map([...document.querySelectorAll('[data-visited]')].map(li=>[li.dataset.visited,li.textContent.replace('◆','').trim()]));
 const tags=new Set(['svg','title','desc','path','defs','g','pattern','rect','text']);
 const attrs=new Set(['aria-labelledby','d','data-country','fill','height','id','patternTransform','patternUnits','role','stroke','stroke-linejoin','stroke-opacity','stroke-width','transform','viewBox','width','x','y','font-family','font-size']);
 function safeSvg(source,prefix){
  const parsed=new DOMParser().parseFromString(source,'image/svg+xml');
  if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='svg')throw Error('Invalid atlas');
  function copy(node){
   if(node.nodeType===3)return document.createTextNode(node.textContent);
   if(node.nodeType!==1||!tags.has(node.localName))return null;
   const out=document.createElementNS(ns,node.localName);
   for(const attr of node.attributes){
    if(!attrs.has(attr.name))continue;
    let value=attr.value;
    if(attr.name==='id')value=prefix+value;
    if(attr.name==='aria-labelledby')value=value.split(/\s+/).map(id=>prefix+id).join(' ');
    value=value.replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');
    if(/url\(/i.test(value)&&!/^url\(#[a-z0-9_-]+\)$/i.test(value))continue;
    out.setAttribute(attr.name,value);
   }
   for(const child of node.childNodes){const clean=copy(child);if(clean)out.append(clean);}
   return out;
  }
  return copy(parsed.documentElement);
 }
 async function setup(figure,index){
  const image=figure.querySelector('img');if(!image)return;
  const response=await fetch(image.getAttribute('src'));
  if(!response.ok)throw Error('Atlas unavailable');
  const svg=safeSvg(await response.text(),'atlas-'+index+'-');
  const original=svg.viewBox.baseVal;
  const full={x:original.x,y:original.y,w:original.width,h:original.height};
  let zoom=1,x=full.x,y=full.y,selected=null,gesture=null,moved=false;
  let flight=0;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const chips=new Map();
  function stopFlight(){cancelAnimationFrame(flight);flight=0;}
  const pointers=new Map();
  const viewport=document.createElement('div');viewport.className='map-viewport';
  viewport.tabIndex=0;viewport.setAttribute('role','group');
  viewport.setAttribute('aria-label','Carte du monde interactive');
  viewport.setAttribute('aria-describedby','map-controls-help');
  svg.setAttribute('role','group');svg.classList.add('map-interactive-svg');
  viewport.append(svg);image.after(viewport);image.hidden=true;
  const controls=document.createElement('div');controls.className='map-controls';
  const out=document.createElement('output');out.textContent='×1';out.setAttribute('aria-label','Niveau de zoom');
  const minus=button('−','Réduire le zoom',()=>scale(zoom/1.5));
  const plus=button('+','Agrandir le zoom',()=>scale(zoom*1.5));
  const reset=button('↺','Réinitialiser la carte',()=>{stopFlight();zoom=1;x=full.x;y=full.y;render();hide();});
  controls.append(minus,out,plus,reset);viewport.after(controls);
  const card=document.createElement('div');card.className='map-country-card';card.hidden=true;
  const name=document.createElement('strong'),status=document.createElement('span');
  card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  card.append(name,status);figure.append(card);
  const paths=[...svg.querySelectorAll('[data-country]')];
  function button(label,aria,action){
   const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',aria);b.addEventListener('click',action);return b;
  }
  function render(){
   const w=full.w/zoom,h=full.h/zoom;
   x=Math.max(full.x,Math.min(full.x+full.w-w,x));
   y=Math.max(full.y,Math.min(full.y+full.h-h,y));
   svg.setAttribute('viewBox',[x,y,w,h].join(' '));
   out.textContent='×'+zoom.toFixed(1).replace('.0','');
   minus.disabled=zoom<=1;plus.disabled=zoom>=5;
   viewport.classList.toggle('is-zoomed',zoom>1);
  }
  function scale(next,cx=x+full.w/zoom/2,cy=y+full.h/zoom/2){
   stopFlight();
   const prev=zoom;zoom=Math.max(1,Math.min(5,next));
   x=cx-(cx-x)*prev/zoom;y=cy-(cy-y)*prev/zoom;render();
  }
  function hide(){
   card.hidden=true;
   paths.forEach(path=>path.classList.remove('map-country-active'));
   chips.forEach(chip=>chip.setAttribute('aria-pressed','false'));
   selected=null;
  }
  const explored=path=>visited.has(path.dataset.country)&&(path.getAttribute('fill')==='#93b484'||path.dataset.country==='GIB');
  function show(path){
   if(!path)return;
   paths.forEach(p=>p.classList.toggle('map-country-active',p.dataset.country===path.dataset.country&&(explored(p)||p.dataset.country==='CHN')));
   selected=path;
   const id=path.dataset.country;
   chips.forEach((chip,code)=>chip.setAttribute('aria-pressed',String(code===id)));
   name.textContent=(details[id]?.[0]||'✦')+' '+(path.dataset.place||visited.get(id)||path.querySelector('title')?.textContent||id);
   status.textContent=id==='CHN'?'▣ Bientôt débloqué':explored(path)?'◆ Déjà exploré':'Sur la carte';
   if(details[id]?.[1]&&explored(path))status.textContent+=' · '+details[id][1];
   card.classList.toggle('is-locked',id==='CHN');card.hidden=false;
  }
  const primary=new Map();
  paths.forEach(path=>{if(!explored(path)&&path.dataset.country!=='CHN')return;const box=path.getBBox(),area=box.width*box.height;const previous=primary.get(path.dataset.country);if(!previous||area>previous.area)primary.set(path.dataset.country,{path,area});});
  function findCountry(id){
   const target=primary.get(id)?.path;if(!target)return;
   show(target);stopFlight();
   const box=target.getBBox(),w=full.w/zoom,h=full.h/zoom;
   const off=box.x<x+w*.08||box.x+box.width>x+w*.92||box.y<y+h*.16||box.y+box.height>y+h*.92;
   const small=box.width/w<.12||box.height/h<.12;
   if(!off&&!small)return;
   const next=Math.max(1,Math.min(5,full.w*.48/Math.max(box.width,1),full.h*.48/Math.max(box.height,1)));
   const tx=Math.max(full.x,Math.min(full.x+full.w-full.w/next,box.x+box.width/2-full.w/next/2));
   const ty=Math.max(full.y,Math.min(full.y+full.h-full.h/next,box.y+box.height/2-full.h/next/2));
   const start={x,y,w:full.w/zoom,h:full.h/zoom};
   const finish={x:tx,y:ty,w:full.w/next,h:full.h/next};
   const began=performance.now();
   function frame(now){
    const progress=reduced.matches?1:Math.min(1,(now-began)/460);
    const t=1-Math.pow(1-progress,3),width=start.w+(finish.w-start.w)*t;
    zoom=full.w/width;x=start.x+(finish.x-start.x)*t;y=start.y+(finish.y-start.y)*t;render();
    if(progress<1)flight=requestAnimationFrame(frame);else flight=0;
   }
   if(reduced.matches)frame(began);else flight=requestAnimationFrame(frame);
  }
  document.querySelectorAll('[data-visited]').forEach(li=>{
   const id=li.dataset.visited;if(!primary.has(id))return;
   const chip=document.createElement('button');chip.type='button';chip.className='map-country-chip';
   while(li.firstChild)chip.append(li.firstChild);
   chip.setAttribute('aria-pressed','false');chip.setAttribute('aria-controls','travel-atlas');
   chip.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')findCountry(id)});
   chip.addEventListener('focus',()=>findCountry(id));
   chip.addEventListener('click',()=>findCountry(id));
   chip.addEventListener('keydown',event=>{if(event.key==='Escape'){stopFlight();hide()}});
   li.append(chip);chips.set(id,chip);
  });
  svg.id='travel-atlas';
  paths.forEach(path=>{
   const id=path.dataset.country;
   if(explored(path)||id==='CHN'){
    path.tabIndex=primary.get(id).path===path?0:-1;path.setAttribute('role','button');
    path.setAttribute('aria-label',(visited.get(id)||'Chine')+(id==='CHN'?', bientôt débloqué':', déjà exploré'));
    path.addEventListener('focus',()=>show(path));
    path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(path);}});
   }
  });
  viewport.addEventListener('pointerover',e=>{if(!gesture&&e.pointerType!=='touch')show(e.target.closest('[data-country]'));});
  viewport.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&!viewport.contains(document.activeElement)&&!gesture)hide();});
  viewport.addEventListener('click',e=>{if(!moved)show(e.target.closest('[data-country]'));});
  viewport.addEventListener('focusout',e=>{if(!viewport.contains(e.relatedTarget))hide();});
  viewport.addEventListener('keydown',e=>{
   if(e.altKey||e.ctrlKey||e.metaKey)return;
   stopFlight();
   const amount=full.w/zoom*.12;
   if(e.key==='+'||e.key==='='){e.preventDefault();scale(zoom*1.5);}
   else if(e.key==='-'){e.preventDefault();scale(zoom/1.5);}
   else if(e.key==='Home'){e.preventDefault();zoom=1;x=full.x;y=full.y;render();}
   else if(e.key==='Escape')hide();
   else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();
    if(e.key==='ArrowLeft')x-=amount;if(e.key==='ArrowRight')x+=amount;
    if(e.key==='ArrowUp')y-=amount;if(e.key==='ArrowDown')y+=amount;render();
   }
  });
  // Wheel zoom is centered on the pointer, with small deltas for trackpads.
  viewport.addEventListener('wheel',e=>{
   const next=Math.max(1,Math.min(5,zoom*Math.exp(-e.deltaY*.002)));
   if(next===zoom)return;
   e.preventDefault();
   const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
   scale(next,point.x,point.y);hide();
  },{passive:false});
  // The map owns touch gestures; the surrounding page scroll remains normal.

  viewport.addEventListener('pointerdown',e=>{
   moved=false;
   if(e.button!==0)return;
   stopFlight();
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   try{viewport.setPointerCapture(e.pointerId);}catch{/* Pointer may already have ended. */}
   gesture={x,y,zoom,points:[...pointers.values()]};
   viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId)||!gesture)return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   const now=[...pointers.values()],start=gesture.points,rect=viewport.getBoundingClientRect();
   if(now.length===2&&start.length===2){
    const dist=ps=>Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
    const ratio=dist(now)/Math.max(1,dist(start));
    zoom=gesture.zoom;x=gesture.x;y=gesture.y;
    scale(gesture.zoom*ratio);
    moved=true;
   }else{
    const dx=now[0].x-start[0].x,dy=now[0].y-start[0].y;
    if(Math.hypot(dx,dy)>4)moved=true;
    x=gesture.x-dx/rect.width*full.w/zoom;y=gesture.y-dy/rect.height*full.h/zoom;render();
   }
   if(moved)hide();
  });
  function end(e){
   pointers.delete(e.pointerId);
   if(pointers.size)gesture={x,y,zoom,points:[...pointers.values()]};
   else{gesture=null;viewport.classList.remove('is-dragging');}
  }
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
  render();
 }
 const figures=[...document.querySelectorAll('.map-layout figure')];
 if(figures.length){
  const help=document.createElement('p');help.id='map-controls-help';help.className='map-controls-help';
  help.textContent='Survolez ou touchez un pays ou son nom · molette, pincement ou + / − pour zoomer · glissez pour explorer';
  document.querySelector('.map-layout').after(help);
  figures.forEach((figure,index)=>setup(figure,index).catch(()=>{
   // The original static map remains usable even if enhancement fails.
   const image=figure.querySelector('img');if(image)image.hidden=false;
   figure.querySelectorAll('.map-viewport,.map-controls,.map-country-card').forEach(el=>el.remove());
  }));
 }
})();
