const {chromium}=require('/tmp/qa/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 for(const width of [1440,1100,768,390,360]){
  const c=await b.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto((process.env.BASE||'http://localhost:18743')+'/voyages.html');
  const current=()=>p.locator('[data-trip][aria-selected=true]').getAttribute('data-trip');
  assert.deepEqual(await p.locator('.travel-timeline button').evaluateAll(bs=>bs.map(b=>b.id)),['tab-thailande','tab-japon','tab-coree','tab-vietnam','tab-chine']);
  assert(await p.locator('#trip-prev').isDisabled());
  assert.equal(await current(),'thailande');
  assert.equal(await p.locator('#tab-thailande small').textContent(),'2016');
  assert((await p.locator('.travel-eyebrow').textContent()).includes('01 · 2016'));
  for(const key of ['japon','coree','vietnam']){await p.locator('#trip-next').click();assert.equal(await current(),key);}
  assert(await p.locator('#trip-next').isDisabled());
  assert(await p.locator('#tab-chine').isDisabled());
  assert.equal(await p.locator('#travel-panel').count(),1);
  await p.locator('#travel-panel').focus();await p.keyboard.press('ArrowRight');assert.equal(await current(),'vietnam');
  await p.keyboard.press('Home');assert.equal(await current(),'thailande');
  await p.keyboard.press('ArrowLeft');assert.equal(await current(),'thailande');
  for(const key of ['coree','thailande','vietnam','japon']){await p.locator('#tab-'+key).click();assert.equal(await current(),key);assert.equal(await p.locator('#travel-panel').getAttribute('aria-labelledby'),'tab-'+key);}
  await p.locator('#tab-coree').focus();await p.keyboard.press('ArrowRight');assert.equal(await current(),'vietnam');assert.equal(await p.locator(':focus').getAttribute('id'),'tab-vietnam');
  await p.locator('#trip-prev').click();assert.equal(await current(),'coree');
  if(width<600){
   await p.locator('#travel-panel').scrollIntoViewIfNeeded();
   const session=await c.newCDPSession(p);
   const r=await p.locator('#travel-panel').boundingBox();const x=r.x+r.width*.75,y=r.y+120;
   async function swipe(dx,dy=0){
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=5;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/5,y:y+dy*i/5}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   }
   await swipe(-100);assert.equal(await current(),'vietnam');
   await swipe(60);assert.equal(await current(),'coree');
   await swipe(10);assert.equal(await current(),'coree');
   await swipe(5,-70);assert.equal(await current(),'coree');
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('#tab-japon').click();
  await p.screenshot({path:'/home/portfolio/checks/timeline-'+(process.env.BASE?'live-':'')+width+'.png',fullPage:true});
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#tab-vietnam').click();
  assert.equal(await p.locator('#travel-panel').evaluate(e=>e.getAnimations().length),0);
  assert.deepEqual(errors,[]);console.log(width+' timeline, controls, bounds, keyboard, touch and reduced motion pass');await c.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
