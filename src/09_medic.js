/* ===== 問診小遊戲：望聞問切 → 辨證 → 處方 ===== */
var Med={cur:null};
(function(){
 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1);var t=a[i];a[i]=a[j];a[j]=t;}return a;}
 Med.open=function(o){var d,who=o.who||'';if(who){var c=CURE[who];d={p:CHARS[who].n+'（'+CHARS[who].ail+'）',sym:c.sym,dx:c.dx,wrong:c.wrong,rx:c.rx,rxw:c.rxw};}else d=CASES[o.ci];
  Med.cur={d:d,who:who,ci:o.ci,rev:[],struck:'',step:'look',dxOk:null,rxOk:null,dxOpts:shuffle([d.dx].concat(d.wrong)),rxOpts:shuffle([d.rx].concat(d.rxw))};
  if(S.p.med>=25)Med.cur.rev.push(0);
  $('med').className='sheet med on';$('mdT').textContent=who?'為'+CHARS[who].n+'診治':'坐診問診';Med.draw();};
 Med.draw=function(){var m=Med.cur,d=m.d;if(!m)return;var who=m.who;
  var h='<div class="pat"><div class="pav">'+(who?ART.html('char',who,'normal'):'🧓')+'</div><div><b style="font-size:17px">'+esc(d.p)+'</b><div class="note">'+(who?'他把手腕遞給你。':'等著你診治。')+'　醫術 '+S.p.med+'</div></div></div>';
  if(m.step==='done'){var sc=(m.dxOk?1:0)+(m.rxOk?1:0)+(m.rev.length>=4?1:0);m.score=sc;var ok=who?(m.dxOk&&m.rxOk):sc>=2;m.ok=ok;
   h+='<div class="mres"><div class="stamp">'+(sc>=3?'妙手回春':(ok?'藥到病除':'尚欠火候'))+'</div><div class="note">辨證 '+(m.dxOk?'✔':'✘ 應為「'+esc(d.dx)+'」')+'　處方 '+(m.rxOk?'✔':'✘ 應為「'+esc(d.rx)+'」')+'</div></div><div class="opts"><button class="cbtn" id="mdDone">收起藥箱</button></div>';}
  else{h+='<h4>四診</h4><div class="four">'+['望','聞','問','切'].map(function(x,i){return '<button data-four="'+i+'" class="'+(m.rev.indexOf(i)>=0?'done':'')+'">'+x+'</button>';}).join('')+'</div>';
   h+='<div class="sym">'+m.rev.map(function(i){return i<3?'<span>'+esc(d.sym[i])+'</span>':'<span>脈象：可排除「'+esc(m.struck)+'」</span>';}).join('')+(m.rev.length?'':'<span class="note" style="border:0;background:none">輕觸四診收集症狀（至少兩項）</span>')+'</div>';
   if(m.rev.length>=2&&m.step==='look')h+='<h4>辨證</h4><div class="opts">'+m.dxOpts.map(function(x){return '<button class="cbtn'+(x===m.struck?' lock':'')+'" data-dx="'+esc(x)+'">'+esc(x)+'</button>';}).join('')+'</div>';
   if(m.step==='rx')h+='<h4>處方</h4><div class="opts">'+m.rxOpts.map(function(x){return '<button class="cbtn" data-rx="'+esc(x)+'">'+esc(x)+'</button>';}).join('')+'</div>';}
  $('mdB').innerHTML=h;};
 Med.four=function(i){var m=Med.cur;if(!m||m.rev.indexOf(i)>=0)return;if(i===3){m.struck=m.d.wrong[rnd(m.d.wrong.length)];}m.rev.push(i);Med.draw();};
 Med.dx=function(x){var m=Med.cur;m.dxOk=x===m.d.dx;m.step='rx';Med.draw();};
 Med.rx=function(x){var m=Med.cur;m.rxOk=x===m.d.rx;m.step='done';Med.draw();};
 Med.close=function(){var m=Med.cur;$('med').className='sheet med';Med.cur=null;if(!m)return;if(m.who)UI.go('cureDone',{id:m.who,ok:!!m.ok});else UI.go('diagDone',{ci:m.ci,score:m.score||0});};
 Med.bind=function(){$('mdB').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a;
  if((a=b.getAttribute('data-four'))!==null)Med.four(+a);else if((a=b.getAttribute('data-dx'))!==null)Med.dx(a);else if((a=b.getAttribute('data-rx'))!==null)Med.rx(a);else if(b.id==='mdDone')Med.close();});};
})();
