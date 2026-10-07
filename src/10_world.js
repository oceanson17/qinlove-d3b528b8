/* ===== 世界：開局、地點行動、生活路線（行醫／種田／搭屋／經商／仕途／從軍／江湖）、家族 ===== */
var Start={};
Start.std=function(o){heroineState(o);S.home={r:'xianyang',pl:'lodge'};Weather.roll();S.flags.intro='std';return 'intro';};
Start.rand=function(r,o){randomState(r,o);S.flags.intro=r.birth;if(r.baby)S.flags.babyStart=1;if(o.origin)Origin.apply(o.origin);return 'intro';};
function cny(n){return n>=0?'+'+n:''+n;}
function hasAct(){return S.per<5;}
NODES.intro=function(){var me=pc();var k=S.flags.intro;var L=[];
 if(k==='std'){L=[[ '','秦王政十年，春。咸陽城南的官道上，一個背著藥箱的年輕女子停下腳步。'],['','她叫'+me.n+'，在一處隱世山谷裡跟著師父青囊子學了十二年醫——不是望聞問切，而是解剖、刀圭、縫合、蒸餾酒精、以木筒聽人心肺。'],['master','「下山去吧。記住：先救人，再講道理。世人會怕你，會恨你——也會需要你。」'],['','師父說這些醫術來自極西之地，叫你萬萬不可對人說起。'],['p','（先找個落腳處，再想辦法開一間醫館。）']];}
 else if(k==='exile'){var fa=People.byRel('父');L=[['','抄家的差役是在一個雨夜來的。'],['',S.fam.grudge.crime+'——一紙判書，'+Fam.name()+'上下全數流放'+S.road.dn+'。'],['',S.road.dn+'在'+S.road.total+'日路程之外。'+cn(S.road.guards[0])+'把鐵鏈一抖：「走！誤了期限，你們全家都得死！」']];if(fa)L.push([fa,'（心聲）'+People.thought(P(fa))]);L.push(['p','（腳下的草鞋已經破了。得省著吃、護好腳、照看好家人……活著走到'+S.road.dn+'。）']);}
 else if(S.flags.babyStart){L=[['','你出生在'+Eng.ybStr(Eng.yb())+'的'+Eng.dateStr()+'。'],['',Fam.name()+'添了一口人。'+BIRTHS.filter(function(b){return b.k===S.flags.birth;})[0].d+'。'],['','往後的每一年，都由你來選擇怎麼長大。']];}
 else{var B=BIRTHS.filter(function(b){return b.k===S.flags.birth;})[0];L=[['','你是'+me.n+'，'+ageOf(me)+'歲，生在'+B.n+'——'+B.d+'。'],['','這一生沒有寫好的劇本。窮困、疾病、機緣，都會改變你的命運。']];}
 if(S.origin&&S.origin.lines)S.origin.lines.forEach(function(l){L.push(['',l]);});
 return Eng.L(L,k==='std'?'':'',S.place,[ch(S.flags.babyStart?'開始長大':'踏出第一步',S.flags.babyStart?'childYear':'place')]);};
/* ---------- 地點中樞 ---------- */
var Place={};
Place.desc=function(){var pl=PLACES[S.place];var me=pc();var L=[];var here=People.present();
 L.push(pl.n+'。'+pl.d);L.push(Eng.dateStr()+'　'+Weather.str()+'　體感'+Math.round(Eng.effT(me))+'°');
 var w=[];if(me.food<25)w.push('你餓得發慌');if(me.sta<25)w.push('你累得睜不開眼');if(me.temp<35.8)w.push('你冷得發抖');if(me.ill.length)w.push('你身患'+Ill.str(me));if(Ill.has(me,'blister'))w.push('腳底的水泡一走就疼');if(me.cloth<30)w.push('衣服破得透風');if(w.length)L.push('（'+w.join('；')+'）');
 var fam=Eng.house().filter(function(p){return p.id!==S.pc&&(Eng.atHome()||S.region==='road');});var sick=fam.filter(function(p){return p.ill.length||p.food<25;});if(sick.length)L.push('家人：'+sick.map(function(p){return p.n+(p.ill.length?'（'+Ill.str(p)+'）':'')+(p.food<25?'（餓）':'');}).join('、'));
 if(here.length)L.push('此處有：'+here.slice(0,6).map(People.label).join('、'));
 var iv=S.invites.filter(function(v){return v.day===S.day&&v.pl===S.place&&Math.abs(v.per-S.per)<=1;})[0];if(iv)S.queue.push({go:'outing',a:{id:iv.id}});
 return L;};
Place.acts=function(){var pl=S.place,P0=PLACES[pl],me=pc(),c=[];var A=function(t,go,a,o){c.push(ch(t,go,a,o));};var adult=ageOf(me)>=12;
 if(S.flags.held){A('⛓ 在牢中熬過一日','heldDay');A('💰 打點獄卒','heldBribe');return c;}
 if(S.region==='road'){if(!S.road.marched)A('🚶 跟著隊伍趕路','march');A('🩹 照料家人（腳泡、衣物）','care');A('⛺ 搭帳歇腳','tent');A('🌿 路邊採摘','forage');A('🙇 去跟衙役說話','talk',{id:S.road.guards[rand()<0.5?0:1]});}
 else{
  if(pl==='lodge'){if(!S.fam.house&&S.flags.paidLodge!==S.day)A('🪙 付十錢住一宿','payLodge');if(!S.fam.house)A('🏠 置一處宅子（瓦屋 300 兩）','buyHouse');}
  if(pl==='clinic'){if(S.fam.tech.alco||me.sk.med>=30){if(!S.fam.clinic.open)A('📜 租下舖面開醫館（120 兩）','openClinic');else{A('🩺 坐堂看診','clinicSit');A('👩‍⚕️ 收徒／學徒','apps');if(S.fam.clinic.lv<3)A('🔨 擴建醫館（'+(S.fam.clinic.lv+1)*150+' 兩）','clinicUp');}}A('📖 研習醫術','research');}
  if(pl==='market'||pl==='fair'){A('🛒 買賣','shop');if(adult)A('💪 打零工','work');if(adult&&(S.fam.tech.alco||me.sk.med>=25))A('⛺ 擺攤義診','streetClinic');if(adult)A('🐫 合夥經商','trade');}
  if(P0.wild){A('🌿 採集（野菜、野果、藥草）','forage');A('🪓 砍柴','chop');}
  if(pl==='river'){A('🎣 捕魚','fish');A('🧺 洗衣','wash');}
  if(pl==='mountain'){if(!S.flags.masterMet)A('🌫 往雲霧深處尋訪','seekMaster');else A('🧓 向師父學醫','learn');}
  if(pl==='camp'&&adult){if(!S.flags.army)A('🛡 投軍做軍醫','enlist');else{A('⚔ 隨軍出征（數日）','campaign');A('🏥 營中看診','armyClinic');}}
  if(pl==='tavern'){A('🍶 飲酒聽閒話','rumor');if(adult)A('🗡 結交遊俠／闖蕩江湖','jianghu');}
  if(pl==='palace'){if(me.medoff>=3)A('🏯 入宮當值','courtDuty');A('🙇 求見','audience');}
  if(pl==='study'||pl==='school'){A('📚 讀書（文墨）','read');}
  if(pl==='school'){A('🎓 送子女入學','eduPick');}
  if(pl==='yamen'||pl==='yamen2'){if(adult)A('📝 應吏試／察舉','exam');if(adult&&!me.medoff)A('⚕ 自薦為醫官','askMedoff');if(S.fam.grudge&&!S.fam.grudge.done)A('📜 遞狀申冤','appeal');if(pl==='yamen2'&&S.fam.grudge&&!S.fam.grudge.done)A('🖊 點卯','checkin');}
  if(pl==='farm'||pl==='field'){A('🌾 田地（開荒／播種／照料／收割）','farm');}
  if(Eng.atHome()&&S.region==='frontier'){if(S.fam.house<2)A('🏚 搭屋（'+Eng.HOUSE_N[S.fam.house+1]+'）','build');}
  if(pl==='village'){if(adult)A('💪 幫鄰里幹活','work');if(adult&&(S.fam.tech.alco||me.sk.med>=25))A('⛺ 為鄉鄰看病','streetClinic');}
  if(pl==='courtyard'){A('🌙 賞月','moon');}
 }
 var here=People.present().slice(0,5);here.forEach(function(id){c.push(ch('💬 '+People.label(id),'talk',{id:id}));});
 var sickFam=Eng.house().filter(function(p){return p.ill.length&&(p.id===S.pc||Eng.atHome()||S.region==='road');});if(sickFam.length&&(S.fam.tech.alco||me.sk.med>=20))A('🩺 為'+(sickFam[0].id===S.pc?'自己':sickFam[0].n)+'診治','treat',{id:sickFam[0].id});
 if(Eng.foodKeys().length)A('🍚 用膳','eat');
 if(S.per>=4||me.sta<30)A('💤 就寢','sleep');else A('⏳ 歇一個時辰','wait');
 A('⏩ 歲月流轉','skipMenu');if(S.region!=='road')A('🗺 地圖','map');
 return c;};
