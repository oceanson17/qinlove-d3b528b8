/* ===== 書信 ===== */
var Letters={};
(function(){
 var TPL={
  yingzheng:{low:'寡人頭風略減。香囊尚有餘香。——政',mid:'今夜月色甚好。寡人批完竹簡，忽想起你說過的話。……無他事。——政',high:'見字如面。咸陽宮太大，你不在時，竟顯得空。明日早些來。——政',ms1:'昨夜睡得很沉。這是七年來的第一次。——政',ms2:'外袍不必還了。冬日長，你留著。——政',ms3:'天下未定，可我已經定了。——政'},
  mengtian:{low:'大夫！肩膀不疼啦！改天請你吃糖人！——蒙恬',mid:'今天練槍的時候走神了，被副將笑了半天。都怪你。——蒙恬',high:'北疆的星星很亮，可我只想著咸陽的某個人。——恬',ms1:'糖人捏得醜，你別笑我……好吧你可以笑。——蒙恬',ms2:'下次還帶你騎馬！這次換你抓韁繩！——恬',ms3:'等我。我一定回來。——恬'},
  lisi:{low:'梅林殘局，靜候姑娘。——李斯',mid:'近日朝中多事，姑娘出入宮禁，切記謹言。此信閱後即焚。——斯',high:'我這一生算盡人心，卻算不到會為一封回信等上三日。——斯',ms1:'與姑娘對弈，是近年最快意之事。——李斯',ms2:'那夜的事，請你忘了。……不，別忘。——斯',ms3:'梅花開了。我在梅下等你。——斯'},
  fusu:{low:'天寒，望姑娘添衣。手爐已託人送至醫館。——扶蘇',mid:'讀〈蒹葭〉，所謂伊人，在水一方。忽覺此句寫得極好。——扶蘇',high:'今日咳得少了。大約是因為想著你，便忘了咳。——扶蘇',ms1:'手爐你留著。我……其實不太冷。——扶蘇',ms2:'那首曲子，我又寫了一小段。等你來聽。——扶蘇',ms3:'雪停了。你願意等我，我便什麼都不怕了。——扶蘇'},
  hanfei:{low:'謝、謝謝你的水。——非',mid:'新寫一篇，想、想請你先看。——韓非',high:'寫信不會結巴。所以我想多寫一些給你。今日雨，想你。——非',ms1:'你的名字很好寫。我寫了一百遍。——非',ms2:'那夜我沒有結巴。是因為你。——非',ms3:'書名我想好了。上面要有你的名字。——非'},
  jingke:{low:'小大夫，今日沒喝酒。誇我。——荊軻',mid:'高漸離說我最近笑得太傻。你說是為什麼？——軻',high:'我這種浪蕩的人，竟也開始怕死了。……都是你害的。——軻',ms1:'清水也挺好喝的。因為是你倒的。——軻',ms2:'那首歌，以後只唱給你聽。——軻',ms3:'易水我不去了。我要留在有你的地方。——軻'},
  xuanye:{low:'夜路危險。——（無署名）',mid:'今日市集那支簪子，已放在你窗台。——（無署名）',high:'……玄夜。我寫了自己的名字。——玄夜',ms1:'不要再一個人走夜路。——（無署名）',ms2:'玄夜。——玄夜',ms3:'影子有了名字，也有了想去的地方。——玄夜'}
 };
 Letters.send=function(id,kind){var t=TPL[id][kind];if(!t)return;S.letters.push({id:id,d:S.day,t:t,read:0,rep:0,k:kind});if(S.letters.length>60)S.letters.shift();UI.badge();toast('✉ 收到'+CHARS[id].n+'的來信');};
 Letters.tick=function(){if(S.day-(S.flags.lastLetter||-9)<3)return;var c=CHAR_ORDER.filter(function(id){return S.c[id].met&&S.c[id].aff>=20&&!S.c[id].jailed;});if(!c.length||rand()>0.4)return;
  var id=pick(c);var r=S.c[id];var k=r.heart>=40?'high':(r.aff>=40?'mid':'low');S.flags.lastLetter=S.day;Letters.send(id,k);};
 Letters.unread=function(){return S?S.letters.filter(function(l){return !l.read;}).length:0;};
 Letters.reply=function(i,tone,text){var l=S.letters[i];if(!l||l.rep)return;l.rep=tone;l.rt=text||'';var id=l.id;
  var g={warm:{aff:3,heart:3},tease:{aff:2,heart:4},polite:{aff:2,trust:2},free:{aff:3,heart:2,trust:1}}[tone]||{aff:1};Eng.c(id,g,P2()+'回信：'+(text||{warm:'溫柔的回覆',tease:'俏皮的回覆',polite:'得體的回覆'}[tone]));};
 function P2(){return S.p.name;}
})();
/* ===== 輸入分流（M24：說話／指令；M27：設定） ===== */
var Speak={};
Speak.reply=function(id,t){var c=CHARS[id],r=S.c[id];
 if(/喜歡你|愛你|心悅|傾心/.test(t))return r.heart>=50?'「……我也是。」他的聲音很輕，卻很清楚。':(r.aff>=25?'他愣住，耳根慢慢紅了：「你、你說什麼……」':'「姑娘說笑了。」他避開了你的目光。');
 if(/謝謝|多謝|感謝/.test(t))return '「不必言謝。」'+(r.aff>=30?'他頓了頓，「你開心就好。」':'');
 if(/對不起|抱歉/.test(t))return '「無妨。」他看著你，語氣軟了下來。';
 if(/想你|想念/.test(t))return r.heart>=30?'「……我也想你。」':'「想我？」他有些意外。';
 if(/病|痛|傷|藥/.test(t))return '「你是大夫，聽你的。」';
 if(/[？?]|嗎|呢/.test(t))return pick(['「你為何這樣問？」他想了想，「……讓我想想。」','「這個嘛——」他笑了笑，「下次再告訴你。」','「你想知道？」他看著你，「那你先告訴我，你的答案。」']);
 return pick(['「嗯。」他認真地聽著。','「你說的話，我都記著。」','他沒有說話，只是靜靜地看著你。','「……你總是這樣，讓人意外。」']);};
