// 線上驗證：node t/live.js <url> [chromium|webkit]
const {chromium,webkit}=require('playwright');const U=process.argv[2]||'https://oceanson17.github.io/qinlove-d3b528b8/';const which=process.argv[3]||'chromium';
(async()=>{const e=which==='webkit'?webkit:chromium;const b=await e.launch();const p=await (await b.newContext({viewport:{width:420,height:912},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120));});
const r=await p.goto(U+'?t='+Date.now());await p.waitForTimeout(2500);
await p.screenshot({path:'/workspace/qinlove/screenshots/v2_live_title.png'});
const ver=await p.evaluate(()=>typeof VER!=='undefined'?VER:(document.title));
const hasRom=await p.evaluate(()=>typeof Rom!=='undefined'&&Rom.CORE.length);const hasEnd=await p.evaluate(()=>typeof End!=='undefined');
await p.click('#tNew');await p.waitForTimeout(100);await p.click('[data-act="suGo"]');await p.waitForTimeout(800);
const st=await p.evaluate(()=>({n:pc().n,place:S.place,world:S.world,btn:[...document.querySelectorAll('#choices .cbtn')].length}));
const im=await p.evaluate(async()=>{let bad=[];const L=(typeof ASSET_FILES!=='undefined'?ASSET_FILES:[]);for(const f of L){const x=await fetch('assets/'+f,{cache:'no-store'});if(x.status!==200)bad.push(f+':'+x.status);}return {n:L.length,bad:bad};});
await p.screenshot({path:'/workspace/qinlove/screenshots/v2_live_game.png'});
console.log(which,'status',r.status(),JSON.stringify({ver,hasRom,hasEnd,st,im}),errs.length?errs:'no errs');await b.close();process.exit(r.status()===200&&!errs.length&&!im.bad.length?0:1);})();
