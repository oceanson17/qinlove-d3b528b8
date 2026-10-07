/* ===== AI：萬用 OpenAI 相容 API＋手動貼上模式；知情防火牆、反失憶、斷線接續（沿用《秦風》M13/M15/M20-M27 思路） ===== */
var AI={};
AI.ready=function(){if(!SET.ai)return false;if(SET.aiSrc==='manual')return true;if(S&&S.aiPaused)return false;if(AI.isBlocked())return false;if(AI.cool&&Date.now()<AI.cool)return false;return !!SET.key||SET.preset==='custom'||/^https?:\/\/(localhost|127\.)/.test(SET.base);};
AI.manual=function(){return !!SET.ai&&SET.aiSrc==='manual';};
AI.sig=function(){return String(SET.key||'')+'|'+AI.endpoint()+'|'+String(SET.model||'');};
AI.isBlocked=function(){var b=SET.aiBlock;if(!b)return false;var i=b.indexOf('\u0001');return i>0&&b.slice(0,i)===AI.sig();};
AI.block=function(m){SET.aiBlock=AI.sig()+'\u0001'+String(m||'').slice(0,160);saveSettings();};
AI.unblock=function(){SET.aiBlock='';AI.cool=0;saveSettings();if(S){S.aiPaused=0;S.aiFails=0;}};
AI.endpoint=function(){var b=String(SET.base||'').replace(/\s+/g,'').replace(/\/+$/,'');if(/\/chat\/completions$/.test(b))return b;return b+'/chat/completions';};
AI.headers=function(){var h={'Content-Type':'application/json'};if(SET.key)h.Authorization='Bearer '+SET.key;String(SET.hdr||'').split(/[\n;]+/).forEach(function(p){var m=p.match(/^\s*([A-Za-z0-9\-_]+)\s*[:=]\s*(.+?)\s*$/);if(m)h[m[1]]=m[2];});return h;};
AI.timeoutFetch=function(url,opts,ms){return new Promise(function(res,rej){var done=false,ctrl=null;try{ctrl=new AbortController();opts.signal=ctrl.signal;}catch(e){}
 var t=setTimeout(function(){if(done)return;done=true;try{ctrl&&ctrl.abort();}catch(e){}rej({kind:'timeout'});},ms);
 fetch(url,opts).then(function(r){if(done)return;done=true;clearTimeout(t);res(r);},function(e){if(done)return;done=true;clearTimeout(t);rej({kind:'net',e:e});});});};
AI.quirks={};
AI.call=function(messages,o){o=o||{};var q=AI.quirks[AI.endpoint()+'|'+SET.model]||(AI.quirks[AI.endpoint()+'|'+SET.model]={});var depth=o.depth||0;
 var body={model:SET.model,messages:messages,stream:false};if(!q.notemp)body.temperature=SET.temp;if(q.mct)body.max_completion_tokens=o.maxTok||SET.maxTok;else body.max_tokens=o.maxTok||SET.maxTok;if(o.fmt!==false&&!q.nofmt)body.response_format={type:'json_object'};
 var t0=Date.now();
 return AI.timeoutFetch(AI.endpoint(),{method:'POST',headers:AI.headers(),body:JSON.stringify(body)},(o.timeout||SET.aiTimeout)*1000).then(function(r){return r.text().then(function(txt){var j=null;try{j=JSON.parse(txt);}catch(e){}
  if(!r.ok){var ms=String((j&&j.error&&(j.error.message||j.error))||txt.slice(0,160));var again=0;
   if((r.status===400||r.status===422)&&depth<3){if(!q.mct&&/max_completion_tokens/i.test(ms)){q.mct=1;again=1;}else if(!q.notemp&&/temperature/i.test(ms)){q.notemp=1;again=1;}else if(!q.nofmt){q.nofmt=1;again=1;}}
   if(again)return AI.call(messages,{maxTok:o.maxTok,timeout:o.timeout,depth:depth+1});throw {kind:'http',status:r.status,msg:ms};}
  var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(typeof c!=='string'||!c.trim())throw {kind:'empty'};return {text:c,ms:Date.now()-t0};});});};