/* 行動（M22 Act 簡化） */
var Act={};
Act.RULES=[
 {re:/包紮|上藥|敷藥|療傷/,f:function(id){var r=S.c[id];if(r.hp<90){r.hp=clamp(r.hp+8,0,100);Eng.c(id,{trust:3,aff:2},P0()+'替我包紮');return '你仔細替'+cn(id)+'上藥包紮。他安靜地看著你的手。';}return '他身上並沒有傷。「……你想碰我，直說便是。」';}},
 {re:/診脈|把脈|切脈|看病/,f:function(id){return {go:'cure',a:{id:id}};}},
 {re:/擁抱|抱住|抱他|抱緊|抱抱/,f:function(id){var r=S.c[id];if(r.heart>=30){Eng.c(id,{heart:4,aff:2},P0()+'抱住了我');return '你抱住了'+cn(id)+'。他僵了一瞬，然後慢慢地、用力地回抱住你。';}Eng.c(id,{aff:-1,jeal:0});return cn(id)+'吃了一驚，輕輕扶住你的肩，退開半步：「……姑娘？」';}},
 {re:/牽手|牽他|握住他的手|握手|拉住他/,f:function(id){var r=S.c[id];if(r.heart>=18){Eng.c(id,{heart:3},P0()+'牽了我的手');return '你牽起他的手。他沒有掙開，指尖微微收緊。';}return '你伸出手，他看了看，只是把一卷竹簡放進你手裡。';}},
 {re:/親|吻/,f:function(id){var r=S.c[id];if(r.heart>=55){Eng.c(id,{heart:6,aff:3},P0()+'吻了我');return '你踮起腳。他閉上眼睛——月光很靜，心跳很吵。';}Eng.c(id,{aff:-2});return cn(id)+'紅著臉別開頭：「這、這樣不合禮數……」';}},
 {re:/摸頭|揉頭髮|捏臉/,f:function(id){Eng.c(id,{aff:1,heart:1});return cn(id)+'怔了怔，無奈地任你胡鬧。';}},
 {re:/撫琴|彈琴|唱歌|跳舞|吹簫/,f:function(id){Eng.p({cha:1});if(id)Eng.c(id,{aff:2},P0()+'為我奏樂');return '你一曲終了，'+(id?cn(id)+'久久沒有說話。':'四下靜了片刻。');}},
 {re:/敬酒|喝酒|飲酒|乾杯/,f:function(id){if(id==='jingke'){Eng.c(id,{aff:3});return '「好！」荊軻與你碰碗——你的碗裡是酒，他的碗裡是水。';}Eng.p({mind:3});return '你淺酌一口，酒意微醺。';}},
 {re:/煎藥|熬藥|製藥|配藥/,f:function(){return {go:'craft'};}},
 {re:/離開|告辭|回去|返回地圖/,f:function(){return {go:'hub'};}}
];
function P0(){return S.p.name;}
Act.parse=function(t){for(var i=0;i<Act.RULES.length;i++)if(Act.RULES[i].re.test(t))return Act.RULES[i];return null;};
/* 導演命令（M25 Ncmd 簡化：命令一定執行，但需有權者） */
var Ncmd={};
Ncmd.AUTH={yingzheng:9,lisi:5,mengtian:5,fusu:4,hanfei:1,jingke:1,xuanye:1};
Ncmd.parse=function(t){var m=t.match(/^(.{1,6}?)(?:命人|下令|命令|吩咐|派人|叫人|令人|命|令|叫|派|讓)(.*)$/);if(!m)return null;var sub=Eng.idByName(m[1]);if(!sub)return null;
 var rest=m[2];var tgt='';CHAR_ORDER.forEach(function(id){if(id!==sub&&rest.indexOf(CHARS[id].n)>=0&&!tgt)tgt=id;});
 var kind=/拿下|抓|逮|下獄|關押|囚/.test(rest)?'arrest':(/放了|釋放|赦|放出/.test(rest)?'free':(/殺|斬|處死|賜死/.test(rest)?'kill':(/召|傳|叫.*來|請.*來|帶.*來/.test(rest)?'summon':(/賞|賜/.test(rest)?'reward':'gen'))));
 return {sub:sub,tgt:tgt,kind:kind,raw:t};};
