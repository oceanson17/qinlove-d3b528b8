/* ===== 身世命運（v3）：生母密令、生父之謎、幕後真兇、刺殺任務、每月解藥與五感 ===== */
ITEMS.anti={n:'月解藥',k:'med',p:0,d:'生母遣信使送來的解藥，每月（遊戲中每 10 日）須服一次'};
End.KN.mad='毒發失智';End.KN.misKill='刺殺生父';End.KN.truth='真相大白';
var Fate={SENSE:['','嗅覺','味覺','聽覺','視覺','觸覺','神智']};
Origin.norm=function(t){return String(t||'').replace(/卻像人救/g,'卻被人救').replace(/像被人救/g,'被人救').replace(/像人救了/g,'被人救了').replace(/情素/g,'情愫').replace(/山涯/g,'山崖').replace(/癡傻/g,'痴傻');};
Origin.cnum=function(s){if(/^\d+$/.test(s))return +s;var D={一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};if(s==='十')return 10;var m=s.match(/^([一二三四五六七八九])?十([一二三四五六七八九])?$/);if(m)return (m[1]?D[m[1]]:1)*10+(m[2]?D[m[2]]:0);return D[s]||null;};
/* 深度解析：生母／生父／不知情／下毒者／任務／每月解藥／五感／幕後／化名 */
Origin.deep=function(raw,o){var t=Origin.norm(raw);var F={},m,N='(\\d{1,2}|[一二三四五六七八九十]{1,3})';
 if(t!==raw){F.typo=1;}
 m=t.match(new RegExp('(?:我本是|我是|本是|乃是)(.{2,8}?)'+N+'?年?前?(?:跟|與|和|同)(.{2,4}?)(?:暗生情愫|私定終身|相戀|私通|有染|暗通款曲|相愛)?(?:之)?(?:下|後)?(?:所)?生下的?(女兒|兒子|孩子|骨肉)'));
 if(m){F.mother=m[1];F.father=m[3];if(m[4]==='女兒')o.g='f';else if(m[4]==='兒子')o.g='m';if(m[2])F.years=Origin.cnum(m[2]);}
 if(!F.mother){m=t.match(/(?:生母|母親|娘親)(?:其實)?是(.{2,6}?)(?:[，。,、]|$)/);if(m)F.mother=m[1];}
 if(!F.years){m=t.match(new RegExp(N+'年前.{0,40}生下'));if(m)F.years=Origin.cnum(m[1]);}
 if(!F.years){m=t.match(new RegExp(N+'年後'));if(m&&F.mother)F.years=Origin.cnum(m[1]);}
 if(F.years&&F.years>=10&&F.years<=40&&o.age==null)o.age=F.years;
 m=t.match(/(?:不知|不知道|並不知道|不曉得)(.{2,4}?)(?:就)?是我(?:的)?(?:親生)?(父親|生父|母親|生母|爹)/);if(m){F.unknown=m[1];if(!F.father&&/父|爹/.test(m[2]))F.father=m[1];}
 m=t.match(/被(?:我的?)?(母親|生母|娘親|娘|師父|.{2,4}?)下了?(?:劇毒|奇毒|毒)/);if(m)F.poisoner=/母|娘/.test(m[1])?'mother':m[1];
 m=t.match(/(?:要我|命我|逼我|讓我|令我)(?:親手|設法|伺機)?(殺死|殺了|刺殺|毒殺|殺掉|除掉)(.{2,4}?)(?:[，。,]|$|但|卻)/);if(m)F.target=m[2];
 if(/每(?:個)?月.{0,6}(?:服用|服|吃|喝)解藥|每月.{0,4}解藥/.test(t))F.monthly=1;
 if(/五感|失去.{0,4}(?:嗅覺|味覺|聽覺|視覺|觸覺)/.test(t))F.senses=1;if(/痴傻|瘋癲|失智/.test(t))F.mad=1;
 if(/被人陷害|遭人陷害|有心人|幕後|挑撥|嫁禍/.test(t))F.framer=1;m=t.match(/以為是(.{2,4}?)(?:找人|派人|下手|害)/);if(m)F.blamed=m[1];
 if(/跌下山崖|墜崖|落崖|跌下懸崖/.test(t))F.fall=1;if(/被人救/.test(t))F.saved=1;
 m=t.match(/以(.{1,4}?)之名/);if(m)F.alias=m[1];m=t.match(/(?:下山|前往|去|入)(秦國|咸陽)/);if(m)F.dest=m[1];if(/下山/.test(t))o.base='std';
 if(!F.mother&&!F.target&&!F.monthly)return o;
 if(F.target&&F.father&&F.target===F.father)F.patricide=1;
 o.fate=F;var it=[];var g=o.g==='m'?'兒子':'女兒';
 it.push('主角：'+(o.g==='m'?'男':'女')+(o.age!=null?'，'+o.age+' 歲':'')+(F.years?'（'+F.years+' 年前出生）':''));
 if(F.mother)it.push('生母：'+F.mother+(F.fall?'（當年懷著你被人陷害，連人帶馬車跌下山崖'+(F.saved?'，獲救後生下你':'')+'）':'')+(F.poisoner==='mother'?'；如今是下令者，對你下毒，每月遣信使送解藥':''));
 if(F.father)it.push('生父：'+F.father+'【秘密】'+(F.unknown?'你並不知道；'+F.father+'也不知道你的存在（知情防火牆守住）':''));
 if(F.framer)it.push('幕後：有心人陷害'+(F.mother||'生母')+(F.blamed?'，令她以為是'+F.blamed+'下的手':'')+'【秘密：真兇是誰留待揭開，有伏線】');
 if(F.target)it.push('任務：親手殺死'+F.target+(F.patricide?'（你不知道他是你的生父）':'')+'——可完成、拖延、放棄或揭穿真相');
 if(F.poisoner||F.monthly)it.push('劇毒：'+(F.monthly?'每月須服解藥':'須定期服解藥')+'；遲服依次失去嗅覺→味覺→聽覺→視覺→觸覺'+(F.mad?'，最後痴傻':'')+'（爽玩模式只會病發，不會惡化到底）；身為西醫可研究解毒配方');
 if(F.alias)it.push('身分：以「'+F.alias+'」之名'+(F.dest?'入'+F.dest:'下山')+'（仍用西醫手法；標準開局的醫術與器具保留）');
 if(F.typo)it.push('已容錯：錯字按語意理解（如「卻像人救了」→「卻被人救了」、「情素」→「情愫」、「山涯」→「山崖」）');
 o.items=it.concat(o.items.filter(function(x){return !/^性別|^年齡/.test(x);}));return o;};
