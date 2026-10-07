/* 心動：七人羈絆篇章、告白→結局、求親→婚姻結局 */
const L=require('./lib');const eng=process.argv[2]||'chromium';
(async()=>{const p=await L.open({eng:L[eng]});const ok=[];const fail=[];const A=(c,m)=>(c?ok:fail).push(m);
 await L.newStd(p,'白芷','equal');await L.flush(p);await L.click(p,/踏出/);await L.flush(p);
 // 蒙恬五章
 await p.evaluate(()=>{var m=P('mengtian');People.meet('mengtian');m.aff=30;m.trust=30;m.love=0;S.place=People.where('mengtian')||'market';m.here={d:S.day,per:S.per,pl:S.place};});
 for(let st=0;st<5;st++){await p.evaluate(()=>{var m=P('mengtian');m.notes.rsd=0;var n=Rom.ARC.mengtian[Rom.stage('mengtian')].need;for(var k in n)m[k]=Math.max(m[k],n[k]);m.here={d:S.day,per:S.per,pl:S.place};});
  await L.go(p,'talk',{id:'mengtian'});const bs=await L.btns(p);A(bs.some(t=>/^💞/.test(t)),'stage'+st+' 💞 button: '+bs[0]);await L.click(p,/^💞/);await L.flush(p);
  await p.locator('#choices .cbtn').first().click();await L.flush(p);}
 const r=await p.evaluate(()=>({s:Rom.stage('mengtian'),lover:P('mengtian').lover,fact:S.facts.some(f=>/互許心意/.test(f.t)),mem:Nom.list('mengtian',30).length,bs:[].map.call(document.querySelectorAll('#choices .cbtn'),e=>e.textContent)}));
 A(r.s===5&&r.lover&&r.fact,'confession done '+JSON.stringify(r));A(r.bs.some(t=>/觀看這段結局/.test(t)),'milestone ending offered');A(r.mem>=5,'memories '+r.mem);
 await L.click(p,/觀看這段結局/);for(let i=0;i<40;i++){if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))break;await p.waitForTimeout(100);}
 const e=await p.evaluate(()=>{var e=Meta.get().ends.slice(-1)[0];return e&&{k:e.kind,t:e.title,type:e.type,who:e.who,mono:e.mono&&e.mono.t};});A(e&&e.k==='confessOk','end saved '+JSON.stringify(e));
 await L.shot(p,'v2_rom_end');await L.dlgOk(p);await L.flush(p);
 // 求親
 await p.evaluate(()=>{S.gold=900;P('mengtian').aff=Math.max(60,P('mengtian').aff);P('mengtian').here={d:S.day,per:S.per,pl:S.place};});await L.go(p,'talk',{id:'mengtian'});const bs2=await L.btns(p);A(bs2.some(t=>/求親/.test(t)),'propose option '+bs2.join('|'));
 await L.click(p,/求親/);await L.flush(p);let t2=await L.btns(p);for(let i=0;i<4&&!(await p.evaluate(()=>pc().spouse));i++){const b=await L.btns(p);const k=b.findIndex(x=>/成親|拜堂|迎娶|好|婚/.test(x));if(k<0)break;await p.locator('#choices .cbtn').nth(k).click();await L.flush(p);}
 const sp=await p.evaluate(()=>({sp:pc().spouse,fixed:End.matchFixed()}));A(sp.sp==='mengtian'&&sp.fixed.indexOf('he_meng')>=0,'married '+JSON.stringify(sp)+' btns '+t2.join('|'));
 // 玄夜夜訪
 const xy=await p.evaluate(()=>{S.per=5;S.day=10;S.flags.xyTry=0;S.flags.romAuto=0;SET.pace='fast';S.home={r:'xianyang',pl:S.place};var n=0;for(var i=0;i<30;i++){S.flags.xyTry=0;S.flags.romAuto=0;if(Rom.auto()==='xuanye'){n++;break;}}return n;});A(xy===1,'xuanye night visit triggers');
 await L.go(p,'rom',{id:'xuanye'});A((await L.txt(p)).length>0&&await p.evaluate(()=>P('xuanye').met),'xuanye met via night scene');
 // 心動面板
 await p.click('#tabs [data-t="ppl"]');await p.waitForTimeout(200);const pan=await p.$eval('#shB',e=>e.textContent);A(/蒙恬/.test(pan)&&/已成眷屬|互許/.test(pan),'romance panel');await L.shot(p,'v2_rom_panel');await L.closeSheet(p);
 console.log(eng,'rom ok',ok.length,'fail',fail.length,fail,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
