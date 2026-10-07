/* ===== AI：萬用 OpenAI 相容 API＋手動貼上；提示（硬規則）、驗證、事件線程（M15 斷線接續） ===== */
var AI={};
AI.ready=function(){if(!SET.ai)return false;if(SET.aiSrc==='manual')return true;if(S&&S.aiPaused)return false;if(AI.isBlocked())return false;if(AI.cool&&Date.now()<AI.cool)return false;return !!SET.key||SET.preset==='custom'||/^https?:\/\/(localhost|127\.)/.test(SET.base);};
AI.manual=function(){return !!SET.ai&&SET.aiSrc==='manual';};
AI.sig=function(){return String(SET.key||'')+'|'+AI.endpoint()+'|'+String(SET.model||'');};
AI.isBlocked=function(){var b=SET.aiBlock;if(!b)return false;var i=b.indexOf('\u0001');return i>0&&b.slice(0,i)===AI.sig();};
AI.block=function(m){SET.aiBlock=AI.sig()+'\u0001'+String(m||'').slice(0,160);saveSettings();};
AI.unblock=function(){SET.aiBlock='';AI.cool=0;saveSettings();if(S){S.aiPaused=0;S.aiFails=0;}};
AI.base=function(){return String(SET.base||'').replace(/\s+/g,'').replace(/\/+$/,'').replace(/\/chat\/completions$/,'');};
AI.endpoint=function(){return AI.base()+'/chat/completions';};
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
AI.listModels=function(){return AI.timeoutFetch(AI.base()+'/models',{method:'GET',headers:AI.headers()},20000).then(function(r){return r.json().then(function(j){var a=(j&&(j.data||j.models))||[];return a.map(function(x){return typeof x==='string'?x:(x.id||x.name||'');}).filter(Boolean).slice(0,80);});});};
AI.errMsg=function(e){if(!e)return '未知錯誤';if(e.kind==='timeout')return '連線逾時（'+SET.aiTimeout+' 秒）';if(e.kind==='net')return '無法連上 AI 服務（網絡或 CORS）';if(e.kind==='empty')return 'AI 回應為空';if(e.kind==='parse'||e.kind==='schema')return 'AI 回應格式不正確';
 if(e.kind==='http'){if(e.status===402)return '餘額不足（HTTP 402）';if(e.status===401||e.status===403)return 'API Key 無效（HTTP '+e.status+'）';if(e.status===404)return '找不到模型或端點（HTTP 404）';if(e.status===429)return '請求太頻繁（HTTP 429）';return 'AI 請求失敗（HTTP '+e.status+'）';}return String(e.message||e);};
AI.extractJSON=function(text){var t=String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');var a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<=a)return null;t=t.slice(a,b+1);
 try{return JSON.parse(t);}catch(e){}try{return JSON.parse(t.replace(/,\s*([}\]])/g,'$1').replace(/[\u201c\u201d]/g,'"'));}catch(e2){}try{return JSON.parse(t.replace(/[\r\n]+/g,'\\n'));}catch(e3){}return null;};