AI.errMsg=function(e){if(!e)return '未知錯誤';if(e.kind==='timeout')return '連線逾時（'+SET.aiTimeout+' 秒）';if(e.kind==='net')return '無法連上 AI 服務（網絡或 CORS）';if(e.kind==='empty')return 'AI 回應為空';if(e.kind==='parse'||e.kind==='schema')return 'AI 回應格式不正確';
 if(e.kind==='http'){if(e.status===402)return '餘額不足（HTTP 402）';if(e.status===401||e.status===403)return 'API Key 無效（HTTP '+e.status+'）';if(e.status===404)return '找不到模型或端點（HTTP 404）';if(e.status===429)return '請求太頻繁（HTTP 429）';return 'AI 請求失敗（HTTP '+e.status+'）';}return String(e.message||e);};
AI.extractJSON=function(text){var t=String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');var a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<=a)return null;t=t.slice(a,b+1);
 try{return JSON.parse(t);}catch(e){}try{return JSON.parse(t.replace(/,\s*([}\]])/g,'$1').replace(/[\u201c\u201d]/g,'"'));}catch(e2){}try{return JSON.parse(t.replace(/[\r\n]+/g,'\\n'));}catch(e3){}return null;};
var EXPRS=['normal','smile','blush','sad','angry','shy'];
AI.cleanFx=function(fx){if(!fx||typeof fx!=='object')return null;var o={};
 if(fx.p&&typeof fx.p==='object'){o.p={};['med','cha','wit','fame','mind','gold','hp'].forEach(function(k){if(typeof fx.p[k]==='number')o.p[k]=clamp(Math.round(fx.p[k]),k==='gold'?-80:-6,k==='gold'?80:6);});}
 if(fx.c&&typeof fx.c==='object'){o.c={};for(var id in fx.c){if(!CHARS[id]||typeof fx.c[id]!=='object')continue;o.c[id]={};['aff','trust','heart','jeal'].forEach(function(k){if(typeof fx.c[id][k]==='number')o.c[id][k]=clamp(Math.round(fx.c[id][k]),-8,8);});}}
 if(fx.mem&&typeof fx.mem==='object'){o.mem={};for(id in fx.mem){if(CHARS[id]&&typeof fx.mem[id]==='string')o.mem[id]=fx.mem[id].slice(0,60);}}
 return o;};
AI.validate=function(j){if(!j||typeof j!=='object')throw {kind:'parse'};var t=j.scene||j.text;if(typeof t!=='string'||t.length<8)throw {kind:'schema'};
 var out={scene:t.trim(),speaker:CHARS[j.speaker]?j.speaker:'',expr:EXPRS.indexOf(j.expr)>=0?j.expr:'normal',bg:PLACES[j.bg]?j.bg:'',choices:[],fx:AI.cleanFx(j.fx),facts:[],recap:typeof j.recap==='string'?j.recap.slice(0,60):''};
 (j.choices||[]).forEach(function(c){var tx=typeof c==='string'?c:(c&&(c.text||c.label));if(typeof tx==='string'&&tx&&out.choices.length<4)out.choices.push({text:tx.slice(0,36),fx:AI.cleanFx(c&&c.fx)});});
 if(out.choices.length<2)throw {kind:'schema'};
 (j.facts||j.effects||[]).forEach(function(f){if(f&&typeof f.text==='string'&&out.facts.length<2){var kb=(f.knownBy||[]).filter(function(x){return CHARS[x]||x==='p';});out.facts.push({t:f.text.slice(0,80),kn:kb,sub:CHARS[f.subject]?f.subject:'p'});}});
 return out;};
