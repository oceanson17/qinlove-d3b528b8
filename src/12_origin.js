/* ===== 自設身世解析（M14 Origin）＋舊毒（Poison） ===== */
var Origin={};
Origin.SK={醫:'med',醫術:'med',武:'mart',武藝:'mart',劍:'mart',文:'lit',詩書:'lit',律令:'lit',商:'trade',經商:'trade',農:'farm',種田:'farm',手藝:'craft',木工:'craft',織:'craft'};
Origin.parse=function(text){text=String(text||'').trim().slice(0,400);var o={raw:text,items:[],secrets:[],skills:{},tags:[]};if(!text)return o;var m;
 var B=[[/流放|罪臣|獲罪|抄家/,'exile'],[/農家|農夫|耕讀|佃戶/,'farm'],[/商賈|商人|布商|富商/,'merchant'],[/世家|士族|貴族|官宦/,'gentry'],[/醫者|醫家|大夫之家|郎中/,'tradoc'],[/孤兒|孤女|無父無母|棄嬰/,'orphan']];
 B.forEach(function(b){if(!o.birth&&b[0].test(text)){o.birth=b[1];o.items.push('出身：'+BIRTHS.filter(function(x){return x.k===b[1];})[0].n);}});
 if(/我是男|男子|少年郎|公子/.test(text)&&!/女扮男裝/.test(text))o.g='m';if(/我是女|女子|姑娘|少女/.test(text)||/女扮男裝/.test(text))o.g='f';if(o.g)o.items.push('性別：'+(o.g==='m'?'男':'女'));
 m=text.match(/(\d{1,2})歲/);if(m){o.age=clamp(+m[1],0,60);o.items.push('年齡：'+o.age);}
 m=text.match(/(?:親生|真正的)?(父親|母親|生父|生母)(?:其實)?是(.{2,4}?)(?:[，。,、]|$)/);if(m){var id=People.idByName?'':'';o.parent={rel:/父/.test(m[1])?'父':'母',nm:m[2]};o.secrets.push({t:'主角的'+(/父/.test(m[1])?'生父':'生母')+'其實是'+m[2],kw:[m[2],'親生','私生'],who:m[2]});o.items.push('身世秘密：'+m[1]+'是'+m[2]);}
 m=text.match(/(?:其實|真實身分|真正身分|身世)是(.{2,10}?)(?:[，。,]|$)/);if(m&&!o.parent){o.secrets.push({t:'主角真實身分是'+m[1],kw:[m[1].slice(-2)]});o.items.push('隱藏身分：'+m[1]);}
 m=text.match(/(?:中了?|身中|體內有|身負)(.{0,6}?)(?:之)?毒/);if(m){o.poison={n:(m[1]||'奇').replace(/^了/,'')+'毒',lv:2};o.items.push('舊毒：'+o.poison.n+'（需定期服緩解藥，可研究解法）');o.secrets.push({t:'主角身中'+o.poison.n,kw:['中毒','毒發',o.poison.n]});}
 m=text.match(/(?:仇人|仇家|殺父仇人|宿敵)(?:是|乃)?(.{2,4}?)(?:[，。,]|$)/);if(m){o.foe=m[1];o.items.push('仇人：'+m[1]);}
 m=text.match(/(?:立志|想要|發誓要|夢想是|心願是)(.{2,14}?)(?:[，。,]|$)/);if(m){o.goal=m[1];o.items.push('志向：'+m[1]);}
 var re=/(?:擅長|精通|自幼學|善於)(醫術|醫|武藝|武|劍|文|詩書|律令|經商|商|種田|農|手藝|木工|織)/g;while((m=re.exec(text))){o.skills[Origin.SK[m[1]]]=15;o.items.push('專長：'+m[1]);}
 m=text.match(/(\d{1,4})兩/);if(m){o.gold=clamp(+m[1],0,500);o.items.push('盤纏：'+o.gold+'兩');}else if(/身無分文|一貧如洗/.test(text)){o.gold=0;o.items.push('盤纏：身無分文');}else if(/家財萬貫|富甲一方/.test(text)){o.gold=500;o.items.push('盤纏：500 兩（上限）');}
 if(/女扮男裝|男扮女裝|易裝/.test(text)){o.disg=1;o.items.push('易裝度日（M16 稱呼系統啟用）');}
 if(/師父|拜師|學過西醫|跟.*學醫/.test(text)){o.tags.push('master');o.items.push('曾隨隱士學醫（已會基礎技法）');}
 if(!o.items.length)o.items.push('（未能解析出具體設定；將作為背景敘述保留，AI 會參考）');return o;};
