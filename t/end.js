/* 結局：12 固定＋AI／模板獨特結局、知情規則、結局冊跨存檔、繼承／重新開始 */
const L=require('./lib');const eng=process.argv[2]||'chromium';
const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
(async()=>{
 // ---- A：離線模板 ----
 let p=await L.open({eng:L[eng]});
 await L.newStd(p,'白芷','equal');await L.flush(p);await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>{People.meet('mengtian');var m=P('mengtian');m.aff=50;m.here={d:S.day,per:S.per,pl:S.place};People.note('mengtian','白芷替我清創縫合','crit');S.stats.pat=5;S.stats.cure=4;});
 await p.click('#tabs [data-t="menu"]');await p.waitForTimeout(150);await p.click('[data-act="endLife"]');await L.flush(p);await L.click(p,/是，就此落幕/);
 for(let i=0;i<30;i++){if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))break;await p.waitForTimeout(100);}
 const e1=await p.evaluate(()=>Meta.get().ends.slice(-1)[0]);A(e1&&e1.title&&e1.type&&e1.text.length>20&&e1.epi&&e1.mono&&e1.mono.text,'模板結局含名稱／類型／敘述／後日談／獨白 '+(e1&&e1.title+' '+e1.type));
 A(e1&&e1.source==='tpl'&&/清創縫合|記得/.test(e1.mono.text),'模板獨白引用記憶 '+(e1&&e1.mono.text));
 await L.shot(p,'v2_end_tpl');await L.dlgOk(p);await L.flush(p);const b1=await L.btns(p);A(b1.some(t=>/重新開始/.test(t))&&b1.some(t=>/結局冊/.test(t)),'結局後選項 '+b1.join('|'));
 await L.click(p,/結局冊/);await p.waitForTimeout(200);const al=await p.$eval('#shB',e=>e.textContent);A(al.indexOf(e1.title)>=0,'結局冊收錄');await L.closeSheet(p);
 await p.reload();await p.waitForTimeout(400);const n1=await p.evaluate(()=>Meta.get().ends.length);A(n1>=1,'結局冊跨存檔（重新載入後仍在）'+n1);
 await p.click('#tAlbum');await p.waitForTimeout(200);await p.click('[data-tab="fixed"]').catch(()=>{});await p.waitForTimeout(100);const fx=await p.$$eval('#shB .fend',e=>e.length);A(fx===12,'固定結局 12 格 '+fx);await L.shot(p,'v2_album');await L.closeSheet(p);
 // 重新開始
 await L.newStd(p,'青黛','male');await L.flush(p);A(await p.evaluate(()=>pc().n==='青黛'&&S.world==='male'),'重新開始新一生（男尊）');
 // ---- 繼承 ----
 await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>{var me=pc();var sp=genPerson({g:'m',age:24,kind:'npc',job:'farmer',met:1,aff:70,love:60});S.ppl[sp.id]=sp;People.marry(sp.id);me.preg={d:S.day,due:S.day,fa:sp.id};var k=People.birth(me)[0];k.born=S.day-16*DPY;k.sk.med=25;});
 await L.go(p,'pcDeath',{why:'積勞成疾'});await L.shot(p,'v2_death');await L.click(p,/這一生的結局/);for(let i=0;i<30;i++){if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))break;await p.waitForTimeout(100);}
 const e2=await p.evaluate(()=>Meta.get().ends.slice(-1)[0]);A(e2&&e2.kind==='death','主角辭世→生成結局 '+(e2&&e2.title));await L.dlgOk(p);await L.flush(p);
 await L.click(p,/由子女繼承/);await L.flush(p);await L.shot(p,'v2_heir');await L.click(p,/繼承/);await L.flush(p);
 const g2=await p.evaluate(()=>({gen:S.fam.gen,pc:pc().n,age:ageOf(pc()),alive:pc().alive}));A(g2.gen===2&&g2.alive,'由子女繼承→第二代 '+JSON.stringify(g2));
 await p.browser_.close();
 // ---- B：AI 結局（模擬端點）＋知情規則 ----
 p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'m',preset:'custom'}});let sent='';
 await p.route('http://mock.test/v1/**',async r=>{const body=r.request().postData()||'';sent=body;let c;
  if(/結局作者/.test(body))c=JSON.stringify({title:'渭水長歌',type:'HE',text:'白芷行醫半生，救人無數。荊軻至今仍然健在，在江湖中逍遙。扶蘇與她同遊渭水。她在咸陽城南的醫館裡，一針一線縫好了無數傷口，也縫好了自己的半生。',epilogue:'很多年後，城南仍有人記得那位用針線的大夫。',mono:{who:'mengtian',text:'我早知道你是韓國公主。'}});
  else c=JSON.stringify({scene:'一切如常。',choices:[{text:'a'},{text:'b'},{text:'c'}],fx:{}});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:c}}]})});});
 await L.newStd(p,'白芷','equal');await L.flush(p);await L.click(p,/踏出/);await L.flush(p);
 await p.evaluate(()=>{['mengtian','jingke'].forEach(function(id){People.meet(id);P(id).aff=40;});Decl.apply('我是韓國公主');People.die('jingke','測試');});
 await L.go(p,'endGo',{kind:'choice'});for(let i=0;i<40;i++){if(await p.$eval('#dlg',e=>e.className.indexOf('on')>=0))break;await p.waitForTimeout(100);}
 const e3=await p.evaluate(()=>Meta.get().ends.slice(-1)[0]);
 A(e3&&e3.source==='ai'&&e3.title==='渭水長歌','AI 結局生成 '+(e3&&e3.title));
 A(e3&&!/韓國公主/.test(e3.mono.text),'AI 結局：獨白不知情者不能說出秘密 → '+(e3&&e3.mono.text));
 A(e3&&!/荊軻至今仍然健在/.test(e3.text),'AI 結局：已故者不得說成仍在');
 A(e3&&!/扶蘇/.test(e3.text),'AI 結局：未相識人物不得憑空出現');
 A(/【人生】/.test(sent)&&/【知情】/.test(sent)&&/結束這一生/.test(sent),'AI 結局提示含人生／知情／條件');
 await L.shot(p,'v2_end_ai');await L.dlgOk(p);
 console.log(eng,'end ok',ok.length,'fail',fail.length,'errs',p.errs);ok.forEach(m=>console.log('  ✓',m.slice(0,100)));await p.browser_.close();process.exit(fail.length||p.errs.length?1:0);})();
