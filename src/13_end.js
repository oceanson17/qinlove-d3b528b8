/* ===== 結局：12 個固定結局＋AI／模板獨特結局、結局冊（跨存檔）、傳承 ===== */
var End={};
End.FIXED={
 he_zheng:{t:'鳳棲章台',type:'HE',who:'yingzheng',c:function(){return pc().spouse==='yingzheng';},txt:'冷峻的君王身邊，終於有了一個敢對他說「躺下，我替你聽聽心肺」的人。'},
 he_meng:{t:'北原長歌',type:'HE',who:'mengtian',c:function(){return pc().spouse==='mengtian';},txt:'北疆的風很大。軍醫帳裡的燈，為一個人亮了很多年。'},
 he_li:{t:'梅骨',type:'HE',who:'lisi',c:function(){return pc().spouse==='lisi';},txt:'算盡天下人心的人，在梅樹下輸了一局棋，也輸了一顆心。'},
 he_fu:{t:'仁者春風',type:'HE',who:'fusu',c:function(){return pc().spouse==='fusu';},txt:'他畏寒，你便做他的手爐；他愛民，你便做他的醫者。'},
 he_han:{t:'同著一書',type:'HE',who:'hanfei',c:function(){return pc().spouse==='hanfei';},txt:'那部書的扉頁上，並排寫著兩個名字。'},
 he_jing:{t:'易水不寒',type:'HE',who:'jingke',c:function(){return pc().spouse==='jingke';},txt:'他沒有去易水。他留在了有你的地方。'},
 hid_ye:{t:'影歸',type:'隱藏',who:'xuanye',c:function(){return pc().spouse==='xuanye';},txt:'影子有了名字，也有了想回去的家。'},
 be_harem:{t:'深宮鎖',type:'BE',who:'yingzheng',c:function(){return !!S.flags.harem&&(pc().spouse!==S.flags.harem||!alive(S.flags.harem));},txt:'宮牆很高。你的醫箱，再也沒有打開過。'},
 be_yun:{t:'雲陽獄',type:'BE',who:'hanfei',c:function(){var h=P('hanfei');return h&&!h.alive&&h.met&&h.aff>=30&&!S.hist.hanfeiSaved;},txt:'你終究沒能把那碗解毒湯送進雲陽獄。'},
 be_feng:{t:'風蕭蕭',type:'BE',who:'jingke',c:function(){var j=P('jingke');return j&&!j.alive&&j.met&&j.aff>=40;},txt:'風蕭蕭兮易水寒。他走的那天，你在咸陽城頭站到天黑。'},
 ne_doc:{t:'懸壺濟世',type:'NE',who:'',c:function(){return S.stats.cure>=25||(S.fam.clinic.open&&S.stats.cure>=12);},txt:'你沒有改變天下，但城南的百姓記得：生病了，就去找那位用針線的大夫。'},
 hid_god:{t:'天下名醫',type:'隱藏',who:'',c:function(){return pc().sk.med>=90&&S.fam.fame>=80;},txt:'千百年後，醫書上仍有你的名字。'}
};
End.KN={confessOk:'告白成功',confessNo:'告白失敗',marry:'結婚',death:'主角辭世',lineEnd:'傳代斷絕',choice:'結束這一生'};
End.matchFixed=function(){var r=[];for(var k in End.FIXED){try{if(End.FIXED[k].c())r.push(k);}catch(e){}}return r;};
/* 人生摘要（給 AI 與模板用） */
End.life=function(ctx){var me=pc(),L=[];var sp=P(me.spouse);var kids=me.kids.map(P).filter(Boolean);
 L.push('主角：'+me.n+'（'+(me.g==='f'?'女':'男')+'，'+ageOf(me)+'歲'+(me.alive?'':'，已辭世：'+(ctx&&ctx.why||''))+'）；第'+S.fam.gen+'代；'+Fam.name()+'；家族等級'+TIERS[Fam.tier()].n+'；名聲'+S.fam.fame+'；'+(me.title||JOBS[me.job]||'')+(me.office?'，'+OFFICE[me.office]:'')+(me.medoff?'，'+MEDOFF[me.medoff]:'')+'；醫術'+me.sk.med+'；行醫'+S.stats.pat+'人、治癒'+S.stats.cure+'人、病逝'+S.stats.dead+'人。');
 L.push('婚姻：'+(sp?sp.n+(sp.alive?'':'（已故）'):'未婚')+'；子女：'+(kids.map(function(k){return k.n+(k.alive?'':'（夭）');}).join('、')||'無'));
 var rel=Object.keys(S.ppl).filter(function(id){var p=S.ppl[id];return id!==S.pc&&p.met&&(Math.abs(p.aff)>=30||p.love>=30);}).sort(function(a,b){return (P(b).aff+P(b).love)-(P(a).aff+P(a).love);}).slice(0,6);
 L.push('重要的人：'+rel.map(function(id){var p=P(id);return p.n+'('+id+'｜好感'+p.aff+' 情意'+(p.love||0)+(p.alive?'':'｜已故')+'｜記憶：'+Nom.brief(id).slice(0,80)+')';}).join('；'));
 L.push('人生大事：'+S.log.filter(function(l){return /〔(婚|家|醫館|身分|喪|師|身世)〕/.test(l.t);}).slice(-10).map(function(l){return l.t;}).join('；'));
 L.push('天下大事：'+S.wev.maj.slice(-8).map(function(m){return m.t;}).join('；'));
 var sec=FW.secretsOf().map(function(f){return f.t+'（知情者：'+(f.kn.filter(function(x){return x!==S.pc;}).map(cn).join('、')||'無')+'）';});if(sec.length)L.push('秘密：'+sec.join('；'));
 if(S.origin&&S.origin.goal)L.push('心願：'+S.origin.goal);return L.join('\n');};
