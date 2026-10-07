/* v4.1「對X說」交談面板：話題方向＋態度＋自由輸入 → AI（離線規則） */
var Say={st:{id:'',topic:'free',att:'',text:''}};
Say.TOPICS=[['free','自由輸入','直接說出你真正想說的話'],['praise','美言','替某人說好話'],['accuse','告狀','揭發某人的不是'],['ask','求封','求官職、封賞或差事'],['adopt','過繼','請求收養或過繼子嗣'],['recommend','舉薦','推薦賢才'],['medic','求醫','請對方診治或求藥'],['learn','請教','向對方討教學問'],['love','表白','傾吐心意']];
Say.ATTS=['嫵媚','諂媚','大膽','誠實','溫柔','正直','緊張','俏皮','清冷','裝傻','含羞','撒嬌','撩撥','調情','主動','熱切','勾引'];
Say.EX={free:['今日天色正好，想與你說幾句話。','近來心裡有些事，不知當講不當講。','多謝你那日照拂。'],praise:['李斯大人處事公允，實乃社稷之福。','蒙將軍治軍嚴明，士卒無不歸心。'],accuse:['趙高近來行跡可疑，恐有不軌。','那藥鋪掌櫃以次充好，害了好幾條人命。'],ask:['願入太醫署效力，為大王分憂。','懇請賜我一間醫館，濟世救人。'],adopt:['那孤兒無依無靠，我想收他為子。','願將次子過繼給叔父承嗣。'],recommend:['城南有位老醫，醫術在我之上。','我有一位同鄉，熟讀律令，可堪一用。'],medic:['近日夜咳不止，想請你看看。','家母頭風又犯了，可有良方？'],learn:['請問這味藥為何要與甘草同煎？','想向你討教兵法中的虛實之道。'],love:['我心悅你，已非一日。','若有來世，我仍想遇見你。']};
/* 稱呼：主角口中對 NPC 的稱謂 */
Say.addr=function(id){var p=P(id);if(!p)return '';var t=p.title||'';if(/王$/.test(t)&&id==='yingzheng')return '大王';if(/將軍|尉/.test(t))return '將軍';if(/公子|太子/.test(t))return '公子';if(/丞相|廷尉|大人|令|卿/.test(t))return '大人';return p.n;};
Say.ok=function(id){var p=P(id);return !!(p&&p.alive&&id!==S.pc&&ageOf(p)>=4);};
Say.open=function(id){Say.st={id:id,topic:'free',att:'',text:''};Sh.open('對'+Say.addr(id)+'說',null,Say.render);$('sheet').classList.add('say');Say.fit();setTimeout(function(){var t=$('sayT');if(t&&!Say.touch())t.focus();},50);};
Say.touch=function(){return 'ontouchstart' in window;};
Say.render=function(){var s=Say.st,id=s.id,T=Say.TOPICS.filter(function(t){return t[0]===s.topic;})[0];var ex=(Say.EX[s.topic]||Say.EX.free).map(function(x){return '<button class="sayEx" data-act="sayEx" data-v="'+esc(x)+'">'+esc(x)+'</button>';}).join('');
 return '<div class="sayBox"><div class="sayH">話題方向</div><button class="sayFree'+(s.topic==='free'?' on':'')+'" data-act="sayTp" data-v="free"><b>自由輸入</b><small>直接說出你真正想說的話</small></button>'
 +'<div class="sayChips">'+Say.TOPICS.slice(1).map(function(t){return '<button class="'+(s.topic===t[0]?'on':'')+'" data-act="sayTp" data-v="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'
 +'<div class="sayH">你想對'+esc(Say.addr(id))+'說什麼'+(s.topic!=='free'?'（'+T[1]+'：'+T[2]+'）':'')+'</div><textarea id="sayT" rows="3" maxlength="200" placeholder="'+esc((Say.EX[s.topic]||Say.EX.free)[0])+'">'+esc(s.text)+'</textarea>'
 +'<div class="sayExs">示例：'+ex+'</div></div>'
 +'<div class="sayBox"><div class="sayH">態度 <small>（可不選）</small></div><div class="sayChips att">'+Say.ATTS.map(function(a){return '<button class="'+(s.att===a?'on':'')+'" data-act="sayAt" data-v="'+a+'">'+a+'</button>';}).join('')+'</div></div>'
 +'<div class="sayGo"><button class="btn" data-act="sayX">取消</button><button class="btn pri" data-act="saySend">說出口</button></div>';};
Say.keep=function(){var t=$('sayT');if(t)Say.st.text=t.value;};
Say.fit=function(){var v=window.visualViewport,e=$('sheet');if(!e)return;e.style.height='';if(v&&e.classList.contains('say')&&v.height<window.innerHeight-80){e.style.bottom='auto';e.style.height=Math.round(v.height+v.offsetTop)+'px';}else e.style.bottom='';};/* 鍵盤彈出時縮到可見區 */
if(window.visualViewport)window.visualViewport.addEventListener('resize',Say.fit);
document.addEventListener('focusin',function(e){if(e.target&&e.target.id==='sayT')setTimeout(function(){try{e.target.scrollIntoView({block:'center'});}catch(x){}},250);});
Panels.act.sayTp=function(v){Say.keep();Say.st.topic=v;Sh.redraw();};
Panels.act.sayAt=function(v){Say.keep();Say.st.att=Say.st.att===v?'':v;Sh.redraw();};
Panels.act.sayEx=function(v){Say.st.text=v;var t=$('sayT');if(t)t.value=v;};
Panels.act.sayX=function(){$('sheet').classList.remove('say');$('sheet').style.height='';$('sheet').style.bottom='';Sh.close();};
Panels.act.saySend=function(){Say.keep();var s=Say.st;var tx=s.text.trim()||(s.topic!=='free'?(Say.EX[s.topic]||[''])[0]:'');if(!tx){toast('先寫下想說的話');return;}Panels.act.sayX();UI.go('say',{id:s.id,topic:s.topic,att:s.att,text:tx});};
/* 規則：方向×態度×性格×關係 → 好感／信任變化 */
Say.TN=function(k){var t=Say.TOPICS.filter(function(x){return x[0]===k;})[0];return t?t[1]:'自由輸入';};
Say.GOOD={溫和:['溫柔','誠實','含羞'],正直:['誠實','正直'],精明:['誠實','主動'],多疑:['誠實','正直'],開朗:['俏皮','熱切','大膽'],暴躁:['大膽','正直'],刻薄:['清冷','裝傻'],狡猾:['俏皮','裝傻','諂媚'],仗義:['大膽','正直','熱切'],熱心:['溫柔','熱切'],沉默:['清冷','溫柔'],膽小:['溫柔','含羞'],貪財:['諂媚']};
Say.BAD={正直:['諂媚','勾引','撩撥'],多疑:['諂媚','撩撥','裝傻'],刻薄:['撒嬌','熱切'],沉默:['大膽','熱切','俏皮'],暴躁:['裝傻','撒嬌'],精明:['裝傻','諂媚']};
Say.FLIRT=['嫵媚','撩撥','調情','勾引','撒嬌'];
Say.rule=function(a){var p=P(a.id),me=pc();var pers=p.pers||[],att=a.att,d={aff:0,trust:0,love:0},why=[];
 var good=pers.some(function(t){return (Say.GOOD[t]||[]).indexOf(att)>=0;}),bad=pers.some(function(t){return (Say.BAD[t]||[]).indexOf(att)>=0;});
 if(good){d.aff+=3;why.push('合其脾性');}if(bad){d.aff-=3;d.trust-=1;why.push('不合其脾性');}
 var close=p.aff>=40,trust=p.trust>=30;
 if(Say.FLIRT.indexOf(att)>=0){if(p.love>=20||(close&&ageOf(me)>=16)){d.love+=3;d.aff+=1;}else{d.aff-=2;d.trust-=2;why.push('交情未到');}if(Gender.on()&&!Gender.knows(a.id))d.trust-=1;}
 var T=a.topic;if(T==='praise'||T==='recommend'){if(trust){d.trust+=2;}else{d.trust-=1;why.push('交情淺，舉薦難信');}}
 else if(T==='accuse'){if(trust)d.trust+=1;else{d.trust-=3;d.aff-=1;why.push('疑你挑撥');}}
 else if(T==='ask'||T==='adopt'){if(p.aff>=55&&p.trust>=45){d.trust+=1;why.push('願意考慮');}else{d.aff-=1;why.push('時機未到');}}
 else if(T==='medic'||T==='learn'){d.aff+=2;d.trust+=1;}
 else if(T==='love'){if(p.love>=30){d.love+=5;d.aff+=2;}else{d.aff-=1;d.love+=1;why.push('對方一時怔住');}}
 else{d.aff+=1;}
 if(att==='誠實'||att==='正直')d.trust+=1;if(att==='緊張'||att==='含羞')d.aff+=1;
 for(var k in d)d[k]=clamp(d[k],-6,6);return {d:d,why:why};};
Say.REPLY={pos:['{n}聽罷，神色和緩了些：「你這番話，我記下了。」','{n}微微頷首：「難得你肯同我說這些。」','{n}笑了：「你倒是有趣。」'],neg:['{n}眉頭一皺：「這話，你最好別再說第二遍。」','{n}淡淡看你一眼，沒有接話。','{n}冷聲道：「你當我是什麼人？」'],mid:['{n}沉吟片刻：「此事容後再議。」','{n}「嗯」了一聲，似在思量。']};
Say.diffStr=function(d){var N={aff:'好感',trust:'信任',love:'情意'},o=[];for(var k in N)if(d[k])o.push(N[k]+(d[k]>0?'+':'')+d[k]);return o.join('　');};
Say.snap=function(id){var p=P(id);return {aff:p.aff,trust:p.trust,love:p.love||0};};
Say.delta=function(b,id){var a=Say.snap(id),d={};for(var k in a)d[k]=Math.round(a[k]-b[k]);return d;};
Say.line=function(a){return '你'+(a.att?'（'+a.att+'）':'')+'對'+Say.addr(a.id)+'說：「'+a.text+'」';};
NODES.say=function(a){var p=P(a.id);if(!p||!p.alive)return NODES.place();S.focus=a.id;People.meet(a.id);Eng.keep(a.id);
 var off=function(){var b=Say.snap(a.id);var r=Say.rule(a);People.rel(a.id,r.d,'say');var sum=r.d.aff+r.d.trust+r.d.love;var R=Say.REPLY[sum>1?'pos':sum<0?'neg':'mid'];var L=[[S.pc,Say.line(a)],[a.id,pick(R).replace('{n}','').replace(/^：/,'')]];
  var dd=Say.delta(b,a.id);var ds=Say.diffStr(dd);L.push('（'+cn(a.id)+'：'+(ds||'無變化')+(r.why.length?'｜'+r.why.join('、'):'')+'）');People.note&&People.note(a.id,'主角對我'+Say.TN(a.topic)+'：'+a.text.slice(0,30));Eng.pass(1);
  return Eng.L(L,a.id,S.place,NODES.talkCh(a.id));};
 if(AI.ready()&&!a.off){S.flags.sayCtx={b:Say.snap(a.id),id:a.id,d:S.day};return {async:{type:'say',id:a.id,topic:Say.TN(a.topic),att:a.att,text:a.text},fb:off};}return off();};
/* AI 結果：限幅並顯示變化 */
(function(){var op=AI.post;AI.post=function(r,a){if(a&&a.type==='say'&&r.fx&&r.fx.ppl){for(var id in r.fx.ppl){var o=r.fx.ppl[id];for(var k in o)o[k]=clamp(+o[k]||0,-8,8);}}var b=a&&a.type==='say'?Say.snap(a.id):null;var sc=op(r,a);
 if(b&&sc&&sc.lines){var ds=Say.diffStr(Say.delta(b,a.id));sc.lines.unshift({sp:S.pc,t:Say.line(a)});sc.lines.push({sp:'',t:'（'+cn(a.id)+'：'+(ds||'無變化')+'）'});if(People.note)People.note(a.id,'主角對我'+a.topic+'：'+a.text.slice(0,30));}return sc;};})();
(function(){var ot=NODES.talkCh;NODES.talkCh=function(id){var c=ot(id);if(Say.ok(id))c.splice(0,0,ch('🗣 對'+Say.addr(id)+'說…','sayOpen',{id:id}));return c;};})();
NODES.sayOpen=function(a){setTimeout(function(){Say.open(a.id);},60);return Eng.L([[a.id,'（'+cn(a.id)+'看著你，等你開口。）']],a.id,S.place,NODES.talkCh(a.id));};
(function(){var o=Sh.open;Sh.open=function(){var e=$('sheet');e.classList.remove('say');e.style.height='';e.style.bottom='';return o.apply(this,arguments);};})();
