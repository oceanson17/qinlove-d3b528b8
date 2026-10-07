/* ===== 美術：SVG 古風動漫立繪／背景／CG（assets/ 有對應圖檔時自動改用圖檔） ===== */
var ART={cache:{}};
(function(){
 var AF=(typeof ASSET_FILES!=='undefined'?ASSET_FILES:[]);
 ART.file=function(key){for(var i=0;i<AF.length;i++){var f=AF[i];if(f.replace(/\.(png|webp|jpg|jpeg)$/i,'')===key)return 'assets/'+f;}return '';};
 function g(id,stops,x2,y2){var s='<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(x2||0)+'" y2="'+(y2===undefined?1:y2)+'">';stops.forEach(function(st){s+='<stop offset="'+st[0]+'" stop-color="'+st[1]+'"'+(st[2]!==undefined?' stop-opacity="'+st[2]+'"':'')+'/>';});return s+'</linearGradient>';}
 function rg(id,stops,cx,cy,r){var s='<radialGradient id="'+id+'" cx="'+(cx||0.5)+'" cy="'+(cy||0.5)+'" r="'+(r||0.5)+'">';stops.forEach(function(st){s+='<stop offset="'+st[0]+'" stop-color="'+st[1]+'"'+(st[2]!==undefined?' stop-opacity="'+st[2]+'"':'')+'/>';});return s+'</radialGradient>';}
 function shade(hex,amt){var c=hex.replace('#','');if(c.length===3)c=c.replace(/./g,'$&$&');var n=parseInt(c,16);var r=(n>>16)&255,gg=(n>>8)&255,b=n&255;
  function f(v){return Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt)));}
  return '#'+((1<<24)+(f(r)<<16)+(f(gg)<<8)+f(b)).toString(16).slice(1);}
 ART.shade=shade;
 /* ---------- 立繪 ---------- */
 /* expr: normal|smile|blush|sad|angry|shy */
 ART.portrait=function(id,expr){
  var key='p_'+id+'_'+(expr||'normal');if(ART.cache[key])return ART.cache[key];
  var isH=id==='heroine';var c=isH?HEROINE:CHARS[id];if(!c)return '';
  var L=c.look,u='q'+id.slice(0,3);expr=expr||'normal';
  var d='<defs>'+g(u+'hr',[[0,shade(L.hair,0.18)],[0.55,L.hair],[1,L.hair2]])+g(u+'hs',[[0,L.hair2],[1,L.hair]],1,0)
   +g(u+'rb',[[0,shade(L.robe,0.12)],[0.6,L.robe],[1,shade(L.robe,-0.35)]])+g(u+'rb2',[[0,shade(L.robe2,0.2)],[1,shade(L.robe2,-0.25)]])
   +g(u+'sk',[[0,shade(L.skin,0.06)],[1,shade(L.skin,-0.06)]])+rg(u+'ir',[[0,shade(L.eye,0.55)],[0.55,L.eye],[1,shade(L.eye,-0.55)]],0.5,0.62,0.6)
   +rg(u+'bl',[[0,'#ff7a8a',0.55],[1,'#ff7a8a',0]])+g(u+'tr',[[0,shade(L.trim,0.35)],[0.5,L.trim],[1,shade(L.trim,-0.3)]])
   +'<filter id="'+u+'sd" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter></defs>';
  var s='';
  var hl=L.len==='long'?880:(L.len==='mid'?640:440);
  /* 後髮 */
  if(L.style==='ponytail'){s+='<path d="M330 150 C 470 160, 520 330, 470 520 C 440 640, 480 760, 520 880 L 400 880 C 400 760, 380 640, 400 520 C 420 380, 400 240, 330 200 Z" fill="url(#'+u+'hr)"/>';
   s+='<path d="M300 120 C 360 110, 410 140, 420 180" stroke="'+L.robe2+'" stroke-width="12" fill="none" stroke-linecap="round"/>';}
  if(isH){s+='<path d="M206 270 C 160 420, 168 600, 140 '+(hl)+' C 250 '+(hl-30)+', 350 '+(hl-30)+', 460 '+hl+' C 432 600, 440 420, 394 270 Z" fill="url(#'+u+'hr)"/>';}
  else if(L.style!=='ponytail'){var w=L.style==='messy'?20:0;s+='<path d="M212 270 C 168 390, 176 520, '+(146-w)+' '+hl+' C 250 '+(hl-20)+', 350 '+(hl-20)+', '+(454+w)+' '+hl+' C 424 520, 432 390, 388 270 Z" fill="url(#'+u+'hr)"/>';
   if(L.len==='long')s+='<path d="M170 520 C 150 650, 160 760, 130 880 M 430 520 C 450 650, 440 760, 470 880" stroke="'+shade(L.hair,0.25)+'" stroke-width="3" fill="none" opacity=".55"/>';}
  /* 頭頂髮帽（使頭形圓潤） */
  s+='<ellipse cx="300" cy="262" rx="100" ry="96" fill="url(#'+u+'hr)"/>';
  /* 身體／衣袍 */
  s+='<path d="M268 440 L 332 440 L 345 520 L 255 520 Z" fill="url(#'+u+'sk)"/>';
  s+='<path d="M300 498 C 236 502, 172 528, 132 596 C 104 660, 84 790, 70 900 L 530 900 C 516 790, 496 660, 468 596 C 428 528, 364 502, 300 498 Z" fill="url(#'+u+'rb)"/>';
  s+='<path d="M132 596 C 150 560, 200 530, 250 516" stroke="'+shade(L.robe,0.35)+'" stroke-width="3" fill="none" opacity=".45"/>';
  /* 衣褶 */
  s+='<path d="M150 640 C 170 720, 165 820, 150 900 M 450 640 C 430 720, 435 820, 450 900 M 220 600 C 230 700, 225 800, 215 900 M 380 600 C 370 700, 375 800, 385 900" stroke="'+shade(L.robe,-0.4)+'" stroke-width="3" fill="none" opacity=".35"/>';
  /* 交領：內白、中層色、外緣金線 */
  s+='<path d="M262 505 L 300 640 L 338 505 Z" fill="#f7f1ea"/>';
  s+='<path d="M250 500 L 300 650 L 312 640 L 268 500 Z" fill="url(#'+u+'rb2)"/><path d="M350 500 L 300 650 L 288 640 L 332 500 Z" fill="url(#'+u+'rb2)"/>';
  s+='<path d="M226 506 C 250 580, 280 640, 300 700 M 374 506 C 350 580, 320 640, 300 700" stroke="url(#'+u+'tr)" stroke-width="10" fill="none"/>';
  s+='<path d="M226 506 C 250 580, 280 640, 300 700 M 374 506 C 350 580, 320 640, 300 700" stroke="#fff6dc" stroke-width="1.6" fill="none" opacity=".7"/>';
  /* 雲紋刺繡 */
  s+='<g fill="none" stroke="'+L.trim+'" stroke-width="2.4" opacity=".75"><path d="M140 760 c 10 -18 34 -18 40 0 c 6 -14 26 -12 28 4 c -16 6 -52 6 -68 -4z"/><path d="M400 790 c 10 -18 34 -18 40 0 c 6 -14 26 -12 28 4 c -16 6 -52 6 -68 -4z"/></g>';
  if(L.armor){/* 銀甲肩吞 */
   s+='<g><path d="M105 620 C 120 560, 190 530, 240 545 C 225 600, 190 650, 120 680 Z" fill="url(#'+u+'tr)"/><path d="M495 620 C 480 560, 410 530, 360 545 C 375 600, 410 650, 480 680 Z" fill="url(#'+u+'tr)"/>';
   for(var ai=0;ai<4;ai++){s+='<path d="M'+(125+ai*25)+' '+(640-ai*18)+' q 14 18 28 0" stroke="'+shade(L.trim,-0.4)+'" stroke-width="2.5" fill="none"/><path d="M'+(475-ai*25)+' '+(640-ai*18)+' q -14 18 -28 0" stroke="'+shade(L.trim,-0.4)+'" stroke-width="2.5" fill="none"/>';}
   s+='<circle cx="180" cy="580" r="12" fill="#e8d8a0" stroke="#8a7040" stroke-width="2"/><circle cx="420" cy="580" r="12" fill="#e8d8a0" stroke="#8a7040" stroke-width="2"/></g>';
   s+='<path d="M60 900 C 70 760, 90 700, 105 660 L 60 900 Z" fill="'+L.robe2+'" opacity=".9"/>';}
  if(L.fur){s+='<g fill="#fbfbf6" stroke="#d8d6cc" stroke-width="2">';
   var fx=[[150,600,46],[200,560,44],[255,545,36],[345,545,36],[400,560,44],[450,600,46],[110,660,40],[490,660,40]];
   fx.forEach(function(f){s+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+f[2]+'"/>';});s+='</g>';
   s+='<g stroke="#e6e2d6" stroke-width="2" fill="none">';fx.forEach(function(f){s+='<path d="M'+(f[0]-f[2]*0.5)+' '+f[1]+' q '+(f[2]*0.5)+' -'+(f[2]*0.4)+' '+f[2]+' 0"/>';});s+='</g>';}
  if(isH){/* 藥箱背帶＋腰間香囊 */
   s+='<path d="M180 560 L 420 900" stroke="#8a5a3a" stroke-width="14"/><path d="M180 560 L 420 900" stroke="#d8b080" stroke-width="2" stroke-dasharray="6 8"/>';
   s+='<g transform="translate(390 780)"><path d="M0 0 C -26 10, -26 60, 0 70 C 26 60, 26 10, 0 0Z" fill="#c8384a"/><path d="M-6 -2 L 0 -22 L 6 -2" stroke="#d4a84a" stroke-width="3" fill="none"/><circle cy="35" r="7" fill="#f4d58a"/></g>';}
  /* 脖子陰影 */
  s+='<path d="M268 470 C 285 490, 315 490, 332 470 L 332 500 C 315 510, 285 510, 268 500 Z" fill="'+shade(L.skin,-0.15)+'" opacity=".6"/>';
  /* 耳朵 */
  s+='<path d="M222 330 C 205 325, 205 370, 226 385 Z" fill="'+shade(L.skin,-0.06)+'"/><path d="M378 330 C 395 325, 395 370, 374 385 Z" fill="'+shade(L.skin,-0.06)+'"/>';
  if(isH)s+='<circle cx="218" cy="392" r="5" fill="#e8d8b0"/><path d="M218 397 v 18" stroke="#c8a860" stroke-width="2"/><circle cx="218" cy="420" r="4" fill="#d24a5a"/>';
  /* 臉 */
  var chin=isH?452:462,jw=isH?0:4;
  s+='<path d="M222 290 C 220 360, '+(238-jw)+' 420, 300 '+chin+' C '+(362+jw)+' 420, 380 360, 378 290 C 370 230, 230 230, 222 290 Z" fill="url(#'+u+'sk)"/>';
  s+='<path d="M232 400 C 255 440, 280 452, 300 '+chin+'" stroke="'+shade(L.skin,-0.22)+'" stroke-width="2" fill="none" opacity=".5"/>';
  /* 眉 */
  var by=isH?318:314,bt={normal:0,smile:-2,blush:0,sad:8,angry:-8,shy:4}[expr]||0;
  var bc=shade(L.hair,0.1);
  s+='<path d="M236 '+(by+bt)+' C 252 '+(by-8)+', 270 '+(by-8)+', 284 '+(by-2-(expr==='angry'?-6:0))+'" stroke="'+bc+'" stroke-width="'+(isH?4:5)+'" fill="none" stroke-linecap="round"/>';
  s+='<path d="M364 '+(by+bt)+' C 348 '+(by-8)+', 330 '+(by-8)+', 316 '+(by-2-(expr==='angry'?-6:0))+'" stroke="'+bc+'" stroke-width="'+(isH?4:5)+'" fill="none" stroke-linecap="round"/>';
  /* 眼 */
  function eye(cx,dir){var e='',ey=352;var hw=isH?22:23,h=isH?17:13;
   if(expr==='smile'||expr==='blush'&&!isH){e+='<path d="M'+(cx-hw)+' '+(ey+2)+' Q '+cx+' '+(ey-14)+' '+(cx+hw)+' '+(ey+2)+'" stroke="#2a1a1a" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    e+='<path d="M'+(cx-hw+6)+' '+(ey+1)+' Q '+cx+' '+(ey-8)+' '+(cx+hw-6)+' '+(ey+1)+'" stroke="'+L.eye+'" stroke-width="3" fill="none" opacity=".6"/>';return e;}
   var tilt=dir*(isH?2:5);
   e+='<path d="M'+(cx-hw)+' '+(ey+tilt*0.4)+' C '+(cx-hw*0.5)+' '+(ey-h)+', '+(cx+hw*0.5)+' '+(ey-h-tilt)+', '+(cx+hw)+' '+(ey-4-tilt)+' C '+(cx+hw*0.6)+' '+(ey+h*0.9)+', '+(cx-hw*0.6)+' '+(ey+h*0.9)+', '+(cx-hw)+' '+(ey+tilt*0.4)+' Z" fill="#fbf8f4"/>';
   var irY=ey+(expr==='sad'?2:0),irR=isH?12:10;
   e+='<ellipse cx="'+(cx+dir*1)+'" cy="'+irY+'" rx="'+irR+'" ry="'+(irR*1.25)+'" fill="url(#'+u+'ir)"/>';
   e+='<ellipse cx="'+(cx+dir*1)+'" cy="'+(irY+1)+'" rx="'+(irR*0.45)+'" ry="'+(irR*0.6)+'" fill="#1a0e10"/>';
   e+='<circle cx="'+(cx+dir*1-4)+'" cy="'+(irY-5)+'" r="'+(isH?4:3.2)+'" fill="#fff"/><circle cx="'+(cx+dir*1+4)+'" cy="'+(irY+5)+'" r="1.8" fill="#fff" opacity=".8"/>';
   /* 上眼線（加粗、眼尾上挑） */
   e+='<path d="M'+(cx-hw-2)+' '+(ey+1+tilt*0.4)+' C '+(cx-hw*0.5)+' '+(ey-h-2)+', '+(cx+hw*0.5)+' '+(ey-h-2-tilt)+', '+(cx+hw+4)+' '+(ey-6-tilt)+'" stroke="#1e1214" stroke-width="'+(isH?5:5.5)+'" fill="none" stroke-linecap="round"/>';
   if(isH)e+='<path d="M'+(cx+hw)+' '+(ey-6)+' l 8 -5 M'+(cx+hw-3)+' '+(ey-9)+' l 6 -7" stroke="#1e1214" stroke-width="2.5" stroke-linecap="round"/>';
   e+='<path d="M'+(cx-hw*0.6)+' '+(ey+h*0.85)+' Q '+cx+' '+(ey+h*1.05)+' '+(cx+hw*0.7)+' '+(ey+h*0.7)+'" stroke="'+shade(L.eye,-0.3)+'" stroke-width="1.6" fill="none" opacity=".6"/>';
   if(expr==='sad'||expr==='shy')e+='<path d="M'+(cx-hw)+' '+(ey-h-6)+' Q '+cx+' '+(ey-h-12)+' '+(cx+hw)+' '+(ey-h-8)+'" stroke="#1e1214" stroke-width="1.6" fill="none" opacity=".5"/>';
   return e;}
  s+=eye(262,-1)+eye(338,1);
  /* 鼻與口 */
  s+='<path d="M302 380 C 300 395, 296 402, 300 406" stroke="'+shade(L.skin,-0.3)+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  var my=isH?428:432;
  var mouth={normal:'M288 '+my+' Q 300 '+(my+3)+' 312 '+my,smile:'M284 '+(my-2)+' Q 300 '+(my+9)+' 316 '+(my-2),blush:'M290 '+my+' Q 300 '+(my+5)+' 310 '+my,sad:'M288 '+(my+3)+' Q 300 '+(my-3)+' 312 '+(my+3),angry:'M288 '+(my+2)+' L 312 '+(my+1),shy:'M292 '+my+' Q 300 '+(my+3)+' 308 '+my}[expr];
  s+='<path d="'+mouth+'" stroke="#a04a4a" stroke-width="'+(isH?3.2:2.8)+'" fill="none" stroke-linecap="round"/>';
  if(isH)s+='<path d="M292 '+(my+1)+' Q 300 '+(my+4)+' 308 '+(my+1)+'" stroke="#e46a7a" stroke-width="3" fill="none" opacity=".55"/>';
  if(expr==='blush'||expr==='shy'||isH){s+='<ellipse cx="248" cy="392" rx="'+(isH?22:20)+'" ry="9" fill="url(#'+u+'bl)" opacity="'+(expr==='blush'||expr==='shy'?1:0.45)+'"/><ellipse cx="352" cy="392" rx="'+(isH?22:20)+'" ry="9" fill="url(#'+u+'bl)" opacity="'+(expr==='blush'||expr==='shy'?1:0.45)+'"/>';
   if(expr==='blush'||expr==='shy')s+='<path d="M236 388 l 6 -8 M 246 390 l 6 -8 M 354 390 l 6 -8 M 364 388 l 6 -8" stroke="#e05a6a" stroke-width="1.6" opacity=".6"/>';}
  if(L.mask){s+='<path d="M226 388 C 250 380, 350 380, 374 388 C 372 430, 340 462, 300 466 C 260 462, 228 430, 226 388 Z" fill="#1c1c26"/><path d="M226 388 C 250 380, 350 380, 374 388" stroke="'+L.trim+'" stroke-width="2" fill="none"/>';}
  /* 前髮 */
  var hf='url(#'+u+'hr)';
  if(isH){
   s+='<path d="M216 300 C 210 220, 260 180, 300 182 C 345 180, 392 220, 384 300 C 370 270, 352 250, 330 244 C 320 270, 300 282, 280 286 C 286 270, 288 258, 282 246 C 260 256, 240 272, 216 300 Z" fill="'+hf+'"/>';
   s+='<path d="M222 300 C 205 380, 214 460, 196 540 C 214 500, 232 440, 236 380 Z M378 300 C 395 380, 386 460, 404 540 C 386 500, 368 440, 364 380 Z" fill="'+hf+'"/>';
   /* 雙髻＋髮簪步搖 */
   s+='<circle cx="232" cy="200" r="38" fill="'+hf+'"/><circle cx="368" cy="200" r="38" fill="'+hf+'"/>';
   s+='<path d="M200 188 C 220 176, 246 176, 262 188" stroke="'+shade(L.hair,0.3)+'" stroke-width="3" fill="none"/><path d="M338 188 C 354 176, 380 176, 400 188" stroke="'+shade(L.hair,0.3)+'" stroke-width="3" fill="none"/>';
   s+='<g><path d="M372 170 L 430 130" stroke="#d4a84a" stroke-width="4"/><circle cx="432" cy="128" r="9" fill="#e8607a"/><circle cx="420" cy="122" r="6" fill="#f6a8b8"/><circle cx="440" cy="138" r="6" fill="#f6a8b8"/><path d="M432 136 v 40 M 426 140 v 30 M 438 140 v 30" stroke="#d4a84a" stroke-width="1.6"/><circle cx="432" cy="178" r="3.5" fill="#e8607a"/><circle cx="426" cy="172" r="3" fill="#fff"/><circle cx="438" cy="172" r="3" fill="#fff"/></g>';
   s+='<path d="M210 210 C 216 190, 228 180, 240 176" stroke="#f6b8c6" stroke-width="6" fill="none" stroke-linecap="round"/>';
  }else{
   var st=L.style;
   if(st==='messy'){s+='<path d="M212 310 C 196 230, 250 170, 304 170 C 360 170, 410 220, 390 312 L 372 270 L 362 300 L 344 252 L 328 292 L 306 246 L 288 296 L 270 252 L 254 300 L 240 262 L 230 306 Z" fill="'+hf+'"/>';
    s+='<path d="M214 248 C 260 228, 340 226, 388 248" stroke="'+L.robe2+'" stroke-width="10" fill="none"/><path d="M388 248 C 410 256, 420 290, 410 330" stroke="'+L.robe2+'" stroke-width="7" fill="none"/>';}
   else if(st==='short'){s+='<path d="M214 320 C 200 230, 250 176, 302 176 C 356 176, 404 226, 388 320 C 378 290, 368 276, 356 268 L 350 300 L 334 262 L 318 306 L 302 260 L 286 302 L 272 262 L 256 300 L 248 268 C 234 280, 222 296, 214 320 Z" fill="'+hf+'"/>';}
   else{
    s+='<path d="M214 318 C 200 226, 250 176, 302 176 C 356 176, 404 226, 386 318 C 374 286, 362 268, 346 258 C 344 282, 334 300, 322 314 C 324 290, 318 270, 306 254 C 296 280, 282 298, 262 306 C 270 288, 272 272, 266 258 C 244 270, 226 290, 214 318 Z" fill="'+hf+'"/>';
   }
   /* 鬢髮長縷 */
   var sl=st==='short'?440:(st==='messy'?500:560);
   s+='<path d="M220 300 C 204 380, 214 460, 196 '+sl+' C 216 '+(sl-60)+', 234 440, 238 370 Z" fill="'+hf+'"/><path d="M380 300 C 396 380, 386 460, 404 '+sl+' C 384 '+(sl-60)+', 366 440, 362 370 Z" fill="'+hf+'"/>';
   /* 髮絲高光 */
   s+='<path d="M250 220 C 270 205, 330 205, 352 222" stroke="'+shade(L.hair,0.45)+'" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>';
   if(st==='crown'){s+='<g transform="translate(0 22)"><path d="M262 178 L 270 120 L 300 100 L 330 120 L 338 178 Z" fill="url(#'+u+'tr)" stroke="'+shade(L.trim,-0.45)+'" stroke-width="2"/><path d="M240 132 L 360 132" stroke="url(#'+u+'tr)" stroke-width="8" stroke-linecap="round"/><path d="M220 126 L 380 126" stroke="'+shade(L.trim,-0.4)+'" stroke-width="2"/>';
    for(var ci=0;ci<5;ci++){s+='<path d="M'+(240+ci*30)+' 134 v '+(22+ci%2*8)+'" stroke="#e8d8a0" stroke-width="2"/><circle cx="'+(240+ci*30)+'" cy="'+(160+ci%2*8)+'" r="3.5" fill="#c83a3a"/>';}
    s+='<circle cx="300" cy="150" r="9" fill="#c83a3a" stroke="#f4dc9a" stroke-width="2"/></g>';}
   else if(st==='guan'||st==='half'){s+='<g><path d="M276 176 C 276 140, 324 140, 324 176 Z" fill="'+hf+'"/><path d="M280 168 L 284 136 L 316 136 L 320 168 Z" fill="url(#'+u+'tr)" stroke="'+shade(L.trim,-0.45)+'" stroke-width="2"/><path d="M250 150 L 350 150" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round"/>'+(st==='half'?'<circle cx="352" cy="150" r="7" fill="#7ab89a"/>':'')+'</g>';}
   else if(st==='ponytail'){s+='<path d="M290 170 C 300 150, 330 150, 340 172" stroke="'+L.robe2+'" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M300 178 L 296 150 L 330 150 L 326 178 Z" fill="url(#'+u+'tr)"/>';}
  }
  var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" preserveAspectRatio="xMidYMax meet">'+d
   +'<ellipse cx="300" cy="880" rx="250" ry="40" fill="#000" opacity=".12" filter="url(#'+u+'sd)"/>'+s
   +'<path d="M222 290 C 220 360, 238 420, 300 '+chin+'" stroke="'+shade(L.skin,-0.35)+'" stroke-width="1.4" fill="none" opacity=".35"/></svg>';
  ART.cache[key]=svg;return svg;
 };
 /* ---------- 背景 ---------- */
 function sky(id,a,b,c){return g(id,[[0,a],[0.55,b],[1,c]]);}
 function mist(y,op){return '<path d="M0 '+y+' C 150 '+(y-30)+', 300 '+(y+20)+', 450 '+(y-10)+' S 750 '+(y-30)+', 900 '+y+' L 900 '+(y+160)+' L 0 '+(y+160)+' Z" fill="url(#mstg)" opacity="'+op+'"/>';}
 function plum(x,y,sc,col){var s='<g transform="translate('+x+' '+y+') scale('+sc+')"><path d="M0 0 C 60 -40, 120 -60, 200 -140 M 80 -50 C 110 -90, 150 -100, 170 -160 M 140 -95 C 190 -100, 230 -90, 280 -110" stroke="#3a2820" stroke-width="9" fill="none" stroke-linecap="round"/>';
  var pts=[[60,-40],[110,-70],[170,-150],[200,-140],[150,-100],[230,-95],[280,-110],[95,-60],[185,-120],[255,-100],[130,-80]];
  pts.forEach(function(p,i){s+='<g transform="translate('+p[0]+' '+p[1]+')">';for(var k=0;k<5;k++){var a=k*72*Math.PI/180;s+='<circle cx="'+(Math.cos(a)*7).toFixed(1)+'" cy="'+(Math.sin(a)*7).toFixed(1)+'" r="6" fill="'+col+'" opacity=".92"/>';}s+='<circle r="3" fill="#f6d27a"/></g>';});
  return s+'</g>';}
 function lantern(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 -40 v 14" stroke="#3a2a20" stroke-width="2"/><ellipse cx="0" cy="0" rx="18" ry="24" fill="#d8443a"/><ellipse cx="0" cy="0" rx="10" ry="22" fill="#f08a5a" opacity=".6"/><rect x="-10" y="-27" width="20" height="5" fill="#3a2a20"/><rect x="-10" y="22" width="20" height="5" fill="#3a2a20"/><path d="M0 27 v 16" stroke="#d4a84a" stroke-width="2"/><circle cx="0" cy="0" r="40" fill="#ffb060" opacity=".14"/></g>';}
 ART.bg=function(k){
  var key='bg_'+k;if(ART.cache[key])return ART.cache[key];
  var d='<defs><linearGradient id="mstg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>',s='';
  if(k==='clinic'){d+=sky('bgc','#f6e8d6','#e8d2b6','#b89070');
   s+='<rect width="900" height="1600" fill="url(#bgc)"/>';
   for(var r=0;r<6;r++)for(var c=0;c<5;c++){s+='<rect x="'+(60+c*160)+'" y="'+(160+r*110)+'" width="140" height="92" rx="6" fill="#8a5a3a" stroke="#5a3820" stroke-width="4"/><circle cx="'+(130+c*160)+'" cy="'+(206+r*110)+'" r="7" fill="#d4a84a"/><rect x="'+(92+c*160)+'" y="'+(176+r*110)+'" width="76" height="18" fill="#f4ead8" opacity=".85"/>';}
   s+='<rect x="0" y="860" width="900" height="40" fill="#6a4228"/><rect x="0" y="1180" width="900" height="420" fill="#a87850"/><rect x="80" y="1100" width="740" height="90" rx="8" fill="#7a4a2a"/>';
   s+='<g><circle cx="200" cy="1080" r="34" fill="#c8a070"/><rect x="380" y="1040" width="140" height="60" rx="8" fill="#d8c8a8"/><path d="M620 1100 l 40 -80 l 40 80 z" fill="#5a7a5a"/></g>';
   s+=lantern(120,120,1.4)+lantern(780,120,1.4);s+='<rect width="900" height="1600" fill="#fff4e0" opacity=".12"/>';}
  else if(k==='palace'){d+=sky('bgp','#b8cce0','#f0e0d0','#f8e8e0');
   s+='<rect width="900" height="1600" fill="url(#bgp)"/>'+mist(420,0.5);
   s+='<path d="M100 520 L 450 380 L 800 520 Z" fill="#2a1a1a"/><path d="M60 530 L 450 395 L 840 530 L 820 545 L 80 545 Z" fill="#3a2222"/><rect x="160" y="545" width="580" height="300" fill="#8a2a2a"/>';
   for(var pi=0;pi<6;pi++)s+='<rect x="'+(180+pi*104)+'" y="545" width="26" height="300" fill="#a8302e"/>';
   s+='<path d="M120 845 L 780 845 L 860 1600 L 40 1600 Z" fill="#c8b8a8"/>';for(var si=0;si<14;si++)s+='<path d="M'+(120-si*6)+' '+(860+si*52)+' L '+(780+si*6)+' '+(860+si*52)+'" stroke="#a89888" stroke-width="3"/>';
   s+='<g><rect x="60" y="300" width="10" height="560" fill="#2a2020"/><path d="M70 310 C 140 330, 130 470, 70 480 Z" fill="#1c1418"/><rect x="830" y="300" width="10" height="560" fill="#2a2020"/><path d="M830 310 C 760 330, 770 470, 830 480 Z" fill="#1c1418"/></g>';
   s+=mist(900,0.25);}
  else if(k==='plum'){d+=sky('bgm','#e8eef4','#f6eef0','#f0e4e6');
   s+='<rect width="900" height="1600" fill="url(#bgm)"/><path d="M0 700 C 200 600, 400 680, 600 620 S 850 640, 900 600 L 900 1600 L 0 1600 Z" fill="#dfe6ea"/>'+mist(640,0.6);
   s+=plum(-20,700,2.2,'#e86a82')+plum(500,420,1.6,'#f29aaa')+plum(80,1180,1.8,'#d94a6a')+plum(560,1100,1.5,'#f6b6c2');
   s+='<path d="M0 1350 C 300 1300, 600 1380, 900 1320 L 900 1600 L 0 1600 Z" fill="#f8f8fa"/>';
   for(var pe=0;pe<40;pe++)s+='<ellipse cx="'+rnd0(900,pe*37)+'" cy="'+rnd0(1600,pe*91)+'" rx="5" ry="3" fill="#f29aaa" opacity=".7" transform="rotate('+(pe*23)+' '+rnd0(900,pe*37)+' '+rnd0(1600,pe*91)+')"/>';}
  else if(k==='market'){d+=sky('bgk','#f8dcb8','#f6e8d0','#e8d0b0');
   s+='<rect width="900" height="1600" fill="url(#bgk)"/>'+mist(500,0.35);
   s+='<path d="M0 640 L 260 520 L 260 900 L 0 900 Z" fill="#8a5a3a"/><path d="M900 640 L 640 520 L 640 900 L 900 900 Z" fill="#8a5a3a"/><path d="M-20 650 L 280 510 L 300 530 L 0 680 Z" fill="#3a2a22"/><path d="M920 650 L 620 510 L 600 530 L 900 680 Z" fill="#3a2a22"/>';
   s+='<rect x="0" y="900" width="900" height="700" fill="#c8a880"/>';
   ['#c83a3a','#3a6a8a','#d4a84a'].forEach(function(col,i){var x=140+i*240;s+='<g><path d="M'+(x-90)+' 960 L '+(x+90)+' 960 L '+(x+110)+' 1010 L '+(x-110)+' 1010 Z" fill="'+col+'"/><rect x="'+(x-90)+' " y="1010" width="180" height="120" fill="#7a5030"/><rect x="'+(x-100)+'" y="1010" width="8" height="200" fill="#4a3020"/><rect x="'+(x+92)+'" y="1010" width="8" height="200" fill="#4a3020"/></g>';});
   s+=lantern(300,560)+lantern(600,560)+lantern(450,520,1.2);
   s+='<rect x="420" y="380" width="8" height="300" fill="#4a3020"/><path d="M428 390 L 520 400 L 510 520 L 428 510 Z" fill="#e8d8b0"/><text x="474" y="470" font-size="54" text-anchor="middle" fill="#a8302e" font-family="serif">市</text>';}
  else if(k==='camp'){d+=sky('bgx','#9ab0c8','#d8d0c0','#c8b090');
   s+='<rect width="900" height="1600" fill="url(#bgx)"/><path d="M0 700 L 200 520 L 380 660 L 560 480 L 760 640 L 900 560 L 900 1600 L 0 1600 Z" fill="#7a8a98"/>'+mist(640,0.4);
   s+='<path d="M0 860 C 300 820, 600 880, 900 840 L 900 1600 L 0 1600 Z" fill="#b8a07a"/>';
   [[160,960],[480,900],[760,980]].forEach(function(t){s+='<path d="M'+(t[0]-120)+' '+(t[1]+120)+' L '+t[0]+' '+(t[1]-40)+' L '+(t[0]+120)+' '+(t[1]+120)+' Z" fill="#e8dcc4" stroke="#8a7a5a" stroke-width="4"/><path d="M'+t[0]+' '+(t[1]-40)+' L '+t[0]+' '+(t[1]+120)+'" stroke="#8a7a5a" stroke-width="3"/><path d="M'+(t[0]-24)+' '+(t[1]+120)+' L '+t[0]+' '+(t[1]+40)+' L '+(t[0]+24)+' '+(t[1]+120)+' Z" fill="#3a2a22"/>';});
   s+='<rect x="660" y="520" width="8" height="380" fill="#3a2a22"/><path d="M668 530 C 760 540, 780 620, 668 660 Z" fill="#1c1418"/><text x="712" y="610" font-size="44" fill="#d4a84a" font-family="serif" text-anchor="middle">秦</text>';}
  else if(k==='night'){d+=sky('bgn','#0e1428','#1e2a48','#2a3050');
   s+='<rect width="900" height="1600" fill="url(#bgn)"/><circle cx="650" cy="300" r="110" fill="#fbf2d6"/><circle cx="650" cy="300" r="200" fill="#fbf2d6" opacity=".08"/>';
   for(var stt=0;stt<40;stt++)s+='<circle cx="'+rnd0(900,stt*53)+'" cy="'+rnd0(700,stt*29)+'" r="'+(1+stt%3*0.6)+'" fill="#fff" opacity=".7"/>';
   s+='<rect x="0" y="820" width="900" height="80" fill="#2a2030"/><path d="M-20 820 L 920 820 L 900 790 L 0 790 Z" fill="#1a1420"/><rect x="0" y="900" width="900" height="700" fill="#262a3a"/>';
   for(var bi=0;bi<7;bi++){var bx=40+bi*30;s+='<path d="M'+bx+' 1600 C '+(bx+10)+' 1200, '+(bx-10)+' 900, '+(bx+5)+' 500" stroke="#2e4a3a" stroke-width="10" fill="none"/>';for(var lf=0;lf<5;lf++)s+='<path d="M'+(bx+5)+' '+(600+lf*160)+' q 40 -10 70 10 q -40 6 -70 -10z" fill="#3a6a4a" opacity=".85"/>';}
   s+=lantern(720,880,1.3)+lantern(560,920,1)+mist(1200,0.06);}
  else if(k==='study'){d+=sky('bgs','#e8dcc8','#d8c8a8','#a8906a');
   s+='<rect width="900" height="1600" fill="url(#bgs)"/>';
   for(var sh=0;sh<5;sh++){s+='<rect x="40" y="'+(180+sh*130)+'" width="360" height="12" fill="#5a3a22"/>';for(var sc2=0;sc2<9;sc2++)s+='<rect x="'+(52+sc2*38)+'" y="'+(110+sh*130)+'" width="30" height="70" rx="6" fill="'+(sc2%2?'#c8a870':'#b89058')+'" stroke="#7a5a30" stroke-width="2"/>';}
   s+='<rect x="500" y="200" width="340" height="520" fill="#f4ead6" stroke="#5a3a22" stroke-width="14"/>';for(var wl=1;wl<4;wl++){s+='<path d="M'+(500+wl*85)+' 200 V 720 M 500 '+(200+wl*130)+' H 840" stroke="#5a3a22" stroke-width="6"/>';}
   s+='<rect x="0" y="1100" width="900" height="500" fill="#8a6440"/><rect x="200" y="1020" width="500" height="90" rx="8" fill="#5a3a22"/><path d="M300 1010 h 160" stroke="#c8b080" stroke-width="10"/><circle cx="560" cy="1000" r="14" fill="#2a2420"/>';}
  else if(k==='tavern'){d+=sky('bgt','#3a2a26','#6a4430','#8a5a3a');
   s+='<rect width="900" height="1600" fill="url(#bgt)"/><rect x="0" y="0" width="900" height="120" fill="#2a1a16"/>';
   for(var tb=0;tb<6;tb++)s+='<rect x="'+(tb*170)+'" y="0" width="22" height="900" fill="#3a2418"/>';
   s+=lantern(150,260,1.3)+lantern(450,220,1.5)+lantern(750,260,1.3);
   s+='<rect x="0" y="1000" width="900" height="600" fill="#5a3a26"/>';
   [[200,1080],[640,1120]].forEach(function(t){s+='<ellipse cx="'+t[0]+'" cy="'+t[1]+'" rx="150" ry="40" fill="#7a5034"/><rect x="'+(t[0]-10)+'" y="'+t[1]+'" width="20" height="160" fill="#4a2e1c"/><path d="M'+(t[0]-40)+' '+(t[1]-50)+' q 20 -40 40 0 v 30 h -40 z" fill="#8a7a6a"/>';});
   s+='<rect x="380" y="460" width="10" height="320" fill="#2a1a12"/><path d="M390 470 L 520 480 L 510 640 L 390 630 Z" fill="#e8d8b0"/><text x="452" y="575" font-size="64" text-anchor="middle" fill="#8a2a22" font-family="serif">酒</text>';}
  else{/* title */d+=sky('bgz','#f4dfe2','#f8eee6','#e8d8d0');
   s+='<rect width="900" height="1600" fill="url(#bgz)"/><path d="M0 760 L 160 560 L 300 700 L 460 480 L 640 680 L 780 540 L 900 640 L 900 1600 L 0 1600 Z" fill="#c8ced8" opacity=".7"/>'+mist(680,0.7);
   s+='<path d="M0 960 L 220 760 L 420 900 L 640 740 L 900 900 L 900 1600 L 0 1600 Z" fill="#a8b4c0" opacity=".6"/>'+mist(980,0.55)+plum(-40,420,2.3,'#e86a82')+plum(560,1500,2,'#f29aaa');
   for(var pt=0;pt<36;pt++)s+='<ellipse cx="'+rnd0(900,pt*41)+'" cy="'+rnd0(1600,pt*97)+'" rx="6" ry="3.5" fill="#f29aaa" opacity=".75" transform="rotate('+(pt*31)+' '+rnd0(900,pt*41)+' '+rnd0(1600,pt*97)+')"/>';}
  d+='</defs>';
  var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600" preserveAspectRatio="xMidYMid slice">'+d+s+'</svg>';
  ART.cache[key]=svg;return svg;
 };
 function rnd0(m,k){return Math.abs((k*9301+49297)%233280)/233280*m|0;}
 /* 女主角 */
 window.HEROINE={n:'女主角',look:{hair:'#2a1c1c',hair2:'#5a3a3a',robe:'#f6e6e8',robe2:'#d8607a',trim:'#d4a84a',eye:'#7a4a3a',skin:'#fbe8de',style:'buns',len:'long'}};
 /* 取得圖：回傳 HTML（優先圖檔） */
/* 背景圖焦點（直向畫面 object-fit:cover 只見約 26% 闊度；值為 object-position x%） */
 /* 立繪臉部中心（圖寬%、圖高%）：用來令臉置中、圖鑑卡裁切 */
 ART.FACE={yingzheng:[42,32],mengtian:[41,27],lisi:[44,29],fusu:[42,31],hanfei:[44,29],jingke:[44,29],xuanye:[37,27],heroine:[66,20],heroine_m:[50,27]};
 ART.BGPOS={clinic:66,palace:50,plum:43,market:43,camp:66,night:39,study:57,tavern:74,title:77};
 ART.html=function(kind,id,expr){
  var key=kind==='bg'?'bg_'+id:(kind==='cg'?'cg_'+id:'char_'+id+(expr&&expr!=='normal'?'_'+expr:''));
  var f=ART.file(key)||(kind==='char'?ART.file('char_'+id):'');
  if(f)return '<img src="'+f+'" alt="" draggable="false"'+(kind==='bg'?' style="object-position:'+(ART.BGPOS[id]!=null?ART.BGPOS[id]:50)+'% 50%"':(kind==='char'?' class="pimg" style="--fx:'+(ART.FACE[id]||[50])[0]+'%;--fy:'+(ART.FACE[id]||[0,30])[1]+'%"':''))+'>';
  if(kind==='cg'){var hc=ART.cgImg(id);if(hc)return hc;}
  var svg=kind==='bg'?ART.bg(id):(kind==='cg'?ART.cg(id):ART.portrait(id,expr));
  return ART.uniq(svg);
 };
 /* 頭像：優先 face_<id>（由立繪裁頭部），其次立繪頂部，最後 SVG */
 ART.face=function(id,expr){var f=ART.file('face_'+id);if(f)return '<img src="'+f+'" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover">';f=ART.file('char_'+id);if(f)return '<img src="'+f+'" alt="" style="width:100%;height:100%;object-fit:cover;object-position:45% 8%">';return ART.uniq(ART.portrait(id,expr).replace('viewBox="0 0 600 900" preserveAspectRatio="xMidYMax meet"','viewBox="190 200 220 220" preserveAspectRatio="xMidYMid slice"'));};
 ART.seq=0;ART.uniq=function(svg){var n=++ART.seq;return String(svg).replace(/id="([^"]+)"/g,'id="$1_'+n+'"').replace(/url\(#([^)]+)\)/g,'url(#$1_'+n+')');};
 /* CG：背景＋角色近景＋光暈花瓣＋金框 */
 ART.cgInfo=function(cgid){
  var who='',i;for(var k in CGS){for(i=0;i<CGS[k].length;i++)if(CGS[k][i].id===cgid){who=k;}}
  var nIdx=cgid.slice(-1)|0;if(!CHARS[who])return null;
  var bgk={yingzheng:['night','palace','night'],mengtian:['market','camp','plum'],lisi:['plum','study','plum'],fusu:['study','study','plum'],hanfei:['study','night','study'],jingke:['tavern','tavern','night'],xuanye:['night','night','plum']}[who][nIdx-1]||'plum';
  return {who:who,bgk:bgk,ex:['normal','smile','blush'][nIdx-1]||'smile'};
 };
 /* 有正式背景＋立繪時，CG 佔位改用圖檔合成（仍屬佔位，正式 cg_*.webp 放入即取代） */
 ART.cgImg=function(cgid){
  var o=ART.cgInfo(cgid);if(!o)return '';var b=ART.file('bg_'+o.bgk),p=ART.file('char_'+o.who),h=ART.file('char_heroine');if(!b||!p||!h)return '';
  return '<div class="cgc" style="--cgc:'+CHARS[o.who].col+'"><img class="cb" src="'+b+'" alt="" draggable="false" style="object-position:'+(ART.BGPOS[o.bgk]!=null?ART.BGPOS[o.bgk]:50)+'% 50%"><i class="ct"></i><img class="cp" src="'+p+'" alt="" draggable="false" style="--fx:'+(ART.FACE[o.who]||[50])[0]+'%"><img class="ch" src="'+h+'" alt="" draggable="false"><i class="cv"></i></div>';
 };
 ART.cg=function(cgid){
  var o=ART.cgInfo(cgid);if(!o)return '';var who=o.who,bgk=o.bgk,ex=o.ex,c=CHARS[who];
  var bgs=ART.bg(bgk).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  var por=ART.portrait(who,ex).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  var hp=ART.portrait('heroine','blush').replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600" preserveAspectRatio="xMidYMid slice"><g>'+bgs+'</g><rect width="900" height="1600" fill="'+c.col+'" opacity=".18"/>'
   +'<g transform="translate(-160 360) scale(1.25)" opacity=".96">'+hp+'</g><g transform="translate(240 160) scale(1.45)">'+por+'</g>'
   +'<radialGradient id="cgv" cx=".5" cy=".45" r=".7"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a0e14" stop-opacity=".55"/></radialGradient><rect width="900" height="1600" fill="url(#cgv)"/>'
   +'<rect x="24" y="24" width="852" height="1552" fill="none" stroke="#d4a84a" stroke-width="4"/><rect x="38" y="38" width="824" height="1524" fill="none" stroke="#d4a84a" stroke-width="1.5" opacity=".7"/></svg>';
 };
})();
