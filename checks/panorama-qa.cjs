const{chromium}=require('/tmp/qa/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
for(const[width,height]of[[1440,900],[1366,768],[390,844],[360,740],[375,667]]){
const p=await b.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600});await p.goto((process.env.BASE||'http://localhost:19387')+'/voyages/');await p.locator('.map-viewport').waitFor();await p.evaluate(()=>document.fonts.ready);
const view=await p.locator('.map-viewport').boundingBox(),frise=await p.locator('.travel-timeline').boundingBox();
assert(view.height<height*(width<600?.22:.45));assert(frise.y<height-20,'frise visible '+width+' y'+frise.y);
assert.equal(await p.locator('.map-interactive-svg').getAttribute('viewBox'),'458 70 445 167');
await p.locator('[data-visited=GIB] button').click();await p.waitForTimeout(520);assert((await p.locator('.map-country-card').innerText()).includes('Gibraltar'));
await p.getByRole('button',{name:'Réinitialiser la carte',exact:true}).click();assert.equal(await p.locator('.map-interactive-svg').getAttribute('viewBox'),'458 70 445 167');
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await p.screenshot({path:'checks/panorama-'+width+'.png',fullPage:true});console.log(width+'x'+height+' panorama '+Math.round(view.height)+'px frise peeks '+Math.round(height-frise.y)+'px + Gibraltar/reset pass');await p.close()}
await b.close()})().catch(e=>{console.error(e);process.exit(1)});