/* 模板結局 */
End.tpl=function(kind,ctx){var me=pc();var sp=P(me.spouse);var kids=me.kids.map(P).filter(function(k){return k&&k.alive;});var fx=End.matchFixed();var F=fx.length?End.FIXED[fx[0]]:null;var t=ctx&&ctx.id?P(ctx.id):null;
 var type=kind==='confessNo'||kind==='lineEnd'?'BE':(kind==='marry'||kind==='confessOk'?'HE':(F?F.type:(S.stats.cure>=12||kids.length>=2?'NE':'NE')));if(kind==='death'&&ageOf(me)<35)type='BE';if(F&&F.type==='隱藏'&&kind!=='confessNo')type='隱藏';
 var TT={confessOk:['一句話的春天','心照','月下應答'],confessNo:['未寄的信','落花無言','錯過的季節'],marry:['紅燭兩盞','結髮','同衾'],death:['青囊歸山','燈盡','長眠渭水'],lineEnd:['無人續的家譜','最後的'+Fam.name(),'空庭'],choice:['浮生一卷','如是此生','擱筆']}[kind]||['浮生'];
 var title=(F&&kind!=='confessNo'&&kind!=='confessOk'?F.t+'·':'')+pick(TT);
 var p1=me.n+'，'+(S.flags.intro==='std'?'自隱世山谷學成西醫下山':'生於'+((BIRTHS.filter(function(b){return b.k===S.flags.birth;})[0]||{n:'尋常人家'}).n))+'，'+(kind==='death'?'享年'+ageOf(me)+'。':'這一年'+ageOf(me)+'歲。');
 var p2=S.stats.pat?'一生看診'+S.stats.pat+'人，救回'+S.stats.cure+'條性命'+(S.stats.dead?'，也送走了'+S.stats.dead+'個沒能留住的人':'')+'。':'這一生沒怎麼行醫，日子卻也一天天過了下來。';
 var p3=t?(kind==='confessNo'?'那天，'+t.n+'沒有接住那句話。':(kind==='marry'?'與'+t.n+'成婚那天，'+(S.region==='frontier'?'邊地的風':'咸陽的雪')+'都溫柔了。':'那天，'+t.n+'終於說出了同樣的話。')):(sp?'身邊有'+sp.n+'。':'');
 var hist=S.wev.maj.filter(function(m){return m.tag==='史'||m.tag==='你所為';}).slice(-2).map(function(m){return m.t;});var p4=hist.length?'那些年，'+hist.join('；')+'。':'';
 var epi=kind==='lineEnd'?Fam.name()+'的家譜，在這一頁停住了。':(kids.length?kids[0].n+'後來'+(kids[0].sk.med>=20?'接過了醫箱':(kids[0].sk.lit>=20?'讀書入仕':'守著家業'))+'，'+Fam.name()+'仍是'+TIERS[Fam.tier()].n+'。':(S.fam.clinic.open?'醫館的木牌，後來由學徒接著掛了下去。':'很多年後，還有人提起'+me.n+'這個名字。'));
 var memOk=function(id){return Nom.list(id,30).some(function(x){return x.k!=='secret'&&x.k!=='recent'&&!/^我曾說/.test(x.t);});};var cand=Object.keys(S.ppl).filter(function(id){return id!==S.pc&&S.ppl[id].met&&S.ppl[id].alive;}).sort(function(a,b){return (P(b).aff+(P(b).love||0)*2)-(P(a).aff+(P(a).love||0)*2);});var mw=t||sp||(kids[0])||P(cand.filter(memOk)[0]||cand[0]);
 var mt='';if(mw){var mem=Nom.list(mw.id,30).filter(function(x){return x.k!=='secret'&&x.k!=='recent'&&!/^我曾說/.test(x.t);});var m1=mem.length?mem[mem.length-1].t:'';m1=m1.replace(/^.*對我說：/,'').replace(/[「」]/g,'').replace(new RegExp('^'+me.n),'你').slice(0,40);mt=kind==='confessNo'?'「我不是不在乎你……只是，有些話我給不起。」':(m1?'「我一直記得——'+m1+'。'+(kind==='death'?'你走了，這些我替你記著。':'往後，也會一直記得。')+'」':'「能遇見你，真好。」');}
 return {title:title,type:type,text:[p1,p2,p3,p4].filter(Boolean).join(''),epi:epi,mono:mw?{who:mw.id,text:mt}:null,fixed:F&&kind!=='confessNo'?fx[0]:'',source:'tpl'};};
