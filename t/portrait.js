/* v4 女主角立繪：女裝／男裝切換 */
const L=require('./lib');const eng=process.argv[2]||'chromium';const sfx=process.argv[3]||'';
(async()=>{const p=await L.open({eng:L[eng],settings:{typer:false}});const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);console.log(c?'ok  ':'FAIL',m);};
 await p.click('#tNew');await p.waitForTimeout(100);await p.click('[data-act="suG"][data-v="f"]');await p.waitForTimeout(60);await p.click('[data-act="suGo"]');await p.waitForTimeout(300);await L.flush(p);
 const show=async()=>{await p.evaluate(()=>{S.queue=[];var me=pc();UI.present(Eng.L([[me.id,'（'+(S.disg&&S.disg.as==='m'?'一身男裝':'女兒裝束')+'）']],me.id,S.place,[{t:'繼續',go:'place'}]));});await p.waitForTimeout(700);
  return p.evaluate(()=>{var im=[].slice.call(document.querySelectorAll('img.pimg')).filter(i=>i.offsetParent);var a=document.querySelector('img[src*="face_heroine"]');return {pt:pc().portrait,src:im.map(i=>(i.getAttribute('src')||'').slice(0,40)),ld:im.map(i=>i.complete&&i.naturalWidth),av:ART.avatar?String(ART.avatar(pc())).indexOf(pc().portrait==='heroine_m'?'face_heroine_m':'face_heroine')>=0:true};});};
 const f=await show();A(f.pt==='heroine'&&f.ld.some(w=>w>0)&&f.av,'女裝立繪 '+JSON.stringify(f));await L.shot(p,'v4_portrait_f'+sfx);
 await p.evaluate(()=>{S.disg=S.disg||{};S.disg.kit=1;UI.go('wear',{g:'m'});});await L.flush(p);const m=await show();A(m.pt==='heroine_m'&&m.ld.some(w=>w>0)&&m.av,'男裝立繪 '+JSON.stringify(m));await L.shot(p,'v4_portrait_m'+sfx);
 await p.evaluate(()=>UI.go('wear',{g:'f'}));await L.flush(p);const b=await show();A(b.pt==='heroine','換回女裝 '+b.pt);
 console.log(eng,'portrait',ok.length+'/'+(ok.length+fail.length));await p.context().browser().close();process.exit(fail.length?1:0);})().catch(e=>{console.error(e);process.exit(1);});
