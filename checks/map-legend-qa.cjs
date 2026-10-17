const {chromium}=require('/tmp/qa/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 for(const width of [1440,768,390,360]){
  const p=await b.newPage({viewport:{width,height:950},hasTouch:width<600,isMobile:width<600});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto((process.env.BASE||'http://localhost:19387')+'/voyages/');
  await p.locator('.map-country-chip').first().waitFor();
  const svg=p.locator('.map-interactive-svg'),card=p.locator('.map-country-card');
  assert.equal(await p.locator('.map-country-chip').count(),12);
  for(const id of ['FRA','ESP','PRT','MAR','GIB','HRV','DEU','ITA','THA','JPN','KOR','VNM']){
   const chip=p.locator('[data-visited='+id+'] button');
   if(width<600)await chip.tap();else if(id==='FRA')await chip.hover();else await chip.focus();
   await p.waitForFunction(id=>document.querySelector('[data-visited="'+id+'"] button').getAttribute('aria-pressed')==='true',id);
   await p.waitForTimeout(520);
   assert(await card.isVisible());assert.equal(await chip.getAttribute('aria-pressed'),'true');
   assert((await card.innerText()).includes((await chip.innerText()).replace('◆','').trim()));
   assert(await svg.locator('[data-country='+id+'].map-country-active').count()>0);
   const visible=await svg.evaluate((el,id)=>{
    const v=el.viewBox.baseVal;
    const paths=[...el.querySelectorAll('[data-country="'+id+'"].map-country-active')];
    return paths.some(p=>{const q=p.getBBox();return q.x+q.width/2>=v.x&&q.x+q.width/2<=v.x+v.width&&q.y+q.height/2>=v.y&&q.y+q.height/2<=v.y+v.height});
   },id);assert(visible,id+' centered');
  }
  await p.locator('[data-visited=GIB] button').focus();await p.waitForTimeout(520);
  assert.equal(await p.locator('.map-controls output').innerText(),'×5');
  await p.screenshot({path:'checks/legend-'+width+'.png',fullPage:true});
  await p.locator('[data-visited=GIB] button').press('Escape');assert(!await card.isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await p.close();console.log(width+' hover/focus/tap all12 highlighted/popups/pan/zoom/Gibraltar/escape pass');
 }
 const reduced=await b.newPage({reducedMotion:'reduce'});
 await reduced.goto((process.env.BASE||'http://localhost:19387')+'/voyages/');
 await reduced.locator('.map-country-chip').first().waitFor();await reduced.locator('[data-visited=GIB] button').focus();
 assert.equal(await reduced.locator('.map-controls output').innerText(),'×5');console.log('reduced-motion instant destination pass');
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