/* AI 結局 */
End.ai=function(kind,ctx){var msgs=[{role:'system',content:'你是《'+GAME_TITLE+'》的結局作者。'+AI.worldRules(true)+'\n根據主角的一生寫一個獨特結局。規則：\n1. 只能使用【人生】中已發生的事實，不得讓已故者復活，不得虛構未發生的大事；\n2. 角色獨白者只能提及自己知道的事（【知情】列出各人所知），不得說出不知道的秘密；\n3. 繁體中文，古風細膩；text 180–320 字，epilogue 60–140 字，獨白 30–80 字；\n4. 只輸出 JSON：{"title":"結局名(2-8字)","type":"HE|BE|NE|隱藏","text":"敘述","epilogue":"後日談","mono":{"who":"人物id","text":"獨白"}}'},
 {role:'user',content:'【結局條件】'+End.KN[kind]+(ctx&&ctx.id?'（對象：'+cn(ctx.id)+'）':'')+'\n【人生】\n'+End.life(ctx)+'\n【知情】\n'+FW.aiLines(Object.keys(S.ppl).filter(function(id){return id!==S.pc&&S.ppl[id].met;}).slice(0,8))+'\n【符合的固定結局】'+(End.matchFixed().map(function(k){return End.FIXED[k].t;}).join('、')||'無')}];
 return AI.call(msgs,{maxTok:1400}).then(function(r){var j=AI.extractJSON(r.text);if(!j||typeof j.text!=='string'||j.text.length<30)throw {kind:'schema'};var e={title:String(j.title||'浮生').slice(0,12),type:['HE','BE','NE','隱藏'].indexOf(j.type)>=0?j.type:'NE',text:j.text.slice(0,900),epi:String(j.epilogue||j.epi||'').slice(0,400),mono:j.mono&&P(j.mono.who)&&j.mono.who!==S.pc?{who:j.mono.who,text:String(j.mono.text||'').slice(0,200)}:null,source:'ai'};var fx=End.matchFixed();e.fixed=fx[0]||'';return End.check(e,kind,ctx);});};
