/* 亂點測試：node t/monkey.js <eng> <steps> <seed> [mode] */
const L=require('./lib');
(async()=>{const eng=process.argv[2]||'chromium',N=+process.argv[3]||300,seed=+process.argv[4]||1,mode=process.argv[5]||(seed%2?'std':'rand');
 let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 const p=await L.open({eng:L[eng]});await p.evaluate(sd=>{_seed=sd;},seed);
 if(mode==='std')await L.newStd(p,'白芷',['equal','male','female'][seed%3]);else await L.newRand(p,{world:['equal','male','female'][seed%3],birth:['exile','farm','merchant','gentry','tradoc','orphan',''][seed%7]});
 let stuck=0,last='';const bad=[];
 for(let i=0;i<N;i++){const r=await L.flush(p);
  if(r==='med'){await L.medSolve(p,R()<0.7);continue;}
  if(r==='dlg'){const n=await p.$$eval('#dlA .btn',e=>e.length);await p.locator('#dlA .btn').nth(Math.floor(R()*n)).click();await p.waitForTimeout(30);continue;}
  if(r==='sheet'){if(R()<0.5){const bs=await p.$$('#shB button[data-act]');if(bs.length){try{await bs[Math.floor(R()*bs.length)].click({timeout:500});}catch(e){}}}await p.click('#shX').catch(()=>{});await p.waitForTimeout(30);continue;}
  if(r==='map'){const pins=await p.$$eval('.pin:not(.lock)',e=>e.map(x=>x.getAttribute('data-pl')));const pl=pins[Math.floor(R()*pins.length)];await p.evaluate(pl=>UI.go('go',{pl:pl}),pl);continue;}
  if(await p.$eval('#title',e=>e.className.indexOf('on')>=0)){bad.push('title@'+i);await L.newStd(p,'再生','equal');continue;}
  if(r===false){stuck++;if(stuck>3){bad.push('stuck@'+i+':'+(await p.evaluate(()=>JSON.stringify({sc:document.querySelector('.scr.on')&&document.querySelector('.scr.on').id,t:document.getElementById('txt').textContent.slice(0,60),busy:document.getElementById('busy').className,q:UI.q&&UI.q.length}))));await p.evaluate(()=>UI.go('place'));stuck=0;}continue;}
  const bs=await L.btns(p);if(!bs.length)continue;
  let w=bs.map(t=>/結束這一生|重新開始|就此落幕|標題/.test(t)?0.02:(/歲月流轉|⏩/.test(t)?0.4:1));if(i%40===39&&R()<0.5){const tabs=['bag','fam','ppl','menu'];await p.click('#tabs [data-t="'+tabs[Math.floor(R()*4)]+'"]');continue;}
  let tot=w.reduce((a,b)=>a+b,0),x=R()*tot,k=0;for(;k<w.length;k++){x-=w[k];if(x<=0)break;}k=Math.min(k,bs.length-1);
  await p.locator('#choices .cbtn').nth(k).click().catch(()=>{});await p.waitForTimeout(15);
  if(i%25===0){const inv=await p.evaluate(()=>{if(!S)return 'nostate';var me=pc();var bad=[];['food','sta','hp','mood','temp'].forEach(function(k){if(typeof me[k]!=='number'||isNaN(me[k]))bad.push(k);});if(isNaN(S.gold)||S.gold<0)bad.push('gold:'+S.gold);for(var id in S.ppl){var q=S.ppl[id];if(isNaN(q.aff)||isNaN(q.hp))bad.push('npc '+id);}return bad.join(',');});if(inv&&inv!=='nostate')bad.push('inv@'+i+':'+inv);}
 }
 const st=await p.evaluate(()=>S?{day:S.day,gen:S.fam.gen,pc:pc().n,age:ageOf(pc()),region:S.region,gold:S.gold,ppl:Object.keys(S.ppl).length,ends:Meta.get().ends.map(function(e){return e.kind+':'+e.type+':'+e.title}),err:UI.err||0}:{title:1});
 console.log(eng,'seed',seed,mode,JSON.stringify(st),'bad',bad.length?bad.slice(0,8):'none','errs',p.errs.length?p.errs.slice(0,6):'none');
 await p.browser_.close();process.exit(p.errs.length||st.err?1:0);})();