Ncmd.exec=function(c){var A=Ncmd.AUTH[c.sub]||1,s=cn(c.sub),tg=c.tgt?cn(c.tgt):'';
 if(c.kind==='arrest'){if(!c.tgt)return s+'下令拿人，卻沒有說拿誰。侍衛面面相覷。';if(A<5||(Ncmd.AUTH[c.tgt]||1)>=A)return s+'想下令拿下'+tg+'，但他沒有這個權力（需要秦王之令）。';
  S.c[c.tgt].jailed=1;WS.log(tg+'被'+s+'下令收押','起因：你作為導演下達的命令（'+c.raw.slice(0,20)+'）','你所為');Eng.c(c.tgt,{trust:-5});return s+'一聲令下，甲士上前拿下了'+tg+'。'+tg+'被押了下去。（可再下令「釋放」）';}
 if(c.kind==='free'){if(!c.tgt)return s+'想放人，卻沒說放誰。';if(!S.c[c.tgt].jailed)return tg+'並未被關押。';if(A<5)return s+'沒有放人的權力。';S.c[c.tgt].jailed=0;if(c.tgt==='hanfei')S.flags.hanfei_saved=1;WS.log(tg+'獲釋','起因：'+s+'下令（你的命令）','你所為');return s+'下令放人。'+tg+'走出了牢門。';}
 if(c.kind==='kill'){if(!c.tgt)return '……';if(A<9)return s+'沒有生殺之權。';S.c[c.tgt].jailed=1;WS.log(tg+'被下獄待審','起因：'+s+'動了殺心，經你勸阻改為收押','你所為');return s+'動了殺心——但這是一個不讓任何人死去的故事。'+tg+'改為收押待審。';}
 if(c.kind==='summon'){if(!c.tgt)return s+'命人去傳話。';var r=S.c[c.tgt];if(r.jailed)return tg+'身陷囹圄，來不了。';r.here={d:S.day,per:S.per,pl:S.place};r.met=1;return s+'命人傳召，片刻後，'+tg+'來到了'+PLACES[S.place].n+'。';}
 if(c.kind==='reward'){Eng.p({gold:30});return s+'吩咐賞你三十兩銀子。';}
 return s+'依言吩咐下去，眾人領命而去。';};