NODES.place=function(){var L=Place.desc();var chs=Place.acts();return Eng.L(L,'',PLACES[S.place].bg?S.place:S.place,chs,{hub:1});};
NODES.map=function(){if(S.region==='road')return NODES.place();if(S.flags.held)return NODES.place();return {screen:'map'};};
NODES.go=function(a){var pl=PLACES[a.pl];if(!pl)return NODES.place();if(pl.need==='palace'&&!S.flags.palace&&!pc().office)return Eng.L(['宮門侍衛橫戟攔住你：「無詔不得入。」'],'',S.place,[ch('↩ 返回','map')]);
 if(pl.night&&S.per<4)return Eng.L(['月色庭院只在入夜後才去得。'],'',S.place,[ch('↩ 返回','map')]);
 if(a.pl!==S.place){S.place=a.pl;Eng.pass(1);if(rand()<0.25&&!S.queue.length)Ev.roll('move');}return NODES.place();};
NODES.wait=function(){Eng.pass(1);pc().sta=clamp(pc().sta+8,0,100);return NODES.place();};
NODES.eat=function(){var t=Eng.meal(false);return Eng.L([t||'吃過了。'],'',S.place,[ch('繼續','place')]);};
NODES.sleep=function(){var t=Eng.sleep();var L=[t];if(S.region==='road')S.road.marched=0;var fam=Eng.house().filter(function(p){return p.id!==S.pc&&p.hh&&(Eng.atHome()||S.region==='road');});if(fam.length&&rand()<0.5){var f=pick(fam);L.push(f.n+'（心聲）：'+People.thought(f));}
 Ev.roll('morning');return Eng.L(L,'',S.place,[ch('起身','place')]);};
NODES.skipMenu=function(){var c=[ch('⏩ 三日','skip',{n:3}),ch('⏩ 十日（一季）','skip',{n:10}),ch('⏩ 一年','skip',{n:DPY})];if(ageOf(pc())>=45)c.push(ch('⏩ 五年','skip',{n:DPY*5}));c.push(ch('🕯 結束這一生','endLife'));c.push(ch('↩ 返回','place'));
 return Eng.L(['歲月流轉：自動吃飯、睡覺、做活（醫館開著就看診、田裡有莊稼就照料）。遇到大事或病倒便會停下。'],'',S.place,c);};
NODES.skip=function(a){if(S.region==='road')return Eng.L(['流放路上，一日一日都得自己走。'],'',S.place,[ch('↩','place')]);var r=Eng.skip(a.n);var L=['（'+cnum0(r.days)+'日過去了。）'].concat(r.lines.slice(-8));return Eng.L(L,'',S.place,[ch('繼續','place')]);};
/* ---------- 生活動作 ---------- */
NODES.payLodge=function(){if(S.gold<10)return Eng.L(['你摸了摸錢袋——連十錢都湊不出。今夜只能睡在簷下了。'],'',S.place,[ch('↩','place')]);Inv.gold(-10);S.flags.paidLodge=S.day;return Eng.L(['掌櫃收了錢，給你一間朝北的小房。'],'',S.place,[ch('↩','place')]);};
NODES.buyHouse=function(){if(S.gold<300)return Eng.L(['牙人報了價：一處像樣的瓦屋要三百兩。你還差'+(300-S.gold)+'兩。'],'',S.place,[ch('↩','place')]);Inv.gold(-300);S.fam.house=3;S.home={r:'xianyang',pl:'lodge'};PLACES.lodge.n='自家宅院';addLog('〔家〕置下咸陽的宅子','家');Fam.tierCalc();return Eng.L(['你在城南置下一處瓦屋小院。從今往後，這裡就是家。'],'',S.place,[ch('↩','place')]);};
NODES.openClinic=function(){if(S.gold<120)return Eng.L(['舖主要一百二十兩押租。你還差'+(120-S.gold)+'兩。可以先擺攤義診攢些名聲和銀子。'],'',S.place,[ch('↩','place')]);Inv.gold(-120);S.fam.clinic.open=1;S.fam.clinic.lv=0;S.fam.clinic.d0=S.day;addLog('〔醫館〕'+pc().n+'開館','醫');WS.log('城南新開一間醫館，大夫用刀圭針線治病','起因：'+pc().n+'開館','你所為');FW.add(pc().n+'在城南開了醫館',[],S.pc,{pub:1});
 return Eng.L(['你掛上親手寫的木牌：「青囊醫館」。','街坊探頭探腦——聽說這位大夫治病不用符水，用刀子和針線。'],'',S.place,[ch('🩺 開門看診','clinicSit'),ch('↩','place')]);};