/* 驗證：知情規則＋已發生事實 */
End.check=function(e,kind,ctx){var fixes=0;
 if(e.mono){var who=e.mono.who;S.facts.forEach(function(f){if(f.pub||!f.secret||f.kn.indexOf(who)>=0||!f.kw||!f.kw.length)return;if(f.kw.some(function(w){return e.mono.text.indexOf(w)>=0;})){e.mono.text='「……有些事，我一直沒問。你不說，我便不問。」';fixes++;}});var wp=P(who);if(!wp.met){e.mono=null;fixes++;}}
 for(var id in S.ppl){var p=S.ppl[id];if(p.alive||!p.met)continue;var re=new RegExp(p.n+'[^。]{0,8}(至今|如今|依然|仍然)(健在|活著|安好)');if(re.test(e.text)||re.test(e.epi)){e.text=e.text.replace(re,p.n+'早已不在');e.epi=e.epi.replace(re,p.n+'早已不在');fixes++;}}
 NAMED_ORDER.forEach(function(id){var p=P(id);if(!p||p.met)return;['text','epi'].forEach(function(k){if(e[k]&&e[k].indexOf(p.n)>=0){e[k]=e[k].split(/(?<=[。！？])/).filter(function(x){return x.indexOf(p.n)<0;}).join('')||e[k].replace(new RegExp(p.n,'g'),'某人');fixes++;}});if(e.mono&&e.mono.text.indexOf(p.n)>=0){e.mono.text=e.mono.text.replace(new RegExp(p.n,'g'),'那人');fixes++;}});
 if(kind==='death'&&/(仍然活著|大難不死|起死回生)/.test(e.text)){e.text=e.text.replace(/仍然活著|大難不死|起死回生/g,'終究走了');fixes++;}
 e.fixes=fixes;return e;};
End.make=function(kind,ctx){var base={kind:kind,kn:End.KN[kind],gen:S.fam.gen,name:pc().n,fam:Fam.name(),year:Eng.ybStr(Eng.yb()),era:Eng.era(),d:Date.now(),id:'e'+Date.now().toString(36)+rnd(999)};
 function fin(e){for(var k in base)e[k]=base[k];if(e.fixed){Meta.get().fixed[e.fixed]=Meta.get().fixed[e.fixed]||e.d;}Meta.get().ends.push(e);Meta.save();S.ends.push({id:e.id,kind:kind,d:S.day,title:e.title});addLog('〔結局〕'+e.title+'（'+e.type+'）','結');return e;}
 if(AI.ready()&&SET.aiEnd!==false&&!AI.manual()){return End.ai(kind,ctx).then(fin,function(err){AI.fail(err);return fin(End.check(End.tpl(kind,ctx),kind,ctx));});}
 return Promise.resolve(fin(End.check(End.tpl(kind,ctx),kind,ctx)));};
/* 里程碑結局：寫入結局冊後可繼續 */
End.milestone=function(kind,ctx,sc){var key=kind+':'+(ctx&&ctx.id||'');S.flags.ms=S.flags.ms||{};if(S.flags.ms[key]||SET.msEnd===false)return sc;S.flags.ms[key]=S.day;
 sc.ch=[ch('🎬 觀看這段結局','endMs',{kind:kind,id:ctx&&ctx.id||''})].concat(sc.ch||[]);return sc;};