Origin.preview=function(o){return o.items.map(function(x){return '· '+x;}).join('\n');};
Origin.apply=function(o){if(!o)return;var me=pc();S.origin={raw:o.raw,lines:[],goal:o.goal||'',foe:o.foe||''};
 if(o.skills)for(var k in o.skills)me.sk[k]=Math.max(me.sk[k],o.skills[k]);if(o.gold!=null)S.gold=o.gold;
 if(o.tags.indexOf('master')>=0){TECH_BASIC.forEach(function(t){S.fam.tech[t]=1;});me.sk.med=Math.max(me.sk.med,30);Inv.add('steth',1);}
 (o.secrets||[]).forEach(function(s){var kn=[S.pc];var wid=s.who?People.idByName(s.who):'';FW.add(s.t,kn,S.pc,{secret:1,kw:s.kw,k:'origin'});});
 if(o.parent){var pid=People.idByName(o.parent.nm);if(pid&&pid!==S.pc){P(pid).notes.secretKid=S.pc;S.origin.lines.push('你一直知道，'+cn(pid)+'是你真正的'+(o.parent.rel==='父'?'父親':'母親')+'——只是對方未必知道。');}else S.origin.lines.push('你的親生'+(o.parent.rel==='父'?'父親':'母親')+'叫'+o.parent.nm+'，下落不明。');}
 if(o.poison){S.afl={n:o.poison.n,lv:o.poison.lv,last:S.day,cure:0,fits:0};Ill.add(me,'afl',2);Inv.add('dose',3);S.origin.lines.push('你體內的'+o.poison.n+'每隔幾日便要發作，懷裡的緩解藥只剩三副。');}
 if(o.foe){var f=People.idByName(o.foe);if(!f){var q=genPerson({age:40,kind:'npc',job:'clerk',pers:['狡猾','刻薄'],loc:{r:'xianyang',pl:'yamen'}});q.sur=o.foe.slice(0,1);q.gn=o.foe.slice(1);q.n=o.foe;q.aff=-40;f=q.id;}else P(f).aff=Math.min(P(f).aff,-30);S.origin.foeId=f;S.origin.lines.push('你忘不了仇人'+o.foe+'的名字。');}
 if(o.disg)Gender.start(me.g==='f'?'m':'f');if(o.goal)S.origin.lines.push('你的心願：'+o.goal+'。');
 FW.add(me.n+'的身世：'+o.raw.slice(0,60),[S.pc],S.pc,{secret:1,k:'originRaw'});addLog('〔身世〕'+o.raw.slice(0,40),'身');};
Origin.refine=function(text){var msgs=[{role:'system',content:'你是古代人生模擬遊戲的設定解析器。把玩家寫的身世解析成 JSON：{"birth":"exile|farm|merchant|gentry|tradoc|orphan 或空","g":"m|f 或空","age":數字或null,"secrets":[{"t":"秘密一句","kw":["關鍵字"]}],"poison":{"n":"毒名","lv":1-3}或null,"foe":"仇人名或空","goal":"志向或空","skills":{"med|mart|lit|trade|farm|craft":15},"gold":數字或null,"disg":true/false,"master":true/false}。只輸出 JSON。'},{role:'user',content:text}];
 return AI.call(msgs,{maxTok:600}).then(function(r){var j=AI.extractJSON(r.text);if(!j)throw {kind:'parse'};var o=Origin.parse(text);if(j.birth&&BIRTHS.some(function(b){return b.k===j.birth;})&&!o.birth){o.birth=j.birth;o.items.push('出身（AI）：'+BIRTHS.filter(function(b){return b.k===j.birth;})[0].n);}
  (j.secrets||[]).slice(0,3).forEach(function(s){if(s&&s.t&&!o.secrets.some(function(x){return x.t===s.t;})){o.secrets.push({t:String(s.t).slice(0,60),kw:(s.kw||[]).slice(0,4)});o.items.push('秘密（AI）：'+s.t);}});
  if(j.poison&&j.poison.n&&!o.poison){o.poison={n:String(j.poison.n).slice(0,6),lv:clamp(j.poison.lv|0||2,1,3)};o.items.push('舊毒（AI）：'+o.poison.n);}if(j.foe&&!o.foe){o.foe=String(j.foe).slice(0,4);o.items.push('仇人（AI）：'+o.foe);}if(j.goal&&!o.goal){o.goal=String(j.goal).slice(0,14);o.items.push('志向（AI）：'+o.goal);}
  if(j.skills)for(var k in j.skills)if(ME_K[k]&&!o.skills[k]){o.skills[k]=clamp(j.skills[k]|0,0,20);o.items.push('專長（AI）：'+k);}if(j.master&&o.tags.indexOf('master')<0){o.tags.push('master');o.items.push('曾隨隱士學醫（AI）');}if(j.disg&&!o.disg){o.disg=1;o.items.push('易裝（AI）');}
  o.items=o.items.filter(function(x){return x.indexOf('未能解析')<0;});return o;});};