NODES.clinicUp=function(){var c=(S.fam.clinic.lv+1)*150;if(S.gold<c)return Eng.L(['擴建要'+c+'兩，錢不夠。'],'',S.place,[ch('↩','place')]);Inv.gold(-c);S.fam.clinic.lv++;Fam.tierCalc();return Eng.L(['醫館擴建了：'+['','多了一間淨室，可以安心動刀','添了病榻與藥櫃','成了咸陽數一數二的醫館'][S.fam.clinic.lv]+'。（診金+20%）'],'',S.place,[ch('↩','place')]);};
NODES.clinicSit=function(){if(S.per>=5)return Eng.L(['夜深了，醫館已經上了門板。'],'',S.place,[ch('↩','place')]);if(pc().sta<15)return Eng.L(['你累得手都在抖——這樣拿刀會出人命。先歇歇吧。'],'',S.place,[ch('↩','place')]);pc().sta-=12;Med.open({src:'clinic'});return {screen:'med'};};
NODES.streetClinic=function(){if(pc().sta<15)return Eng.L(['你太累了。'],'',S.place,[ch('↩','place')]);pc().sta-=12;var ci=Med.pickCase(Math.min(2,pc().sk.med>=40?2:1));Med.open({src:'market',ci:ci,fee:Math.round(CASES[ci].fee/3)});return {screen:'med'};};
NODES.armyClinic=function(){pc().sta-=12;var ci=pick([Med.caseOf('arrow'),Med.caseOf('fracture'),Med.caseOf('cut'),Med.caseOf('gangrene')]);Med.open({src:'army',ci:ci});return {screen:'med'};};
NODES.treat=function(a){var p=P(a.id)||pc();if(!p.ill.length)return Eng.L([(p.id===S.pc?'你':p.n)+'身上沒有病痛。'],'',S.place,[ch('↩','place')]);Med.open({pid:p.id,src:'family'});return {screen:'med'};};
NODES.medDone=function(a){var L=[];var me=pc();if(a.out==='cure'||a.out==='better')L.push(pick(['你洗淨雙手，長長吐了口氣。','病人的家屬撲通跪下，對你連連磕頭。','你收起刀具，才發覺背上的衣裳早已濕透。']));else if(a.out==='dead')L.push('白布蓋上了。你在門口站了很久。');else L.push('你皺著眉，把處置的每一步在心裡又過了一遍。');
 if(a.src==='clinic'&&S.fam.clinic.apps.length)L.push('學徒們在一旁看得目不轉睛。');var c=[ch('繼續','place')];if(a.src==='clinic'&&S.per<5&&me.sta>=15)c.unshift(ch('🩺 叫下一位','clinicSit'));return Eng.L(L,'',S.place,c);};
NODES.research=function(){var me=pc();Eng.pass(2);var cand=[['garlic',45,'蒜汁抗菌'],['deliver',50,'助產轉胎'],['amput',60,'截肢術'],['isolate',35,'隔離防疫'],['listen',30,'聽診']].filter(function(x){return !S.fam.tech[x[0]];});
 var gain=Inv.has('notes')?2:1;if(rand()<0.5)me.sk.med=clamp(me.sk.med+gain,0,100);var got=cand.filter(function(x){return me.sk.med>=x[1];})[0];
 if(got&&(Inv.has('notes')||rand()<0.3)){S.fam.tech[got[0]]=1;addLog('〔醫術〕習得'+got[2],'醫');return Eng.L(['你對著'+(Inv.has('notes')?'師父手札裡的解剖圖':'自己的病案')+'琢磨了兩個時辰——終於想通了「'+got[2]+'」的要訣。（習得新技法）'],'',S.place,[ch('↩','place')]);}
 return Eng.L(['你翻來覆去讀著病案。'+(cand.length?'下一門技法（'+cand[0][2]+'）需要醫術 '+cand[0][1]+(Inv.has('notes')?'':'，有師父手札會快得多')+'。':'師父教的，你都已融會貫通。')],'',S.place,[ch('↩','place')]);};
NODES.apps=function(){var A=S.fam.clinic.apps.filter(function(id){return alive(id);});S.fam.clinic.apps=A;var L=['學徒：'+(A.map(function(id){return P(id).n+'（醫'+P(id).sk.med+'）';}).join('、')||'暫無')+'。學徒會在你不在時替你照看醫館，每人每日伙食二兩。'];var c=[];if(A.length<3)c.push(ch('📣 貼出招徒告示','recruit'));c.push(ch('↩','place'));return Eng.L(L,'',S.place,c);};
NODES.recruit=function(){var p=genPerson({age:13+rnd(5),kind:'npc',job:'apprentice',met:1,aff:30,trust:20,loc:{r:S.region,pl:'clinic'}});p.title='學徒';p.sk.med=5+rnd(10);S.fam.clinic.apps.push(p.id);People.note(p.id,'拜入'+pc().n+'門下學醫','crit');return Eng.L([[p.id,'「'+Gender.call(p.id)+'！我叫'+p.n+'，今年'+ageOf(p)+'，識得幾個字，力氣也大……求您收下我！」'],'你收下了第一個'+(S.fam.clinic.apps.length>1?'……又一個':'')+'學徒。'],p.id,S.place,[ch('↩','place')]);};
NODES.apprentice=function(a){var p=P(a.id);if(a.id==='master'&&S.flags.masterMet)return NODES.learn();if(!p)return Eng.L(['你想拜師，可身邊沒有人。'],'',S.place,[ch('↩','place')]);if(/收.*為徒|收徒/.test(a.t||'')&&ageOf(p)<25&&p.aff>=20){if(S.fam.clinic.apps.indexOf(p.id)<0)S.fam.clinic.apps.push(p.id);p.title='學徒';People.note(p.id,'拜入'+pc().n+'門下學醫','crit');return Eng.L([p.n+'鄭重地向你磕了三個頭。'],p.id,S.place,Input.backCh(p.id));}
 if(p.sk.med>pc().sk.med+10&&p.aff>=30){pc().sk.med=clamp(pc().sk.med+2,0,100);return Eng.L([p.n+'指點了你一番。（醫+2）'],p.id,S.place,Input.backCh(p.id));}return Eng.L([p.n+'搖搖頭：「我沒什麼可教你的。」'],p.id,S.place,Input.backCh(p.id));};
