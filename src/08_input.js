/* ===== 書信／邀約／送禮／暗戀（NPC 主動聯絡） ===== */
var Letters={};
(function(){
 var NAMED_L={
  yingzheng:['寡人頭風略減。你那套「聽診」之術，寡人仍覺古怪。——政','今夜月色甚好。批完竹簡，忽想起你說過的話。……無他事。——政'],
  mengtian:['大夫！上回縫的傷口長好了，疤都不明顯！改天請你吃糖人！——蒙恬','北疆的星星很亮。軍中缺你這樣的醫者。——恬'],
  lisi:['梅林殘局，靜候大駕。——李斯','近日朝中多事，出入宮禁切記謹言。此信閱後即焚。——斯'],
  fusu:['天寒，望添衣。你教的煮水之法，我已令府中照辦。——扶蘇','讀〈蒹葭〉，所謂伊人，在水一方。忽覺此句寫得極好。——扶蘇'],
  hanfei:['謝、謝謝你的水。新寫一篇，想、想請你先看。——韓非','寫信不會結巴。所以我想多寫一些。——非'],
  jingke:['小大夫，今日沒喝酒。誇我。——荊軻','高漸離說我最近笑得太傻。你說是為什麼？——軻'],
  xuanye:['夜路危險。——（無署名）','……玄夜。我寫了自己的名字。——玄夜']
 };
 function sign(p){return '——'+p.n;}
 Letters.send=function(id,k,o){var p=P(id);if(!p)return;o=o||{};var t='';var me=pc();var pl=PLACES[o.pl||'']||{};
  if(k==='named')t=pick(NAMED_L[id]);
  else if(k==='greet')t=pick(['近日可好？'+(PLACES[p.loc&&p.loc.pl]||{n:'一別'}).n+'之後，甚念。','聽聞你近來辛苦，望保重身子。','前些日子多得你照應，一直想道謝。','天氣轉'+(Eng.season()===3?'寒':'暖')+'，記得'+(Eng.season()===3?'添衣':'多喝水')+'。'])+sign(p);
  else if(k==='invite')t=cnum0(o.dd)+'日後'+PERIODS[o.per]+'，可願同往'+pl.n+'一遊？'+sign(p);
  else if(k==='gift')t='偶得'+ITEMS[o.item].n+'，贈君一用，莫要推辭。'+sign(p);
  else if(k==='crush')t=pick(['每回見你，話到嘴邊又嚥了回去。','昨日你從'+(PLACES[S.place]||{n:'街口'}).n+'走過，我看了很久。','你大約不記得我。我卻記得你說話的樣子。'])+'——（無署名）';
  else if(k==='ask')t='家中有人染了'+o.ill+'，求醫無門，懇請'+(Gender.call(id))+'過府一診。'+sign(p);
  S.letters.push({id:id,d:S.day,t:t,read:0,rep:0,k:k,o:o});if(S.letters.length>60)S.letters.shift();
  if(k==='gift')Inv.add(o.item,1);if(k==='invite')S.invites.push({id:id,pl:o.pl,day:S.day+o.dd,per:o.per});if(k==='ask')S.calls.push({id:id,cs:o.cs,until:S.day+6});
  if(typeof UI!=='undefined'){UI.badge();toast('✉ 收到'+(k==='crush'?'一封無署名的':cn(id)+'的')+'來信');}};
 Letters.tick=function(){if(S.region==='road')return;var gap=Math.round(4*Pace.vf());if(S.day-(S.flags.lastLetter||-9)<gap)return;var c=[];
  for(var id in S.ppl){var p=S.ppl[id];if(!p.alive||!p.met||p.hh||id===S.pc||id==='master'&&!S.flags.masterMet||p.jailed)continue;if(People.where(id)===S.place)continue;if(p.aff>=25||(p.love||0)>=35)c.push(id);}
  if(!c.length||rand()>0.45)return;var id2=pick(c),q=P(id2);S.flags.lastLetter=S.day;var r=rand();
  if(q.love>=40&&!q.confessed&&rand()<0.35)return Letters.send(id2,'crush');
  if(NAMED_L[id2]&&q.aff>=35&&rand()<0.5)return Letters.send(id2,'named');
  if(r<0.3){var pls=REGION_PLACES[S.region].filter(function(k){return !PLACES[k].need&&!PLACES[k].home;});return Letters.send(id2,'invite',{pl:pick(pls),dd:1+rnd(3),per:1+rnd(3)});}
  if(r<0.5){var gifts=['cake','fruit','cloth','honey','wine','herb','salt'];return Letters.send(id2,'gift',{item:pick(gifts)});}
  if(r<0.65&&S.fam.tech.alco){var cs=pick(['fever','diarrhea','cut','abscess','fracture','lung']);return Letters.send(id2,'ask',{cs:cs,ill:CASES[Med.caseOf(cs)].dx});}
  Letters.send(id2,'greet');};
 Letters.unread=function(){return S?S.letters.filter(function(l){return !l.read;}).length:0;};
 Letters.reply=function(i,tone,text){var l=S.letters[i];if(!l||l.rep)return;l.rep=tone;l.rt=text||'';var id=l.id;var p=P(id);
  var g={warm:{aff:3,love:2},tease:{aff:2,love:3},polite:{aff:2,trust:2},free:{aff:3,love:1,trust:1},decline:{aff:-2}}[tone]||{aff:1};
  if(l.k==='crush'){p.confessed=1;l.t=l.t.replace('（無署名）','（無署名，後來你知道是'+p.n+'）');if(tone!=='decline')g={love:5,aff:3};FW.add(p.n+'暗中鍾情於'+pc().n,[id],id,{});}
  if(l.k==='invite'&&tone==='decline')S.invites=S.invites.filter(function(v){return !(v.id===id&&v.pl===l.o.pl);});
  People.rel(id,g,pc().n+'回信：'+(text||{warm:'溫柔的回覆',tease:'俏皮的回覆',polite:'得體的回覆',decline:'婉拒'}[tone]||''));};
})();
/* ===== 說話（M24 分流後的「對白」離線回應） ===== */
var Speak={};
Speak.reply=function(id,t){var p=P(id);if(!p)return '';var T=ta(p);var q=Thread.quote(id);var call=Gender.call(id);
 if(p.kind!=='npc'&&p.hh&&ageOf(p)<6)return pick(['「咿呀——」','「抱抱！」','（'+p.n+'咯咯地笑，抓住你的手指不放。）']);
 if(/喜歡你|愛你|心悅|傾心|嫁給我|娶我/.test(t))return p.love>=50?'「……我也是。」'+T+'的聲音很輕，卻很清楚。':(p.aff>=25?T+'愣住，耳根慢慢紅了：「你、你說什麼……」':'「'+call+'說笑了。」'+T+'避開了你的目光。');
 if(/謝謝|多謝|感謝/.test(t))return '「不必言謝。」'+(p.aff>=30?T+'頓了頓，「你好好的就行。」':'');
 if(/對不起|抱歉/.test(t))return '「罷了。」'+T+'看著你，語氣軟了下來。';
 if(/餓|吃/.test(t)&&p.hh)return '「'+(Inv.has('grain')?'鍋裡還有些粟，我去熱。':'家裡沒米了……明日得想法子。')+'」';
 if(/病|痛|傷|藥/.test(t))return p.ill.length?'「'+Ill.str(p)+'……讓你費心了。」':'「你懂醫，我聽你的。」';
 if(/[？?]|嗎|呢/.test(t))return pick(['「你為何這樣問？」'+T+'想了想，「……讓我想想。」','「這個嘛——」'+T+'笑了笑，「下次再告訴你。」','「你想知道？那你先說說你的看法。」']);
 return (q&&rand()<0.5)?q:pick(['「嗯。」'+T+'認真地聽著。','「你說的話，我都記著。」',T+'沒有說話，只是靜靜地看著你。','「……你總是讓人意外。」'])+(p.hh?'（心聲：'+People.thought(p)+'）':'');};
