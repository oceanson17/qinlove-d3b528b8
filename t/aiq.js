/* v4.2 AI 提示品質：聲線／動機／情緒／風格／反重複／空泛選項重試（mock） */
const L=require('./lib');const eng=process.argv[2]||'chromium';
const SC=(scene,ch,o)=>JSON.stringify(Object.assign({scene,speaker:'mengtian',bg:'',time:0,choices:ch.map(t=>({text:t})),fx:{},facts:[],recap:'蒙恬來訪'},o||{}));
(async()=>{const p=await L.open({eng:L[eng],settings:{typer:false,ai:true,key:'k',base:'http://mock.test/v1',model:'m1',preset:'custom'}});
 const ok=[],fail=[];const A=(c,m)=>{(c?ok:fail).push(m);console.log(c?'ok  ':'FAIL',m);};const Q=[],sent=[];
 await p.route('http://mock.test/v1/**',async r=>{sent.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:Q.shift()||SC('（模擬）營中鼓聲遠遠傳來，夜色漸深。',['問他鼓聲何意','替他換藥','告辭'])}}]})});});
 const txt=b=>b.messages.map(m=>m.content).join('\n');
 await L.newStd(p);await L.flush(p);
 await p.evaluate(()=>{People.meet('mengtian');var q=P('mengtian');q.here={d:S.day,per:S.per,pl:S.place};});
 const S1='蒙恬推門而入，甲冑上還帶著雨氣。他解下佩劍擱在案邊，揉了揉肩。蒙恬：「末將路過，順道討碗熱湯。」';
 Q.push(SC(S1,['盛湯給他，問起舊傷','問軍中近況','請他坐下歇息']));
 await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await p.waitForTimeout(900);await L.flush(p);
 const t1=txt(sent[0]);
 A(/語氣：爽直簡練/.test(t1)&&/口頭禪：/.test(t1)&&/動機：/.test(t1)&&/此刻情緒：/.test(t1),'人物行含語氣／口頭禪／動機／情緒');
 A(/【文筆與劇情要求】/.test(t1)&&/不替主角做決定/.test(t1)&&/【示範/.test(t1),'系統提示含文筆要求與示範');
 A(/【時間地點】/.test(t1)&&/好感/.test(t1),'場景與關係數值');A(sent[0].max_tokens>=2600,'max_tokens '+sent[0].max_tokens);
 // 重複 → 重試
 Q.push(SC(S1,['盛湯給他，問起舊傷','問軍中近況','請他坐下歇息']));Q.push(SC('雨停了。蒙恬望著簷下積水，忽然低聲道：蒙恬：「放心，有我。」',['追問他話中所指','遞上傷藥','送他出門']));
 const n0=sent.length;await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await p.waitForTimeout(1500);await L.flush(p);
 const t2=txt(sent[sent.length-1]);A(sent.length-n0===2&&/勿重複/.test(t2)&&/換角度重寫/.test(t2),'重複輸出自動重寫一次 '+(sent.length-n0));
 const sc=await p.evaluate(()=>UI.sc.lines.map(l=>l.t).join(''));A(/雨停了/.test(sc),'採用重寫版本');
 // 空泛選項 → 重試
 Q.push(SC('蒙恬沉默良久，指節輕叩劍鞘，終究沒有開口。',['繼續','觀察']));Q.push(SC('蒙恬忽然起身：蒙恬：「明日校場，你來不來？」',['答應同去','推說醫館忙','問校場有何事']));
 const n1=sent.length;await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await p.waitForTimeout(1500);await L.flush(p);A(sent.length-n1===2,'空泛選項自動重試');
 // 壞格式 → 重試
 Q.push('這不是JSON');Q.push(SC('他笑了笑，把空碗遞回。',['再盛一碗','問起蒙毅','送客']));const n2=sent.length;await p.evaluate(()=>UI.go('talk',{id:'mengtian'}));await p.waitForTimeout(1500);await L.flush(p);
 A(sent.length-n2>=2&&await p.evaluate(()=>/空碗/.test(UI.sc.lines.map(l=>l.t).join(''))),'壞格式重試');
 console.log(eng,'aiq',ok.length+'/'+(ok.length+fail.length));await p.context().browser().close();process.exit(fail.length?1:0);})().catch(e=>{console.error(e);process.exit(1);});
