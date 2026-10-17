const {chromium}=require('/tmp/qa/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/opt/hako/bin/google-chrome',args:['--no-sandbox']});
 const base=process.env.BASE||'http://localhost:18743';
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:{width:mobile?390:1440,height:950},isMobile:mobile,hasTouch:mobile});
  const p=await context.newPage();
  for(const page of ['index','parcours','projets','voyages','contact']){
   await p.goto(base+'/'+page+'.html');await p.waitForLoadState('networkidle');
   const cursor=loc=>loc.evaluate(e=>getComputedStyle(e).cursor);
   const rest=await cursor(p.locator('body')),click=await cursor(p.locator('nav a').first());
   assert.equal(rest.includes('cursor-heart.png'),!mobile);
   assert.equal(click.includes('cursor-hand.png'),!mobile);
   const samples=await p.locator('h1,p,.skill-button,.skill-button *,summary,summary *,.project-card *,[role="tab"] *,.map-interactive-svg [role="button"]').evaluateAll(nodes=>nodes.map(e=>({
    cursor:getComputedStyle(e).cursor,
    clickable:!!e.closest('a[href],button,summary,[role="button"],[role="tab"]'),
    disabled:!!e.closest(':disabled,[aria-disabled="true"],.locked-card')
   })));
   if(!mobile)for(const sample of samples)assert(sample.cursor.includes(sample.clickable&&!sample.disabled?'cursor-hand.png':'cursor-heart.png'),JSON.stringify(sample));
   await p.evaluate(()=>{
    const input=document.createElement('input');input.id='cursor-test-input';document.body.append(input);
   });
   assert.equal(await cursor(p.locator('#cursor-test-input')),'text');
   console.log((mobile?'touch':'desktop')+' '+page+' cursor inheritance/clickables/input pass');
  }
  await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
