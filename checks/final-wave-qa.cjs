const{chromium}=require('/tmp/qa/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 const base=process.env.BASE||'http://localhost:19387';
 for(const width of [1440,390,360]){
  const p=await b.newPage({viewport:{width,height:900},hasTouch:width<600,isMobile:width<600});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const original=Element.prototype.animate;
   window.waveAnimations=[];
   Element.prototype.animate=function(frames,opts){const a=original.call(this,frames,opts);if(this.parentElement?.classList.contains('scene-wave'))window.waveAnimations.push(a);return a;};
  });
  await p.goto(base+'/');const color=await p.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor);
  await p.getByRole('link',{name:'Mes voyages',exact:true}).click();await p.waitForURL(/voyages/);
  await p.waitForTimeout(600);
  assert.equal(await p.evaluate(()=>window.waveAnimations.length),160);
  assert(await p.evaluate(()=>window.waveAnimations.every(a=>a.effect.getTiming().duration===140&&a.effect.getTiming().delay<=360)));
  assert.equal(await p.locator('.scene-wave').count(),0);
  assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),color);
  assert(await p.locator('.travel-detail').evaluate(el=>el.contains(document.querySelector('.travel-controls'))));
  assert(!await p.locator('.travel-detail').isVisible());
  assert.equal(await p.locator('[data-trip][aria-selected=true]').count(),0);
  await p.locator('#tab-maroc').click();await p.waitForTimeout(320);
  assert(await p.locator('.travel-detail').isVisible());assert((await p.locator('#travel-panel h3').innerText()).includes('Maroc'));
  await p.locator('#trip-next').click();assert((await p.locator('#travel-panel h3').innerText()).includes('Japon'));
  await p.locator('#tab-japon').click();await p.waitForTimeout(260);assert(!await p.locator('.travel-detail').isVisible());
  await p.locator('#tab-thailande').click();await p.waitForTimeout(320);
  await p.getByRole('button',{name:'Fermer le voyage'}).click();await p.waitForTimeout(260);assert(!await p.locator('.travel-detail').isVisible());
  await p.locator('#tab-vietnam').click();await p.waitForTimeout(320);assert(await p.locator('#trip-next').isDisabled());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('nav a').first().click();await p.waitForURL(u=>u.pathname==='/');
  assert.equal(await p.locator('.scene-wave').count(),0);
  console.log(width+' single500ms wave + closedfrise/open/toggle/arrows/close/reduced-motion pass');await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
