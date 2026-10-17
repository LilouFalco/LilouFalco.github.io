const {chromium}=require('/tmp/qa/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
for(const width of [1440,1100,768,390,360]){
 const c=await b.newContext({viewport:{width,height:950}});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto((process.env.BASE||'http://localhost:18743')+'/voyages.html');
 assert.equal(await p.locator('h1').count(),1);
 assert.equal((await p.locator('.travel-stories-heading h2').innerText()).replace(/\s+/g,' '),'Mes voyages les plus marquants.');
 const countries=await p.locator('[data-visited]').evaluateAll(es=>es.map(e=>e.dataset.visited));assert.deepEqual(countries,['FRA','ESP','PRT','MAR','GIB','HRV','DEU','ITA','THA','JPN','KOR','VNM']);
 assert.equal(await p.locator('.map-next').innerText(),'▣ Chine · bientôt');
 assert(await p.locator('[data-visited=ITA]').innerText().then(t=>t.includes('Sicile')));
 assert(await p.locator('.map-layout img').evaluateAll(imgs=>imgs.length===2&&imgs.every(i=>i.complete&&i.naturalWidth>0)));
 const mapTop=await p.locator('.world-map-window').boundingBox();const heading=await p.locator('.travel-stories-heading').boundingBox();const timeline=await p.locator('.travel-window').boundingBox();assert(mapTop.y+mapTop.height<heading.y);assert(heading.y+heading.height<timeline.y);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#tab-maroc').click();assert((await p.locator('#travel-panel h3').innerText()).includes('Maroc'));
 await p.locator('#trip-next').click();assert.equal(await p.locator('[data-trip][aria-selected=true]').getAttribute('data-trip'),'japon');
 await p.locator('body').click({position:{x:8,y:8}});await p.evaluate(()=>scrollTo(0,0));
 await p.screenshot({path:'checks/world-map-'+(process.env.BASE?'live-':'')+width+'.png',fullPage:true});assert.deepEqual(errors,[]);await c.close();console.log(width+' map, order, data, images and timeline pass');
}
const c=await b.newContext({javaScriptEnabled:false,viewport:{width:360,height:950}});const p=await c.newPage();await p.goto((process.env.BASE||'http://localhost:18743')+'/voyages.html');assert.equal(await p.locator('[data-visited]').count(),12);assert(await p.locator('.map-layout img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));console.log('Static/no-JS map and all destinations pass');await c.close();await b.close()})().catch(e=>{console.error(e);process.exit(1)});