NODES.endMs=function(a){return {endGen:{kind:a.kind,ctx:{id:a.id},final:0}};};
NODES.endLife=function(){return Eng.L(['你真的要讓這一生在此落幕嗎？（會生成本生結局，之後可由子女繼承或重新開始）'],'',S.place,[ch('🕯 是，就此落幕','endGo',{kind:'choice'}),ch('↩ 還不是時候','place')]);};
NODES.endGo=function(a){return {endGen:{kind:a.kind,ctx:a,final:1}};};
NODES.pcDeath=function(a){var me=pc();var why=a&&a.why||Ill.cause(me);me.alive=0;me.died=S.day;me.cause=why;addLog('〔喪〕'+me.n+'辭世（'+why+'），享年'+ageOf(me),'家');S.flags.dying=0;var heirs=People.heirs().filter(alive);
 var L=[me.n+'走了。'+why+'，享年'+ageOf(me)+'。'];var sp=P(me.spouse);if(sp&&sp.alive)L.push(sp.n+'握著你漸漸冷去的手，很久很久沒有放開。');if(heirs.length)L.push(Fam.name()+'的香火，還等著有人接下去。');else L.push('家中再無可以承繼的人。');
 return Eng.L(L,'',S.place,[ch('🎬 這一生的結局','endGo',{kind:heirs.length?'death':'lineEnd',why:why})]);};
NODES.endAfter=function(a){var me=pc();var heirs=People.heirs().filter(alive);var c=[];if(heirs.length)c.push(ch('👶 由子女繼承','heirPick'));c.push(ch('🌱 重新開始','restart'));c.push(ch('📖 結局冊','album'));if(me.alive&&!a.final)c.unshift(ch('繼續這一生','place'));return Eng.L([a.final?'一生落幕。':'結局已收入「結局冊」。'],'',S.place,c);};
NODES.heirPick=function(){var hs=People.heirs().filter(alive);if(!hs.length)return NODES.endAfter({final:1});return Eng.L(['選一位繼承人，接過'+Fam.name()+'：'].concat(hs.map(function(id){var p=P(id);return p.n+'（'+(p.rel||People.relTo(id))+'，'+ageOf(p)+'歲，醫'+p.sk.med+' 文'+p.sk.lit+' 農'+p.sk.farm+(p.expr.length?'；'+p.expr.map(function(g){return GENES[g].n;}).join('、'):'')+'）';})),'',S.place,hs.map(function(id){return ch('由'+P(id).n+'繼承','inherit',{id:id});}));};
NODES.inherit=function(a){var old=pc();if(old.alive){old.alive=0;old.died=S.day;old.cause='隱退';}var p=P(a.id);
 Meta.get().lives.push({name:old.n,gen:S.fam.gen,fam:Fam.name(),born:old.born,died:old.died,age:ageOf(old),title:old.title||'',med:old.sk.med,d:Date.now()});Meta.save();S.lives.push({id:old.id,gen:S.fam.gen});
 S.pc=p.id;p.kind='pc';p.hh=1;p.met=1;p.loc=null;S.fam.gen++;S.fam.fame=Math.round(S.fam.fame*0.7);if(Inv.has('notes')||S.fam.book){p.sk.med=Math.min(100,p.sk.med+8);}if(S.fam.clinic.apps.indexOf(p.id)>=0)S.fam.clinic.apps=S.fam.clinic.apps.filter(function(x){return x!==p.id;});
 if(p.sur!==S.fam.sur){p.notes.adoptedHeir=1;}S.flags.dying=0;S.flags.held=0;S.flags.harem='';S.disg=null;S.focus='';S.queue=[];S.thread=null;S.recent='';S.back=[];if(S.home)S.place=S.home.pl;if(S.region==='road')S.region='frontier';
 S.flags.ms={};FW.add(p.n+'繼承了'+Fam.name(),[],p.id,{pub:1});addLog('〔家〕第'+S.fam.gen+'代：'+p.n+'繼承家業','家');Fam.tierCalc();
 var L=['第'+cnum0(S.fam.gen)+'代。','你是'+p.n+'，'+ageOf(p)+'歲。'+old.n+'留下了'+(S.gold)+'兩銀子、'+Eng.HOUSE_N[S.fam.house||0]+(S.fam.clinic.open?'、一間醫館':'')+(Object.keys(S.fam.tech).length?'，還有家傳的'+Object.keys(S.fam.tech).length+'門醫術':'')+'。'];if(ageOf(p)<14){S.flags.babyStart=1;return Eng.L(L,'',S.place,[ch('開始長大','childYear')]);}
 return Eng.L(L,'',S.place,[ch('接過家業','place')]);};
NODES.restart=function(){return {screen:'title'};};
NODES.album=function(){return {screen:'album'};};
