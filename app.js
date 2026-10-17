'use strict';
const projectData = {
 ageisme: {title:"L’âgisme en chiffres", client:"ARBITRYUM · SOCIAL MEDIA · MAI 2023", description:"Un carrousel issu d’une série hebdomadaire de chiffres pour sensibiliser à l’âgisme et à ses conséquences. Cette publication aborde notamment l’idée reçue selon laquelle les personnes âgées seraient un fardeau pour les ressources publiques.", role:"Création des visuels et adaptation du message au format carrousel pour Instagram.",tags:["Création de contenus","Carrousel","Sensibilisation"],images:["ageisme-1.webp","ageisme-2.webp","ageisme-3.webp"],instagram:"https://www.instagram.com/p/Cr2_lfvtJiF/"},
 formations: {title:"Donner vie à une offre", client:"ARBITRYUM · MOTION DESIGN", description:"Présenter les formations d’Arbitryum dans un format court et animé. Une création qui met en mouvement les informations pour faire découvrir l’offre sur les réseaux sociaux.",role:"Création et montage du reel de présentation des formations.",tags:["Motion design","Montage","Réseaux sociaux"],video:"formations"},
 chantal: {title:"Vieillir, c’est quoi pour vous ?", client:"ARBITRYUM · INTERVIEW DE CHANTAL", description:"Une rencontre avec Chantal, aide-soignante, pour parler de l’âge à partir de son expérience. La vidéo laisse une place à la parole et au regard de celles qui accompagnent les personnes âgées.",role:"Tournage de l’interview et montage du reel.",tags:["Tournage","Interview","Montage vidéo"],video:"chantal"},
 pride: {title:"La fierté n’a pas d’âge", client:"ARBITRYUM · MOIS DES FIERTÉS · JUIN 2023", description:"Une illustration aux crayons publiée à la fin du mois des fiertés pour défendre l’inclusion et le respect des personnes LGBTQIA+ en EHPAD.",role:"Création du visuel pour les réseaux sociaux d’Arbitryum.",tags:["Création visuelle","Social media","Inclusion"],images:["pride.webp"],instagram:"https://www.instagram.com/p/CuCZU8fIpbE/"},
 angela: {title:"Angela, 86 ans, et tant à raconter", client:"ARBITRYUM · INTERVIEW", description:"Donner la parole à Angela, 86 ans. Un format de rencontre qui met la personne et son histoire au premier plan, loin des idées toutes faites sur l’âge.",role:"Tournage de l’interview et montage du reel.",tags:["Tournage","Interview","Montage vidéo"],video:"angela"}
};
const dialog=document.querySelector('#project-dialog');
const toastEl=document.querySelector('.toast');
let lastProject;
let carouselIndex=0;
let activeProject;
const discovered=new Set();
function openProject(key,button){
 const project=projectData[key];if(!project||!dialog)return;
 lastProject=button;activeProject=project;carouselIndex=0;
 const visual=project.video
 ? '<video controls playsinline preload="metadata" poster="assets/'+project.video+'.jpg" aria-label="'+project.title+'"><source src="assets/'+project.video+'.mp4" type="video/mp4">Votre navigateur ne prend pas en charge cette vidéo.</video>'
 : '<img id="carousel-image" src="assets/'+project.images[0]+'" alt="'+project.title+' · visuel 1">'+(project.images.length>1?'<div class="carousel-controls"><button id="prev-slide" aria-label="Visuel précédent">Précédent</button><span id="carousel-count" aria-live="polite">1 / '+project.images.length+'</span><button id="next-slide" aria-label="Visuel suivant">Suivant</button></div>':'');
 document.querySelector('#modal-content').innerHTML='<div class="modal-layout"><div class="modal-visual">'+visual+'</div><div class="modal-text"><span class="project-client">'+project.client+'</span><h2 id="modal-title">'+project.title+'</h2><p>'+project.description+'</p><h3>MON RÔLE</h3><p>'+project.role+'</p><div class="tags">'+project.tags.map(tag=>'<span>'+tag+'</span>').join('')+'</div><p class="modal-credit">Création réalisée pour Arbitryum. Les interviews ont été filmées et montées par Lilou Falco.</p></div></div>';
 if(project.instagram){
  const link=document.createElement('a');
  link.className='button button-dark project-instagram';
  link.href=project.instagram;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.textContent='Voir sur Instagram';
  document.querySelector('.modal-text').append(link);
 }
 dialog.showModal();document.body.style.overflow='hidden';
 document.querySelector('#prev-slide')?.addEventListener('click',()=>slide(-1));
 document.querySelector('#next-slide')?.addEventListener('click',()=>slide(1));
 discovered.add(key);
}
function slide(direction){
 carouselIndex=(carouselIndex+direction+activeProject.images.length)%activeProject.images.length;
 const image=document.querySelector('#carousel-image');
 image.src='assets/'+activeProject.images[carouselIndex];
 image.alt=activeProject.title+' · visuel '+(carouselIndex+1);
 document.querySelector('#carousel-count').textContent=(carouselIndex+1)+' / '+activeProject.images.length;
}
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project,button)));
if(dialog){
document.querySelector('#close-dialog')?.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();document.body.style.overflow='';lastProject?.focus({preventScroll:true});if(discovered.size===5&&!sessionStorage.getItem('explorer')){sessionStorage.setItem('explorer','1');const toast=toastEl;if(!toast)return;toast.textContent='✦ Succès débloqué · Curiosité niveau maximum !';toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),4500);}});
dialog.addEventListener('keydown',event=>{if(activeProject?.images?.length>1){if(event.key==='ArrowRight'){event.preventDefault();slide(1);}if(event.key==='ArrowLeft'){event.preventDefault();slide(-1);}}});
}
const trips={
 thailande:{number:"01",date:"2016",title:"Thaïlande,<br>un très beau souvenir.",text:"J’ai séjourné à Bangkok et pris le temps de découvrir la ville. J’ai beaucoup aimé la Thaïlande, un pays dont je garde un très beau souvenir.",tags:["Bangkok","Découvertes"],emote:7},
 japon:{number:"02",date:"MAI 2023",title:"Japon, entre pixels<br>et poésie.",text:"À Tokyo et Yokohama, les univers se croisent. L’imaginaire du musée Ghibli, l’effervescence de Shibuya et d’Akihabara, le calme des temples et des jardins. Une escapade entre culture pop et découvertes.",tags:["Tokyo","Yokohama","Culture pop"],emote:12},
 coree:{number:"03",date:"DÉCEMBRE 2023",title:"Corée du Sud,<br>mille contrastes.",text:"De Séoul à Busan, un voyage entre palais, marchés et quartiers créatifs. Hongdae, les ruelles colorées de Gamcheon et le temple Haedong Yonggungsa, au bord de la mer. Des découvertes à chaque détour.",tags:["Séoul","Busan","Art & traditions"],emote:7},
 vietnam:{number:"04",date:"MARS 2026",title:"Vietnam,<br>prendre le temps.",text:"Des rues de Hanoï aux rizières de Pú Luông, puis du kayak dans la baie de Lan Ha aux barques de Trang An. À Hoi An, les lanternes et les ateliers d’artisanat prolongent le voyage. Une parenthèse entre nature et savoir-faire.",tags:["Hanoï","Lan Ha","Hoi An"],emote:3},
};
const tripButtons=[...document.querySelectorAll('[data-trip]')];
const travelWindow=document.querySelector('.level-select');
const travelPanel=document.querySelector('#travel-panel');
const tripPrev=document.querySelector('#trip-prev');
const tripNext=document.querySelector('#trip-next');
let tripIndex=0;
let tripAnimation;
function chooseTrip(button,focus=false){
 const trip=trips[button?.dataset.trip];
 if(!trip||!travelPanel)return;
 tripIndex=tripButtons.indexOf(button);
 tripButtons.forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;b.classList.toggle('selected',selected);});
 travelPanel.setAttribute('aria-labelledby',button.id);
 travelPanel.innerHTML='<span class="travel-eyebrow">CARNET N° '+trip.number+' · '+trip.date+'</span><h3>'+trip.title+'</h3><p>'+trip.text+'</p><div class="travel-tags">'+trip.tags.map(t=>'<span>'+t+'</span>').join('')+'</div><span class="travel-coordinate">SOUVENIRS COLLECTÉS, CURIOSITÉ RECHARGÉE.</span><img src="assets/emote-'+trip.emote+'.png" width="120" height="120" alt="" class="travel-emote">';
 tripPrev.disabled=tripIndex===0;
 tripNext.disabled=tripIndex===tripButtons.length-1;
 document.querySelector('#trip-progress').textContent='ESCALE '+trip.number+' / 04 · '+button.querySelector('strong').textContent;
 const icon=button.querySelector('.stamp-icon').cloneNode(true);
 icon.classList.add('travel-country-icon');
 travelPanel.prepend(icon);
 tripAnimation?.cancel();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  tripAnimation=travelPanel.animate([{opacity:.6,transform:'translate3d(8px,0,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:180,easing:'ease-out'});
 }
 if(focus)button.focus({preventScroll:true});
}
function stepTrip(direction){const next=tripIndex+direction;if(tripButtons[next])chooseTrip(tripButtons[next]);}
if(travelWindow){
 tripButtons.forEach(button=>button.addEventListener('click',()=>chooseTrip(button)));
 tripPrev.addEventListener('click',()=>stepTrip(-1));
 tripNext.addEventListener('click',()=>stepTrip(1));
 travelWindow.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  let next;
  const index=tripButtons.includes(event.target)?tripButtons.indexOf(event.target):tripIndex;
  if(event.key==='ArrowRight')next=Math.min(index+1,tripButtons.length-1);
  if(event.key==='ArrowLeft')next=Math.max(index-1,0);
  if(event.key==='Home')next=0;
  if(event.key==='End')next=tripButtons.length-1;
  if(next!==undefined){event.preventDefault();chooseTrip(tripButtons[next],event.target.getAttribute('role')==='tab');}
 });
 let swipeStart=null;
 travelPanel.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='touch'||!event.isPrimary)return;
  swipeStart={x:event.clientX,y:event.clientY,id:event.pointerId,time:performance.now()};
 });
 travelPanel.addEventListener('pointerup',event=>{
  const start=swipeStart;swipeStart=null;
  if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.5&&performance.now()-start.time<1000)stepTrip(dx<0?1:-1);
 });
 travelPanel.addEventListener('pointercancel',()=>{swipeStart=null;});
 chooseTrip(tripButtons[0]);
}