/* ===== 行動（M22 Act：對話中的行動指令，含生活動作） ===== */
var Act={};
function _me(){return pc().n;}
Act.RULES=[
 {k:'eat',solo:1,re:/^(?:我)?(?:吃|進食|吃飯|用飯|煮飯|開飯)/,f:function(){return Eng.meal(false)||'你們圍著鍋吃了一頓。';}},
 {k:'sleep',solo:1,re:/睡覺|歇息|休息|就寢|小憩/,f:function(){return {go:'sleep'};}},
 {k:'forage',solo:1,re:/採集|挖野菜|摘野果|找吃的|採蘑菇|採藥|撿柴|砍柴/,f:function(){return {go:'forage'};}},
 {k:'sew',solo:1,re:/縫補|補衣|縫衣|補鞋/,f:function(){var me=pc();if(!Inv.has('thread')&&!Inv.has('cloth'))return '你翻遍行囊，找不到一根線、一片布。';Inv.add(Inv.has('thread')?'thread':'cloth',-1);me.cloth=clamp(me.cloth+35,0,100);Eng.pass(1);return '你就著光把破處一針針縫好。衣裳暖和多了。（衣物+35）';}},
 {k:'feet',solo:1,re:/水泡|護理腳|洗腳|泡腳|裹腳|包腳/,f:function(){var me=pc();var hb=Ill.has(me,'blister');Eng.pass(1);if(hb){if(Inv.has('alcohol')){Inv.add('alcohol',-1);Ill.cure(me,'blister',3);me.feet=clamp(me.feet+40,0,100);return '你用火烤過的針挑破水泡、抹上酒精，再用乾淨布條裹好。疼，但不會再潰爛了。';}Ill.cure(me,'blister',1);me.feet=clamp(me.feet+20,0,100);return '你用清水洗淨雙腳，墊上乾草。少了酒精，只能盼它別化膿。';}me.feet=clamp(me.feet+10,0,100);return '你泡了泡腳，舒服了些。';}},
 {k:'fire',solo:1,re:/生火|烤火|升火|點火/,f:function(){if(!Inv.has('wood'))return '沒有柴，火生不起來。';Inv.add('wood',-1);S.flags.fire=S.day;return '火苗竄起，屋裡暖了。（今夜保暖+）';}},
 {k:'build',solo:1,re:/搭屋|蓋房|建屋|修屋|搭棚/,f:function(){return {go:'build'};}},
 {k:'farm',solo:1,re:/開荒|種田|耕作|播種|收割|鋤地|下地/,f:function(){return {go:'farm'};}},
 {k:'sell',solo:1,re:/賣掉|出售|變賣|賣/,f:function(){return {go:'shop',a:{sell:1}};}},
 {k:'buy',solo:1,re:/購買|買/,f:function(){return {go:'shop'};}},
 {k:'craft',solo:1,re:/製藥|蒸餾|提煉|熬藥|煎藥|配藥|做繃帶|製作/,f:function(){return {go:'craft'};}},
 {k:'treat',re:/治療|看病|診治|診脈|把脈|包紮|縫合|清創|聽診|療傷/,f:function(id){return id?{go:'treat',a:{id:id}}:{go:'treat',a:{id:S.pc}};},solo:1},
 {k:'propose',re:/求婚|提親|嫁給|娶/,f:function(id){return id?{go:'propose',a:{id:id}}:'你想求婚，可身邊沒有那個人。';}},
 {k:'give',ok:1,re:/遞給|遞上|遞過|交給|塞給|分給|拿給|奉上|送上|斟/,f:function(id,src){var p=P(id);if(!p)return '你伸出手，卻沒有可以遞給的人。';var ks=Object.keys(S.inv).filter(function(k){return S.inv[k]>0&&ITEMS[k]&&!ITEMS[k].hide;});var k=null;
   ks.forEach(function(x){var n=ITEMS[x].n;if(!k&&(src.indexOf(n)>=0||(n.length>=2&&src.indexOf(n.slice(-1))>=0&&/酒|糖|餅|肉|魚|藥|布|簡|琴|玉|花|果/.test(n.slice(-1)))))k=x;});
   if(!k)return {go:'gift',a:{id:id}};var it=ITEMS[k];Inv.add(k,-1);var like=p.like.some(function(l){return it.n.indexOf(l)>=0||l.indexOf(it.n.slice(-1))>=0;});if(it.food)p.food=clamp((p.food||60)+it.food,0,100);
   People.rel(id,like?{aff:6,love:2}:{aff:2},_me()+'遞給我'+it.n);Eng.pass(0);return '你把'+it.n+'遞給了'+p.n+'。'+(like?ta(p)+'眼睛一亮，顯然正合心意。':ta(p)+'接了過去。');}},
 {k:'gift',re:/送禮|送給|贈/,f:function(id){return id?{go:'gift',a:{id:id}}:'此刻沒有可送的人。';}},
 {k:'bribe',re:/行賄|塞錢|賄賂|打點|給.*銀子/,f:function(id){var p=P(id);if(!p)return '你摸出銀子，卻不知該給誰。';var amt=Math.min(S.gold,10+rnd(10));if(amt<5)return '你囊中羞澀，拿不出像樣的錢。';Inv.gold(-amt);var greedy=p.pers.indexOf('貪財')>=0;var ok=greedy||rand()<0.5;addLog('〔行賄〕'+_me()+'向'+p.n+'行賄'+amt+'兩','行');if(ok){People.rel(id,{aff:greedy?6:3},'收了'+_me()+amt+'兩');S.flags['bribed_'+id]=S.day;return p.n+'掂了掂銀子，嘴角一鬆：「算你懂事。」（'+amt+'兩，今日對你寬容）';}People.rel(id,{trust:-4},_me()+'想賄賂我');if(p.pers.indexOf('正直')>=0)FW.add(_me()+'曾試圖賄賂'+p.n,[id],S.pc,{});return p.n+'把銀子推回來，沉下臉：「收起來。」';},ok:1},
 {k:'threaten',re:/威脅|恐嚇|嚇唬|警告/,f:function(id){var p=P(id);if(!p)return '你對著空氣放了狠話。';People.rel(id,{aff:-8,trust:-5},'被'+_me()+'威脅');Bond.apply(id,{e:{戒備:10,怨恨:5}});if(p.pers.indexOf('膽小')>=0)return p.n+'臉色發白，連連退後：「有話好說、有話好說！」';return p.n+'冷冷看著你：「你大可試試。」';}},
 {k:'kneel',re:/下跪|跪下|求情|磕頭|哀求/,f:function(id){var p=P(id);if(!p)return '你跪在地上，四下無人。';var soft=p.pers.indexOf('仗義')>=0||p.pers.indexOf('溫和')>=0||p.pers.indexOf('憨厚')>=0;People.rel(id,{aff:soft?4:0,trust:soft?2:-1},_me()+'向我跪地求情');pc().mood=clamp(pc().mood-5,0,100);return soft?p.n+'嘆了口氣，把你扶起：「起來說話。」':p.n+'居高臨下看著你，不置可否。';}},
 {k:'flee',solo:1,re:/逃跑|逃走|逃離|溜走|開溜/,f:function(){if(S.region==='road'){var g=P(S.road.guards[0]);if(rand()<0.25+(S.flags['bribed_'+S.road.guards[0]]===S.day?0.3:0)){S.flags.fled=1;addLog('〔逃〕'+_me()+'趁夜逃離流放隊伍','行');FW.add(_me()+'是從流放隊伍逃脫的罪人',[S.road.guards[0]],S.pc,{secret:1,kw:['逃犯','流人']});return {go:'fled'};}pc().hp=clamp(pc().hp-12,1,100);People.rel(g.id,{aff:-10},_me()+'企圖逃跑');return '你才跑出幾步，就被'+g.n+'一腳踹倒在地：「想逃？」鞭子落在背上。（健康-12）';}return {go:'map'};}},
 {k:'fight',re:/動手|打他|打她|揍|出手|拔劍|搏鬥|打架/,f:function(id){var p=P(id);if(!p)return '你揮了揮拳，打了個空。';var me=pc();var a=me.sk.mart+me.at.con*2+rnd(30),b=(p.sk.mart||10)+p.at.con*2+rnd(30);People.rel(id,{aff:-12,trust:-8},'和'+_me()+'動了手');addLog('〔打架〕'+_me()+'與'+p.n+'動手','行');if(a>=b){p.hp=clamp(p.hp-15,1,100);Ill.add(p,'wound',1);return '你一拳正中'+p.n+'，對方踉蹌倒地，捂著傷處瞪你。';}me.hp=clamp(me.hp-15,1,100);Ill.add(me,'wound',1);return p.n+'側身一讓，反手把你摜在地上。你嘴角見了血。（受傷）';},ok:1},
 {k:'poison',re:/下毒|投毒|毒死/,f:function(id){var p=P(id);if(!p)return '你握著藥包，終究沒有找到下手的對象。';addLog('〔密謀〕'+_me()+'向'+p.n+'下毒','行');FW.add(_me()+'曾向'+p.n+'下毒',[S.pc],S.pc,{secret:1,kw:['下毒','投毒']});Ill.add(p,'poison',2);S.fam.notor=(S.fam.notor||0)+5;return '你把藥末抖進'+p.n+'的碗裡。'+p.n+'喝下後不久，臉色就變了。（醫者之手，也能殺人。）';},ok:1},
 {k:'selfharm',solo:1,re:/自盡|自殘|割腕|尋死|撞牆/,f:function(id){var me=pc();me.hp=clamp(me.hp-15,1,100);me.mood=clamp(me.mood-10,0,100);var h=People.present()[0];if(h){People.rel(h,{trust:3},'阻止'+_me()+'傷害自己');Bond.apply(h,{e:{依賴:3},th:'擔心'+_me()+'想不開'});return P(h).n+'撲上來死死攥住你的手：「你瘋了嗎！」（健康-15）';}return '血滲了出來。你看著它，忽然覺得很累。（健康-15）';}},
 {k:'show',re:/出示|拿出|亮出|掏出/,f:function(id,t){var it='';for(var k in ITEMS)if(!ITEMS[k].hide&&t.indexOf(ITEMS[k].n)>=0&&Inv.has(k))it=k;if(!it)return '你在懷裡摸了摸，沒有那樣東西。';var p=P(id);if(p&&ITEMS[it].c==='tool'&&(it==='steth'||it==='scalpel')){Bond.apply(id,{e:{戒備:4},th:'那古怪的器具是什麼'});return p.n+'盯著你手中的'+ITEMS[it].n+'，眉頭緊皺：「這是何物？」';}return '你拿出'+ITEMS[it].n+'。'+(p?p.n+'看了一眼。':'');}},
 {k:'disguise',solo:1,re:/女扮男裝|男扮女裝|易裝|束胸|改作男裝|改作女裝/,f:function(){var me=pc();if(Gender.on())return '你本來就作'+(S.disg.as==='m'?'男':'女')+'裝打扮。';if(!Inv.has('cloth'))return '易裝至少要一匹布。';Inv.add('cloth',-1);Gender.start(me.g==='f'?'m':'f');return '你束起長髮、換上'+(me.g==='f'?'男子':'女子')+'衣裳，對著水面看了很久——從今天起，旁人會叫你「'+(me.g==='f'?'公子':'姑娘')+'」。';}},
 {k:'undisguise',solo:1,re:/卸去易裝|恢復女裝|恢復男裝|卸裝|不再易裝/,f:function(){if(!Gender.on())return '你並未易裝。';Gender.stop();return '你換回本來的衣裳。街坊們的眼神，一下子都變了。';}},
 {k:'study',solo:1,re:/讀書|學習|練字|唸書|背書/,f:function(){var me=pc();Eng.pass(1);me.sk.lit=clamp(me.sk.lit+1,0,100);return '你讀了一個時辰的竹簡。（文+1）';}},
 {k:'train',solo:1,re:/練武|練劍|習武|鍛鍊|打拳/,f:function(){var me=pc();Eng.pass(1);me.sk.mart=clamp(me.sk.mart+1,0,100);me.sta=clamp(me.sta-10,0,100);return '你練得一身大汗。（武+1，體力-10）';}},
 {k:'work',solo:1,re:/打工|幹活|做工|做活|找活/,f:function(){return {go:'work'};}},
 {k:'hug',re:/擁抱|抱住|抱緊|抱抱/,f:function(id){var p=P(id);if(!p)return '你抱住了自己。';if(p.hh&&ageOf(p)<14){People.rel(id,{aff:3});return p.n+'撲進你懷裡，咯咯地笑。';}if(p.love>=30){People.rel(id,{love:4,aff:2},_me()+'抱住了我');return '你抱住了'+p.n+'。'+ta(p)+'僵了一瞬，然後慢慢地、用力地回抱住你。';}People.rel(id,{aff:-1});return p.n+'吃了一驚，輕輕扶住你的肩，退開半步。';}},
 {k:'hold',re:/牽手|握住.*手|拉住/,f:function(id){var p=P(id);if(!p)return '你的手落了空。';if(p.love>=18){People.rel(id,{love:3},_me()+'牽了我的手');return '你牽起'+ta(p)+'的手。'+ta(p)+'沒有掙開，指尖微微收緊。';}return p.n+'不著痕跡地抽回了手。';}},
 {k:'kiss',re:/親吻|吻|親/,f:function(id){var p=P(id);if(!p)return '……';if(p.love>=55){People.rel(id,{love:6,aff:3},_me()+'吻了我');return '月光很靜，心跳很吵。';}People.rel(id,{aff:-2});return p.n+'紅著臉別開頭：「這、這樣不合禮數……」';}},
 {k:'apprentice',re:/拜師|收我為徒|收.*為徒|收徒/,f:function(id,t){return {go:'apprentice',a:{id:id,t:t}};}},
 {k:'endlife',solo:1,re:/結束這一生|了此一生|就此落幕/,f:function(){return {go:'endLife'};}},
 {k:'leave',solo:1,re:/離開|告辭|回去|返回地圖|回家/,f:function(){return {go:'map'};}}
];
Act.parse=function(t){for(var i=0;i<Act.RULES.length;i++)if(Act.RULES[i].re.test(t))return Act.RULES[i];return null;};
Act.NEG=/卻沒有|並沒有|沒能|並未|你並未|沒有照做|拒絕了你|只是想想|念頭一閃/;
Act.verify=function(r,act){if(SET.actd===false||!act||!act.res)return null;if(Act.NEG.test(r.scene)&&act.ok)return act.off();return null;};
/* ===== NPC 命令（M23/M25：導演命令必須真正執行） ===== */
var Ncmd={};
Ncmd.parse=function(t){var m=t.match(/^(.{1,8}?)(?:命人|下令|命令|吩咐|派人|叫人|令人|喝令|命|令|叫|派|讓|要)(.+)$/);if(!m)return null;var sub=People.idByName(m[1]);if(!sub||sub===S.pc)return null;
 var rest=m[2];var tgt='';if(/我|你|主角/.test(rest.slice(0,4)))tgt=S.pc;for(var id in S.ppl){var p=S.ppl[id];if(id!==sub&&p.alive&&(rest.indexOf(p.n)>=0||(p.met&&p.title&&p.title.length>=2&&rest.indexOf(p.title)>=0)))tgt=id;}if(!tgt){var nm=rest.replace(/^(把|將)/,'').match(/^(.{1,6}?)(拿下|抓|逮|關|放|殺|斬|處死|過來|來|退下|杖|打|賞|逐)/);if(nm)tgt=People.idByName(nm[1]);}
 var kind=/拿下|抓|逮|下獄|關押|囚|押走/.test(rest)?'arrest':(/放了|釋放|赦|放出|鬆綁/.test(rest)?'free':(/殺|斬|處死|賜死/.test(rest)?'kill':(/杖|打|鞭|責罰|掌嘴/.test(rest)?'punish':(/召|傳|叫.*來|請.*來|帶.*來|過來/.test(rest)?'summon':(/賞|賜/.test(rest)?'reward':(/逐|趕走|轟出|退下/.test(rest)?'dismiss':(/治|醫|救/.test(rest)?'heal':'gen')))))));
 return {sub:sub,tgt:tgt,kind:kind,raw:t,rest:rest};};
