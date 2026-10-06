/* ===== 劇情：開場、地點、角色互動、里程碑、章節事件、節日、修羅場、結局（離線劇本；AI 可接手潤色與自由互動） ===== */
(function(){
 var P=function(){return S.p.name;};
 function ch(t,go,a,o){var c={t:t,go:go||'hub'};if(a)c.a=a;if(o)for(var k in o)c[k]=o[k];return c;}
 window.ch=ch;
 /* ---------- 開場 ---------- */
 NODES.start=function(){S.place='clinic';
  return Eng.L(['青囊谷的晨霧散得很慢。',
   '師父青囊子把一只舊藥箱交到你手中——箱角刻著一個小小的「囊」字。',
   ['','「'+P()+'，為師能教的，都教給你了。」'],
   '他咳了兩聲，又從袖中取出一卷以蠟封口的帛書：「這卷禁方，非到萬不得已，莫要示人。」',
   '你跪下，向師父磕了三個頭。',
   '七日後，你背著藥箱，走進了咸陽城。'],'', 'title',[ch('走進咸陽','prologue2')]);};
 NODES.prologue2=function(){S.place='market';
  return Eng.L(['咸陽市集人聲鼎沸，糖人、竹簡、藥材，琳瑯滿目。',
   '忽然人群一陣騷動——一匹驚馬撞翻了攤子，一名白袍銀甲的年輕將軍飛身勒馬，左肩卻滲出了血。',
   ['mengtian','「都退開！別傷著人——嘶……」','normal'],
   '他咬著牙，按住肩頭。血順著銀甲的縫隙往下淌。',
   ['p','（是舊傷崩裂。）你放下藥箱，撥開人群走了過去。']],'mengtian','market',
   [ch('🩺「將軍別動，我是大夫。」','meetMt',{how:'help'}),ch('🤔 先觀察，再上前','meetMt',{how:'watch'})]);};
 NODES.meetMt=function(a){var c=S.c.mengtian;c.met=1;Eng.c('mengtian',{aff:a.how==='help'?10:5,trust:a.how==='help'?6:3},'在市集被'+P()+'救治肩傷');
  Eng.p({fame:3,med:1});FW.add('蒙恬左肩有舊箭傷',['mengtian'],'mengtian');
  return Eng.L([['mengtian','「你……是大夫？這麼年輕？」','normal'],
   '你沒有答話，只俐落地止了血，敷上金創藥，再以銀針封住穴位。',
   ['mengtian','「……不疼了？」他愣愣地看著你，忽然笑開，露出一顆小虎牙，「我叫蒙恬！姑娘怎麼稱呼？」','smile'],
   ['p','「'+P()+'。城南新開的青囊醫館，將軍若肩痛，可來複診。」'],
   ['mengtian','「一定去！」他把一個剛買的糖人塞進你手裡，「謝禮，先欠著。」','smile'],
   '你看著手裡歪歪扭扭的糖人，忍不住笑了。','——這是你在咸陽遇見的第一個人。'],'mengtian','market',[ch('前往醫館','introClinic')]);};
 NODES.introClinic=function(){S.place='clinic';Eng.pass(1);
  return Eng.L(['你在城南賃下一間小鋪，掛上「青囊醫館」的木匾。','藥櫃一格格排開，藥香漸漸盈滿了屋子。',
   '【目標】在咸陽行醫、打響名聲（名聲達 10），自然會有貴人找上門來。',
   '小提示：點「地圖」前往各處；在醫館「坐診」可問診賺取名聲；遇見的人會記住你們之間的每一件事。'],'','clinic',[ch('開始在咸陽的日子','hub')]);};
 /* ---------- 地點 ---------- */
 NODES.go=function(a){var pl=a.pl;if(!Eng.unlocked(pl))return Eng.L(['那裡現在還去不了。'],'',S.place,[ch('返回地圖','hub')]);
  if(PLACES[pl].night&&S.per<3){return Eng.L(['夜色庭院只在入夜後才有人。要等到夜裡嗎？'],'',S.place,[ch('🌙 等到入夜再去','goNight',{pl:pl}),ch('返回地圖','hub')]);}
  if(S.place!==pl){S.focusAt=null;CHAR_ORDER.forEach(function(id){var r=S.c[id];if(r.here&&r.here.pl===S.place)r.here=null;});}S.place=pl;return NODES.place({});};
 NODES.goNight=function(a){while(S.per<3)Eng.pass(1);S.place=a.pl;return NODES.place({});};
 NODES.place=function(){var pl=S.place,Pl=PLACES[pl];var here=Eng.present(pl);
  var ls=[Pl.n+'·'+perName()+'。'+Pl.d];var cs=[];
  if(S.c.xuanye&&pl==='courtyard'&&S.flags.xy_open&&!S.c.xuanye.met)return NODES.meet({id:'xuanye'});
  here.forEach(function(id){var r=S.c[id];if(!r.met){cs.push(ch('👤 '+CHARS[id].sub,'meet',{id:id}));}else cs.push(ch('💬 '+CHARS[id].n+'（'+Mood.feel(id)+'）','talk',{id:id}));});
  if(here.length)ls.push(here.map(function(id){return S.c[id].met?CHARS[id].n+'在這裡。':'那裡站著一位'+CHARS[id].sub+'。';}).join(''));else ls.push('此刻這裡沒有熟悉的身影。');
  if(pl==='clinic'){cs.push(ch('🩺 坐診問診','diag'),ch('⚗️ 製藥','craft'),ch('🛏 歇息（回復心境）','rest'));}
  if(pl==='market'){cs.push(ch('🛍 逛市集買東西','shop'),ch('🌿 採買草藥','herb'));}
  if(pl==='plum'){cs.push(ch('🌸 折一枝梅','plumPick'),ch('🌿 林間採藥','herb'));}
  if(S.ch===2&&!S.flags.poison_solved&&(pl==='market'||pl==='study'||pl==='courtyard')&&!S.flags['clue_'+pl])cs.unshift(ch('🔍 調查安神香的線索','clue',{k:pl}));
  if(S.ch===2&&!S.flags.poison_solved&&pl==='palace'&&['market','study','courtyard'].every(function(x){return S.flags['clue_'+x];}))cs.unshift(ch('⚖️ 向秦王指認真兇','accuse'));
  if(pl==='camp'&&!here.length)cs.push(ch('🩹 為傷兵義診','campAid'));
  if(pl==='tavern')cs.push(ch('🍶 聽筑飲酒','tavernSit'));
  cs.push(ch('🗺 返回地圖','hub'));
  return Eng.L(ls,here[0]||'',Pl.bg==='night'?'courtyard':pl,cs,{placeView:1});};
 /* ---------- 初遇 ---------- */
 var MEET={
  lisi:[['','梅林深處，一位青衣男子正獨自對著殘局，指尖拈著一枚白子。'],['lisi','「姑娘看了半晌，可看出這一局的生路？」','smile'],['p','「白子看似被圍，其實東南角還有一口氣。」'],['lisi','他微微一怔，隨即笑意更深：「在下李斯，上蔡人，客居秦國。姑娘好眼力。」','smile'],['','他笑得溫和，可那雙眼睛，像在掂量你值幾兩。']],
  jingke:[['','酒肆裡筑聲正酣，一個落拓劍客醉臥長凳，酒罈滾到了你腳邊。'],['jingke','「哎——姑娘，撿到便是緣分，賞臉喝一碗？」','smile'],['p','「你酒後胸悶，唇色發紫，再喝下去會出事。」'],['jingke','他眨了眨眼，忽然大笑：「有意思！荊軻浪跡半生，頭一回被人當面說要死了。」','smile'],['','他把酒碗推到你面前——卻沒有再往自己碗裡倒。']],
  yingzheng:[['','章台殿深，燭影搖紅。玄袍金冠的青年從竹簡堆中抬起頭。'],['yingzheng','「你就是那個女醫？……太年輕了。」','normal'],['p','「醫術不看年紀。大王頭痛幾年了？」'],['yingzheng','他的目光冷了一瞬，又落回你的藥箱上：「……七年。」','normal'],['','殿中侍者皆屏住了呼吸——敢這樣問秦王的人，你是第一個。']],
  fusu:[['','蘭台書房，白狐裘的公子正對著一卷殘簡輕咳。'],['fusu','「抱歉，失禮了。」他溫和地向你頷首，「在下扶蘇。姑娘是父王召來的醫者？」','smile'],['p','「公子手足冰涼，咳聲帶寒，是先天寒症吧。」'],['fusu','他愣了愣，把暖手爐遞給你：「書房冷，姑娘先暖暖手。我的病……不急。」','smile'],['','他總是這樣，先顧著別人。']],
  hanfei:[['','雨打蘭台，一位墨衣公子獨坐窗下，筆走如飛。'],['hanfei','「你、你是……」他放下筆，耳根微紅，「在、在下韓非。」','shy'],['p','「我聽過公子的書。〈孤憤〉〈五蠹〉，字字如刀。」'],['hanfei','他沉默許久，低聲道：「……很少有人，聽、聽我說完一句話。」','sad'],['','你把一杯溫水推到他手邊：「那我等你說完。」']],
  mengtian:[['mengtian','「是你！」蒙恬笑著跑過來，「肩膀好多了，我正想去醫館找你。」','smile']],
  xuanye:[['','月色下，一道黑影自牆頭掠過。你腳下一滑，眼看就要跌進池中——'],['','一隻手穩穩扣住了你的腰。'],['xuanye','「……小心。」','normal'],['','銀髮，黑巾覆面。他放開你，退後兩步，像是隨時要融進夜色。'],['p','「你一直在跟著我？」'],['xuanye','「……奉命。」他頓了頓，「但方才那一下，不是命令。」','normal']]
 };
 NODES.meet=function(a){var id=a.id,r=S.c[id];r.met=1;var L0=MEET[id]||[['',CHARS[id].n+'向你點頭致意。']];
  Eng.c(id,{aff:5,trust:2},'初識'+P());Meta.get().seen[id]=1;Meta.save();Eng.pass(0);
  if(id==='xuanye'){FW.add('玄夜奉相邦之命監視'+P(),['xuanye'],'xuanye');}
  return Eng.L(L0.map(function(x){return [x[0],x[1],x[2]];}),id,S.place,[ch('💬 繼續交談','talk',{id:id}),ch('🗺 告辭','hub')]);};
 /* ---------- 互動選單 ---------- */
 NODES.talk=function(a){var id=a.id,c=CHARS[id],r=S.c[id];S.focus=id;Eng.keep(id);
  var g=greet(id);var cs=[ch('🗨 閒聊','chat',{id:id,topic:'近況'}),ch('🎯 問他的心願','chat',{id:id,topic:'目標'}),ch('🎁 送禮','giftMenu',{id:id})];
  if(r.trust>=35&&r.sec<1)cs.push(ch('🕯 探問心結','chat',{id:id,topic:'心結'}));
  if(!r.cured)cs.push(ch('🩺 為他診脈（'+c.ail+'）','cure',{id:id}));
  cs.push(ch(r.aff>=20?'🌸 邀他同遊':'🌸 邀他同遊（好感 20 解鎖）',r.aff>=20?'dateMenu':'talk',{id:id}));
  cs.push(ch('🗺 告辭','place'));
  return Eng.L([[id,g,exprOf(id)]],id,S.place,cs,{talk:id});};
 function exprOf(id){var r=S.c[id];if(r.jeal>=40)return 'angry';if(r.heart>=55)return 'blush';if(r.aff>=25)return 'smile';return 'normal';}
 Eng.exprOf=exprOf;
 var GREET={
  yingzheng:{平淡:'「何事。」',友善:'「你來了。坐。」',親近:'「今日頭不疼。……大概是你的香囊。」',心動:'「寡人等你很久了。」他頓了頓，「……說笑的。」',傾心:'「過來，讓我看看你。」',深愛:'「你在，我便睡得著。」',疏遠:'「退下。」'},
  mengtian:{平淡:'「大夫！」',友善:'「'+'今天也來看我練槍嗎？」',親近:'「我、我剛好路過……真的！」',心動:'「看到你，我就忘了自己要說什麼了。」',傾心:'「等北疆平定，我有話想對你說。」',深愛:'「你是我想守護的天下。」',疏遠:'「……哦。」'},
  lisi:{平淡:'「姑娘有何見教？」',友善:'「又見面了，今日可要再對一局？」',親近:'「在你面前，我總是不小心多說幾句真話。」',心動:'「我算得盡天下人心，唯獨算不準你。」',傾心:'「別對旁人笑得這樣好看。」',深愛:'「這天下我要算計，唯獨你，我認輸。」',疏遠:'「姑娘請自便。」'},
  fusu:{平淡:'「姑娘安好。」',友善:'「今日天冷，姑娘可帶了手爐？」',親近:'「與你說話，總覺得書房也暖了些。」',心動:'「我新譜了一首曲子……想先彈給你聽。」',傾心:'「若有來日，我想與你看太平盛世。」',深愛:'「你是我寒冬裡唯一的春天。」',疏遠:'「……抱歉，我有些乏了。」'},
  hanfei:{平淡:'「……你、你好。」',友善:'「你來了。我、我寫了新的一篇。」',親近:'「和你說話，我、我不太結巴了。」',心動:'「我想、想把你寫進書裡。」',傾心:'「別走。……再、再待一會兒。」',深愛:'「我這一生的字，都想寫給你。」',疏遠:'「……」'},
  jingke:{平淡:'「喲，小大夫。」',友善:'「來，今天我請客——喝水，聽你的。」',親近:'「你一來，這酒肆都亮了。」',心動:'「我這種人，本不該動心的。」',傾心:'「跟我走吧，天涯海角。」',深愛:'「為了你，我想活下去。」',疏遠:'「……走吧，別管我。」'},
  xuanye:{平淡:'「……」',友善:'「你又一個人走夜路。」',親近:'「……玄夜。我記得這個名字。」',心動:'「你受傷的時候，我比自己受傷還痛。」',傾心:'「我不想再只是影子。」',深愛:'「我是你的人。只是你的。」',疏遠:'「……退後。」'}
 };
 function greet(id){var f=Mood.feel(id);return (GREET[id]&&GREET[id][f])||'「……」';}
 /* ---------- 閒聊 ---------- */
 var CHAT={
  近況:{yingzheng:['「六國未平，寡人睡不著。」','「今日又批了一百二十斤竹簡。」','「呂相今日又在朝上說了很多。寡人都記著。」'],mengtian:['「今天操練，我一個人挑翻了十個！」','「北疆的雪，比咸陽大多了。」','「父親又罵我了……說我心太軟。」'],lisi:['「近日朝中風向微妙，姑娘出入宮禁，要多留心。」','「我新得了一幅字帖，可惜無人共賞。」','「這一局棋，我下了三年。」'],fusu:['「我在讀〈詩〉。〈蒹葭〉那一篇，總讓我想起……」','「今日又咳了，不礙事。」','「民間的話本，比宮裡的奏疏有意思。」'],hanfei:['「我、我在寫〈說難〉。說服人，真難。」','「韓國……又送信來了。」','「雨夜最好，沒人來打擾。」'],jingke:['「昨夜和高漸離喝到天亮，他擊筑，我唱歌。」','「最近總有人跟著我。」他笑，「大概是仰慕者。」','「劍要磨，酒要喝，人生苦短嘛。」'],xuanye:['「今夜無事。」','「相邦府……沒什麼可說的。」','「你今天在市集多看了那支簪子三眼。」']},
  目標:{yingzheng:'「天下。」他看著你，「一統天下，終結亂世。這條路上，寡人不需要同情。」',mengtian:'「守住北疆！讓那些村子的孩子，不用再怕胡人的馬蹄聲。」',lisi:'「位極人臣。」他笑，「姑娘覺得我俗？可我見過廁中鼠與倉中鼠，便再也不想做前者。」',fusu:'「我想讓父王看見，治天下，不只有嚴刑峻法一條路。」',hanfei:'「保、保全韓國。還有……讓我的書，有人讀懂。」',jingke:'「士為知己者死。」他把劍往桌上一拍，又笑了，「說笑的——大概。」',xuanye:'「……沒有。影子沒有心願。」他停了停，「若有，大概是……為自己活一次。」'},
  心結:{yingzheng:'他沉默很久，終於開口：「邯鄲。小時候在邯鄲為質，夜裡總有人往窗裡扔石頭。……後來，我便不太睡得著了。」',mengtian:'「我……違過軍令。為了回去救一個村子。父親至今不肯原諒我。」他低頭，「可我不後悔。」',lisi:'「我曾是上蔡一個小吏。」他第一次沒有笑，「那些看不起我的眼神，我一個都沒忘。」',fusu:'「我寫了很多諫書，一封也不敢呈給父王。」他苦笑，「我怕他失望，更怕……他根本不看。」',hanfei:'「我入秦，身、身負韓王密令。」他握緊筆，「我知道，此行……九死一生。」',jingke:'他放下酒碗，眼神忽然清醒得可怕：「燕太子丹，於我有知遇之恩。有一件事，我答應了他。」',xuanye:'「相邦命我監視你。」他低聲道，「每一份回報，我都改過。」'}
 };
 NODES.chat=function(a){var id=a.id,r=S.c[id],t=a.topic;var line;Eng.pass(1);
  if(t==='近況'){line=pick(CHAT.近況[id]);if(!r.talked){Eng.c(id,{aff:3},'和'+P()+'閒聊');r.talked=1;}}
  else if(t==='目標'){line=CHAT.目標[id];if(!r.goalKnown){r.goalKnown=1;Eng.c(id,{aff:2,trust:3},'向'+P()+'說起心願');}}
  else{line=CHAT.心結[id];r.sec=1;Eng.c(id,{trust:6,heart:4},'向'+P()+'吐露心結');FW.add(CHARS[id].secret,[id],id);Mood.note(id,'把心結告訴了'+P());}
  if(AI.ready()&&t!=='心結'){return aiScene({type:'talk',id:id,topic:t,extra:'（離線參考台詞：'+line+'）'},function(){return chatScene(id,line,t);});}
  return chatScene(id,line,t);};
 function chatScene(id,line,t){var ex=t==='心結'?'sad':exprOf(id);return Eng.L([[id,line,ex]],id,S.place,[ch('💬 繼續','talk',{id:id}),ch('🗺 告辭','place')]);}
 /* ---------- 送禮 ---------- */
 NODES.giftMenu=function(a){var id=a.id;var cs=[];for(var k in S.inv){if(ITEMS[k]&&ITEMS[k].k!=='mat'&&S.inv[k]>0)cs.push(ch('🎁 '+ITEMS[k].n+' ×'+S.inv[k],'gift',{id:id,k:k}));}
  if(!cs.length)return Eng.L(['你翻了翻藥箱——沒有可以送的東西。去市集逛逛，或在醫館製藥吧。'],id,S.place,[ch('↩ 返回','talk',{id:id})]);
  cs.push(ch('↩ 返回','talk',{id:id}));return Eng.L([['','要送'+CHARS[id].n+'什麼？']],id,S.place,cs);};
 NODES.gift=function(a){var id=a.id,k=a.k,c=CHARS[id],r=S.c[id],it=ITEMS[k];Eng.item(k,-1);Eng.pass(1);r.gifts++;
  var like=c.likes.indexOf(it.n)>=0,line,ex;
  var med=(k==='sachet'&&id==='yingzheng')||(k==='salve'&&(id==='mengtian'||id==='xuanye'))||(k==='pill'&&id==='hanfei')||(k==='warmer'&&id==='fusu');
  if(like||med){Eng.c(id,{aff:8,heart:4,trust:2},'收到'+P()+'送的'+it.n+'，很喜歡');line=GIFT_LIKE[id];ex='blush';}
  else if(r.gifts>3&&rand()<0.3){Eng.c(id,{aff:1},'又收到'+it.n);line='「你總是送我東西……」他無奈地笑了笑，「下次，人來就好。」';ex='smile';}
  else{Eng.c(id,{aff:3},'收到'+P()+'送的'+it.n);line='「多謝。」'+c.n+'收下了'+it.n+'，看不出喜不喜歡。';ex='normal';}
  /* 吃醋：在場有心動者 */
  var jl=[];Eng.present().forEach(function(o){if(o!==id&&S.c[o].heart>=25){S.c[o].jeal=clamp(S.c[o].jeal+10,0,100);UI.pop(o,'jeal',10);jl.push(CHARS[o].n);}});
  var L0=[[id,line,ex]];if(jl.length)L0.push(['',jl.join('、')+'在一旁看著，神色有些複雜。']);
  return Eng.L(L0,id,S.place,[ch('💬 繼續','talk',{id:id}),ch('🗺 告辭','place')]);};
 var GIFT_LIKE={yingzheng:'他把東西握在手裡很久，才低聲道：「……寡人收下了。」耳根卻有些紅。',mengtian:'「哇！你怎麼知道我喜歡這個！」他笑得像個孩子。',lisi:'「姑娘竟記得我的喜好。」他輕笑，「這可不好——我會當真的。」',fusu:'「這太貴重了……」他小心地收好，「我會珍惜的。」',hanfei:'「謝、謝謝。」他低著頭，把東西貼在胸口。',jingke:'「知我者，小大夫也！」他大笑，眼底卻有一瞬的溫柔。',xuanye:'他沉默地接過，指尖微微發抖：「……從來沒有人送過我東西。」'};
 /* ---------- 約會 ---------- */
 NODES.dateMenu=function(a){var id=a.id;var cs=PLACE_ORDER.filter(function(pl){return Eng.unlocked(pl)&&pl!=='clinic';}).map(function(pl){return ch('📍 '+PLACES[pl].n+(DATE_FAV[id]===pl?' ♥':''),'date',{id:id,pl:pl});});
  cs.push(ch('↩ 返回','talk',{id:id}));return Eng.L([['','想和'+CHARS[id].n+'去哪裡？（♥ 是他喜歡的地方）']],id,S.place,cs);};
 var DATE_FAV={yingzheng:'courtyard',mengtian:'camp',lisi:'plum',fusu:'study',hanfei:'courtyard',jingke:'tavern',xuanye:'courtyard'};
 var DATE_Q={yingzheng:['「你可知寡人為何選這裡？」',['因為安靜','因為這裡看得見整座咸陽','因為……有我在？']],mengtian:['「要不要我教你騎馬？」',['好呀！','我怕摔……','你先表演給我看']],lisi:['「若你是我，這一步棋會怎麼走？」',['以退為進','直取中宮','我不下棋，我看你']],fusu:['「這首曲子還沒有名字，你替它取一個吧。」',['春風','蒹葭','就叫它你的名字']],hanfei:['「你、你覺得……我的書，會有人讀懂嗎？」',['我讀懂了','會的，千百年後也會','讀不懂的是他們的損失']],jingke:['「若有一天我不告而別，你會怪我嗎？」',['會，所以別走','不怪，但我會去找你','先把酒戒了再說']],xuanye:['「……你不怕我嗎？」',['不怕','有一點，但更想靠近你','你才是怕我的那個吧']]};
 var DATE_BEST={yingzheng:2,mengtian:0,lisi:2,fusu:2,hanfei:0,jingke:1,xuanye:1};
 NODES.date=function(a){var id=a.id,pl=a.pl,r=S.c[id];S.place=pl;Eng.pass(1);r.dates++;
  var fav=DATE_FAV[id]===pl;var q=DATE_Q[id];
  var sc=Eng.L([['',PLACES[pl].n+'。'+CHARS[id].n+'走在你身側，'+(fav?'神情比平日放鬆許多。':'似乎有些拘謹。')],[id,q[0],fav?'smile':'normal']],id,pl,
   q[1].map(function(t,i){return ch('💗 '+t,'dateEnd',{id:id,pl:pl,i:i,fav:fav?1:0});}));
  if(AI.ready()){return aiScene({type:'date',id:id,place:pl,extra:'（約會中他會問：'+q[0]+'；請以此為核心，choices 給三種回應）'},function(){return sc;});}
  return sc;};
 NODES.dateEnd=function(a){var id=a.id,best=DATE_BEST[id]===a.i;var gain={aff:best?8:4,heart:best?7:3,trust:2};if(a.fav){gain.aff+=3;gain.heart+=2;}
  Eng.c(id,gain,'和'+P()+'在'+PLACES[a.pl].n+'約會'+(best?'，很開心':''));
  CHAR_ORDER.forEach(function(o){if(o!==id&&S.c[o].heart>=30){S.c[o].jeal=clamp(S.c[o].jeal+6,0,100);}});
  var line=best?DATE_HAPPY[id]:'「……嗯。」'+CHARS[id].n+'想了想，輕輕笑了一下。';
  return Eng.L([[id,line,best?'blush':'smile'],['','天色漸晚，你們並肩走回城中。']],id,a.pl,[ch('🗺 返回地圖','hub')]);};
 var DATE_HAPPY={yingzheng:'他怔住，隨即別過臉去：「……放肆。」唇角卻壓不住地上揚。',mengtian:'「好！抓緊我！」他把你抱上馬背，風從耳邊呼嘯而過。',lisi:'他看了你很久，忽然低笑：「這一局，我竟不想贏了。」',fusu:'他的手指停在琴弦上，聲音輕得像雪：「……好。就叫它你的名字。」',hanfei:'「你、你讀懂了？」他眼眶微紅，「那……就夠了。」',jingke:'「不許去找我！」他嚷著，卻偷偷把酒罈推遠了些，「……我不走就是了。」',xuanye:'他沉默很久，然後很輕很輕地，握住了你的指尖。'};
 /* ---------- 診治角色 ---------- */
 NODES.cure=function(a){return {medic:{who:a.id},lines:[{sp:'',t:'你搭上'+CHARS[a.id].n+'的脈……望、聞、問、切，一樣都不能少。'}],focus:a.id,bg:S.place,ch:[]};};
 NODES.cureDone=function(a){var id=a.id,r=S.c[id],c=CHARS[id];Eng.pass(1);
  if(a.ok){r.cured=1;r.hp=95;Eng.c(id,{trust:10,aff:6,heart:3},P()+'治好了'+c.ail);Eng.p({med:2,fame:2});r.knot=1;
   var L0=[['',c.n+'的'+c.ail+'，終於有了起色。'],[id,CURE_THX[id],'blush']];
   if(r.sec<1){r.sec=1;L0.push(['','或許是信任，他第一次對你說起了藏在心底的事——']);L0.push([id,CHAT.心結[id],'sad']);FW.add(c.secret,[id],id);}
   return Eng.L(L0,id,S.place,[ch('💬 繼續','talk',{id:id})]);}
  Eng.c(id,{trust:2},P()+'為我診脈');return Eng.L([['','你的判斷有些偏差，藥方只能暫緩症狀。'],[id,'「無妨。」'+c.n+'看著你，「你已經很用心了。」','smile']],id,S.place,[ch('💬 繼續','talk',{id:id})]);};
 var CURE_THX={yingzheng:'「七年來……寡人第一次一覺到天明。」',mengtian:'「肩膀一點都不疼了！你是神仙嗎！」',lisi:'「姑娘治好了我的胃，卻讓我的心……也不太安分了。」',fusu:'「手……是暖的。」他看著自己的掌心，笑得像春天。',hanfei:'「我、我說話……好像順了一些。謝謝你。」',jingke:'「戒酒七日？」他哀嚎，「……好吧，聽大夫的。」',xuanye:'「……這是第一次，有人替我包紮。」'};
 /* ---------- 醫館 ---------- */
 NODES.diag=function(){var lv=S.p.med>=30?3:(S.p.med>=18?2:1);var pool=CASES.filter(function(c){return c.lv<=lv;});
  if(S.flags.plague&&S.day-S.flags.plague<10)pool=pool.concat(CASES.filter(function(c){return c.lv===2;}));
  var ci=CASES.indexOf(pick(pool));return {medic:{ci:ci},lines:[{sp:'',t:'醫館門口來了一位病人：'+CASES[ci].p+'。'}],bg:'clinic',ch:[]};};
 NODES.diagDone=function(a){var c=CASES[a.ci];Eng.pass(1);
  if(a.score>=2){var fm=a.score===3?3:2;Eng.p({fame:fm,gold:12+c.lv*8,med:1});return Eng.L(['藥到病除！'+c.p+'千恩萬謝地走了。','「青囊醫館的女大夫，神了！」——消息傳得很快。'],'','clinic',[ch('🩺 再看一位','diag'),ch('🗺 返回地圖','hub')]);}
  Eng.p({fame:a.score?1:0,mind:-4});return Eng.L(['你的判斷不太準確，病人的症狀只稍有緩解。','（提示：先看齊所有症狀，再對照病機。）'],'','clinic',[ch('🩺 再看一位','diag'),ch('🗺 返回地圖','hub')]);};
 NODES.craft=function(){var cs=RECIPES.map(function(r){var ok=true,need=[];for(var k in r.need){need.push(ITEMS[k].n+'×'+r.need[k]);if((S.inv[k]||0)<r.need[k])ok=false;}if(S.p.med<r.med)ok=false;
   return ch((ok?'⚗️ ':'🔒 ')+r.n+'（'+need.join('、')+'｜醫術'+r.med+'）',ok?'craftDo':'craft',{id:r.id});});
  cs.push(ch('↩ 返回','place'));return Eng.L(['藥櫃裡：'+invStr()],'','clinic',cs);};
 NODES.craftDo=function(a){var r=RECIPES.filter(function(x){return x.id===a.id;})[0];for(var k in r.need)Eng.item(k,-r.need[k]);Eng.item(r.id,1);Eng.pass(1);Eng.p({med:1});
  return Eng.L(['你細細研磨、熬煮，製成了一份「'+r.n+'」。'],'','clinic',[ch('⚗️ 繼續製藥','craft'),ch('↩ 返回','place')]);};
 function invStr(){var a=[];for(var k in S.inv){if(ITEMS[k]&&S.inv[k])a.push(ITEMS[k].n+'×'+S.inv[k]);}return a.join('、')||'空空如也';}
 Eng.invStr=invStr;
 NODES.rest=function(){Eng.pass(1);Eng.p({mind:12,hp:10});return Eng.L(['你在醫館後院小憩，聽著簷下風鈴，心緒漸漸平靜。'],'','clinic',[ch('🗺 返回地圖','hub')]);};
 NODES.herb=function(){Eng.pass(1);var n=2+rnd(2);Eng.item('herb',n);var rare=rand()<0.25;if(rare)Eng.item('rare',1);
  return Eng.L(['你採得草藥 ×'+n+(rare?'，還意外找到一株珍稀藥材！':'。')],'',S.place,[ch('↩ 返回','place')]);};
 NODES.plumPick=function(){Eng.item('plumsp',1);Eng.pass(1);return Eng.L(['你折下一枝開得正好的梅花，香氣清冽。'],'','plum',[ch('↩ 返回','place')]);};
 NODES.shop=function(){var cs=SHOP.map(function(k){var it=ITEMS[k];return ch(it.n+'　'+it.p+'兩',S.p.gold>=it.p?'buy':'shop',{k:k});});cs.push(ch('↩ 返回','place'));
  return Eng.L(['攤販們熱情吆喝。你有 '+S.p.gold+' 兩銀子。'],'','market',cs,{shop:1});};
 NODES.buy=function(a){var it=ITEMS[a.k];Eng.p({gold:-it.p});Eng.item(a.k,1);toast('購得 '+it.n);return NODES.shop();};
 NODES.campAid=function(){Eng.pass(1);Eng.p({fame:2,med:1});if(S.c.mengtian.met)Eng.c('mengtian',{trust:3},P()+'到軍營為傷兵義診');return Eng.L(['你為幾名傷兵換藥正骨。','老兵們紛紛道謝：「女大夫的手，比咱們的刀還穩！」'],'','camp',[ch('↩ 返回','place')]);};
 NODES.tavernSit=function(){Eng.pass(1);Eng.p({mind:6});var jk=Eng.present('tavern').indexOf('jingke')>=0;if(jk&&S.c.jingke.met)Eng.c('jingke',{aff:2},'和'+P()+'聽筑');
  return Eng.L(['筑聲錚錚，有人在角落低聲唱著燕地的歌。'+(jk?'荊軻舉碗向你示意，碗裡是清水。':'')],jk?'jingke':'','tavern',[ch('↩ 返回','place')]);};
 /* ---------- 里程碑 ---------- */
 var MSS={
  yingzheng:[[['','深夜，章台殿只剩一盞燈。他忽然伸出手腕：「頭又痛了。」'],['','你替他診脈，指尖觸到他的皮膚——冰涼。'],['yingzheng','「……別走。等寡人睡著再走。」','sad'],['','那一夜，秦王第一次在別人面前睡著了。']],
   [['','初雪。你從殿中出來，他忽然把玄色外袍披在你肩上。'],['yingzheng','「咸陽的冬天冷。你若病了，誰來醫寡人？」','normal'],['p','「大王是在關心我？」'],['yingzheng','「……是又如何。」','blush']],
   [['','章台月下。他屏退左右，第一次自稱「我」。'],['yingzheng','「天下我要，你，我也要。」他握住你的手，「留下來。我需要你。」','blush'],['','你聽見他的心跳，和你的一樣快。']]],
  mengtian:[[['mengtian','「給！」他獻寶似地遞上一個糖人——捏的是你的樣子，歪歪扭扭。','smile'],['mengtian','「我、我學了三天……不像嗎？」','shy'],['','你笑得停不下來。他也跟著笑了。']],
   [['','北原。他帶你策馬，風從耳邊呼嘯而過。'],['mengtian','「抓緊我！」','smile'],['','你環住他的腰，聽見他悶悶地說：「……其實我心跳得好快。」']],
   [['mengtian','「我要去北疆了。」他第一次這麼認真地看著你。','normal'],['mengtian','「等我回來——我想娶你。」','blush'],['','銀甲下，他的心跳隔著鐵片傳了過來。']]],
  lisi:[[['','梅下對弈。他執黑，你執白，梅花落在棋盤上。'],['lisi','「姑娘每一步都出乎我的意料。」','smile'],['lisi','「……我很久沒有這麼開心了。」他說完，自己先愣住了。','shy']],
   [['','深夜書房。你推門進去，他沒有笑。'],['lisi','「別看我。我現在……大概很難看。」','sad'],['p','「不難看。這樣的你，才是真的你。」'],['','他沉默很久，把額頭輕輕靠在你肩上。']],
   [['lisi','他把一枝梅放在你掌心。','normal'],['lisi','「這天下我都要算計。唯獨你——我認輸。」','blush']]],
  fusu:[[['fusu','他把暖手爐遞給你，自己的手卻冰涼。','smile'],['p','「公子自己呢？」'],['fusu','「我……看你暖著，就不冷了。」','shy']],
   [['','他為你彈了一首曲子。曲到一半，停了。'],['fusu','「後面還沒寫。」他抬頭看你，「我想等……更了解你之後，再寫完它。」','blush']],
   [['','大雪。他站在梅樹下，白裘落滿了雪。'],['fusu','「若有來日，我想與你看太平盛世。」','blush'],['fusu','「你……願意等我嗎？」','shy']]],
  hanfei:[[['','他遞給你一片竹簡，上面只有兩個字——你的名字。'],['hanfei','「我、我練了很多遍……」','shy']],
   [['','雨夜長談。你們從〈孤憤〉談到〈說難〉，從韓國談到天下。'],['','那一夜，他一個字也沒有結巴。'],['hanfei','「原來……我也可以好好說話。」','smile']],
   [['hanfei','「我、我想……」他深吸一口氣，「與你同著一部書。一輩子。」','blush']]],
  jingke:[[['jingke','他把酒碗推到你面前，裡面是清水。','smile'],['jingke','「聽大夫的。」他眨眨眼，「我這人，從不聽人勸——你是第一個。」','smile']],
   [['','高漸離擊筑，荊軻為你而歌。'],['jingke','「風蕭蕭兮……算了，這句不吉利。」他笑著改了詞，「風暖暖兮，有佳人兮。」','blush']],
   [['jingke','「我答應過太子丹一件事。」他第一次沒有笑。','sad'],['jingke','「可是遇見你之後……我想為自己活下去。」','blush']]],
  xuanye:[[['','你遇險時，他從暗處接住了你。'],['xuanye','「……不要再一個人走夜路。」','normal']],
   [['p','「我叫你玄夜，好不好？」'],['','他愣了很久很久。'],['xuanye','「……玄夜。」他低聲重複，像在確認這兩個字的溫度，「好。」','shy']],
   [['','他摘下了黑巾。月光下，是一張年輕而蒼白的臉。'],['xuanye','「我不是影子了。」他說，「我是你的人。」','blush']]]
 };
 NODES.ms=function(a){var id=a.id,r=S.c[id];var st=r.stage;var script=MSS[id][st];r.stage=st+1;var cg=CGS[id][st];Eng.cg(cg.id);
  Mood.note(id,'與'+P()+'：'+cg.n);addLog('〔心動〕'+CHARS[id].n+'·'+cg.n);Letters.send(id,'ms'+(st+1));
  if(st===1)Eng.c(id,{trust:3});
  var sc=Eng.L(script.map(function(x){return [x[0],x[1],x[2]];}),id,'',[ch('✨ 收進回憶','msEnd',{id:id,cg:cg.id})],{cg:cg.id,msTitle:CHARS[id].n+' · '+cg.n});
  sc.bg={yingzheng:['courtyard','palace','courtyard'],mengtian:['market','camp','plum'],lisi:['plum','study','plum'],fusu:['study','study','plum'],hanfei:['study','courtyard','study'],jingke:['tavern','tavern','courtyard'],xuanye:['courtyard','courtyard','plum']}[id][st];
  return sc;};
 NODES.msEnd=function(a){UI.cgShow(a.cg,function(){UI.go('hub');});return {wait:1};};
 /* ---------- 主線事件 ---------- */
 NODES.evSummon=function(){S.evseen.summon=1;Eng.setCh(1);S.flags.palace_ok=1;
  var hasLs=S.c.lisi.met;S.c.lisi.met=1;
  return Eng.L([['','你的名聲傳進了宮裡。這日清晨，一位青衣客卿親自來到醫館。'],['lisi',hasLs?'「又見面了，'+P()+'姑娘。這次，是大王要見你。」':'「在下李斯。大王頭風久治不癒，聽聞姑娘妙手，特命在下相請。」','smile'],
   ['lisi','「宮中規矩多，姑娘行事……要多留一個心眼。」他說得溫和，眼神卻意味深長。','normal'],['','【第二章】咸陽宮、蘭台書房已開放。']],'lisi','clinic',[ch('入宮覲見秦王','go',{pl:'palace'})]);};
 NODES.evPoison=function(){S.evseen.poison=1;Eng.setCh(2);S.flags.xy_open=1;
  return Eng.L([['','秦王的頭風忽然加重，夜裡驚醒時竟嘔出黑血。'],['','你查驗殿中的安神香——香灰裡，摻著一味不該有的「斷腸草」。'],['yingzheng','「查。」他按著額角，聲音冷得像冰，「寡人只信你。」','angry'],
   ['','【第三章】查出香中之毒的來歷：在市集、蘭台書房與夜色庭院尋找線索（集齊 3 條即可指認）。']],'yingzheng','palace',[ch('開始調查','hub')]);};
 /* 線索：在對應地點出現選項 */
 NODES.clue=function(a){var k=a.k;S.flags['clue_'+k]=1;Eng.pass(1);var txt={market:'藥販回憶：前些日子，有位相邦府的管事買走了大量斷腸草。',study:'蘭台的出入簿上，香料的經手人一欄被人刮去了名字——墨跡卻還在背面滲著。',courtyard:'月下，玄夜遞給你一片燒剩的香包：「相邦府的。……你沒見過我。」'}[k];
  if(k==='courtyard'){S.c.xuanye.met=1;Eng.c('xuanye',{aff:4,trust:4},'暗中把線索交給'+P());}
  var n=['market','study','courtyard'].filter(function(x){return S.flags['clue_'+x];}).length;
  var cs=[ch('🗺 返回地圖','hub')];if(n>=3)cs.unshift(ch('⚖️ 向秦王指認真兇','accuse'));
  return Eng.L(['【線索 '+n+'/3】'+txt],k==='courtyard'?'xuanye':'',k==='courtyard'?'courtyard':k,cs);};
 NODES.accuse=function(){return Eng.L([['yingzheng','「說吧。是誰？」','normal']],'yingzheng','palace',[ch('指認：相邦府的人','accuseDo',{w:'lv'}),ch('指認：李斯','accuseDo',{w:'lisi'}),ch('指認：宮中香官','accuseDo',{w:'xiang'})]);};
 NODES.accuseDo=function(a){S.flags.poison_solved=1;
  if(a.w==='lv'){Eng.c('yingzheng',{trust:12,aff:6},P()+'查出香中毒的真相');Eng.p({fame:5});S.flags.poison_right=1;WS.log('秦王徹查安神香案，相邦府數名管事下獄','起因：'+S.p.name+'查得斷腸草購買與經手證據','消息');
   return Eng.L([['yingzheng','他看著你呈上的證據，久久不語。','normal'],['yingzheng','「……呂不韋。」他念這三個字時，像在咀嚼一塊冰。','angry'],['yingzheng','「你做得很好。從今日起，你可自由出入章台。」','smile']],'yingzheng','palace',[ch('繼續','hub')]);}
  Eng.c('yingzheng',{trust:-6},'冤枉了無辜之人');if(a.w==='lisi')Eng.c('lisi',{aff:-12,trust:-10},P()+'在王前指認我');
  return Eng.L([['yingzheng','「證據不足。」他冷冷道，「你讓寡人失望了。」','angry'],['','真兇逍遙法外——但事情總算暫時平息。']],'yingzheng','palace',[ch('繼續','hub')]);};
 NODES.evStorm=function(){S.evseen.storm=1;Eng.setCh(3);var L0=[['','風雨欲來。']];var cs=[];
  if(S.c.hanfei.met){S.flags.hanfei_jail=1;S.c.hanfei.jailed=1;L0.push(['','韓非因韓國之事被下雲陽獄。據傳，是李斯上書言其「終為韓不為秦」。']);WS.log('韓非被下雲陽獄','起因：李斯上書，言韓非終為韓不為秦','消息');
   cs.push(ch('⚖️ 為韓非向秦王求情','saveHf'));}
  if(S.c.jingke.met){S.flags.jingke_left=1;S.c.jingke.away=S.day+999;L0.push(['','同一夜，荊軻在醫館門口留下一壺酒，不告而別——酒壺下壓著一片竹簡：「易水見。」']);cs.push(ch('🐎 追去易水','stopJk'));}
  L0.push(['','【第四章】在韓非之獄與荊軻之約間，你只來得及先做一件事。']);
  cs.push(ch('🗺 暫且回到醫館','hub'));return Eng.L(L0,'','night',cs);};
 NODES.saveHf=function(){var yz=S.c.yingzheng;var ok=yz.trust>=30||S.p.fame>=25||SET.diff==='easy';S.evseen.choseStorm=1;
  if(ok){S.flags.hanfei_saved=1;S.c.hanfei.jailed=0;Eng.c('hanfei',{aff:10,heart:8,trust:10},P()+'救我出雲陽獄');Eng.c('yingzheng',{trust:-3,jeal:8});if(S.flags.jingke_left)S.flags.jingke_gone=1;
   return Eng.L([['yingzheng','「你為了他，來求寡人？」他盯著你，良久，「……放人。」','angry'],['hanfei','雲陽獄門開時，他看見你，竹簡從手中滑落。','blush'],['hanfei','「你、你來了。」','blush']],'hanfei','palace',[ch('繼續','hub')]);}
  return Eng.L([['yingzheng','「此事，寡人自有決斷。」他沒有看你。','normal'],['','你的求情沒有被採納。（提示：秦王信任或名聲不足）'],['','也許還有別的辦法……']],'yingzheng','palace',[ch('繼續','hub')]);};
 NODES.stopJk=function(){S.evseen.choseStorm=1;var r=S.c.jingke;var ok=r.heart>=30||r.cured||SET.diff==='easy';
  if(ok){S.flags.jingke_stopped=1;r.away=0;Eng.c('jingke',{aff:10,heart:10,trust:8},P()+'追到易水攔下我');if(S.flags.hanfei_jail&&!S.flags.hanfei_saved)S.flags.hanfei_late=1;
   return Eng.L([['','易水寒風如刀。你策馬趕到時，他正要登船。'],['jingke','「……你怎麼來了。」他的聲音發啞。','sad'],['p','「你答應過我，要為自己活下去。」'],['jingke','他看了你很久，終於把劍扔進了易水：「……好。這條命，歸你了。」','blush']],'jingke','night',[ch('繼續','hub')]);}
  return Eng.L([['','你趕到易水時，只看見遠去的船影。'],['','風蕭蕭，水寒寒。']],'','night',[ch('繼續','hub')]);};
 NODES.evFinale=function(){S.evseen.finale=1;Eng.setCh(4);
  var cand=CHAR_ORDER.filter(function(id){return S.c[id].met&&S.c[id].stage>=2;});
  var cs=cand.map(function(id){return ch('💗 向'+CHARS[id].n+'表明心意','endingGo',{id:id});});
  cs.push(ch('🧰 誰也不選，繼續行醫','endingGo',{id:''}));
  return Eng.L([['','歲末，咸陽城下了一場大雪。'],['','你站在醫館門口，想起這一年遇見的每一個人。'],['','有些話，終究要說出口。']],'','plum',cs);};
 NODES.endingGo=function(a){var key=Eng.endingFor(a.id);Eng.end(key);var E=ENDINGS[key];var id=a.id||'';
  var L0=[['','【'+E.k+' · '+E.n+'】'],['',E.d]];if(id&&key.indexOf('he_')===0)L0.splice(1,0,[id,CHARS[id].n+'握住你的手，久久沒有放開。','blush']);
  return Eng.L(L0,id,key.indexOf('be_')===0?'night':'plum',[ch('🏮 回到標題','title'),ch('📖 繼續遊玩（結局後）','hub')],{ending:key});};
 /* ---------- 節日 ---------- */
 NODES.festival=function(a){var f=FESTIVALS[a.i-1];S.evseen['fe'+(a.i-1)+'_'+Math.floor((S.day-1)/120)]=1;
  var cand=CHAR_ORDER.filter(function(id){return S.c[id].met&&S.c[id].aff>=15&&Eng.where(id)!==''||S.c[id].met&&S.c[id].aff>=30;}).slice(0,4);
  var cs=cand.map(function(id){return ch('🏮 邀'+CHARS[id].n+'同過'+f.n,'festDate',{id:id,i:a.i});});cs.push(ch('獨自過節','hub'));
  return Eng.L([['','今日是'+f.n+'。'+f.t]],'', f.s===3?'palace':(f.s===2?'courtyard':'market'),cs);};
 NODES.festDate=function(a){var f=FESTIVALS[a.i-1];var id=a.id;Eng.pass(1);Eng.c(id,{aff:8,heart:8},'與'+P()+'同過'+f.n);
  CHAR_ORDER.forEach(function(o){if(o!==id&&S.c[o].heart>=25)S.c[o].jeal=clamp(S.c[o].jeal+8,0,100);});
  var line={0:'「水邊風大，站我身後。」',1:'「燈火這麼多，我只看得見你。」',2:'「你許了什麼願？……我許的願，和你有關。」',3:'「新的一年，也請你在我身邊。」'}[f.s];
  return Eng.L([['',f.n+'。'+CHARS[id].n+'與你並肩。'],[id,line,'blush']],id,f.s===2?'courtyard':'market',[ch('🗺 返回地圖','hub')]);};
 /* ---------- 修羅場 ---------- */
 NODES.jealous=function(a){S.flags.lastJeal=S.day;var A=a.a,B=a.b;
  return Eng.L([['','你正與'+CHARS[B].n+'說話，'+CHARS[A].n+'忽然出現在身後。'],[A,JEAL[A]||'「……打擾了？」','angry'],[B,'「'+CHARS[A].n+'也在？真巧。」','normal'],['','空氣忽然變得很安靜。']],A,S.place,
   [ch('🍬 先哄'+CHARS[A].n,'jealDo',{a:A,b:B,op:'a'}),ch('😌 坦然：「我們只是說話。」','jealDo',{a:A,b:B,op:'calm'}),ch('😈 讓他們自己比比看','jealDo',{a:A,b:B,op:'tease'})]);};
 var JEAL={yingzheng:'「寡人的醫者，何時輪到旁人來說話？」',mengtian:'「你們……在聊什麼呀？」他笑得很勉強。',lisi:'「姑娘真是忙。」他依舊微笑，指節卻捏得發白。',fusu:'「抱歉，我只是……路過。」他垂下眼。',hanfei:'「我、我先走了。」他轉身時差點撞到柱子。',jingke:'「喲，小大夫身邊熱鬧啊。」',xuanye:'牆頭的影子動了一下。'};
 NODES.jealDo=function(a){var A=a.a,B=a.b;
  if(a.op==='a'){Eng.c(A,{jeal:-20,aff:4,heart:2},P()+'在'+cn(B)+'面前先哄我');Eng.c(B,{jeal:10,aff:-2});}
  else if(a.op==='calm'){Eng.c(A,{jeal:-8,trust:3});Eng.c(B,{trust:2});}
  else{Eng.c(A,{jeal:6,heart:3});Eng.c(B,{jeal:6,heart:3});Eng.p({cha:1});}
  var t={a:CHARS[A].n+'的神色緩和下來，彆扭地「哼」了一聲。',calm:'兩人對視一眼，各自收回了目光。',tease:'兩人同時看向你——你笑著溜走了。'}[a.op];
  return Eng.L([['',t]],A,S.place,[ch('🗺 返回地圖','hub')]);};
 /* ---------- AI 接續 ---------- */
 function aiScene(req,off){return {async:req,fb:off};}
 Eng.aiScene=aiScene;
 NODES.aiNext=function(a){var t=a.text;Eng.pass(1);
  if(AI.ready())return aiScene({type:'free',text:t,id:a.id,tag:'選項'},function(){return offNext(a);});
  return offNext(a);};
 function offNext(a){var id=a.id||S.focus||'';Eng.keep(id);if(id&&S.c[id]){Eng.c(id,{aff:2},P()+'：'+a.text);return Eng.L([['','你選擇了：「'+a.text+'」。'],[id,Speak.reply(id,a.text),exprOf(id)]],id,S.place,[ch('💬 繼續交談','talk',{id:id}),ch('🗺 返回地圖','hub')]);}
  return Eng.L(['你選擇了：「'+a.text+'」。日子靜靜地過去。'],'',S.place,[ch('🗺 返回地圖','hub')]);}
 /* M15 斷線接續 */
 NODES.resume=function(){var p=S.pend;if(!p)return {go:'hub'};
  return Eng.L(['【未完成的劇情】上次 AI 中斷時，你正在：「'+p.text.slice(0,40)+'」'],p.id||'',S.place,[ch('🔁 AI 重試接續','resumeAi'),ch('📖 以離線劇情接續','resumeOff'),ch('🗑 放下這件事','resumeDrop')]);};
 NODES.resumeAi=function(){var p=S.pend;if(!p)return {go:'hub'};if(AI.ready())return aiScene(p.req,function(){return offNext({text:p.text,id:p.id});});return NODES.resumeOff();};
 NODES.resumeOff=function(){var p=S.pend;S.pend=null;return p?offNext({text:p.text,id:p.id}):{go:'hub'};};
 NODES.resumeDrop=function(){S.pend=null;return {go:'hub'};};
})();
