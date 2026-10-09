/* Unit: AI.msgText / AI.extractJSON / fastModel / Origin.refine — no real key */
const L=require('./lib');const eng=process.argv[2]||'chromium';
(async()=>{
 const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'deepseek-chat',preset:'deepseek'}});
 const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
 const R=await p.evaluate(()=>{
  const out={};
  out.reasonerChat=AI.isReasoner('deepseek-chat');
  out.reasonerR=AI.isReasoner('deepseek-reasoner');
  out.fast=AI.fastModel('deepseek-reasoner');
  out.fastChat=AI.fastModel('deepseek-chat');
  out.chat=AI.msgText({role:'assistant',content:'{"ok":true}'});
  out.rc=AI.msgText({role:'assistant',content:'',reasoning_content:'thinking...\n{"g":"f","age":16,"mother":"齊國公主"}'});
  out.arr=AI.msgText({role:'assistant',content:[{type:'text',text:'{"a":1}'}]});
  out.fence=AI.extractJSON('好的，如下：\n```json\n{"g":"f","age":16}\n```\n完');
  out.plain=AI.extractJSON('{"g":"m","father":"呂不韋"}');
  out.smart=AI.extractJSON('{"g":"f",}');
  out.bad=AI.extractJSON('沒有大括號');
  // critical: English scaffolding then JSON
  out.engLead=AI.extractJSON('We need answer only JSON object. Need parse Chinese. Need produce fields. Need understand\n{"g":"f","age":16,"mother":"齊國公主","father":"呂不韋"}');
  out.engOnly=AI.extractJSON('We need answer only JSON object. Need parse Chinese. Need produce fields. Need understand');
  out.metaOnly=AI.looksLikeMeta('We need answer only JSON object. Need parse Chinese.');
  out.metaWithJson=AI.looksLikeMeta('We need answer only JSON object.\n{"g":"f","age":16}');
  out.snip=AI.snip('  hello\nworld  ',8);
  out.errEmpty=AI.errMsg({kind:'empty',hint:'content 空白（reasoner）'});
  out.errParse=AI.errMsg({kind:'parse',raw:'```oops not json```'});
  out.errHttp=AI.errMsg({kind:'http',status:400,msg:'temperature is not supported'});
  return out;
 });
 A(R.reasonerChat===false&&R.reasonerR===true,'isReasoner 辨識');
 A(R.fast==='deepseek-chat'&&R.fastChat==='deepseek-chat','fastModel reasoner→chat');
 A(R.chat==='{"ok":true}','msgText chat string');
 A(/齊國公主/.test(R.rc),'msgText reasoner reasoning_content 回退');
 A(R.arr==='{"a":1}','msgText content array');
 A(R.fence&&R.fence.g==='f'&&R.fence.age===16,'extractJSON 剝 ```json fence');
 A(R.plain&&R.plain.father==='呂不韋','extractJSON plain');
 A(R.smart&&R.smart.g==='f','extractJSON trailing comma');
 A(R.bad===null,'extractJSON 無效回 null');
 A(R.engLead&&R.engLead.g==='f'&&R.engLead.mother==='齊國公主','extractJSON 跳過 We need… 前綴取出 JSON');
 A(R.engOnly===null,'extractJSON 純英文規劃 → null');
 A(R.metaOnly===true&&R.metaWithJson===false,'looksLikeMeta 辨識');
 A(R.snip==='hello wo','snip');
 A(/回應為空/.test(R.errEmpty)&&/reasoner/.test(R.errEmpty),'errMsg empty 含提示');
 A(/格式不正確/.test(R.errParse)&&/oops/.test(R.errParse),'errMsg parse 含片段');
 A(/HTTP 400/.test(R.errHttp)&&/temperature/.test(R.errHttp),'errMsg http 含 body');

 const Q=[];const sent=[];
 await p.route('http://mock.test/v1/**',async r=>{
  const u=r.request().url();
  if(/\/models$/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[{id:'deepseek-chat'},{id:'deepseek-reasoner'}]})});
  let body='';try{body=r.request().postData()||'';}catch(e){}
  sent.push(body);
  const nx=Q.length?Q.shift():null;
  if(!nx)return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:'{"ok":true}'}}]})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(nx)});
 });

 // When SET.model=reasoner, refine must call deepseek-chat
 await p.evaluate(()=>{SET.model='deepseek-reasoner';SET.aiTimeout=60;SET.preset='deepseek';});
 Q.push({choices:[{message:{content:'We need answer only JSON object. Need parse Chinese.\n{"g":"f","age":16,"mother":"齊國公主","father":"呂不韋","fatherUnknown":true,"poisoner":"mother","target":"呂不韋","monthly":true,"senses":true,"mad":true,"framer":true,"alias":"女神醫","dest":"秦國","typos":["情素→情愫"]}'}}]});
 const o1=await p.evaluate(async()=>{
  const T='我本是齊國公主16年前跟呂不韋暗生情素下生下的女兒';
  try{const o=await Origin.refine(T);return {ok:1,ai:!!o.ai,mother:o.fate&&o.fate.mother,pm:o.parseModel};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 const lastReq=(()=>{try{return JSON.parse(sent[sent.length-1]);}catch(e){return {};}})();
 A(o1.ok&&o1.ai&&o1.mother==='齊國公主','英文前綴+JSON → refine 成功 '+JSON.stringify(o1).slice(0,140));
 A(lastReq.model==='deepseek-chat'&&o1.pm==='deepseek-chat','精修強制 deepseek-chat（設定為 reasoner 時） model='+lastReq.model);

 // Pure English meta → retry with schema → success
 sent.length=0;Q.length=0;
 Q.push({choices:[{message:{content:'We need answer only JSON object. Need parse Chinese. Need produce fields. Need understand'}}]});
 Q.push({choices:[{message:{content:'{"g":"f","age":16,"mother":"齊國公主","father":"呂不韋","fatherUnknown":true}'}}]});
 const o2=await p.evaluate(async()=>{
  try{const o=await Origin.refine('齊國公主之女');return {ok:1,ai:!!o.ai,n:1};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 A(o2.ok&&o2.ai&&sent.length>=2,'純英文規劃 → 嚴格重試成功 calls='+sent.length);

 // chat fence still works
 await p.evaluate(()=>{SET.model='deepseek-chat';});
 Q.push({choices:[{message:{content:'```json\n{"g":"f","age":16,"mother":"齊國公主","typos":["山涯→山崖"]}\n```'}}]});
 const o3=await p.evaluate(async()=>{
  try{const o=await Origin.refine('齊國公主16年前生下的女兒，跌下山涯');return {ok:1,ai:!!o.ai};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 A(o3.ok&&o3.ai,'chat fence JSON → refine 成功');

 // hard fail toast
 Q.push({choices:[{message:{content:'We need still no braces'}}]});
 Q.push({choices:[{message:{content:'Still Need to produce without JSON'}}]});
 await p.evaluate(()=>{window.__toasts=[];window.toast=function(m){window.__toasts.push(String(m));};});
 await p.click('#tNew').catch(()=>{});
 await p.waitForTimeout(100);
 await p.evaluate(()=>{try{document.querySelector('[data-act="suMode"][data-v="custom"]').click();}catch(e){}});
 await p.waitForTimeout(80);
 await p.evaluate(()=>{var ta=document.getElementById('suText');if(ta)ta.value='測試身世文字夠長了給解析用';Panels.act.suRefine();});
 await p.waitForTimeout(700);
 const tinfo=await p.evaluate(()=>({toasts:window.__toasts||[],label:(document.querySelector('#suPrev b')||{}).textContent||'',note:[...document.querySelectorAll('.note')].map(e=>e.textContent).join('|')}));
 A(tinfo.toasts.some(t=>/解析失敗/.test(t))||/離線/.test(tinfo.label),'失敗仍可離線 '+JSON.stringify(tinfo).slice(0,180));

 // note when reasoner selected on setup page
 await p.evaluate(()=>{SET.model='deepseek-reasoner';SET.ai=true;SET.key='k';});
 await p.evaluate(()=>{try{Sh.redraw();}catch(e){}});
 await p.waitForTimeout(80);
 const note=await p.evaluate(()=>[...document.querySelectorAll('.note')].map(e=>e.textContent).join('|'));
 A(/精修解析會暫時改用 deepseek-chat/.test(note)||/deepseek-chat/.test(note),'開局頁提示精修改用 chat '+note.slice(0,120));

 console.log(eng,'ai_norm ok',ok.length,'fail',fail.length);
 await p.browser_.close();
 process.exit(fail.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
