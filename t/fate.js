/* v3：自設身世（齊國公主之女）、開局時間、男主角、母命與月解藥、呂不韋相遇時 AI 守秘 */
const L=require('./lib');const eng=process.argv[2]||'chromium';
const T='我本是齊國公主16年前跟呂不韋暗生情素下生下的女兒，當時懷上我的齊國公主被人陷害跌下山涯，卻像人救了還生下我。在有心人的利用下，齊國公主以為是呂不韋找人令她跟馬車跌下山涯。16年後，我被母親下了劇毒要我親手殺死呂不韋，但我不知呂不韋是我的親生父親。我被下劇毒，每個月也要服用解藥才行，不然會慢慢失去五感，最後變成痴傻。我被安排以女神醫之名下山去秦國。其他設定保留。';
const SC=(scene,o)=>JSON.stringify(Object.assign({scene,speaker:'',bg:'',time:0,choices:[{text:'再問一句'},{text:'沉默片刻'},{text:'告辭'}],fx:{},facts:[],recap:''},o||{}));
(async()=>{const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'m1',preset:'custom'}});
 const Q=[],sent=[],ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
 await p.route('http://mock.test/v1/**',async r=>{const u=r.request().url();if(/\/models$/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[{id:'m1'}]})});
  let b='';try{b=r.request().postData()||'';}catch(e){}sent.push(b);const nx=Q.length?Q.shift():SC('（模擬）一切如常。');return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:nx}}]})});});
 const allSent=()=>sent.map(b=>{try{return JSON.parse(b).messages.map(m=>m.content).join('\n');}catch(e){return b;}}).join('\n');
 // ---- 開局頁：方式、時間、性別 ----
 await p.click('#tNew');await p.waitForTimeout(120);
 const seg=await p.evaluate(()=>({era:[...document.querySelectorAll('[data-act="suEra"]')].map(e=>e.textContent),g:[...document.querySelectorAll('[data-act="suG"]')].map(e=>e.textContent),gon:document.querySelector('[data-act="suG"].on').dataset.v}));
 A(seg.era.length===2&&/元年/.test(seg.era.join())&&seg.g.join()==='女,男'&&seg.gon==='f','開局頁：時間＋性別（預設女） '+JSON.stringify(seg));
 for(const m of ['rand','custom']){await p.click('[data-act="suMode"][data-v="'+m+'"]');await p.waitForTimeout(80);A(await p.$$eval('[data-act="suG"]',e=>e.length)===2,'性別選項在「'+m+'」也有');}
 await p.click('[data-act="suEra"][data-v="y1"]');await p.waitForTimeout(80);const en=await p.$eval('.sheet .note',e=>e.textContent).catch(()=>'');
 const eraNote=await p.evaluate(()=>[...document.querySelectorAll('.note')].map(e=>e.textContent).join('|'));A(/扶蘇/.test(eraNote)&&/呂不韋/.test(eraNote),'開局頁說明元年扶蘇／呂不韋處理');
 await L.shot(p,'v3_setup');
 // ---- 離線解析 ----
 await p.fill('#suText',T);await p.click('[data-act="suParse"]');await p.waitForTimeout(150);
 const pv=await p.$eval('#suPrev',e=>e.textContent);
 ['16 歲','生母：齊國公主','獲救後生下你','生父：呂不韋【秘密】','你並不知道','幕後','任務：親手殺死呂不韋','每月須服解藥','嗅覺→味覺→聽覺→視覺→觸覺','痴傻','爽玩','研究解毒','女神醫','卻被人救了','（離線）'].forEach(k=>A(pv.indexOf(k)>=0,'離線解析預覽含「'+k+'」'));
 await p.evaluate(()=>{var b=document.getElementById('suPrev');if(b)b.scrollIntoView();});await L.shot(p,'v3_parse_offline');
 // ---- AI 精修解析 ----
 Q.push(JSON.stringify({g:'f',age:16,mother:'齊國公主',father:'呂不韋',fatherUnknown:true,poisoner:'mother',target:'呂不韋',monthly:true,senses:true,mad:true,framer:true,blamed:'呂不韋',alias:'女神醫',dest:'秦國',typos:['卻像人救了→卻被人救了']}));
 await p.click('[data-act="suRefine"]');await p.waitForTimeout(800);const pv2=await p.$eval('#suPrev',e=>e.textContent);
 A(/（AI 精修）/.test(pv2)&&/錯字（AI）/.test(pv2)&&/生父：呂不韋/.test(pv2)&&/任務/.test(pv2),'AI 精修解析預覽 '+pv2.slice(0,80));
 await p.evaluate(()=>{var b=document.getElementById('suPrev');if(b)b.scrollIntoView();});await L.shot(p,'v3_parse_ai');
 await p.fill('#suName','白芷');await p.click('[data-act="suGo"]');await p.waitForTimeout(300);await L.flush(p);
 const st=await p.evaluate(()=>({age:ageOf(pc()),g:pc().g,title:pc().title,med:pc().sk.med,steth:S.inv.steth,era:Eng.era(),zheng:ageOf(P('yingzheng')),lisi:P('lisi').title,fusu:P('fusu').title,lv:P('lvbuwei').title,mis:S.mis.st,anti:S.anti.due,inv:S.inv.anti,
  f1:FW.byK('truthFather'),f2:FW.byK('truthFramer'),mo:P(S.fate.mo).n,ms:P(S.fate.ms).title,par:pc().par.map(cn).join(),intro:UI.sc.lines.map(l=>l.t).join('')}));
 A(st.age===16&&st.g==='f'&&st.title==='女神醫'&&st.med>=40&&st.steth,'主角 16 歲女神醫，保留西醫 '+JSON.stringify([st.age,st.title,st.med]));
 A(st.era==='秦王政元年'&&st.zheng===13&&/呂府/.test(st.lisi)&&st.fusu==='宗室公子'&&st.lv==='相國','元年人物 '+JSON.stringify([st.era,st.zheng,st.lisi,st.fusu,st.lv]));
 A(st.f1.kn.indexOf('pc1')<0&&st.f1.kn.length===1&&st.f2.kn.indexOf('pc1')<0,'生父／真兇秘密：主角不知、呂不韋不知');
 A(st.mo==='齊國公主'&&st.ms==='信使'&&st.par==='齊國公主','生母＋信使 '+st.par);A(st.mis==='active'&&st.inv===1,'母命進行中、身上一服解藥');
 A(/月蝕/.test(st.intro)&&/女神醫/.test(st.intro)&&!/生父|親生父親/.test(st.intro),'開場敘述不洩露生父');
 // ---- 解藥月結與毒發 ----
 await p.evaluate(()=>{SET.aflauto=false;});await L.click(p,/踏出/);await L.flush(p);
 const t1=await p.evaluate(()=>{var A=S.anti;Inv.add('anti',-9);for(var i=0;i<12;i++){S.day++;Fate.day();}return {stage:A.stage,q:S.queue.map(x=>x.go)};});
 A(t1.stage>=1&&t1.q.indexOf('antiFit')>=0,'遲服 → 毒發（失去'+t1.stage+'感） '+JSON.stringify(t1));
 await p.evaluate(()=>{S.queue=[];UI.go('antiFit',{st:S.anti.stage});});await L.flush(p);const tf=await p.evaluate(()=>UI.sc.lines.map(l=>l.t).join(''));A(/月蝕」發作/.test(tf)&&/嗅覺/.test(tf),'毒發畫面 '+tf.slice(0,40));await L.shot(p,'v3_antifit');
 const ms=await p.evaluate(()=>{S.queue=[];var A=S.anti;var i0=S.inv.anti||0;A.next=S.day;Fate.day();return {q:S.queue.map(x=>x.go),inv:(S.inv.anti||0)-i0};});A(ms.q.indexOf('antiMsg')>=0&&ms.inv===1,'信使月結送藥 '+JSON.stringify(ms));
 await p.evaluate(()=>{S.queue=[];UI.go('antiMsg',{k:'give'});});await L.flush(p);await L.shot(p,'v3_antimsg');await L.click(p,/現在就服/);await L.flush(p);
 const tk=await p.evaluate(()=>({st:S.anti.stage,due:S.anti.due-S.day}));A(tk.st===0&&tk.due===10,'服藥 → 五感恢復、下次 10 日後 '+JSON.stringify(tk));
 const easy=await p.evaluate(()=>{var o=SET.diff;SET.diff='easy';var A=S.anti;A.due=S.day-30;A.stage=0;Fate.day();var s1=A.stage;SET.diff='normal';A.stage=0;Fate.day();var s2=A.stage;A.due=S.day+10;A.stage=0;SET.diff=o;S.queue=[];return [s1,s2];});
 A(easy[0]===2&&easy[1]===6,'爽玩上限 2（只病發）／一般會到痴傻 '+easy);
 const rs=await p.evaluate(()=>{var c0=S.anti.cure;Fate.research();return S.anti.cure-c0;});A(rs>0,'解毒研究推進 +'+rs);
 // ---- 母命選單 ----
 await p.evaluate(()=>UI.go('place'));await L.flush(p);const hub=await L.btns(p);A(hub.some(t=>/母命/.test(t)),'地點選單有「母命」');
 await L.click(p,/母命/);await L.flush(p);const mm=await L.btns(p);A(mm.some(t=>/拖/.test(t))&&mm.some(t=>/放棄/.test(t))&&mm.some(t=>/打探/.test(t)),'母命選項 '+mm.join('|'));
 await L.click(p,/拖/);await L.flush(p);A(await p.evaluate(()=>S.mis.st==='delay'&&S.mis.delay===1),'拖延');
 // ---- 與呂不韋相遇：AI 守秘 ----
 await p.evaluate(()=>{People.meet('lvbuwei');var q=P('lvbuwei');q.aff=30;q.here={d:S.day,per:S.per,pl:S.place};S.focus='lvbuwei';UI.go('place');});await L.flush(p);
 Q.push(SC('呂不韋：「白芷大夫，久仰。」\n呂不韋：「其實你是我的親生女兒，我早就知道。」\n你心裡明白，呂不韋就是你的生父。\n呂不韋撫著鬍鬚，打量你的藥箱。',{speaker:'lvbuwei'}));
 await p.evaluate(()=>{document.getElementById('free').value='相國大人，在下白芷，略通醫術。';UI.submitFree();});await p.waitForTimeout(500);await L.flush(p);
 const sc=await p.evaluate(()=>UI.sc.lines.map(l=>(l.sp?cn(l.sp)+'：':'')+l.t).join('\n'));
 A(/久仰/.test(sc)&&!/親生女兒/.test(sc)&&!/就是你的生父/.test(sc),'AI 洩密被防火牆刪除（呂不韋＋主角旁白） '+sc.replace(/\n/g,' / ').slice(0,160));
 const pr=allSent();A(/隱藏真相/.test(pr)&&/生父其實是呂不韋/.test(pr)&&/知情：齊國公主/.test(pr)&&/【母命】/.test(pr)&&/【月蝕之毒】/.test(pr)&&/秦王政元年/.test(pr),'AI 提示含隱藏真相（標明知情者）、母命、毒、時代');
 await L.shot(p,'v3_meet_lvbuwei');
 // ---- 伏線 → 揭穿真相 ----
 const tr=await p.evaluate(()=>{Fate.clue(1);Fate.clue(2);Fate.clue(3);return S.mis.clues;});A(tr===3,'三條伏線');
 await p.evaluate(()=>UI.go('misMenu'));await L.flush(p);await L.click(p,/揭穿真相/);await L.flush(p);
 const tt=await p.evaluate(()=>({st:S.mis.st,pk:FW.byK('truthFather').kn.indexOf('pc1')>=0,lk:FW.byK('truthFather').kn.indexOf('lvbuwei')>=0,txt:UI.sc.lines.map(l=>l.t).join('')}));A(tt.st==='truth'&&tt.pk&&tt.lk&&/恨錯了人/.test(tt.txt),'揭穿真相：雙方得知 '+JSON.stringify([tt.st,tt.pk,tt.lk]));
 await L.shot(p,'v3_truth');
 // ---- 男主角一局 ----
 await p.evaluate(()=>UI.go('title'));await p.waitForTimeout(150);await p.click('#tNew');await p.waitForTimeout(120);await p.click('[data-act="suG"][data-v="m"]');await p.waitForTimeout(80);await p.click('[data-act="suWorld"][data-v="female"]');await p.waitForTimeout(80);
 const mn=await p.$eval('#suName',e=>e.value);await p.click('[data-act="suGo"]');await p.waitForTimeout(300);await L.flush(p);
 const m1=await p.evaluate(()=>({g:pc().g,n:pc().n,por:pc().portrait,intro:UI.sc.lines.map(l=>l.t).join(''),call:Gender.call('mengtian'),mw:Rule.marryWord(pc(),{g:'f'}),txt:Gender.pcText('「妳這女大夫，姑娘家的。」小姑娘笑了')}));
 A(m1.g==='m'&&/男子/.test(m1.intro)&&/他叫/.test(m1.intro)&&m1.call==='公子'&&!m1.por,'男主角開局 '+JSON.stringify([mn,m1.call,m1.mw]));A(m1.txt==='「你這大夫，公子家的。」小姑娘笑了','男主角稱呼過濾 '+m1.txt);
 await L.click(p,/踏出/);await L.flush(p);
 const rm=await p.evaluate(()=>{var q=P('mengtian');People.meet('mengtian');q.aff=60;q.love=40;q.trust=40;q.here={d:S.day,per:S.per,pl:S.place};return Rom.why('mengtian');});A(rm===''||/今日已見/.test(rm),'男主角也可與核心人物結緣 '+rm);
 await p.evaluate(()=>UI.go('rom',{id:'mengtian'}));await L.flush(p);const rl=await p.evaluate(()=>UI.sc.lines.map(l=>l.t).join(''));A(!/妳/.test(rl),'心動文本無「妳」');await L.shot(p,'v3_male');
 const dz=await p.evaluate(()=>{Inv.add('cloth',1);document.getElementById('free').value='/指令 男扮女裝';UI.submitFree();return 1;});await p.waitForTimeout(300);await L.flush(p);
 const dg=await p.evaluate(()=>({on:Gender.on(),as:S.disg&&S.disg.as,txt:Gender.pcText('妳好姑娘')}));A(dg.on&&dg.as==='f'&&dg.txt==='妳好姑娘','男扮女裝 → 旁人眼中女子 '+JSON.stringify(dg));
 console.log(eng,'fate ok',ok.length,'fail',fail.length,'errs',p.errs);await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