/* M15：修復殘缺 JSON（只在含 "scene" 時）；缺選項補 3 個 */
AI.repairJSON=function(raw){raw=String(raw||'');if(raw.indexOf('"scene"')<0)return null;var j=AI.extractJSON(raw);if(j&&j.scene)return j;
 var m=raw.match(/"scene"\s*:\s*"((?:[^"\\]|\\.)*)/);if(!m)return null;var sc=m[1];try{sc=JSON.parse('"'+sc.replace(/\\$/,'')+'"');}catch(e){sc=sc.replace(/\\n/g,'\n').replace(/\\"/g,'"');}
 var sp=(raw.match(/"speaker"\s*:\s*"([^"]*)"/)||[])[1]||'';var ch=[];var re=/"text"\s*:\s*"([^"]{1,40})"/g,mm;while((mm=re.exec(raw))&&ch.length<4)ch.push({text:mm[1]});
 if(ch.length<2)ch=[{text:'靜觀其變'},{text:'追問下去'},{text:'暫且告退'}];return {scene:sc,speaker:sp,choices:ch,recap:'',_repaired:1};};
AI.digest=function(raw){return String(raw||'').replace(/[{}\[\]"]/g,' ').replace(/\\n/g,'\n').replace(/\s{2,}/g,' ').replace(/(scene|speaker|choices|text|fx|facts|recap)\s*:/g,'').trim().slice(0,400);};
/* ---- 驗證 ---- */
var ME_K={food:10,sta:15,hp:10,mood:10,gold:120,fame:5,med:3,farm:3,craft:3,trade:3,mart:3,lit:3};
AI.cleanFx=function(fx){if(!fx||typeof fx!=='object')return null;var o={};var me=fx.me||fx.p;
 if(me&&typeof me==='object'){o.me={};for(var k in ME_K)if(typeof me[k]==='number')o.me[k]=clamp(Math.round(me[k]),-ME_K[k],ME_K[k]);}
 if(fx.inv&&typeof fx.inv==='object'){o.inv={};for(k in fx.inv)if(ITEMS[k]&&!ITEMS[k].hide&&typeof fx.inv[k]==='number')o.inv[k]=clamp(Math.round(fx.inv[k]),-3,3);}
 var pp=fx.ppl||fx.c;if(pp&&typeof pp==='object'){o.ppl={};for(var id in pp){if(!P(id)||id===S.pc||typeof pp[id]!=='object')continue;o.ppl[id]={};['aff','trust','love'].forEach(function(k2){var v=pp[id][k2];if(k2==='love'&&v==null)v=pp[id].heart;if(typeof v==='number')o.ppl[id][k2]=clamp(Math.round(v),-8,8);});}}
 if(fx.bond&&typeof fx.bond==='object'){o.bond={};for(id in fx.bond)if(P(id)&&id!==S.pc)o.bond[id]=fx.bond[id];}
 if(fx.mem&&typeof fx.mem==='object'){o.mem={};for(id in fx.mem){if(P(id)&&typeof fx.mem[id]==='string')o.mem[id]=fx.mem[id].slice(0,70);}}
 if(fx.ill&&typeof fx.ill==='object'){o.ill={};for(id in fx.ill){var tid=id==='me'?S.pc:id;if(P(tid)&&ILLS[fx.ill[id]])o.ill[tid]=fx.ill[id];}}
 if(fx.cure&&typeof fx.cure==='object'){o.cure={};for(id in fx.cure){tid=id==='me'?S.pc:id;if(P(tid)&&ILLS[fx.cure[id]])o.cure[tid]=fx.cure[id];}}
 if(Array.isArray(fx.newp)){o.newp=fx.newp.filter(function(n){return n&&typeof n.n==='string'&&n.n.length>=2&&n.n.length<=4;}).slice(0,2);}
 if(fx.change&&typeof fx.change==='object'&&Idn.K[fx.change.k])o.change={k:fx.change.k,to:String(fx.change.to||'').slice(0,10),by:P(fx.change.by)?fx.change.by:''};
 if(typeof fx.move==='string'&&PLACES[fx.move]&&PLACES[fx.move].r===S.region)o.move=fx.move;
 return o;};
AI.validate=function(j){if(!j||typeof j!=='object')throw {kind:'parse'};var t=j.scene||j.text;if(typeof t!=='string'||t.length<8)throw {kind:'schema'};
 var out={scene:t.trim().slice(0,1600),speaker:P(j.speaker)&&j.speaker!==S.pc?j.speaker:'',bg:PLACES[j.bg]?j.bg:'',time:clamp(j.time|0,0,3),choices:[],fx:AI.cleanFx(j.fx),facts:[],recap:typeof j.recap==='string'?j.recap.slice(0,70):''};
 (j.choices||[]).forEach(function(c){var tx=typeof c==='string'?c:(c&&(c.text||c.label));if(typeof tx==='string'&&tx&&out.choices.length<4)out.choices.push({text:tx.slice(0,36)});});
 if(out.choices.length<2){if(j._repaired)out.choices=[{text:'靜觀其變'},{text:'追問下去'},{text:'暫且告退'}];else throw {kind:'schema'};}
 (j.facts||[]).forEach(function(f){if(f&&typeof f.text==='string'&&out.facts.length<2){var kb=(f.knownBy||[]).map(function(x){return x==='me'||x==='p'?S.pc:x;}).filter(function(x){return P(x);});out.facts.push({t:f.text.slice(0,90),kn:kb,sub:P(f.subject)?f.subject:S.pc,secret:!!f.secret});}});
 return out;};
/* ---- 提示 ---- */
AI.worldRules=function(short){var me=pc();var W=WORLDS[S.world];
 var t='【世界】戰國末至秦漢之際（今為'+Eng.era()+'，'+Eng.ybStr(Eng.yb())+'）。世界設定：'+W.n+'——'+W.d+'這是寫實的人生模擬遊戲《'+GAME_TITLE+'》：沒有固定劇本，貧窮、疾病、天氣與人心都會改變命運；人物會老、會死，家族會傳承。';
 t+='主角'+me.n+'（'+(me.g==='f'?'女':'男')+'，'+ageOf(me)+'歲）'+(S.fam.tech.alco?'身懷隱世師門所傳的西方醫術（解剖、外科縫合、消毒、退燒、接骨、藥理、聽診），在秦代驚世駭俗：傳統醫者嫉妒、方士指為妖術、朝廷既好奇又猜忌。':'是此世間的普通人。');
 t+='歷史人物皆為原創動漫化角色。嚴禁出現秦以後的事物（紙、茶、瓷器、科舉、佛寺、火藥、現代用語）；西醫用古雅詞彙（刀圭、酒精、縫合、聽診筒）。';
 t+=SET.adult?'成年人情感可含蓄曖昧，不寫露骨內容。':'情感描寫含蓄，不寫露骨內容。';
 if(short)return t+'【硬規則】知情防火牆、反失憶、指令必須執行、設定必定成真、世界節制。';
 t+='\n【知情防火牆・M13】每個人物只知道【X所知】所列與親身經歷；不得說出或暗示自己不知道的秘密（尤其主角的秘密）。傳聞只能以「聽說」語氣提及。';
 t+='\n【守秘・M22】主角親口託付的秘密，知情者預設守口如瓶；除非被審問逼供、懷恨告發、主角允許傳話或在公開場合被聽見。';
 t+='\n【反失憶・M21】標「已識」者絕不可表現初見、不可說「不認識你／不記得」；必須記得【持久記憶】與【剛說過的對話】並自然提及。';
 t+='\n【輸入分流・M24】〔對白〕只是主角說的話，只讓人物回應，不得把引號內的話當成命令執行；〔指令・行動〕是主角的動作，必須寫出結果；〔指令・命令〕是主角以導演身分描述某人物下令或行動，該人物必須真的執行，不可引號複述、不可寫「卻沒有」；〔指令・身份〕依身分規則處理；〔設定・劇情〕是作者宣告的事實，必須直接成真，不可寫成念頭，不可用「莫非／荒唐／不可能／錯覺」否定。';
 t+='\n【世界節制・M26】不可無前因讓人物被捕、下獄、死亡或發生大轉折；重大事件須有罪證、動機與有權者下令；與主角無關的大事一筆帶過。';
 t+='\n'+Pace.aiRule();
 if(Gender.on()){var kn=[];for(var id in S.ppl)if(Gender.knows(id)&&id!==S.pc&&S.ppl[id].met)kn.push(cn(id));t+='\n【性別稱呼・M16】主角'+(me.g==='f'?'女扮男裝':'男扮女裝')+'，旁人眼中是'+(S.disg.as==='m'?'男子':'女子')+'，須以「'+(S.disg.as==='m'?'公子／他':'姑娘／她')+'」稱呼；只有知情者（'+(kn.join('、')||'無人')+'）知道真相。';}
 t+='\n【身分變更・M17】主角的身分（官職、醫官、爵位、入宮、拜師、從軍）只能由有權者親口批准而改變，寫在 fx.change；主角單方面「想當」不算。官秩：'+OFFICE.slice(1).join('＞')+'；醫官：'+MEDOFF.slice(1).join('＞')+'。';
 return t;};
AI.system=function(){return '你是寫實古代人生模擬文字遊戲《'+GAME_TITLE+'》的說書人兼遊戲主持人。'+AI.worldRules()+'\n【輸出規則】\n1. 繁體中文，古風、細膩、有畫面感；每幕 120–260 字，短句分行；對白以「人物名：「……」」開頭單獨成行。\n2. 只輸出一個 JSON：{"scene":"敘述與對白，用\\n分行","speaker":"主要人物 id 或空字串","bg":"地點 key 或空","time":0到3（耗費時段）,"choices":[{"text":"選項(24字內)"}],"fx":{"me":{"food":0,"sta":0,"hp":0,"mood":0,"gold":0,"fame":0,"med":0,"farm":0,"craft":0,"trade":0,"mart":0,"lit":0},"inv":{"物品key":0},"ppl":{"人物id":{"aff":0,"trust":0,"love":0}},"bond":{"人物id":{"e":{"愛慕":0,"信任":0,"戒備":0,"怨恨":0},"th":"此刻想法","cond":"未了條件","mem":"記憶"}},"mem":{"人物id":"此人對此事的記憶"},"ill":{"me或人物id":"疾病key"},"cure":{},"newp":[{"n":"新人物姓名","g":"m|f","age":30,"job":"職業key","title":"稱呼"}],"change":{"k":"appoint|medoff|enlist|ennoble|harem|master|leave|title","to":"新身分","by":"批准者id"},"move":""},"facts":[{"text":"一句事實","subject":"me或人物id","knownBy":["人物id"],"secret":false}],"recap":"一句概述"}\n3. 數值小幅且合理：me 每項 ±5（gold ±80）、ppl 每項 ±6；物品 key 只能用：'+Object.keys(ITEMS).filter(function(k){return !ITEMS[k].hide;}).join(',')+'；疾病 key：'+Object.keys(ILLS).join(',')+'；職業 key：'+Object.keys(JOBS).join(',')+'。人物 id 只能用【人物】列出的 id。\n4. choices 給 3 個按新局面重新生成、彼此不同的選項，不可照抄上一幕。\n5. 不替主角做決定；難度：'+({easy:'爽玩',normal:'一般',hard:'困難'}[SET.diff])+'。';};
AI.pline=function(id){var p=P(id);var b=SET.bondd!==false?Bond.card(id):'';var mem=Nom.brief(id);var a=ageOf(p);
 return p.n+'('+id+'｜'+(p.g==='f'?'女':'男')+a+'歲｜'+(p.title||JOBS[p.job]||'')+'｜'+People.relTo(id)+(p.met?'｜已識':'｜未識')+')：好感'+p.aff+' 信任'+p.trust+' 情意'+(p.love||0)+' 健康'+Math.round(p.hp)+(p.ill.length?'('+Ill.str(p)+')':'')+'｜性格：'+p.pers.join('、')+'｜喜好：'+p.like.join('、')+(b?'｜心態卡：'+b:'')+(mem?'｜持久記憶：'+mem:'');};
AI.summary=function(){var me=pc(),L=[];
 L.push('【時間地點】'+Eng.dateStr()+'，'+Weather.str()+'；'+(REGIONS[S.region]||{n:''}).n+'·'+(PLACES[S.place]||{n:''}).n+(S.road?'（流放第'+S.road.day+'/'+S.road.total+'日，往'+S.road.dn+'）':''));
 L.push('【主角】'+me.n+'（'+(me.g==='f'?'女':'男')+(Gender.on()?'，易裝為'+(S.disg.as==='m'?'男':'女')+'子':'')+'，'+ageOf(me)+'歲，'+(me.title||JOBS[me.job]||'')+(me.office?'，'+OFFICE[me.office]:'')+(me.medoff?'，'+MEDOFF[me.medoff]:'')+(me.rank?'，爵'+RANKS[me.rank]:'')+'）：飽食'+Math.round(me.food)+' 體力'+Math.round(me.sta)+' 健康'+Math.round(me.hp)+' 體溫'+me.temp.toFixed(1)+' 心情'+Math.round(me.mood)+' 銀'+S.gold+'；醫'+me.sk.med+' 農'+me.sk.farm+' 工'+me.sk.craft+' 商'+me.sk.trade+' 武'+me.sk.mart+' 文'+me.sk.lit+'；疾病：'+Ill.str(me)+(me.preg?'；有孕':'')+'；行囊：'+Inv.str().slice(0,160));
 L.push('【家族】'+Fam.name()+'，第'+S.fam.gen+'代，名聲'+S.fam.fame+(S.fam.grudge&&!S.fam.grudge.done?'，背負冤案：'+S.fam.grudge.crime:'')+'；住所：'+Eng.HOUSE_N[S.fam.house||0]+(S.fam.clinic.open?'；醫館已開':''));
 var fam=Eng.house().filter(function(p){return p.id!==S.pc;});if(fam.length)L.push('【家人】'+fam.map(function(p){return p.n+'('+p.id+'｜'+(p.rel||People.relTo(p.id))+'｜'+ageOf(p)+'歲｜健康'+Math.round(p.hp)+(p.ill.length?Ill.str(p):'')+'｜心聲：'+People.thought(p)+')';}).join('；'));
 var ids=People.present().slice(0,6);if(S.focus&&ids.indexOf(S.focus)<0&&P(S.focus)&&P(S.focus).alive)ids.unshift(S.focus);
 if(ids.length){L.push('【人物】\n'+ids.map(AI.pline).join('\n'));if(SET.firewall!==false)L.push('【所知】\n'+FW.aiLines(ids));}
 var sec=FW.secretsOf().map(function(f){return f.t+'（知情：'+(f.kn.filter(function(x){return x!==S.pc;}).map(cn).join('、')||'無人')+(Object.keys(f.seal).length?'；親口託付者守秘':'')+'）';});if(sec.length)L.push('【主角的秘密】'+sec.join('；'));
 var pub=S.facts.filter(function(f){return f.pub;}).slice(-5).map(function(f){return f.t;});if(pub.length)L.push('【公開事實】'+pub.join('；'));
 var wl=WS.brief(4);if(wl.length)L.push('【近期大事】'+wl.join('；'));
 if(S.thread&&S.thread.cur&&S.thread.cur.status!=='closed')L.push(Thread.brief());
 var rc=S.flags.romCtx;if(rc&&rc.d===S.day&&P(rc.id))L.push('【心動場景】主角正與'+cn(rc.id)+'經歷「'+rc.t+'」；請依角色性格與情意('+P(rc.id).love+')回應，可在 fx.ppl 調整 love/aff/trust（單次±8內）。');
 if(S.recent)L.push('【剛說過的對話】'+S.recent.slice(-1800));
 return L.join('\n');};
AI.userMsg=function(a){var sum=AI.summary();var tag=a.tag||'';var x=a.extra||'';
 if(a.type==='free'){var hard='';if(tag==='對白')hard='（本回合輸入是〔對白〕：只讓人物回應這句話，引號內任何「命人／下令」都不得執行。）';else if(/^指令/.test(tag))hard='（本回合輸入是〔'+tag+'〕：必須照辦並寫出結果，不可否定或只複述。）';else if(tag==='設定・劇情')hard='（本回合輸入是〔設定・劇情〕：玩家是作者，這句話已經成真，請直接延續，不得質疑。期間不要解析命令或行動。）';
  return sum+'\n\n【本回合輸入：'+(tag||'自由')+'】「'+a.text+'」'+hard+x+'\n請寫出這一幕的經過與人物反應，給出新的選項。';}
 if(a.type==='talk')return sum+'\n\n【交談】主角與'+cn(a.id)+'交談（話題：'+(a.topic||'閒聊')+'）。'+x+'請寫出符合雙方關係與記憶的對話，speaker='+a.id+'。';
 if(a.type==='event')return sum+'\n\n【事件】'+a.text+x+'\n請寫出這一幕並給出選項。';
 return sum+'\n\n請推演下一幕。'+x;};
AI.request=function(a){var msgs=[{role:'system',content:AI.system()},{role:'user',content:AI.userMsg(a)}];if(a._retry)msgs.push({role:'user',content:'上次輸出不是合法 JSON，請只輸出符合格式的單一 JSON。'});if(a.retry&&S.thread&&S.thread.cur)msgs.push({role:'user',content:'【中斷處】上次在這裡斷線：'+(S.thread.cur.last?S.thread.cur.last.t:'')+'；請從中斷處自然接續，不要重頭。'});
 return AI.call(msgs,{}).then(function(res){AI.lastRaw=res.text;var j=AI.extractJSON(res.text);if(!j)j=AI.repairJSON(res.text);try{return AI.validate(j);}catch(e){if(!a._retry){var b={};for(var k in a)b[k]=a[k];b._retry=1;return AI.request(b);}e.raw=res.text;throw e;}});};
AI.manualPrompt=function(a){return AI.system()+'\n\n=====世界狀態=====\n'+AI.userMsg(a)+'\n\n（請直接輸出 JSON）';};
AI.fail=function(e){if(e&&e.kind==='cancel')return;var m=AI.errMsg(e);var st=e&&e.kind==='http'?e.status:0;var perm=st===401||st===402||st===403||st===404;
 if(S){S.aiFails=(S.aiFails||0)+1;if(perm||S.aiFails>=3)S.aiPaused=1;}
 if(perm){AI.block(m);m+='。AI 已暫停，改用離線劇情；到設定修正後按「測試連線」。';}else if(st===429){AI.cool=Date.now()+60000;m+='（60 秒內改用離線）';}else if(S&&S.aiPaused)m+='。連續失敗，AI 已暫停。';else m+='（已改用離線劇情）';
 AI.lastErr=m;try{toast('⚠ '+m,3600);}catch(x){}};
AI.test=function(){return AI.call([{role:'system',content:'只輸出JSON'},{role:'user',content:'回傳 {"ok":true}'}],{maxTok:60,timeout:Math.min(45,SET.aiTimeout)}).then(function(r){AI.unblock();return {ok:true,msg:'連線成功（'+r.ms+' ms）'};},function(e){return {ok:false,msg:AI.errMsg(e)};});};
/* 套用 AI 效果 */
AI.applyFx=function(fx,sp){if(!fx)return;var me=pc();
 if(fx.me){for(var k in fx.me){var v=fx.me[k];if(!v)continue;if(k==='gold')Inv.gold(v);else if(k==='fame'){S.fam.fame=clamp(S.fam.fame+v,0,999);UI.popP('fame',v);}else if(me.sk[k]!==undefined){me.sk[k]=clamp(me.sk[k]+v,0,100);UI.popP(k,v);}else{me[k]=clamp(me[k]+v,0,100);UI.popP(k,v);}}}
 if(fx.inv)for(k in fx.inv)Inv.add(k,fx.inv[k]);
 if(fx.ppl)for(var id in fx.ppl)People.rel(id,fx.ppl[id]);
 if(fx.bond&&SET.bondd!==false)for(id in fx.bond)Bond.apply(id,fx.bond[id]);
 if(fx.mem)for(id in fx.mem)People.note(id,fx.mem[id]);
 if(fx.ill)for(id in fx.ill)Ill.add(P(id),fx.ill[id],1);
 if(fx.cure)for(id in fx.cure)Ill.cure(P(id),fx.cure[id],2);
 if(fx.newp)fx.newp.forEach(function(n){var q=genPerson({g:n.g==='f'?'f':'m',age:clamp(n.age|0||30,1,90),job:JOBS[n.job]?n.job:'none',loc:{r:S.region,pl:S.place},met:1});q.sur=n.n.slice(0,1);q.gn=n.n.slice(1);q.n=n.n;q.title=String(n.title||JOBS[q.job]||'').slice(0,8);if(Array.isArray(n.pers))q.pers=n.pers.filter(function(t){return TRAITS[t];}).slice(0,2).concat(q.pers).slice(0,2);});
 if(fx.change){var err=Idn.apply(fx.change);if(err)toast('身分未變：'+err,3000);}
 if(fx.move)S.place=fx.move;};
/* 執行：回傳 Promise<scene>（M15 線程包裝） */
AI.run=function(a){Thread.begin(a);
 var rq=AI.manual()?new Promise(function(res,rej){UI.manualDialog(AI.manualPrompt(a),function(txt){AI.lastRaw=txt;var j=AI.extractJSON(txt)||AI.repairJSON(txt);try{res(AI.validate(j));}catch(e){e.raw=txt;rej(e);}},function(){rej({kind:'cancel'});});}):AI.request(a);
 return rq.then(function(r){S.aiFails=0;return AI.post(r,a);},function(e){var rep=e&&e.raw?AI.repairJSON(e.raw):null;if(rep){try{var r2=AI.validate(rep);toast('🧩 AI 回覆殘缺，已修復');return AI.post(r2,a);}catch(x){}}Thread.bad(e);throw e;});};
AI.post=function(r,a){r=Nom.check(r);r=FW.check(r);r.scene=Gender.fixText(r.scene);var off=null;
 if(a.tag==='指令・命令'&&a.cmd&&typeof Ncmd!=='undefined')off=Ncmd.verify(r,a.cmd);
 else if(a.tag==='指令・行動'&&a.act&&typeof Act!=='undefined')off=Act.verify(r,a.act);
 else if(a.tag==='設定・劇情'&&a.decl&&typeof Decl!=='undefined')off=Decl.verify(r,a.decl);
 if(off){toast('🎬 AI 未照辦，已改用系統結果',3000);Thread.fixLast(off);return off;}
 if(r.fx)AI.applyFx(r.fx,r.speaker);
 r.facts.forEach(function(f){FW.add(f.t,f.kn,f.sub,{secret:f.secret,src:'ai'});});
 if(r.time)Eng.pass(r.time);
 var sp=r.speaker||a.id||'';var sc=Eng.textScene(r.scene,sp,r.bg||'');
 var prev=(S.thread&&S.thread.cur&&S.thread.cur.prevCh)||[];var dup=r.choices.filter(function(c){return prev.indexOf(c.text)>=0;}).length;
 if(dup>=2){r.choices=[{text:'換個方式應對'},{text:'追問其中隱情'},{text:'暫且按下不表'}];}
 sc.ch=r.choices.map(function(c){return {t:'✦ '+c.text,go:'aiNext',a:{text:c.text,id:sp},ai:1};});sc.ch.push({t:'↩ 返回',go:'place',sys:1});sc.ai=1;sc.recap=r.recap;
 if(sp&&P(sp)){People.meet(sp);Eng.keep(sp);S.focus=sp;}
 Thread.ok(r,a);return sc;};
/* ===== 事件線程（M15） ===== */
var Thread={
 get:function(){if(!S.thread)S.thread={seq:0,cur:null,done:[]};return S.thread;},
 begin:function(a){var T=Thread.get();var here=People.present().slice(0,4);var c=T.cur;
  if(c&&c.status!=='closed'&&(c.place!==S.place||S.day-c.d1>2)&&!a.retry){Thread.close();c=null;}
  if(!c||c.status==='closed'){T.seq++;c=T.cur={id:'t'+T.seq,title:String(a.text||a.topic||'事件').slice(0,16),npcs:here,place:S.place,d0:S.day,d1:S.day,turns:[],last:null,status:'active',inflight:0,pend:null,err:'',mem:{},raw:'',prevCh:[]};}
  c.inflight=1;c.pend={type:a.type,text:a.text||'',tag:a.tag||'',id:a.id||'',topic:a.topic||''};c.d1=S.day;here.forEach(function(id){if(c.npcs.indexOf(id)<0)c.npcs.push(id);});try{saveSlot('auto',true);}catch(e){}},
 ok:function(r,a){var c=Thread.get().cur;if(!c)return;c.inflight=0;c.status='active';c.err='';c.raw='';c.pend=null;c.turns.push({in:String(a.text||a.topic||'').slice(0,80),out:r.scene.slice(0,600),d:S.day});if(c.turns.length>30)c.turns.shift();
  c.prevCh=r.choices.map(function(x){return x.text;});c.last={t:r.scene.slice(-300),sp:r.speaker,ch:c.prevCh};
  r.scene.split('\n').forEach(function(l){var m=l.match(/^([^：「]{1,8})[：:]\s*(.*)$/);if(!m)return;var id=People.idByName(m[1]);if(!id||id===S.pc)return;var L=c.mem[id]||(c.mem[id]=[]);L.push({d:S.day,t:m[2].slice(0,60)});if(L.length>8)L.shift();});
  if(r.recap)FW.add(r.recap,c.npcs.slice(),S.pc,{src:'thread'});try{saveSlot('auto',true);}catch(e){}},
 bad:function(e){var c=Thread.get().cur;if(!c)return;c.inflight=0;c.status='paused';c.err=AI.errMsg(e);if(e&&e.raw){c.raw=String(e.raw).slice(0,3000);var dg=AI.digest(e.raw);if(dg){c.turns.push({in:c.pend?c.pend.text:'',out:'（殘稿）'+dg,d:S.day});c.npcs.forEach(function(id){Nom.add(id,'（中斷的事件）'+dg.slice(0,50),'n');});}}try{saveSlot('auto',true);}catch(x){}},
 fixLast:function(sc){var c=Thread.get().cur;if(!c)return;c.inflight=0;c.status='active';c.pend=null;var t=sc.lines.map(function(l){return l.t;}).join(' ');c.last={t:t.slice(-300),ch:(sc.ch||[]).map(function(x){return x.t;})};c.prevCh=c.last.ch;c.turns.push({in:'（系統改寫）',out:t.slice(0,400),d:S.day});},
 close:function(){var T=Thread.get();if(!T.cur)return;T.cur.status='closed';T.done.push({id:T.cur.id,title:T.cur.title,d0:T.cur.d0,d1:T.cur.d1,n:T.cur.turns.length});if(T.done.length>10)T.done.shift();T.cur=null;},
 paused:function(){var c=S&&S.thread&&S.thread.cur;return !!(c&&c.status==='paused');},
 brief:function(){var c=S.thread.cur;var t='【事件線程：'+c.title+'】'+c.turns.slice(-4).map(function(x){return (x.in?'主角：'+x.in+'→':'')+x.out.slice(0,140);}).join('／');
  var m=Object.keys(c.mem).map(function(id){return cn(id)+'記得：'+c.mem[id].slice(-2).map(function(x){return x.t;}).join('／');}).join('；');if(m)t+='\n【各人對此事的記憶】'+m;if(c.last&&c.last.ch&&c.last.ch.length)t+='\n【上一幕選項（已過時，不可照抄）】'+c.last.ch.join('／');return t;},
 pausedScene:function(){var c=S.thread.cur;var ls=['（事件「'+c.title+'」中斷了'+(c.err?'：'+c.err:'')+'。）'];if(c.last)ls.push('上回說到：'+c.last.t.slice(-90));
  return Eng.L(ls,'',S.place,[ch('🔁 重試接續','thRetry'),ch('📖 以離線劇情接續','thOffline'),ch('🗑 放下這件事','thDrop'),ch('↩ 行動選單','place')]);},
 quote:function(id){var c=S.thread;var p=P(id);if(!p)return '';if(S.day-((p.notes||{}).quote||-99)<8)return '';var L=Nom.list(id,12).filter(function(x){return x.k==='recent'&&x.t.indexOf('對我說')>=0;});if(!L.length)return '';p.notes.quote=S.day;var t=L[L.length-1].t.replace(/^.*對我說：/,'');return '「你上次說過'+t+'——我記著呢。」';}
};
function ch(t,go,a,o){var c={t:t,go:go,a:a||{}};if(o)for(var k in o)c[k]=o[k];return c;}
Eng.L=function(arr,focus,bg,chs,o){var lines=arr.map(function(x){if(typeof x==='string')return {sp:'',t:x};return {sp:x[0],t:x[1],ex:x[2]};});var sc={lines:lines,focus:focus||'',bg:bg||S.place,ch:chs||[ch('繼續','place')]};if(o)for(var k in o)sc[k]=o[k];return sc;};
Eng.textScene=function(text,sp,bg){var lines=[];String(text||'').split(/\n+/).forEach(function(l){l=l.trim();if(!l)return;var m=l.match(/^([^：「」\s]{1,8})[：:]\s*(.*)$/);var who=m?People.idByName(m[1]):'';
  if(m&&(who||m[1]==='你'||m[1]===pc().n))lines.push({sp:who&&who!==S.pc?who:'p',t:m[2]});else lines.push({sp:'',t:l});});return {lines:lines,focus:sp||'',bg:bg||S.place};};
