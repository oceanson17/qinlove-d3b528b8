/* 試玩二：全隨機開局（流放）→ 流放路數日 → 抵達邊地開荒 */
const L=require('./lib');const eng=process.argv[2]||'chromium';const V=!!process.env.V;const world=process.argv[3]||'equal';
const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
(async()=>{const p=await L.open({eng:L[eng]});await p.evaluate(()=>{_seed=4242;});
 await p.click('#tNew');await p.waitForTimeout(100);await p.click('[data-act="suMode"][data-v="rand"]');await p.waitForTimeout(60);await p.click('[data-act="suWorld"][data-v="'+world+'"]');await p.selectOption('#suBirth','exile');await p.waitForTimeout(80);
 await L.shot(p,'v2_setup_rand');const card=await p.$eval('#shB',e=>e.textContent);A(/流放/.test(card),'隨機身世卡顯示流放');
 await p.click('[data-act="suRoll"]');await p.waitForTimeout(60);await p.selectOption('#suBirth','exile');await p.waitForTimeout(60);
 await p.click('[data-act="suGo"]');await p.waitForTimeout(100);await L.flush(p);if(V)await L.log(p,'開場');
 const s0=await p.evaluate(()=>({reg:S.region,fam:Eng.house().map(q=>q.n+'('+(q.rel||'')+ageOf(q)+')'),road:S.road&&{total:S.road.total,dn:S.road.dn,guards:S.road.guards.map(cn),mates:S.road.mates.map(cn)},grudge:S.fam.grudge&&S.fam.grudge.crime,world:S.world}));console.log('開局',JSON.stringify(s0));
 A(s0.reg==='road'&&s0.fam.length>=2&&s0.road,'流放家族、衙役、同行者自動生成');
 let b=await L.btns(p);await L.click(p,b[0]?new RegExp(b[0].slice(0,4).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')):/./);
 let days=0,events=0,lastDay=0;const seen=new Set();
 for(let step=0;step<120&&days<9;step++){const r=await L.flush(p);
  if(r==='dlg'){await L.dlgOk(p);continue;}if(r==='med'){await L.medSolve(p,true);continue;}if(r==='sheet'){await L.closeSheet(p);continue;}if(r==='map'){await p.evaluate(()=>UI.go('place'));continue;}
  const st=await p.evaluate(()=>({d:S.day,per:S.per,reg:S.region,marched:S.road&&S.road.marched,ev:S.evcur||''}));if(st.reg!=='road'){break;}
  if(st.d!==lastDay){lastDay=st.d;days++;if(days===2)await L.shot(p,'v2_exile');}
  b=await L.btns(p);const t=b.join('|');
  let re=null;
  if(/跟著隊伍趕路/.test(t)&&!st.marched&&st.per<=1)re=/跟著隊伍趕路/;
  else if(/為.*診治/.test(t)&&step%2===0)re=/為.*診治/;
  else if(/照料家人/.test(t)&&step%3===0)re=/照料家人/;
  else if(/路邊採摘/.test(t)&&step%4===1)re=/路邊採摘/;
  else if(/用膳/.test(t)&&st.per%2===0)re=/用膳/;
  else if(/搭帳歇腳/.test(t)&&st.per>=4&&step%2===0)re=/搭帳歇腳/;
  else if(/就寢|歇一個時辰/.test(t))re=st.per>=4?/就寢|歇一個時辰/:/歇一個時辰|就寢/;
  if(!re){re=new RegExp(b[0].slice(0,6).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));if(!/↩|繼續|行動選單/.test(b[0])){events++;seen.add(b.slice(0,3).join('/'));}}
  const k=b.findIndex(x=>re.test(x));if(re.source.indexOf('採摘')>=0||re.source.indexOf('照料')>=0||events<=6||V){}
  await p.locator('#choices .cbtn').nth(Math.max(0,k)).click();await p.waitForTimeout(30);await L.flush(p);if(V)await L.log(p,'d'+st.d+' '+b[Math.max(0,k)]);
  const fg=await L.btns(p);const fk=fg.findIndex(x=>/只收認得/.test(x));if(fk>=0&&/採摘/.test(b[Math.max(0,k)]||'')){await p.locator('#choices .cbtn').nth(fk).click();await L.flush(p);if(V)await L.log(p,'採集');}
 }
 const s1=await p.evaluate(()=>({d:S.day,reg:S.region,road:S.road&&S.road.day,fam:Eng.house().map(q=>q.n+' 飽'+Math.round(q.food)+' 健'+Math.round(q.hp)+' 足'+Math.round(q.feet||0)+' 衣'+Math.round(q.cloth||0)+(q.ill.length?' '+Ill.str(q):'')),alive:Eng.house().length,inv:Object.keys(S.inv).filter(k=>S.inv[k]>0).map(k=>ITEMS[k].n+S.inv[k]).join(' '),gold:S.gold,log:S.log.slice(-8).map(l=>l.t)}));
 console.log('數日後',JSON.stringify(s1,null,1));A(days>=4,'流放路走了 '+days+' 日');A(s1.alive>=2,'家人存活 '+s1.alive);A(events>=1,'路上事件 '+events+' '+[...seen].slice(0,5).join(' ; '));
 // 抵達：直接把行程推到最後
 await p.evaluate(()=>{if(S.region==='road'){S.road.day=S.road.total;S.road.marched=0;S.per=0;}});await p.evaluate(()=>UI.go('place'));await L.flush(p);b=await L.btns(p);if(b.some(t=>/趕路/.test(t))){await L.click(p,/趕路/);}
 for(let i=0;i<6;i++){const r=await L.flush(p);if(r==='dlg'){await L.dlgOk(p);continue;}if(await p.evaluate(()=>S.region==='frontier'))break;b=await L.btns(p);await p.locator('#choices .cbtn').first().click();await p.waitForTimeout(30);}
 await L.flush(p);if(V)await L.log(p,'抵達');const s2=await p.evaluate(()=>({reg:S.region,pl:S.place}));A(s2.reg==='frontier','抵達邊地 '+JSON.stringify(s2));
 await p.evaluate(()=>UI.go('place'));await L.flush(p);b=await L.btns(p);if(V)console.log('邊地選項',b.join('|'));A(b.some(t=>/搭屋/.test(t)),'可以搭屋');
 if(b.some(t=>/搭屋/.test(t))){await L.click(p,/搭屋/);await L.flush(p);if(V)await L.log(p,'搭屋');}
 await p.evaluate(()=>UI.go('go',{pl:'field'}));await L.flush(p);b=await L.btns(p);if(b.some(t=>/田地/.test(t))){await L.click(p,/田地/);await L.flush(p);if(V)await L.log(p,'田地');}
 await L.shot(p,'v2_frontier');
 console.log(eng,'play_exile ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
