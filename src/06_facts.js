/* ===== 知情防火牆（M13 Facts/FW）、秘密守秘（M22 Seal）、劇情節奏（M18 Pace）、世界節制（M26 WS）、易裝稱呼（M16 Gender）、身分變更（M17/M23 Idn） ===== */
var FW={};
(function(){
 function fid(){S.fseq=(S.fseq||0)+1;return 'f'+S.fseq;}
 FW.add=function(t,kn,sub,opt){opt=opt||{};t=String(t).slice(0,120);for(var i=0;i<S.facts.length;i++){var f0=S.facts[i];if(f0.t===t){(kn||[]).forEach(function(k){FW.learn(k,f0.id,100,'src');});if(opt.pub)f0.pub=1;return f0;}}
  var f={id:fid(),t:t,kn:(kn||[]).filter(function(x){return !!x;}).slice(0,12),rum:{},not:opt.not||[],sub:sub||S.pc,d:S.day,pub:opt.pub?1:0,secret:opt.secret?1:0,k:opt.k||'',kw:opt.kw||FW.autoKw(t,opt),seal:{},src:opt.src||''};
  if(f.kn.indexOf(S.pc)<0&&(f.sub===S.pc||opt.pcKnows!==false))f.kn.push(S.pc);S.facts.push(f);if(S.facts.length>120){var j=S.facts.findIndex?S.facts.findIndex(function(x){return !x.secret;}):0;S.facts.splice(j<0?0:j,1);}return f;};
 FW.autoKw=function(t,o){if(!o.secret)return [];var kw=[];['大秦','極西','解剖','親生','私生','易裝','女兒身','男兒身','中毒','刺客','行刺','罪臣','逃犯','密令','內應','假死'].forEach(function(w){if(t.indexOf(w)>=0)kw.push(w);});return kw;};
 FW.byId=function(id){for(var i=0;i<S.facts.length;i++)if(S.facts[i].id===id)return S.facts[i];return null;};
 FW.byK=function(k){for(var i=0;i<S.facts.length;i++)if(S.facts[i].k===k)return S.facts[i];return null;};
 FW.knows=function(id,f){if(f)return f.pub||f.kn.indexOf(id)>=0;return S.facts.filter(function(x){return x.pub||x.kn.indexOf(id)>=0;});};
 FW.rumors=function(id){return S.facts.filter(function(x){return !x.pub&&x.kn.indexOf(id)<0&&(x.rum[id]||0)>0;});};
 FW.learn=function(id,fidOrT,conf,how){if(!id||!P(id))return false;var f=FW.byId(fidOrT)||S.facts.filter(function(x){return x.t===fidOrT;})[0];if(!f)return false;conf=conf==null?100:conf;
  conf=Pace.guard(id,f,conf,how);if(conf>=55){if(f.kn.indexOf(id)<0){f.kn.push(id);f.not=f.not.filter(function(x){return x!==id;});Bond.learn(id,f.t);if(f.secret)Nom.add(id,'得知：'+f.t,'secret');}}else f.rum[id]=Math.max(f.rum[id]||0,conf);
  if(how==='told'&&f.sub===S.pc&&SET.seald!==false){f.seal[id]=1;Nom.add(id,pc().n+'親口告訴我：'+f.t,'told');}return true;};
 FW.goPublic=function(f,why){if(!f||f.pub)return;f.pub=1;addLog('〔公開〕'+f.t+(why?'（'+why+'）':''),'秘');};
 /* 洩密檢查：秘密關鍵字出現在不知情者的台詞裡 → 刪句並註明 */
 FW.check=function(r){if(SET.firewall===false)return r;var leaks=[];var lines=r.scene.split('\n');var keep=[];
  lines.forEach(function(l){var m=l.match(/^([^：「]{1,8})[：:]/);var who=m?People.idByName(m[1]):'';var bad=false;
   if(!who||who===S.pc){S.facts.forEach(function(f){if(bad||!f.hidePc||f.pub||f.kn.indexOf(S.pc)>=0||!f.kw||!f.kw.length)return;if(f.kw.some(function(w){return l.indexOf(w)>=0;})){bad=true;who=who||'pcx';}});}
   if(who&&who!==S.pc&&who!=='pcx'){S.facts.forEach(function(f){if(bad||f.pub||!f.secret||!f.kw||!f.kw.length)return;if(f.kn.indexOf(who)>=0)return;if(f.kw.some(function(w){return l.indexOf(w)>=0;}))bad=true;});}
   if(bad)leaks.push(who==='pcx'||who===S.pc?'你':cn(who));else keep.push(l);});
  if(leaks.length){r.scene=keep.join('\n')+'\n（'+leaks.filter(function(v,i,a){return a.indexOf(v)===i;}).join('、')+'並不知道那件事，話題被輕輕帶過。）';FW.stat=(FW.stat||0)+1;}return r;};
 FW.aiLines=function(ids){return ids.map(function(id){var k=FW.knows(id).filter(function(f){return !f.pub;}).slice(-4).map(function(f){return f.t;});var r=FW.rumors(id).slice(-2).map(function(f){return '（傳聞）'+f.t;});return cn(id)+'所知：'+(k.concat(r).join('；')||'無特別');}).join('\n');};
 FW.secretsOf=function(){return S.facts.filter(function(f){return f.secret&&f.sub===S.pc;});};
 /* 每日傳播（M18 慢擴散＋M22 守秘） */
 FW.tick=function(){var today=0;S.facts.forEach(function(f){if(f.pub)return;var n=f.kn.length;if(n>=8)return;
   f.kn.slice().forEach(function(h){if(h===S.pc||!alive(h))return;var p=P(h);var gos=(p.pers||[]).reduce(function(s,t){return s+((TRAITS[t]||{}).gos||0);},0);
    if(f.sub===S.pc){if(today>=1)return;if(!Seal.mayTell(h,f))return;if(S.day-(f.lastSp||-99)<6||rand()>0.04+gos*0.01)return;}
    else if(rand()>0.03+gos*0.015)return;
    var to=People.acq(h);if(!to||f.kn.indexOf(to)>=0)return;var conf=f.sub===S.pc?36+rnd(12):50+rnd(30);if(f.sub===S.pc){f.lastSp=S.day;today++;}FW.learn(to,f.id,conf,'gossip');});});};
})();
People.acq=function(h){var r=[];for(var id in S.ppl){var p=S.ppl[id];if(id===h||id===S.pc||!p.alive)continue;var same=(p.loc&&P(h).loc&&p.loc.pl===P(h).loc.pl)||(p.kind==='named'&&P(h).kind==='named')||(p.hh&&P(h).hh);if(same)r.push(id);}return r.length?pick(r):'';};
/* ===== 守秘（M22 Seal） ===== */
var Seal={
 mayTell:function(h,f){if(SET.seald===false)return true;if(!f.seal||!f.seal[h])return !f.secret||rand()<0.3;var p=P(h);if(!p)return false;if(S.seal&&S.seal[f.id+'_ok'])return true;var hostile=p.aff<=-20&&(p.pers.indexOf('刻薄')>=0||p.pers.indexOf('狡猾')>=0||p.pers.indexOf('善妒')>=0);return hostile;},
 told:function(id,f){FW.learn(id,f.id,100,'told');},
 permit:function(fid){S.seal[fid+'_ok']=1;},
 force:function(f,to,how){FW.learn(to,f.id,90,how||'force');addLog('〔秘〕'+cn(to)+'因'+(how==='interrogate'?'審問逼供':(how==='overheard'?'公開場合聽見':'告發'))+'得知：'+f.t,'秘');}
};
/* ===== 劇情節奏（M18 Pace） ===== */
var Pace={
 mul:function(){return {slow:1.4,mid:1,fast:0.7}[SET.pace]||1;},
 vf:function(){return {low:1.5,mid:1,high:0.6}[SET.visitf]||1;},
 allow:function(id,kind){var p=P(id);if(!p)return false;var g=Math.round({slow:6,mid:4,fast:3}[SET.pace]*Pace.vf());var pp=Math.round({slow:20,mid:13,fast:9}[SET.pace]*Pace.vf());
  if(S.day-S.pace.last<g)return false;if(S.day-(S.pace.per[id]||-99)<pp)return false;var auth=p.kind==='named'?(NAMED[id].auth||1):Math.max(p.office||0,1);
  var lead={slow:60,mid:40,fast:20}[SET.pace];if(auth>=6&&S.day<lead&&p.trust<40)return false;if(!p.met&&kind!=='intro')return false;if(kind!=='intro'&&p.aff<20&&(p.love||0)<30)return false;return true;},
 mark:function(id){S.pace.last=S.day;S.pace.per[id]=S.day;},
 guard:function(id,f,conf,how){if(how==='told'||how==='src'||how==='force'||how==='interrogate'||how==='witness')return conf;var p=P(id);var auth=p&&p.kind==='named'?(NAMED[id]||{}).auth||1:1;
  if(f.sub===S.pc&&auth>=6&&S.day<({slow:60,mid:40,fast:20}[SET.pace]||40))return Math.min(conf,38);if(how==='ai'&&f.sub===S.pc)return Math.min(conf,48);return conf;},
 maybeIntro:function(){if(ageOf(pc())<14)return;var every=Math.round({slow:5,mid:3,fast:2}[SET.pace]*Pace.vf());if(S.day-(S.pace.intro||-99)<every)return;var c=[];for(var id in S.ppl){var p=S.ppl[id];if(p.met||!p.alive||p.hh||p.hidden)continue;var w=People.where(id);if(!w)continue;var auth=p.kind==='named'?NAMED[id].auth:1;if(auth>=8&&S.fam.fame<20&&!pc().office&&!pc().medoff)continue;c.push(id);}
  if(!c.length)return;c.sort(function(a,b){return ((P(a).kind==='named'?NAMED[a].auth:1)-(P(b).kind==='named'?NAMED[b].auth:1));});var id=rand()<0.6?c[0]:pick(c);S.pace.intro=S.day;S.queue.push({go:'paceMeet',a:{id:id},pace:1});},
 aiRule:function(){var met=[];for(var id in S.ppl){var p=S.ppl[id];if(p.met&&p.alive&&id!==S.pc)met.push(p.n);}return '【劇情節奏・'+({slow:'慢熱',mid:'適中',fast:'緊湊'}[SET.pace])+'】不可讓未相識的大人物主動找上門；陌生人須先搭話相識；秘密只能慢慢傳開。已相識者：'+(met.slice(0,24).join('、')||'無')+'。';}
};
/* ===== 世界節制（M26 WS） ===== */
var WS={};
WS.log=function(t,why,tag){S.wev.maj.push({d:S.day,t:t,why:why||'',tag:tag||'傳聞'});if(S.wev.maj.length>60)S.wev.maj.shift();addLog('〔'+(tag||'傳聞')+'〕'+t+(why?'——'+why:''),'世');};
WS.brief=function(n){return S.wev.maj.filter(function(m){return S.day-m.d<=60;}).slice(-(n||8)).reverse().map(function(m){return '〔'+m.tag+'〕'+m.t+(m.why?'——'+m.why:'');});};
WS.cap=function(){return {low:1,mid:2,high:3}[SET.wdens]||2;};
WS.allow=function(major,related){if(SET.wsane===false)return rand()<0.4;if(S.day<8)return false;var auto=S.wev.maj.filter(function(m){return m.tag!=='你所為'&&m.tag!=='史';});var ld=auto.length?auto[auto.length-1].d:-99;
 var cd={slow:12,mid:9,fast:6}[SET.pace]||9;if(major)cd+=2;if(S.day-ld<cd)return false;var n30=auto.filter(function(m){return S.day-m.d<30;}).length;var cap=WS.cap()-(major&&SET.pace==='slow'?1:0);if(n30>=Math.max(1,cap))return false;
 var k={slow:0.55,mid:0.75,fast:1}[SET.pace]||0.75;if(!related)k*=0.45;return rand()<0.6*k;};
