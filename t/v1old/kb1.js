/* 觸控裝置：全屏輸入面板（M19）＋截圖 */
const L=require('./lib');
const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const tag=process.argv[2]||'webkit';
let ok=0,bad=0;function chk(c,m){if(c){ok++;}else{bad++;console.log('  ✘',m);}}
(async()=>{const p=await L.open({eng,touch:true,settings:{typer:false}});const st=e=>p.evaluate(e);
 chk(await st(()=>VV.coarse()),'coarse detected');
 await L.newGame(p,'豆豆');await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.flush(p);
 chk(await p.$eval('#free',e=>e.readOnly&&e.getAttribute('inputmode')==='none'),'free readonly on touch');
 await p.tap('#free');await p.waitForTimeout(120);chk(await p.$eval('#kbp',e=>e.className==='on'),'kb panel opens');
 chk(await p.$eval('#kbta',e=>getComputedStyle(e).fontSize==='16px'),'textarea 16px');
 if(tag==='chromium')await L.shot(p,'50_kbpanel');
 await p.fill('#kbta','謝謝你，將軍');
 await p.$eval('#kbta',e=>{const ev=new KeyboardEvent('keydown',{key:'Enter',keyCode:229,bubbles:true});e.dispatchEvent(ev);});
 chk(await p.$eval('#kbp',e=>e.className==='on'),'IME enter ignored');
 const n0=await st(()=>S.back.length);await p.tap('#kbsend');await p.waitForTimeout(150);
 chk(await p.$eval('#kbp',e=>e.className!=='on'),'panel closed');chk(await st(()=>S.back.some(b=>b.sp==='p'&&/謝謝你，將軍/.test(b.t))),'submitted');
 await p.tap('#free');await p.waitForTimeout(80);await p.fill('#kbta','草稿');await p.tap('#kbcancel');await p.waitForTimeout(80);chk(await p.$eval('#free',e=>e.value)==='草稿','cancel keeps draft');
 /* 書信親筆回信用面板 */
 await st(()=>{Letters.send('mengtian','low');});await p.tap('#tabs [data-t="let"]');await p.tap('.env');await p.tap('[data-rep="free"]');await p.waitForTimeout(100);
 chk(await p.$eval('#kbp',e=>e.className==='on'),'reply via kb panel');await p.fill('#kbta','改天一起吃糖人');await p.tap('#kbsend');await p.waitForTimeout(100);
 chk(await st(()=>S.letters[S.letters.length-1].rt==='改天一起吃糖人'),'free reply saved');await p.tap('#shX');
 /* 版面：不溢出、觸控目標 */
 const lay=await st(()=>{const o={};const b=$('box').getBoundingClientRect(),t=$('tabs').getBoundingClientRect();o.boxAboveTabs=b.bottom<=t.top+1;o.tabsBottom=Math.round(t.bottom);o.h=innerHeight;
  o.small=[...document.querySelectorAll('#choices .cbtn,#tabs button,#send,#mode')].filter(e=>{const r=e.getBoundingClientRect();return r.height&&r.height<38;}).length;o.sw=document.documentElement.scrollWidth<=innerWidth;return o;});
 chk(lay.boxAboveTabs&&lay.tabsBottom<=lay.h&&lay.small===0&&lay.sw,'layout '+JSON.stringify(lay));
 console.log(tag,'kb1 ok',ok,'bad',bad,'errs',p.errs.length?p.errs:'none');await p.browser_.close();process.exit(bad?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