NODES.chop=function(){var me=pc();if(me.sta<15)return Eng.L(['你累得揮不動斧子。'],'',S.place,[ch('↩','place')]);Eng.pass(1);me.sta-=15;var n=1+rnd(2);Inv.add('wood',n);var L=['你撿了一捆柴（柴薪+'+n+'）。'];if(Inv.has('axe')&&rand()<0.6){Inv.add('timber',1);L.push('又用柴刀砍下一段木料（木料+1）。');}if(rand()<0.08){Ill.add(me,'wound',1);L.push('不小心被樹枝劃破了手。');}return Eng.L(L,'',S.place,[ch('再砍一些','chop'),ch('↩','place')]);};
NODES.fish=function(){var me=pc();Eng.pass(1);me.sta-=10;var ok=rand()<0.35+me.sk.farm/200;if(ok)Inv.add('fish',1);if(Weather.wet()&&rand()<0.2)Ill.add(me,'cold',1);return Eng.L([ok?'一條魚咬了鉤！（鮮魚+1）':'等了一個時辰，什麼也沒釣到。'],'',S.place,[ch('再釣','fish'),ch('↩','place')]);};
NODES.wash=function(){Eng.pass(1);Eng.house().forEach(function(p){p.cloth=clamp(p.cloth+5,0,100);p.mood=clamp(p.mood+2,0,100);});if(Inv.has('soap'))Eng.house().forEach(function(p){if(Ill.has(p,'diarrhea'))Ill.cure(p,'diarrhea',1);});return Eng.L(['你把全家的衣裳洗得乾乾淨淨。'+(Inv.has('soap')?'用了草木灰皂，疫病也少了。':'')],'',S.place,[ch('↩','place')]);};
NODES.moon=function(){Eng.pass(1);pc().mood=clamp(pc().mood+6,0,100);if(S.flags.xy_open||ageOf(pc())>=16&&rand()<0.3&&alive('xuanye')){S.flags.xy_open=1;return Eng.L(['月色如水。屋簷上有個黑影，靜靜地陪你坐著。'],'xuanye',S.place,[ch('💬 喚他下來','talk',{id:'xuanye'}),ch('↩','place')]);}return Eng.L(['月色如水，你心裡靜了些。（心情+6）'],'',S.place,[ch('↩','place')]);};
NODES.read=function(){var me=pc();Eng.pass(2);me.sk.lit=clamp(me.sk.lit+2,0,100);if(S.place==='school'&&S.gold>=2)Inv.gold(-2);return Eng.L(['你讀了兩個時辰。（文+2）'],'',S.place,[ch('↩','place')]);};
NODES.rumor=function(){Eng.pass(1);Inv.gold(-Math.min(S.gold,3));pc().mood=clamp(pc().mood+3,0,100);var w=WS.brief(3);var hint=History.hint();return Eng.L(['酒客們七嘴八舌：'].concat(w.length?w:['近來倒也太平。']).concat(hint?[hint]:[]),'',S.place,[ch('↩','place')]);};
/* ---------- 採集辨識 ---------- */
NODES.forage=function(){var me=pc();if(me.sta<12)return Eng.L(['你餓得眼冒金星，挖不動了。'],'',S.place,[ch('↩','place')]);if(Eng.season()===3&&rand()<0.5&&S.region!=='road')return (Eng.pass(1),me.sta-=10,Eng.L(['冬日的林子裡一片蕭索，只撿到些枯枝。'],'',S.place,[ch('↩','place')]));
 Eng.pass(1);me.sta-=12;S.tmp={fg:Forage.roll()};return NODES.fgList();};
NODES.fgList=function(){var L=['你翻找了一個時辰，找到：'];var c=[];(S.tmp&&S.tmp.fg||[]).forEach(function(it,i){if(it.done)return;L.push('· '+it.n+'——'+it.t+(it.sure?(it.safe?'（你認得，可食）':'（你認得，是有毒的'+it.real+'！）'):'（拿不準）'));c.push(ch('收下 '+it.n,'fgTake',{i:i}));});
 c.push(ch('✓ 只收認得可食的','fgSafe'));c.push(ch('↩ 不要了','place'));return Eng.L(L,'',S.place,c);};
NODES.fgTake=function(a){var it=S.tmp.fg[a.i];if(it&&!it.done){it.done=1;Forage.take(it);}return NODES.fgList();};
NODES.fgSafe=function(){var n=0;S.tmp.fg.forEach(function(it){if(!it.done&&it.sure&&it.safe){it.done=1;Forage.take(it);n++;}});S.tmp=null;return Eng.L(['你只收下了有把握的'+n+'樣。'],'',S.place,[ch('↩','place')]);};
/* ---------- 買賣 ---------- */
NODES.shop=function(a){return {screen:'shop',a:a||{}};};
NODES.craft=function(){return {screen:'craft'};};
/* ---------- 打工 ---------- */
NODES.work=function(){var me=pc();if(me.sta<25)return Eng.L(['你累得抬不起手。'],'',S.place,[ch('↩','place')]);Eng.pass(2);me.sta-=25;var pay=S.region==='frontier'?4+rnd(4):6+rnd(6);if(S.flags.dear&&S.day-S.flags.dear<30)pay-=2;
 var job=S.place==='market'?'在碼頭搬貨':(S.place==='village'?'幫鄰家修屋頂':'在市集幫人看攤');Inv.gold(pay);me.sk.craft=clamp(me.sk.craft+(rand()<0.2?1:0),0,100);var L=['你'+job+'，忙了兩個時辰，掙了'+pay+'錢。'];
 if(S.world==='male'&&me.g==='f'&&!Gender.on()&&rand()<0.3){L.push('工頭斜眼看你：「女人家幹什麼粗活？」只給了一半。');Inv.gold(-Math.floor(pay/2));}if(S.world==='female'&&me.g==='m'&&!Gender.on()&&rand()<0.3){L.push('管事的娘子皺眉：「男子不在家帶孩子，跑出來拋頭露面？」');}
 return Eng.L(L,'',S.place,[ch('↩','place')]);};
var Work={auto:function(out){var me=pc();var cl=S.fam.clinic;
 if(cl.open&&S.region==='xianyang'){var n=1+cl.lv+rnd(2);var earn=0,cured=0;for(var i=0;i<n;i++){var r=Med.auto(Med.pickCase(),me.sk.med,true);if(r.ok){earn+=Math.round(r.fee*(1+cl.lv*0.2));cured++;}}S.gold+=earn;S.fam.fame=clamp(S.fam.fame+(cured>=2?1:0),0,999);S.stats.pat+=n;S.stats.cure+=cured;cl.days++;if(rand()<0.15)me.sk.med=clamp(me.sk.med+1,0,100);if(earn&&out.length<40)out.push('醫館看診'+n+'人，診金'+earn+'兩。');}
 else if(S.region==='frontier'&&S.fam.plots.length){Farm.tendAll();}
 else if(me.office||me.medoff){}
 else{var pay=S.region==='frontier'?4:7;S.gold+=pay;}
 me.sta=clamp(me.sta-20,0,100);}};
/* ---------- 種田 ---------- */
var Farm={
 grow:function(){S.fam.plots.forEach(function(p){if(p.st==='sown'||p.st==='grow'){var se=Eng.season();if(se===3&&rand()<0.3){p.st='fallow';p.care=0;return;}p.g=(p.g||0)+1+(p.care>0?0.5:0)+(Weather.wet()?0.3:0);p.care=Math.max(0,(p.care||0)-1);if(p.g>=4)p.st='grow';if(p.g>=9)p.st='ripe';}});},
 tendAll:function(){S.fam.plots.forEach(function(p){if(p.st==='sown'||p.st==='grow')p.care=3;if(p.st==='ripe'){var y=Farm.yield(p);S.inv.grain=(S.inv.grain||0)+y;p.st='fallow';p.g=0;}if(p.st==='fallow'&&Inv.has('seed')&&Eng.season()<2){Inv.add('seed',-1);p.st='sown';p.g=0;}});},
 yield:function(p){return 4+rnd(4)+Math.floor(pc().sk.farm/15)+(p.care>0?2:0);},
 st:{wild:'荒地',fallow:'休耕',sown:'剛播種',grow:'青苗',ripe:'可收割'}
};
NODES.farm=function(){var me=pc();var P0=S.fam.plots;var L=['你的田：'+(P0.length?P0.map(function(p,i){return '第'+cnum0(i+1)+'塊'+Farm.st[p.st];}).join('、'):'還沒有田')+'。'+(Eng.season()>=2?'（秋冬不宜播種）':'')];var c=[];
 var wild=S.region==='frontier'||S.fam.land>P0.length;if(wild)c.push(ch('⛏ 開墾一塊荒地'+(Inv.has('hoe')?'':'（缺鋤頭，慢）'),'farmDo',{k:'clear'}));
 if(P0.some(function(p){return p.st==='fallow';})&&Inv.has('seed')&&Eng.season()<2)c.push(ch('🌱 播種','farmDo',{k:'sow'}));if(P0.some(function(p){return p.st==='sown'||p.st==='grow';}))c.push(ch('💧 除草澆水','farmDo',{k:'tend'}));if(P0.some(function(p){return p.st==='ripe';}))c.push(ch('🌾 收割','farmDo',{k:'reap'}));c.push(ch('↩','place'));return Eng.L(L,'',S.place,c);};
