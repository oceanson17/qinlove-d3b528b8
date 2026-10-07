/* ===== 時間（六時段）、曆法、天氣、生存（飽食、體力、健康、體溫、心情）、疾病、用膳、歲月流轉 ===== */
var Eng={hooks:{per:[],day:[],year:[]}};var NODES={};
(function(){
 Eng.on=function(k,f){Eng.hooks[k].push(f);};
 function run(k,a){Eng.hooks[k].forEach(function(f){try{f(a);}catch(e){console.error('hook '+k,e);}});}
 /* ---- 曆法 ---- */
 Eng.yearIdx=function(d){return Math.floor(((d||S.day)-1)/DPY);};
 Eng.yb=function(d){return START_BC-Eng.yearIdx(d);};
 Eng.season=function(d){return Math.floor((((d||S.day)-1)%DPY)/DPS);};
 Eng.dis=function(d){return ((d||S.day)-1)%DPS+1;};
 Eng.era=function(yb){yb=yb||Eng.yb();var H=S.hist,zd=H.zdie||210,alt=H.alt;
  if(yb>zd)return (yb>221?'秦王政':'始皇')+cnum(247-yb)+'年';
  if(alt==='fusu'){var n=zd-yb;return n<=30?'秦帝扶蘇'+cnum(n)+'年':'秦'+cnum0(Math.floor((n-31)/30)+3)+'世'+cnum((n-31)%30+1)+'年';}
  if(alt==='zheng'&&yb===zd)return '始皇'+cnum(247-yb)+'年';
  if(yb>=zd-3&&yb>206)return '秦二世'+cnum(zd-yb)+'年';
  var R=[[206,'漢王'],[201,'漢高祖'],[194,'漢惠帝'],[187,'高后'],[179,'漢文帝'],[156,'漢景帝'],[140,'漢武帝'],[86,'漢昭帝'],[73,'漢宣帝'],[48,'漢元帝'],[32,'漢成帝']];
  for(var i=R.length-1;i>=0;i--){if(yb<=R[i][0]){if(i===R.length-1||yb>R[i+1][0])return R[i][1]+cnum(R[i][0]-yb+1)+'年';}}return '漢'+cnum(206-yb)+'年';};
 Eng.dateStr=function(short){return Eng.era()+' '+SEASONS[Eng.season()]+(short?'':'·第'+Eng.dis()+'日')+' '+PERIODS[S.per];};
 Eng.ybStr=function(yb){return '前'+yb+'年';};
 /* ---- 天氣 ---- */
 window.Weather={roll:function(){var se=WX.season[Eng.season()];var k=wpick(se.w);var R=REGIONS[S.region]||REGIONS.xianyang;var dt=(R.dt||0)+(S.region==='road'&&S.road?S.road.dt*0.5:0)+(S.region==='frontier'&&S.fam.dest?(EXILE_DEST.filter(function(x){return x.k===S.fam.dest;})[0]||{dt:0}).dt:0);
  if(k==='雪'||k==='大雪'){if(se.t[0]>2)k='小雨';}var b=se.t[0]+rand()*(se.t[1]-se.t[0])+WX.kinds[k].dt+dt;S.wx={k:k,b:Math.round(b),t:Math.round(b+WX.per[S.per])};},
  upd:function(){if(!S.wx)Weather.roll();S.wx.t=Math.round(S.wx.b+WX.per[S.per]);if(S.wx.lock!==S.day&&rand()<0.12){var se=WX.season[Eng.season()];var k=wpick(se.w);if((k==='雪'||k==='大雪')&&se.t[0]>2)k='陰';S.wx.k=k;}},
  str:function(){var w=S.wx||{k:'晴',t:15};return (WX.kinds[w.k]||{i:''}).i+w.k+' '+w.t+'°C';},
  wet:function(){return (WX.kinds[S.wx.k]||{}).wet||0;}};
 /* ---- 住所與保暖 ---- */
 var SHELTER=[0,6,10,13,15];var HOUSE_N=['無處棲身','草棚','土屋','瓦屋','宅院'];Eng.HOUSE_N=HOUSE_N;
 Eng.atHome=function(){return S.home&&S.place===S.home.pl&&S.region===S.home.r;};
 Eng.shelter=function(){if(S.region==='road')return S.flags.tent===S.day?4:0;if(Eng.atHome())return S.place==='lodge'&&!S.fam.house?(S.flags.paidLodge>=S.day-1&&S.flags.paidLodge?10:0):SHELTER[S.fam.house||0];if(['clinic','tavern','palace','study','yamen','school','lodge'].indexOf(S.place)>=0)return 10;if(PLACES[S.place]&&PLACES[S.place].wild)return 0;return 4;};
 Eng.effT=function(p){var t=S.wx.t,sh=Eng.shelter();var bonus=sh+(S.flags.fire===S.day&&(S.per>=4||Eng.skipping)&&(Eng.atHome()||S.region==='road')?6:0)+(p.cloth||0)/100*5+((S.inv.winterc||0)>0&&t<12?8:0);var e=t<22?Math.min(t+bonus,Math.max(t,23)):t-(sh>=4?3:0);if(sh<4&&Weather.wet())e-=3;return e;};
 /* ---- 家中成員（同住、在世） ---- */
 Eng.house=function(){var r=[];for(var id in S.ppl){var p=S.ppl[id];if(p.alive&&(p.hh||id===S.pc))r.push(p);}return r;};
 /* ---- 每時段 ---- */
 Eng.perTick=function(){var me=pc();Weather.upd();
  Eng.house().forEach(function(p){var a=ageOf(p);var dec=a<3?1:(a<12?2:3);if(p.preg)dec+=1;p.food=clamp(p.food-dec,0,100);
   if(p.food<=0){p.hp=clamp(p.hp-3,0,100);p.mood=clamp(p.mood-2,0,100);}else if(p.food<20)p.mood=clamp(p.mood-1,0,100);
   var near=p.id===S.pc||Eng.atHome()||S.region==='road';if(!near)return;
   var e=Eng.effT(p);if(e<12)p.temp=clamp(p.temp-(12-e)*0.022,33,41.5);else if(e>31)p.temp=clamp(p.temp+(e-31)*0.03,33,41.5);else p.temp+= (36.6-p.temp)*0.35;
   if(p.temp<35.6){p.hp=clamp(p.hp-2,0,100);p.mood=clamp(p.mood-2,0,100);if(rand()<0.06)Ill.add(p,'cold',1);}
   if(p.temp>38.2&&!Ill.has(p,'fever')&&!Ill.has(p,'cold')){p.hp=clamp(p.hp-1,0,100);p.sta=clamp(p.sta-3,0,100);if(rand()<0.06)Ill.add(p,'heat',1);}});
  if(me.sta<=0){me.hp=clamp(me.hp-1,0,100);}
  run('per');};
 Eng.pass=function(n){if(n===undefined)n=1;for(var i=0;i<n;i++){S.per++;if(S.per>5){S.per=0;S.day++;Eng.newDay();}
   if((SET.autoEat||Eng.skipping)&&(S.per===2||S.per===4))Eng.meal(true);Eng.perTick();if(Eng.dead())break;}};
 Eng.dead=function(){var me=pc();if(me.hp<=0&&!S.flags.dying){S.flags.dying=1;S.queue.unshift({go:'pcDeath',a:{why:Ill.cause(me)}});return true;}return false;};
 Eng.newDay=function(){var oy=Eng.yearIdx(S.day-1);Weather.roll();S.flags.lastDay=S.day;
  Eng.house().forEach(function(p){Ill.day(p);p.mood=clamp(p.mood+(p.food>50?1:-1),0,100);});
  if(Eng.yearIdx()!==oy)Eng.newYear();
  run('day');if(SET.autosave!==false&&!Eng.skipping)saveSlot('auto',true);};
 Eng.newYear=function(){run('year');addLog('〔歲〕'+Eng.era()+'（'+Eng.ybStr(Eng.yb())+'）','歲');};
 /* ---- 用膳：一鍋煮，鍋裡有毒物→同鍋全家中毒 ---- */
 Eng.foodKeys=function(){return Object.keys(S.inv).filter(function(k){return ITEMS[k]&&ITEMS[k].k==='food'&&S.inv[k]>0;}).sort(function(a,b){return ITEMS[a].food-ITEMS[b].food;});};
 Eng.meal=function(auto,lean){var mem=Eng.house().filter(function(p){return p.id===S.pc||Eng.atHome()||S.region==='road';});var need=0;
  mem.forEach(function(p){need+=Math.max(0,(lean?55:80)-p.food)*(ageOf(p)<12?0.6:1);});if(need<8)return auto?null:'大家都還不餓。';
  var keys=Eng.foodKeys();if(!keys.length){if(!auto)return '家中已無存糧。';return null;}
  var got=0,used={},bad=0;for(var i=0;i<keys.length&&got<need;i++){var k=keys[i];while(S.inv[k]>0&&got<need){S.inv[k]--;got+=ITEMS[k].food;used[k]=(used[k]||0)+1;if(ITEMS[k].poison)bad=Math.max(bad,ITEMS[k].poison);}if(!S.inv[k])delete S.inv[k];}
  var per=got/Math.max(1,mem.length);mem.forEach(function(p){p.food=clamp(p.food+per*(ageOf(p)<12?1.3:1),0,100);p.mood=clamp(p.mood+1,0,100);});
  var txt='全家用膳：'+Object.keys(used).map(function(k){return ITEMS[k].n+'×'+used[k];}).join('、')+'。';
  if(bad){mem.forEach(function(p){Ill.add(p,'poison',bad+1);});txt+='\n飯後不久，一家人接連捂著肚子嘔吐——鍋裡有東西不對勁！';S.queue.push({go:'poisoned',a:{}});addLog('全家誤食毒物腹痛','家');}
  if(auto&&!bad)return null;return txt;};
 /* ---- 睡覺（到下一個清晨） ---- */
 Eng.sleep=function(){var me=pc();var sh=Eng.shelter();var n=(6-S.per)%6||6;Eng.pass(n);var gain=sh>=10?70:(sh>=4?50:35);
  Eng.house().forEach(function(p){if(p.id!==S.pc&&!Eng.atHome()&&S.region!=='road')return;p.sta=clamp(p.sta+gain,0,100);if(p.food>40&&p.temp>35.8)p.hp=clamp(p.hp+4,0,100);});
  return sh>=10?'你睡得很沉。':(sh>=4?'將就著睡了一夜。':'露宿野外，冷得幾次醒來。');};
 /* ---- 歲月流轉：快速度過若干日（自動吃飯、睡覺、工作），途中遇大事或危險即停 ---- */
 Eng.skip=function(days){var out=[],d0=S.day,me=pc();Eng.skipping=1;S.skipLog=out;
  try{for(var i=0;i<days;i++){var hp0=me.hp;Eng.autoDay(out);Eng.pass(6);
   if(!me.alive||me.hp<=0||S.flags.dying)break;if(S.flags.babyStart&&ageOf(me)<14)S.queue=S.queue.filter(function(q){return /^(birth|nameKid|funeral|poisoned|hungry|collapse|pcDeath|comeOfAge|poisonAll)$/.test(q.go);});if(S.queue.some(function(q){return q.stop;})){out.push('（有要事發生，歲月暫停流轉。）');break;}if(me.hp<35&&hp0>=35){out.push('（你病倒了，歲月暫停流轉。）');break;}}}
  finally{Eng.skipping=0;}saveSlot('auto',true);return {lines:out,days:S.day-d0};};
 Eng.autoDay=function(out){var me=pc();var a=ageOf(me);
  if(S.region!=='road'){var units=Eng.foodKeys().reduce(function(t,k){return t+S.inv[k];},0);var need=Math.ceil(Eng.house().length*1.5)+1;if(units<need&&S.gold>=12){var n=Math.min(need-units+1,Math.floor((S.gold-6)/6));if(n>0){S.gold-=n*6;S.inv.grain=(S.inv.grain||0)+n;}}}
  if(S.home&&S.region===S.home.r)S.place=S.home.pl;
  if(S.region!=='road'&&S.wx.t<10&&Eng.atHome()&&S.flags.fire!==S.day){if((S.inv.wood||0)>0){S.inv.wood--;S.flags.fire=S.day;}else if(S.gold>=4){S.gold-=2;S.flags.fire=S.day;}}
  if(S.place==='lodge'&&!S.fam.house&&S.gold>=10){S.gold-=10;S.flags.paidLodge=S.day;}
  if(S.fam.clinic.open&&S.region==='xianyang'){var bought=[];['alcohol','bandage','thread','ors','antipyr'].forEach(function(k){if(ITEMS[k]&&(S.inv[k]||0)<2&&S.gold>=ITEMS[k].p*2+30){S.gold-=ITEMS[k].p*2;Inv.add(k,2);bought.push(ITEMS[k].n);}});if(bought.length&&out.length<40)out.push('補購醫館用品：'+bought.join('、')+'。');}
  if(a>=14)Work.auto(out);
  if(S.region!=='road'){var JOBPAY={tradoc:10,owner:12,trader:9,scholar:7,farmer:7,weaver:6,exile:3,guard:7,none:2,child:0};var inc=0;Eng.house().forEach(function(q){var qa=ageOf(q);if(q.id===S.pc||!q.alive||qa<15||qa>62||q.hp<40)return;inc+=(JOBPAY[q.job]!=null?JOBPAY[q.job]:3);});if(S.gold>300*(1+(S.fam.tier||0)))inc=Math.round(inc*0.2);if(inc){S.gold+=inc;S.flags.famInc=inc;}}
  me.sta=clamp(me.sta+40,0,100);Eng.house().forEach(function(p){Ill.autoCare(p);});};
})();
/* ===== 疾病 ===== */
var ILLS={cold:{n:'風寒',d:'發熱咳嗽',case:'fever'},heat:{n:'中暑',d:'頭暈乏力',case:'fever'},fever:{n:'高熱',d:'渾身滾燙',case:'fever'},diarrhea:{n:'腹瀉',d:'上吐下瀉',case:'diarrhea'},poison:{n:'中毒腹痛',d:'誤食毒物',case:'poison'},
 wound:{n:'外傷',d:'傷口未癒',case:'cut'},infect:{n:'傷口感染',d:'紅腫流膿',case:'abscess'},blister:{n:'腳底水泡',d:'磨破的腳泡',case:'cut'},frost:{n:'凍傷',d:'手足紫腫',case:'burn'},lung:{n:'肺炎',d:'咳黃痰胸痛',case:'lung'},old:{n:'年老體衰',d:'精力日減'},afl:{n:'舊毒',d:'體內潛伏的毒',chronic:1}};
