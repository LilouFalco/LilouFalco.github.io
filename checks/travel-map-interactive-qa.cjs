const {chromium}=require('/tmp/qa/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});const base=process.env.BASE||'http://localhost:18743';
for(const width of [1440,768,390,360]){
 const p=await b.newPage({viewport:{width,height:950},isMobile:width<600,hasTouch:width<600});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/voyages.html');await p.locator('.map-viewport').first().waitFor();
 const map=p.locator('.map-world'),view=map.locator('.map-viewport'),svg=map.locator('svg.map-interactive-svg'),card=map.locator('.map-country-card');
 const original=await svg.getAttribute('viewBox');
 const fra=svg.locator('[data-country=FRA]').last();await fra.focus();assert((await card.innerText()).includes('France'));assert((await card.innerText()).includes('Déjà exploré'));
 await svg.locator('[data-country=CHN]').last().focus();assert((await card.innerText()).includes('Bientôt débloqué'));
 await view.press('Escape');assert(!await card.isVisible());
 await svg.locator('[data-country=THA]').last().focus();assert((await card.innerText()).includes('🇹🇭'));assert((await card.innerText()).includes('2016'));
 await fra.focus();assert(!(await card.innerText()).includes('2021'));
 const bounds=await view.boundingBox();
 await p.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await p.mouse.wheel(0,-150);
 await p.waitForTimeout(60);assert.notEqual(await svg.getAttribute('viewBox'),original);
 await map.getByRole('button',{name:'Réinitialiser la carte',exact:true}).click();
 // Pinching must also begin from the default zoom.
 await view.evaluate(e=>{
  for(const [type,id,x] of [['pointerdown',11,80],['pointerdown',12,160],['pointermove',12,200],['pointerup',11,80],['pointerup',12,200]])
   e.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:100,bubbles:true}));
 });
 assert.equal(await map.locator('output').innerText(),'×1.5');
 await map.getByRole('button',{name:'Réinitialiser la carte',exact:true}).click();
 await map.getByRole('button',{name:'Agrandir le zoom',exact:true}).click();assert.notEqual(await svg.getAttribute('viewBox'),original);
 for(let i=0;i<6;i++)await view.press('+');
 assert.equal(await map.locator('output').innerText(),'×5');assert(await map.getByRole('button',{name:'Agrandir le zoom',exact:true}).isDisabled());
 const before=await svg.getAttribute('viewBox');await view.press('ArrowRight');assert.notEqual(await svg.getAttribute('viewBox'),before);
 const rect=await view.boundingBox();await p.mouse.move(rect.x+rect.width*.6,rect.y+rect.height*.5);await p.mouse.down();await p.mouse.move(rect.x+rect.width*.4,rect.y+rect.height*.6,{steps:8});await p.mouse.up();assert.notEqual(await svg.getAttribute('viewBox'),before);
 await map.getByRole('button',{name:'Réinitialiser la carte',exact:true}).click();assert.equal(await svg.getAttribute('viewBox'),original);
 assert(await map.getByRole('button',{name:'Réduire le zoom',exact:true}).isDisabled());
 // End geometry stays clamped and remains valid after touch gestures.
 for(let i=0;i<2;i++)await view.press('+');
 await view.evaluate(e=>{
  e.dispatchEvent(new PointerEvent('pointerdown',{pointerId:8,pointerType:'touch',button:0,clientX:100,clientY:100,bubbles:true}));
  e.dispatchEvent(new PointerEvent('pointermove',{pointerId:8,pointerType:'touch',clientX:30,clientY:130,bubbles:true}));
  e.dispatchEvent(new PointerEvent('pointerup',{pointerId:8,pointerType:'touch',bubbles:true}));
 });
 await view.evaluate(e=>{
  function fire(type,id,x,y){e.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,bubbles:true}));}
  fire('pointerdown',8,80,100);fire('pointerdown',9,160,100);
  fire('pointermove',9,200,100);fire('pointerup',8,80,100);fire('pointerup',9,200,100);
 });
 assert.equal(await map.locator('output').innerText(),'×3.4');
 await map.getByRole('button',{name:'Réinitialiser la carte',exact:true}).click();
 await svg.locator('[data-country=GIB]').focus();assert((await card.innerText()).includes('Gibraltar'));
 await svg.locator('[data-country=ITA]').last().focus();assert((await card.innerText()).includes('Italie'));assert(!(await card.innerText()).includes('Sicile'));
 assert.equal(await p.locator('.map-viewport').count(),1);
 assert.equal(await p.locator('.map-europe,.map-place-shortcuts').count(),0);
 const ids=await p.locator('.map-interactive-svg [id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 await p.screenshot({path:'checks/interactive-map-'+width+'.png',fullPage:true});await p.close();console.log(width+' popup/focus/zoom/bounds/pan/reset/single-map/overflow pass');
}
const failed=await b.newPage();await failed.route('**/assets/travel-*.svg',r=>r.request().resourceType()==='fetch'?r.abort():r.continue());await failed.goto(base+'/voyages.html');assert(await failed.locator('.map-world img').isVisible());assert.equal(await failed.locator('.map-viewport').count(),0);console.log('fetch failure static fallback pass');await b.close()})().catch(e=>{console.error(e);process.exit(1)});