NODES.farmDo=function(a){var me=pc();var P0=S.fam.plots;var L=[];if(me.sta<20)return Eng.L(['你累得直不起腰。'],'',S.place,[ch('↩','place')]);
 if(a.k==='clear'){Eng.pass(Inv.has('hoe')?2:3);me.sta-=30;P0.push({st:'fallow',g:0,care:0});S.fam.land=Math.max(S.fam.land,P0.length);L.push('你揮著'+(Inv.has('hoe')?'鋤頭':'木棍')+'翻了半日土，開出一塊新田。');if(rand()<0.15){Ill.add(me,'blister',1);L.push('手上磨出了血泡。');}}
 else if(a.k==='sow'){Eng.pass(1);me.sta-=12;P0.forEach(function(p){if(p.st==='fallow'&&Inv.has('seed')){Inv.add('seed',-1);p.st='sown';p.g=0;p.care=2;}});L.push('你把種子一粒粒埋進土裡。');}
 else if(a.k==='tend'){Eng.pass(1);me.sta-=15;P0.forEach(function(p){if(p.st==='sown'||p.st==='grow')p.care=3;});L.push('除了草，挑了水。苗兒精神了些。');}
 else if(a.k==='reap'){Eng.pass(2);me.sta-=25;var tot=0;P0.forEach(function(p){if(p.st==='ripe'){tot+=Farm.yield(p);p.st='fallow';p.g=0;}});Inv.add('grain',tot);Inv.add('seed',2);me.sk.farm=clamp(me.sk.farm+2,0,100);L.push('收成了！粟米+'+tot+'，留種+2。');addLog('〔農〕收成粟米'+tot,'家');}
 me.sk.farm=clamp(me.sk.farm+(rand()<0.3?1:0),0,100);return Eng.L(L,'',S.place,[ch('🌾 田地','farm'),ch('↩','place')]);};
/* ---------- 搭屋 ---------- */
var BUILD=[null,{n:'草棚',need:{thatch:4,wood:3},w:3},{n:'土屋',need:{clay:6,timber:2,thatch:4},w:6},{n:'瓦屋',need:{timber:4},gold:150,w:6},{n:'宅院',need:{timber:6},gold:400,w:8}];
NODES.build=function(){var nx=(S.fam.house||0)+1;var B=BUILD[nx];if(!B)return Eng.L(['宅院已經是最好的了。'],'',S.place,[ch('↩','place')]);var L=['要搭'+B.n+'：需'+Object.keys(B.need).map(function(k){return ITEMS[k].n+B.need[k]+'（有'+(S.inv[k]||0)+'）';}).join('、')+(B.gold?'、銀'+B.gold:'')+'；工期'+B.w+'個時段（已做'+(S.fam.bw||0)+'）。'];
 var ok=Object.keys(B.need).every(function(k){return Inv.has(k,B.need[k]);})&&S.gold>=(B.gold||0);var c=[];if(ok||(S.fam.bw||0)>0)c.push(ch('🔨 動工（3 個時段）','buildDo'));else L.push('（材料不夠：茅草、柴薪去林子砍，陶土去河灘挖，木料要柴刀。）');if(Eng.house().length>2)L.push('家裡人多，一起動手會快些。');c.push(ch('🪵 去河灘挖陶土','clay'));c.push(ch('↩','place'));return Eng.L(L,'',S.place,c);};
NODES.clay=function(){Eng.pass(1);pc().sta-=12;Inv.add('clay',2);return Eng.L(['你挖了兩筐陶土。（陶土+2）'],'',S.place,[ch('🏚 搭屋','build'),ch('↩','place')]);};
NODES.buildDo=function(){var me=pc();var nx=(S.fam.house||0)+1;var B=BUILD[nx];if(me.sta<25)return Eng.L(['你累得扛不動木頭。'],'',S.place,[ch('↩','place')]);
 if(!S.fam.bw){for(var k in B.need)Inv.add(k,-B.need[k]);if(B.gold)Inv.gold(-B.gold);}Eng.pass(3);me.sta-=30;var help=Eng.house().filter(function(p){return p.id!==S.pc&&ageOf(p)>=12&&p.hp>40;}).length;S.fam.bw=(S.fam.bw||0)+3+help;me.sk.craft=clamp(me.sk.craft+1,0,100);
 if(S.fam.bw>=B.w){S.fam.house=nx;S.fam.bw=0;Fam.tierCalc();addLog('〔家〕搭好了'+B.n,'家');return Eng.L(['最後一捆茅草壓上屋頂——'+B.n+'搭好了！今夜一家人終於能睡個暖和覺。'],'',S.place,[ch('↩','place')]);}
 return Eng.L(['你們忙了大半天，'+B.n+'有了雛形。（進度 '+S.fam.bw+'/'+B.w+'）'],'',S.place,[ch('🔨 繼續動工','buildDo'),ch('↩','place')]);};
/* ---------- 經商 ---------- */
NODES.trade=function(){var L=['商隊管事拱手：「入一股，旬日之後分紅。賺賠看天意，也看您的眼光。」（經商'+pc().sk.trade+'）'];var biz=(S.fam.biz||[]).filter(function(b){return !b.done;});if(biz.length)L.push('在外的股：'+biz.map(function(b){return b.amt+'兩（'+(b.back-S.day)+'日後回）';}).join('、'));
 return Eng.L(L,'',S.place,[50,100,300].filter(function(n){return S.gold>=n;}).map(function(n){return ch('入股 '+n+' 兩','tradeDo',{n:n});}).concat([ch('↩','place')]));};