/* 劇情宣告（M27 Decl 簡化：宣告即成真） */
var Decl={};
Decl.apply=function(t){var out={lines:[],focus:''};var x=t.replace(/^[\/／]?設定[:：\s]*/,'').trim();var m;
 function say(s){out.lines.push(s);}
 m=x.match(/^(那人|他|此人|這人|那位公子|那男子|眼前之人)(?:便是|就是|原來是|其實是|正是)(.{1,6})$/);
 if(m){var id=Eng.idByName(m[2]);if(id){var r=S.c[id];var was=r.met;r.met=1;r.here={d:S.day,per:S.per,pl:S.place};out.focus=id;FW.add(cn(id)+'曾隱瞞身分與'+S.p.name+'相見',[id],id);if(!was)Eng.c(id,{aff:5});say('原來，那人正是'+cn(id)+'。'+(was?'':'他微微一笑，不再隱瞞。'));Mood.note(id,'在'+PLACES[S.place].n+'微服與'+S.p.name+'相見，身分被識破');return out;}}
 m=x.match(/^(.{1,6}?)(?:很想|想要|有意|想|欲)(?:結識|認識|見|接近)(?:我|她)/);
 if(m){id=Eng.idByName(m[1]);if(id){r=S.c[id];if(r.jailed){say('（宣告調整）'+cn(id)+'此刻身陷囹圄，改為：他託人捎來口信，盼與你相見。');Mood.note(id,'想結識'+S.p.name);return out;}r.met=1;r.here={d:S.day,per:S.per,pl:S.place};out.focus=id;Eng.c(id,{aff:5},'主動來結識'+S.p.name);r.thought='想結識她、了解她';say(cn(id)+'主動朝你走來，目光裡帶著毫不掩飾的興趣。');return out;}}
 m=x.match(/^(.{1,6}?)(?:其實|一直|早已|早就|偷偷)?(?:喜歡|暗戀|傾心|愛慕|心儀)(?:著)?(?:我|她)/);
 if(m){id=Eng.idByName(m[1]);if(id){r=S.c[id];r.met=1;var cap=SET.decld?60:100;var add=Math.max(0,Math.min(15,cap-r.heart));Eng.c(id,{heart:add,aff:6},'其實早已對'+S.p.name+'動心');FW.add(cn(id)+'暗中傾心於'+S.p.name,[id],id);out.focus=id;say('（作者設定）'+cn(id)+'其實早已對你動心——只是他還沒說出口。'+(add<15?'（宣告調整：心動上限 '+cap+'，其餘需靠互動）':''));return out;}}
 m=x.match(/^(.{1,6}?)(?:死了|已死|身亡|被殺)/);
 if(m){id=Eng.idByName(m[1]);if(id){r=S.c[id];r.hp=30;r.cured=0;say('（宣告調整）這個故事裡沒有人會死去。改為：'+cn(id)+'身受重傷，需要你的醫治。');Mood.note(id,'身受重傷');return out;}}
 m=x.match(/^(.{1,6}?)(?:病了|病倒|受傷|中毒)/);
 if(m){id=Eng.idByName(m[1]);if(id){r=S.c[id];r.hp=clamp(r.hp-20,10,100);r.cured=0;out.focus=id;say('（作者設定）'+cn(id)+'病倒了，臉色蒼白。');return out;}}
 m=x.match(/^(.{1,6}?)(?:來到|在|來了|出現在)(.{0,6})$/);
 if(m){id=Eng.idByName(m[1]);if(id&&!S.c[id].jailed){S.c[id].met=1;S.c[id].here={d:S.day,per:S.per,pl:S.place};out.focus=id;say(cn(id)+'出現在'+PLACES[S.place].n+'。');return out;}}
 FW.add(x,[],'p',{pub:1});say('（作者設定，從此成為事實）'+x);return out;};