Ncmd.exec=function(c){var A=WS.auth(c.sub),s=cn(c.sub),tg=c.tgt?cn(c.tgt):'',T=c.tgt?P(c.tgt):null;c.ok=0;
 if(c.kind==='arrest'){if(!T)return s+'下令拿人，卻沒有說拿誰。';var TA=WS.auth(c.tgt);if(A<3||TA>=A)return s+'想拿下'+tg+'，但'+ta(P(c.sub))+'沒有這個權力。';var ev=WS.evidence(c.tgt);if(A<7&&!ev.length&&SET.wsane!==false)return s+'喝令拿人，左右卻遲疑：「無憑無據，恐難服眾。」——'+tg+'終究沒有被抓。（世界節制：需要罪證或更高權力）';
  c.ok=1;if(c.tgt===S.pc){S.flags.held=S.day;addLog('〔下獄〕'+_me()+'被'+s+'下令收押','身');WS.log(_me()+'被'+s+'下令收押','起因：'+(ev[0]||'奉命行事'),'你所為');return s+'一聲令下，差役一擁而上，鎖鏈套上了你的手腕。';}
  T.jailed=S.day;WS.log(tg+'被'+s+'下令收押','起因：你作為導演下達的命令（'+c.raw.slice(0,20)+'）'+(ev.length?'；罪證：'+ev[0].slice(0,20):''),'你所為');People.rel(c.tgt,{trust:-5});return s+'一聲令下，左右上前拿下了'+tg+'。'+tg+'被押了下去。';}
 if(c.kind==='free'){if(!T)return s+'想放人，卻沒說放誰。';if(c.tgt===S.pc&&S.flags.held){if(A<3)return s+'沒有放人的權力。';S.flags.held=0;c.ok=1;return s+'擺擺手：「放了。」鎖鏈落地，你重獲自由。';}if(!T.jailed)return tg+'並未被關押。';if(A<3)return s+'沒有放人的權力。';T.jailed=0;c.ok=1;if(c.tgt==='hanfei')S.hist.hanfeiSaved=1;WS.log(tg+'獲釋','起因：'+s+'下令（你的命令）','你所為');return s+'下令放人。'+tg+'走出了牢門。';}
 if(c.kind==='kill'){if(!T)return '……';if(A<8)return s+'沒有生殺之權。';var ev2=WS.evidence(c.tgt);c.ok=1;if(!ev2.length||c.tgt===S.pc){T.jailed=S.day;WS.log(tg+'被下獄待審','起因：'+s+'動了殺心，左右以無罪證諫阻，改為收押','你所為');return s+'動了殺心——左右跪地諫阻：「無罪而誅，恐失人心。」'+tg+'改為收押待審。';}People.die(c.tgt,'被'+s+'下令處死');WS.log(tg+'被處死','起因：'+s+'下令；'+ev2[0].slice(0,20),'你所為');return s+'下令。'+tg+'被押赴刑場——再沒有回來。';}
 if(c.kind==='punish'){if(!T)return s+'要責罰人，卻沒說是誰。';if(A<2||WS.auth(c.tgt)>=A)return s+'無權責罰'+tg+'。';c.ok=1;T.hp=clamp(T.hp-12,1,100);Ill.add(T,'wound',1);People.rel(c.tgt,{aff:-4});return s+'一聲令下，'+tg+'挨了一頓板子，皮開肉綻。';}
 if(c.kind==='summon'){if(!T)return s+'命人去傳話。';if(T.jailed&&A<3)return tg+'身陷囹圄，來不了。';T.here={d:S.day,per:S.per,pl:S.place};T.met=1;c.ok=1;Eng.keep(c.tgt);return s+'命人傳召，片刻後，'+tg+'來到了'+PLACES[S.place].n+'。';}
 if(c.kind==='reward'){c.ok=1;var amt=Math.min(10+A*8,80);if(c.tgt&&c.tgt!==S.pc){T.notes.gold=(T.notes.gold||0)+amt;People.rel(c.tgt,{aff:3});return s+'吩咐賞'+tg+amt+'兩。';}Inv.gold(amt);return s+'吩咐賞你'+amt+'兩銀子。';}
 if(c.kind==='dismiss'){if(!T)return s+'揮手讓眾人退下。';c.ok=1;T.here=null;T.away=S.day;return tg+'領命退下。';}
 if(c.kind==='heal'){c.ok=1;if(T){Ill.cure(T,(T.ill[0]||{}).k,1);return s+'命人延醫，'+tg+'的病稍見好轉。';}return s+'命人去請大夫。';}
 c.ok=1;return s+'依言吩咐下去：「'+c.rest.slice(0,24)+'」——眾人領命而去，事情照辦了。';};
