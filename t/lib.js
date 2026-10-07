const {webkit,chromium}=require('playwright');
exports.webkit=webkit;exports.chromium=chromium;
exports.open=async function(opts){opts=opts||{};
 const b=await (opts.eng||chromium).launch();
 const ctx=await b.newContext({viewport:opts.vp||{width:420,height:912},deviceScaleFactor:opts.dpr||1,hasTouch:!!opts.touch});
 const p=await ctx.newPage();p.errs=[];
 p.on('pageerror',e=>p.errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' ')));
 p.on('console',m=>{if(m.type()==='error')p.errs.push('CE '+m.text().slice(0,300));});
 await p.addInitScript((s)=>{try{if(!localStorage.getItem('qlv_settings'))localStorage.setItem('qlv_settings',JSON.stringify(s));}catch(e){}},Object.assign({typer:false},opts.settings||{}));
 await p.goto('file://'+(process.env.QF_FILE||'/workspace/qinlove/index.html'));await p.waitForTimeout(300);
 p.browser_=b;return p;};
const L=exports;
exports.btns=p=>p.$$eval('#choices .cbtn',els=>els.map(e=>e.textContent));
exports.txt=p=>p.$eval('#txt',e=>e.textContent);
exports.click=async function(p,re){const list=await L.btns(p);const i=list.findIndex(t=>re.test(t));if(i<0)throw new Error('no btn '+re+' in ['+list.join(' | ')+']');await p.locator('#choices .cbtn').nth(i).click();await p.waitForTimeout(40);return list[i];};
exports.tryClick=async function(p,re){try{await L.flush(p);return await L.click(p,re);}catch(e){return null;}};
exports.state=(p,f,a)=>p.evaluate(f,a);
/* 推進到有選項／地圖／醫療／對話框 */
exports.flush=async function(p){for(let i=0;i<80;i++){const st=await p.evaluate(()=>({map:document.getElementById('map').className.indexOf('on')>=0,n:document.querySelectorAll('#choices .cbtn').length,busy:document.getElementById('busy').className==='on',med:document.getElementById('med').className.indexOf('on')>=0,dlg:document.getElementById('dlg').className.indexOf('on')>=0,sheet:document.getElementById('sheet').className.indexOf('on')>=0}));
  if(st.dlg)return 'dlg';if(st.med)return 'med';if(st.map)return 'map';if(st.sheet)return 'sheet';if(st.n&&!st.busy)return true;if(!st.busy)await p.evaluate(()=>UI.adv());await p.waitForTimeout(st.busy?150:20);}return false;};
exports.pick=async function(p,re){await L.flush(p);return L.click(p,re);};
exports.dlgOk=async function(p){await p.locator('#dlA .btn.pri').first().click().catch(async()=>{await p.locator('#dlA .btn').first().click();});await p.waitForTimeout(60);};
/* 西醫小遊戲：全部檢查 → 正確（或錯誤）診斷 → 依理想次序處置（缺的略過）→ 完成 */
exports.medSolve=async function(p,right){const ex=['t','pulse','resp','mind','look','touch','listen'];for(const k of ex){await p.click('[data-ex="'+k+'"]');await p.waitForTimeout(10);}
 const ans=await p.evaluate(()=>({dx:Med.cur.d.dx,w:Med.cur.d.wrong[0],seq:Med.cur.d.seq}));
 await p.locator('[data-dx]').filter({hasText:right!==false?ans.dx:ans.w}).first().click();await p.waitForTimeout(20);
 for(const t of ans.seq){const ok=await p.evaluate(t=>Med.techOk(t).ok,t);if(ok){await p.click('[data-tc="'+t+'"]');await p.waitForTimeout(20);if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))await L.dlgOk(p);}}
 await p.click('#mdFin');await p.waitForTimeout(40);const res=await p.evaluate(()=>Med.cur&&Med.cur.res?Med.cur.res.out:'');await p.click('#mdDone');await p.waitForTimeout(60);return res;};
exports.newStd=async function(p,name,world){await p.click('#tNew');await p.waitForTimeout(60);if(world)await p.click('[data-act="suWorld"][data-v="'+world+'"]');if(name)await p.fill('#suName',name);await p.click('[data-act="suGo"]');await p.waitForTimeout(100);};
exports.newRand=async function(p,o){o=o||{};await p.click('#tNew');await p.waitForTimeout(60);await p.click('[data-act="suMode"][data-v="'+(o.custom?'custom':'rand')+'"]');await p.waitForTimeout(30);if(o.world)await p.click('[data-act="suWorld"][data-v="'+o.world+'"]');
 if(o.custom){await p.fill('#suText',o.custom);await p.click('[data-act="suParse"]');await p.waitForTimeout(40);}
 else{if(o.birth){await p.selectOption('#suBirth',o.birth);await p.waitForTimeout(40);}if(o.baby)await p.click('[data-act="suBaby"]');}
 await p.click('[data-act="suGo"]');await p.waitForTimeout(100);};
exports.shot=async(p,n)=>{await p.waitForTimeout(500);return p.screenshot({path:'/workspace/qinlove/screenshots/'+n+'.png'});};
exports.go=async function(p,node,a){await p.evaluate(([n,a])=>UI.go(n,a),[node,a||{}]);await p.waitForTimeout(40);return L.flush(p);};
exports.closeSheet=async p=>{await p.click('#shX');await p.waitForTimeout(40);};
