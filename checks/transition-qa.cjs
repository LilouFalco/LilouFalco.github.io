const {chromium}=require('/tmp/qa/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE||'http://localhost:18743';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 for(const fallback of [false,true])for(const width of [1440,390,360]){
  const c=await b.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
  if(fallback){
   await c.addInitScript(()=>{delete window.CSSViewTransitionRule;});
   await c.route('**/style.css',async route=>{
    const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('@view-transition{navigation:auto}','@view-transition{navigation:none}')});
   });
  }
  await c.addInitScript(()=>{
   window.sceneEvents=[];
   window.fallbackFrames=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this===document.body||this.classList.contains('scene-curtain'))window.fallbackFrames.push({frames,duration:options.duration});return animate.call(this,frames,options);};
   addEventListener('pagereveal',e=>{
    if(e.viewTransition){
     window.sceneEvents.push('native');
     e.viewTransition.ready.then(()=>{
      const animations=document.getAnimations().filter(a=>a.animationName?.startsWith('scene-'));
      window.sceneTimings=animations.map(a=>({name:a.animationName,duration:a.effect.getTiming().duration,keys:a.effect.getKeyframes().map(k=>Object.keys(k).filter(v=>!['offset','computedOffset','easing','composite'].includes(v)))}));
     }).catch(()=>{});
    }
   });
  });
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/index.html');
  assert.equal(await p.locator('html.scene-arriving').count(),0);
  assert.equal(await p.evaluate(()=>getComputedStyle(document.body,'::before').content),'none');
  const cursor=await p.locator('body').evaluate(e=>getComputedStyle(e).cursor);
  const linkCursor=await p.locator('nav a').first().evaluate(e=>getComputedStyle(e).cursor);
  if(width>600){assert(cursor.includes('cursor-heart.png'));assert(linkCursor.includes('cursor-hand.png'));}
  else{assert(!cursor.includes('cursor-'));assert(!linkCursor.includes('cursor-'));}
  await p.getByRole('link',{name:'Créations',exact:true}).click();
  await p.waitForURL(/projets(?:\.html|\/)?$/);await p.waitForTimeout(650);
  assert.equal(await p.locator('html.scene-arriving,html.scene-leaving').count(),0);
  if(!fallback){
   assert((await p.evaluate(()=>window.sceneEvents)).includes('native'));
   const timings=await p.evaluate(()=>window.sceneTimings);
   assert(timings.length>=2);assert(timings.every(t=>t.duration===560));
   assert(timings.flatMap(t=>t.keys.flat()).every(k=>['transform','opacity'].includes(k)));
   assert(timings.some(t=>t.name==='scene-pixel-shutter'));
   console.log('native timing/keyframes',JSON.stringify(timings));
  }
  if(fallback){const frames=await p.evaluate(()=>window.fallbackFrames);assert.equal(frames[0].duration,280);assert(frames[0].frames.every(f=>Object.keys(f).every(k=>k==='transform')));}
  assert(await p.locator('.project-tab').first().isVisible());
  await p.goBack();await p.waitForTimeout(650);assert(await p.locator('h1').isVisible());
  assert.equal(await p.locator('html.scene-arriving,html.scene-leaving').count(),0);
  // Hash-only link must not close the scene.
  await p.locator('footer a[href="#top"]').click();assert.equal(await p.locator('html.scene-leaving').count(),0);
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.getByRole('link',{name:'Parcours',exact:true}).click();await p.waitForURL(/parcours(?:\.html|\/)?$/);await p.waitForTimeout(300);
  assert.equal(await p.locator('html.scene-arriving,html.scene-leaving').count(),0);
  if(!fallback){
   const timings=await p.evaluate(()=>window.sceneTimings);
   assert(timings.every(t=>t.duration===180));assert(timings.flatMap(t=>t.keys.flat()).every(k=>k==='opacity'));
  }
  if(fallback){const frames=await p.evaluate(()=>window.fallbackFrames);assert.equal(frames[0].duration,90);assert(frames[0].frames.every(f=>Object.keys(f).every(k=>k==='opacity')));}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await c.close();
  console.log((fallback?'fallback':'native')+' '+width+' navigation/history/hash/reduced-motion/cursor pass');
 }
 // Native pixel shutter art direction, frozen compositor snapshots.
 const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();await p.goto(base+'/index.html');
 await p.evaluate(async()=>{
  const t=document.startViewTransition(()=>{document.querySelector('h1').textContent='Prochaine escale';});
  await t.ready;
  const anims=document.getAnimations().filter(a=>a.animationName?.startsWith('scene-'));
  anims.forEach(a=>a.pause());window.qaScene=anims;
 });
 for(const time of [100,270,420]){
  await p.evaluate(t=>window.qaScene.forEach(a=>a.currentTime=t),time);
  await p.screenshot({path:'checks/scene-'+(process.env.BASE?'live-':'')+time+'.png'});
 }
 await p.evaluate(()=>window.qaScene.forEach(a=>a.finish()));await c.close();
 // Storage-denied fallback must stay normal navigation, never blank.
 const blocked=await b.newContext();
 await blocked.addInitScript(()=>{delete window.CSSViewTransitionRule;Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('blocked','SecurityError')}})});
 const bp=await blocked.newPage();await bp.goto(base+'/index.html');await bp.getByRole('link',{name:'Créations',exact:true}).click();await bp.waitForURL(/projets(?:\.html|\/)?$/);assert.equal(await bp.locator('html.scene-leaving').count(),0);await blocked.close();
 await b.close();console.log('Scene frames and storage-restricted navigation pass');
})().catch(e=>{console.error(e);process.exit(1)});
