/* 試玩三：男尊／女尊世界各一局；試玩四：傳承到第二代（含嬰兒開局成長） */
const L=require('./lib');const eng=process.argv[2]||'chromium';const V=!!process.env.V;
const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
(async()=>{let p=await L.open({eng:L[eng]});
 // ---- 男尊：女西醫 ----
 await L.newStd(p,'蘇問荊','male');await L.flush(p);await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>UI.go('go',{pl:'yamen'}));await L.flush(p);if(V)await L.log(p,'男尊・縣衙');
 await L.click(p,/應吏試/);await L.flush(p);const t1=await L.txt(p);if(V)await L.log(p,'應吏試');A(/男尊之世/.test(t1),'男尊：女子不得應吏試 → '+t1.slice(0,40));
 await p.evaluate(()=>UI.go('go',{pl:'camp'}));await L.flush(p);await L.click(p,/投軍/);await L.flush(p);const t2=await L.txt(p);A(/軍中不收女/.test(t2),'男尊：軍中不收女子 → '+t2.slice(0,30));
 // 易裝後可投軍
 await p.evaluate(()=>{Inv.add('cloth',1);document.getElementById('free').value='/指令 女扮男裝';UI.submitFree();});await L.flush(p);if(V)await L.log(p,'易裝');const dg=await p.evaluate(()=>Gender.on());A(dg,'易裝（M16）');
 await p.evaluate(()=>UI.go('enlist'));await L.flush(p);if(V)await L.log(p,'易裝投軍');A(await p.evaluate(()=>!!S.flags.army),'易裝後投軍成功');
 const mw=await p.evaluate(()=>{var m=P('mengtian');return Rule.marryWord(pc(),m);});A(mw==='出嫁','男尊：女子成婚稱「出嫁」');
 await L.shot(p,'v2_world_male');
 // ---- 女尊：隨機男主角 ----
 await p.evaluate(()=>UI.go('title'));await p.waitForTimeout(100);
 let tries=0,isMale=false;do{await L.newRand(p,{world:'female',birth:'farm'});await L.flush(p);isMale=await p.evaluate(()=>pc().g==='m');tries++;if(!isMale)await p.evaluate(()=>UI.go('title'));}while(!isMale&&tries<8);
 A(isMale,'女尊：隨機到男主角（'+tries+' 次）');if(V)await L.log(p,'女尊開局');
 const fw=await p.evaluate(()=>({w:S.world,o:Rule.ok(pc(),'office'),why:Rule.why(pc(),'office'),mw:Rule.marryWord(pc(),{g:'f'}),heads:Eng.house().map(function(q){return q.n+q.g+(q.rel||'');}).join(' ')}));
 A(fw.w==='female'&&!fw.o&&/女尊/.test(fw.why)&&fw.mw==='出嫁','女尊：男子不能入仕、成婚稱出嫁 '+JSON.stringify(fw));
 const kidSch=await p.evaluate(()=>{var k=genPerson({g:'m',age:8,kind:'npc',hh:1,met:1,sur:S.fam.sur});S.ppl[k.id]=k;return Rule.ok(k,'school');});A(kidSch===false,'女尊：男童不得入學室');
 await L.shot(p,'v2_world_female');
 // 女尊世界走走：讓 AI 離線事件跑幾天
 for(let i=0;i<3;i++){await p.evaluate(()=>UI.go('skip',{n:3}));for(let j=0;j<8;j++){const r=await L.flush(p);if(r==='dlg'){await L.dlgOk(p);continue;}if(r==='med'){await L.medSolve(p,true);continue;}const b=await L.btns(p);if(b.some(t=>/繼續|行動選單/.test(t))&&j>0)break;await p.locator('#choices .cbtn').first().click();await p.waitForTimeout(30);}}
 if(V)await L.log(p,'女尊數日後');
 // ---- 傳承：嬰兒開局成長 → 老死 → 子女繼承 ----
 await p.evaluate(()=>UI.go('title'));await p.waitForTimeout(100);
 await L.newRand(p,{world:'equal',birth:'tradoc',baby:true});await L.flush(p);if(V)await L.log(p,'嬰兒開局');
 const a0=await p.evaluate(()=>ageOf(pc()));A(a0<=1,'嬰兒開局 年齡 '+a0);
 for(let i=0;i<160;i++){const r=await L.flush(p);if(r==='dlg'){await L.dlgOk(p);continue;}if(r==='med'){await L.medSolve(p,true);continue;}const age=await p.evaluate(()=>ageOf(pc()));if(age>=14)break;const b=await L.btns(p);if(V&&i<4)await L.log(p,'成長'+age);let k=b.findIndex(t=>/繼續|開始長大|咿咿|學醫|識字|長大成人|↩/.test(t));if(k<0)k=b.length-1;await p.locator('#choices .cbtn').nth(k).click();await p.waitForTimeout(30);}
 const g1=await p.evaluate(()=>({age:ageOf(pc()),sk:pc().sk,expr:pc().expr}));A(g1.age>=14,'成長到十四歲 '+JSON.stringify(g1));if(V)await L.log(p,'十四歲');await L.shot(p,'v2_grownup');
 // 成婚生子後老死
 await p.evaluate(()=>{var me=pc();var sp=genPerson({g:me.g==='f'?'m':'f',age:ageOf(me)+2,kind:'npc',job:'farmer',met:1,aff:70,love:60});S.ppl[sp.id]=sp;People.marry(sp.id);var mo=me.g==='f'?me:sp;mo.born=S.day-20*DPY;mo.preg={d:S.day,due:S.day,fa:me.g==='f'?sp.id:me.id};var k=People.birth(mo)[0];k.born=S.day-15*DPY;k.sk.med=20;var k2;mo.preg={d:S.day,due:S.day,fa:me.g==='f'?sp.id:me.id};k2=People.birth(mo)[0];k2.born=S.day-12*DPY;me.born=S.day-70*DPY;S.fam.fame=40;});
 await p.evaluate(()=>{pc().hp=0;Eng.dead();UI.go('place');});await L.flush(p);if(V)await L.log(p,'老死');await L.click(p,/這一生的結局/);
 for(let i=0;i<40;i++){if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))break;await p.waitForTimeout(100);}await L.dlgOk(p);await L.flush(p);
 await L.click(p,/由子女繼承/);await L.flush(p);await L.shot(p,'v2_succession');if(V)await L.log(p,'選繼承人');await L.click(p,/繼承/);await L.flush(p);if(V)await L.log(p,'第二代');
 const g2=await p.evaluate(()=>({gen:S.fam.gen,pc:pc().n,age:ageOf(pc()),fame:S.fam.fame,lives:Meta.get().lives.length,tech:Object.keys(S.fam.tech).length}));A(g2.gen===2&&g2.lives>=1,'傳承到第二代 '+JSON.stringify(g2));
 await p.evaluate(()=>UI.go('place'));await L.flush(p);await p.click('#tabs [data-t="fam"]');await p.waitForTimeout(150);await p.click('[data-tab="tree"]');await p.waitForTimeout(150);await L.shot(p,'v2_tree_gen2');const tr=await p.$$eval('.trow',e=>e.length);A(tr>=2,'族譜兩代 '+tr);await L.closeSheet(p);
 console.log(eng,'play_world ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
