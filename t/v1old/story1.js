/* 主線五章＋節日＋修羅場＋結局（HE/BE/隱藏/NE）＋世界節制 */
const L=require('./lib');
const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const tag=process.argv[2]||'webkit';
let ok=0,bad=0;function chk(c,m){if(c){ok++;}else{bad++;console.log('  ✘',m);}}
(async()=>{const p=await L.open({eng,settings:{typer:false}});const st=e=>p.evaluate(e);
 await L.newGame(p,'豆豆');await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.pick(p,/前往醫館/);await L.pick(p,/開始在咸陽/);
 /* 第二章：名聲 10 → 入宮之召 */
 await st(()=>{S.p.fame=10;S.day=5;UI.go('hub');});await L.flush(p);
 chk(await st(()=>S.ch===1&&S.flags.palace_ok===1),'ch2 summon');if(tag==='chromium')await L.shot(p,'40_summon');
 await L.pick(p,/入宮覲見/);await L.flush(p);let l=await L.btns(p);chk(l.some(t=>/玄袍金冠/.test(t)),'yingzheng at palace '+l.join('|'));
 await L.talk(p,'yingzheng');chk(await st(()=>S.c.yingzheng.met===1),'yz met');
 await L.flush(p);await L.tryClick(p,/繼續交談/);await L.flush(p);await L.click(p,/為他診脈/);await L.flush(p);await L.medSolve(p,true);await L.flush(p);
 chk(await st(()=>S.c.yingzheng.cured===1),'yz cured');
 /* 第三章：香中毒 */
 await st(()=>{S.day+=6;UI.go('hub');});await L.flush(p);chk(await st(()=>S.ch===2&&S.flags.xy_open===1),'ch3 poison');
 await L.toMap(p);
 for(const pl of ['market','study']){await st(()=>{S.per=1;});await L.goPl(p,pl);await L.click(p,/調查安神香/);await L.flush(p);await L.click(p,/返回地圖/);}
 await st(()=>{S.per=3;});await L.goPl(p,'courtyard');l=await L.btns(p);
 if(l.some(t=>/繼續交談|告辭/.test(t))&&!l.some(t=>/調查/.test(t))){chk(await st(()=>S.c.xuanye.met===1),'xuanye met in courtyard');await L.click(p,/告辭/);await L.goPl(p,'courtyard');}
 await L.click(p,/調查安神香/);await L.flush(p);l=await L.btns(p);chk(l.some(t=>/指認真兇/.test(t)),'3 clues → accuse '+l.join('|'));
 await L.click(p,/指認真兇/);await L.pick(p,/相邦府/);await L.flush(p);chk(await st(()=>S.flags.poison_right===1),'right culprit');
 chk(await st(()=>S.world.maj.some(m=>/安神香案/.test(m.t)&&/起因/.test(m.why))),'world event has cause');
 /* 第四章：風雨 */
 await st(()=>{S.c.hanfei.met=1;S.c.jingke.met=1;S.c.yingzheng.trust=40;S.day+=5;});await L.click(p,/繼續/);await L.flush(p);
 chk(await st(()=>S.ch===3&&S.c.hanfei.jailed===1&&S.flags.jingke_left===1),'ch4 storm');if(tag==='chromium')await L.shot(p,'41_storm');
 await L.click(p,/為韓非向秦王求情/);await L.flush(p);chk(await st(()=>S.flags.hanfei_saved===1&&!S.c.hanfei.jailed),'hanfei saved');
 /* 節日 */
 await st(()=>{S.day=37;S.chDay=37;S.c.mengtian.aff=40;UI.go('hub');});await L.flush(p);l=await L.btns(p);
 const fest=l.some(t=>/夏祓/.test(t));chk(fest,'festival 夏祓 '+l.join('|'));if(fest){await L.click(p,/邀蒙恬/);await L.flush(p);chk(await st(()=>S.c.mengtian.aff>=48),'festival date aff');await L.click(p,/返回地圖/);}
 /* 修羅場 */
 await st(()=>{S.c.lisi.jeal=50;S.c.lisi.heart=30;S.c.fusu.met=1;S.c.fusu.heart=25;S.per=1;S.place='plum';S.flags.lastJeal=-99;UI.go('hub');});await L.flush(p);
 l=await L.btns(p);chk(l.some(t=>/先哄李斯/.test(t)),'jealousy event '+l.join('|'));if(tag==='chromium')await L.shot(p,'42_jealous');
 if(l.some(t=>/先哄李斯/.test(t))){await L.click(p,/先哄李斯/);chk(await st(()=>S.c.lisi.jeal<50),'jeal reduced');}
 /* 終章與結局 */
 await st(()=>{const c=S.c.mengtian;c.aff=80;c.heart=60;c.trust=60;c.stage=3;S.c.hanfei.stage=2;S.day=S.chDay+7;S.pendMs=[];S.flags.lastJeal=S.day;UI.go('hub');});await L.flush(p);l=await L.btns(p);chk(l.some(t=>/向蒙恬表明心意/.test(t)),'finale choices '+l.join('|'));
 await L.click(p,/向蒙恬表明心意/);await L.flush(p);chk(await st(()=>!!S.endings.he_mengtian),'HE mengtian');if(tag==='chromium')await L.shot(p,'43_ending');
 chk(await st(()=>Eng.endingFor('jingke'))==='be_jingke','BE jingke when left & not stopped');
 chk(await st(()=>{S.c.yingzheng.jeal=80;return Eng.endingFor('yingzheng');})==='be_yingzheng','BE yingzheng jealousy');
 chk(await st(()=>{CHAR_ORDER.forEach(id=>S.c[id].aff=70);return Eng.endingFor('');})==='hidden_doctor','hidden doctor');
 chk(await st(()=>{CHAR_ORDER.forEach(id=>S.c[id].aff=10);return Eng.endingFor('');})==='normal','normal ending');
 chk(await st(()=>{const x=S.c.xuanye;x.stage=3;x.trust=70;return Eng.endingFor('xuanye');})==='he_xuanye','hidden route xuanye');
 chk(await st(()=>Meta.get().endings.he_mengtian===1),'meta ending saved');
 /* 世界節制：模擬 120 日 */
 const ws=await st(()=>{S.world.maj=[];S.evseen={};let n=0;for(let d=0;d<120;d++){Eng.pass(4);}return S.world.maj.filter(m=>m.tag==='傳聞').map(m=>m.d);});
 let gapOk=true;for(let i=1;i<ws.length;i++)if(ws[i]-ws[i-1]<8)gapOk=false;chk(ws.length<=6&&gapOk,'world events throttled '+ws.join(','));
 console.log(tag,'story1 ok',ok,'bad',bad,'errs',p.errs.length?p.errs:'none');await p.browser_.close();process.exit(bad?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