NODES.tradeDo=function(a){Inv.gold(-a.n);S.fam.biz=S.fam.biz||[];S.fam.biz.push({amt:a.n,back:S.day+8+rnd(5),done:0});Eng.pass(1);return Eng.L(['你押了'+a.n+'兩。商隊明日啟程。'],'',S.place,[ch('↩','place')]);};
Eng.on('day',function(){(S.fam.biz||[]).forEach(function(b){if(b.done||S.day<b.back)return;b.done=1;var me=pc();var r=0.05+me.sk.trade/100*0.6+(rand()-0.4)*0.6;if(S.flags.bandit&&S.day-S.flags.bandit<40&&rand()<0.3)r=-0.8;var got=Math.max(0,Math.round(b.amt*(1+r)));S.gold+=got;me.sk.trade=clamp(me.sk.trade+2,0,100);addLog('〔商〕商隊歸來：本'+b.amt+'得'+got,'商');if(!Eng.skipping)toast('🐫 商隊歸來：'+b.amt+'→'+got+'兩');});S.fam.biz=(S.fam.biz||[]).filter(function(b){return !b.done||S.day-b.back<3;});});
/* ---------- 仕途 ---------- */
NODES.exam=function(){var me=pc();if(!Rule.ok(me,'office'))return Eng.L(['吏員把你上下打量：「'+Rule.why(me,'office')+'」'],'',S.place,[ch('↩','place')]);if(S.fam.grudge&&!S.fam.grudge.done&&S.region==='frontier')return Eng.L(['「罪人之後，也想做官？」縣吏冷笑。（先為家族翻案）'],'',S.place,[ch('↩','place')]);
 if(me.office)return Eng.L(['你已是'+OFFICE[me.office]+'。每年歲末考課，政績與名聲足夠便會升遷。'],'',S.place,[ch('↩','place')]);if(S.flags.examY===Eng.yearIdx())return Eng.L(['今年的吏試已經考過了，明年再來。'],'',S.place,[ch('↩','place')]);
 var c=[];if(me.sk.lit>=25)c.push(ch('🖋 應吏試（試律令、書算）','examDo'));if(S.fam.fame>=30)c.push(ch('🎖 以名聲求察舉','examDo',{cj:1}));if(S.gold>=200)c.push(ch('💰 花二百兩買個佐史','examDo',{buy:1}));c.push(ch('↩','place'));return Eng.L(['秦以吏為師：識律令、通書算者可試為吏；名聲在外者可被察舉。（文'+me.sk.lit+'，名聲'+S.fam.fame+'）'],'',S.place,c);};
NODES.examDo=function(a){var me=pc();S.flags.examY=Eng.yearIdx();Eng.pass(2);var ok,lv=1;if(a.buy){Inv.gold(-200);ok=true;}else if(a.cj){ok=rand()<0.4+S.fam.fame/150;lv=3;}else{ok=me.sk.lit+me.at.wit*2+rnd(30)>=75;}
 if(!ok)return Eng.L([a.cj?'郡守說今年察舉的名額已有人選。':'放榜那日，榜上沒有你的名字。'],'',S.place,[ch('↩','place')]);Idn.apply({k:'appoint',to:OFFICE[lv],by:''},true);return Eng.L(['你被任為'+OFFICE[lv]+'。月俸'+OFFICE_PAY[lv]+'石。'],'',S.place,[ch('↩','place')]);};
NODES.askMedoff=function(){var me=pc();if(me.sk.med<40||S.fam.fame<12)return Eng.L(['主簿搖頭：「醫官須醫術精湛、名聲在外。」（醫術40、名聲12）'],'',S.place,[ch('↩','place')]);if(!Rule.ok(me,'office')&&S.world!=='equal')return Eng.L(['「'+Rule.why(me,'office')+'」'],'',S.place,[ch('↩','place')]);Idn.apply({k:'medoff',to:MEDOFF[1],by:''},true);return Eng.L(['你被聘為'+MEDOFF[1]+'，負責一縣疫病與獄囚的醫治。'],'',S.place,[ch('↩','place')]);};
Eng.on('year',function(){var me=pc();if(!me||!me.alive)return;if(me.office){var sc=me.sk.lit/10+S.fam.fame/20+rnd(4);if(sc>=6&&me.office<OFFICE.length-1){Idn.apply({k:'promote',by:''},true);S.queue.push({go:'note',a:{t:'歲末考課，你升任'+OFFICE[me.office]+'。'}});}}
 if(me.medoff&&me.medoff<2&&S.fam.fame>=35&&me.sk.med>=60){Idn.apply({k:'medoff',to:MEDOFF[2],by:''},true);S.queue.push({go:'note',a:{t:'你升任'+MEDOFF[2]+'。'}});}});
Eng.on('day',function(){var me=pc();if(!me)return;var pay=(OFFICE_PAY[me.office||0]+MEDOFF_PAY[me.medoff||0])/DPY;if(pay)S.gold+=Math.round(pay);if(S.fam.clinic.apps.length)S.gold=Math.max(0,S.gold-2*S.fam.clinic.apps.length);
 S.fam.clinic.apps.forEach(function(id){var p=P(id);if(p&&p.alive&&rand()<0.2)p.sk.med=clamp(p.sk.med+1,0,90);});Farm.grow();if(S.fam.clinic.open&&S.region==='xianyang'&&S.day%DPS===0){S.gold=Math.max(0,S.gold-10);}});
/* ---------- 從軍 ---------- */
NODES.enlist=function(){var me=pc();if(!Rule.ok(me,'army')&&!Gender.on())return Eng.L(['校尉擺手：「'+Rule.why(me,'army')+'」（可考慮易裝）'],'',S.place,[ch('↩','place')]);Idn.apply({k:'enlist',to:'軍醫',by:''},true);S.fam.tech.tourn=1;return Eng.L(['你在軍籍上按了手印。從今天起，你是軍醫。','軍中缺醫，箭傷、骨折、凍瘡，處處都要人。'],'',S.place,[ch('↩','place')]);};
NODES.campaign=function(){var me=pc();var d=5+rnd(4);var L=['大軍開拔。你隨軍走了'+d+'日。'];var cur=0,earn=0;for(var i=0;i<d;i++){Eng.pass(6);var r=Med.auto(pick([Med.caseOf('arrow'),Med.caseOf('fracture'),Med.caseOf('cut')]),me.sk.med,true);if(r.ok){cur++;earn+=20;}}
 S.gold+=earn;me.sk.med=clamp(me.sk.med+2,0,100);S.fam.fame+=2;L.push('你在營帳裡救治了'+cur+'名傷兵，得軍餉'+earn+'。');if(cur>=3&&rand()<0.6){Idn.apply({k:'ennoble',by:''},true);L.push('論功行賞，你得爵「'+RANKS[me.rank]+'」。');}if(rand()<0.12){Ill.add(me,'wound',2);L.push('流矢擦過你的肩頭。');}return Eng.L(L,'mengtian',S.place,[ch('↩','place')]);};
/* ---------- 江湖 ---------- */
NODES.jianghu=function(){var me=pc();var c=[ch('🗡 跟遊俠學兩招（10 錢）','jhDo',{k:'learn'}),ch('🐎 接一趟護送（數日，有險）','jhDo',{k:'escort'})];var xia=People.present().filter(function(id){return P(id).job==='xia'||id==='jingke';});if(!xia.length&&rand()<0.6){var x=genPerson({age:20+rnd(15),kind:'npc',job:'xia',pers:['仗義',pick(['開朗','暴躁','沉默'])],loc:{r:S.region,pl:S.place}});x.title='遊俠';xia=[x.id];}
 return Eng.L(['酒肆一角，幾個佩劍的漢子在擲骰。'].concat(xia.length?['其中一個是'+People.label(xia[0])+'。']:[]),xia[0]||'',S.place,c.concat(xia.length?[ch('💬 搭話','talk',{id:xia[0]})]:[]).concat([ch('↩','place')]));};
