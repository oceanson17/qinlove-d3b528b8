/* 亂點測試：隨機選項／分頁／面板／輸入（三模式）／AI 成功失敗亂碼，檢查錯誤與數值不變式 */
const L=require('./lib');
const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const tag=process.argv[2]||'webkit';const N=+(process.argv[3]||400);const seed=+(process.argv[4]||7);
let r=seed;function rnd(n){r=(r*16807)%2147483647;return r%n;}
const TXT=['你好','我喜歡你','（替他包紮）','/設定 那人便是嬴政','/設定 蒙恬一直暗戀我','嬴政命人傳李斯來','嬴政下令拿下荊軻','嬴政命人釋放荊軻','/指令 擁抱他','謝謝','禁方的事','<b>x</b>"\'','','/設定 韓非死了','李斯命人把嬴政拿下','我們去梅林吧？'];
(async()=>{const p=await L.open({eng,settings:{typer:false}});const st=e=>p.evaluate(e);
 await L.newGame(p,'豆豆');
 await st((sd)=>{window.__k=sd;SET.ai=false;AI.manual=()=>false;AI.call=()=>{window.__k=(window.__k*31+7)%1000;const k=window.__k%5;
  if(k===0)return Promise.reject({kind:'http',status:500,msg:'x'});if(k===1)return Promise.resolve({text:'garbage',ms:1});
  return Promise.resolve({text:JSON.stringify({scene:'荊軻：「好啊。」\n風吹過。',speaker:['jingke','mengtian','lisi','nobody'][k%4],expr:'smile',bg:'tavern',choices:['甲','乙','丙'],fx:{p:{gold:999,fame:2},c:{jingke:{aff:50},bad:{aff:3}}},facts:[{text:'x',knownBy:['lisi','zz']}]}),ms:1});};},seed);
 let bad=0;
 for(let i=0;i<N;i++){const a=rnd(20);
  try{
   if(a===0){await st(()=>{SET.ai=!SET.ai;AI.ready=()=>SET.ai;});}
   else if(a===1){const t=['map','clinic','gal','let','menu'][rnd(5)];await p.click('#tabs [data-t="'+t+'"]',{timeout:800}).catch(()=>{});await p.waitForTimeout(30);if(await p.$eval('#sheet',e=>e.className.indexOf('on')>=0)){const bs=await p.$$('#shB button');if(bs.length){const b=bs[rnd(bs.length)];const tx=await b.textContent();if(!/標題|讀取/.test(tx))await b.click({timeout:800}).catch(()=>{});}await p.waitForTimeout(30);if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))await p.click('#dlA .btn',{timeout:800}).catch(()=>{});await p.click('#shX',{timeout:800}).catch(()=>{});}}
   else if(a===2){await st((m)=>{SET.inmode=m;UI.modeSync();},['say','cmd','decl'][rnd(3)]);if(await p.$eval('#game',e=>e.className.indexOf('on')>=0)){await p.fill('#free',TXT[rnd(TXT.length)]);await p.click('#send',{timeout:800}).catch(()=>{});}}
   else if(a===3){if(await p.$eval('#map',e=>e.className.indexOf('on')>=0)){const pins=await p.$$('.pin');await pins[rnd(pins.length)].click({timeout:800}).catch(()=>{});}}
   else if(a===4){await p.click('#mWait',{timeout:500}).catch(()=>{});}
   else{const f=await L.flush(p);if(f==='med'){const k=rnd(3);for(const j of [0,1,2,3])await p.click('[data-four="'+j+'"]',{timeout:500}).catch(()=>{});const d=await p.$$('[data-dx]');if(d.length)await d[rnd(d.length)].click();const x=await p.$$('[data-rx]');if(x.length)await x[rnd(x.length)].click();await p.click('#mdDone',{timeout:800}).catch(()=>{});}
    else if(f==='map'){const pins=await p.$$('.pin');const b=pins[rnd(pins.length)];await b.click({timeout:800}).catch(()=>{});await b.click({timeout:800}).catch(()=>{});}
    else{if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))await p.click('#dlA .btn',{timeout:800}).catch(()=>{});const bs=await L.btns(p);if(bs.length){let k=rnd(bs.length);if(/回到標題/.test(bs[k]))k=(k+1)%bs.length;await p.locator('#choices .cbtn').nth(k).click({timeout:800}).catch(()=>{});}}}
   if(await p.$eval('#cgv',e=>e.className==='on'))await p.click('#cgv');
   if(await p.$eval('#title',e=>e.className.indexOf('on')>=0)){await p.click('#tCont');await p.waitForTimeout(30);await p.click('[data-ld]',{timeout:800}).catch(async()=>{await p.click('#shX');await L.newGame(p,'豆豆');});}
   if(i%25===0){const inv=await st(()=>{const e=[];if(!S)return['noS'];const P=S.p;for(const k in P)if(typeof P[k]==='number'&&(isNaN(P[k])||P[k]<0))e.push('p.'+k+'='+P[k]);
     if(P.mind>100)e.push('mind>100');for(const id of CHAR_ORDER){const c=S.c[id];for(const k of ['aff','trust','heart','jeal'])if(isNaN(c[k])||c[k]>100||c[k]<-50)e.push(id+'.'+k+'='+c[k]);}
     if(!(S.ch>=0&&S.ch<=4))e.push('ch');if(JSON.stringify(S).length>400000)e.push('bloat');for(const k in S.c)if(!CHARS[k])e.push('ghost '+k);return e;});
    if(inv.length){bad++;console.log('  ✘ step',i,inv.join(','));}}
  }catch(e){bad++;console.log('  ✘ step',i,'action',a,e.message.slice(0,200));if(bad>5)break;}
 }
 const sum=await st(()=>S?{day:S.day,ch:S.ch,met:CHAR_ORDER.filter(i=>S.c[i].met).length,cg:Object.keys(S.cg).length,letters:S.letters.length,size:JSON.stringify(S).length}:null);
 console.log(tag,'monkey seed',seed,'steps',N,'bad',bad,'errs',p.errs.length?p.errs.slice(0,5):'none',JSON.stringify(sum));await p.browser_.close();process.exit(bad||p.errs.length?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