/* 主入口 */
var Input={};
Input.mode=function(){return SET.inmode||'say';};
Input.submit=function(raw){var t=String(raw||'').trim();if(!t||!S)return null;var mode=Input.mode();
 if(/^[\/／]設定/.test(t)){mode='decl';t=t.replace(/^[\/／]設定[:：\s]*/,'');}else if(/^[\/／]指令/.test(t)){mode='cmd';t=t.replace(/^[\/／]指令[:：\s]*/,'');}else if(/^[\/／]說/.test(t)){mode='say';t=t.replace(/^[\/／]說[:：\s]*/,'');}
 else if(/^[（(].*[）)]$/.test(t)){mode='cmd';t=t.replace(/^[（(]|[）)]$/g,'');}
 if(!t)return null;var id=S.focus&&Eng.present().indexOf(S.focus)>=0||S.focus&&S.c[S.focus]&&S.c[S.focus].here&&S.c[S.focus].here.d===S.day?S.focus:(Eng.present()[0]||'');
 if(id)Eng.keep(id);
 Eng.back({sp:'p',t:(mode==='say'?'':'〔'+(mode==='cmd'?'指令':'設定')+'〕')+t});
 /* 秘密洩露（M22 Seal）：主動說出秘密 → 對方得知 */
 if(mode==='say'&&id&&/禁方/.test(t)){var sec=S.secrets.p[0];if(sec.kn.indexOf(id)<0){sec.kn.push(id);FW.add('師父留給'+S.p.name+'一卷禁方',[id],'p');Eng.c(id,{trust:5},S.p.name+'把師門禁方的秘密告訴了我');toast('🔏 '+cn(id)+'得知了你的秘密');}}
 var tag,off,extra='';
 if(mode==='decl'){var d=Decl.apply(t);if(d.focus){id=d.focus;S.focus=id;}tag='設定・劇情';extra='（此設定已在遊戲中成真：'+d.lines.join(' ')+'；請直接延續，不得否定）';
  off=function(){return Eng.L(d.lines.map(function(l){return ['',l];}).concat(id?[[id,Speak.reply(id,t),Eng.exprOf(id)]]:[]),id,S.place,[ch('💬 與'+(id?cn(id):'眾人')+'交談',id?'talk':'place',id?{id:id}:{}),ch('🗺 返回地圖','hub')]);};}
 else if(mode==='cmd'){var nc=Ncmd.parse(t);
  if(nc){var res=Ncmd.exec(nc);if(nc.tgt&&S.c[nc.tgt]&&!S.c[nc.tgt].jailed)id=nc.tgt;tag='指令・命令';extra='（命令已執行：'+res+'）';off=function(){return Eng.L([['',res]],id,S.place,[ch('🗺 返回地圖','hub')].concat(id?[ch('💬 與'+cn(id)+'交談','talk',{id:id})]:[]));};}
  else{var ar=Act.parse(t);var resA=ar?ar.f(id):null;if(resA&&resA.go)return resA;tag='指令・行動';
   if(!resA)resA='你'+t.replace(/^我/,'')+'。'+(id?cn(id)+'看著你，若有所思。':'');extra='（行動結果：'+resA+'）';
   off=function(){return Eng.L([['',resA]],id,S.place,[ch('💬 繼續','talk',id?{id:id}:{}),ch('🗺 返回地圖','hub')].filter(function(c){return id||c.go!=='talk';}));};}}
 else{tag='對白';if(id){Eng.c(id,{aff:S.c[id].talked?0:2},S.p.name+'對我說：「'+t.slice(0,24)+'」');S.c[id].talked=1;}
  off=function(){return Eng.L(id?[[id,Speak.reply(id,t),Eng.exprOf(id)]]:[['','你的話散在風裡，無人回應。']],id,S.place,[ch('💬 繼續','talk',id?{id:id}:{}),ch('🗺 返回地圖','hub')].filter(function(c){return id||c.go!=='talk';}));};}
 Eng.pass(mode==='say'?0:1);
 if(AI.ready()){var req={type:'free',text:t,id:id,tag:tag,extra:extra};S.pend={text:t,id:id,req:req,d:S.day};return {async:req,fb:off,pendKeep:1};}
 return off();};
