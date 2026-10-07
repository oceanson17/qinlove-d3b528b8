/* ===== 女扮男裝（v4）：開局／遊戲中換裝、識破機率與事件（診症、受傷、沐浴、親近）、主動坦白、心動反應、立繪切換 ===== */
(function(){
 if(ART.FACE&&ART.FACE.heroine&&!ART.FACE.heroine_m)ART.FACE.heroine_m=ART.FACE.heroine;
 Gender.syncArt=function(){var me=pc();if(!me||me.portrait.indexOf('heroine')!==0)return;var m=Gender.on()&&S.disg.as==='m';me.portrait=m&&ART.file('char_heroine_m')?'heroine_m':'heroine';};
 var os=Gender.start;Gender.start=function(as){if(S.disg&&S.disg.fid&&FW.byId(S.disg.fid)){S.disg.on=1;S.disg.as=as;S.disg.since=S.day;}else os(as);S.disg.kit=1;Gender.syncArt();};
 /* 換裝：w＝要穿的性別衣裳 */
 Gender.wear=function(w){var me=pc();var L=[];if(w===me.g){if(!Gender.on())return '你本來就是這身打扮。';var f=FW.byId(S.disg.fid);var seen=People.present().filter(function(id){return P(id).met&&f&&f.kn.indexOf(id)<0&&!f.pub;});S.disg.on=0;Gender.syncArt();
   L.push('你解開束胸，換回'+(me.g==='f'?'女':'男')+'裝，長髮放了下來。');seen.forEach(function(id){Gender.learn(id,'see');L.push(P(id).n+'看著你，愣住了——原來那位「'+(S.disg.as==='m'?'公子':'姑娘')+'」……');});addLog('〔易裝〕換回'+(me.g==='f'?'女':'男')+'裝','秘');return L.join('\n');}
  if(Gender.on())return '你已經是'+(w==='m'?'男':'女')+'裝打扮。';if(!(S.disg&&S.disg.kit)&&!Inv.has('cloth'))return '易裝至少要一匹布（市集有賣）。';if(!(S.disg&&S.disg.kit))Inv.add('cloth',-1);Gender.start(w);return '你束起長髮、壓低嗓音，換上'+(w==='m'?'男':'女')+'子衣裳。從現在起，不知情的人會叫你「'+(w==='m'?'公子':'姑娘')+'」。';};
 /* 私下得知（不公開；好感不差者自動守秘） */
 Gender.learn=function(id,how){var f=S.disg&&FW.byId(S.disg.fid);if(!f||f.kn.indexOf(id)>=0)return false;FW.learn(id,f.id,100,how==='told'?'told':'witness');var p=P(id);if(p&&p.aff>-20){f.seal=f.seal||{};f.seal[id]=1;}S.disg.exp=(S.disg.exp||0)+1;addLog('〔易裝〕'+cn(id)+'知道了你的真實性別','秘');if(p&&p.kind==='named')Nom.add(id,'得知'+pc().n+'其實是'+(pc().g==='f'?'女子':'男子'),'secret');return true;};
 Gender.expose=function(by){if(!S.disg)return;var f=FW.byId(S.disg.fid);if(by)Gender.learn(by,'see');S.disg.on=0;if(f)FW.goPublic(f,by?'與'+cn(by)+'有關':'主動公開');addLog('〔易裝〕身分公開','秘');Gender.syncArt();Fam.tierCalc();};
 /* 識破機率 */
 Gender.RISK={med:0.45,hurt:0.3,bath:0.6,close:0.22,notice:0.08};
 Gender.risk=function(id,kind){if(!Gender.on()||!id||Gender.knows(id))return false;var p=P(id);if(!p||!p.alive)return false;var r=Gender.RISK[kind]||0.1;r+=((p.at&&p.at.wit)||10)/100;if(p.pers.indexOf('多疑')>=0||p.pers.indexOf('精明')>=0)r+=0.1;if(S.disg.since&&S.day-S.disg.since<2)r*=0.5;
  if(rand()<r){if(!S.queue.some(function(q){return q.go==='disgExpose';}))S.queue.push({go:'disgExpose',a:{id:id,k:kind},stop:1});return true;}return false;};
 Gender.REACT={yingzheng:['（沉默良久）「欺君。」他忽然笑了，「……寡人倒想看看，你還藏著什麼。」',{love:4,trust:-3}],mengtian:['「難怪你的手那麼小！我、我之前還跟你勾肩搭背……」他整張臉都紅透了。',{love:6,aff:3}],lisi:['「我早猜到幾分。放心，這種秘密，我比你更懂得怎麼收好。」',{trust:4,love:2}],fusu:['「你一個人扛了這麼久……辛苦了。往後在我面前，不必再裝。」',{love:5,trust:5}],hanfei:['他提筆寫了幾個字遞給你：「我，不會說。你，很勇敢。」',{love:4,trust:4}],jingke:['「哈！妙極！這天下能騙過我荊軻的，你是頭一個！」他舉起酒罈，「該罰三杯——罰我自己！」',{love:4,aff:4}],xuanye:['「……我一直知道。」面具下的聲音很輕，「從你第一次替我縫傷的時候。」',{love:5,trust:3}]};
 Gender.react=function(id){var p=P(id);var R=Gender.REACT[id];if(R&&(Rom.stage(id)>0||p.love>0||p.aff>=25)){People.rel(id,R[1],'得知'+pc().n+'的真實性別');Bond.apply(id,{e:{震驚:4,愛慕:R[1].love||0},th:'原來'+pc().n+'是'+(pc().g==='f'?'女子':'男子')});return [[id,pc().g==='f'?R[0]:'（他怔了很久）「……原來如此。我不會說出去。」']];}
  if(p.kind==='named')return [[id,'「……原來如此。」']];return [];};
 var KT={med:'替你解開衣襟查看傷勢時，'+'手停在了半空。',hurt:'扶你起來時，碰到了你束得緊緊的胸口。',bath:'推門進來時，你正散著長髮在水邊梳洗。',close:'靠得太近了——近得能看清你喉間沒有喉結、耳垂上那個早已癒合的耳洞。',notice:'盯著你的喉頭和手腕，眼神從疑惑變成了震驚。'};
 NODES.disgExpose=function(a){var p=P(a.id);if(!p||!Gender.on()||Gender.knows(a.id))return NODES.place();var me=pc();var k=a.k||'notice';
  return Eng.L([p.n+KT[k],[a.id,'「你……'+(me.g==='f'?'你是女子？':'你是男子？')+'」']],a.id,S.place,[ch('🙏 求'+ta(p)+'替我保密','dxDo',{id:a.id,k:'beg'}),ch('🤫 坦白一切，只告訴'+ta(p),'dxDo',{id:a.id,k:'confide'}),ch('📢 索性公開，不再隱瞞','dxDo',{id:a.id,k:'admit'}),ch('😠 威脅'+ta(p)+'閉嘴','dxDo',{id:a.id,k:'threat'})]);};
 NODES.dxDo=function(a){var p=P(a.id);var L=[];
  if(a.k==='beg'){Gender.learn(a.id,'see');People.rel(a.id,{trust:3});L.push([a.id,'「……我什麼也沒看見。」']);L=L.concat(Gender.react(a.id));}
  else if(a.k==='confide'){Gender.learn(a.id,'told');People.rel(a.id,{trust:6,aff:3},pc().n+'對'+ta(p)+'說了真話');L.push('你把一切原原本本告訴了'+p.n+'。');L=L.concat(Gender.react(a.id));}
  else if(a.k==='admit'){Gender.expose(a.id);L.push('消息傳開了。有人驚嘆，有人非議'+(S.world==='male'&&pc().g==='f'?'：「女人也敢……」':'。'));L=L.concat(Gender.react(a.id));}
  else{Gender.learn(a.id,'see');People.rel(a.id,{aff:-10,trust:-8});Bond.apply(a.id,{e:{怨恨:8,戒備:10}});var f=FW.byId(S.disg.fid);if(f&&f.seal)delete f.seal[a.id];L.push(p.n+'臉色發白，點了點頭。但你知道，這根刺埋下了。');}
  return Eng.L(L,a.id,S.place,[ch('繼續','place')]);};
 NODES.dxTell=function(a){var p=P(a.id);Gender.learn(a.id,'told');People.rel(a.id,{trust:5},pc().n+'主動坦白真實性別');return Eng.L(['你深吸一口氣，對'+p.n+'說出了真相：你其實是'+(pc().g==='f'?'女子':'男子')+'。'].concat(Gender.react(a.id)),a.id,S.place,[ch('繼續','place')]);};
 NODES.wear=function(a){return Eng.L([Gender.wear(a.g)],'',S.place,[ch('繼續','place')]);};
 NODES.bath=function(){Eng.pass(1);var me=pc();me.mood=clamp(me.mood+6,0,100);if(Ill.has(me,'blister'))Ill.cure(me,'blister',1);var w=People.present().filter(function(id){return P(id).met&&!Gender.knows(id);});
  if(Gender.on()&&w.length&&Gender.risk(pick(w),'bath'))return NODES.disgExpose(S.queue.pop().a);return Eng.L(['你閂上門，好好洗去了一身塵土。'+(Gender.on()?'束胸布解開的那一刻，你長長吐了一口氣。':'')],'',S.place,[ch('繼續','place')]);};
 /* 掛鉤：親近（心動章節）、受傷／毒發／病倒時被扶 */
 var ord=NODES.romDo;NODES.romDo=function(a){var r=ord(a);if(Gender.on())Gender.risk(a.id,'close');return r;};
 ['collapse','antiFit','aflFit'].forEach(function(n){var o=NODES[n];if(!o)return;NODES[n]=function(a){var r=o(a);if(Gender.on()&&r&&r.focus)Gender.risk(r.focus,n==='collapse'?'hurt':'med');return r;};});
 var otc=NODES.talkCh;NODES.talkCh=function(id){var c=otc(id);if(Gender.on()&&!Gender.knows(id)&&P(id)&&P(id).trust>=20)c.splice(Math.max(0,c.length-1),0,ch('🤫 坦白真實性別','dxTell',{id:id}));return c;};
 var oacts=Place.acts;Place.acts=function(){var c=oacts.apply(this,arguments);var me=pc();var priv=Eng.atHome()||S.place==='lodge'||S.place==='river';if(me.alive&&me.g==='f'&&ageOf(me)>=12&&priv){if(Gender.on())c.splice(Math.max(0,c.length-1),0,ch('👘 換回女裝','wear',{g:'f'}));else if(S.disg&&S.disg.kit||Inv.has('cloth'))c.splice(Math.max(0,c.length-1),0,ch('🎭 換上男裝','wear',{g:'m'}));}
  if(me.alive&&priv&&S.region!=='road')c.splice(Math.max(0,c.length-1),0,ch('🛁 沐浴','bath'));return c;};
})();
