/* ===== 引擎：場景、時間、數值、里程碑、章節、結局 ===== */
var Eng={};var NODES={};
(function(){
 Eng.idByName=function(nm){nm=String(nm||'').replace(/\s/g,'');for(var i=0;i<CHAR_ORDER.length;i++){var c=CHARS[CHAR_ORDER[i]];if(nm===c.n||nm.indexOf(c.n)>=0)return CHAR_ORDER[i];}
  if(/秦王|大王|王上|陛下/.test(nm))return 'yingzheng';if(/將軍/.test(nm))return 'mengtian';if(/公子扶蘇|長公子/.test(nm))return 'fusu';if(/影衛|蒙面/.test(nm))return 'xuanye';return '';};
 /* 某角色此刻在哪 */
 Eng.where=function(id){var r=S.c[id],c=CHARS[id];if(r.jailed)return '';if(r.away&&r.away>S.day)return '';if(r.here&&r.here.d===S.day)return r.here.pl;if(S.focusAt&&S.focusAt.id===id&&Eng.now()-S.focusAt.t<=2)return S.focusAt.pl;
  if(c.lock>S.ch&&!r.met)return '';if(c.hidden&&!S.flags.xy_open)return '';return c.at[perName()]||'';};
 Eng.now=function(){return S.day*4+S.per;};
 Eng.keep=function(id){if(id&&S.c[id])S.focusAt={id:id,pl:S.place,t:Eng.now()};};
 Eng.present=function(pl){pl=pl||S.place;return CHAR_ORDER.filter(function(id){return Eng.where(id)===pl;});};
 Eng.unlocked=function(pl){var P=PLACES[pl];if(!P)return false;if(P.need&&S.ch<P.need&&!S.flags.palace_ok)return false;return true;};
 /* 數值 */
 function popC(id,k,v){if(!v)return;var r=S.c[id];var mul=(v>0&&(k==='aff'||k==='heart'||k==='trust'))?diffMul():1;var d=Math.round(v*mul);if(!d)d=v>0?1:-1;r[k]=clamp(r[k]+d,k==='aff'?-50:0,100);
  UI.pop(id,k,d);}
 Eng.c=function(id,o,why){if(!S.c[id])return;for(var k in o)popC(id,k,o[k]);if(why)Mood.note(id,why);Eng.checkMs(id);};
 Eng.p=function(o){var P=S.p;for(var k in o){if(P[k]===undefined)continue;P[k]=clamp(P[k]+o[k],k==='gold'?0:0,k==='gold'?99999:(k==='mind'||k==='hp'?100:999));if(o[k])UI.popP(k,o[k]);}};
 Eng.applyFx=function(fx){if(!fx)return;if(fx.p)Eng.p(fx.p);if(fx.c)for(var id in fx.c)Eng.c(id,fx.c[id]);if(fx.mem)for(id in fx.mem)Mood.note(id,fx.mem[id]);};
 Eng.item=function(k,n){S.inv[k]=Math.max(0,(S.inv[k]||0)+n);if(!S.inv[k])delete S.inv[k];};
 /* 場景：文字 → 行 */
 Eng.textScene=function(text,sp,ex,bg){var lines=[];String(text||'').split(/\n+/).forEach(function(l){l=l.trim();if(!l)return;
   var m=l.match(/^([^：「」\s]{1,6})[：:]\s*(.*)$/);var who=m?Eng.idByName(m[1]):'';
   if(m&&(who||m[1]===S.p.name||m[1]==='你')){lines.push({sp:who||'p',ex:ex,t:m[2]});}else lines.push({sp:'',t:l});});
  return {lines:lines,focus:sp||'',ex:ex||'normal',bg:bg||S.place};};
 Eng.L=function(arr,focus,bg,ch,o){/* arr: [[sp,text,expr]] 或字串 */var lines=arr.map(function(x){if(typeof x==='string')return {sp:'',t:x};return {sp:x[0],t:x[1],ex:x[2]};});
  var sc={lines:lines,focus:focus||'',bg:bg||S.place,ch:ch||[{t:'繼續',go:'hub'}]};if(o)for(var k in o)sc[k]=o[k];return sc;};
 /* 時間 */
 Eng.pass=function(n){if(n===undefined)n=1;for(var i=0;i<n;i++){S.per++;if(S.per>3){S.per=0;S.day++;Eng.newDay();}}};
 Eng.newDay=function(){CHAR_ORDER.forEach(function(id){var r=S.c[id];r.talked=0;if(r.jeal>0)r.jeal=Math.max(0,r.jeal-2);if(!r.cured&&r.hp>40&&rand()<0.06)r.hp-=3;});
  S.p.mind=clamp(S.p.mind+2,0,100);WS.tick();Letters.tick();if(SET.autosave!==false)saveSlot('auto',true);};
 /* 里程碑 */
 var MS=[{aff:25,heart:0,trust:0},{aff:50,heart:25,trust:20},{aff:75,heart:55,trust:40}];
 Eng.msReady=function(id){var r=S.c[id];if(r.stage>=3)return false;var m=MS[r.stage];return r.met&&r.aff>=m.aff&&r.heart>=m.heart&&r.trust>=m.trust&&!(r.stage===2&&S.ch<2);};
 Eng.checkMs=function(id){if(Eng.msReady(id)&&S.pendMs.indexOf(id)<0)S.pendMs.push(id);};
 /* 章節推進檢查（每次回地圖） */
 Eng.chapterCheck=function(){var need=Pace.mul();
  if(S.ch===0&&S.p.fame>=10&&!S.evseen.summon)return 'evSummon';
  if(S.ch===1&&S.c.yingzheng.met&&S.day>=S.chDay+Math.round(5*need)&&!S.evseen.poison)return 'evPoison';
  if(S.ch===2&&S.flags.poison_solved&&S.day>=S.chDay+Math.round(4*need)&&!S.evseen.storm)return 'evStorm';
  if(S.ch===3&&S.day>=S.chDay+Math.round(6*need)&&!S.evseen.finale)return 'evFinale';
  if(S.ch<4&&S.day>=Math.round(110*need)&&!S.evseen.finale){S.ch=3;return 'evFinale';}
  return '';};
 Eng.setCh=function(n){S.ch=n;S.chDay=S.day;UI.banner(CHAPTERS[n].n,CHAPTERS[n].goal);addLog('〔章節〕'+CHAPTERS[n].n);};
 /* 回地圖前的待處理事件 */
 Eng.pending=function(){
  if(S.pendMs.length){var id=S.pendMs.shift();if(Eng.msReady(id))return {go:'ms',a:{id:id}};}
  var cc=Eng.chapterCheck();if(cc)return {go:cc,a:{}};
  var fe=Eng.festival();if(fe)return {go:'festival',a:{i:fe}};
  var j=Eng.jealousy();if(j)return {go:'jealous',a:j};
  if(S.pend&&S.pend.text&&!S.pend.shown){S.pend.shown=1;return {go:'resume',a:{}};}
  return null;};
 Eng.festival=function(){for(var i=0;i<FESTIVALS.length;i++){var f=FESTIVALS[i];var dd=(S.day-1)%120+1;if(dd===f.d&&!S.evseen['fe'+i+'_'+Math.floor((S.day-1)/120)])return i+1;}return 0;};
 Eng.jealousy=function(){if(S.day-(S.flags.lastJeal||-99)<6)return null;var hi=CHAR_ORDER.filter(function(id){return S.c[id].jeal>=40&&S.c[id].heart>=25&&Eng.where(id);});if(!hi.length)return null;
  var a=hi[0];var b=CHAR_ORDER.filter(function(id){return id!==a&&S.c[id].heart>=20;}).sort(function(x,y){return S.c[y].heart-S.c[x].heart;})[0];if(!b)return null;return {a:a,b:b};};
 /* 結局判定 */
 Eng.endingFor=function(id){var r=S.c[id];if(!id)return CHAR_ORDER.filter(function(x){return S.c[x].aff>=60;}).length>=4?'hidden_doctor':'normal';
  if(id==='hanfei'&&S.flags.hanfei_jail&&!S.flags.hanfei_saved)return 'be_hanfei';
  if(id==='jingke'&&S.flags.jingke_left&&!S.flags.jingke_stopped)return 'be_jingke';
  if(id==='yingzheng'&&r.jeal>=70)return 'be_yingzheng';
  if(r.stage>=3&&r.trust>=55)return 'he_'+id;
  return 'normal';};
 Eng.end=function(key){S.endings[key]=S.day;var g=Meta.get();g.endings[key]=1;Meta.save();addLog('〔結局〕'+ENDINGS[key].n);};
 /* CG 解鎖（跨存檔記在 Meta） */
 Eng.cg=function(id){S.cg[id]=S.day;var g=Meta.get();g.cg[id]=1;Meta.save();};
 /* 背景回顧 */
 Eng.back=function(l){S.back.push({sp:l.sp||'',t:String(l.t).slice(0,140),d:S.day});if(S.back.length>200)S.back.shift();};
})();
/* 跨存檔資料：CG 相冊、結局、圖鑑 */
var Meta={get:function(){if(Meta._g)return Meta._g;var g={};try{g=JSON.parse(localStorage.getItem('qlv_meta')||'{}')||{};}catch(e){g={};}if(!g.cg)g.cg={};if(!g.endings)g.endings={};if(!g.seen)g.seen={};Meta._g=g;return g;},save:function(){try{localStorage.setItem('qlv_meta',JSON.stringify(Meta._g));}catch(e){}}};
/* 劇情節奏 */
var Pace={mul:function(){return {slow:1.4,mid:1,fast:0.7}[SET.pace]||1;}};
/* ===== 世界節制（M26 簡化）：自主大事須有前因、全局限頻 ===== */
var WS={};
WS.log=function(t,why,tag){S.world.maj.push({d:S.day,t:t,why:why||'',tag:tag||'傳聞'});if(S.world.maj.length>30)S.world.maj.shift();addLog('〔'+(tag||'傳聞')+'〕'+t+(why?'——'+why:''));};
WS.brief=function(){return S.world.maj.filter(function(m){return S.day-m.d<=30;}).slice(-8).reverse().map(function(m){return '〔'+m.tag+'〕'+m.t+(m.why?'——'+m.why:'');});};
WS.allow=function(){if(SET.wsane===false)return rand()<0.3;var last=S.world.maj.filter(function(m){return m.tag!=='你所為';});var ld=last.length?last[last.length-1].d:-99;
 var cd={slow:12,mid:8,fast:5}[SET.pace]||8;if(S.day-ld<cd)return false;var n30=last.filter(function(m){return S.day-m.d<30;}).length;if(n30>=({slow:2,mid:3,fast:4}[SET.pace]||3))return false;return rand()<0.35;};
