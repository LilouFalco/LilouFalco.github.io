'use strict';
const projectData = {
 ageisme: {title:"L’âgisme en chiffres", client:"ARBITRYUM · SOCIAL MEDIA · MAI 2023", description:"Mettre des chiffres sur une discrimination encore trop banalisée. Un carrousel pensé pour sensibiliser à l’âgisme et inviter à regarder autrement l’avancée en âge.", role:"Création des visuels et adaptation du message au format carrousel pour Instagram.",tags:["Création de contenus","Carrousel","Sensibilisation"],images:["ageisme-1.webp","ageisme-2.webp","ageisme-3.webp"]},
 formations: {title:"Donner vie à une offre", client:"ARBITRYUM · MOTION DESIGN", description:"Présenter les formations d’Arbitryum dans un format court et animé. Une création qui met en mouvement les informations pour faire découvrir l’offre sur les réseaux sociaux.",role:"Création et montage du reel de présentation des formations.",tags:["Motion design","Montage","Réseaux sociaux"],video:"formations"},
 chantal: {title:"Vieillir, c’est quoi pour vous ?", client:"ARBITRYUM · INTERVIEW DE CHANTAL", description:"Une rencontre avec Chantal, aide-soignante, pour parler de l’âge à partir de son expérience. La vidéo laisse une place à la parole et au regard de celles qui accompagnent les personnes âgées.",role:"Tournage de l’interview et montage du reel.",tags:["Tournage","Interview","Montage vidéo"],video:"chantal"},
 pride: {title:"La fierté n’a pas d’âge", client:"ARBITRYUM · MOIS DES FIERTÉS · JUIN 2023", description:"Un visuel pour le mois des fiertés, qui relie la question de l’âge à celle de l’inclusion. Parce que chaque parcours et chaque identité méritent d’être représentés.",role:"Création du visuel pour les réseaux sociaux d’Arbitryum.",tags:["Création visuelle","Social media","Inclusion"],images:["pride.webp"]},
 angela: {title:"Angela, 86 ans, et tant à raconter", client:"ARBITRYUM · INTERVIEW", description:"Donner la parole à Angela, 86 ans. Un format de rencontre qui met la personne et son histoire au premier plan, loin des idées toutes faites sur l’âge.",role:"Tournage de l’interview et montage du reel.",tags:["Tournage","Interview","Montage vidéo"],video:"angela"}
};
const dialog=document.querySelector('#project-dialog');
let lastProject;
let carouselIndex=0;
let activeProject;
const discovered=new Set();
function openProject(key,button){
 const project=projectData[key];if(!project)return;
 lastProject=button;activeProject=project;carouselIndex=0;
 const visual=project.video
 ? '<video controls playsinline preload="metadata" poster="assets/'+project.video+'.jpg" aria-label="'+project.title+'"><source src="assets/'+project.video+'.mp4" type="video/mp4">Votre navigateur ne prend pas en charge cette vidéo.</video>'
 : '<img id="carousel-image" src="assets/'+project.images[0]+'" alt="'+project.title+' · visuel 1">'+(project.images.length>1?'<div class="carousel-controls"><button id="prev-slide" aria-label="Visuel précédent">Précédent</button><span id="carousel-count" aria-live="polite">1 / '+project.images.length+'</span><button id="next-slide" aria-label="Visuel suivant">Suivant</button></div>':'');
 document.querySelector('#modal-content').innerHTML='<div class="modal-layout"><div class="modal-visual">'+visual+'</div><div class="modal-text"><span class="project-client">'+project.client+'</span><h2 id="modal-title">'+project.title+'</h2><p>'+project.description+'</p><h3>MON RÔLE</h3><p>'+project.role+'</p><div class="tags">'+project.tags.map(tag=>'<span>'+tag+'</span>').join('')+'</div><p class="modal-credit">Création réalisée pour Arbitryum. Les interviews ont été filmées et montées par Lilou Falco.</p></div></div>';
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
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();document.body.style.overflow='';lastProject?.focus({preventScroll:true});if(discovered.size===5&&!sessionStorage.getItem('explorer')){sessionStorage.setItem('explorer','1');const toast=document.querySelector('.toast');toast.textContent='✦ Succès débloqué · Curiosité niveau maximum !';toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),4500);}});
dialog.addEventListener('keydown',event=>{if(activeProject?.images?.length>1){if(event.key==='ArrowRight'){event.preventDefault();slide(1);}if(event.key==='ArrowLeft'){event.preventDefault();slide(-1);}}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
 document.querySelector('#filter-status').textContent=document.querySelectorAll('[data-category]:not([hidden])').length+' créations affichées';
}));
const trips={
 japon:{number:"01",date:"MAI 2023",title:"Japon, entre pixels<br>et poésie.",text:"À Tokyo et Yokohama, les univers se croisent. L’imaginaire du musée Ghibli, l’effervescence de Shibuya et d’Akihabara, le calme des temples et des jardins. Une escapade entre culture pop et découvertes.",tags:["Tokyo","Yokohama","Culture pop"],emote:12},
 coree:{number:"02",date:"DÉCEMBRE 2023",title:"Corée du Sud,<br>mille contrastes.",text:"De Séoul à Busan, un voyage entre palais, marchés et quartiers créatifs. Hongdae, les ruelles colorées de Gamcheon et le temple Haedong Yonggungsa, au bord de la mer. Des découvertes à chaque détour.",tags:["Séoul","Busan","Art & traditions"],emote:7},
 vietnam:{number:"03",date:"MARS 2026",title:"Vietnam,<br>prendre le temps.",text:"Des rues de Hanoï aux rizières de Pú Luông, puis du kayak dans la baie de Lan Ha aux barques de Trang An. À Hoi An, les lanternes et les ateliers d’artisanat prolongent le voyage. Une parenthèse entre nature et savoir-faire.",tags:["Hanoï","Lan Ha","Hoi An"],emote:3},
 thailande:{number:"04",date:"DESTINATION EXPLORÉE",title:"Thaïlande,<br>une page du carnet.",text:"La Thaïlande fait aussi partie de mes découvertes en Asie. Un tampon de plus dans ce carnet, et toujours cette envie de partir à la rencontre d’autres cultures.",tags:["Découverte","Curiosité","Asie"],emote:1}
};
const tripButtons=[...document.querySelectorAll('[data-trip]')];
function chooseTrip(button,focus=false){
 tripButtons.forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;b.classList.toggle('selected',selected);});
 const trip=trips[button.dataset.trip];const panel=document.querySelector('#travel-panel');
 panel.setAttribute('aria-labelledby',button.id);
 panel.innerHTML='<span class="travel-eyebrow">CARNET N° '+trip.number+' · '+trip.date+'</span><h3>'+trip.title+'</h3><p>'+trip.text+'</p><div class="travel-tags">'+trip.tags.map(t=>'<span>'+t+'</span>').join('')+'</div><span class="travel-coordinate">SOUVENIRS COLLECTÉS, CURIOSITÉ RECHARGÉE.</span><img src="assets/emote-'+trip.emote+'.png" width="120" height="120" alt="" class="travel-emote">';
 if(focus)button.focus();
}
tripButtons.forEach((button,index)=>{button.tabIndex=index===0?0:-1;button.addEventListener('click',()=>chooseTrip(button));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%tripButtons.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index-1+tripButtons.length)%tripButtons.length;if(e.key==='Home')next=0;if(e.key==='End')next=tripButtons.length-1;if(next!==undefined){e.preventDefault();chooseTrip(tripButtons[next],true);}});});
const sections=[...document.querySelectorAll('main>section[id]')];const navLinks=[...document.querySelectorAll('.header nav a')];
function updateNav(){let active=sections[0].id;for(const section of sections)if(section.getBoundingClientRect().top<window.innerHeight*.4)active=section.id;navLinks.forEach(link=>{const current=link.hash==='#'+active;link.classList.toggle('active',current);if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateNav();ticking=false;});ticking=true;}},{passive:true});updateNav();
