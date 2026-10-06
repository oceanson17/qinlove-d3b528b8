/* AI（模擬）模式：場景替換、選項、防火牆、反失憶、輸入分流、命令執行、宣告、斷線接續、手動模式 */
const L=require('./lib');
const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const tag=process.argv[2]||'webkit';
let ok=0,bad=0;function chk(c,m){if(c){ok++;}else{bad++;console.log('  ✘',m);}}
(async()=>{const p=await L.open({eng,settings:{typer:false}});const st=e=>p.evaluate(e);
 await L.newGame(p,'豆豆');await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.pick(p,/前往醫館/);await L.pick(p,/開始在咸陽/);
 await st(()=>{window.__msgs=[];window.__next=null;SET.ai=true;AI.ready=()=>!window.__off;AI.manual=()=>false;
  AI.call=(m)=>{window.__msgs.push(m);if(window.__fail){const f=window.__fail;window.__fail=null;return Promise.reject(f);}
   const j=window.__next||{scene:'蒙恬：「又是你！」他笑著揉了揉肩。\n你替他看了看舊傷。',speaker:'mengtian',expr:'smile',bg:'market',choices:[{text:'問他最近練槍的事'},{text:'叮囑他少淋雨'},{text:'逗他一下'}],fx:{c:{mengtian:{aff:3,heart:2}},mem:{mengtian:'在市集被豆豆叮囑'}}};window.__next=null;return Promise.resolve({text:JSON.stringify(j),ms:1});};});
 await st(()=>{S.per=2;S.c.mengtian.away=0;});await L.goPl(p,'market');await L.talk(p,'mengtian');
 const aff0=await st(()=>S.c.mengtian.aff);
 await L.click(p,/閒聊/);await L.flush(p);
 let t=await st(()=>UI.sc.lines.map(l=>l.t).join('|'));chk(/又是你/.test(t),'AI scene shown: '+t);
 let l=await L.btns(p);chk(l.filter(x=>/^✦/.test(x)).length===3,'3 AI choices '+l.join('|'));
 chk(await st(()=>S.c.mengtian.aff)>aff0,'AI fx applied');
 chk(await st(()=>S.mem.mengtian.some(m=>/叮囑/.test(m.t))),'AI mem stored');
 const m0=await st(()=>window.__msgs[0][0].content+'\n'+window.__msgs[0][1].content);
 chk(/知情防火牆/.test(m0)&&/反失憶/.test(m0)&&/輸入分流/.test(m0)&&/世界節制/.test(m0),'system rules present');
 chk(/蒙恬\(mengtian｜少年將軍｜已識\)/.test(m0)&&/記憶：/.test(m0),'char line with 已識 + memory: '+m0.slice(m0.indexOf('【人物】'),m0.indexOf('【人物】')+300));
 if(tag==='chromium')await L.shot(p,'30_ai_scene');
 /* 選 AI 選項 → 再次 AI */
 await st(()=>{window.__next={scene:'蒙恬：「初次見面，姑娘是誰？」\n他撓撓頭。',speaker:'mengtian',expr:'normal',choices:['a','b','c']};});
 await L.click(p,/問他最近練槍/);await L.flush(p);
 t=await st(()=>UI.sc.lines.map(l=>l.t).join('|'));chk(!/初次見面/.test(t)&&/又見面了/.test(t),'anti-amnesia rewrite: '+t);
 /* 防火牆 */
 await st(()=>{window.__next={scene:'蒙恬：「聽說你師父留給你一卷禁方？」\n蒙恬：「今天天氣真好。」',speaker:'mengtian',choices:['a','b']};});
 await p.fill('#free','你好呀');await p.click('#send');await L.flush(p);
 t=await st(()=>UI.sc.lines.map(l=>l.t).join('|'));chk(!/禁方/.test(t)&&/天氣/.test(t),'firewall strip: '+t);
 let um=await st(()=>window.__msgs[window.__msgs.length-1][1].content);chk(/【本回合輸入：對白】「你好呀」/.test(um),'say tag');
 /* 主動說出秘密 → 對方得知 */
 await p.fill('#free','其實師父留給我一卷禁方');await p.click('#send');await L.flush(p);
 chk(await st(()=>S.secrets.p[0].kn.indexOf('mengtian')>=0),'secret learned by mengtian');
 /* 宣告模式 */
 await st(()=>{SET.inmode='decl';UI.modeSync();});
 await p.fill('#free','那人便是嬴政');await p.click('#send');await L.flush(p);
 chk(await st(()=>S.c.yingzheng.met===1&&Eng.present().indexOf('yingzheng')>=0),'decl: yingzheng met & present');
 um=await st(()=>window.__msgs[window.__msgs.length-1][1].content);chk(/設定・劇情/.test(um)&&/不得否定/.test(um),'decl tag to AI');
 await p.fill('#free','李斯一直暗戀我');await p.click('#send');await L.flush(p);chk(await st(()=>S.c.lisi.heart)>=10,'decl heart');
 await p.fill('#free','韓非死了');await p.click('#send');await L.flush(p);chk(await st(()=>S.c.hanfei.hp===30),'decl death adjusted to injury');
 /* 命令模式 */
 await st(()=>{SET.inmode='cmd';UI.modeSync();});
 await p.fill('#free','蒙恬命人把李斯拿下');await p.click('#send');await L.flush(p);chk(await st(()=>!S.c.lisi.jailed),'no authority → refuse');
 await p.fill('#free','嬴政下令拿下李斯');await p.click('#send');await L.flush(p);chk(await st(()=>S.c.lisi.jailed===1),'yz arrest executes');
 chk(await st(()=>S.world.maj.some(m=>m.tag==='你所為'&&/李斯/.test(m.t))),'world log records cause');
 await p.fill('#free','嬴政命人釋放李斯');await p.click('#send');await L.flush(p);chk(await st(()=>!S.c.lisi.jailed),'release');
 await p.fill('#free','嬴政命人傳扶蘇來');await p.click('#send');await L.flush(p);chk(await st(()=>Eng.present().indexOf('fusu')>=0),'summon');
 await p.fill('#free','替他包紮');await p.click('#send');await L.flush(p);um=await st(()=>window.__msgs[window.__msgs.length-1][1].content);chk(/指令・行動/.test(um),'act tag');
 /* 斷線 → 離線接續 → 重試 */
 await st(()=>{SET.inmode='say';UI.modeSync();window.__fail={kind:'http',status:500,msg:'x'};});
 await p.fill('#free','我們去走走吧');await p.click('#send');await L.flush(p);
 l=await L.btns(p);chk(l.some(x=>/AI 恢復後重試/.test(x)),'retry offered '+l.join('|'));chk(await st(()=>!!S.pend&&S.pend.text==='我們去走走吧'),'pend kept');
 if(tag==='chromium')await L.shot(p,'31_ai_fail');
 await L.click(p,/AI 恢復後重試/);await L.flush(p);chk(await st(()=>S.pend===null),'pend cleared after retry');
 /* 存讀檔後提示接續 */
 await st(()=>{window.__fail={kind:'timeout'};});await p.fill('#free','再說一次');await p.click('#send');await L.flush(p);
 console.log('pend',await st(()=>JSON.stringify(S.pend)));await st(()=>{saveSlot(2,true);});await st(()=>{UI.loadGame(2);});console.log('after',await st(()=>JSON.stringify([UI.cur,UI.sc&&UI.sc.lines[0].t,S.pend,document.querySelectorAll('#choices .cbtn').length])));await L.flush(p);l=await L.btns(p);for(let k=0;k<4&&l.some(x=>/收進回憶/.test(x));k++){await L.click(p,/收進回憶/);await p.click('#cgv');await L.flush(p);l=await L.btns(p);}chk(l.some(x=>/AI 重試接續/.test(x)),'resume after load '+l.join('|'));
 await L.click(p,/放下這件事/);
 /* 402 → 封鎖 */
 await st(()=>{AI.fail({kind:'http',status:402,msg:'Insufficient Balance'});});chk(await st(()=>AI.isBlocked()),'402 blocks');await st(()=>AI.unblock());
 /* 壞 JSON → 重試一次 */
 await st(()=>{let n=0;const orig=AI.call;AI.call=(m)=>{n++;window.__n=n;if(n===1)return Promise.resolve({text:'oops not json',ms:1});AI.call=orig;return orig(m);};});
 await L.toMap(p);await st(()=>{S.per=2;});await L.goPl(p,'market');await L.talk(p,'mengtian');await L.click(p,/閒聊/);await L.flush(p);
 chk(await st(()=>window.__n)>=2&&/又是你/.test(await st(()=>UI.sc.lines.map(l=>l.t).join('|'))),'bad json retried');
 /* 手動貼上模式 */
 await st(()=>{AI.manual=()=>true;});await L.click(p,/繼續/);await L.flush(p);await L.click(p,/閒聊/);await p.waitForTimeout(150);
 chk(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0),'manual dialog');if(tag==='chromium')await L.shot(p,'32_manual');
 await p.fill('#mpA',JSON.stringify({scene:'蒙恬：「手動模式的回應！」',speaker:'mengtian',choices:['x','y']}));await p.locator('#dlA .btn.pri').click();await L.flush(p);
 chk(/手動模式/.test(await st(()=>UI.sc.lines.map(l=>l.t).join('|'))),'manual applied');
 /* 離線模式 */
 await st(()=>{SET.ai=false;AI.ready=()=>false;AI.manual=()=>false;});await L.click(p,/繼續|返回地圖/);await L.flush(p);
 l=await L.btns(p);if(l.some(x=>/閒聊/.test(x))){await L.click(p,/閒聊/);await L.flush(p);chk(!/手動/.test(await L.txt(p)),'offline chat ok');}
 console.log(tag,'ai1 ok',ok,'bad',bad,'errs',p.errs.length?p.errs:'none');await p.browser_.close();process.exit(bad?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