var WEVENTS=[
 {t:'李斯上〈諫逐客書〉，秦王收回逐客令',why:'起因：宗室欲驅逐六國客卿',need:function(){return S.ch>=1;},fx:function(){S.c.lisi.trust=clamp(S.c.lisi.trust+2,0,100);}},
 {t:'北疆胡騎犯邊，蒙恬奉命巡邊數日',why:'起因：邊報告急',need:function(){return S.c.mengtian.met&&S.day>12;},fx:function(){S.c.mengtian.away=S.day+2;}},
 {t:'咸陽城南時疫初起，醫者稀缺',why:'起因：春寒反覆、井水不潔',need:function(){return true;},fx:function(){S.flags.plague=S.day;}},
 {t:'韓國使者入秦，朝中議論存韓之策',why:'起因：秦欲伐韓，韓王遣使周旋',need:function(){return S.ch>=1;},fx:function(){}},
 {t:'市井傳言：燕國有刺客入關',why:'據傳起因：燕太子丹在秦受辱而歸（詳情不明）',need:function(){return S.ch>=2;},fx:function(){}}
];
WS.tick=function(){if(!WS.allow())return;var c=WEVENTS.filter(function(e,i){return e.need()&&!S.evseen['we'+i];});if(!c.length)return;var e=pick(c);S.evseen['we'+WEVENTS.indexOf(e)]=1;e.fx();WS.log(e.t,e.why,'傳聞');};
