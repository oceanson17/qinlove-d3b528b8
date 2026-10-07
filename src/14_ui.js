/* ===== 介面：場景播放、HUD（生存指標）、地圖、對話框、結局卡 ===== */
var UI={tok:0,sc:null,li:0,typing:false,auto:false,skip:false,timer:null,autoT:null};
function $(id){return document.getElementById(id);}
function toast(t,ms){var e=$('toast');if(!e)return;e.textContent=t;e.className='on';clearTimeout(toast._t);toast._t=setTimeout(function(){e.className='';},ms||2200);}
(function(){
 window.VV={timers:[],vp:function(){return window.visualViewport||null;},
  h:function(){var v=VV.vp();var h=Math.round(v?v.height:window.innerHeight);return h>100?h:(window.innerHeight||600);},
  top:function(){var v=VV.vp();return v?Math.max(0,Math.round(v.offsetTop)):0;},
  kb:function(){var v=VV.vp();return !!(v&&(window.innerHeight-v.height)>120);},
  coarse:function(){try{var t=(navigator.maxTouchPoints||0)>0;var c=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;return !!(c||(t&&('ontouchstart' in window)));}catch(e){return false;}},
  apply:function(){var h=VV.h(),t=VV.top();var rs=document.documentElement.style;rs.setProperty('--vvh',h+'px');rs.setProperty('--vvt',t+'px');
   var app=$('app');var ih=Math.round(window.innerHeight)||h;if(app){app.style.height=ih+'px';}rs.setProperty('--vh',(ih/100)+'px');
   if(!VV.kb()||t===0){if(window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop){try{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;}catch(e){}}}
   UI.measure();},
  kick:function(){VV.apply();while(VV.timers.length)clearTimeout(VV.timers.pop());[50,150,350,600].forEach(function(ms){VV.timers.push(setTimeout(VV.apply,ms));});},
  init:function(){if(VV.inited)return;VV.inited=1;var v=VV.vp();if(v){v.addEventListener('resize',VV.kick);v.addEventListener('scroll',VV.kick);}
   window.addEventListener('resize',VV.kick);window.addEventListener('orientationchange',function(){VV.kick();setTimeout(VV.kick,300);});
   window.addEventListener('scroll',function(){if(!VV.kb())VV.kick();},{passive:true});window.addEventListener('pageshow',VV.kick);
   document.addEventListener('focusin',VV.kick,true);document.addEventListener('focusout',VV.kick,true);document.addEventListener('visibilitychange',VV.kick);VV.kick();}};
 UI.measure=function(){var b=$('box');if(b&&b.offsetHeight)document.documentElement.style.setProperty('--boxh',b.offsetHeight+'px');};
 UI.screen=function(n){['title','game','map'].forEach(function(s){$(s).className='scr'+(s===n?' on':'');});var t=$('tabs');if(t)t.style.display=(n==='title')?'none':'flex';
  UI.cur=n;if(n==='title'){UI.titleInit();}UI.measure();};
 /* ---------- 調度 ---------- */
 UI.go=function(go,a){a=a||{};if(Kb.open)Kb.close(false);
  if(go==='title'){UI.stop();UI.screen('title');return;}
  if(S&&(go==='place'||go==='map')&&S.queue.length){var q=S.queue.shift();go=q.go;a=q.a||{};}
  if(S&&go==='place'&&S.flags.babyStart&&ageOf(pc())<14&&!S.queue.length)go='childYear';
  var fn=NODES[go];if(!fn){console.warn('no node',go);go='place';fn=NODES.place;}
  var sc;try{sc=fn(a);}catch(e){console.error('node '+go,e);toast('劇情出錯：'+e.message);UI.err=(UI.err||0)+1;try{sc=NODES.place();}catch(e2){UI.screen('title');return;}}
  UI.present(sc);};
 UI.present=function(sc){if(!sc){UI.go('place');return;}
  var tok=++UI.tok;
  if(sc.screen){if(sc.screen==='map'){UI.showMap();return;}if(sc.screen==='med'){UI.screen('game');UI.hud();return;}if(sc.screen==='shop'){Panels.shop(sc.a||{});return;}if(sc.screen==='craft'){Panels.bag('craft');return;}if(sc.screen==='title'){S=null;UI.stop();UI.screen('title');return;}if(sc.screen==='album'){Panels.album();return;}}
  if(sc.endGen){UI.endGen(sc.endGen);return;}
  if(sc.dialogName){UI.nameKid(sc.dialogName.id);return;}
  if(sc.go){UI.go(sc.go,sc.a);return;}
  if(sc.async){UI.busy(true);var req=sc.async,fb=sc.fb;
   AI.run(req).then(function(s2){if(tok!==UI.tok)return;UI.busy(false);S.pend=null;UI.present(s2);},function(e){if(tok!==UI.tok)return;UI.busy(false);AI.fail(e);var s3;
    if(Thread.paused()&&e&&e.kind!=='cancel'){s3=fb();s3.ch=[ch('🔁 重試接續','thRetry'),ch('🗑 放下這件事','thDrop')].concat(s3.ch||[]);}else{s3=fb();S.pend=null;}UI.present(s3);});
   return;}
  UI.screen('game');UI.sc=sc;UI.li=0;if(sc.bg)UI.setBg((PLACES[sc.bg]||{}).bg||sc.bg);UI.hud();$('choices').innerHTML='';
  if(!sc.hub){FullLog.add(sc);Recall.ingest(sc);}
  var f0=sc.focus&&P(sc.focus);if(f0&&ART.hasChar(f0))UI.setChar(f0.portrait);else UI.setChar('');
  if(!sc.lines.length){UI.endLines();return;}UI.showLine(0);};
 UI.setBg=function(k){if(k==='courtyard')k='night';if(UI.bgk===k)return;UI.bgk=k;var b=$('bg');b.classList.add('fade');setTimeout(function(){b.innerHTML=ART.html('bg',k);b.classList.remove('fade');},120);};
 UI.setChar=function(id,ex){var c=$('char'),w=$('cw');if(!id){c.className='hide';UI.cid='';return;}var k=id+'|'+(ex||'normal');if(UI.ck===k&&c.className.indexOf('hide')<0){c.className='';return;}
  var isNew=UI.cid!==id;UI.cid=id;UI.ck=k;w.innerHTML=ART.html('char',id,ex);c.className='';w.className='cw'+(isNew?' in':' bob');};
 UI.showLine=function(i,noCh){var sc=UI.sc;clearTimeout(UI.autoT);if(!sc)return;if(i>=sc.lines.length){UI.endLines(noCh);return;}
  UI.li=i;var l=sc.lines[i];var np=$('nameplate');var sp=l.sp;var me=pc();var who=sp==='p'?me:(sp?P(sp):null);
  if(who){np.className='on'+(sp==='p'?' pc':'');$('npName').textContent=sp==='p'?me.n:(who.met?who.n:People.label(sp));}else np.className='';
  if(who&&sp!=='p'&&ART.hasChar(who))UI.setChar(who.portrait);
  $('char').classList.toggle('dim',sp==='p');var fc=$('face');if(who&&(sp==='p'||!ART.hasChar(who))){fc.innerHTML=ART.avatar(who);fc.className='on';}else fc.className='';
  S.back.push({sp:sp==='p'?'p':(sp||''),t:l.t});if(S.back.length>120)S.back.shift();
  UI.type(l.t,!sp);$('box').className='';};
 UI.type=function(t,nar){var el=$('txt');clearInterval(UI.timer);el.className=nar?'nar':'';
  if(!SET.typer||UI.skip){el.textContent=t;UI.typing=false;UI.lineDone();return;}
  var i=0,iv={1:42,2:26,3:12}[SET.speed]||26;UI.typing=true;el.textContent='';UI.full=t;
  UI.timer=setInterval(function(){i+=SET.speed>=3?2:1;el.textContent=t.slice(0,i);if(i>=t.length){clearInterval(UI.timer);UI.typing=false;UI.lineDone();}},iv);};
 UI.lineDone=function(){var sc=UI.sc;if(!sc)return;var last=UI.li>=sc.lines.length-1;if(last){UI.endLines();return;}$('box').className='wait';
  if(UI.skip){UI.autoT=setTimeout(function(){UI.showLine(UI.li+1);},60);}else if(UI.auto){UI.autoT=setTimeout(function(){UI.showLine(UI.li+1);},SET.auto*1000+String(sc.lines[UI.li].t).length*35);}};
 UI.endLines=function(noCh){$('box').className='';if(UI.skip){UI.skip=false;$('qSkip').classList.remove('on');}if(!noCh)UI.choices(UI.sc.ch||[]);UI.measure();};
 UI.adv=function(){if(!UI.sc||$('kbp').className==='on')return;if(UI.typing){clearInterval(UI.timer);$('txt').textContent=UI.full;UI.typing=false;UI.lineDone();return;}if(UI.li<UI.sc.lines.length-1)UI.showLine(UI.li+1);};
 UI.stop=function(){clearInterval(UI.timer);clearTimeout(UI.autoT);UI.auto=false;UI.skip=false;try{$('qAuto').classList.remove('on');$('qSkip').classList.remove('on');}catch(e){}};
 UI.choices=function(list){var box=$('choices');box.innerHTML='';box.className=list.length>6?'many':'';
  list.forEach(function(c,i){var b=document.createElement('button');var sys=c.sys||/^(🗺|↩|⏳|⏩|💤|🍚)/.test(c.t)||/^(繼續|告辭)$/.test(c.t);b.className='cbtn'+(c.ai?' ai':'')+(sys?' sys':'')+(/^💬/.test(c.t)?' talk':'');b.textContent=c.t;b.style.animationDelay=(i*0.03)+'s';
   b.addEventListener('click',function(ev){ev.stopPropagation();UI.pick(c);});box.appendChild(b);});box.scrollTop=0;};
 UI.pick=function(c){if(UI.busyOn)return;$('choices').innerHTML='';if(c.ai&&c.t){S.back.push({sp:'p',t:c.t.replace(/^✦ /,'')});}UI.go(c.go,c.a);};
 /* ---------- HUD ---------- */
 var MET=[['food','飽'],['sta','體'],['hp','健'],['mood','心']];
 UI.hud=function(){if(!S)return;var me=pc();$('hDay').textContent=SEASONS[Eng.season()];$('hPer').textContent=PER_S[S.per];$('hCh').textContent=Eng.dateStr(true);
  $('hPlace').textContent=(PLACES[S.place]||{n:''}).n+'　'+Weather.str();$('hFame').textContent=S.fam.fame;$('hGold').textContent=S.gold;
  var m=$('meters');if(m){m.innerHTML=MET.map(function(x){var v=Math.round(me[x[0]]);return '<span class="mt'+(v<25?' low':'')+'"><em>'+x[1]+'</em><i><b style="width:'+clamp(v,0,100)+'%"></b></i></span>';}).join('')+'<span class="mt tmp'+(me.temp<35.8||me.temp>38?' low':'')+'"><em>溫</em>'+me.temp.toFixed(1)+'°</span>';}UI.badge();};
 UI.badge=function(){var n=S?Letters.unread():0;var b=$('letBadge');if(b){b.textContent=n;b.className=n?'on':'';}};
 var KN={aff:['好感','a','♥'],trust:['信任','t','信'],love:['情意','h','♥']};
 UI.pop=function(id,k,d){if(!d||!KN[k]||Eng.skipping)return;var e=document.createElement('div');e.className='pop'+(d<0?' neg':'');e.innerHTML='<span class="ic '+KN[k][1]+'">'+KN[k][2]+'</span>'+esc(cn(id))+' '+KN[k][0]+' <b>'+(d>0?'+':'')+d+'</b>';UI.addPop(e);};
 var PN={med:'醫術',farm:'農事',craft:'手藝',trade:'經商',mart:'武藝',lit:'文墨',fame:'名聲',gold:'銀兩',food:'飽食',sta:'體力',hp:'健康',mood:'心情'};
 UI.popP=function(k,d){if(!PN[k]||!d||Eng.skipping)return;var e=document.createElement('div');e.className='pop'+(d<0?' neg':'');e.innerHTML='<span class="ic p">'+PN[k][0]+'</span>'+PN[k]+' <b>'+(d>0?'+':'')+d+'</b>';UI.addPop(e);UI.hud();};
 UI.addPop=function(e){var p=$('pops');if(!p)return;p.appendChild(e);while(p.children.length>4)p.removeChild(p.firstChild);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},2700);};
 UI.banner=function(a,b){var e=$('banner');$('bn1').textContent=a;$('bn2').textContent=b||'';e.className='';void e.offsetWidth;e.className='on';setTimeout(function(){e.className='';},2900);};
 UI.busy=function(on,t){UI.busyOn=on;$('busy').className=on?'on':'';$('busyT').textContent=t||'墨跡暈開中…';};
 /* ---------- 地圖 ---------- */
 var mapSel='';
 UI.mapSvg=function(r){var river=r==='frontier'?'<path d="M300 -10 C 260 120, 340 220, 300 330 S 260 480, 320 570" stroke="#9fb6be" stroke-width="18" fill="none" opacity=".55"/>':'<path d="M-10 330 C 80 300, 140 360, 220 330 S 360 300, 410 320" stroke="#9fb6be" stroke-width="16" fill="none" opacity=".6"/><text x="300" y="300" font-size="13" fill="#6a8890" font-family="serif" letter-spacing="4">渭水</text><rect x="120" y="70" width="190" height="200" fill="none" stroke="#8a6a4a" stroke-width="2" stroke-dasharray="7 4" opacity=".55"/>';
  return '<svg viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e6d0"/><stop offset="1" stop-color="#e8d6ba"/></linearGradient></defs><rect width="400" height="560" fill="url(#mpg)"/><g fill="none" stroke="#8a7a6a" stroke-width="1.2" opacity=".55"><path d="M10 120 l30 -40 l25 30 l30 -50 l35 60"/><path d="M250 90 l30 -45 l28 34 l26 -40 l40 56"/></g>'+river+'<g opacity=".35" fill="#5a7a5a"><circle cx="60" cy="230" r="10"/><circle cx="75" cy="215" r="8"/><circle cx="340" cy="450" r="9"/></g><g transform="translate(350 510)" font-family="serif"><circle r="22" fill="none" stroke="#8a6a4a" stroke-width="1"/><path d="M0 -20 L 5 0 L 0 20 L -5 0 Z" fill="#b8323a" opacity=".7"/><text y="-26" font-size="10" text-anchor="middle" fill="#8a6a4a">北</text></g></svg>';};
 UI.locked=function(pl){var P0=PLACES[pl];if(P0.need==='palace'&&!S.flags.palace&&!pc().office)return '需官職或召見';if(P0.night&&S.per<4)return '入夜後開放';return '';};
 UI.showMap=function(){if(!S)return;UI.stop();UI.screen('map');$('choices').innerHTML='';$('mDate').textContent=Eng.dateStr(true);$('mPer').textContent=PER_S[S.per];$('mTitle').textContent=REGIONS[S.region].title;
  if(UI.mapR!==S.region){$('mapsvg').innerHTML=UI.mapSvg(S.region);UI.mapR=S.region;}if(PLACES[mapSel]&&PLACES[mapSel].r!==S.region)mapSel='';
  var h='';REGION_PLACES[S.region].forEach(function(pl){var P0=PLACES[pl];var lk=UI.locked(pl);var who=People.present(pl).filter(function(id){return P(id).met;});
   var faces=who.slice(0,3).map(function(id){return '<span class="face">'+ART.avatar(P(id))+'</span>';}).join('');
   h+='<button class="pin'+(lk?' lock':'')+(pl===S.place?' cur':'')+(pl===mapSel?' sel':'')+'" data-pl="'+pl+'" style="left:'+P0.x+'%;top:'+P0.y+'%"><span class="ps">'+(lk?'鎖':P0.s)+'</span><span class="pn">'+(pl==='lodge'&&S.fam.house>=3?'自家宅院':P0.n)+'</span>'+(faces?'<span class="faces">'+faces+'</span>':'')+'</button>';});
  $('pins').innerHTML=h;UI.mapInfo(mapSel||S.place);UI.badge();};
 UI.mapInfo=function(pl){mapSel=pl;var P0=PLACES[pl];if(!P0)return;var lk=UI.locked(pl);var who=People.present(pl);
  var w=who.length?'👤 '+who.slice(0,6).map(People.label).join('、'):'此刻無人';
  $('mapinfo').innerHTML='<h3>'+P0.n+'</h3><p>'+P0.d+'</p><div class="who">'+(lk?'🔒 '+lk:w)+'</div><div class="row">'+(lk?'':'<button class="go" data-go="'+pl+'">'+(pl===S.place?'停留':'前往（一個時辰）')+'</button>')+'<button class="go alt" data-travel="1">🐎 遠行</button></div>';
  Array.prototype.forEach.call(document.querySelectorAll('.pin'),function(b){b.classList.toggle('sel',b.getAttribute('data-pl')===pl);});};
 /* ---------- 對話框 ---------- */
 UI.dialog=function(t,body,btns){$('dlT').textContent=t;$('dlB').innerHTML=body;var a=$('dlA');a.innerHTML='';(btns||[['確定','pri']]).forEach(function(b){var e=document.createElement('button');
  var lab=b.t||b[0];var f=b.f||(typeof b[1]==='function'?b[1]:b[2]);e.className='btn'+(b[1]==='pri'||b.pri?' pri':'');e.textContent=lab;e.onclick=function(){$('dlg').className='dlg';if(f)f();};a.appendChild(e);});$('dlg').className='dlg on';};
 UI.manualDialog=function(prompt,ok,cancel){UI.dialog('手動 AI（複製→貼上）','<p class="note">① 複製下方提示詞，貼到 Grok／ChatGPT 等 App；② 把它回覆的 JSON 貼回下面。</p><label class="field">提示詞<textarea id="mpP" rows="5" readonly>'+esc(prompt)+'</textarea></label><button class="btn" id="mpCopy">複製提示詞</button><label class="field">AI 回覆<textarea id="mpA" rows="5"></textarea></label>',
  [['改用離線',function(){cancel();}],['送出','pri',function(){ok($('mpA').value);}]]);
  setTimeout(function(){var c=$('mpCopy');if(c)c.onclick=function(){try{navigator.clipboard.writeText(prompt);toast('已複製');}catch(e){$('mpP').select();document.execCommand('copy');}};},0);};
 UI.nameKid=function(id){var p=P(id);UI.dialog('為孩子取名','<label class="field">名（姓「'+esc(S.fam.sur)+'」）<input id="kidIn" maxlength="3" value="'+esc(p.gn)+'" autocomplete="off"></label>',[['就叫原名',function(){UI.go('place');}],['取這個名','pri',function(){var v=($('kidIn').value||'').replace(/\s/g,'').slice(0,3);if(v){p.gn=v;p.n=S.fam.sur+v;}UI.go('place');}]]);};
 /* ---------- 結局 ---------- */
 UI.endGen=function(o){UI.busy(true,'正在書寫這一生的結局…');End.make(o.kind,o.ctx).then(function(e){UI.busy(false);UI.endCard(e,function(){UI.go('endAfter',{final:o.final});});},function(err){UI.busy(false);toast('結局生成失敗：'+(err&&err.message||''));UI.go('endAfter',{final:o.final});});};
 UI.endHtml=function(e){var mono=e.mono?'<div class="emono"><span class="eav">'+ART.avatar(P(e.mono.who)||{id:'x',n:'？',g:'m',look:{},kind:'npc',alive:1})+'</span><div><b>'+esc(P(e.mono.who)?cn(e.mono.who):'')+'</b><p>'+esc(e.mono.text)+'</p></div></div>':'';
  return '<div class="ecard t'+esc({HE:'he',BE:'be',NE:'ne','隱藏':'hid'}[e.type]||'ne')+'"><div class="etype">'+esc(e.type)+'</div><h3>'+esc(e.title)+'</h3><div class="emeta">'+esc((e.fam||'')+'・第'+(e.gen||1)+'代・'+(e.name||'')+'・'+(e.era||'')+'・'+(e.kn||''))+(e.source==='ai'?'・AI 書寫':'・離線組合')+'</div><p class="etext">'+esc(e.text)+'</p>'+(e.epi?'<h4>後日談</h4><p class="eepi">'+esc(e.epi)+'</p>':'')+mono+(e.fixed&&End.FIXED[e.fixed]?'<div class="efix">✿ 解鎖固定結局「'+esc(End.FIXED[e.fixed].t)+'」</div>':'')+'</div>';};
 UI.endCard=function(e,cb){UI.dialog('結局',UI.endHtml(e),[['收入結局冊','pri',cb]]);$('dlg').classList.add('wide');};
 /* ---------- 標題 ---------- */
 UI.titleInit=function(){if(!$('tbg').innerHTML)$('tbg').innerHTML=ART.html('bg','title');if(!UI.pre&&typeof ASSET_FILES!=='undefined'){UI.pre=[];setTimeout(function(){ASSET_FILES.forEach(function(f){var im=new Image();im.src='assets/'+f;UI.pre.push(im);});},1200);}var pe=document.querySelector('.tpetals');if(pe&&!pe.innerHTML){var h='';for(var i=0;i<14;i++)h+='<i style="left:'+(i*7.3%100)+'%;animation-duration:'+(7+i%5*1.7)+'s;animation-delay:'+(-i*1.1)+'s"></i>';pe.innerHTML=h;}
  var has=['auto',1,2,3].some(function(s){return slotInfo(s);});$('tCont').classList.toggle('dis',!has);};
 UI.begin=function(first){Meta.get();UI.stop();UI.bgk='';Sh.close();saveSlot('auto',true);UI.go(first||'intro');};
 UI.loadGame=function(slot){if(!loadSlot(slot)){toast('讀檔失敗');return;}Sh.close();UI.bgk='';UI.stop();toast('📂 已讀取（'+slotName(slot)+'）');if(Thread.paused())UI.present(Thread.pausedScene());else UI.go('place');};
 /* ---------- 輸入 ---------- */
 var MODES=[['say','💬說'],['cmd','⚙指令'],['decl','📜設定']];
 UI.modeSync=function(){var m=SET.inmode||'say';var lab=MODES.filter(function(x){return x[0]===m;})[0]||MODES[0];var b=$('mode');if(!b)return;b.textContent=lab[1];b.className='mchip '+m;$('kbmode').textContent=lab[1];
  var ph={say:'對眼前的人說…',cmd:'做什麼？例：挖野菜／替他包紮／縣令命人放了我',decl:'宣告劇情：例：那人便是嬴政／下起大雪'}[m];$('kbta').placeholder=ph;$('free').placeholder=ph;};
 UI.submitFree=function(){var f=$('free');var v=f.value;f.value='';if(!v.trim()||!S||UI.busyOn)return;$('choices').innerHTML='';var r=Input.submit(v);if(!r)return;if(r.go&&!r.lines){UI.go(r.go,r.a);return;}UI.present(r);};
 UI.bind=function(){var tabs=$('tabs');$('app').appendChild(tabs);
  $('tNew').onclick=function(){Panels.setup();};
  $('tCont').onclick=function(){if(this.classList.contains('dis'))return;Sh.open('續寫浮生',[],function(){return MenuUI.slots('load');});};
  $('tAlbum').onclick=function(){Panels.album();};$('tSet').onclick=function(){Sh.open('設定',[],MenuUI.settings);};
  $('box').addEventListener('click',function(e){if(e.target.closest('#inrow')||e.target.closest('#quick'))return;UI.adv();});
  $('char').style.pointerEvents='none';
  $('game').addEventListener('click',function(e){if(e.target===$('game')||e.target.closest('#bg')||e.target.id==='fx')UI.adv();});
  $('quick').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var q=b.getAttribute('data-q');
   if(q==='log')MenuUI.open('log');else if(q==='save')MenuUI.open('save');
   else if(q==='auto'){UI.auto=!UI.auto;b.classList.toggle('on',UI.auto);if(UI.auto&&!UI.typing)UI.lineDone();}
   else if(q==='skip'){UI.skip=true;b.classList.add('on');if(UI.typing){clearInterval(UI.timer);$('txt').textContent=UI.full;UI.typing=false;}UI.lineDone();}});
  $('mode').onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();var i=MODES.map(function(x){return x[0];}).indexOf(SET.inmode||'say');SET.inmode=MODES[(i+1)%3][0];saveSettings();UI.modeSync();toast({say:'💬 說：對眼前的人說話',cmd:'⚙ 指令：描述動作，或「某人命人…」導演命令',decl:'📜 設定：宣告劇情事實，必定成真'}[SET.inmode],2600);};
  $('send').onclick=function(e){e.stopPropagation();if(Kb.on()&&!$('free').value){Kb.show();return;}UI.submitFree();};
  $('free').addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229)return;if(e.key==='Enter'){e.preventDefault();UI.submitFree();}});
  tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!S||UI.busyOn)return;var t=b.getAttribute('data-t');
   if(t==='map')UI.go('map');else if(t==='bag')Panels.bag();else if(t==='fam')Panels.fam();else if(t==='ppl')Panels.ppl();else MenuUI.open();});
  $('hSeal').onclick=function(){if(S)Panels.bag('st');};
  $('pins').addEventListener('click',function(e){var b=e.target.closest('.pin');if(!b)return;var pl=b.getAttribute('data-pl');if(mapSel===pl&&!UI.locked(pl)){UI.go('go',{pl:pl});return;}UI.mapInfo(pl);});
  $('mapinfo').addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(b){UI.go('go',{pl:b.getAttribute('data-go')});return;}if(e.target.closest('[data-travel]'))UI.go('travel');});
  $('mWait').onclick=function(){Eng.pass(1);UI.showMap();UI.hud();if(S.queue.length)UI.go('place');};
  $('mBack').onclick=function(){UI.go('place');};
  Panels.bind();UI.modeSync();};
})();
function applyLook(){document.documentElement.style.setProperty('--fs',(SET.font||17)+'px');UI.modeSync&&UI.modeSync();VV.apply();}
/* ===== 全屏輸入面板（Kb，沿用《秦風》M19） ===== */
var Kb={open:false};
(function(){
 function el(i){return document.getElementById(i);}
 Kb.on=function(){return !!(window.VV&&VV.coarse());};
 Kb.ctx=function(){try{var t=el('txt').textContent||'';t=t.replace(/\s+/g,' ').trim();return t.length>40?'…'+t.slice(-40):t;}catch(e){return '';}};
 function count(){var ta=el('kbta'),c=el('kbcnt');if(ta&&c)c.textContent=ta.value.length+'/120';}
 Kb.show=function(cb,ctx){var p=el('kbp'),ta=el('kbta'),f=el('free');if(!p||!ta||Kb.open)return;Kb.open=true;Kb.cb=cb||null;ta.value=cb?'':(f?f.value:'');el('kbctx').textContent=ctx||Kb.ctx();count();
  document.body.classList.add('kbopen');p.className='on';p.setAttribute('aria-hidden','false');try{VV.apply();}catch(e){}try{ta.focus();var n=ta.value.length;ta.setSelectionRange(n,n);}catch(e2){}};
 Kb.ask=function(ctx,cb){if(Kb.on())Kb.show(cb,ctx);else{var v=window.prompt(ctx,'');if(v!==null)cb(v);}};
 Kb.close=function(keep){var p=el('kbp'),ta=el('kbta'),f=el('free');if(!p||!Kb.open)return;Kb.open=false;if(keep&&f&&!Kb.cb)f.value=ta.value;Kb.cb=null;
  p.className='';p.setAttribute('aria-hidden','true');document.body.classList.remove('kbopen');try{ta.blur();}catch(e){}try{window.scrollTo(0,0);}catch(e2){}try{VV.kick();}catch(e3){}
  setTimeout(function(){if(!Kb.open){try{window.scrollTo(0,0);}catch(e){}try{VV.apply();}catch(e2){}}},350);};
 Kb.send=function(){var ta=el('kbta'),f=el('free');if(!ta||!f)return;var v=ta.value;var cb=Kb.cb;if(cb){Kb.cb=null;Kb.close(false);cb(v);return;}f.value=v;Kb.close(false);if(v.replace(/\s+/g,''))UI.submitFree();};
 Kb.sync=function(){var f=el('free');if(!f)return;if(Kb.on()){f.setAttribute('readonly','readonly');f.setAttribute('inputmode','none');}else{f.removeAttribute('readonly');f.removeAttribute('inputmode');}};
 Kb.standalone=function(){try{return !!(navigator.standalone||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches));}catch(e){return false;}};
 Kb.init=function(){if(Kb.inited)return;var p=el('kbp'),ta=el('kbta'),f=el('free');if(!p||!ta||!f)return;Kb.inited=1;Kb.sync();if(Kb.standalone())document.body.classList.add('standalone');
  f.addEventListener('click',function(e){e.stopPropagation();if(Kb.on()){e.preventDefault();Kb.show();}});
  f.addEventListener('focus',function(){if(Kb.on()&&!Kb.open){try{f.blur();}catch(e){}Kb.show();}});
  el('kbsend').addEventListener('click',function(e){e.preventDefault();Kb.send();});
  el('kbmode').addEventListener('click',function(e){e.preventDefault();if(Kb.cb)return;try{$('mode').click();}catch(x){}try{el('kbta').focus();}catch(x2){}});
  el('kbcancel').addEventListener('click',function(e){e.preventDefault();Kb.close(true);});
  p.addEventListener('click',function(e){if(e.target===p)Kb.close(true);});
  ta.addEventListener('input',count);
  ta.addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229)return;if((e.key==='Enter'||e.keyCode===13)&&!e.shiftKey){e.preventDefault();Kb.send();}else if(e.key==='Escape'){Kb.close(true);}});
  p.addEventListener('touchmove',function(e){if(e.target===p||e.target.id==='kbbox')e.preventDefault();},{passive:false});
  try{var mq=window.matchMedia('(pointer:coarse)');mq.addListener&&mq.addListener(Kb.sync);}catch(e){}};
})();
/* 線程按鈕節點（M15） */
NODES.thRetry=function(){var c=S.thread&&S.thread.cur;if(!c||!c.pend)return NODES.place();var a={type:c.pend.type||'free',text:c.pend.text,tag:c.pend.tag,id:c.pend.id,topic:c.pend.topic,retry:1};return {async:a,fb:function(){return Thread.pausedScene();}};};
NODES.thOffline=function(){var c=S.thread.cur;c.status='active';c.inflight=0;var t=c.pend?c.pend.text:'';c.pend=null;var id=People.present()[0]||'';var L=['（離線接續）'+(t?'你方才'+(c.pend&&c.pend.tag==='對白'?'說：「'+t+'」':'的「'+t+'」')+'，':'')+'事情就這樣暫且告一段落。'];if(id)L.push([id,Speak.reply(id,t||'……')]);return Eng.L(L,id,S.place,Input.backCh(id));};
NODES.thDrop=function(){Thread.close();S.pend=null;return Eng.L(['你把這件事放下了。'],'',S.place,[ch('繼續','place')]);};
NODES.aiNext=function(a){var id=a.id&&P(a.id)&&People.present().indexOf(a.id)>=0?a.id:(People.present()[0]||'');if(!AI.ready())return Eng.L([ '你選擇了「'+a.text+'」。'],id,S.place,Input.backCh(id));return {async:{type:'free',text:a.text,tag:'選擇',id:id},fb:function(){return Eng.L(['你選擇了「'+a.text+'」。'],id,S.place,Input.backCh(id));}};};
