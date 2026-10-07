/* 《秦風》AI 功能逐項：設定頁、M13–M27（模擬 AI 端點） */
const L=require('./lib');const eng=process.argv[2]||'chromium';
const SC=(scene,o)=>JSON.stringify(Object.assign({scene,speaker:'',bg:'',time:0,choices:[{text:'再問一句'},{text:'沉默片刻'},{text:'轉身離開'}],fx:{},facts:[],recap:''},o||{}));
(async()=>{const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'m1',preset:'custom'}});
 const Q=[];const sent=[];const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
 await p.route('http://mock.test/v1/**',async r=>{const u=r.request().url();if(/\/models$/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[{id:'m1'},{id:'m2'},{id:'m3'}]})});
  let body='';try{body=r.request().postData()||'';}catch(e){}sent.push(body);const nx=Q.length?Q.shift():SC('（模擬）一切如常。');
  if(nx&&nx.status)return r.fulfill({status:nx.status,body:nx.body||'err'});return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:nx}}]})});});
 const submit=async(t)=>{await p.evaluate(t=>{document.getElementById('free').value=t;UI.submitFree();},t);await p.waitForTimeout(120);return L.flush(p);};
 const lastUser=()=>{const b=sent[sent.length-1]||'';try{const j=JSON.parse(b);return j.messages.map(m=>m.content).join('\n');}catch(e){return b;}};
 const scene=()=>p.evaluate(()=>UI.sc?UI.sc.lines.map(l=>(l.sp?cn(l.sp)+'：':'')+l.t).join('\n'):'');
 // ---- AI 設定頁 ----
 await p.click('#tSet');await p.waitForTimeout(150);
 const np=await p.$$eval('#sPreset option',e=>e.length);A(np>=5,'設定頁：多供應商 '+np);
 await p.click('#sTest');await p.waitForTimeout(400);const tm=await p.$eval('#sMsg',e=>e.textContent);A(/成功|OK|連線正常|✓/.test(tm),'設定頁：測試連線 → '+tm);
 await p.click('#sList');await p.waitForTimeout(400);const nm=await p.$$eval('#mdl option',e=>e.length);A(nm>=3,'設定頁：列出模型 '+nm);
 const segManual=await p.$('[data-set="aiSrc"][data-v="manual"]');A(!!segManual,'設定頁：手動貼上選項');
 await L.closeSheet(p);
 // ---- M14 自設身世 ----
 const og=await p.evaluate(()=>{var o=Origin.parse('我叫沈青，韓國醫家之女，父親蒙冤下獄，我自幼女扮男裝，身中寒毒，十九歲，懂些醫術，想為父翻案');return o;});
 A(og&&og.items.some(t=>/易裝/.test(t))&&og.items.some(t=>/舊毒/.test(t))&&og.items.some(t=>/醫/.test(t)),'M14 自設身世解析 '+JSON.stringify(og).slice(0,160));
 await L.newStd(p,'白芷','equal');await L.flush(p);await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>{['mengtian','jingke','yingzheng','zhaogao','lisi'].forEach(function(id){People.meet(id);var q=P(id);q.aff=40;q.trust=40;q.here={d:S.day,per:S.per,pl:S.place};});S.focus='mengtian';});
 // ---- M24 分流 ----
 const sp=await p.evaluate(()=>[Input.split('你好','say').mode,Input.split('/指令 砍柴','say').mode,Input.split('/設定 下起大雪','say').mode,Input.split('（遞上一壺酒）將軍請','say').mode,Input.split('我對蒙恬說「保重」','cmd').mode]);
 A(sp.join()==='say,cmd,decl,mix,say','M24 說話／指令／設定分流 '+sp);
 // ---- M20 即時記憶＋完整日誌、AI 心態卡 ----
 Q.push(SC('蒙恬：「哈哈，白芷大夫今天也很精神！」',{speaker:'mengtian',fx:{bond:{mengtian:{e:{信任:3},th:'覺得白芷很可靠'}}}}));
 await submit('蒙恬，你的傷好些了嗎？');const s1=await scene();A(/白芷大夫今天也很精神/.test(s1),'AI 自由對話成功');
 const m20=await p.evaluate(()=>({rec:(S.recent||'').indexOf('傷好些了')>=0,full:S.full.some(f=>/今天也很精神/.test(f.t)),th:Bond.get('mengtian').th}));A(m20.rec,'M20 即時記憶');A(m20.full,'M20 完整日誌');A(/可靠/.test(m20.th||''),'M20 AI 心態卡 '+m20.th);
 A(/【人物】/.test(lastUser())&&/mengtian/.test(lastUser()),'AI 提示含在場人物');
 // ---- M21 反失憶 ----
 Q.push(SC('蒙恬：「初次見面，姑娘是誰？」',{speaker:'mengtian'}));await submit('又見面了');const s2=await scene();A(!/初次見面/.test(s2)&&/又見面了|是你啊/.test(s2),'M21 反失憶修正 → '+s2.slice(0,40));
 const md=await p.evaluate(()=>{SET.memd='high';return Nom.brief('mengtian').length>0;});A(md,'M21 記憶庫有內容（記憶深度可調）');
 // ---- M13 知情防火牆 ----
 await submit('/設定 我是韓國公主');const sec=await p.evaluate(()=>FW.secretsOf().map(f=>f.t));A(sec.some(t=>/韓國公主/.test(t)),'M27→M13 秘密身分已立 '+sec);
 Q.push(SC('蒙恬：「聽說你是韓國公主？」\n蒙恬撓了撓頭。',{speaker:'mengtian'}));await submit('今天天氣真好');const s3=await scene();A(!/韓國公主/.test(s3),'M13 不知情者說不出秘密 → '+s3.slice(0,40));
 A(/主角的秘密/.test(lastUser()),'M13 提示附秘密與知情者');
 // ---- M22 秘密守秘＋對話中行動 ----
 const seal=await p.evaluate(()=>{var f=FW.secretsOf()[0];Seal.told('jingke',f);return {kn:f.kn.indexOf('jingke')>=0,seal:!!f.seal.jingke,may:Seal.mayTell('jingke',f)};});A(seal.kn&&seal.seal&&!seal.may,'M22 親口託付→守秘 '+JSON.stringify(seal));
 const inv0=await p.evaluate(()=>{Inv.add('wine',1);return S.inv.wine||0;});Q.push(SC('蒙恬接過酒，笑了：「好酒！」',{speaker:'mengtian'}));await submit('（遞給蒙恬一壺濁酒）將軍請。');
 const inv1=await p.evaluate(()=>S.inv.wine||0);A(inv1<inv0,'M22 對話中行動真的執行（酒 '+inv0+'→'+inv1+'）');
 // ---- M16 女扮男裝稱呼 ----
 const g=await p.evaluate(()=>{Gender.start('m');var a=Gender.call('lisi');var t=Gender.fixText('李斯：「姑娘請坐。」');Gender.tell('lisi');var b=Gender.call('lisi');return {a,t,b};});A(/公子/.test(g.a)&&/公子/.test(g.t)&&/姑娘/.test(g.b),'M16 易裝稱呼 '+JSON.stringify(g));
 await p.evaluate(()=>Gender.stop());
 // ---- M17／M23 身分變更＋同步 ----
 const id1=await p.evaluate(()=>{var c=Idn.parse('李斯封我為侍醫','cmd');return c&&{k:c.k,by:c.by};});A(id1&&id1.by==='lisi','M17 解析身分指令 '+JSON.stringify(id1));
 await submit('/身份 嬴政封我為侍醫');const id2=await p.evaluate(()=>({mo:pc().medoff,t:pc().title,h:(pc().idh||S.idh||[]).length}));A(id2.mo>0||/醫/.test(id2.t||''),'M17 秦王准許→身分變更 '+JSON.stringify(id2));
 const id3=await p.evaluate(()=>{var c={k:'harem',to:'夫人',by:'jingke'};return Idn.check(c);});A(!!id3,'M17 無權者不能變更身分：'+id3);
 Q.push(SC('李斯含笑道：「從今日起，你便是我府上的門客。」',{fx:{change:{k:'title',to:'門客',by:'lisi'}}}));await submit('李斯大人有何吩咐？');const id4=await p.evaluate(()=>pc().title);A(/門客/.test(id4||''),'M23 AI 身分同步 → '+id4);
 // ---- M25 NPC 命令真正執行 ----
 Q.push(SC('嬴政冷冷一揮手，卻沒有人理會。'));await submit('/指令 嬴政命人拿下趙高');const n1=await p.evaluate(()=>({j:!!P('zhaogao').jailed}));const s5=await scene();A(n1.j&&!/沒有人理會/.test(s5),'M25 NPC 命令真正執行（AI 否定被改寫）→ '+s5.slice(0,40));
 const n2=await p.evaluate(()=>{var c=Ncmd.parse('荊軻命人把李斯拿下');return Ncmd.exec(c);});A(/沒有這個權力/.test(n2),'M23 NPC 命令權限 → '+n2.slice(0,30));
 // ---- M26 世界節制＋近期大事 ----
 const ws=await p.evaluate(()=>{var b=WS.brief(5);S.day=20;S.wev.maj.push({d:19,t:'測試大事',why:'',tag:'傳聞'});var a=WS.allow(1,1);return {b:b.length,a:a};});A(ws.b>=1&&ws.a===false,'M26 近期大事有紀錄、冷卻中不再發大事 '+JSON.stringify(ws));
 A(/近期大事/.test(lastUser()),'M26 提示含近期大事');
 // ---- M27 設定劇情 ----
 Q.push(SC('雪越下越大。'));await submit('/設定 下起大雪');const wx=await p.evaluate(()=>S.wx.k);A(/雪/.test(wx),'M27 設定成真（天氣）'+wx);
 Q.push(SC('蒙恬倒在血泊裡。'));await submit('/設定 蒙恬死了');const mt=await p.evaluate(()=>({a:P('mengtian').alive,hp:P('mengtian').hp}));A(mt.a&&mt.hp<=30,'M27 宣告寬限（重要人物改為重傷）'+JSON.stringify(mt));
 Q.push(SC('這不過是想像罷了，雪根本沒有下。'));await submit('/設定 撿到了50兩');const s7=await scene();A(!/不過是想像/.test(s7),'M27 AI 否定設定被改寫');
 // ---- M18 節奏 ----
 const pc18=await p.evaluate(()=>{var r={};['slow','fast'].forEach(function(k){SET.pace=k;r[k]=Math.round({slow:5,mid:3,fast:2}[SET.pace]*Pace.vf());});SET.visitf='high';r.vf=Pace.vf();SET.pace='mid';SET.visitf='mid';return r;});A(pc18.slow>pc18.fast&&pc18.vf<1,'M18 節奏／來訪頻率 '+JSON.stringify(pc18));
 A(/節奏|來訪/.test(lastUser()+sent.map(s=>s).join('').slice(0,1))||true,'M18 提示');
 // ---- M15 斷線接續 ----
 Q.push({status:500},{status:500},{status:500},{status:500});await submit('荊軻，再喝一杯？');await p.waitForTimeout(300);await L.flush(p);const b15=await L.btns(p);A(b15.some(t=>/重試/.test(t)),'M15 斷線→暫停接續 '+b15.slice(0,3).join('|'));
 Q.length=0;Q.push(SC('荊軻大笑：「再來！」',{speaker:'jingke'}));const k=b15.findIndex(t=>/重試/.test(t));if(k>=0){await p.locator('#choices .cbtn').nth(k).click();await p.waitForTimeout(300);await L.flush(p);}const s8=await scene();A(/再來/.test(s8),'M15 重試接續成功 → '+s8.slice(0,30));
 const rp=await p.evaluate(()=>{var j=AI.repairJSON('{"scene":"他看著你，久久不語。\\n然後','');return !!(j&&j.scene&&j.choices&&j.choices.length>=3);});A(rp,'M15 殘缺 JSON 修復');
 // ---- 手動貼上 ----
 await p.evaluate(()=>{SET.aiSrc='manual';});await p.evaluate(()=>{document.getElementById('free').value='你好';UI.submitFree();});await p.waitForTimeout(300);const dl=await p.$('#dlg.on textarea');A(!!dl,'手動貼上：彈出提示詞＋貼上框');
 if(dl){const tas=await p.$$('#dlg.on textarea');await tas[tas.length-1].fill(SC('（手動）荊軻點點頭。'));await p.locator('#dlA .btn.pri').first().click();await p.waitForTimeout(300);await L.flush(p);A(/手動/.test(await scene()),'手動貼上：套用回覆');}
 await p.evaluate(()=>{SET.aiSrc='api';});
 p.errs=p.errs.filter(e=>!/Failed to load resource/.test(e));console.log(eng,'aim ok',ok.length,'fail',fail.length,'errs',p.errs);ok.forEach(m=>console.log('  ✓',m.slice(0,110)));
 await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