/* ---- 提示 ---- */
AI.worldRules=function(short){
 var t='背景：戰國末年秦國咸陽（秦王政在位）。這是古風文字遊戲《'+GAME_TITLE+'》。玩家「'+S.p.name+'」是剛學成下山的女神醫（師承青囊谷青囊子），可攻略角色皆為成年原創動漫化角色：'+CHAR_ORDER.filter(function(id){return !CHARS[id].hidden||S.c[id].met;}).map(function(id){return CHARS[id].n+'('+id+')';}).join('、')+'。嚴禁出現秦以後的事物（紙、茶、瓷器、科舉、佛寺）。';
 t+=SET.adult?'可有含蓄的成年人曖昧，但不得露骨。':'情感描寫純愛含蓄：牽手、擁抱、眼神、心跳為主，不寫露骨內容。';
 if(short)return t+'【規則】已相識者不可當初見；角色只知道自己知道的事；〔指令〕必須執行；〔設定〕是作者宣告的事實必須成真；不可無前因拿人或大轉折。';
 t+='\n【知情防火牆】每位角色只知道【X所知】列出的事與親身經歷；不得說出或暗示自己不知道的秘密（尤其玩家的秘密）。';
 t+='\n【反失憶】已相識（標「已識」）的角色絕不可表現初次見面，必須記得【記憶】中的往事並自然提及。';
 t+='\n【輸入分流】〔對白〕是玩家說的話，只讓角色回應；〔指令・行動〕是玩家的動作，必須寫出結果；〔指令・命令〕是玩家以導演身分描述某角色下令，該角色必須真的執行；〔設定・劇情〕是玩家作者宣告的事實，必須直接成真，不可寫成念頭或用「莫非／荒唐／不可能」否定。';
 t+='\n【世界節制】不可無前因讓角色被捕、下獄、死亡或大轉折；重大事件須有罪證、動機與有權者下令；與玩家無關的大事一筆帶過。';
 return t;};
AI.system=function(){return '你是文字遊戲《'+GAME_TITLE+'》的劇本主持人。'+AI.worldRules()+'\n規則：\n1. 繁體中文，古風、細膩、有畫面感與心動感；每幕 120–240 字，以短句分行，對白用「」並以「角色名：」開頭便於分行顯示。\n2. 只輸出一個 JSON：{"scene":"敘述與對白，用\\n分行","speaker":"主要角色 id 或空字串","expr":"normal|smile|blush|sad|angry|shy","bg":"'+PLACE_ORDER.join('|')+'","choices":[{"text":"選項(24字內)","fx":{}}],"fx":{"p":{"med":0,"cha":0,"wit":0,"fame":0,"mind":0,"gold":0},"c":{"角色id":{"aff":0,"trust":0,"heart":0,"jeal":0}},"mem":{"角色id":"該角色對此事的記憶短句"}},"facts":[],"recap":"一句概述"}\n3. 數值小幅：p 每項 ±3（gold ±50），c 每項 ±6。角色 id 只能用上列 id。\n4. choices 給 3 個各異選項（溫柔、試探、俏皮或退讓），須按新局面重新生成，不可沿用舊選項。\n5. facts（可空）：真正揭露或改變秘密／關係時才填，最多 2 項：{"text":"一句事實","subject":"p或角色id","knownBy":["角色id"]}。\n6. 不替玩家做決定；不讓角色死亡；難度：'+({easy:'爽玩',normal:'一般',hard:'困難'}[SET.diff])+'。';};
AI.charLine=function(id){var c=CHARS[id],r=S.c[id];var mem=(S.mem[id]||[]).slice(-4).map(function(m){return m.t;}).join('／');
 var kn=FW.knows(id).map(function(f){return f.t;}).slice(0,4).join('；');
 return c.n+'('+id+'｜'+c.c+(r.met?'｜已識':'｜未識')+')：好感'+r.aff+' 信任'+r.trust+' 心動'+r.heart+' 醋意'+r.jeal+' 健康'+r.hp+(r.cured?'(已醫治)':'('+c.ail+')')+'｜性格：'+c.pers+'｜心態：'+Mood.card(id)+(mem?'｜記憶：'+mem:'')+(kn?'｜所知：'+kn:'');};
AI.summary=function(){var p=S.p,L=[];
 L.push('【時間地點】'+dateStr()+'，'+(PLACES[S.place]||PLACES.clinic).n+'；'+CHAPTERS[S.ch].n+'（目標：'+CHAPTERS[S.ch].goal+'）');
 L.push('【玩家】'+p.name+'：醫術'+p.med+' 魅力'+p.cha+' 才智'+p.wit+' 名聲'+p.fame+' 心境'+p.mind+' 銀兩'+p.gold);
 var ids=Eng.present();CHAR_ORDER.forEach(function(id){if(ids.indexOf(id)<0&&S.c[id].met&&S.c[id].aff>=15&&ids.length<5)ids.push(id);});
 if(ids.length)L.push('【人物】\n'+ids.map(AI.charLine).join('\n'));
 var pub=S.facts.filter(function(f){return f.pub;}).slice(-4).map(function(f){return f.t;});if(pub.length)L.push('【公開事實】'+pub.join('；'));
 var wl=WS.brief().slice(0,3);if(wl.length)L.push('【近期大事】'+wl.join('；'));
 if(S.back.length)L.push('【最近幾句】'+S.back.slice(-5).map(function(b){return (b.sp?cn(b.sp)+'：':'')+b.t;}).join('／').slice(0,300));
 return L.join('\n');};
