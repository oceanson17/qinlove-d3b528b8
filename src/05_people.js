/* ===== 人物：位置、關係、心態卡(M20)、即時記憶(M20)、完整日誌、反失憶記憶庫(M21)、婚育、遺傳、衰老、死亡、傳承、來訪(M18) ===== */
var People={};
(function(){
 var LOCALS={market:['trader','owner','beggar'],tavern:['xia','singer','owner'],camp:['soldier','soldier'],yamen:['clerk','guard'],yamen2:['clerk','guard'],village:['farmer','weaver','carpenter'],fair:['trader','smith'],field:['farmer'],river:['boat','hunter'],forest:['hunter'],school:['scholar'],lodge:['owner'],plum:['scholar','hunter'],clinic:['tradoc'],mountain:[],road:[],farm:['farmer'],home:[],palace:['clerk'],study:['scholar'],courtyard:[],herbshop:['tradoc','trader'],dock:['boat','trader'],shrine:['scholar','clerk'],garden:['hunter','scholar'],prison:['guard'],embassy:['scholar','trader','singer']};
 People.ensureLocals=function(pl){var want=LOCALS[pl];if(!want||!want.length)return;var have=0;for(var id in S.ppl){var p=S.ppl[id];if(p.alive&&p.loc&&p.loc.pl===pl&&p.kind==='npc')have++;}
  var cap=pl==='market'||pl==='village'||pl==='tavern'?3:2;for(var i=have;i<cap;i++){var q=genPerson({job:want[i%want.length],loc:{r:PLACES[pl].r,pl:pl}});q.title=JOBS[q.job];}};
 /* 位置 */
 People.where=function(id){var p=P(id);if(!p||!p.alive||id===S.pc)return '';if(p.jailed||p.away)return '';
  if(p.here&&p.here.d===S.day&&(p.here.r||S.region)===S.region)return p.here.pl;
  if(S.focusAt&&S.focusAt.id===id&&Eng.now()-S.focusAt.t<=2&&S.focusAt.r===S.region)return S.focusAt.pl;
  if(p.hh){if(S.region==='road')return 'road';if(S.home&&S.home.r===S.region)return S.home.pl;return '';}
  if(p.kind==='named'){if(S.region!=='xianyang')return '';if(p.hidden&&!S.flags.xy_open)return '';var N=NAMED[id];var pl=(p.sched||N.at)[S.per]||'';if(p.spouse===S.pc&&S.per===5&&S.home&&S.home.r==='xianyang')return S.home.pl;return pl;}
  if(p.loc&&p.loc.r===S.region)return p.loc.pl;return '';};
 Eng.now=function(){return S.day*6+S.per;};
 Eng.keep=function(id){if(id&&P(id))S.focusAt={id:id,pl:S.place,r:S.region,t:Eng.now()};};
 People.present=function(pl){pl=pl||S.place;var r=[];for(var id in S.ppl)if(People.where(id)===pl)r.push(id);
  return r.sort(function(a,b){var A=P(a),B=P(b);return (B.hh?3:0)+(B.kind==='named'?2:0)+(B.met?1:0)-((A.hh?3:0)+(A.kind==='named'?2:0)+(A.met?1:0));});};
 People.idByName=function(nm){nm=String(nm||'').replace(/\s/g,'');if(!nm)return '';if(nm==='我'||nm==='你'||nm===pc().n)return S.pc;var best='',bl=0;
  for(var id in S.ppl){var p=S.ppl[id];if(!p.alive&&!p.died)continue;var cands=[p.n,p.gn,p.milk,p.title&&p.met?p.title:null,p.rel];cands.forEach(function(c){if(c&&c.length>=1&&nm.indexOf(c)>=0&&c.length>bl&&(c.length>=2||nm===c)){best=id;bl=c.length;}});}
  if(!best){if(/秦王|大王|王上|陛下|始皇/.test(nm))return 'yingzheng';if(/將軍/.test(nm))return 'mengtian';if(/長公子/.test(nm))return 'fusu';if(/影衛|蒙面/.test(nm))return 'xuanye';if(/侍醫/.test(nm))return 'xiawuju';if(/方士/.test(nm))return 'xufu';if(/蒙毅/.test(nm))return 'mengyi';if(/巴清/.test(nm))return 'baqing';if(/南蘅/.test(nm))return 'nanheng';if(/晏姝/.test(nm))return 'yanshu';if(/鄭國/.test(nm))return 'zhengguo';if(/阿瓔/.test(nm))return 'aying';
   if(/衙役|差爺|官差/.test(nm)&&S.road)return S.road.guards[0];if(/父親|爹|阿爹/.test(nm))return People.byRel('父');if(/母親|娘|阿娘/.test(nm))return People.byRel('母');if(/夫君|相公|娘子|夫人|妻子|丈夫/.test(nm))return pc().spouse||'';if(/師父/.test(nm))return 'master';}
  return best;};
 People.byRel=function(r){for(var id in S.ppl){var p=S.ppl[id];if(p.alive&&p.hh&&p.rel===r)return id;}return '';};
 People.label=function(id){var p=P(id);if(!p)return '';if(id===S.pc)return p.n;if(p.met)return p.n+(p.rel?'（'+p.rel+'）':(p.title?'（'+p.title+'）':''));var a=ageOf(p);return (a<14?(p.g==='f'?'小姑娘':'小男孩'):(a>55?(p.g==='f'?'老婦':'老者'):''))+(p.title||JOBS[p.job]||'路人');};
 People.relTo=function(id){var p=P(id);if(!p)return '';if(p.spouse===S.pc)return gw(p,'夫君','妻子');if(pc().par.indexOf(id)>=0)return gw(p,'父親','母親');if(p.par.indexOf(S.pc)>=0)return gw(p,'兒子','女兒');if(p.rel)return p.rel;if(p.love>=50&&p.aff>=40)return '有情人';if(p.aff>=50)return '摯友';if(p.aff>=20)return '朋友';if(p.aff<=-20)return '仇人';if(p.title==='病人')return '病人';return p.met?'相識':'陌生';};
 /* 關係變化（M18 初識期放緩） */
 var KN={aff:['好感','a','♥'],trust:['信任','t','信'],love:['情意','h','♥']};
 People.rel=function(id,o,why){var p=P(id);if(!p||id===S.pc||!p.alive)return;var early=S.day<150||(p.metDay&&S.day-p.metDay<45);var pm={slow:0.6,mid:0.8,fast:1}[SET.pace]||0.8;
  for(var k in o){if(!KN[k]||!o[k])continue;var v=o[k];if(v>0){v=v*diffMul();if(early)v*=pm;}var d=Math.round(v);if(!d)d=v>0?1:-1;p[k]=clamp((p[k]||0)+d,k==='aff'?-100:0,100);if(typeof UI!=='undefined')UI.pop(id,k,d);}
  if(why)People.note(id,why);Bond.sync(id);};
 People.note=function(id,t,k){var p=P(id);if(!p||id===S.pc)return;if(!p.mem)p.mem=[];var m=p.mem;t=String(t).slice(0,80);if(m.length&&m[m.length-1].t===t)return;m.push({d:S.day,t:t});if(m.length>16)m.shift();Nom.add(id,t,k||'n');};
 People.meet=function(id){var p=P(id);if(!p||p.met)return;p.met=1;p.metDay=S.day;Meta.get().seen[id]=1;Meta.save();Nom.add(id,'與'+pc().n+'相識於'+(PLACES[S.place]||{n:''}).n,'crit');};
 /* 家族心聲 */
 People.thought=function(p){var a=ageOf(p),me=pc();if(!p.alive)return '';if(a<3)return p.food<30?'（哇哇大哭，餓了）':'（咿咿呀呀）';var t=[];
  if(p.food<25)t.push(pick(['肚子好餓……','再撐一下，別讓'+(a<14?'爹娘':'孩子們')+'看見我餓。']));if(p.temp<35.8)t.push('好冷，手腳都沒知覺了。');
  if(p.ill&&p.ill.length)t.push(ILLS[p.ill[0].k].n+'難受，卻不想拖累家裡。');if(p.feet<45)t.push('腳底的泡磨破了，每一步都疼。');
  if(p.pers.indexOf('善妒')>=0&&p.aff<40)t.push('憑什麼'+me.n+'什麼都說了算？');if(p.pers.indexOf('孝順')>=0)t.push('只要家裡人平安就好。');
  if(S.fam.grudge&&!S.fam.grudge.done&&(p.rel==='父'||p.rel==='母'))t.push('只盼有生之年，能洗清這不白之冤。');
  if(p.love>=40&&p.spouse!==S.pc)t.push('（偷偷看了'+me.n+'一眼）');if(p.mood>75)t.push('今天天氣真好。');if(p.aff>=60)t.push('有'+me.n+'在，日子就有盼頭。');
  if(!t.length)t.push(pick(['今天要做的活還很多。','不知明日是晴是雨。','聽說縣裡要修渠了。']));return t[(S.day+a)%t.length];};
 /* ---------- 婚姻 ---------- */
 People.canPropose=function(id){var p=P(id),me=pc();if(!p||!p.alive||p.spouse||me.spouse)return '已有婚配';if(ageOf(p)<16||ageOf(me)<16)return '年紀尚小';if(p.hh&&(p.par.indexOf(S.pc)>=0||me.par.indexOf(id)>=0||(p.par.length&&p.par.some(function(x){return me.par.indexOf(x)>=0;}))))return '血親不可婚配';
  if(p.aff<55)return '好感不足（需 55）';if((p.love||0)<45)return '對方對你尚無情意（情意需 45）';return '';};
 People.marry=function(id){var p=P(id),me=pc();p.spouse=me.id;me.spouse=id;p.met=1;p.marDay=S.day;var royal=id==='yingzheng'||id==='fusu';if(!royal){p.hh=1;p.loc=null;}
  var w=Rule.marryWord(me,p);FW.add(me.n+'與'+p.n+w,[],me.id,{pub:1});People.note(id,'與'+me.n+w,'crit');addLog('〔婚〕'+me.n+'與'+p.n+w,'家');WS.log(me.n+'與'+p.n+w,'起因：兩情相悅','你所為');
  if(royal){Idn.apply({k:'harem',to:id==='yingzheng'?'夫人':'公子夫人',by:id},true);}Fam.tierCalc();return w;};
 /* ---------- 懷孕與生育 ---------- */
 People.fert=function(p){var a=ageOf(p);if(a<16||a>45)return 0;return a<30?1:(a<38?0.6:0.25);};
 People.tryConceive=function(){var me=pc();var sp=P(me.spouse);if(!sp||!sp.alive||me.g===sp.g)return false;var mo=me.g==='f'?me:sp,fa=me.g==='f'?sp:me;if(mo.preg)return false;
  var ch=0.14*People.fert(mo)*(mo.at.con/12)*(S.flags.noKids?0:1);if(rand()<ch){mo.preg={d:S.day,due:S.day+20,fa:fa.id};People.note(sp.id,'得知有了孩子','crit');toast('🌱 '+(mo===me?'你':mo.n)+'有喜了！');addLog('〔家〕'+mo.n+'有喜','家');return true;}return false;};
 People.birth=function(mo){var fa=P(mo.preg.fa)||pc();var env=(Fam.tier()>=2?1:0)+(mo.food>50?0.5:-1);var twins=rand()<0.04;var kids=[];
  for(var i=0;i<(twins?2:1);i++){var c=Gene.child(mo,fa,{env:env,sur:S.fam.sur});c.gn=People.autoName(c);c.n=c.sur+c.gn;c.rel=c.g==='m'?'子':'女';kids.push(c);mo.kids.push(c.id);fa.kids.push(c.id);c.met=1;c.aff=70;c.trust=60;}
  delete mo.preg;S.stats.births=(S.stats.births||0)+kids.length;kids.forEach(function(c){addLog('〔家〕'+c.n+'出生（'+(c.g==='m'?'男':'女')+'）','家');People.note(fa.id===S.pc?mo.id:fa.id,c.n+'出生','crit');});return kids;};
 People.autoName=function(c){return c.g==='f'?pick(GN_F)+(rand()<0.5?pick(GN_F):''):pick(GN_M)+(rand()<0.5?pick(GN_M):'');};
 /* ---------- 衰老與死亡 ---------- */
 People.mort=function(p){var a=ageOf(p);var base=a<5?0.03:(a<50?0.004:(a<60?0.02:(a<70?0.05:(a<80?0.12:0.25))));var c=(p.at.con||10);base*=(1.4-c/25);if(p.expr&&p.expr.indexOf('longev')>=0)base*=0.6;if(p.expr&&p.expr.indexOf('heart')>=0)base*=1.5;if(p.hp<40)base*=2;return base;};
 People.yearTick=function(){for(var id in S.ppl){var p=S.ppl[id];if(!p.alive)continue;var a=ageOf(p);
   if(a>=60&&!Ill.has(p,'old')){p.ill.push({k:'old',sev:1,d:S.day,tr:0});}
   if(p.kind==='named')continue;if(id===S.pc){if(a>=14&&rand()<People.mort(p)*0.8)S.queue.unshift({go:'pcDeath',a:{why:a>55?'壽終':'急病'},stop:1});continue;}
   if(rand()<People.mort(p)*(p.hh?0.8:1))People.die(id,a>55?'壽終正寢':'急病');
   if(p.job==='child'&&a>=14){p.job='none';if(p.hh)S.queue.push({go:'comeOfAge',a:{id:id},stop:1});}}
  Fam.tierCalc();};
 People.die=function(id,why){var p=P(id);if(!p||!p.alive)return;p.alive=0;p.died=S.day;p.cause=why||'';var sp=P(p.spouse);if(sp&&sp.spouse===id)sp.widow=1;
  if(p.hh||p.spouse===S.pc||pc().par.indexOf(id)>=0||p.par.indexOf(S.pc)>=0){S.queue.push({go:'funeral',a:{id:id,why:why},stop:1});addLog('〔喪〕'+p.n+'辭世（'+why+'），享年'+ageOf(p),'家');}
  else if(p.met&&p.aff>=20){WS.log(p.n+'辭世','起因：'+(why||'不詳'),'消息');}
  if(S.focus===id)S.focus='';};
 /* ---------- 傳承 ---------- */
 People.heirs=function(){var me=pc();var r=me.kids.filter(function(k){return alive(k);});if(!r.length){for(var id in S.ppl){var p=S.ppl[id];if(p.alive&&p.hh&&id!==S.pc&&ageOf(p)<ageOf(me)&&p.sur===S.fam.sur)r.push(id);}}
  S.fam.clinic.apps.forEach(function(a){if(alive(a)&&r.indexOf(a)<0)r.push(a);});return r;};
})();
/* ===== 家族 ===== */
var Fam={
 score:function(){var f=S.fam,me=pc();var n=Eng.house().length;return Math.round(S.gold/80+f.land*5+f.house*10+(me.office||0)*14+(me.medoff||0)*12+(me.rank||0)*4+f.fame/2+n*2+(f.clinic.open?f.clinic.lv*8+6:0)+(f.gen-1)*6);},
 tier:function(){return S.fam.tier||0;},
 tierCalc:function(){var s=Fam.score(),t=0;TIERS.forEach(function(x,i){if(s>=x.v)t=i;});if(S.fam.grudge&&!S.fam.grudge.done)t=Math.min(t,1);var old=S.fam.tier||0;S.fam.tier=t;if(t>old&&S.day>2){toast('🏮 家族升為「'+TIERS[t].n+'」');addLog('〔家〕家族聲望升為'+TIERS[t].n,'家');}return t;},
 name:function(){return S.fam.sur+'氏'+TIERS[Fam.tier()].n;}
};
/* ===== 心態卡（M20 Bond）：情感七維＋想法＋關鍵記憶＋秘密認知＋行為傾向＋未了條件 ===== */
var Bond={E:['愛慕','信任','敬重','依賴','戒備','怨恨','愧疚'],
 get:function(id){if(!S.bond[id])S.bond[id]={e:{愛慕:0,信任:0,敬重:0,依賴:0,戒備:20,怨恨:0,愧疚:0},th:'',km:[],sk:[],tend:'觀望',cond:''};return S.bond[id];},
 sync:function(id){var p=P(id);if(!p)return;var b=Bond.get(id);b.e.愛慕=clamp(p.love||0,0,100);b.e.信任=clamp(p.trust||0,0,100);b.e.戒備=clamp(30-p.trust/2-(p.aff>0?p.aff/3:p.aff),0,100);if(p.aff<0)b.e.怨恨=clamp(-p.aff,0,100);b.tend=Bond.tend(id);},
 tend:function(id){var p=P(id),b=S.bond[id];if(!p)return '';if(b&&b.e.怨恨>=40)return '敵視：伺機報復';if(p.love>=60)return '傾心：想與你廝守';if(p.love>=35)return '心動：想多見你';if(p.aff>=50)return '親近：願意幫你';if(p.aff>=20)return '友善：可以商量';if(p.aff<=-15)return '冷淡：不願多談';return '觀望';},
 note:function(id,t,crit){var b=Bond.get(id);b.km.push({d:S.day,t:String(t).slice(0,60)});if(b.km.length>8)b.km.shift();if(crit)Nom.add(id,t,'crit');},
 learn:function(id,ft){var b=Bond.get(id);if(b.sk.indexOf(ft)<0)b.sk.push(ft);if(b.sk.length>8)b.sk.shift();},
 card:function(id){var p=P(id);if(!p)return '';var b=Bond.get(id);Bond.sync(id);var e=b.e;var top=Bond.E.filter(function(k){return e[k]>=25;}).map(function(k){return k+e[k];}).join(' ');
  return '情感['+(top||'平淡')+']；想法：'+(b.th||People.thought(p)||'暫無')+'；傾向：'+b.tend+(b.cond?'；未了條件：'+b.cond:'')+(b.km.length?'；關鍵記憶：'+b.km.slice(-3).map(function(m){return m.t;}).join('／'):'');},
 apply:function(id,o){if(!o||typeof o!=='object'||!P(id))return;var b=Bond.get(id);if(o.e&&typeof o.e==='object')for(var k in o.e){if(Bond.E.indexOf(k)>=0&&typeof o.e[k]==='number')b.e[k]=clamp(b.e[k]+clamp(o.e[k],-10,10),0,100);}
  if(typeof o.th==='string')b.th=o.th.slice(0,60);if(typeof o.cond==='string')b.cond=o.cond.slice(0,60);if(typeof o.mem==='string')Bond.note(id,o.mem);}
};
/* ===== 反失憶持久記憶庫（M21 Nom） ===== */
var Nom={
 cap:function(){return SET.memd==='mid'?28:48;},
 add:function(id,t,k){if(!id||id===S.pc||!P(id))return;var L=S.nm[id]||(S.nm[id]=[]);t=String(t).slice(0,90);if(L.length&&L[L.length-1].t===t)return;L.push({d:S.day,t:t,k:k||'n'});
  var cap=Nom.cap();var keep={recent:1,secret:1,told:1,crit:1};var rc=L.filter(function(x){return x.k==='recent';});if(rc.length>8){var o=rc[0];o.k='n';}
  while(L.length>cap){var i=-1;for(var j=0;j<L.length;j++){if(!keep[L[j].k]){i=j;break;}}if(i<0)i=0;L.splice(i,1);}},
 list:function(id,n){return (S.nm[id]||[]).slice(-(n||10));},
 brief:function(id){var L=S.nm[id]||[];var imp=L.filter(function(x){return x.k!=='n'&&x.k!=='recent';}).slice(-4);var rec=L.filter(function(x){return x.k==='recent';}).slice(-3);var nn=L.filter(function(x){return x.k==='n';}).slice(-3);
  return imp.concat(nn).concat(rec).map(function(x){return x.t;}).join('／');},
 RE:/初次見面|素未謀面|初次相見|你是何人|你是誰|姑娘是誰|公子是誰|我們見過嗎|從未見過|不認識你|不記得你|閣下是/,
 fixLine:function(id,l){var p=P(id);if(!p||!p.met||!(S.nm[id]||[]).length)return null;if(!Nom.RE.test(l))return null;
  return l.replace(/初次見面|初次相見/g,'又見面了').replace(/素未謀面|從未見過/g,'早已相識').replace(/你是何人|你是誰|姑娘是誰|公子是誰|我們見過嗎|閣下是/g,'是你啊').replace(/不認識你|不記得你/g,'記得你');},
 check:function(r){var hit=0;var lines=r.scene.split('\n').map(function(l){var m=l.match(/^([^：「]{1,8})[：:]/);var who=m?People.idByName(m[1]):(r.speaker||'');var f=who&&who!==S.pc?Nom.fixLine(who,l):null;if(f!==null){hit=1;return f;}return l;});
  if(hit){r.scene=lines.join('\n');Nom.stat=(Nom.stat||0)+1;try{toast('🧠 已修正角色失憶的台詞');}catch(e){}}return r;},
 migrate:function(){for(var id in S.ppl){var p=S.ppl[id];if(p.mem&&p.mem.length&&!(S.nm[id]||[]).length)p.mem.forEach(function(m){Nom.add(id,m.t,'n');});}}
};
/* ===== 即時記憶（M20 Recall）＋完整日誌（FullLog） ===== */
var Recall={
 ingest:function(sc,choice){if(!sc||!sc.lines)return;var here=People.present();var me=pc();var buf=[];
  sc.lines.forEach(function(l){if(!l.t)return;var who=l.sp==='p'?me.n:(l.sp?cn(l.sp):'');buf.push((who?who+'：':'')+l.t);
   if(l.sp&&l.sp!=='p'&&P(l.sp))Nom.add(l.sp,'我曾說：「'+String(l.t).slice(0,50)+'」','recent');
   if(l.sp==='p')here.forEach(function(id){Nom.add(id,me.n+'對我說：「'+String(l.t).slice(0,50)+'」','recent');});});
  S.recent=((S.recent||'')+'\n'+buf.join('\n')).slice(-1800);},
 said:function(id,t){var me=pc();Nom.add(id,me.n+'對我說：「'+String(t).slice(0,60)+'」','recent');S.recent=((S.recent||'')+'\n'+me.n+'：'+t).slice(-1800);}
};
var FullLog={
 add:function(sc){if(!sc||!sc.lines||!sc.lines.length)return;var me=pc();var t=sc.lines.map(function(l){return (l.sp?(l.sp==='p'?me.n:cn(l.sp))+'：':'')+l.t;}).join('\n').slice(0,6000);
  S.full.push({d:S.day,per:S.per,pl:S.place,t:t,ch:''});var tot=0;for(var i=S.full.length-1;i>=0;i--){tot+=S.full[i].t.length;if(tot>300000||S.full.length-i>240){S.full=S.full.slice(i+1);break;}}},
 choose:function(t){var L=S.full[S.full.length-1];if(L&&!L.ch)L.ch=String(t).slice(0,80);}
};
