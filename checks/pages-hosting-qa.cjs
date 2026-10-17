const {chromium}=require('/tmp/qa/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.BASE||'http://localhost:19387';
 const browser=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 const api=await browser.newContext();
 for(const name of fs.readdirSync('assets')){
  const r=await api.request.get(base+'/assets/'+name);
  assert(r.ok(),name+' '+r.status());
  assert((await r.body()).length>0,name+' empty');
 }
 console.log('All '+fs.readdirSync('assets').length+' image/font/script/video assets HTTP 200 and nonempty');
 const links=new Set();
 for(const width of [1440,390,360]){
  const p=await api.newPage({viewport:{width,height:950}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.url()+' '+r.status())});
  for(const name of ['index','projets','parcours','voyages','contact']){
   const path=name==='index'?'/':'/'+name;
   const r=await p.goto(base+path);assert(r.ok(),path);
   await p.waitForLoadState('networkidle');assert(await p.locator('main h1,main h2').first().isVisible());
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflow');
   const canonical='https://liloufalco.github.io'+(name==='index'?'/':'/'+name+'/');
   assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),canonical);
   assert.equal(await p.locator('meta[property="og:url"]').getAttribute('content'),canonical);
   assert.equal(await p.locator('meta[property="og:image"]').getAttribute('content'),'https://liloufalco.github.io/assets/avatar-hd.png');
   await p.locator('img').evaluateAll(async ns=>{await Promise.all(ns.map(e=>{e.loading='eager';return e.decode().catch(()=>{})}))});
   const images=await p.locator('img').evaluateAll(ns=>ns.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src));assert.deepEqual(images,[]);
   const hrefs=await p.locator('a[href]').evaluateAll(ns=>ns.map(e=>e.getAttribute('href')));
   for(const h of hrefs)if(h.startsWith('/'))links.add(h.split('#')[0]);else assert(/^(#|https:\/\/|mailto:|tel:)/.test(h),'Unexpected link '+h);
   if(name==='projets'){
    await p.locator('[role=tab][data-company="arbitryum"]').count().then(async count=>{
     if(count)await p.locator('[role=tab][data-company="arbitryum"]').click();
     else await p.getByRole('tab',{name:/Arbitryum/i}).click();
    });
    for(const video of ['formations','chantal','angela']){
     await p.locator('[data-project="'+video+'"]').click();
     const v=p.locator('video');await v.evaluate(async e=>{e.muted=true;await e.play()});
     await p.waitForTimeout(150);assert(await v.evaluate(e=>e.videoWidth>0&&e.currentTime>0&&e.error===null),video+' decode/play');
     await p.locator('#close-dialog').click();
    }
   }
  }
  assert.deepEqual(errors,[]);await p.close();
  console.log(width+' pretty routes/metadata/images/navigation/video playback/no overflow pass');
 }
 for(const path of links){const r=await api.request.get(base+path);assert(r.ok(),path+' '+r.status());}
 const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();
 await p.goto(base+'/voyages');assert(await p.locator('main h1,main h2').first().isVisible());assert(await p.locator('.map-world img').isVisible());await nojs.close();
 console.log(links.size+' unique internal links and no-JS pretty route pass');
 await api.close();await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