// A shared detail card stays inside the inventory on every screen size.
const skillButtons=[...document.querySelectorAll('.skill-button')];
const skillDetail=document.querySelector('#skill-detail');
let selectedSkill=null;
function showSkill(button){
 if(!skillDetail)return;
 selectedSkill=button;
 skillButtons.forEach(item=>item.setAttribute('aria-expanded',String(item===button)));
 skillDetail.querySelector('strong').textContent=button.textContent;
 skillDetail.querySelector('p').textContent=button.dataset.skillDescription;
}
function closeSkill(){
 if(!skillDetail)return;
 selectedSkill=null;
 skillButtons.forEach(item=>item.setAttribute('aria-expanded','false'));
 skillDetail.querySelector('strong').textContent='Un peu plus en détail';
 skillDetail.querySelector('p').textContent='Choisissez une compétence pour découvrir comment je la mets en pratique.';
}
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function playSkill(button){
 button.classList.remove('pop');
 if(reduceMotion.matches)return;
 void button.offsetWidth;
 button.classList.add('pop');
 button.addEventListener('animationend',()=>button.classList.remove('pop'),{once:true});
}
skillButtons.forEach(button=>{
 button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')showSkill(button);});
 button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))showSkill(button);});
 button.addEventListener('click',()=>{
  playSkill(button);
  if(selectedSkill===button&&window.matchMedia('(hover: none)').matches)closeSkill();
  else showSkill(button);
 });
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSkill();});
document.addEventListener('click',event=>{if(!event.target.closest('.inventory'))closeSkill();});

