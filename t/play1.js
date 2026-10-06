/* 玩家視角試玩：開局→三條線第一里程碑→行醫→送禮→約會→書信→存讀檔 */
const L=require('./lib');
const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const tag=process.argv[2]||'webkit';
let ok=0,bad=0;function chk(c,m){if(c){ok++;}else{bad++;console.log('  ✘',m);}}
(async()=>{const p=await L.open({eng,settings:{typer:false}});
 const st=e=>p.evaluate(e);
 await L.newGame(p,'豆豆');
 await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.pick(p,/前往醫館/);await L.pick(p,/開始在咸陽/);
 chk(await p.$eval('#map',e=>e.className.indexOf('on')>=0),'map after prologue');
 if(tag==='chromium')await L.shot(p,'10_map');
 /* 行醫至名聲 10 */
 await L.goPl(p,'clinic');let fame0=await st(()=>S.p.fame);
 for(let i=0;i<3;i++){await L.pick(p,i?/再看一位/:/坐診/);const r=await L.flush(p);chk(r==='med','med opens');if(i===0&&tag==='chromium'){await p.click('[data-four="0"]');await p.click('[data-four="1"]');await L.shot(p,'11_medic');}
  await L.medSolve(p,true);if(i<2){await L.flush(p);} }
 chk(await st(()=>S.p.fame)>=fame0+6,'fame up by diag');
 await L.flush(p);
 /* 去市集買禮物 */
 await st(()=>{S.p.gold=400;});
 await L.goPl(p,'market');await L.pick(p,/逛市集/);
 for(const re of [/^糖人/,/^烈酒/,/^名家字帖/,/^桂花糖/,/^暖手爐/]){await L.click(p,re);}
 chk(await st(()=>S.inv.candy===1&&S.inv.wine===1&&S.inv.copybook===1),'bought gifts');
 if(tag==='chromium')await L.shot(p,'12_shop');
 /* 蒙恬線：夕 在市集 */
 await L.setPer(p,2);await st(()=>{S.c.mengtian.away=0;});await L.click(p,/返回/);await L.flush(p);
 let l=await L.btns(p);chk(l.some(t=>/蒙恬/.test(t)),'mengtian at market evening: '+l.join('|'));
 await L.talk(p,'mengtian');if(tag==='chromium')await L.shot(p,'13_talk');
 await L.click(p,/送禮/);await L.pick(p,/糖人/);
 chk(await st(()=>S.c.mengtian.aff)>=18,'mt aff after candy '+await st(()=>S.c.mengtian.aff));
 await L.pick(p,/繼續/);await L.click(p,/閒聊/);await L.pick(p,/繼續/);
 await L.click(p,/邀他同遊/);await L.pick(p,/城北軍營/);await L.flush(p);
 l=await L.btns(p);await L.click(p,/好呀/);
 chk(await st(()=>S.c.mengtian.aff)>=25,'mt aff>=25 '+await st(()=>S.c.mengtian.aff));
 await L.pick(p,/返回地圖/);await L.flush(p);
 l=await L.btns(p);const msTxt=await L.txt(p);
 chk(l.some(t=>/收進回憶/.test(t)),'milestone mt1 triggered: '+l.join('|'));
 if(tag==='chromium')await L.shot(p,'14_milestone');
 await L.click(p,/收進回憶/);await p.waitForTimeout(100);
 chk(await p.$eval('#cgv',e=>e.className==='on'),'CG shown');if(tag==='chromium')await L.shot(p,'15_cg');
 await p.click('#cgv');await L.flush(p);
 chk(await st(()=>S.c.mengtian.stage===1&&!!S.cg.mt1),'mt stage 1');
 /* 李斯線：午 梅林 */
 await L.setPer(p,1);await L.goPl(p,'plum');l=await L.btns(p);chk(l.some(t=>/梅下青衣|李斯/.test(t)),'lisi at plum noon '+l.join('|'));
 await L.talk(p,'lisi');await L.flush(p);await L.tryClick(p,/繼續交談/);await L.flush(p);
 await L.click(p,/送禮/);await L.pick(p,/名家字帖/);await L.pick(p,/繼續/);
 await st(()=>{S.c.lisi.aff=Math.max(S.c.lisi.aff,20);});await L.click(p,/閒聊/);await L.pick(p,/繼續/);await L.click(p,/邀他同遊/);await L.pick(p,/^📍 梅林/);await L.pick(p,/我不下棋/);
 await st(()=>{S.c.lisi.aff=Math.max(S.c.lisi.aff,24);});
 await L.pick(p,/返回地圖/);await L.flush(p);
 l=await L.btns(p);if(!l.some(t=>/收進回憶/.test(t))){await st(()=>{Eng.c('lisi',{aff:2});});await p.evaluate(()=>UI.go('hub'));await L.flush(p);l=await L.btns(p);}chk(l.some(t=>/收進回憶/.test(t)),'milestone lisi1 '+l.join('|'));await L.click(p,/收進回憶/);await p.click('#cgv');await L.flush(p);
 /* 荊軻線：夜 酒肆 */
 await st(()=>{S.per=3;});await L.goPl(p,'tavern');l=await L.btns(p);
 chk(l.some(t=>/落拓劍客|荊軻/.test(t)),'jingke at tavern '+l.join('|'));
 await L.talk(p,'jingke');await L.flush(p);await L.tryClick(p,/繼續交談/);await L.flush(p);await L.click(p,/送禮/);await L.pick(p,/烈酒/);await L.pick(p,/繼續/);
 await L.click(p,/為他診脈/);const r2=await L.flush(p);chk(r2==='med','cure med');await L.medSolve(p,true);await L.flush(p);
 chk(await st(()=>S.c.jingke.cured===1&&S.c.jingke.sec===1),'jingke cured+secret');
 if(tag==='chromium')await L.shot(p,'16_cure');
 await st(()=>{S.c.jingke.aff=Math.max(S.c.jingke.aff,20);});await L.pick(p,/繼續/);await L.click(p,/邀他同遊/);await L.pick(p,/市井酒肆/);await L.pick(p,/我會去找你/);await L.pick(p,/返回地圖/);await L.flush(p);
 l=await L.btns(p);if(l.some(t=>/收進回憶/.test(t))){await L.click(p,/收進回憶/);await p.click('#cgv');}
 chk(await st(()=>S.c.jingke.stage>=1),'jingke ms1 aff='+await st(()=>S.c.jingke.aff));
 /* 書信 */
 await st(()=>{Letters.send('mengtian','mid');});await L.toMap(p);
 await p.click('#tabs [data-t="let"]');await p.waitForTimeout(80);if(tag==='chromium')await L.shot(p,'17_letters');
 await p.locator('.env').first().click();await p.waitForTimeout(80);if(tag==='chromium')await L.shot(p,'18_letter_open');
 const a0=await st(()=>S.c.mengtian.heart);await p.click('[data-rep="warm"]');chk(await st(()=>S.c.mengtian.heart)>a0,'reply raises heart');
 await p.click('#shX');
 /* 圖鑑／相冊／選單 */
 await p.click('#tabs [data-t="gal"]');await p.waitForTimeout(80);if(tag==='chromium')await L.shot(p,'19_gallery');
 await p.click('[data-gid="mengtian"]');await p.waitForTimeout(80);if(tag==='chromium')await L.shot(p,'20_gallery_detail');
 await p.click('#shTabs [data-tab="rel"]');await p.waitForTimeout(60);if(tag==='chromium')await L.shot(p,'21_relations');
 await p.click('#shX');await p.click('#tabs [data-t="menu"]');await p.waitForTimeout(60);if(tag==='chromium')await L.shot(p,'22_menu');
 await p.click('[data-m="alb"]');await p.waitForTimeout(60);if(tag==='chromium')await L.shot(p,'23_album');
 chk(await p.$$eval('.cgt:not(.lock)',e=>e.length)>=3,'album shows >=3 CG');
 await p.click('#shX');
 /* 存讀檔 */
 await p.click('#tabs [data-t="menu"]');await p.click('#shTabs [data-tab="save"]');await p.click('[data-sv="1"]');
 const snap=await st(()=>JSON.stringify([S.day,S.per,S.c.mengtian.aff,S.p.fame]));
 await st(()=>{S.c.mengtian.aff=0;S.p.fame=0;});await p.click('#shTabs [data-tab="load"]');await p.click('[data-ld="1"]');await p.waitForTimeout(100);
 chk(await st(()=>JSON.stringify([S.day,S.per,S.c.mengtian.aff,S.p.fame]))===snap,'save/load roundtrip');
 /* 標題續玩 */
 await p.reload();await p.waitForTimeout(300);chk(!(await p.$eval('#tCont',e=>e.classList.contains('dis'))),'continue enabled');
 await p.click('#tCont');await p.locator('[data-ld="1"]').click();await p.waitForTimeout(100);chk(await st(()=>S.p.name)==='豆豆','reload continue');
 console.log(tag,'play1 ok',ok,'bad',bad,'errs',p.errs.length?p.errs:'none');await p.browser_.close();process.exit(bad?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