AI.userMsg=function(a){var sum=AI.summary();var tag=a.tag||'';var x=a.extra||'';
 if(a.type==='free')return sum+'\n\n【本回合輸入'+(tag?'：'+tag:'')+'】「'+a.text+'」'+x+'\n請寫出這一幕的經過與角色反應，並給出新的選項。';
 if(a.type==='date')return sum+'\n\n【約會】玩家與'+cn(a.id)+'在'+PLACES[a.place].n+'約會。'+x+'請寫一段心動的約會場景，speaker='+a.id+'。';
 if(a.type==='talk')return sum+'\n\n【交談】玩家與'+cn(a.id)+'交談（話題：'+(a.topic||'閒聊')+'）。'+x+'請寫出符合關係階段的對話，speaker='+a.id+'。';
 return sum+'\n\n請推演下一幕。'+x;};
AI.request=function(a){var msgs=[{role:'system',content:AI.system()},{role:'user',content:AI.userMsg(a)}];if(a._retry)msgs.push({role:'user',content:'上次輸出不是合法 JSON，請只輸出符合格式的單一 JSON。'});
 return AI.call(msgs,{}).then(function(res){var j=AI.extractJSON(res.text);try{return AI.validate(j);}catch(e){if(!a._retry){var b={};for(var k in a)b[k]=a[k];b._retry=1;return AI.request(b);}throw e;}});};
AI.manualPrompt=function(a){return AI.system()+'\n\n=====世界狀態=====\n'+AI.userMsg(a)+'\n\n（請直接輸出 JSON）';};
AI.fail=function(e){if(e&&e.kind==='cancel')return;var m=AI.errMsg(e);var st=e&&e.kind==='http'?e.status:0;var perm=st===401||st===402||st===403||st===404;
 if(S){S.aiFails=(S.aiFails||0)+1;if(perm||S.aiFails>=3)S.aiPaused=1;}
 if(perm){AI.block(m);m+='。AI 已暫停，改用離線劇情；到設定修正後按「測試連線」。';}else if(st===429){AI.cool=Date.now()+60000;m+='（60 秒內改用離線）';}else if(S&&S.aiPaused)m+='。連續失敗，AI 已暫停。';else m+='（已改用離線劇情）';
 AI.lastErr=m;try{toast('⚠ '+m,3600);}catch(x){}};
AI.test=function(){return AI.call([{role:'system',content:'只輸出JSON'},{role:'user',content:'回傳 {"ok":true}'}],{maxTok:60,timeout:Math.min(45,SET.aiTimeout)}).then(function(r){AI.unblock();return {ok:true,msg:'連線成功（'+r.ms+' ms）'};},function(e){return {ok:false,msg:AI.errMsg(e)};});};
/* 執行：回傳 Promise<scene> */
AI.run=function(a){
 var rq=AI.manual()?new Promise(function(res,rej){UI.manualDialog(AI.manualPrompt(a),function(txt){try{res(AI.validate(AI.extractJSON(txt)));}catch(e){rej(e);}},function(){rej({kind:'cancel'});});}):AI.request(a);
 return rq.then(function(r){S.aiFails=0;S.pend=null;
  r=FW.check(r,a);r=Nom.check(r);
  if(r.fx)Eng.applyFx(r.fx);
  r.facts.forEach(function(f){FW.add(f.t,f.kn,f.sub);});
  var sc=Eng.textScene(r.scene,r.speaker||a.id||'',r.expr,r.bg||S.place);
  sc.ch=r.choices.map(function(c){return {t:'✦ '+c.text,go:'aiNext',a:{text:c.text,id:r.speaker||a.id||''},fx:c.fx,ai:1};});
  sc.ch.push({t:'返回地圖',go:'hub'});sc.ai=1;sc.recap=r.recap;
  if(r.speaker&&S.c[r.speaker]){S.c[r.speaker].met=1;Eng.keep(r.speaker);}
  return sc;});};
