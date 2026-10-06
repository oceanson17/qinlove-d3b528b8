/* ===== 介面：VN 播放、地圖、圖鑑、書信、相冊、選單、輸入面板 ===== */
var UI={tok:0,sc:null,li:0,typing:false,auto:false,skip:false,timer:null,autoT:null};
function $(id){return document.getElementById(id);}
function toast(t,ms){var e=$('toast');if(!e)return;e.textContent=t;e.className='on';clearTimeout(toast._t);toast._t=setTimeout(function(){e.className='';},ms||2200);}
(function(){
 /* ---------- 視窗（沿用《秦風》VV） ---------- */
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
 /* ---------- 畫面切換 ---------- */
 UI.screen=function(n){['title','game','map'].forEach(function(s){$(s).className='scr'+(s===n?' on':'');});var t=$('tabs');if(t)t.style.display=(n==='title')?'none':'flex';
  UI.cur=n;if(n==='title')UI.titleInit();UI.measure();};
 /* ---------- 調度 ---------- */
 UI.go=function(go,a){a=a||{};if(Kb.open)Kb.close(false);
  if(go==='title'){UI.stop();UI.screen('title');return;}
  if(go==='hub'){var pd=Eng.pending();if(pd)return UI.go(pd.go,pd.a);UI.showMap();return;}
  if(go==='place')go='place';
  var fn=NODES[go];if(!fn){console.warn('no node',go);UI.showMap();return;}
  var sc;try{sc=fn(a);}catch(e){console.error('node '+go,e);toast('劇情出錯：'+e.message);UI.showMap();return;}
  UI.present(sc);};
 UI.present=function(sc){if(!sc){UI.showMap();return;}if(sc.wait)return;if(sc.go){UI.go(sc.go,sc.a);return;}
  var tok=++UI.tok;
  if(sc.async){UI.busy(true);var req=sc.async,fb=sc.fb,keep=sc.pendKeep;
   AI.run(req).then(function(s2){if(tok!==UI.tok)return;UI.busy(false);if(keep)S.pend=null;UI.present(s2);},function(e){if(tok!==UI.tok)return;UI.busy(false);AI.fail(e);var s3=fb();
    if(keep&&S.pend&&e&&e.kind!=='cancel'){S.pend.shown=1;s3.ch=(s3.ch||[]).concat([{t:'🔁 AI 恢復後重試接續',go:'resumeAi'}]);}else if(keep)S.pend=null;UI.present(s3);});
   return;}
  UI.screen('game');UI.sc=sc;UI.li=0;
  if(sc.bg)UI.setBg(sc.bg);UI.hud();
  $('choices').innerHTML='';
  if(sc.focus&&(!sc.lines.length||!sc.lines[0].sp||sc.lines[0].sp==='p'))UI.setChar(sc.focus,sc.ex&&sc.ex!=='normal'?sc.ex:Eng.exprOf(sc.focus));else if(!sc.focus&&!(sc.lines[0]&&CHARS[sc.lines[0].sp]))UI.setChar('');
  if(sc.medic){UI.showLine(0,true);setTimeout(function(){Med.open(sc.medic);},sc.lines.length?300:0);return;}
  UI.showLine(0);};
 /* ---------- 背景／立繪 ---------- */
 UI.setBg=function(k){if(k==='courtyard')k='night';if(UI.bgk===k)return;UI.bgk=k;var b=$('bg');b.classList.add('fade');setTimeout(function(){b.innerHTML=ART.html('bg',k);b.classList.remove('fade');},120);};
 UI.setChar=function(id,ex){var c=$('char'),w=$('cw');if(!id){c.className='hide';UI.cid='';return;}var k=id+'|'+(ex||'normal');if(UI.ck===k&&c.className.indexOf('hide')<0){c.className='';return;}
  var isNew=UI.cid!==id;UI.cid=id;UI.ck=k;w.innerHTML=ART.html('char',id,ex);c.className='';w.className='cw'+(isNew?' in':' bob');};
 /* ---------- 台詞播放 ---------- */
 UI.showLine=function(i,noCh){var sc=UI.sc;clearTimeout(UI.autoT);if(!sc)return;
  if(i>=sc.lines.length){UI.endLines(noCh);return;}
  UI.li=i;var l=sc.lines[i];var np=$('nameplate');
  if(l.sp&&l.sp!==''){np.className='on'+(l.sp==='p'?' pc':'');$('npName').textContent=l.sp==='p'?S.p.name:cn(l.sp);}else np.className='';
  if(CHARS[l.sp])UI.setChar(l.sp,l.ex||Eng.exprOf(l.sp));
  $('char').classList.toggle('dim',l.sp==='p');
  Eng.back(l);
  var txt=l.sp&&l.sp!==''?l.t:l.t;UI.type(txt,!l.sp);
  $('box').className='';};
 UI.type=function(t,nar){var el=$('txt');clearInterval(UI.timer);el.className=nar?'nar':'';
  if(!SET.typer||UI.skip){el.textContent=t;UI.typing=false;UI.lineDone();return;}
  var i=0,iv={1:42,2:26,3:12}[SET.speed]||26;UI.typing=true;el.textContent='';UI.full=t;
  UI.timer=setInterval(function(){i+=SET.speed>=3?2:1;el.textContent=t.slice(0,i);if(i>=t.length){clearInterval(UI.timer);UI.typing=false;UI.lineDone();}},iv);};
 UI.lineDone=function(){var sc=UI.sc;if(!sc)return;var last=UI.li>=sc.lines.length-1;
  if(last){UI.endLines();return;}
  $('box').className='wait';
  if(UI.skip){UI.autoT=setTimeout(function(){UI.showLine(UI.li+1);},60);}
  else if(UI.auto){UI.autoT=setTimeout(function(){UI.showLine(UI.li+1);},SET.auto*1000+String(sc.lines[UI.li].t).length*35);}};
 UI.endLines=function(noCh){$('box').className='';if(UI.skip){UI.skip=false;$('qSkip').classList.remove('on');}if(!noCh)UI.choices(UI.sc.ch||[]);UI.measure();
  if(UI.sc.cg&&!UI.sc._cgShown){UI.sc._cgShown=1;}};
 UI.adv=function(){if(!UI.sc||$('kbp').className==='on')return;if(UI.typing){clearInterval(UI.timer);$('txt').textContent=UI.full;UI.typing=false;UI.lineDone();return;}
  if(UI.li<UI.sc.lines.length-1)UI.showLine(UI.li+1);};
 UI.stop=function(){clearInterval(UI.timer);clearTimeout(UI.autoT);UI.auto=false;UI.skip=false;try{$('qAuto').classList.remove('on');$('qSkip').classList.remove('on');}catch(e){}};
 /* ---------- 選項 ---------- */
 UI.choices=function(list){var box=$('choices');box.innerHTML='';box.className=list.length>5?'many':'';
  list.forEach(function(c,i){var b=document.createElement('button');var sys=/^(🗺|↩|返回|繼續$|告辭)/.test(c.t)||/返回地圖|告辭|↩/.test(c.t);b.className='cbtn'+(c.ai?' ai':'')+(sys?' sys':'')+(/🔒/.test(c.t)?' lock':'');b.textContent=c.t;b.style.animationDelay=(i*0.04)+'s';
   b.addEventListener('click',function(ev){ev.stopPropagation();UI.pick(c);});box.appendChild(b);});
  box.scrollTop=0;};
 UI.pick=function(c){if(UI.busyOn)return;$('choices').innerHTML='';if(c.fx)Eng.applyFx(c.fx);
  if(c.ai&&c.t)Eng.back({sp:'p',t:c.t.replace(/^✦ /,'')});UI.go(c.go,c.a);};
 /* ---------- HUD ---------- */
 UI.hud=function(){if(!S)return;$('hDay').textContent=SEASONS[season()];$('hPer').textContent=perName();$('hCh').textContent=CHAPTERS[S.ch].n+'　第'+S.day+'日';
  $('hPlace').textContent=(PLACES[S.place]||PLACES.clinic).n;$('hFame').textContent=S.p.fame;$('hGold').textContent=S.p.gold;UI.badge();};
 UI.badge=function(){var n=Letters.unread();var b=$('letBadge');if(b){b.textContent=n;b.className=n?'on':'';}};
 var KN={aff:['好感','a','♥'],trust:['信任','t','信'],heart:['心動','h','♥'],jeal:['醋意','j','醋']};
 UI.pop=function(id,k,d){if(!d||!KN[k])return;var e=document.createElement('div');e.className='pop'+(d<0?' neg':'');
  var ic=k==='heart'?'h':KN[k][1];e.innerHTML='<span class="ic '+ic+'">'+(k==='heart'?'♥':KN[k][2])+'</span>'+esc(cn(id))+' '+KN[k][0]+' <b>'+(d>0?'+':'')+d+'</b>';UI.addPop(e);};
 var PN={med:'醫術',cha:'魅力',wit:'才智',fame:'名聲',mind:'心境',gold:'銀兩',hp:'體力'};
 UI.popP=function(k,d){if(!PN[k]||!d)return;var e=document.createElement('div');e.className='pop'+(d<0?' neg':'');e.innerHTML='<span class="ic p">'+PN[k][0]+'</span>'+PN[k]+' <b>'+(d>0?'+':'')+d+'</b>';UI.addPop(e);UI.hud();};
 UI.addPop=function(e){var p=$('pops');if(!p)return;p.appendChild(e);while(p.children.length>4)p.removeChild(p.firstChild);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},2700);};
 UI.banner=function(a,b){var e=$('banner');$('bn1').textContent=a;$('bn2').textContent=b||'';e.className='';void e.offsetWidth;e.className='on';setTimeout(function(){e.className='';},2900);};
 UI.busy=function(on){UI.busyOn=on;$('busy').className=on?'on':'';};
 UI.cgShow=function(id,cb){var v=$('cgv');var cg=null,who='';for(var k in CGS)CGS[k].forEach(function(x){if(x.id===id){cg=x;who=k;}});if(!cg){if(cb)cb();return;}
  $('cgimg').innerHTML=ART.html('cg',id);$('cgcap').innerHTML='<b>'+esc(CHARS[who].n+' · '+cg.n)+'</b>'+esc(cg.d)+'<div class="note">（輕觸關閉）</div>';v.className='on';
  v.onclick=function(){v.className='';v.onclick=null;if(cb)cb();};};
 /* ---------- 地圖 ---------- */
 var mapSel='';
 UI.mapSvg=function(){return '<svg viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e6d0"/><stop offset="1" stop-color="#e8d6ba"/></linearGradient></defs><rect width="400" height="560" fill="url(#mpg)"/>'
  +'<g fill="none" stroke="#8a7a6a" stroke-width="1.2" opacity=".55"><path d="M10 120 l30 -40 l25 30 l30 -50 l35 60"/><path d="M250 90 l30 -45 l28 34 l26 -40 l40 56"/><path d="M20 140 q 40 -12 80 0"/><path d="M270 110 q 40 -10 90 0"/></g>'
  +'<path d="M-10 330 C 80 300, 140 360, 220 330 S 360 300, 410 320" stroke="#9fb6be" stroke-width="16" fill="none" opacity=".6"/><path d="M-10 330 C 80 300, 140 360, 220 330 S 360 300, 410 320" stroke="#c7d6da" stroke-width="5" fill="none" opacity=".7"/>'
  +'<text x="300" y="300" font-size="13" fill="#6a8890" font-family="serif" letter-spacing="4">渭水</text>'
  +'<rect x="120" y="70" width="190" height="200" fill="none" stroke="#8a6a4a" stroke-width="2" stroke-dasharray="7 4" opacity=".55"/><text x="128" y="88" font-size="11" fill="#8a6a4a" font-family="serif">宮城</text>'
  +'<g stroke="#a88a6a" stroke-width="1.6" stroke-dasharray="3 5" fill="none" opacity=".8"><path d="M88 392 C 140 370, 180 360, 208 347"/><path d="M208 347 C 230 300, 220 200, 216 123"/><path d="M216 123 L 152 246"/><path d="M88 392 L 80 202"/><path d="M208 347 L 304 403"/><path d="M216 123 C 270 140, 300 160, 328 168"/><path d="M152 246 L 248 246"/></g>'
  +'<g opacity=".35" fill="#5a7a5a"><circle cx="60" cy="230" r="10"/><circle cx="75" cy="215" r="8"/><circle cx="50" cy="210" r="7"/><circle cx="340" cy="450" r="9"/><circle cx="355" cy="465" r="7"/></g>'
  +'<g transform="translate(350 510)" font-family="serif"><circle r="22" fill="none" stroke="#8a6a4a" stroke-width="1"/><path d="M0 -20 L 5 0 L 0 20 L -5 0 Z" fill="#b8323a" opacity=".7"/><text y="-26" font-size="10" text-anchor="middle" fill="#8a6a4a">北</text></g></svg>';};
 UI.showMap=function(){if(!S)return;UI.stop();UI.screen('map');$('choices').innerHTML='';$('mDate').textContent=dateStr().replace(/ · [晨午夕夜]$/,'');$('mPer').textContent=perName();
  if(!$('mapsvg').innerHTML)$('mapsvg').innerHTML=UI.mapSvg();
  var h='';PLACE_ORDER.forEach(function(pl){var P=PLACES[pl];var lk=!Eng.unlocked(pl);var who=Eng.present(pl);if(P.night&&S.per<3)who=CHAR_ORDER.filter(function(id){return S.c[id].met&&CHARS[id].at['夜']===pl&&Eng.where(id)!==null;}).slice(0,0);
   var faces=who.slice(0,3).map(function(id){return '<span class="face">'+(S.c[id].met?ART.html('char',id,'normal'):'<b style="display:flex;height:100%;align-items:center;justify-content:center;font-size:13px">?</b>')+'</span>';}).join('');
   h+='<button class="pin'+(lk?' lock':'')+(pl===S.place?' cur':'')+(pl===mapSel?' sel':'')+'" data-pl="'+pl+'" style="left:'+P.x+'%;top:'+P.y+'%"><span class="ps">'+(lk?'鎖':P.s)+'</span><span class="pn">'+P.n+'</span>'+(faces?'<span class="faces">'+faces+'</span>':'')+'</button>';});
  $('pins').innerHTML=h;UI.mapInfo(mapSel||S.place);UI.badge();};
 UI.mapInfo=function(pl){mapSel=pl;var P=PLACES[pl];if(!P)return;var lk=!Eng.unlocked(pl);var who=Eng.present(pl);
  var w=who.length?'👤 '+who.map(function(id){return S.c[id].met?CHARS[id].n:CHARS[id].sub;}).join('、'):(P.night&&S.per<3?'🌙 入夜後才有人':'此刻無人');
  $('mapinfo').innerHTML='<h3>'+P.n+'</h3><p>'+P.d+'</p><div class="who">'+(lk?'🔒 第二章（入宮）後開放':w)+'</div>'+(lk?'':'<button class="go" data-go="'+pl+'">'+(pl===S.place?'停留':'前往')+'</button>');
  Array.prototype.forEach.call(document.querySelectorAll('.pin'),function(b){b.classList.toggle('sel',b.getAttribute('data-pl')===pl);});};
 /* ---------- 共用面板 ---------- */
 var Sh={tab:''};window.Sh=Sh;
 Sh.open=function(title,tabs,render,tab){$('sheet').className='sheet on';$('shT').textContent=title;Sh.render=render;Sh.tabs=tabs||[];Sh.tab=tab||(tabs&&tabs[0]?tabs[0][0]:'');Sh.draw();};
 Sh.draw=function(){var t=$('shTabs');t.innerHTML=Sh.tabs.map(function(x){return '<button data-tab="'+x[0]+'" class="'+(x[0]===Sh.tab?'on':'')+'">'+x[1]+'</button>';}).join('');$('shB').innerHTML=Sh.render(Sh.tab)||'';$('shB').scrollTop=0;};
 Sh.close=function(){$('sheet').className='sheet';Sh.render=null;if(S)UI.hud();UI.badge();if(UI.cur==='map')UI.showMap();};
 UI.sheet=Sh;
 /* 圖鑑 */
 var Gal={};window.Gal=Gal;
 Gal.open=function(){Sh.open('人物圖鑑',[['list','角色'],['rel','關係網'],['me','我']],Gal.render);};
 function hearts(v){var n=Math.round(clamp(v,0,100)/20);var s='';for(var i=0;i<5;i++)s+=i<n?'<b>♥</b>':'♡';return s;}
 Gal.render=function(tab){if(!S)return '<p class="note">請先開始遊戲。</p>';
  if(tab==='rel')return Gal.rel();if(tab==='me')return Gal.me();if(tab&&tab.indexOf('c:')===0)return Gal.det(tab.slice(2));
  return '<div class="gal">'+CHAR_ORDER.map(function(id){var c=CHARS[id],r=S.c[id];var k=r.met;if(c.hidden&&!k)return '';
   return '<button class="gcard'+(k?'':' unk')+'" data-gid="'+id+'"><div class="gp" style="background:linear-gradient(180deg,'+ART.shade(c.col,0.75)+','+ART.shade(c.col,0.92)+')">'+ART.html('char',id,k?Eng.exprOf(id):'normal')+'</div><div class="gn">'+(k?c.n:'？？？')+'</div><div class="gt">'+(k?c.c:c.sub)+'</div>'
   +(k?'<div class="gf">'+Mood.feel(id)+'</div><div class="hearts">'+hearts(r.aff)+'</div><div class="seals"><i class="'+(r.stage>=1?'on':'')+'"></i><i class="'+(r.stage>=2?'on':'')+'"></i><i class="'+(r.stage>=3?'on':'')+'"></i></div>':'')+'</button>';}).join('')+'</div><p class="note">♥ 好感・印章＝心動里程碑（三枚集滿可迎來告白）。隱藏角色相遇後才會出現。</p>';};
 Gal.det=function(id){var c=CHARS[id],r=S.c[id];var likesK=r.gifts>=1||r.aff>=15;
  var bar=function(n,v,cl){return '<span>'+n+'</span><div class="bar '+(cl||'')+'"><i style="width:'+clamp(v,0,100)+'%"></i></div><span>'+v+'</span>';};
  var mem=(S.mem[id]||[]).slice(-6).reverse().map(function(m){return '・第'+m.d+'日　'+esc(m.t);}).join('<br>');
  return '<button class="btn" data-gback="1">↩ 返回圖鑑</button><div class="gdet" style="margin-top:8px"><div class="dtop" style="background:linear-gradient(180deg,'+ART.shade(c.col,0.7)+','+ART.shade(c.col,0.94)+')">'+ART.html('char',id,Eng.exprOf(id))+'<div class="dname">'+c.n+'<small>'+c.c+'</small></div></div>'
   +'<div class="bars">'+bar('好感',r.aff)+bar('信任',r.trust,'t')+bar('心動',r.heart)+bar('醋意',r.jeal,'j')+bar('健康',r.hp,'h')+'</div>'
   +'<div class="kv"><b>簡介</b>'+esc(c.bio)+'</div><div class="kv"><b>性格</b>'+esc(c.pers)+'</div>'
   +'<div class="kv"><b>心願</b>'+(r.goalKnown?esc(c.goal):'（與他聊聊心願便知）')+'</div>'
   +'<div class="kv"><b>心態</b>'+esc(Mood.card(id))+'</div>'
   +'<div class="kv"><b>病況</b>'+(r.cured?'已醫治（'+c.ail+'）':esc(c.ailD))+'</div>'
   +'<div class="kv"><b>喜好</b>'+(likesK?c.likes.map(function(x){return '<span class="tag">'+x+'</span>';}).join(''):'？？？（送過禮或熟絡後揭曉）')+'<br><b>忌諱</b>'+(r.aff>=30?c.hates.map(function(x){return '<span class="tag no">'+x+'</span>';}).join(''):'？？？')+'</div>'
   +'<div class="kv"><b>秘密</b>'+(r.sec?esc(c.secret):'🔒 尚未得知（信任加深或醫好他的病）')+'</div>'
   +'<div class="kv"><b>回憶</b><div class="mem">'+(mem||'尚無')+'</div></div>'
   +'<div class="kv"><b>里程碑</b>'+CGS[id].map(function(g,i){return (r.stage>i?'✿ ':'・ ')+g.n;}).join('　')+'</div></div>';};
 Gal.rel=function(){var met=CHAR_ORDER.filter(function(id){return S.c[id].met;});var cx=200,cy=200,R=140;var pos={};
  met.forEach(function(id,i){var a=-Math.PI/2+i*2*Math.PI/Math.max(1,met.length);pos[id]=[cx+Math.cos(a)*R,cy+Math.sin(a)*R];});
  var s='<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">';
  RELNET.forEach(function(e){if(pos[e[0]]&&pos[e[1]]){var a=pos[e[0]],b=pos[e[1]];s+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#c9a35a" stroke-width="1.2" stroke-dasharray="4 3"/><text x="'+((a[0]+b[0])/2)+'" y="'+((a[1]+b[1])/2-3)+'" font-size="10" text-anchor="middle" fill="#5a4a44" font-family="serif" paint-order="stroke" stroke="#fbf4ee" stroke-width="3">'+e[2]+'</text>';}});
  met.forEach(function(id){var p=pos[id],r=S.c[id];var w=1+r.heart/20;s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#b8323a" stroke-width="'+w+'" opacity=".55"/>';});
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="26" fill="#b8323a"/><text x="'+cx+'" y="'+(cy+5)+'" font-size="14" text-anchor="middle" fill="#fff" font-family="serif">'+esc(S.p.name.slice(0,2))+'</text>';
  met.forEach(function(id){var p=pos[id];s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="24" fill="#fbf4ee" stroke="'+CHARS[id].col+'" stroke-width="3"/><text x="'+p[0]+'" y="'+(p[1]+5)+'" font-size="14" text-anchor="middle" fill="#2b2321" font-family="serif">'+CHARS[id].n+'</text><text x="'+p[0]+'" y="'+(p[1]+40)+'" font-size="10" text-anchor="middle" fill="#b8323a" font-family="serif">'+Mood.feel(id)+'</text>';});
  return '<div class="rel">'+s+'</svg></div><p class="note">紅線粗細＝對你的心動；金色虛線＝角色之間的關係。只顯示已相識的人。</p>';};
 Gal.me=function(){var p=S.p;return '<div class="gdet"><div class="dtop" style="background:linear-gradient(180deg,#f6dfe2,#fbf4ee)">'+ART.html('char','heroine','smile')+'<div class="dname">'+esc(p.name)+'<small>青囊谷女神醫</small></div></div></div>'
  +'<div class="pstat" style="margin-top:10px"><div>醫術<b>'+p.med+'</b></div><div>魅力<b>'+p.cha+'</b></div><div>才智<b>'+p.wit+'</b></div><div>名聲<b>'+p.fame+'</b></div><div>心境<b>'+p.mind+'</b></div><div>銀兩<b>'+p.gold+'</b></div></div>'
  +'<div class="kv"><b>藥箱</b>'+esc(Eng.invStr())+'</div><div class="kv"><b>目標</b>'+esc(CHAPTERS[S.ch].n+'：'+CHAPTERS[S.ch].goal)+'</div>'
  +'<div class="kv"><b>秘密</b>'+esc(S.secrets.p[0].t)+'（知情者：'+(S.secrets.p[0].kn.map(cn).join('、')||'無人')+'）</div>'
  +'<div class="kv"><b>近期大事</b><div class="mem">'+(WS.brief().map(esc).join('<br>')||'風平浪靜')+'</div></div>';};
 /* 書信 */
 var LetUI={};window.LetUI=LetUI;
 LetUI.open=function(){Sh.open('魚雁往來',[],LetUI.render);};
 LetUI.render=function(tab){if(!S)return '';if(tab&&tab.indexOf('l:')===0)return LetUI.one(+tab.slice(2));
  if(!S.letters.length)return '<p class="note" style="text-align:center;margin-top:40px">尚無來信。<br>與人熟絡（好感 20 以上）後，他們會寄信給你。</p>';
  var h='';for(var i=S.letters.length-1;i>=0;i--){var l=S.letters[i];h+='<button class="env'+(l.read?' read':'')+'" data-lid="'+i+'"><span class="wax">'+CHARS[l.id].n[0]+'</span><span class="ef"><b>'+CHARS[l.id].n+'</b>　<small>第'+l.d+'日</small><p>'+esc(l.t.slice(0,22))+'…</p></span>'+(l.read?(l.rep?'<small>已回</small>':''):'<span class="dot"></span>')+'</button>';}return h;};
 LetUI.one=function(i){var l=S.letters[i];if(!l)return '';l.read=1;UI.badge();var parts=l.t.split('——');
  var h='<button class="btn" data-lback="1">↩ 返回信匣</button><div class="jian">'+esc(parts[0])+(parts[1]?'<div class="from">——'+esc(parts[1])+'</div>':'')+'</div>';
  if(l.rep)h+='<p class="note" style="text-align:center">已回信：'+esc(l.rt||{warm:'溫柔',tease:'俏皮',polite:'得體',free:''}[l.rep])+'</p>';
  else h+='<div class="reply"><button class="cbtn" data-rep="warm" data-li="'+i+'">💌 溫柔地回信</button><button class="cbtn" data-rep="tease" data-li="'+i+'">😊 俏皮地回信</button><button class="cbtn" data-rep="polite" data-li="'+i+'">📜 得體地回信</button><button class="cbtn ai" data-rep="free" data-li="'+i+'">✍️ 親筆回信（自己寫）</button></div>';
  return h;};
 /* 相冊 */
 var Alb={};window.Alb=Alb;
 Alb.open=function(){Sh.open('回憶畫卷',[['cg','CG'],['end','結局']],Alb.render);};
 Alb.render=function(tab){var g=Meta.get();
  if(tab==='end'){return Object.keys(ENDINGS).map(function(k){var E=ENDINGS[k],on=g.endings[k];return '<div class="endl'+(on?'':' lock')+'"><i>'+E.k+'</i><span>'+(on?'<b>'+E.n+'</b>　'+esc(E.d):'？？？？')+'</span></div>';}).join('')+'<p class="note">已達成 '+Object.keys(g.endings).length+' / '+Object.keys(ENDINGS).length+'。</p>';}
  var h='<div class="alb">',tot=0,got=0;CHAR_ORDER.forEach(function(id){if(CHARS[id].hidden&&!g.seen[id]&&!CGS[id].some(function(x){return g.cg[x.id];}))return;h+='<h4>'+CHARS[id].n+'</h4>';
   CGS[id].forEach(function(x){tot++;if(g.cg[x.id]){got++;h+='<button class="cgt" data-cg="'+x.id+'">'+ART.html('cg',x.id)+'<span>'+x.n+'</span></button>';}else h+='<div class="cgt lock"><em>鎖</em><span>？？？</span></div>';});});
  return h+'</div><p class="note">已收集 '+got+' / '+tot+'（不含隱藏）。CG 跨存檔保留。</p>';};
 /* 選單 */
 var MenuUI={};window.MenuUI=MenuUI;
 MenuUI.open=function(tab){Sh.open('選單',[['main','總覽'],['save','存檔'],['load','讀檔'],['set','設定'],['log','回顧']],MenuUI.render,tab);};
 MenuUI.render=function(tab){
  if(tab==='save'||tab==='load')return MenuUI.slots(tab);if(tab==='set')return MenuUI.settings();if(tab==='log')return MenuUI.log();
  return '<div class="mgrid"><button class="mbtn" data-m="save"><i>💾</i>存檔</button><button class="mbtn" data-m="load"><i>📂</i>讀檔</button><button class="mbtn" data-m="set"><i>⚙</i>設定</button><button class="mbtn" data-m="log"><i>📜</i>回顧</button><button class="mbtn" data-m="alb"><i>🖼</i>畫卷</button><button class="mbtn" data-m="title"><i>🏮</i>標題</button></div>'
   +(S?Gal.me():'')+'<p class="note">AI：'+(SET.ai?(AI.ready()?'已啟用（'+(SET.aiSrc==='manual'?'手動貼上':(PRESETS[SET.preset]||{}).n||SET.preset)+'）':'已啟用但暫停／未設定 Key → 離線劇情'+(AI.lastErr?'｜'+esc(AI.lastErr):'')):'離線模式')+'</p>';};
 MenuUI.slots=function(mode){var h='';['auto',1,2,3].forEach(function(s){var i=slotInfo(s);if(mode==='save'&&s==='auto')return;
  h+='<div class="slot"><div class="si"><b>'+slotName(s)+'</b><br>'+(i?esc(i.name)+'・'+CHAPTERS[i.ch].n+'・第'+i.day+'日<br><small>'+new Date(i.t).toLocaleString()+'</small>':'（空）')+'</div>'
   +(mode==='save'?'<button class="pri" data-sv="'+s+'">存入</button>':(i?'<button class="pri" data-ld="'+s+'">讀取</button>':''))+'</div>';});
  return h+'<p class="note">每日清晨自動存檔。存檔保存在此瀏覽器（Safari 與主畫面 App 的存檔互不相通）。</p>';};
 MenuUI.log=function(){if(!S)return '';return S.back.slice(-80).reverse().map(function(b){return '<div class="logl'+(b.sp==='p'?' me':'')+'">'+(b.sp?'<b>'+esc(b.sp==='p'?S.p.name:cn(b.sp))+'</b>':'')+esc(b.t)+'</div>';}).join('')||'<p class="note">尚無紀錄。</p>';};
 function seg(key,opts){return '<div class="seg">'+opts.map(function(o){return '<button data-set="'+key+'" data-v="'+o[0]+'" class="'+(String(SET[key])===String(o[0])?'on':'')+'">'+o[1]+'</button>';}).join('')+'</div>';}
 MenuUI.settings=function(){var P=PRESETS[SET.preset]||PRESETS.custom;
  return '<h4>AI 說書人</h4><label class="field">AI 模式'+seg('ai',[[false,'離線劇情'],[true,'AI 生成']])+'</label>'
   +'<label class="field">來源'+seg('aiSrc',[['api','API 直連'],['manual','手動貼上（Grok App 等）']])+'</label>'
   +'<label class="field">服務商<select id="sPreset">'+PRESET_ORDER.map(function(k){return '<option value="'+k+'"'+(k===SET.preset?' selected':'')+'>'+PRESETS[k].n+'</option>';}).join('')+'</select></label>'
   +'<p class="note">'+esc(P.key)+'</p>'
   +'<label class="field">Base URL<input id="sBase" value="'+esc(SET.base)+'" autocapitalize="off" autocorrect="off" spellcheck="false"></label>'
   +'<label class="field">模型<input id="sModel" list="mdl" value="'+esc(SET.model)+'" autocapitalize="off" autocorrect="off" spellcheck="false"><datalist id="mdl">'+(P.models||[]).map(function(m){return '<option value="'+m+'">';}).join('')+'</datalist></label>'
   +'<label class="field">API Key（只存在本機）<input id="sKey" type="password" value="'+esc(SET.key)+'" autocapitalize="off" autocorrect="off" spellcheck="false"></label>'
   +'<div class="row"><button class="btn pri" id="sSave">儲存</button><button class="btn" id="sTest">測試連線</button><span id="sMsg" class="note"></span></div>'
   +(AI.isBlocked()||(S&&S.aiPaused)?'<p class="note" style="color:#b8323a">AI 目前暫停：'+esc(AI.lastErr||SET.aiBlock.split('\u0001')[1]||'')+' <button class="btn" id="sUnblock">恢復 AI</button></p>':'')
   +'<h4>閱讀</h4><label class="field">打字機效果'+seg('typer',[[true,'開'],[false,'關']])+'</label><label class="field">文字速度'+seg('speed',[[1,'慢'],[2,'中'],[3,'快']])+'</label>'
   +'<label class="field">自動播放間隔'+seg('auto',[[2.4,'悠閒'],[1.6,'適中'],[0.9,'緊湊']])+'</label><label class="field">字級'+seg('font',[[15,'小'],[17,'中'],[19,'大']])+'</label>'
   +'<h4>遊戲</h4><label class="field">難度'+seg('diff',[['easy','爽玩'],['normal','一般'],['hard','困難']])+'</label><label class="field">劇情節奏'+seg('pace',[['slow','慢熱'],['mid','適中'],['fast','緊湊']])+'</label>'
   +'<label class="field">知情防火牆（角色不會知道不該知道的事）'+seg('firewall',[[true,'開'],[false,'關']])+'</label><label class="field">世界節制（大事須有前因）'+seg('wsane',[[true,'開'],[false,'關']])+'</label>'
   +'<label class="field">宣告寬限（/設定 喜歡我 時心動上限 60）'+seg('decld',[[true,'開'],[false,'關']])+'</label>'
   +'<p class="note">輸入框左邊的按鈕可切換：💬說（對白）→ ⚙指令（動作或「某人命人…」）→ 📜設定（作者宣告，必定成真）。也可在句首打 /設定、/指令。</p>';};
 /* ---------- 名字 ---------- */
 UI.askName=function(cb){var def=DEF_NAMES[0];UI.dialog('女神醫之名','<p class="note">她剛從青囊谷學成下山。為她取個名字吧：</p><label class="field">姓名（2–4 字）<input id="nmIn" maxlength="6" value="'+def+'" autocomplete="off"></label><div class="row">'+DEF_NAMES.map(function(n){return '<button class="btn" data-nm="'+n+'">'+n+'</button>';}).join('')+'</div>',
  [['取消',null],['下山去','pri',function(){var v=($('nmIn').value||'').replace(/\s/g,'').slice(0,6)||def;cb(v);}]]);
  setTimeout(function(){Array.prototype.forEach.call(document.querySelectorAll('[data-nm]'),function(b){b.onclick=function(){$('nmIn').value=b.getAttribute('data-nm');};});},0);};
 UI.dialog=function(t,body,btns){$('dlT').textContent=t;$('dlB').innerHTML=body;var a=$('dlA');a.innerHTML='';(btns||[['確定','pri']]).forEach(function(b){var e=document.createElement('button');e.className='btn'+(b[1]==='pri'?' pri':'');e.textContent=b[0];
  e.onclick=function(){$('dlg').className='dlg';var f=typeof b[1]==='function'?b[1]:b[2];if(f)f();};a.appendChild(e);});$('dlg').className='dlg on';};
 UI.manualDialog=function(prompt,ok,cancel){UI.dialog('手動 AI（複製→貼上）','<p class="note">① 複製下方提示詞，貼到 Grok／ChatGPT 等 App；② 把它回覆的 JSON 貼回下面。</p><label class="field">提示詞<textarea id="mpP" rows="5" readonly>'+esc(prompt)+'</textarea></label><button class="btn" id="mpCopy">複製提示詞</button><label class="field">AI 回覆<textarea id="mpA" rows="5"></textarea></label>',
  [['改用離線',function(){cancel();}],['送出','pri',function(){ok($('mpA').value);}]]);
  setTimeout(function(){var c=$('mpCopy');if(c)c.onclick=function(){try{navigator.clipboard.writeText(prompt);toast('已複製');}catch(e){$('mpP').select();document.execCommand('copy');}};},0);};
 /* ---------- 標題 ---------- */
 UI.titleInit=function(){if(!$('tbg').innerHTML)$('tbg').innerHTML=ART.html('bg','title');var pe=document.querySelector('.tpetals');if(pe&&!pe.innerHTML){var h='';for(var i=0;i<14;i++)h+='<i style="left:'+(i*7.3%100)+'%;animation-duration:'+(7+i%5*1.7)+'s;animation-delay:'+(-i*1.1)+'s"></i>';pe.innerHTML=h;}
  var has=['auto',1,2,3].some(function(s){return slotInfo(s);});$('tCont').classList.toggle('dis',!has);};
 UI.newGame=function(){UI.askName(function(nm){S=newState(nm);Meta.get();UI.stop();UI.bgk='';UI.go('start');saveSlot('auto',true);});};
 UI.loadGame=function(slot){if(!loadSlot(slot)){toast('讀檔失敗');return;}if(S.pend)S.pend.shown=0;Sh.close();UI.bgk='';UI.stop();toast('📂 已讀取（'+slotName(slot)+'）');UI.go('hub');};
 /* ---------- 輸入 ---------- */
 var MODES=[['say','💬說'],['cmd','⚙指令'],['decl','📜設定']];
 UI.modeSync=function(){var m=SET.inmode||'say';var lab=MODES.filter(function(x){return x[0]===m;})[0]||MODES[0];var b=$('mode');b.textContent=lab[1];b.className='mchip '+m;$('kbmode').textContent=lab[1];
  $('free').placeholder={say:'對眼前的人說…',cmd:'做什麼？例：替他包紮／嬴政命人傳蒙恬',decl:'宣告劇情：例：那人便是嬴政'}[m];};
 UI.submitFree=function(){var f=$('free');var v=f.value;f.value='';if(!v.trim()||!S||UI.busyOn)return;$('choices').innerHTML='';var r=Input.submit(v);if(!r)return;if(r.go&&!r.lines){UI.go(r.go,r.a);return;}UI.present(r);};
 /* ---------- 事件綁定 ---------- */
 UI.bind=function(){
  var tabs=$('tabs');$('app').appendChild(tabs);
  $('tNew').onclick=UI.newGame;
  $('tCont').onclick=function(){if(this.classList.contains('dis'))return;var best=null,bt=0;['auto',1,2,3].forEach(function(s){var i=slotInfo(s);if(i&&i.t>bt){bt=i.t;best=s;}});
   Sh.open('續寫前緣',[],function(){return MenuUI.slots('load');});};
  $('tAlbum').onclick=Alb.open;$('tSet').onclick=function(){Sh.open('設定',[],MenuUI.settings);};
  $('box').addEventListener('click',function(e){if(e.target.closest('#inrow')||e.target.closest('#quick'))return;UI.adv();});
  $('char').style.pointerEvents='none';
  $('game').addEventListener('click',function(e){if(e.target===$('game')||e.target.closest('#bg')||e.target.id==='fx')UI.adv();});
  $('quick').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var q=b.getAttribute('data-q');
   if(q==='log')MenuUI.open('log');else if(q==='save')MenuUI.open('save');
   else if(q==='auto'){UI.auto=!UI.auto;b.classList.toggle('on',UI.auto);if(UI.auto&&!UI.typing)UI.lineDone();}
   else if(q==='skip'){UI.skip=true;b.classList.add('on');if(UI.typing){clearInterval(UI.timer);$('txt').textContent=UI.full;UI.typing=false;}UI.lineDone();}});
  $('mode').onclick=function(e){e.stopPropagation();var i=MODES.map(function(x){return x[0];}).indexOf(SET.inmode||'say');SET.inmode=MODES[(i+1)%3][0];saveSettings();UI.modeSync();toast({say:'💬 說：對眼前的人說話',cmd:'⚙ 指令：描述動作，或「某人命人…」導演命令',decl:'📜 設定：宣告劇情事實，必定成真'}[SET.inmode],2600);};
  $('send').onclick=function(e){e.stopPropagation();if(Kb.on()&&!$('free').value){Kb.show();return;}UI.submitFree();};
  $('free').addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229)return;if(e.key==='Enter'){e.preventDefault();UI.submitFree();}});
  tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!S||UI.busyOn)return;var t=b.getAttribute('data-t');
   if(t==='map')UI.go('hub');else if(t==='clinic'){UI.go('go',{pl:'clinic'});}else if(t==='gal')Gal.open();else if(t==='let')LetUI.open();else MenuUI.open();});
  $('hSeal').onclick=function(){Gal.open();Sh.tab='me';Sh.draw();};
  /* 地圖 */
  $('pins').addEventListener('click',function(e){var b=e.target.closest('.pin');if(!b)return;var pl=b.getAttribute('data-pl');if(mapSel===pl&&Eng.unlocked(pl)){UI.go('go',{pl:pl});return;}UI.mapInfo(pl);});
  $('mapinfo').addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(b)UI.go('go',{pl:b.getAttribute('data-go')});});
  $('mWait').onclick=function(){Eng.pass(1);UI.go('hub');};
  $('mBack').onclick=function(){UI.go('place');};
  /* 面板 */
  $('shX').onclick=Sh.close;
  $('shTabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;Sh.tab=b.getAttribute('data-tab');Sh.draw();});
  $('shB').addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;var a;
   if((a=t.getAttribute('data-gid'))){if(!S.c[a].met)return toast('尚未相識');Sh.tab='c:'+a;Sh.draw();return;}
   if(t.getAttribute('data-gback')){Sh.tab='list';Sh.draw();return;}
   if((a=t.getAttribute('data-lid'))!==null){Sh.tab='l:'+a;Sh.draw();return;}
   if(t.getAttribute('data-lback')){Sh.tab='';Sh.draw();return;}
   if((a=t.getAttribute('data-rep'))){var li=+t.getAttribute('data-li');if(a==='free'){Kb.ask('親筆回信給'+cn(S.letters[li].id),function(v){if(!v.trim())return;Letters.reply(li,'free',v.slice(0,80));toast('✉ 已寄出');Sh.draw();});return;}Letters.reply(li,a);toast('✉ 已寄出回信');Sh.draw();return;}
   if((a=t.getAttribute('data-cg'))){UI.cgShow(a,function(){});return;}
   if((a=t.getAttribute('data-m'))){if(a==='alb'){Alb.open();return;}if(a==='title'){UI.dialog('回到標題','未存檔的進度會遺失（每日清晨有自動存檔）。',[['取消',null],['回到標題','pri',function(){Sh.close();UI.go('title');}]]);return;}Sh.tab=a;Sh.draw();return;}
   if((a=t.getAttribute('data-sv'))){saveSlot(a==='auto'?'auto':+a);Sh.draw();return;}
   if((a=t.getAttribute('data-ld'))){UI.loadGame(a==='auto'?'auto':+a);return;}
   if((a=t.getAttribute('data-set'))){var v=t.getAttribute('data-v');var dv=DEFSET[a];SET[a]=typeof dv==='boolean'?v==='true':(typeof dv==='number'?+v:v);saveSettings();applyLook();Sh.draw();return;}
   if(t.id==='sSave'||t.id==='sTest'){SET.base=$('sBase').value.trim();SET.model=$('sModel').value.trim();SET.key=$('sKey').value.trim();saveSettings();
    if(t.id==='sSave'){toast('已儲存設定');return;}$('sMsg').textContent='測試中…';AI.test().then(function(r){var m=$('sMsg');if(m)m.textContent=(r.ok?'✅ ':'❌ ')+r.msg;});return;}
   if(t.id==='sUnblock'){AI.unblock();toast('AI 已恢復');Sh.draw();return;}});
  $('shB').addEventListener('change',function(e){if(e.target.id==='sPreset'){var k=e.target.value;var P=PRESETS[k];SET.preset=k;if(P.base)SET.base=P.base;if(P.model)SET.model=P.model;saveSettings();Sh.draw();}});
  UI.modeSync();
 };
})();
function applyLook(){document.documentElement.style.setProperty('--fs',(SET.font||17)+'px');UI.modeSync&&UI.modeSync();VV.apply();}
/* ===== 全屏輸入面板（Kb，沿用《秦風》M19：觸控裝置點輸入框 → 覆蓋層 textarea 16px） ===== */
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
  el('kbcancel').addEventListener('click',function(e){e.preventDefault();Kb.close(true);});
  p.addEventListener('click',function(e){if(e.target===p)Kb.close(true);});
  ta.addEventListener('input',count);
  ta.addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229)return;if((e.key==='Enter'||e.keyCode===13)&&!e.shiftKey){e.preventDefault();Kb.send();}else if(e.key==='Escape'){Kb.close(true);}});
  p.addEventListener('touchmove',function(e){if(e.target===p||e.target.id==='kbbox')e.preventDefault();},{passive:false});
  try{var mq=window.matchMedia('(pointer:coarse)');mq.addListener&&mq.addListener(Kb.sync);}catch(e){}};
})();