// Creations: three independent company tabs, one panel at a time.
const projectTabs=[...document.querySelectorAll('.project-tab')];
function chooseProjectTab(tab,{focus=false,updateHash=true}={}){
 projectTabs.forEach(item=>{
  const on=item===tab;
  item.setAttribute('aria-selected',String(on));item.tabIndex=on?0:-1;item.classList.toggle('selected',on);
  const panel=document.getElementById(item.getAttribute('aria-controls'));if(panel)panel.hidden=!on;
 });
 if(focus)tab.focus();
 if(updateHash&&history.replaceState)history.replaceState(null,'','#'+tab.dataset.tab);
}
projectTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>chooseProjectTab(tab));
 tab.addEventListener('keydown',e=>{
  let next;const n=projectTabs.length;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%n;
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index-1+n)%n;
  if(e.key==='Home')next=0;if(e.key==='End')next=n-1;
  if(next!==undefined){e.preventDefault();chooseProjectTab(projectTabs[next],{focus:true});}
 });
});
function tabFromHash(){
 const tab=projectTabs.find(item=>item.dataset.tab===location.hash.slice(1));
 if(tab)chooseProjectTab(tab,{updateHash:false});
}
if(projectTabs.length){tabFromHash();window.addEventListener('hashchange',tabFromHash);}