NODES.jhDo=function(a){var me=pc();if(a.k==='learn'){if(S.gold<10)return Eng.L(['錢不夠。'],'',S.place,[ch('↩','place')]);Inv.gold(-10);Eng.pass(2);me.sk.mart=clamp(me.sk.mart+2,0,100);return Eng.L(['你學了一套拳腳。（武+2）'],'',S.place,[ch('↩','place')]);}
 var d=3+rnd(3);Eng.pass(6*d);var risk=rand()*100>me.sk.mart+30;var L=['你隨商隊走了'+d+'日。'];if(risk){var dmg=10+rnd(15);me.hp=clamp(me.hp-dmg,1,100);Ill.add(me,'wound',2);L.push('途中遇上盜匪，你掛了彩。（健康-'+dmg+'）');Inv.gold(30);}else{Inv.gold(70);L.push('一路平安，得酬金七十。');}me.sk.mart=clamp(me.sk.mart+1,0,100);return Eng.L(L,'',S.place,[ch('↩','place')]);};
/* ---------- 宮廷 ---------- */
NODES.courtDuty=function(){var me=pc();Eng.pass(2);var who=pick(['yingzheng','fusu','lisi','zhaogao'].filter(alive));var L=['你入宮當值。'];if(who){People.meet(who);var ci=Med.caseOf(pick(['fever','lung','cut']));var r=Med.auto(ci,me.sk.med,true);if(r.ok){People.rel(who,{trust:4,aff:3},pc().n+'替我診治');Inv.gold(40);L.push('今日奉召為'+cn(who)+'診治'+CASES[ci].dx+'——處置得當。（賞四十兩）');}else{People.rel(who,{trust:-3});L.push('為'+cn(who)+'診治不甚得法，'+ta(P(who))+'皺著眉沒說話。');}}return Eng.L(L,who||'',S.place,[ch('💬 與'+(who?cn(who):'宮人')+'交談',who?'talk':'place',who?{id:who}:{}),ch('↩','place')]);};
NODES.audience=function(){var c=['yingzheng','fusu','lisi','mengtian'].filter(function(id){return alive(id)&&P(id).met&&!P(id).away;});if(!c.length)return Eng.L(['內侍說今日無人得暇見你。'],'',S.place,[ch('↩','place')]);return Eng.L(['你在殿外候見。'],'',S.place,c.map(function(id){return ch('求見'+cn(id),'audDo',{id:id});}).concat([ch('↩','place')]));};
NODES.audDo=function(a){var p=P(a.id);p.here={d:S.day,per:S.per,pl:S.place};Eng.keep(a.id);Eng.pass(1);return NODES.talk({id:a.id});};
/* ---------- 申冤／點卯 ---------- */
NODES.checkin=function(){S.flags.lastCheck=S.day;Eng.pass(1);return Eng.L(['你在獄掾的簿冊上按了手印。「下回別遲了。」'],'',S.place,[ch('↩','place')]);};
Eng.on('day',function(){if(S.region==='frontier'&&S.fam.grudge&&!S.fam.grudge.done&&!S.flags.fled&&S.day-(S.flags.lastCheck||S.flags.arrive||S.day)>6&&!S.evseen['ck'+S.day]){S.evseen['ck'+S.day]=1;S.flags.lastCheck=S.day;S.queue.push({go:'missCheck',stop:1});}});
NODES.missCheck=function(){Inv.gold(-Math.min(S.gold,10));pc().mood=clamp(pc().mood-6,0,100);return Eng.L(['差役找上門來：「流人逾期不點卯，罰錢十！再有下回，打板子！」'],'',S.place,[ch('……','place')]);};
NODES.appeal=function(){var g=S.fam.grudge;var me=pc();var helpers=['lisi','fusu','yingzheng'].filter(function(id){return alive(id)&&P(id).met&&P(id).trust+P(id).aff>=80;});var L=['冤情：'+g.crime+'。已蒐集線索 '+g.ev+'/3：'+(g.clues.join('、')||'無')+'。'];var c=[];
 if(g.ev>=3&&(helpers.length||me.office>=4||me.medoff>=3)){c.push(ch('📜 呈上證據，請求平反','appealDo',{by:helpers[0]||''}));}else L.push('（要翻案：集齊三條線索（行醫結識人脈、里中舊識、獄中案卷），並有朝中重臣願意相助或自身官至縣令／侍醫。）');
 c.push(ch('🔎 翻查案卷（花錢打點 20）','clue'));c.push(ch('↩','place'));return Eng.L(L,'',S.place,c);};
NODES.clue=function(){var g=S.fam.grudge;if(S.gold<20)return Eng.L(['獄吏眼皮都不抬：「沒錢看什麼案卷？」'],'',S.place,[ch('↩','place')]);Inv.gold(-20);Eng.pass(2);if(rand()<0.5&&g.clues.indexOf('案卷破綻')<0){g.clues.push('案卷破綻');g.ev++;return Eng.L(['你在發黃的竹簡裡找到一處破綻：告發者的證詞前後矛盾！（線索+1）'],'',S.place,[ch('↩','place')]);}return Eng.L(['翻了一下午，一無所獲。'],'',S.place,[ch('↩','place')]);};
NODES.appealDo=function(a){var g=S.fam.grudge;Idn.apply({k:'pardon',by:a.by||''},true);g.done=1;S.fam.fame+=10;Fam.tierCalc();WS.log(Fam.name()+'冤案得雪','起因：'+pc().n+'集齊證據，'+(a.by?cn(a.by)+'相助':'親自呈奏'),'你所為');addLog('〔家〕冤案平反','家');
 return Eng.L(['判書下來了：'+g.crime+'——查無實據，著即平反。','你把判書捧回家，'+(People.byRel('父')?cn(People.byRel('父'))+'的手抖得拿不住。':'在祖先牌位前跪了很久。'),'從此'+Fam.name()+'不再是罪人之家，可以回咸陽了。'],'',S.place,[ch('↩','place')]);};
/* ---------- 遠行（咸陽⇄邊地） ---------- */
NODES.travel=function(){if(S.fam.grudge&&!S.fam.grudge.done&&!S.flags.fled)return Eng.L(['流人不得擅離邊地。'],'',S.place,[ch('↩','map')]);var to=S.region==='xianyang'?'frontier':'xianyang';var cost=20;if(S.gold<cost)return Eng.L(['遠行要盤纏二十兩。'],'',S.place,[ch('↩','map')]);
 return Eng.L(['往'+REGIONS[to].n+'要走十日，盤纏二十兩。家人'+(S.fam.house>=2?'也一起搬去嗎？':'會跟著你。')],'',S.place,[ch('🐎 舉家遷往'+REGIONS[to].n,'travelDo',{to:to,all:1}),ch('🎒 獨自遠行（家人留守）','travelDo',{to:to}),ch('↩','map')]);};