(function(){var op=Origin.parse;Origin.parse=function(text){var o=op(text);if(!o.raw)return o;o.items=o.items.filter(function(x){return x.indexOf('未能解析')<0;});Origin.deep(o.raw,o);if(!o.items.length)o.items.push('（未能解析出具體設定；將作為背景敘述保留，AI 會參考）');return o;};})();
/* AI 精修：在離線結果上補欄位 */
(function(){var orf=Origin.refine;Origin.refine=function(text){var msgs=[{role:'system',content:'你是古代人生模擬遊戲的設定解析器。玩家寫的身世可能有錯字，請按語意理解。只輸出 JSON：{"g":"m|f 或空","age":數字或null,"mother":"生母稱號或空","father":"生父名或空","fatherUnknown":true/false（主角是否不知道生父身分）,"poisoner":"mother|其他人名|空","target":"任務要殺的人或空","monthly":true/false,"senses":true/false,"mad":true/false,"framer":true/false,"blamed":"生母誤以為的兇手或空","alias":"化名或空","dest":"前往之地或空","typos":["錯字→正字"]}'},{role:'user',content:text}];
 var tok=AI.isReasoner()?Math.max(2500,SET.maxTok||2600):800;var to=AI.isReasoner()?Math.max(90,SET.aiTimeout||60):Math.max(45,SET.aiTimeout||60);
 function merge(j){var o=Origin.parse(text);var F=o.fate||{};var add=[];
  function s(v,n){return v?String(v).replace(/[「」"]/g,'').slice(0,n||8):'';}
  if(j.mother&&!F.mother){F.mother=s(j.mother);add.push('生母（AI）：'+F.mother);}if(j.father&&!F.father){F.father=s(j.father,4);add.push('生父（AI）：'+F.father+'【秘密】');}
  if(j.fatherUnknown&&!F.unknown&&F.father){F.unknown=F.father;add.push('生父身分主角不知（AI）');}if(j.poisoner&&!F.poisoner){F.poisoner=/母|mother/.test(j.poisoner)?'mother':s(j.poisoner,4);add.push('下毒者（AI）：'+(F.poisoner==='mother'?'生母':F.poisoner));}
  if(j.target&&!F.target){F.target=s(j.target,4);add.push('任務（AI）：殺死'+F.target);}if(j.monthly&&!F.monthly){F.monthly=1;add.push('每月解藥（AI）');}if(j.senses&&!F.senses){F.senses=1;add.push('五感漸失（AI）');}if(j.mad&&!F.mad){F.mad=1;add.push('最終痴傻（AI）');}
  if(j.framer&&!F.framer){F.framer=1;add.push('幕後有心人（AI）');}if(j.blamed&&!F.blamed){F.blamed=s(j.blamed,4);}if(j.alias&&!F.alias){F.alias=s(j.alias,4);add.push('化名（AI）：'+F.alias);}
  if(j.age&&o.age==null){o.age=clamp(j.age|0,10,60);add.push('年齡（AI）：'+o.age);}if(j.g&&!o.g)o.g=j.g==='m'?'m':'f';if(j.typos&&j.typos.length){F.typo=1;add.push('錯字（AI）：'+j.typos.slice(0,3).join('；'));}
  if(F.target&&F.father&&F.target===F.father)F.patricide=1;if(Object.keys(F).length)o.fate=F;o.items=o.items.concat(add);o.ai=1;return o;}
 function once(extra){var m=msgs;if(extra)m=msgs.concat([{role:'user',content:extra}]);return AI.call(m,{maxTok:tok,timeout:to}).then(function(r){var j=AI.extractJSON(r.text);if(!j)throw {kind:'parse',raw:r.text};return merge(j);});}
 return once().then(null,function(e){if(e&&(e.kind==='parse'||e.kind==='empty'))return once('上次輸出不是合法 JSON，請只輸出一個 JSON 物件，不要 markdown、不要解釋。').then(null,function(e2){throw e2.raw?e2:{kind:e2.kind||'parse',raw:e.raw||e2.raw||''};});throw e;});};})();
/* 落實 */
Fate.apply=function(o){var F=o&&o.fate;if(!F)return;var me=pc();if(o.age!=null){me.born=S.day-o.age*DPY-rnd(DPY);}
 var fa=F.father?People.idByName(F.father):'';var tg=F.target?People.idByName(F.target):'';
 if(F.father&&!fa){var q=genPerson({g:'m',age:ageOf(me)+25,kind:'npc',job:'clerk',met:0,pers:['精明','多疑'],loc:{r:'xianyang',pl:'yamen'}});q.n=F.father;q.sur=F.father.slice(0,1);q.gn=F.father.slice(1);fa=q.id;}
 if(F.target&&!tg)tg=F.target===F.father?fa:'';
 var mo=genPerson({g:'f',age:ageOf(me)+17+rnd(3),kind:'npc',job:'none',met:1,aff:35,trust:25,pers:['多疑','暴躁']});mo.n=F.mother||'生母';mo.sur='';mo.gn=mo.n;mo.title='生母';mo.rel='母';mo.away=1;mo.loc=null;me.par=[mo.id];
 var ms=genPerson({g:'f',age:24,kind:'npc',job:'none',met:1,aff:20,trust:20,pers:['沉默','精明']});ms.n='青鸞';ms.sur='';ms.gn='青鸞';ms.title='信使';ms.away=1;ms.loc=null;
 var fr=null;if(F.framer){fr=genPerson({g:'m',age:52,kind:'npc',job:'none',met:0,pers:['狡猾','善妒']});fr.n='田穆';fr.sur='田';fr.gn='穆';fr.title='齊國宗室';fr.away=1;fr.loc=null;}
 S.fate={mo:mo.id,ms:ms.id,fa:fa,fr:fr?fr.id:'',tg:tg,alias:F.alias||''};
 if(fa){var f1=FW.add('主角的生父其實是'+F.father+'（'+(F.mother||'生母')+'與'+F.father+'當年所生）',[mo.id],mo.id,{secret:1,k:'truthFather',kw:['生父','親生父親','親生女兒','親生兒子',F.father+'的女兒',F.father+'的兒子',F.father+'之女','父女相認','骨肉'],pcKnows:false});f1.hidePc=1;S.fate.f1=f1.id;P(fa).notes.secretKid=S.pc;}
 if(fr){var f2=FW.add('當年推'+(F.mother||'公主')+'馬車墜崖、再嫁禍'+(F.blamed||F.father||'他人')+'的，是'+fr.n,[fr.id],fr.id,{secret:1,k:'truthFramer',kw:[fr.n,'嫁禍','真兇'],pcKnows:false});f2.hidePc=1;S.fate.f2=f2.id;
  FW.add((F.mother||'生母')+'深信當年是'+(F.blamed||F.father||'仇人')+'派人推她的馬車墜崖',[S.pc,mo.id,ms.id],mo.id,{secret:1,k:'belief',kw:[]});}
 if(tg){FW.add('主角奉'+(F.mother||'生母')+'之命，要親手殺死'+F.target,[S.pc,mo.id,ms.id],S.pc,{secret:1,k:'mission',kw:['刺殺','行刺','奉命','取'+F.target+'性命','殺'+F.target]});S.mis={st:'active',tg:tg,start:S.day,delay:0,clues:0,saved:0};}
 if(F.poisoner||F.monthly){FW.add('主角身中'+(F.poisoner==='mother'?'生母':'他人')+'所下劇毒，須'+(F.monthly?'每月':'定期')+'服解藥，否則五感漸失',[S.pc,mo.id,ms.id],S.pc,{secret:1,k:'origin',kw:['劇毒','解藥','五感','毒發']});
  S.anti={cyc:10,due:S.day+10,next:S.day+9,stage:0,cure:0,cured:0,fits:0,miss:0,mad:F.mad?1:0};Inv.add('anti',1);}
 if(F.alias){me.title=F.alias;S.fam.fame=(S.fam.fame||0)+8;}
 S.origin.lines=S.origin.lines.filter(function(l){return l.indexOf('親生')<0;});
 var L=S.origin.lines;if(F.mother)L.push('臨行前，'+F.mother+'把一碗黑沉沉的藥灌進你喉嚨：「這叫『月蝕』。每月一服解藥，青鸞會送來。」');
 if(tg)L.push('「到了秦國，找機會親手殺了'+F.target+'——'+(F.blamed===F.target?'當年就是他派人推我落崖':'為我報仇')+'。」');
 if(F.alias)L.push('於是你以「'+gw(me,'神醫','女神醫')+'」之名下山，往'+(F.dest||'秦國')+'去。藥箱裡裝的，仍是師父教你的刀圭、酒精與縫線。');
 addLog('〔身世〕奉母命入秦，身中月蝕之毒','身');};
(function(){var oa=Origin.apply;Origin.apply=function(o){if(o&&o.fate){var raw=o.raw;o.raw=(o.fate.mother?o.fate.mother+'之'+gw(pc(),'子','女'):'')+'，奉母命入秦'+(o.fate.target?'刺殺'+o.fate.target:'')+'，身中劇毒（生父身分不明）';oa(o);o.raw=raw;S.origin.raw=raw;Fate.apply(o);}else oa(o);};})();
/* 每日：信使、服藥、毒發 */
Fate.take=function(auto){var A=S.anti;if(!A||!Inv.has('anti'))return false;Inv.add('anti',-1);var was=A.stage;A.due=S.day+A.cyc;A.stage=0;if(!auto)toast('💊 服下月解藥');if(was>0)addLog('〔毒〕服下解藥，失去的'+Fate.SENSE.slice(1,was+1).join('、')+'慢慢回來了','毒');return true;};
Fate.cap=function(){return SET.diff==='easy'?2:(S.anti&&S.anti.mad?6:5);};
Fate.day=function(){var A=S.anti,me=pc();if(!A||A.cured||!me||!me.alive)return;var M=S.mis||{};
 if(S.day>=A.next){A.next=S.day+A.cyc;var give=M.st!=='quit'&&M.st!=='truth'||S.fate.momOk;if(M.st==='delay'&&M.delay>=3&&!S.fate.momOk){give=false;M.delay=1;S.queue.push({go:'antiMsg',a:{k:'warn'},stop:1});}
  else if(give){Inv.add('anti',1);S.queue.push({go:'antiMsg',a:{k:'give'},stop:1});}}
 if(Inv.has('anti')&&S.day>=A.due-1&&(SET.aflauto!==false||Eng.skipping)){Fate.take(true);return;}
 if(S.day>A.due){var late=S.day-A.due;var st=Math.min(Fate.cap(),1+Math.floor((late-1)/2));if(st>A.stage){A.stage=st;A.fits++;S.queue.push({go:'antiFit',a:{st:st},stop:1});}
  me.mood=clamp(me.mood-2*A.stage,0,100);me.hp=clamp(me.hp-(A.stage>=3?3:1),1,100);}};
Eng.on('day',function(){Fate.day();});
Fate.research=function(){var A=S.anti,me=pc();if(!A||A.cured)return '';Eng.pass(2);var add=2+Math.floor(me.sk.med/20)+(A.stage>0?2:0)+(Inv.has('anti')?2:0)+(S.mis&&S.mis.saved?3:0);A.cure=clamp(A.cure+add,0,100);
 if(A.cure>=100){A.cured=1;A.stage=0;addLog('〔毒〕配出了「月蝕」的解毒方','醫');return '最後一味藥試對了。你把自己的血滴進碗裡，看著它由黑轉紅——「月蝕」的毒，解了。從今以後，再也不必等誰送藥。';}
 return '你取一點解藥細細蒸餾、分層，又對照自己毒發時的脈象與瞳孔，一筆筆記下。（解毒研究 '+A.cure+'%，＋'+add+'）';};
NODES.antiMsg=function(a){var A=S.anti,ms=P(S.fate.ms),mo=P(S.fate.mo);var M=S.mis||{};var L=[];
 if(a.k==='warn'){L=['入夜，'+ms.n+'像影子一樣落在你窗前，兩手空空。',[ms.id,'「主人說：拖得太久了。這個月的解藥——沒有。」'],'（下次再拖，毒就要發了。要麼動手，要麼自己想辦法。）'];}
 else{L=[ms.n+'趁夜送來一個小瓷瓶：這個月的解藥。'];var tg=P(M.tg);if(M.st==='active'||M.st==='delay')L.push([ms.id,'「主人問：'+(tg?tg.n:'那人')+'，什麼時候死？」']);else if(M.st==='done')L.push([ms.id,'「主人說，你做得很好。」她的聲音卻沒有一點高興。']);
  if(ms.aff>=30&&S.fate.fr&&M.clues<2&&rand()<0.5){L.push([ms.id,'（她欲言又止）「……當年送公主上路的，是'+P(S.fate.fr).title+'的人。我只說這一句。」']);Fate.clue(2);}}
 var c=[];if(Inv.has('anti'))c.push(ch('💊 現在就服','antiDo',{k:'take'}));c.push(ch('收好','place'));if(M.st==='active'||M.st==='delay')c.splice(c.length-1,0,ch('🗡 母命……','misMenu'));return Eng.L(L,ms.id,S.place,c);};
NODES.antiFit=function(a){var st=a.st;var me=pc();var sense=Fate.SENSE[st];var T={1:'你忽然聞不到藥爐的苦味了——鼻子裡空空的，像被誰抽走了什麼。',2:'飯菜到了嘴裡，只剩下溫度和形狀。味道，沒了。',3:'人聲一點點遠去，像隔著一層厚厚的水。你再也聽不清病人的心音。',4:'眼前蒙上一層灰霧，連燭火都只是一團模糊的光。',5:'指尖摸不出脈搏，針扎在手背上也沒有感覺。',6:'你坐在那裡，忽然想不起自己要做什麼……'};
 var L=['「月蝕」發作了。'+T[st],'（失去：'+Fate.SENSE.slice(1,st+1).join('、')+'）'];if(st>=Fate.cap()&&SET.diff==='easy')L.push('（爽玩模式：毒性到此為止，不會再惡化。）');
 var here=People.present().filter(function(id){return P(id).aff>=30;});if(here.length){var h=here[0];L.push(P(h).n+'察覺你不對勁，一把扶住了你。');var f=FW.byK('origin');if(f&&f.kn.indexOf(h)<0)FW.learn(h,f.id,100,'witness');}
 var c=[];if(st>=6){return Eng.L(L.concat(['你最後記得的，是窗外的月亮——像那碗藥一樣，黑沉沉的。']),'',S.place,[ch('🎬 這一生的結局','endGo',{kind:'mad'})]);}
 if(Inv.has('anti'))c.push(ch('💊 服下解藥','antiDo',{k:'take'}));if(!S.anti.cured)c.push(ch('🧪 趁還清醒，研究解毒','antiDo',{k:'res'}));c.push(ch('硬撐','place'));return Eng.L(L,here[0]||'',S.place,c);};
NODES.antiDo=function(a){if(a.k==='take'){var st=S.anti.stage;Fate.take();return Eng.L(['你把解藥一口吞下。'+(st?'過了半個時辰，失去的'+Fate.SENSE.slice(1,st+1).join('、')+'一點一點回來了。':'喉間一陣冰涼，下一次毒發被推遲了。')],'',S.place,[ch('繼續','place')]);}
 return Eng.L([Fate.research()],'',S.place,[ch('繼續','place')]);};
/* 刺殺任務 */
Fate.CLUES=['呂府的老僕喝多了，說十六年前相國曾派人四處尋找一位墜崖的齊國女子，找了整整一年，找到的只有一輛摔爛的馬車。','信使說漏了嘴：當年「護送」公主車駕的，是齊國宗室的人。','你在相國書房的匣中瞥見一支舊玉簪——和母親留給你的那支，紋樣一模一樣，像是一對。'];
Fate.clue=function(n){var M=S.mis;if(!M)return '';n=n||M.clues+1;if(n<=M.clues)return '';M.clues=n;var t=Fate.CLUES[n-1];addLog('〔伏線〕'+t.slice(0,24)+'…','秘');FW.add('伏線'+n+'：'+t,[S.pc],S.pc,{k:'clue'});return t;};
NODES.misMenu=function(){var M=S.mis,tg=P(M.tg),A=S.anti||{};var me=pc();var L=['母命：親手殺死'+tg.n+'。'+(M.st==='delay'?'（你已回信拖延 '+M.delay+' 次）':'')];
 if(A.due)L.push('月解藥：'+(A.cured?'已解毒':'下次須在第 '+A.due+' 日前服下'+(Inv.has('anti')?'（身上有 '+S.inv.anti+' 服）':'（身上沒有）')+(A.stage?'；已失去'+Fate.SENSE.slice(1,A.stage+1).join('、'):'')+'；解毒研究 '+A.cure+'%'));
 L.push('伏線：'+M.clues+'/3');var here=People.where(M.tg)===S.place&&tg.alive;var c=[];
 c.push(ch('🔎 打探'+tg.n+'（1 時辰）','misDo',{k:'spy'}));if(here&&tg.met)c.push(ch('🗡 趁四下無人，動手','misDo',{k:'kill'}));c.push(ch('✉ 回信敷衍，再拖一拖','misDo',{k:'delay'}));
 if(M.clues>=3&&tg.met&&tg.alive)c.push(ch('📜 把查到的一切攤開——揭穿真相','misDo',{k:'truth'}));c.push(ch('✋ 放棄任務（解藥會斷）','misDo',{k:'quit'}));if(!A.cured&&A.due)c.push(ch('🧪 研究解毒配方（2 時辰）','antiDo',{k:'res'}));c.push(ch('↩','place'));return Eng.L(L,'',S.place,c);};
NODES.misDo=function(a){var M=S.mis,tg=P(M.tg),mo=P(S.fate.mo),me=pc();var L=[];
 if(a.k==='spy'){Eng.pass(1);var p0=0.3+(tg.met?0.15:0)+(tg.aff>=30?0.2:0);if(M.clues<3&&rand()<p0){L.push(Fate.clue());if(M.clues>=3)L.push('（三條線索連在一起，你心裡升起一個可怕的念頭……）');}else L.push(tg.n+'今日'+(People.where(M.tg)?'在'+PLACES[People.where(M.tg)].n:'不知去向')+'；身邊總跟著幾個門客'+(S.ppl.xuanye&&!S.ppl.xuanye.met?'，還有一道看不清的影子':'')+'。');}
 else if(a.k==='delay'){M.st='delay';M.delay++;mo.aff=clamp(mo.aff-5,-100,100);L.push('你寫了一封回信：「相國府戒備森嚴，尚需時日。」信使接過去，看了你很久。');}
 else if(a.k==='quit'){M.st='quit';mo.aff=clamp(mo.aff-40,-100,100);L.push('你把母親的密令放進燭火。從今以後，不會再有人送解藥來了——除非你自己配得出來。');addLog('〔母命〕放棄刺殺','秘');}
 else if(a.k==='kill'){People.die(M.tg,'遇刺');M.st='done';addLog('〔母命〕親手殺死了'+tg.n,'秘');L.push('你的手很穩——這雙手縫過無數傷口，知道刀該從哪裡進去。'+tg.n+'倒下時，袖中滑出一支舊玉簪。');L.push('那紋樣，和母親給你的那支一模一樣。');if(S.fate.f1){FW.learn(S.pc,S.fate.f1,100,'witness');L.push('（你忽然明白了什麼。太遲了。）');}return End.milestone('misKill',{id:M.tg},Eng.L(L,'',S.place,[ch('繼續','place')]));}
 else if(a.k==='truth'){M.st='truth';M.saved=1;if(S.fate.f1){FW.learn(S.pc,S.fate.f1,100,'witness');FW.learn(M.tg,S.fate.f1,100,'told');}if(S.fate.f2){FW.learn(S.pc,S.fate.f2,100,'witness');FW.learn(M.tg,S.fate.f2,100,'told');}
  People.rel(M.tg,{aff:30,trust:30},pc().n+'說出了身世與母命');L.push('你把玉簪、老僕的話、信使的話一件件擺在'+tg.n+'面前，最後說出了母親的名字。');L.push([M.tg,'（沉默了很久）「……我找了她一年。」他的聲音第一次啞了。「當年的事，是'+(S.fate.fr?P(S.fate.fr).title+P(S.fate.fr).n:'有人')+'做的手腳。孩子——你娘恨錯了人。」']);L.push('（相國府會傾力幫你研究解毒；但母親那邊，解藥大概不會再來了。）');addLog('〔母命〕揭穿真相','秘');return End.milestone('truth',{id:M.tg},Eng.L(L,M.tg,S.place,[ch('✉ 寫信告訴母親真相','misDo',{k:'tellMom'}),ch('繼續','place')]));}
 else if(a.k==='tellMom'){if(rand()<0.6+(mo.aff>0?0.2:0)){S.fate.momOk=1;mo.aff=clamp(mo.aff+20,-100,100);L.push('半個月後，青鸞帶回一封信和一瓶解藥。信上只有一行字，墨跡被淚水洇開了：「是娘錯了。」');Inv.add('anti',1);}else L.push('信送出去了，石沉大海。');}
 return Eng.L(L,'',S.place,[ch('繼續','place')]);};
(function(){var oacts=Place.acts;Place.acts=function(){var c=oacts.apply(this,arguments);if(S.mis&&(S.mis.st==='active'||S.mis.st==='delay')&&pc().alive)c.splice(Math.max(0,c.length-1),0,ch('🗡 母命','misMenu'));else if(S.anti&&!S.anti.cured)c.splice(Math.max(0,c.length-1),0,ch('🧪 月蝕之毒','misAnti'));return c;};})();
NODES.misAnti=function(){var A=S.anti;return Eng.L(['月解藥：'+(Inv.has('anti')?'身上有 '+S.inv.anti+' 服':'身上沒有')+'；下次須在第 '+A.due+' 日前服下。'+(A.stage?'已失去'+Fate.SENSE.slice(1,A.stage+1).join('、')+'。':'')+'解毒研究 '+A.cure+'%。'],'',S.place,[Inv.has('anti')?ch('💊 服藥','antiDo',{k:'take'}):null,ch('🧪 研究解毒配方（2 時辰）','antiDo',{k:'res'}),ch('↩','place')].filter(Boolean));};
