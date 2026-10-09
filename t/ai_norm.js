/* Unit: AI.msgText / AI.extractJSON / isReasoner — no real key */
const L=require('./lib');const eng=process.argv[2]||'chromium';
(async()=>{
 const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'deepseek-chat',preset:'deepseek'}});
 const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);if(!c)console.log('FAIL',m);};
 const R=await p.evaluate(()=>{
  const out={};
  out.reasonerChat=AI.isReasoner('deepseek-chat');
  out.reasonerR=AI.isReasoner('deepseek-reasoner');
  out.reasonerThink=AI.isReasoner('foo-thinking-bar');
  // chat string content
  out.chat=AI.msgText({role:'assistant',content:'{"ok":true}'});
  // reasoner: empty content, JSON only in reasoning_content
  out.rc=AI.msgText({role:'assistant',content:'',reasoning_content:'thinking...\n{"g":"f","age":16,"mother":"齊國公主"}'});
  // content array parts
  out.arr=AI.msgText({role:'assistant',content:[{type:'text',text:'{"a":1}'}]});
  // extract fences
  out.fence=AI.extractJSON('好的，如下：\n```json\n{"g":"f","age":16}\n```\n完');
  out.plain=AI.extractJSON('{"g":"m","father":"呂不韋"}');
  out.smart=AI.extractJSON('{"g":"f",}'); // trailing comma soft-fix
  out.bad=AI.extractJSON('沒有大括號');
  out.snip=AI.snip('  hello\nworld  ',8);
  // errMsg surfaces detail
  out.errEmpty=AI.errMsg({kind:'empty',hint:'content 空白（reasoner）'});
  out.errParse=AI.errMsg({kind:'parse',raw:'```oops not json```'});
  out.errHttp=AI.errMsg({kind:'http',status:400,msg:'temperature is not supported'});
  return out;
 });
 A(R.reasonerChat===false&&R.reasonerR===true&&R.reasonerThink===true,'isReasoner 辨識');
 A(R.chat==='{"ok":true}','msgText chat string');
 A(/齊國公主/.test(R.rc),'msgText reasoner reasoning_content 回退');
 A(R.arr==='{"a":1}','msgText content array');
 A(R.fence&&R.fence.g==='f'&&R.fence.age===16,'extractJSON 剝 ```json fence');
 A(R.plain&&R.plain.father==='呂不韋','extractJSON plain');
 A(R.smart&&R.smart.g==='f','extractJSON trailing comma');
 A(R.bad===null,'extractJSON 無效回 null');
 A(R.snip==='hello wo','snip');
 A(/回應為空/.test(R.errEmpty)&&/reasoner/.test(R.errEmpty),'errMsg empty 含提示');
 A(/格式不正確/.test(R.errParse)&&/oops/.test(R.errParse),'errMsg parse 含片段');
 A(/HTTP 400/.test(R.errHttp)&&/temperature/.test(R.errHttp),'errMsg http 含 body');

 // Mock reasoner-shaped refine: content empty, JSON in reasoning_content; also fenced chat
 const Q=[];
 await p.route('http://mock.test/v1/**',async r=>{
  const u=r.request().url();
  if(/\/models$/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[{id:'deepseek-reasoner'}]})});
  let body='';try{body=r.request().postData()||'';}catch(e){}
  const req=JSON.parse(body||'{}');
  const nx=Q.length?Q.shift():null;
  if(!nx)return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:'{"ok":true}'}}]})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(nx)});
 });

 // 1) reasoner empty content + reasoning_content JSON
 await p.evaluate(()=>{SET.model='deepseek-reasoner';SET.aiTimeout=60;});
 Q.push({choices:[{message:{content:'',reasoning_content:'先想一想……最終：{"g":"f","age":16,"mother":"齊國公主","father":"呂不韋","fatherUnknown":true,"poisoner":"mother","target":"呂不韋","monthly":true,"senses":true,"mad":true,"framer":true,"alias":"女神醫","dest":"秦國","typos":["情素→情愫"]}}'}}]});
 const o1=await p.evaluate(async()=>{
  const T='我本是齊國公主16年前跟呂不韋暗生情素下生下的女兒';
  try{const o=await Origin.refine(T);return {ok:1,ai:!!o.ai,items:(o.items||[]).join('|'),mother:o.fate&&o.fate.mother};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 A(o1.ok&&o1.ai&&o1.mother==='齊國公主','reasoner reasoning_content → refine 成功 '+JSON.stringify(o1).slice(0,120));

 // 2) chat with markdown fence
 await p.evaluate(()=>{SET.model='deepseek-chat';});
 Q.push({choices:[{message:{content:'```json\n{"g":"f","age":16,"mother":"齊國公主","father":"呂不韋","fatherUnknown":true,"typos":["山涯→山崖"]}\n```'}}]});
 const o2=await p.evaluate(async()=>{
  try{const o=await Origin.refine('齊國公主16年前生下的女兒，跌下山涯');return {ok:1,ai:!!o.ai,typo:(o.items||[]).some(x=>/錯字/.test(x))};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 A(o2.ok&&o2.ai,'chat fence JSON → refine 成功 '+JSON.stringify(o2));

 // 3) bad JSON then retry succeeds
 Q.push({choices:[{message:{content:'不是 JSON 啦'}}]});
 Q.push({choices:[{message:{content:'{"g":"f","age":16,"mother":"齊國公主"}'}}]});
 const o3=await p.evaluate(async()=>{
  try{const o=await Origin.refine('齊國公主之女');return {ok:1,ai:!!o.ai};}
  catch(e){return {ok:0,err:AI.errMsg(e)};}
 });
 A(o3.ok&&o3.ai,'parse 失敗後重試成功 '+JSON.stringify(o3));

 // 4) suRefine toast shows real error on hard fail
 Q.push({choices:[{message:{content:'仍然不是'}}]});
 Q.push({choices:[{message:{content:'還是壞的'}}]});
 const toast=[];
 await p.evaluate(()=>{window.__toasts=[];var ot=toast;window.toast=function(m){window.__toasts.push(String(m));};});
 await p.evaluate(()=>{Panels.su={mode:'custom',ctext:'測試身世文字夠長了',cname:'白芷',g:'f',world:'equal',era:'y1',parsed:null};});
 // open new game sheet so suRefine path works
 await p.click('#tNew').catch(()=>{});
 await p.waitForTimeout(100);
 await p.evaluate(()=>{
  try{document.querySelector('[data-act="suMode"][data-v="custom"]').click();}catch(e){}
 });
 await p.waitForTimeout(80);
 await p.evaluate(()=>{
  var ta=document.getElementById('suText');if(ta)ta.value='測試身世文字夠長了給解析用';
  Panels.act.suRefine();
 });
 await p.waitForTimeout(600);
 const tinfo=await p.evaluate(()=>({toasts:window.__toasts||[],prev:(document.getElementById('suPrev')||{}).textContent||'',label:(document.querySelector('#suPrev b')||{}).textContent||''}));
 A(tinfo.toasts.some(t=>/解析失敗/.test(t)&&(/格式不正確|回應為空|HTTP/.test(t)))||/離線/.test(tinfo.label),'失敗 toast 含真正原因 '+JSON.stringify(tinfo).slice(0,200));

 console.log(eng,'ai_norm ok',ok.length,'fail',fail.length);
 await p.browser_.close();
 process.exit(fail.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
