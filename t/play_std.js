/* 試玩一：標準開局 → 生存 → 開館行醫 → 心動 → 結婚 → 生子 → 族譜 */
const L=require('./lib');const eng=process.argv[2]||'chromium';const V=!!process.env.V;
const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
(async()=>{const p=await L.open({eng:L[eng]});const lg=V?L.log:async()=>{};const pk=async(re,tag)=>{await L.flush(p);const t=await L.click(p,re);const r=await L.flush(p);if(V)await L.log(p,tag||t);return r;};
 await L.shot(p,'v2_title');
 await p.click('#tNew');await p.waitForTimeout(150);await L.shot(p,'v2_setup_std');await p.fill('#suName','沈青');await p.click('[data-act="suGo"]');await p.waitForTimeout(100);
 await L.flush(p);await lg(p,'開場');A(/沈青/.test(await p.evaluate(()=>UI.sc.lines.map(l=>l.t).join(''))),'名字可改');
 await pk(/踏出/);await L.shot(p,'v2_survival');
 const m=await p.$$eval('#meters .mt',e=>e.length);A(m===5,'HUD 生存條（飽／體／健／心／溫）');
 // 第一日：付房錢、去市集打零工、吃飯
 await pk(/付十兩/);await pk(/行動選單|繼續|↩/);
 await p.evaluate(()=>UI.go('go',{pl:'market'}));await L.flush(p);await lg(p,'到市集');
 for(let i=0;i<3;i++){const r=await L.flush(p);if(r==='med'){await L.medSolve(p,true);continue;}const b=await L.btns(p);if(b.some(t=>/打零工/.test(t)))await pk(/打零工/);else await pk(/行動選單|繼續|↩|告辭/);}
 await L.flush(p);let b=await L.btns(p);if(b.some(t=>/用膳/.test(t)))await pk(/用膳/);
 const g0=await p.evaluate(()=>({g:S.gold,f:pc().food,day:S.day}));A(g0.f>20,'能進食維持飽食 '+JSON.stringify(g0));
 // 擺攤義診（行醫）
 await L.flush(p);await p.evaluate(()=>UI.go('place'));await L.flush(p);b=await L.btns(p);
 if(b.some(t=>/擺攤義診/.test(t))){await L.click(p,/擺攤義診/);const r=await L.flush(p);if(r==='med'){await p.waitForTimeout(200);for(const k of ['t','pulse','look']){await p.click('[data-ex="'+k+'"]');await p.waitForTimeout(30);}await L.shot(p,'v2_med');const out=await L.medSolve(p,true);A(/cure|better/.test(out),'義診治療結果 '+out);await L.flush(p);await lg(p,'義診後');}}
 // 攢錢開館
 await p.evaluate(()=>{if(S.gold<130)S.gold+=130;});/* 試玩加速：模擬數日行醫所得 */
 await p.evaluate(()=>UI.go('go',{pl:'clinic'}));await L.flush(p);await lg(p,'醫館街');await pk(/租下舖面/);await pk(/行動選單|繼續|↩/);
 A(await p.evaluate(()=>S.fam.clinic.open),'開館成功');
 let cured=0;for(let i=0;i<3;i++){await L.flush(p);b=await L.btns(p);if(!b.some(t=>/坐堂看診/.test(t))){await p.evaluate(()=>UI.go('place'));await L.flush(p);}await L.click(p,/坐堂看診/);const r=await L.flush(p);if(r==='med'){const o=await L.medSolve(p,true);if(/cure|better/.test(o))cured++;}await L.flush(p);if(V)await L.log(p,'看診後');await p.evaluate(()=>{pc().sta=80;pc().food=80;});}
 A(cured>=2,'坐堂看診治癒 '+cured);
 const st=await p.evaluate(()=>({pat:S.stats.pat,cure:S.stats.cure,fame:S.fam.fame,notor:S.fam.notor||0,q:S.queue.map(q=>q.go)}));A(st.pat>=4,'看診統計 '+JSON.stringify(st));
 // 心動：遇見蒙恬（市集），自然推進兩章
 await p.evaluate(()=>{S.per=3;UI.go('go',{pl:'market'});});await L.flush(p);b=await L.btns(p);await lg(p,'市集・巳時');
 let met=await p.evaluate(()=>People.present().indexOf('mengtian')>=0);A(met,'蒙恬按作息出現在市集');
 if(met){await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await L.flush(p);await lg(p,'與蒙恬交談');
  for(let i=0;i<6;i++){await p.evaluate(()=>{P('mengtian').notes.tk=0;});await pk(/閒聊/);}await lg(p,'閒聊後');
  await p.evaluate(()=>{Inv.add('candy',2);});await pk(/送禮/);await L.flush(p);b=await L.btns(p);const k=b.findIndex(t=>/糖/.test(t));if(k>=0){await p.locator('#choices .cbtn').nth(k).click();await L.flush(p);await lg(p,'送糖');}
  const mm=await p.evaluate(()=>({aff:P('mengtian').aff,love:P('mengtian').love,why:Rom.why('mengtian')}));A(mm.aff>=6,'交談送禮提升好感 '+JSON.stringify(mm));
  await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await L.flush(p);b=await L.btns(p);if(b.some(t=>/^💞/.test(t))){await pk(/^💞/,'心動第一章');await p.locator('#choices .cbtn').first().click();await L.flush(p);await lg(p,'回應');}
  A(await p.evaluate(()=>Rom.stage('mengtian')>=1),'心動第一章觸發');}
 // 加速相處（模擬數十日往來），走完心動＋求親
 await p.evaluate(()=>{var m=P('mengtian');for(var s=Rom.stage('mengtian');s<5;s++){var n=Rom.ARC.mengtian[s].need;for(var k in n)m[k]=Math.max(m[k],n[k]);m.notes.rs=s+(s<4?1:0);}m.notes.rs=4;m.notes.rsd=0;m.aff=Math.max(m.aff,60);m.trust=Math.max(m.trust,40);m.love=Math.max(m.love,55);m.here={d:S.day,per:S.per,pl:S.place};S.gold=Math.max(S.gold,300);});
 await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await L.flush(p);await pk(/^💞/,'告白章');await pk(/我也是/,'答應');
 await L.flush(p);b=await L.btns(p);A(b.some(t=>/觀看這段結局/.test(t)),'告白成功→可觀看結局');
 await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await L.flush(p);await pk(/求親/,'求親');b=await L.btns(p);
 const kw=b.findIndex(t=>/成親|拜堂|下聘|好|迎娶|擇日/.test(t));if(kw>=0){await p.locator('#choices .cbtn').nth(kw).click();await L.flush(p);await lg(p,'婚禮');}
 A(await p.evaluate(()=>pc().spouse==='mengtian'),'與蒙恬成婚');
 // 生子：歲月流轉直到出生
 let born=0;for(let i=0;i<30&&!born;i++){await p.evaluate(()=>UI.go('skip',{n:10}));let r=await L.flush(p);for(let j=0;j<12;j++){r=await L.flush(p);if(r==='dlg'){const inp=await p.$('#dlg.on input');if(inp)await inp.fill('念安');await L.dlgOk(p);continue;}if(r==='med'){await L.medSolve(p,true);continue;}if(r==='sheet'){await L.closeSheet(p);continue;}const bb=await L.btns(p);if(bb.some(t=>/繼續|行動選單/.test(t))&&j>0)break;const k2=bb.findIndex(t=>/繼續|行動選單|起名|好/.test(t));await p.locator('#choices .cbtn').nth(k2>=0?k2:0).click();await p.waitForTimeout(40);}
  born=await p.evaluate(()=>pc().kids.length);}
 const kid=await p.evaluate(()=>{var k=P(pc().kids[0]);return k&&{n:k.n,g:k.g,expr:k.expr,par:k.par};});A(!!kid,'生兒育女 '+JSON.stringify(kid));
 await p.click('#tabs [data-t="fam"]');await p.waitForTimeout(200);await p.click('[data-tab="tree"]');await p.waitForTimeout(200);await L.shot(p,'v2_tree');const tr=await p.$$eval('.tchip',e=>e.length);A(tr>=3,'族譜顯示 '+tr);await L.closeSheet(p);
 const sum=await p.evaluate(()=>({day:S.day,date:Eng.dateStr(),gold:S.gold,fame:S.fam.fame,tier:TIERS[Fam.tier()].n,ends:Meta.get().ends.length,fixed:Object.keys(Meta.get().fixed)}));console.log('總結',JSON.stringify(sum));
 console.log(eng,'play_std ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
