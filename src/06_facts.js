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
   if(who&&who!==S.pc){S.facts.forEach(function(f){if(bad||f.pub||!f.secret||!f.kw||!f.kw.length)return;if(f.kn.indexOf(who)>=0)return;if(f.kw.some(function(w){return l.indexOf(w)>=0;}))bad=true;});}
   if(bad)leaks.push(cn(who));else keep.push(l);});
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
