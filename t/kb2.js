// M19 觸控全屏輸入面板：node t/kb2.js chromium|webkit
const L=require('./lib');const eng=process.argv[2]||'chromium';const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
(async()=>{const p=await L.open({eng:L[eng],touch:true});await L.newStd(p,'');await L.flush(p);
const coarse=await p.evaluate(()=>Kb.on());A(coarse,'觸控裝置判定 coarse');
await p.tap('#free');await p.waitForTimeout(300);A(await p.$eval('#kbp',e=>e.className==='on'),'點輸入框→全屏輸入面板');
await p.fill('#kbta','你好，今日天氣不錯');await p.evaluate(()=>document.getElementById('kbta').dispatchEvent(new Event('input')));await p.waitForTimeout(100);
A(/\/120/.test(await p.$eval('#kbcnt',e=>e.textContent)),'字數計');
const box=await p.$eval('#kbbox',e=>{const b=e.getBoundingClientRect();return [b.left,b.right,b.top,b.bottom];});A(box[0]>=0&&box[1]<=420&&box[2]>=0,'面板不溢出 '+box.map(Math.round));
const tgt=await p.$$eval('#kbcancel,#kbsend',es=>es.map(e=>Math.round(e.getBoundingClientRect().height)));A(tgt.every(h=>h>=38),'觸控目標≥38px '+tgt);
await p.tap('#kbcancel');await p.waitForTimeout(200);const draft=await p.evaluate(()=>({open:Kb.open,v:document.getElementById('free').value}));A(!draft.open,'收起面板 '+JSON.stringify(draft));
await p.tap('#free');await p.waitForTimeout(300);await p.fill('#kbta','你好');await p.tap('#kbsend');await p.waitForTimeout(600);
A(await p.evaluate(()=>!Kb.open),'送出後關閉');await L.shot(p,'v2_kb_'+eng);
console.log(eng,'kb2 ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