/* ---- 舊毒 ---- */
var Poison={
 tick:function(){var A=S.afl;if(!A||A.cured)return;var me=pc();var gap=S.day-A.last;if(gap>=3&&SET.aflauto!==false&&Inv.has('dose')){Poison.dose(true);return;}if(gap>=4&&rand()<0.25+0.1*(gap-4)){A.fits++;me.hp=clamp(me.hp-8*A.lv,1,100);S.queue.push({go:'aflFit',stop:1});}},
 dose:function(auto){var A=S.afl;if(!A||!Inv.has('dose'))return false;Inv.add('dose',-1);A.last=S.day;if(!auto)toast('💊 服下緩解藥');return true;},
 research:function(){var A=S.afl;if(!A||A.cured)return '';var me=pc();Eng.pass(2);A.cure=clamp(A.cure+3+Math.floor(me.sk.med/15)+(Inv.has('notes')?3:0),0,100);if(A.cure>=100){A.cured=1;Ill.cure(me,'afl',9);addLog('〔身世〕解開了體內的'+A.n,'醫');return '你終於配出了解藥。喝下去的那一刻，糾纏多年的'+A.n+'，散了。';}return '你對著自己的脈象與症狀推演解法。（解毒研究 '+A.cure+'%）';}
};
NODES.aflFit=function(){var A=S.afl;var here=People.present().filter(function(id){return P(id).aff>=30;});var L=['體內的'+A.n+'發作了。你蜷在地上，冷汗濕透了衣裳。'];var c=[];if(Inv.has('dose'))c.push(ch('💊 掙扎著服下緩解藥','aflDo',{k:'dose'}));if(here.length){var h=here[0];L.push(P(h).n+'衝過來扶住了你。');Bond.apply(h,{e:{依賴:2,愛慕:2},th:'擔心'+pc().n+'的病'});People.rel(h,{trust:3},'在'+pc().n+'毒發時救了'+ta(pc()));if(FW.secretsOf().some(function(f){return f.k==='origin'&&/毒/.test(f.t)&&f.kn.indexOf(h)<0;})){var f=FW.secretsOf().filter(function(f){return f.k==='origin'&&/毒/.test(f.t);})[0];FW.learn(h,f.id,100,'witness');}}
 c.push(ch('硬撐過去','aflDo',{k:'bear'}));return Eng.L(L,here[0]||'',S.place,c);};
NODES.aflDo=function(a){if(a.k==='dose'){Poison.dose();pc().hp=clamp(pc().hp+6,0,100);return Eng.L(['藥效慢慢化開，疼痛退了下去。'],'',S.place,[ch('繼續','place')]);}Eng.pass(2);pc().hp=clamp(pc().hp-6,1,100);return Eng.L(['你咬著牙熬過了兩個時辰。'],'',S.place,[ch('繼續','place')]);};
Eng.on('day',function(){Poison.tick();});
RECIPES.push({id:'dose',n:'緩解藥',need:{herb:2,alcohol:1},out:2,sk:3,d:'按舊方配製，壓制體內舊毒'});
