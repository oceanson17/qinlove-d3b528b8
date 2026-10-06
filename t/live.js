const {chromium,webkit}=require('playwright');(async()=>{for(const [n,e] of [['chromium',chromium],['webkit',webkit]]){const b=await e.launch();const p=await (await b.newContext({viewport:{width:420,height:912},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120));});
const r=await p.goto(process.argv[2]+'?t='+Date.now());await p.waitForTimeout(2500);
await p.click('#tNew');await p.locator('#dlA .btn.pri').click();await p.waitForTimeout(300);
const s=await p.evaluate(()=>[document.fonts&&[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).filter((v,i,a)=>a.indexOf(v)===i).join(','),S&&S.p.name]);
if(n==='chromium'){await p.goto(process.argv[2]+'?t=2');await p.waitForTimeout(2500);await p.screenshot({path:'/workspace/qinlove/screenshots/00_live_title.png'});}
console.log(n,r.status(),JSON.stringify(s),errs.length?errs:'no errs');await b.close();}})();