WS.auth=function(id){if(id===S.pc){var me=pc();return Math.max(me.office?Math.ceil(me.office/2)+1:0,me.medoff?me.medoff:0,1);}var p=P(id);if(!p)return 0;if(p.kind==='named')return NAMED[id].auth||1;return Math.max(1,{guard:2,clerk:3,soldier:2}[p.job]||1,p.office?Math.ceil(p.office/2)+1:0);};
WS.evidence=function(tgt){var nm=cn(tgt);return S.log.filter(function(l){return S.day-l.d<=150&&l.t.indexOf(nm)>=0&&/行賄|偷竊|密謀|私通|殺|搶|逃|告發|妖術/.test(l.t);}).map(function(l){return l.t;});};
var WEV=[
 {t:'關中大旱，粟價騰貴',why:'起因：入夏不雨',fx:function(){S.flags.dear=S.day;},major:0},
 {t:'城南時疫初起，醫者稀缺',why:'起因：春寒反覆、井水不潔',fx:function(){S.flags.plague=S.day;},major:1},
 {t:'官府徵發徭役修渠',why:'起因：郡守奏請興修水利',fx:function(){S.flags.corvee=S.day;},major:0},
 {t:'市集有人以妖術之名告發醫者',why:'起因：方士與巫醫不滿外來醫術',fx:function(){S.flags.witch=S.day;},major:1,need:function(){return (S.fam.notor||0)>=10;}},
 {t:'今歲豐收，糧價回落',why:'起因：風調雨順',fx:function(){S.flags.cheap=S.day;},major:0},
 {t:'邊地盜匪出沒，商旅結伴而行',why:'起因：連年徭役，流民嘯聚',fx:function(){S.flags.bandit=S.day;},major:1},
 {t:'縣裡貼出告示：招募善醫者隨軍',why:'起因：大軍將出征',fx:function(){S.flags.recruitMed=S.day;},major:0}
];
WS.tick=function(){if(!WS.allow(false,S.region!=='road'))return;var c=WEV.filter(function(e,i){return (!e.need||e.need())&&S.day-(S.evseen['we'+i]||-999)>80;});if(!c.length)return;var e=pick(c);S.evseen['we'+WEV.indexOf(e)]=S.day;e.fx();WS.log(e.t,e.why,'傳聞');};
/* ===== 易裝稱呼（M16 Gender） ===== */
var Gender={
 on:function(){return !!(S.disg&&S.disg.on);},
 knows:function(id){if(!Gender.on())return true;if(id===S.pc)return true;var f=FW.byId(S.disg.fid);return !!(f&&(f.pub||f.kn.indexOf(id)>=0));},
 seen:function(p,viewer){if(!p||p.id!==S.pc||!Gender.on())return p?p.g:'f';if(viewer&&Gender.knows(viewer))return p.g;return S.disg.as;},
 viewFor:function(id){return Gender.seen(pc(),id);},
 call:function(id){var g=Gender.viewFor(id),a=ageOf(pc());var p=P(id);if(p&&p.spouse===S.pc)return g==='f'?'娘子':'夫君';if(g==='f')return a>40?'夫人':'姑娘';return a>40?'先生':'公子';},
 start:function(as){var me=pc();var f=FW.add(me.n+'真實是'+(me.g==='f'?'女兒身':'男兒身')+'，易裝為'+(as==='m'?'男子':'女子'),Eng.house().map(function(p){return p.id;}),me.id,{secret:1,k:'gender',kw:me.g==='f'?['女兒身','女扮男裝']:['男兒身','男扮女裝']});S.disg={on:1,as:as,since:S.day,fid:f.id};addLog('〔易裝〕'+me.n+'改作'+(as==='m'?'男裝':'女裝'),'秘');},
 stop:function(){if(!S.disg)return;var f=FW.byId(S.disg.fid);S.disg.on=0;if(f)FW.goPublic(f,'自行卸去易裝');},
 tell:function(id){if(!Gender.on())return;Seal.told(id,FW.byId(S.disg.fid));},
 expose:function(by){if(!Gender.on())return;var f=FW.byId(S.disg.fid);S.disg.on=0;if(f)FW.goPublic(f,'被'+cn(by)+'識破');addLog('〔易裝〕被'+cn(by)+'識破','秘');Fam.tierCalc();},
 observers:function(){return People.present().filter(function(id){var p=P(id);if(!p||!p.met||Gender.knows(id))return false;var sus=p.pers.indexOf('多疑')>=0?40:(p.pers.indexOf('精明')>=0?30:10);var obs=p.at.wit*3*0.6+sus*0.4;return obs>=22&&(sus>=30||p.aff+p.trust>=60);});},
 tick:function(){if(!Gender.on()||S.day-S.disg.since<3)return;var o=Gender.observers();if(!o.length)return;if(rand()<0.05+0.02*o.length)S.queue.push({go:'disgExpose',a:{id:pick(o)},stop:1});},
 /* 男主角（或旁人眼中是男子）時，離線文本中對主角的女性稱呼改為男性 */
 pcText:function(t){if(typeof t!=='string'||!S||!S.pc)return t;var me=pc();if(!me)return t;var g=Gender.on()?S.disg.as:me.g;if(g!=='m')return t;
  return t.replace(/妳/g,'你').replace(/女神醫/g,'神醫').replace(/女大夫/g,'大夫').replace(/女醫者/g,'醫者').replace(/(.?)姑娘/g,function(w,a){return a==='小'||a==='老'?w:a+'公子';});},
 /* 不知情者口中的稱呼改回旁人眼中的性別 */
 fixText:function(text){if(!Gender.on())return text;var as=S.disg.as;var fix=0;var out=String(text).split('\n').map(function(l){var m=l.match(/^([^：「]{1,8})[：:]/);var who=m?People.idByName(m[1]):'';if(!who||who===S.pc||Gender.knows(who))return l;
   var l2=as==='m'?l.replace(/姑娘|小姐|娘子(?!軍)|女大夫|女醫/g,function(w){fix=1;return {姑娘:'公子',小姐:'公子',娘子:'公子',女大夫:'大夫',女醫:'醫者'}[w]||'公子';}):l.replace(/公子|郎君|小哥|兄台/g,function(){fix=1;return '姑娘';});return l2;}).join('\n');if(fix)Gender.stat=(Gender.stat||0)+1;return out;}
};
/* ===== 身分變更（M17 Idn＋M23 身分全同步） ===== */
var Idn={
 K:{promote:'升官',demote:'降職',appoint:'任官',medoff:'任醫官',enlist:'從軍',leave:'辭去',ennoble:'賜爵',master:'拜師／收徒',register:'落籍',harem:'入宮',title:'名號',pardon:'平反'},
 parse:function(t,mode){t=String(t);var m=t.match(/^(.{1,8}?)(?:想|要|欲|願|打算)?(?:讓|命|封|任|召|收|請|準|允)(?:我|你)(?:為|做|當|作|入)(.{1,10}?)[。！!]?$/);if(!m)m=t.match(/^(.{1,8}?)(?:想|要)(?:我|你)(?:當|做)(?:他|她)?的?(.{1,8}?)[。！!]?$/);if(!m)return null;
  var by=People.idByName(m[1]);if(!by||by===S.pc)return null;var to=m[2].replace(/^他的|^她的/,'');var k='title';
  if(/妃|夫人|美人|良人|八子|七子|長使|少使/.test(to))k='harem';else if(OFFICE.some(function(o){return o&&(o.indexOf(to)>=0||to.indexOf(o.slice(-2))>=0);})||/縣令|縣丞|郡守|丞相|九卿|吏|官/.test(to))k='appoint';else if(MEDOFF.some(function(o){return o&&to.indexOf(o)>=0;})||/醫官/.test(to))k='medoff';else if(/兵|卒|軍醫|校尉|屯長/.test(to))k='enlist';else if(/徒|弟子|學生/.test(to))k='master';else if(/爵|侯|大夫|公士|上造/.test(to))k='ennoble';
  return {k:k,to:to,by:by,ap:1,raw:t};},
 need:function(c){var L=c.k==='appoint'?Math.max(1,OFFICE.indexOf(c.to)>0?OFFICE.indexOf(c.to):3):(c.k==='medoff'?Math.max(1,MEDOFF.indexOf(c.to)>0?MEDOFF.indexOf(c.to):2):1);return {appoint:Math.ceil(L/2)+1,medoff:L+1,enlist:2,ennoble:5,harem:9,master:1,register:2,title:1,promote:3,demote:3,leave:1,pardon:8}[c.k]||1;},
 check:function(c){var by=P(c.by);if(!by||!by.alive)return '批准者不在人世';if(c.k==='harem'&&c.by!=='yingzheng'&&c.by!=='fusu')return '只有君上（或其子）能納人入宮';
  var auth=WS.auth(c.by);if(SET.diff==='easy')return '';if(auth<Idn.need(c))return cn(c.by)+'沒有這個權力（需要更高的地位）';if(!by.met&&People.where(c.by)!==S.place)return cn(c.by)+'與你素不相識';
  if((c.k==='appoint'||c.k==='enlist')&&!Rule.ok(pc(),c.k==='enlist'?'army':'office')&&c.by!=='yingzheng')return Rule.why(pc(),c.k==='enlist'?'army':'office');
  if(c.k==='harem'&&Gender.seen(pc(),c.by)===P(c.by).g&&S.world!=='equal')return '在'+cn(c.by)+'眼中你與他同為'+(P(c.by).g==='m'?'男':'女')+'子，此事不成立';
  if(SET.diff==='hard'&&(by.aff+by.trust<60||S.fam.fame<10))return cn(c.by)+'對你還不夠信任（好感＋信任需 60、名聲 10）';return '';},
 apply:function(c,force){if(!c)return '';var err=force?'':Idn.check(c);if(err)return err;var me=pc(),to=c.to;
  if(c.k==='appoint'){var i=OFFICE.indexOf(to);if(i<0){OFFICE.forEach(function(o,j){if(o&&to&&(o.indexOf(to)>=0||to.indexOf(o.slice(-2))>=0))i=j;});}if(i<1)i=Math.max(1,(me.office||0)+1);me.office=i;me.title=OFFICE[i];}
  else if(c.k==='promote'){me.office=clamp((me.office||0)+1,1,OFFICE.length-1);me.title=OFFICE[me.office];}
  else if(c.k==='demote'){me.office=clamp((me.office||0)-1,0,OFFICE.length-1);me.title=OFFICE[me.office]||'';}
  else if(c.k==='medoff'){var j=MEDOFF.indexOf(to);if(j<1)j=clamp((me.medoff||0)+1,1,MEDOFF.length-1);me.medoff=j;me.title=MEDOFF[j];}
  else if(c.k==='enlist'){me.rank=Math.max(me.rank||0,1);me.job='soldier';me.title=/醫/.test(to||'')?'軍醫':'兵卒';S.flags.army=1;}
  else if(c.k==='ennoble'){me.rank=clamp((me.rank||0)+1,1,RANKS.length-1);}
  else if(c.k==='leave'){if(me.office){me.office=0;}if(me.medoff)me.medoff=0;S.flags.army=0;me.title='';}
  else if(c.k==='harem'){me.title=to||'夫人';S.flags.harem=c.by;}
  else if(c.k==='master'){me.title=to||'弟子';}
  else if(c.k==='pardon'){if(S.fam.grudge)S.fam.grudge.done=1;}
  else me.title=to||me.title;
  S.idn.hist.push({d:S.day,k:c.k,to:me.title||to,by:c.by||''});if(S.idn.hist.length>8)S.idn.hist.shift();
  addLog('〔身分〕'+(c.by?cn(c.by)+'：':'')+Idn.K[c.k]+'→'+(me.title||to||''),'身');FW.add(me.n+(c.by?'經'+cn(c.by)+'批准，':'')+Idn.K[c.k]+(me.title?'為'+me.title:''),c.by?[c.by]:[],me.id,{pub:1});if(c.by)People.note(c.by,'讓'+me.n+Idn.K[c.k]+(me.title?'為'+me.title:''),'crit');
  Idn.react(c);Fam.tierCalc();if(typeof UI!=='undefined')UI.hud();return '';},
 react:function(c){if(c.k!=='appoint'&&c.k!=='medoff'&&c.k!=='harem'&&c.k!=='promote')return;for(var id in S.ppl){var p=S.ppl[id];if(!p.alive||!p.met||id===S.pc||p.hh)continue;if(p.pers.indexOf('善妒')>=0||id==='xiawuju'){p.aff=clamp(p.aff-4,-100,100);People.note(id,'妒忌'+pc().n+'得勢');}else if(p.pers.indexOf('貪財')>=0||p.pers.indexOf('狡猾')>=0){p.aff=clamp(p.aff+3,-100,100);People.note(id,'想巴結得勢的'+pc().n);}}}
};
/* ===== 約定／交易（Deal：即時履約／醫好→租館；AI 劇情同步） ===== */
var Deal={};
(function(){
 Deal.list=function(){if(!S.deals)S.deals=[];return S.deals;};
 Deal.open=function(){return Deal.list().filter(function(d){return d.status==='open';});};
 Deal.byId=function(id){for(var i=0;i<Deal.list().length;i++)if(S.deals[i].id===id)return S.deals[i];return null;};
 Deal.seq=function(){S.dseq=(S.dseq||0)+1;return 'd'+S.dseq;};
 Deal.ACK=/一言為定|就這麼辦|就依你|依你所言|成交|可以|好說|好吧|好的|便是|便依|准了|應允|答應|說定|就這樣|依你|成全你|成全|算你說得|這條件|我答應|我應了|公道|公平|兩清|租給你了|就租|便租|收了這|收下這|就這價|這價公道|准你租|醫館歸你/;
 Deal.REFUSE=/休想|不行|拒絕|辦不到|別做夢|豈有此理|妄想|免談|不可能租|不租|銀兩不夠|錢不夠/;
 Deal.BYE=/告辭|改日再來|改日再談|先回罷|先回去|不送了|慢走|請回|就此別過|事辦妥了|事情了結|兩清了|兩訖|說完了|我就告辭|你且去|你先去醫|去醫罷|去治罷|去吧/;
 Deal.THEN_N={rent_clinic:'租下醫館',pay_gold:'付銀',gift:'贈禮',favor:'人情',hire:'收徒',move:'遷移'};
 Deal.CN={零:0,〇:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100};
 Deal.parseCnNum=function(s){s=String(s||'');if(!s)return NaN;if(/^\d+$/.test(s))return +s;var n=0,t=0;for(var i=0;i<s.length;i++){var c=Deal.CN[s[i]];if(c==null)return NaN;if(c===10||c===100){if(t===0)t=1;n+=t*c;t=0;}else t=c;}return n+t;};
 Deal.parsePrice=function(text,def){text=String(text||'');var m=text.match(/(\d{1,4})\s*[兩元銀]/);if(m)return +m[1];
  m=text.match(/([一二兩三四五六七八九十百零〇]{1,6})\s*[兩元銀]/);if(m){var n=Deal.parseCnNum(m[1]);if(!isNaN(n)&&n>0)return n;}
  return def!=null?def:60;};
 Deal.isImmediate=function(iff){iff=String(iff==null?'':iff).trim();return !iff||iff==='now'||iff==='immediate'||iff==='none'||iff==='即'||iff==='即時'||iff==='立刻'||iff==='當場'||iff==='直接'||iff==='成交';};
 Deal.brief=function(){var L=Deal.open();if(!L.length){var done=Deal.list().filter(function(d){return d.status==='done';}).slice(-3);if(!done.length)return '';return '【已履約約定】'+done.map(function(d){return cn(d.with)+'：'+Deal.str(d)+'（已兌現）';}).join('；');}
  return '【未了約定・必須兌現】'+L.map(function(d){return Deal.str(d)+'（status=open）';}).join('；')+'。條件一旦達成必須立刻履約；if=now 的當場交易當幕必須扣銀／改狀態，不得只寫在敘事裡。';};
 Deal.str=function(d){var th=Deal.THEN_N[d.then]||d.then;if(d.then==='rent_clinic')th='用'+(d.price||60)+'兩租醫館給主角';else if(d.then==='pay_gold')th='付'+(d.price||0)+'兩';
  if(Deal.isImmediate(d.if))return cn(d.with)+'與主角約定：立刻'+th;
  var ifs=d.if==='heal_grandson'?'醫好'+(d.who||'孫子'):(d.if==='heal'||d.if==='cure'?'醫好'+(d.who||(d.pid&&cn(d.pid))||'病人'):(d.if||'條件'));
  return cn(d.with)+'與主角約定：若'+ifs+'，則'+th;};
 Deal.dup=function(o){return Deal.list().some(function(d){return d.status==='open'&&d.with===o.with&&d.then===o.then&&d.if===o.if&&(d.who||'')===(o.who||'')&&(d.price|0)===(o.price|0);});};
 Deal.add=function(o,force){if(!o||!o.with||!P(o.with)||o.with===S.pc)return null;
  if(!force&&Deal.dup(o)){var ex=Deal.open().filter(function(d){return d.with===o.with&&d.then===o.then;})[0]||null;if(ex&&Deal.isImmediate(ex.if)&&ex.status==='open')Deal.fulfill(ex);return ex;}
  var iff=o.if;if(iff==null||iff==='')iff='now';
  var d={id:Deal.seq(),type:'deal',with:o.with,if:iff,then:o.then||'rent_clinic',price:clamp((o.price|0)||60,1,500),status:o.status||'open',who:String(o.who||'').slice(0,8),pid:o.pid&&P(o.pid)?o.pid:'',text:String(o.text||'').slice(0,80),d:S.day,src:o.src||''};
  Deal.list().push(d);if(S.deals.length>40){var j=S.deals.findIndex(function(x){return x.status!=='open';});S.deals.splice(j<0?0:j,1);}
  if(d.status==='open'){FW.add(Deal.str(d),[d.with],S.pc,{src:'deal'});People.note(d.with,'與'+pc().n+'約定：'+Deal.str(d).replace(cn(d.with)+'與主角約定：',''),'crit');
   if(typeof Bond!=='undefined'){var b=Bond.get(d.with);b.cond=Deal.str(d).replace(/^.*?約定：/,'');}addLog('〔約定〕'+Deal.str(d),'約');try{toast('📜 約定已記下');}catch(e){}}
  if(d.status==='open'&&Deal.isImmediate(d.if))Deal.fulfill(d);
  return d;};
 Deal.parseOffer=function(text,npcId){text=String(text||'');if(!text||text.length<3)return null;if(!npcId||!P(npcId))return null;
  var price=Deal.parsePrice(text,60),who='',iff='heal',then='rent_clinic';
  var hasRent=(/租|借.?給|讓.?我.?用|交給我.{0,4}醫館|醫館.{0,6}給我|開.?醫館|舖面|鋪面/.test(text))&&(/醫館|舖面|鋪面|診所|舖|鋪/.test(text)||/租/.test(text));
  var hasHeal=/醫好|治好|救好|治活|救治|治癒|治愈/.test(text);
  var immRent=hasRent&&(/用.{0,8}[兩元].{0,6}租|租.{0,8}[兩元]|[兩元].{0,4}租|當場|立刻|即刻|現在就|就租|便租|直接租|成交|說定.{0,8}租|答應.{0,8}租|准你租|准了.{0,6}租|租給你|租下/.test(text));
  if(hasHeal){
   if(!hasRent&&!/付|給你|酬|謝|銀/.test(text))return null;
   if(hasRent)then='rent_clinic';else if(/付|酬謝|謝禮|給你.{0,4}[兩元]/.test(text))then='pay_gold';
   if(/孫子|孫女|外孫/.test(text)){who=(text.match(/孫子|孫女|外孫/)||['孫子'])[0];iff='heal_grandson';}
   else{var m=text.match(/(?:醫好|治好|救好|治活|救治)(?:了)?(?:我的|他的|她的|你家的|他家的)?([\u4e00-\u9fff]{1,4}?)(?:就|便|後|，|。|的病|病|再用|用)/);if(m){who=m[1];iff='heal';}}
   return {with:npcId,if:iff,then:then,price:price,who:who,text:text.slice(0,80),src:'speech'};
  }
  if(immRent||(hasRent&&/[兩元]/.test(text)))return {with:npcId,if:'now',then:'rent_clinic',price:price,who:'',text:text.slice(0,80),src:'speech'};
  return null;};
 Deal.fromAI=function(arr,sp){if(!Array.isArray(arr))return [];var out=[];
  arr.slice(0,3).forEach(function(x){if(!x||typeof x!=='object')return;
   var wid=x.with||x.npc||sp;if(wid==='me'||wid==='p')return;if(!P(wid))wid=People.idByName(String(wid))||sp;if(!P(wid)||wid===S.pc)return;
   var st=x.status==='done'?'done':(x.status==='broken'?'broken':'open');
   if(st==='done'||st==='broken'){var ex=Deal.open().filter(function(d){return d.with===wid&&(!x.then||d.then===x.then);})[0];if(ex)ex.status=st;return;}
   var rawIf=x.if!=null?x.if:(x.cond!=null?x.cond:'');
   var iff;if(Deal.isImmediate(rawIf))iff='now';
   else{iff=String(rawIf||'heal');if(/孫/.test(iff)||/孫/.test(String(x.who||'')))iff='heal_grandson';
    else if(/醫|治|癒|cure|heal/.test(iff))iff=/孫/.test(String(x.who||x.text||''))?'heal_grandson':'heal';
    else if(!iff||iff==='null'||iff==='undefined')iff='now';}
   var then=String(x.then||x.reward||'');if(/租|醫館|clinic/.test(then)||then==='rent_clinic')then='rent_clinic';
   else if(/金|銀|兩|元|pay|gold/.test(then))then='pay_gold';else if(!then)then='rent_clinic';
   var price=x.price|0;if(!price)price=Deal.parsePrice(String(x.text||'')+' '+String(x.then||''),60);
   var d=Deal.add({with:wid,if:iff,then:then,price:price,who:String(x.who||x.patient||'').slice(0,8),pid:P(x.pid)?x.pid:'',text:String(x.text||'').slice(0,80),status:'open',src:'ai'});
   if(d)out.push(d);});
  return out;};
 Deal.parseSceneRent=function(scene,npcId){scene=String(scene||'');if(!scene||!npcId||!P(npcId))return null;
  if(Deal.REFUSE.test(scene)&&!Deal.ACK.test(scene))return null;
  if(!/租|醫館|舖面|鋪面/.test(scene))return null;
  var okPrice=/(?:用|以|收(?:了|下)?|交(?:了|給)?|付(?:了)?).{0,6}\d{1,4}\s*[兩元]/.test(scene)
   ||/(?:用|以).{0,4}[一二兩三四五六七八九十百零〇]{1,6}\s*[兩元]/.test(scene)
   ||/[兩元].{0,6}(?:租|押)/.test(scene)||/租.{0,10}[兩元]/.test(scene)
   ||/成交|一言為定|說定|准了|便租|就租|租給你|醫館歸你|木牌可挂/.test(scene);
  if(!okPrice)return null;
  return {with:npcId,if:'now',then:'rent_clinic',price:Deal.parsePrice(scene,50),who:'',text:scene.replace(/\s+/g,' ').slice(0,80),src:'scene'};};
 Deal.ingestTurn=function(a,r){Deal._settled=null;Deal._settleMsg='';var npc=(r&&r.speaker)||(a&&a.id)||'';
  if(r&&Array.isArray(r.deals))Deal.fromAI(r.deals,npc);
  var offer=null;
  if(a&&a.text&&(a.tag==='對白'||a.tag==='設定・劇情'||a.tag==='選擇'||a.type==='say'||a.type==='free'))offer=Deal.parseOffer(a.text,npc||a.id);
  if(a&&a._dealOffer)offer=a._dealOffer;
  if(offer){
   var ok=a.tag==='設定・劇情'||Deal.ACK.test((r&&r.scene)||'')||(r&&r.deals&&r.deals.length);
   if(ok&&!Deal.REFUSE.test((r&&r.scene)||''))Deal.add(offer);
   else if(!Deal.REFUSE.test((r&&r.scene)||''))S.dealPend=offer;
  }else if(S.dealPend&&npc&&(npc===S.dealPend.with||!(r&&r.speaker))){
   if(Deal.ACK.test((r&&r.scene)||'')&&!Deal.REFUSE.test((r&&r.scene)||'')){Deal.add(S.dealPend);S.dealPend=null;}
   else if(Deal.REFUSE.test((r&&r.scene)||''))S.dealPend=null;
  }
  if(!S.fam.clinic.open&&npc&&P(npc)){
   var sr=Deal.parseSceneRent((r&&r.scene)||'',npc);
   if(sr&&(Deal.ACK.test((r&&r.scene)||'')||/租給你|醫館歸你|木牌可挂|收了.{0,6}[兩元]|成交/.test((r&&r.scene)||''))){
    var already=Deal.open().some(function(d){return d.then==='rent_clinic'&&Deal.isImmediate(d.if);})
     ||Deal.list().some(function(d){return d.status==='done'&&d.then==='rent_clinic'&&d.d===S.day;});
    if(!already)Deal.add(sr);
   }
  }
  if(r&&r.fx&&r.fx.bond){for(var id in r.fx.bond){var c=r.fx.bond[id]&&r.fx.bond[id].cond;if(typeof c==='string'&&/醫|治|租|兩|元/.test(c)){var o2=Deal.parseOffer(c,id);if(o2)Deal.add(o2);}}}
  Deal.reconcile();
  if(typeof PlotSync!=='undefined')PlotSync.fromTurn(a,r);
 };
 Deal.isGrandchild=function(pp,elderId){if(!pp||!elderId)return false;var pars=pp.par||[];
  for(var i=0;i<pars.length;i++){var pa=P(pars[i]);if(!pa)continue;if(pars[i]===elderId)return false;if((pa.par||[]).indexOf(elderId)>=0)return true;}
  if(/孫/.test(pp.n||'')||/孫/.test(pp.rel||'')||/孫/.test(pp.title||''))return true;return false;};
 Deal.matchCure=function(d,m){if(!d||d.status!=='open')return false;if(d.if!=='heal'&&d.if!=='heal_grandson'&&d.if!=='cure')return false;
  if(d.pid&&m.pid&&d.pid===m.pid)return true;
  var pp=m.pid?P(m.pid):null;
  if(pp&&d.who){if(pp.n.indexOf(d.who)>=0||d.who.indexOf(pp.n)>=0)return true;if(/孫/.test(d.who)&&Deal.isGrandchild(pp,d.with))return true;}
  if(d.if==='heal_grandson'&&pp&&Deal.isGrandchild(pp,d.with))return true;
  if(pp&&d.who&&/孫/.test(d.who)&&ageOf(pp)<18)return true;
  if(!d.pid&&!d.who&&pp&&pp.notes&&pp.notes.dealWith===d.with)return true;
  return false;};
 Deal.applyThen=function(d){var msg='';
  if(d.then==='rent_clinic'){
   var price=d.price||60;
   if(S.fam.clinic.open){
    msg=cn(d.with)+'依約把醫館繼續交你經營（先前已開館）；雙方再確認押租'+(S.fam.clinic.rentPrice||price)+'兩之約。';
    S.fam.clinic.rentFrom=d.with;S.fam.clinic.rentPrice=S.fam.clinic.rentPrice||price;
   }else{
    if(S.gold<price){msg=cn(d.with)+'依約准你租下醫館，但你銀兩不足（需'+price+'兩，現有'+S.gold+'）。對方寬限你籌錢——約定仍有效，可在醫館「履行約定」付清。';d._waitPay=1;return msg;}
    Inv.gold(-price);S.fam.clinic.open=1;S.fam.clinic.lv=S.fam.clinic.lv||0;S.fam.clinic.d0=S.day;S.fam.clinic.rentFrom=d.with;S.fam.clinic.rentPrice=price;
    FW.add(pc().n+'以'+price+'兩從'+cn(d.with)+'處租下醫館',[d.with],S.pc,{pub:1});
    WS.log(pc().n+'租下城南醫館','起因：與'+cn(d.with)+'約定履約','你所為');
    msg=cn(d.with)+'依約把醫館租給你，收了'+price+'兩。木牌可挂了。';
   }
  }else if(d.then==='pay_gold'){var g=d.price||30;Inv.gold(g);msg=cn(d.with)+'依約付你'+g+'兩。';}
  else msg=cn(d.with)+'依約履行了「'+(Deal.THEN_N[d.then]||d.then)+'」。';
  return msg;};
 Deal.fulfill=function(d,m){if(!d||d.status!=='open')return '';var msg=Deal.applyThen(d);
  if(d._waitPay){/* keep open */}else{d.status='done';d.doneD=S.day;if(typeof Bond!=='undefined'){var b=Bond.get(d.with);if(b.cond)b.cond='';}
   People.note(d.with,'履約：'+Deal.str(d).replace(/^.*?約定：/,'')+'——已兌現','crit');People.rel(d.with,{aff:8,trust:10},pc().n+'兌現了約定');
   addLog('〔約定〕已兌現：'+Deal.str(d),'約');FW.add('約定已履行：'+Deal.str(d),[d.with],S.pc,{pub:1,src:'deal'});}
  Deal._settled=d;Deal._settleMsg=msg;try{toast(d._waitPay?'⏳ 約定待付銀':'✅ 約定兌現');}catch(e){}return msg;};
 Deal.onCure=function(m,r){if(!m||!r||(r.out!=='cure'&&r.out!=='better'))return [];var msgs=[];
  Deal.open().forEach(function(d){if(Deal.matchCure(d,m)){var msg=Deal.fulfill(d,m);if(msg)msgs.push(msg);}});
  Deal.open().forEach(function(d){if(d.then==='rent_clinic'&&d._waitPay&&S.gold>=(d.price||60)){delete d._waitPay;var msg=Deal.fulfill(d,m);if(msg)msgs.push(msg);}});
  return msgs;};
 Deal.tryPayRent=function(){var msgs=[];Deal.open().forEach(function(d){if(d.then==='rent_clinic'&&(d._waitPay||Deal.isImmediate(d.if))&&S.gold>=(d.price||60)){delete d._waitPay;var msg=Deal.fulfill(d);if(msg)msgs.push(msg);}});return msgs;};
 Deal.reconcile=function(){var msgs=[];Deal.open().forEach(function(d){if(d.then!=='rent_clinic')return;if(Deal.isImmediate(d.if)||d._waitPay){var msg=Deal.fulfill(d);if(msg)msgs.push(msg);}});return msgs;};
 Deal.openRent=function(){return Deal.open().filter(function(d){return d.then==='rent_clinic';})[0]||null;};
 Deal.rentLabel=function(){var d=Deal.openRent();if(!d)return '';var p=d.price||60;if(d._waitPay||Deal.isImmediate(d.if))return '履行約定：付'+p+'兩開館（約自'+cn(d.with)+'）';return '履約開館（'+p+'兩・待條件）';};
 Deal.sceneResolved=function(scene){scene=String(scene||'');if(Deal.BYE.test(scene))return true;if(Deal._settled)return true;if(/約定.*(兌現|履行|兩清)|依約|木牌可挂|租給你了|醫館歸你/.test(scene))return true;return false;};
 Deal.forNpc=function(id){return Deal.list().filter(function(d){return d.with===id;}).slice(-6);};
 Deal.aiRule=function(){return '【約定・Deal】'+Deal.brief()+' 若本幕雙方明確談成新約定，請在 JSON 加 deals。條件型：{"with":"人物id","if":"heal_grandson|heal","then":"rent_clinic|pay_gold","price":60,"who":"孫子","status":"open"}；當場現金租館（無醫好條件）：{"with":"人物id","if":"now","then":"rent_clinic","price":50,"status":"open"}——談妥當幕遊戲會立刻扣銀開館，敘事必須寫出收錢／挂牌，且 fx.me.gold 不要再重複扣（系統已扣）。不可虛構玩家未提的約定。已 closed／done 禁止當成沒發生。\n【劇情同步・硬規則】敘事寫「已經付了／租了／收了／開館／搬走／收徒」等完成態時，必須同時在 fx 或 deals 寫出對應數值變化；禁止只寫「已經…」而遊戲狀態不變。銀兩單位兩＝元。\n【事件收束】完整小節結束時設 "done":true；不要無限延續同一事件。';};
})();
/* ===== AI 劇情→遊戲狀態同步（敘事已發生的交易／開館／遷徙等） ===== */
var PlotSync={};
(function(){
 PlotSync.msgs=[];
 PlotSync.fromTurn=function(a,r){if(!r)return [];PlotSync.msgs=[];var scene=String(r.scene||'');var fx=r.fx||{};
  /* 1) fx 已帶的 gold／move／change 由 AI.applyFx 處理；此處補敘事漏寫的結構化結果 */
  /* 當場開館敘事但 clinic 未開、且本幕 deals 未履約成功 → 再嘗試 scene rent（Deal 已處理）；此處補「掛牌／開館」無價錢句 */
  if(!S.fam.clinic.open&&/木牌可挂|掛上.{0,6}木牌|青囊醫館.{0,4}開|開了醫館|醫館開張/.test(scene)){
   var d=typeof Deal!=='undefined'?Deal.openRent():null;var price=d?d.price:(S.fam.clinic.rentPrice||Deal.parsePrice(scene,50));
   if(d)Deal.fulfill(d);else if(S.gold>=price){Inv.gold(-price);S.fam.clinic.open=1;S.fam.clinic.lv=S.fam.clinic.lv||0;S.fam.clinic.d0=S.day;S.fam.clinic.rentPrice=price;PlotSync.msgs.push('（同步）開館，扣'+price+'兩。');addLog('〔同步〕敘事開館，扣'+price+'兩','約');}
  }
  /* 付銀／收銀：若敘事明確「付了／交了 N 兩」且 fx.me.gold 未反映，補扣（僅當無 Deal 已扣） */
  if(!(fx.me&&fx.me.gold)){
   var pay=scene.match(/(?:付(?:了|出)?|交(?:了)?|奉上|奉上了|花(?:了)?|耗去|用去)(?:銀)?\s*(\d{1,4})\s*[兩元]/);
   var got=scene.match(/(?:收(?:了|下|到)?|得(?:了)?|獲(?:了)?|賜(?:了)?)(?:銀)?\s*(\d{1,4})\s*[兩元]/);
   if(pay&&!Deal._settled){var n=+pay[1];if(n>0&&n<=500&&S.gold>=n&&!/租|醫館|押租/.test(scene)){Inv.gold(-n);PlotSync.msgs.push('（同步）敘事付銀'+n+'兩。');}}
   else if(got&&!Deal._settled){var g=+got[1];if(g>0&&g<=500&&!/租|醫館|押租/.test(scene)){Inv.gold(g);PlotSync.msgs.push('（同步）敘事得銀'+g+'兩。');}}
  }
  /* 遷徙：敘事「前往／來到」某地且 fx.move 空 */
  if(!fx.move){for(var pl in PLACES){if(PLACES[pl].r===S.region&&pl!==S.place&&new RegExp('(?:來到|前往|去了|走到|抵達)'+PLACES[pl].n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(scene)){S.place=pl;PlotSync.msgs.push('（同步）來到'+PLACES[pl].n+'。');break;}}}
  /* 收徒 */
  if(/收(?:下|了).{0,4}(?:為徒|做學徒|作學徒)|拜入.{0,6}門下/.test(scene)){
   var here=People.present().filter(function(id){return id!==S.pc&&ageOf(P(id))<25;});
   if(here.length&&S.fam.clinic.apps.indexOf(here[0])<0){S.fam.clinic.apps.push(here[0]);P(here[0]).title='學徒';People.note(here[0],'拜入'+pc().n+'門下學醫','crit');PlotSync.msgs.push('（同步）收'+cn(here[0])+'為徒。');}
  }
  if(PlotSync.msgs.length&&Deal){Deal._settleMsg=(Deal._settleMsg?Deal._settleMsg+' ':'')+PlotSync.msgs.join(' ');}
  return PlotSync.msgs;};
})();