Ncmd.verify=function(r,c){if(SET.ncmd===false||!c||!c.ok)return null;var tg=c.tgt?cn(c.tgt):'';var bad=Act.NEG.test(r.scene)||/卻沒有人|沒人理會|無人應聲|置若罔聞/.test(r.scene);var quoted=r.scene.length<200&&r.scene.indexOf(c.rest.slice(0,8))>=0&&!/領命|照辦|上前|押|傳召|退下|放了|賞/.test(r.scene);
 if(bad||quoted||(tg&&r.scene.indexOf(tg)<0&&c.tgt!==S.pc))return c.off();return null;};
/* ===== 劇情宣告（M27 Decl：設定必定成真；矛盾時調整） ===== */
var Decl={};
Decl.apply=function(t){var out={lines:[],focus:''};var x=t.replace(/^[\/／]?(設定|劇情|宣告|旁白)[:：\s]*/,'').trim();var m,id,p;var me=pc();
 function say(s){out.lines.push(s);}
 m=x.match(/^(那人|他|她|此人|這人|那位公子|那男子|那女子|眼前之人)(?:便是|就是|原來是|其實是|正是)(.{1,6})$/);
 if(m){id=People.idByName(m[2]);if(id&&id!==S.pc){p=P(id);if(!p.alive){say('（宣告調整）'+p.n+'已不在人世，改為：那人長得與'+p.n+'有幾分相似。');return out;}var was=p.met;p.met=1;p.here={d:S.day,per:S.per,pl:S.place};out.focus=id;Eng.keep(id);FW.add(p.n+'曾隱瞞身分與'+me.n+'相見',[id],id,{});if(!was)People.rel(id,{aff:5});say('原來，那人正是'+p.n+'。'+(was?'':ta(p)+'微微一笑，不再隱瞞。'));People.note(id,'在'+PLACES[S.place].n+'微服與'+me.n+'相見，身分被識破','crit');return out;}}
 m=x.match(/^(.{1,6}?)(?:很想|想要|有意|想|欲)(?:結識|認識|見|接近|拜訪)(?:我|她|他)/);
 if(m){id=People.idByName(m[1]);if(id&&id!==S.pc){p=P(id);if(p.jailed||!p.alive){say('（宣告調整）'+p.n+(p.alive?'此刻身陷囹圄':'已不在人世')+'，改為：'+(p.alive?ta(p)+'託人捎來口信，盼與你相見。':'你只在舊物中讀到'+ta(p)+'留下的名字。'));if(p.alive)People.note(id,'想結識'+me.n);return out;}p.met=1;p.here={d:S.day,per:S.per,pl:S.place};out.focus=id;Eng.keep(id);People.rel(id,{aff:5},'主動來結識'+me.n);p.thought='想結識'+me.n+'、了解'+ta(me);say(p.n+'主動朝你走來，目光裡帶著毫不掩飾的興趣。');return out;}}
 m=x.match(/^(.{1,6}?)(?:其實|一直|早已|早就|偷偷)?(?:喜歡|暗戀|傾心|愛慕|心儀)(?:著)?(?:我|她|他)/);
 if(m){id=People.idByName(m[1]);if(id&&id!==S.pc){p=P(id);p.met=1;var cap=SET.decld!==false?60:100;var add=Math.max(0,Math.min(15,cap-(p.love||0)));People.rel(id,{love:add,aff:6},'其實早已對'+me.n+'動心');FW.add(p.n+'暗中傾心於'+me.n,[id],id,{});out.focus=id;say('（作者設定）'+p.n+'其實早已對你動心——只是還沒說出口。'+(add<15?'（宣告調整：情意上限 '+cap+'，其餘要靠相處）':''));return out;}}
 m=x.match(/^(.{1,6}?)是我的(師父|師兄|師姐|兄長|姐姐|弟弟|妹妹|舊識|故人|恩人|仇人|表哥|表姐|義兄|義妹)$/);
 if(m){id=People.idByName(m[1]);if(id&&id!==S.pc){p=P(id);p.met=1;p.notes.declRel=m[2];var hostile=m[2]==='仇人';People.rel(id,hostile?{aff:-15}:{aff:10,trust:8},'與'+me.n+'的關係：'+m[2]);FW.add(p.n+'是'+me.n+'的'+m[2],[id],S.pc,{pub:!hostile});out.focus=id;say('（作者設定）'+p.n+'原是你的'+m[2]+'。'+(hostile?'舊怨未消。':'多年情分，不必多言。'));return out;}}
 m=x.match(/^(.{1,6}?)(?:死了|已死|身亡|被殺|去世)/);
 if(m){id=People.idByName(m[1]);if(id&&id!==S.pc){p=P(id);if(!p.alive){say('（作者設定）'+p.n+'早已不在人世。');return out;}if(p.kind==='named'&&SET.decld!==false){p.hp=20;Ill.add(p,'wound',3);say('（宣告調整）'+p.n+'是牽動天下的人物，一句話不能抹去。改為：'+ta(p)+'身受重傷，命懸一線——也許只有你救得了。');People.note(id,'身受重傷','crit');return out;}People.die(id,'作者設定');say('（作者設定）'+p.n+'死了。');return out;}}
 m=x.match(/^(.{1,6}?)(?:病了|病倒|受傷|中毒|發燒|染病)/);
 if(m){id=People.idByName(m[1]);if(id){p=P(id);var ik=/中毒/.test(x)?'poison':(/受傷/.test(x)?'wound':'fever');Ill.add(p,ik,2);out.focus=id===S.pc?'':id;say('（作者設定）'+(id===S.pc?'你':p.n)+(ik==='poison'?'中了毒':(ik==='wound'?'受了傷':'病倒了'))+'，臉色蒼白。');return out;}}
 m=x.match(/^(.{1,6}?)(?:來到|來了|出現在|在這裡|就在)(.{0,6})$/);
 if(m){id=People.idByName(m[1]);if(id&&id!==S.pc){p=P(id);if(!p.alive){say('（宣告調整）'+p.n+'已不在人世。');return out;}if(p.jailed){say('（宣告調整）'+p.n+'身陷囹圄，無法前來。');return out;}p.met=1;p.here={d:S.day,per:S.per,pl:S.place};out.focus=id;Eng.keep(id);say(p.n+'出現在'+PLACES[S.place].n+'。');return out;}}
 m=x.match(/(下起|下了|開始下)(大雪|小雪|雪|大雨|小雨|雨)|(放晴|天晴|晴了)/);
 if(m){S.wx.k=m[3]?'晴':({大雪:'大雪',小雪:'雪',雪:'雪',大雨:'大雨',小雨:'小雨',雨:'小雨'}[m[2]]);if(/雪/.test(S.wx.k)&&S.wx.b>2)S.wx.b=1;S.wx.lock=S.day;Weather.upd();say('（作者設定）'+(m[3]?'雲開日出，天放晴了。':'天空'+m[1]+m[2]+'。'));return out;}
 m=x.match(/(?:撿到|得到|有人送來|繼承了|挖出)(?:了)?(\d+|[一二三四五六七八九十百]+)兩/);
 if(m){var n=parseInt(m[1],10);if(isNaN(n))n=({一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100}[m[1].slice(-1)]||10)*(m[1].length>1?10:1);var capg=SET.decld!==false?100:500;var got=Math.min(n,capg);Inv.gold(got);say('（作者設定）你得到了'+got+'兩銀子。'+(got<n?'（宣告調整：單次上限 '+capg+' 兩）':''));return out;}
 m=x.match(/^我(?:是|其實是|乃)(.{1,12})$/);
 if(m){var who=m[1];FW.add(me.n+'其實是'+who,[S.pc],S.pc,{secret:1,kw:[who.slice(-2)]});me.notes.declId=who;say('（作者設定，秘密）你真正的身分是：'+who+'。此事只有你自己知道——除非你說出口。');return out;}
 FW.add(x,[],S.pc,{pub:1});say('（作者設定，從此成為事實）'+x);return out;};
