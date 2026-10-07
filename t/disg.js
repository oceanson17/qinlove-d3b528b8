/* v4 女扮男裝：開局、稱呼、AI 守秘、識破事件、保密、坦白、換裝、心動反應 */
const L=require('./lib');const eng=process.argv[2]||'chromium';
const SC=(scene,o)=>JSON.stringify(Object.assign({scene,speaker:'',bg:'',time:0,choices:[{text:'再問一句'},{text:'告辭'}],fx:{},facts:[],recap:''},o||{}));
(async()=>{const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'m1',preset:'custom'}});
 const Q=[],sent=[],ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
 await p.route('http://mock.test/v1/**',async r=>{let b='';try{b=r.request().postData()||'';}catch(e){}sent.push(b);const nx=Q.length?Q.shift():SC('（模擬）一切如常。');return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:nx}}]})});});
 const last=()=>{try{return JSON.parse(sent[sent.length-1]).messages.map(m=>m.content).join('\n');}catch(e){return '';}};
 const sc=()=>p.evaluate(()=>UI.sc.lines.map(l=>(l.sp?cn(l.sp)+'：':'')+l.t).join('\n'));
 await p.click('#tNew');await p.waitForTimeout(100);A(await p.$('[data-act="suDisg"]')!==null,'開局頁有「女扮男裝開局」');
 await p.click('[data-act="suG"][data-v="m"]');await p.waitForTimeout(60);A(await p.$('[data-act="suDisg"]')===null,'男主角不顯示女扮男裝');await p.click('[data-act="suG"][data-v="f"]');await p.waitForTimeout(60);
 await p.click('[data-act="suDisg"]');await p.waitForTimeout(60);await p.click('[data-act="suGo"]');await p.waitForTimeout(300);await L.flush(p);
 const s0=await p.evaluate(()=>({on:Gender.on(),as:S.disg.as,intro:UI.sc.lines.map(l=>l.t).join(''),call:Gender.call('mengtian'),pt:Gender.pcText('白芷姑娘，妳好')}));
 A(s0.on&&s0.as==='m'&&/男裝/.test(s0.intro)&&s0.call==='公子'&&s0.pt==='白芷公子，你好','開局女扮男裝、NPC 稱公子 '+JSON.stringify([s0.call,s0.pt]));
 await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>{['mengtian','lisi','fusu','zhaogao'].forEach(function(id){People.meet(id);var q=P(id);q.aff=40;q.trust=40;q.love=10;q.here={d:S.day,per:S.per,pl:S.place};});S.focus='mengtian';UI.go('place');});await L.flush(p);
 // AI：稱呼規則＋洩密攔截
 Q.push(SC('蒙恬：「白芷公子，今日可好？」\n蒙恬：「我早看出你是女兒身了！」',{speaker:'mengtian'}));
 await p.evaluate(()=>{document.getElementById('free').value='將軍，早。';UI.submitFree();});await p.waitForTimeout(500);await L.flush(p);
 const t1=await sc();const pr=last();A(/女扮男裝/.test(pr)&&/公子／他/.test(pr)&&/不得憑空識破/.test(pr),'AI 提示含易裝規則');A(/白芷公子/.test(t1)&&!/女兒身/.test(t1),'AI 不知情者說破被攔下 '+t1.replace(/\n/g,' / ').slice(0,90));
 await p.evaluate(()=>UI.showLine&&UI.showLine(0));await L.shot(p,'v4_disg_call');
 // 沐浴被識破
 await p.evaluate(()=>{Gender.RISK.bath=5;S.queue=[];UI.go('bath');});await L.flush(p);const t2=await sc();const b2=await L.btns(p);
 A(/梳洗/.test(t2)&&/你是女子/.test(t2)&&b2.some(t=>/保密/.test(t))&&b2.some(t=>/坦白/.test(t)),'沐浴識破事件 '+t2.slice(0,50));await L.shot(p,'v4_expose_bath');
 const who=await p.evaluate(()=>UI.sc.focus);await L.click(p,/保密/);await L.flush(p);const t3=await sc();
 const k1=await p.evaluate(w=>{var f=FW.byId(S.disg.fid);return {kn:Gender.knows(w),sealed:!!(f.seal&&f.seal[w]),pub:f.pub,on:Gender.on(),call:Gender.call(w),other:Gender.call(w==='lisi'?'fusu':'lisi')};},who);
 A(k1.kn&&k1.sealed&&!k1.pub&&k1.on&&k1.call==='姑娘'&&k1.other==='公子','識破者知情並守秘、其他人照樣叫公子 '+JSON.stringify(k1));
 if(['mengtian','lisi','fusu'].indexOf(who)>=0)A(t3.split('\n').length>=2,'心動角色情感反應 '+t3.replace(/\n/g,' / ').slice(0,90));await L.shot(p,'v4_react');
 const sp=await p.evaluate(()=>{var f=FW.byId(S.disg.fid);var n0=f.kn.length;for(var i=0;i<200;i++)FW.tick();return [n0,f.kn.length];});A(sp[0]===sp[1],'知情者不亂傳（200 日） '+sp);
 // 主動坦白
 const tid=await p.evaluate(w=>['fusu','lisi','mengtian'].filter(x=>x!==w)[0],who);await p.evaluate(id=>UI.go('talk',{id:id}),tid);await L.flush(p);
 let tb=await L.btns(p);if(!tb.some(t=>/坦白真實性別/.test(t))){await p.evaluate(id=>{UI.sc={lines:[{sp:'',t:''}],ch:NODES.talkCh(id),focus:id,bg:S.place};UI.play&&0;},tid);}
 await p.evaluate(id=>UI.go('dxTell',{id:id}),tid);await L.flush(p);A(await p.evaluate(id=>Gender.knows(id),tid),'主動坦白 → '+tid+' 知情');
 // AI 提示列出知情者
 Q.push(SC('（模擬）'));await p.evaluate(()=>{document.getElementById('free').value='嗯。';UI.submitFree();});await p.waitForTimeout(400);await L.flush(p);A(new RegExp(await p.evaluate(id=>cn(id),who)).test(last().split('【性別稱呼')[1]||''),'AI 提示列出知情者');
 // 親近／受傷掛鉤
 const hk=await p.evaluate(()=>{Gender.RISK.close=5;S.queue=[];var a=Gender.risk('zhaogao','close');return a&&S.queue.some(q=>q.go==='disgExpose'&&q.a.k==='close');});A(hk,'親近時識破機率');
 await p.evaluate(()=>{S.queue=[];});
 // 換回女裝（趙高在場，未知情 → 得知）、再換男裝
 await p.evaluate(()=>{S.place=S.home.pl;S.region=S.home.r;var z=P('zhaogao');z.here={d:S.day,per:S.per,pl:S.place};UI.go('place');});await L.flush(p);
 const hb=await L.btns(p);A(hb.some(t=>/換回女裝/.test(t))&&hb.some(t=>/沐浴/.test(t)),'家中有換裝／沐浴 '+hb.join('|').slice(0,120));
 await L.click(p,/換回女裝/);await L.flush(p);const w1=await p.evaluate(()=>({on:Gender.on(),zk:FW.byId(S.disg.fid).kn.indexOf('zhaogao')>=0,pub:FW.byId(S.disg.fid).pub,txt:UI.sc.lines.map(l=>l.t).join('')}));
 A(!w1.on&&w1.zk&&!w1.pub&&/換回女/.test(w1.txt),'換回女裝：在場者得知、未公開 '+JSON.stringify([w1.on,w1.zk,w1.pub]));
 await L.click(p,/繼續/);await L.flush(p);await L.click(p,/換上男裝/);await L.flush(p);A(await p.evaluate(()=>Gender.on()&&S.disg.as==='m'),'再換男裝（沿用同一秘密）');
 const cmd=await p.evaluate(()=>{document.getElementById('free').value='/指令 換回女裝';UI.submitFree();return 1;});await p.waitForTimeout(300);await L.flush(p);A(await p.evaluate(()=>!Gender.on()),'指令換回女裝');
 const pub=await p.evaluate(()=>{Gender.start('m');Gender.expose('');return {pub:FW.byId(S.disg.fid).pub,on:Gender.on(),call:Gender.call('xiawuju')};});A(pub.pub&&!pub.on&&pub.call==='姑娘','公開後眾人知道 '+JSON.stringify(pub));
 console.log(eng,'disg ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