/* ===== 知情防火牆（M13 簡化） ===== */
var FW={};
FW.add=function(t,kn,sub,opt){opt=opt||{};var f={t:String(t).slice(0,90),kn:(kn||[]).slice(0,8),sub:sub||'p',d:S.day,pub:opt.pub?1:0,kw:opt.kw||''};
 for(var i=0;i<S.facts.length;i++){if(S.facts[i].t===f.t){f.kn.forEach(function(k){if(S.facts[i].kn.indexOf(k)<0)S.facts[i].kn.push(k);});return S.facts[i];}}
 S.facts.push(f);if(S.facts.length>60)S.facts.shift();return f;};
FW.knows=function(id){return S.facts.filter(function(f){return f.pub||f.kn.indexOf(id)>=0;});};
FW.learn=function(id,ft){S.facts.forEach(function(f){if(f.t===ft&&f.kn.indexOf(id)<0)f.kn.push(id);});};
/* 洩密檢查：玩家秘密的關鍵字出現在不知情角色的台詞裡 → 刪去該句 */
FW.check=function(r,a){if(SET.firewall===false)return r;var leaks=[];
 (S.secrets.p||[]).forEach(function(sec){var kw=sec.kw||(sec.k==='master'?'禁方':'');if(!kw)return;
  var lines=r.scene.split('\n');var keep=[];lines.forEach(function(l){var m=l.match(/^([^：「]{1,6})[：:]/);var who=m?Eng.idByName(m[1]):'';
   if(who&&l.indexOf(kw)>=0&&sec.kn.indexOf(who)<0){leaks.push(cn(who));}else keep.push(l);});r.scene=keep.join('\n');});
 if(leaks.length){r.scene+='\n（'+leaks.join('、')+'並不知道你的秘密，方才的話題被輕輕帶過。）';FW.stat=(FW.stat||0)+1;}
 return r;};
/* ===== 反失憶（M21 簡化） ===== */
var Nom={};
Nom.check=function(r){var hit=0;var lines=r.scene.split('\n').map(function(l){var m=l.match(/^([^：「]{1,6})[：:]/);var who=m?Eng.idByName(m[1]):(r.speaker||'');
  if(who&&S.c[who]&&S.c[who].met&&/初次見面|素未謀面|初次相見|你是何人|姑娘是誰|我們見過嗎|從未見過/.test(l)){hit=1;return l.replace(/初次見面|初次相見/g,'又見面了').replace(/素未謀面|從未見過/g,'早已相識').replace(/你是何人|姑娘是誰|我們見過嗎/g,'是你啊');}return l;});
 if(hit){r.scene=lines.join('\n');Nom.stat=(Nom.stat||0)+1;}return r;};
/* ===== 心態卡（M20 Bond 簡化） ===== */
var Mood={};
Mood.feel=function(id){var r=S.c[id];var sc=r.aff*0.5+r.heart*0.7+r.trust*0.3-r.jeal*0.2;
 if(r.heart>=80)return '深愛';if(r.heart>=55)return '傾心';if(r.heart>=30)return '心動';if(r.aff>=40)return '親近';if(r.aff>=15)return '友善';if(r.aff<=-10)return '疏遠';return '平淡';};
Mood.card=function(id){var r=S.c[id],c=CHARS[id];var f=Mood.feel(id);var goal=r.thought||({深愛:'想與她共度一生',傾心:'想把她留在身邊',心動:'在意她的一舉一動',親近:'願意與她多說幾句',友善:'對她頗有好感',疏遠:'對她有所戒備',平淡:'暫且觀望'})[f];
 return f+'；'+goal+(r.jeal>=30?'；醋意難掩':'')+(r.sec>=1?'；已向她吐露心結':'');};
Mood.note=function(id,t){if(!S.mem[id])S.mem[id]=[];var m=S.mem[id];if(m.length&&m[m.length-1].t===t)return;m.push({d:S.day,t:String(t).slice(0,60)});if(m.length>16)m.shift();};