Decl.NEG=/莫非|荒唐|不可能|錯覺|並非如此|只是幻想|只是個夢|胡思亂想|不過是想像/;
Decl.verify=function(r,d){if(SET.decld===false&&!Decl.NEG.test(r.scene))return null;if(Decl.NEG.test(r.scene))return d.off();return null;};
/* ===== 主入口（M24 說話／指令／設定分流） ===== */
var Input={};
Input.mode=function(){return SET.inmode||'say';};
Input.split=function(t,mode){var o={mode:mode,t:t,say:'',act:''};var pre=[[/^[\/／](?:設定|劇情|宣告|旁白)[:：\s]*/,'decl'],[/^【指令】|^[\/／](?:指令|行動|命令|身份|身分)[:：\s]*|^#\s*/,'cmd'],[/^[\/／]說[:：\s]*/,'say']];
 for(var i=0;i<pre.length;i++)if(pre[i][0].test(t)){o.mode=pre[i][1];o.t=t.replace(pre[i][0],'');break;}
 if(o.mode!=='decl'){var pm=o.t.match(/^[（(]([^）)]+)[）)]\s*(.*)$/);if(pm){o.act=pm[1];o.say=pm[2];o.mode=pm[2]?'mix':'cmd';o.t=pm[2]?o.t:pm[1];}}
 if(o.mode==='cmd'){var qm=o.t.match(/^我?對(.{1,6}?)說[:：]?\s*「?([^」]+)」?$/);if(qm){o.mode='say';o.to=People.idByName(qm[1]);o.t=qm[2];}else if(/^「[^」]+」$/.test(o.t)){o.mode='say';o.t=o.t.replace(/^「|」$/g,'');}}
 if(o.mode==='say'){var qm2=o.t.match(/^我?對(.{1,6}?)說[:：]?\s*「?([^」]+)」?$/);if(qm2){o.to=People.idByName(qm2[1]);o.t=qm2[2];}}
 return o;};
Input.target=function(o){var here=People.present();if(o.to&&P(o.to)&&P(o.to).alive){var w=People.where(o.to);if(w===S.place||here.indexOf(o.to)>=0)return o.to;}
 var nm='';for(var id in S.ppl){var p=S.ppl[id];if(id!==S.pc&&p.alive&&p.n.length>=2&&o.t.indexOf(p.n)>=0&&here.indexOf(id)>=0)nm=id;}if(nm)return nm;
 if(S.focus&&here.indexOf(S.focus)>=0)return S.focus;return here[0]||'';};
Input.submit=function(raw){var t=String(raw||'').trim();if(!t||!S)return null;var o=Input.split(t,Input.mode());t=o.t;if(!t&&!o.act)return null;
 var id=Input.target(o);if(id)Eng.keep(id);var me=pc();
 S.back.push({sp:'p',t:({say:'',cmd:'〔指令〕',decl:'〔設定〕',mix:'〔行動〕'}[o.mode]||'')+(o.act?'（'+o.act+'）':'')+(o.mode==='mix'?o.say:t)});if(S.back.length>80)S.back.shift();
 var tag,off,extra='',req={type:'free',text:t,id:id};
 if(o.mode==='decl'){var d=Decl.apply(t);if(d.focus){id=d.focus;S.focus=id;}tag='設定・劇情';extra='（此設定已在遊戲中成真：'+d.lines.join(' ')+'；請直接延續，不得否定）';
  off=function(){return Eng.L(d.lines.concat(id&&P(id)&&P(id).alive?[[id,Speak.reply(id,t)]]:[]),id,S.place,Input.backCh(id));};d.off=off;req.decl=d;}
 else if(o.mode==='cmd'||o.mode==='mix'){var src=o.mode==='mix'?o.act:t;var idc=Idn.parse(src,'cmd');
  if(idc){var err=Idn.apply(idc);tag='指令・身份';var resI=err?'（身分未變）'+err:'（身分變更）'+cn(idc.by)+'親口准許——你如今是'+(pc().title||idc.to)+'。';extra='（身分處理結果：'+resI+'）';off=function(){return Eng.L([resI],idc.by,S.place,Input.backCh(idc.by));};}
  else{var nc=Ncmd.parse(src);
  if(nc){var res=Ncmd.exec(nc);if(nc.tgt&&nc.tgt!==S.pc&&P(nc.tgt)&&!P(nc.tgt).jailed)id=nc.tgt;tag='指令・命令';extra='（命令已執行：'+res+'。該人物必須真的照辦。）';off=function(){return Eng.L([res],id,S.place,Input.backCh(id));};nc.off=off;req.cmd=nc;if(S.flags.held===S.day&&nc.ok&&nc.tgt===S.pc){return Eng.L([res],'', 'yamen',[ch('……','held')]);}}
  else{var ar=Act.parse(src);var resA=null;if(ar&&!id&&!ar.solo)resA='你環顧四周——此刻身邊沒有人。';else if(ar)resA=ar.f(id,src);if(resA&&resA.go)return resA;tag='指令・行動';
   if(!resA){resA='你'+src.replace(/^我/,'')+'。'+(id?cn(id)+'看著你，若有所思。':'');Eng.pass(1);}var act={k:ar?ar.k:'free',res:resA,ok:!!(ar&&ar.ok)};
   extra='（行動結果：'+resA+'）';off=function(){var L=[resA];if(o.mode==='mix'&&o.say&&id){L.push(['p',o.say]);L.push([id,Speak.reply(id,o.say)]);}return Eng.L(L,id,S.place,Input.backCh(id));};act.off=off;req.act=act;
   if(o.mode==='mix'&&o.say){if(id)Recall.said(id,o.say);req.text='（'+o.act+'）'+o.say;extra+='（隨後主角說：「'+o.say+'」——這句是對白，只需回應）';}}}}
 else{tag='對白';if(id){var p=P(id);Recall.said(id,t);if(!p.talked){People.rel(id,{aff:2});p.talked=1;}
   FW.secretsOf().forEach(function(f){if(f.kw&&f.kw.some(function(w){return t.indexOf(w)>=0;})&&f.kn.indexOf(id)<0){Seal.told(id,f);toast('🔏 '+cn(id)+'得知了你的秘密（會替你守口如瓶）');}});}
  off=function(){return Eng.L(id?[['p',t],[id,Speak.reply(id,t)]]:[['p',t],'你的話散在風裡，無人回應。'],id,S.place,Input.backCh(id));};}
 req.tag=tag;req.extra=extra;req.id=id;
 if(AI.ready()){S.pend={text:t,id:id,d:S.day};return {async:req,fb:off};}
 return off();};
Input.backCh=function(id){var c=[];if(id&&P(id)&&P(id).alive)c.push(ch('💬 與'+cn(id)+'交談','talk',{id:id}));c.push(ch('↩ 行動選單','place'));c.push(ch('🗺 地圖','map'));return c;};