NODES.travelDo=function(a){Inv.gold(-20);for(var i=0;i<10;i++){Eng.pass(6);}S.region=a.to;S.place=a.to==='xianyang'?'lodge':'home';if(a.all){S.home={r:a.to,pl:S.place};if(a.to==='xianyang'){S.fam.house=S.fam.house>=3?S.fam.house:0;}else S.fam.house=0;}return Eng.L(['十日跋涉，你到了'+REGIONS[a.to].n+'。'],'',S.place,[ch('繼續','place')]);};
/* ---------- 流放路 ---------- */
NODES.march=function(){var R=S.road;if(S.per>3)return Eng.L(['天色已晚，隊伍紮營了。'],'',S.place,[ch('↩','place')]);R.marched=1;Eng.pass(3);R.day++;var L=['隊伍在'+Weather.str()+'中走了半日。'];
 Eng.house().forEach(function(p){var loss=(Inv.has('sandal')&&p.id===S.pc?10:18)+(Weather.wet()?6:0)+(ageOf(p)>55||ageOf(p)<8?5:0);p.sta=clamp(p.sta-25,0,100);p.feet=clamp((p.feet==null?100:p.feet)-loss,0,100);p.cloth=clamp((p.cloth==null?100:p.cloth)-4,0,100);if(p.feet<55&&!Ill.has(p,'blister')&&rand()<0.5){Ill.add(p,'blister',1);L.push(p.n+'的腳底磨出了水泡。');}if(p.sta<10&&rand()<0.3){p.hp=clamp(p.hp-6,0,100);L.push(p.n+'走得搖搖晃晃，差點栽倒。');}});
 Inv.add('gruel',Eng.house().length>3?2:1);L.push('歇腳時，衙役分了一點稀粥。');if(R.day>=R.total){S.queue.unshift({go:'arrive'});}else if(rand()<0.55)Ev.roll('road');L.push('（第'+R.day+'/'+R.total+'日）');return Eng.L(L,'',S.place,[ch('繼續','place')]);};
Eng.on('per',function(){if(S.region!=='road'||S.road.marched||S.per!==4||S.evseen['force'+S.day])return;S.evseen['force'+S.day]=1;S.queue.push({go:'forceMarch',stop:1});});
NODES.forceMarch=function(){var g=P(S.road.guards[0]);S.road.marched=1;S.road.day++;Eng.house().forEach(function(p){p.sta=clamp(p.sta-35,0,100);p.feet=clamp((p.feet||100)-25,0,100);if(rand()<0.5)Ill.add(p,'blister',1);});pc().hp=clamp(pc().hp-5,0,100);if(S.road.day>=S.road.total)S.queue.unshift({go:'arrive'});
 return Eng.L([[g.id,'「磨蹭什麼！天黑前趕不到驛站，你們誰也別想吃飯！」'],'鞭子抽在地上，你們被趕著摸黑走了一程。（全家體力大減、腳底磨傷）'],g.id,S.place,[ch('……','place')]);};
NODES.care=function(){var L=[];Eng.pass(1);var did=0;Eng.house().forEach(function(p){if(Ill.has(p,'blister')){if(Inv.has('alcohol')){Inv.add('alcohol',-1);Ill.cure(p,'blister',3);}else Ill.cure(p,'blister',1);p.feet=clamp((p.feet||0)+25,0,100);did++;L.push('你替'+(p.id===S.pc?'自己':p.n)+'挑破水泡、裹好腳。');}if(p.cloth<40&&(Inv.has('needle')||Inv.has('thread'))){p.cloth=clamp(p.cloth+30,0,100);did++;L.push('你借著火光替'+(p.id===S.pc?'自己':p.n)+'補好了破衣。');}});if(!did)L.push('大家暫時都還好。');Eng.house().forEach(function(p){if(p.id!==S.pc)People.rel(p.id,{aff:1});});return Eng.L(L,'',S.place,[ch('↩','place')]);};
NODES.tent=function(){if(!Inv.has('cloth')&&!Inv.has('thatch'))return Eng.L(['你想搭個遮風的棚子，可手邊沒有布也沒有茅草。'],'',S.place,[ch('↩','place')]);S.flags.tent=S.day;return Eng.L(['你用'+(Inv.has('cloth')?'布':'茅草')+'和樹枝搭了個矮棚，今夜能擋些風。'],'',S.place,[ch('↩','place')]);};
NODES.arrive=function(){var R=S.road;S.region='frontier';S.place='home';S.home={r:'frontier',pl:'home'};S.fam.house=0;S.flags.arrive=S.day;S.flags.lastCheck=S.day;
 R.guards.forEach(function(id){var g=P(id);if(g)g.loc={r:'gone',pl:''};});R.mates.forEach(function(id){var m=P(id);if(m)m.loc={r:'frontier',pl:'village'};});S.road=null;Inv.add('seed',3);if(!Inv.has('hoe'))Inv.add('hoe',1);S.fam.plots=[];
 addLog('〔家〕抵達'+R.dn,'家');return Eng.L(['第'+R.total+'日，你們終於到了'+R.dn+'。'+(EXILE_DEST.filter(function(d){return d.k===R.dest;})[0]||{d:''}).d+'。','縣衙分給你們一片荒地和一把鋤頭。沒有屋，沒有糧——一切都得從頭來。','（先搭個草棚遮風擋雨，再開荒種地；每隔幾日要到縣衙點卯。）'],'',S.place,[ch('環顧四周','place')]);};
NODES.fled=function(){S.region='frontier';S.place='forest';S.home={r:'frontier',pl:'forest'};S.road=null;S.flags.fugitive=1;return Eng.L(['你在夜色裡跑了一整夜，直到再也聽不見鐵鏈聲。','從此你是逃犯——不能進城、不能落籍，只能在山林裡討生活。'],'',S.place,[ch('……','place')]);};
/* ---------- 下獄 ---------- */
NODES.held=function(){S.place=S.region==='frontier'?'yamen2':'yamen';return Eng.L(['你被關進了陰冷的牢房。'],'',S.place,[ch('……','place')]);};
NODES.heldDay=function(){Eng.pass(6);var me=pc();me.food=clamp(me.food-15,0,100);me.mood=clamp(me.mood-5,0,100);if(S.day-S.flags.held>=3||rand()<0.25){S.flags.held=0;return Eng.L(['牢門開了：「查無實據，滾吧。」'],'',S.place,[ch('出獄','place')]);}var help=Object.keys(S.ppl).filter(function(id){var p=S.ppl[id];return p.alive&&p.met&&(p.hh||p.aff>=40)&&id!==S.pc;});var h=help.length?pick(help):'';return Eng.L(['又是一日。'+(h?P(h).n+'託人送來一碗熱粥。':'')],'',S.place,[ch('……','place')]);};
NODES.heldBribe=function(){if(S.gold<30)return Eng.L(['你身上沒有足夠的錢。（要三十兩）'],'',S.place,[ch('↩','place')]);Inv.gold(-30);S.flags.held=0;addLog('〔行賄〕打點獄卒出獄','行');return Eng.L(['錢塞進獄卒手裡，第二天一早你就被放了出來。'],'',S.place,[ch('出獄','place')]);};
NODES.note=function(a){return Eng.L([a.t],'',S.place,[ch('繼續','place')]);};
