/* ===== 西醫行醫：生命徵象 → 望觸聽 → 診斷 → 依序處置（耗材）→ 結果與世人反應；製藥；採集辨識 ===== */
var Med={cur:null};
(function(){
 function $(i){return document.getElementById(i);}
 Med.caseOf=function(k){for(var i=0;i<CASES.length;i++)if(CASES[i].k===k)return i;return -1;};
 Med.pickCase=function(maxLv){var me=pc();var lv=maxLv||(me.sk.med>=70?3:(me.sk.med>=40?2:1));var c=[];CASES.forEach(function(x,i){if(x.lv<=lv)c.push(i);});if(S.flags.plague&&S.day-S.flags.plague<20&&rand()<0.4)return Med.caseOf('diarrhea');return pick(c);};
 Med.illCase=function(p){var w=(p.ill||[]).slice().sort(function(a,b){return b.sev-a.sev;})[0];if(!w)return -1;var k=(ILLS[w.k]||{}).case;return k?Med.caseOf(k):-1;};
 Med.techOk=function(t){var T=TECHS[t];if(!T)return {ok:false,why:''};if(t!=='incant'&&t!=='bleed'&&t!=='herbs'&&!S.fam.tech[t])return {ok:false,why:'未習得'};if(T.tool&&!Inv.has(T.tool))return {ok:false,why:'缺'+ITEMS[T.tool].n};if(T.need)for(var k in T.need)if(!Inv.has(k,T.need[k]))return {ok:false,why:'缺'+ITEMS[k].n};return {ok:true};};
 Med.techs=function(){var o=TECH_ORDER.filter(function(t){return S.fam.tech[t]||t==='incant'||t==='bleed'||t==='herbs';});return o;};
 Med.open=function(o){var ci=o.ci!=null?o.ci:(o.pid?Med.illCase(P(o.pid)):-1);if(ci<0)ci=Med.pickCase();var d=CASES[ci];var pp=o.pid?P(o.pid):null;
  Med.cur={d:d,ci:ci,pid:o.pid||'',src:o.src||'clinic',fee:o.fee!=null?o.fee:d.fee,rev:{},step:'exam',dxOk:null,seq:[],dxOpts:shuffle([d.dx].concat(d.wrong)),cb:o.cb||''};
  $('med').className='sheet med on';$('mdT').textContent=pp?'為'+(pp.id===S.pc?'自己':pp.n)+'診治':'坐堂看診';Med.draw();};
 Med.revealed=function(){return Object.keys(Med.cur.rev).length;};
 var EXAM=[['t','🌡','體溫'],['pulse','💓','脈搏'],['resp','🫁','呼吸'],['mind','👁','神志'],['look','👀','望診'],['touch','✋','觸診'],['listen','🩺','聽診']];
 Med.draw=function(){var m=Med.cur;if(!m)return;var d=m.d,me=pc();var pp=m.pid?P(m.pid):null;
  var h='<div class="pat"><div class="pav">'+(pp?ART.avatar(pp,40):'🧑‍🦱')+'</div><div><b style="font-size:16px">'+esc(pp?(pp.id===S.pc?'你自己':pp.n)+'（'+ (pp.ill.length?Ill.str(pp):d.dx.slice(0,4))+'）':d.p)+'</b><div class="note">'+esc(d.c)+'　醫術 '+me.sk.med+'</div></div></div>';
  if(m.step==='done'){var r=m.res;h+='<div class="mres"><div class="stamp">'+r.stamp+'</div><div class="note">診斷 '+(m.dxOk?'✔ ':'✘ 應為「'+esc(d.dx)+'」 ')+'｜處置 '+Math.round(r.q*100)+'%｜理想次序：'+d.seq.map(function(t){return TECHS[t].n;}).join('→')+'</div><div class="note" style="margin-top:6px">'+esc(r.msg)+'</div></div><div class="opts"><button class="cbtn" id="mdDone">收起刀圭</button></div>';}
  else{h+='<h4>生命徵象與檢查 <small class="note">（至少三項）</small></h4><div class="vgrid">'+EXAM.map(function(e){var k=e[0];var got=m.rev[k];var v=got?(d.vit[k]||d.ex[k]):'';return '<button class="vbtn'+(got?' done':'')+'" data-ex="'+k+'"><i>'+e[1]+'</i><b>'+e[2]+'</b>'+(got?'<span>'+esc(v)+'</span>':'')+'</button>';}).join('')+'</div>';
   if(m.step==='exam'&&Med.revealed()>=3)h+='<h4>診斷</h4><div class="opts">'+m.dxOpts.map(function(x){return '<button class="cbtn" data-dx="'+esc(x)+'">'+esc(x)+'</button>';}).join('')+'</div>';
   if(m.step==='proc'){h+='<h4>處置次序 <small class="note">依序點選，耗用藥材</small></h4><div class="sym">'+(m.seq.length?m.seq.map(function(t,i){return '<span>'+(i+1)+'. '+TECHS[t].n+'</span>';}).join(''):'<span class="note" style="border:0;background:none">尚未處置</span>')+'</div>';
    h+='<div class="tgrid">'+Med.techs().map(function(t){var ok=Med.techOk(t);var T=TECHS[t];var need=T.need?Object.keys(T.need).map(function(k){return ITEMS[k].n+(S.inv[k]||0);}).join(''):'';return '<button class="tbtn'+(ok.ok?'':' lock')+(t==='incant'||t==='bleed'||t==='herbs'?' old':'')+'" data-tc="'+t+'"'+(ok.ok?'':' disabled')+'><b>'+T.n+'</b><small>'+(ok.ok?(need||T.d.slice(0,8)):ok.why)+'</small></button>';}).join('')+'</div>';
    h+='<div class="opts" style="flex-direction:row"><button class="btn" id="mdUndo">撤回一步</button><button class="cbtn" id="mdFin" style="flex:1">完成處置</button></div>';}}
  $('mdB').innerHTML=h;};
 Med.exam=function(k){var m=Med.cur;if(!m||m.rev[k])return;if(k==='listen'&&!Inv.has('steth')){m.rev[k]=1;m.d=JSON.parse(JSON.stringify(m.d));m.d.ex.listen=pc().sk.med>=50?'（貼耳細聽）'+m.d.ex.listen:'沒有聽診筒，聽不真切';}else m.rev[k]=1;Med.draw();};
 Med.dx=function(x){var m=Med.cur;m.dxOk=x===m.d.dx;m.step='proc';if(!m.dxOk&&pc().sk.med>=55&&rand()<0.5)toast('（直覺告訴你，似乎哪裡不對……）');Med.draw();};
 Med.tc=function(t){var m=Med.cur;if(!m||m.step!=='proc')return;var ok=Med.techOk(t);if(!ok.ok)return;
  if(t==='amput'){UI.dialog('截肢抉擇','病人的家人撲上來哭喊：「求求你，留他全屍！」<br>截去肢體能保住性命，但他從此殘廢；不截，壞疽上延便是死路。',[{t:'截！保命要緊',f:function(){Med.push(t);}},{t:'再想想',f:function(){}}]);return;}
  Med.push(t);};
 Med.push=function(t){var m=Med.cur;var T=TECHS[t];if(T.need)for(var k in T.need)Inv.add(k,-T.need[k]);m.seq.push(t);Med.draw();};
 Med.undo=function(){var m=Med.cur;var t=m.seq.pop();if(t){var T=TECHS[t];if(T.need)for(var k in T.need)Inv.add(k,T.need[k]);}Med.draw();};
 function lcs(a,b){var dp=[];for(var i=0;i<=a.length;i++){dp[i]=[];for(var j=0;j<=b.length;j++)dp[i][j]=i&&j?(a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1])):0;}return dp[a.length][b.length];}
 Med.score=function(d,seq,dxOk){var q=lcs(seq,d.seq)/d.seq.length;var badN=seq.filter(function(t){return d.bad.indexOf(t)>=0;}).length;q-=badN*0.3;if(!dxOk)q-=0.15;var extra=seq.length-lcs(seq,d.seq);q-=Math.max(0,extra-1)*0.05;
  var aseptic=seq.indexOf('wash')>=0||seq.indexOf('alco')>=0;if(['cut','arrow','append','gangrene','abscess'].indexOf(d.k)>=0&&!aseptic)q-=0.2;if(d.amp&&seq.indexOf('amput')<0)q=Math.min(q,0.35);return clamp(q,0,1);};
 Med.finish=function(){var m=Med.cur;if(!m)return;var d=m.d,me=pc();var q=Med.score(d,m.seq,m.dxOk);var luck=rand()*0.25+me.sk.med/400;var v=q+luck-0.15*(d.lv-1);
  var out=v>=0.75?'cure':(v>=0.5?'better':(v>=0.25?'worse':'dead'));if(d.lv<3&&out==='dead')out='worse';if(d.risky&&out!=='cure'&&rand()<0.4)out='dead';
  var r={q:q,out:out};r.stamp={cure:q>=0.95?'妙手回春':'藥到病除',better:'漸有起色',worse:'病勢未減',dead:'回天乏術'}[out];Med.apply(m,r);m.res=r;m.step='done';Eng.pass(1);Med.draw();};
 Med.apply=function(m,r){var d=m.d,me=pc();var pp=m.pid?P(m.pid):null;var pub=m.src==='clinic'||m.src==='market'||m.src==='call'||m.src==='army';S.stats.pat++;var msg='';
  if(r.out==='cure'||r.out==='better'){S.stats.cure++;me.sk.med=clamp(me.sk.med+(d.lv>=3?2:1)+(r.q>=0.95?1:0),0,100);if(pp){pp.ill.forEach(function(x){if((ILLS[x.k]||{}).case===d.k||m.ci===Med.illCase(pp))Ill.cure(pp,x.k,r.out==='cure'?5:2);});if(pp.id!==S.pc)People.rel(pp.id,{aff:6,trust:6},pc().n+'治好了我的'+d.dx);}
   var fee=r.out==='cure'?m.fee:Math.round(m.fee/2);if(m.src==='clinic'||m.src==='call'||m.src==='army'){fee=Math.round(fee*(1+(S.fam.clinic.lv||0)*0.2));Inv.gold(fee);}if(pub)S.fam.fame=clamp(S.fam.fame+d.lv,0,999);msg=(pp&&pp.id!==S.pc?pp.n:'病人')+'的病'+(r.out==='cure'?'好了':'有了起色')+(fee&&pub?'，收診金'+fee+'兩':'')+'。';}
  else if(r.out==='worse'){if(pp){pp.ill.forEach(function(x){x.tr=1;});}msg='處置不得法，病人沒有好轉。'+(pub?'旁人竊竊私語。':'');if(pub)S.fam.fame=Math.max(0,S.fam.fame-1);}
  else{S.stats.dead++;msg='你盡力了。病人還是在你手中斷了氣。';if(pp&&pp.id!==S.pc)People.die(pp.id,d.dx);if(pub){S.fam.fame=Math.max(0,S.fam.fame-3);S.fam.notor=(S.fam.notor||0)+3;}me.mood=clamp(me.mood-15,0,100);}
  var shock=m.seq.filter(function(t){return ['suture','drain','amput','debr','deliver'].indexOf(t)>=0;}).length;if(pub&&shock){S.fam.notor=(S.fam.notor||0)+(m.seq.indexOf('amput')>=0?4:1);S.flags.westSeen=(S.flags.westSeen||0)+1;}
  if(m.seq.indexOf('incant')>=0||m.seq.indexOf('bleed')>=0)msg+='（古法無益，反傷元氣。）';
  addLog('〔行醫〕'+d.dx+'：'+r.stamp+(pp?'（'+pp.n+'）':''),'醫');r.msg=msg;Med.react(m,r);if(m.src==='clinic')S.fam.clinic.days++;};
 /* 世人反應：傳統醫者嫉妒、方士指為妖術、朝廷召見 */
 Med.react=function(m,r){var no=S.fam.notor||0,fa=S.fam.fame;if(S.region!=='xianyang'&&S.region!=='frontier')return;
  if(fa>=12&&!S.evseen.tradocEnvy&&rand()<0.5)S.queue.push({go:'evTradoc'});
  else if(no>=6&&!S.evseen.fangshi&&rand()<0.5)S.queue.push({go:'evFangshi'});
  else if(fa>=30&&S.region==='xianyang'&&!S.flags.palace&&rand()<0.5)S.queue.push({go:'evCourt'});
  else if(r.out==='dead'&&no>=8&&rand()<0.4)S.queue.push({go:'evAccuse'});};
 Med.close=function(){var m=Med.cur;$('med').className='sheet med';Med.cur=null;if(!m)return;UI.hud();if(m.step!=='done'){m.seq.slice().reverse().forEach(function(t){var T=TECHS[t];if(T.need)for(var k in T.need)Inv.add(k,T.need[k]);});UI.go('place');return;}UI.go('medDone',{out:m.res.out,src:m.src,pid:m.pid,dx:m.d.dx,cb:m.cb});};
 /* 自動看診（歲月流轉／醫館學徒）：回傳結果 */
 Med.auto=function(ci,sk,useInv){var d=CASES[ci];var ok=d.seq.every(function(t){var c=useInv?Med.techOk(t):{ok:!!S.fam.tech[t]};return c.ok;});var p=(sk/100)*0.8+(ok?0.25:-0.2)-0.12*(d.lv-1);var good=rand()<p;if(useInv&&ok)d.seq.forEach(function(t){var T=TECHS[t];if(T.need)for(var k in T.need)Inv.add(k,-T.need[k]);});return {ok:good,fee:good?d.fee:0,d:d};};
 Med.bind=function(){$('mdB').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var a;
  if((a=b.getAttribute('data-ex'))!==null)Med.exam(a);else if((a=b.getAttribute('data-dx'))!==null)Med.dx(a);else if((a=b.getAttribute('data-tc'))!==null)Med.tc(a);else if(b.id==='mdUndo')Med.undo();else if(b.id==='mdFin')Med.finish();else if(b.id==='mdDone')Med.close();});};
})();
/* ===== 製藥 ===== */
var Craft={
 can:function(r){var me=pc();if(r.tool&&!Inv.has(r.tool))return '缺'+ITEMS[r.tool].n;for(var k in r.need)if(!Inv.has(k,r.need[k]))return '缺'+ITEMS[k].n+'×'+r.need[k];if(me.sk.med<r.sk*8&&me.sk.craft<r.sk*8)return '醫術或手藝不足';return '';},
 make:function(i){var r=RECIPES[i];var e=Craft.can(r);if(e)return {ok:false,msg:e};var me=pc();for(var k in r.need)Inv.add(k,-r.need[k]);Eng.pass(1);var fail=rand()<Math.max(0.05,0.3-(me.sk.med+me.sk.craft)/300);if(fail)return {ok:false,msg:'火候失了準頭，'+r.n+'沒有成。'};Inv.add(r.id,r.out);me.sk.craft=clamp(me.sk.craft+(rand()<0.4?1:0),0,100);if(r.id==='alcohol'&&!S.flags.distill){S.flags.distill=1;addLog('〔製藥〕第一次蒸餾出酒精','醫');}return {ok:true,msg:'製成'+r.n+'×'+r.out+'。'};}
};
/* ===== 採集與辨識 ===== */
var Forage={
 roll:function(){var me=pc();var n=2+rnd(2);var pool=FORAGE.filter(function(f){return !f.always;});var se=Eng.season();if(se===3)pool=pool.filter(function(f){return f.k!=='fruit'&&f.k!=='fruitP';});var out=[];
  for(var i=0;i<n;i++){var f=pick(pool);var id=Forage.ident(f);out.push({k:f.k,n:f.n,t:f.t,safe:f.safe,real:f.real||'',sure:id});}var a=pick(FORAGE.filter(function(f){return f.always;}));out.push({k:a.k,n:a.n,t:a.t,safe:1,sure:1});return out;},
 ident:function(f){var me=pc();var s=me.sk.med*0.6+me.sk.farm*0.8+me.at.wit*1.2+(Inv.has('notes')?20:0);return rand()*100<s;},
 take:function(it){Inv.add(it.k,1);}
};