var Ill={
 has:function(p,k){return (p.ill||[]).some(function(x){return x.k===k;});},
 get:function(p,k){return (p.ill||[]).filter(function(x){return x.k===k;})[0];},
 add:function(p,k,sev){if(!p.ill)p.ill=[];var x=Ill.get(p,k);if(x){x.sev=clamp(x.sev+(sev||1),1,5);return x;}x={k:k,sev:clamp(sev||1,1,5),d:S.day,tr:0};p.ill.push(x);if(p.id===S.pc)toast('🤒 你得了「'+ILLS[k].n+'」');return x;},
 cure:function(p,k,n){var x=Ill.get(p,k);if(!x)return;x.sev-=n||5;x.tr=1;if(x.sev<=0)p.ill=p.ill.filter(function(y){return y!==x;});},
 day:function(p){if(!p.ill||!p.ill.length)return;var con=p.at?p.at.con:10;p.ill.slice().forEach(function(x){if(ILLS[x.k]&&ILLS[x.k].chronic)return;
  var res=con/20+(p.food>50?0.2:-0.2)+(x.tr?0.35:0)+(p.temp>35.8?0.1:-0.2);if(/^(poison|diarrhea|heat|blister)$/.test(x.k)){if(rand()<0.6+res*0.3)x.sev--;else if(x.sev>=4&&rand()<0.1)x.sev++;}else if(rand()<0.25+res*0.4)x.sev--;else if(rand()<0.35-res*0.2)x.sev++;
  if(x.k==='wound'&&!x.tr&&rand()<0.2){Ill.add(p,'infect',1);}if(x.k==='cold'&&x.sev>=3&&rand()<0.15)Ill.add(p,'lung',1);if(x.k==='blister'&&!x.tr&&rand()<0.15)Ill.add(p,'infect',1);
  x.sev=clamp(x.sev,0,5);p.hp=clamp(p.hp-x.sev*1.6,0,100);if(x.sev<=0)p.ill=p.ill.filter(function(y){return y!==x;});});
  if(p.id!==S.pc&&p.hp<=0)People.die(p.id,Ill.cause(p));},
 autoCare:function(p){if(!p.ill.length)return;var me=pc();if((me.sk.med||0)<20)return;p.ill.forEach(function(x){var C=CASES.filter(function(c){return c.k===(ILLS[x.k]||{}).case;})[0];if(!C)return;var ok=C.seq.every(function(t){var T=TECHS[t];if(!S.fam.tech[t])return false;if(T.need)for(var k in T.need)if((S.inv[k]||0)<T.need[k])return false;return true;});
  if(ok&&rand()<0.5+me.sk.med/200){C.seq.forEach(function(t){var T=TECHS[t];if(T.need)for(var k in T.need)Inv.add(k,-T.need[k]);});Ill.cure(p,x.k,3);}});},
 cause:function(p){if(p.food<=0)return '飢餓';var w=(p.ill||[]).slice().sort(function(a,b){return b.sev-a.sev;})[0];if(w)return ILLS[w.k].n;if(p.temp<35)return '凍餒';return ageOf(p)>60?'壽終':'積勞成疾';},
 str:function(p){return (p.ill||[]).map(function(x){return ILLS[x.k].n+'('+['','輕','中','重','危','危'][x.sev]+')';}).join('、')||'無';}
};
/* ===== 背包 ===== */
var Inv={add:function(k,n){if(!ITEMS[k])return;S.inv[k]=Math.max(0,(S.inv[k]||0)+n);if(!S.inv[k])delete S.inv[k];},has:function(k,n){return (S.inv[k]||0)>=(n||1);},
 str:function(){var agg={};Object.keys(S.inv).forEach(function(k){if(!ITEMS[k])return;var n=ITEMS[k].n;agg[n]=(agg[n]||0)+S.inv[k];});return Object.keys(agg).map(function(n){return n+'×'+agg[n];}).join('、')||'空空如也';},
 gold:function(n){S.gold=Math.max(0,Math.round(S.gold+n));if(n&&typeof UI!=='undefined')UI.popP('gold',Math.round(n));}};
