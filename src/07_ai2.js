/* v4.2 AI 文筆與連貫度：角色聲線、動機、情緒、反重複、範例、選項品質重試 */
var VOICE={
 yingzheng:{tone:'語短而冷，常以反問試探，自稱「寡人」',tic:'「說下去。」「你可知欺君何罪？」',goal:'親政、削呂不韋之權、一統六國；對身邊人既需要又不信任'},
 mengtian:{tone:'爽直簡練，軍中口吻，偶有少年氣',tic:'「末將……」「放心，有我。」',goal:'守秦、建功；暗中掛念舊傷與家族名聲'},
 lisi:{tone:'溫文周到，言必引法家之說，話裡留三分',tic:'「此言差矣。」「得失之間，在乎時勢。」',goal:'出人頭地、不再做「廁中鼠」；凡事權衡利害'},
 fusu:{tone:'溫和懇切，好引詩書，憂民',tic:'「民為邦本。」「若得兩全便好。」',goal:'以仁政勸父王；渴望父親認可'},
 hanfei:{tone:'口吃，書面極犀利，說話常斷句停頓',tic:'「法、術、勢……缺、缺一不可。」',goal:'保全韓國、讓著作為人所用'},
 jingke:{tone:'豪邁散漫，嗜酒，話裡帶刀',tic:'「喝一杯再說。」「士為知己者死。」',goal:'報知己之恩；內心孤寂'},
 xuanye:{tone:'寡言，字少而準，冷中帶護',tic:'「……在。」「別回頭。」',goal:'奉命護衛；隱藏自己的身世'},
 zhaogao:{tone:'謙卑圓滑，笑裡藏刀，奉承中探底',tic:'「小人不敢。」「大人說的是。」',goal:'攀附權力、掌握他人把柄'},
 lvbuwei:{tone:'老練從容，商人算盤，常以「奇貨」喻人',tic:'「奇貨可居。」「老夫看人，從不走眼。」',goal:'保相國權位、著《呂氏春秋》傳名'},
 zhaoji:{tone:'嬌慵而帶威，喜怒無常',tic:'「哀家乏了。」',goal:'貪歡、保自身富貴，與兒子關係緊張'}};
AI.MOODS=function(p){var b=p.bond&&p.bond.e||{};var top=Object.keys(b).sort(function(x,y){return (b[y]||0)-(b[x]||0);})[0];var m=p.hp<40?'病弱':p.mood!=null&&p.mood<30?'低落':p.mood>75?'愉快':'平靜';return m+(top&&b[top]>=20?'，對主角'+top+'較重':'')+(p.aff<-20?'，心有芥蒂':'');};
(function(){var op=AI.pline;AI.pline=function(id){var s=op(id);var v=VOICE[id],p=P(id);var ex=[];if(v)ex.push('語氣：'+v.tone,'口頭禪：'+v.tic,'動機：'+v.goal);else if(p&&p.pers)ex.push('語氣：依性格「'+p.pers.join('、')+'」');if(p)ex.push('此刻情緒：'+AI.MOODS(p));return s+'｜'+ex.join('｜');};})();
AI.STYLE='\n【文筆與劇情要求】\n'
 +'1. 古風白描：多寫動作、神情、器物、光影聲響與人物心理，少用現代詞與空泛形容（如「非常」「十分」「瞬間」）。\n'
 +'2. 每個角色照【人物】的語氣、口頭禪、動機說話；人物有自己的盤算與目的，會試探、拒絕、提條件，不會一味順從主角。\n'
 +'3. 前後連貫：承接【剛說過的對話】與【近期劇情】，記得已發生的事與承諾；不得重新介紹已識之人。\n'
 +'4. 不替主角做決定、不寫主角的台詞或內心結論（主角已輸入的話除外）；在懸念處停筆，把選擇留給玩家。\n'
 +'5. choices 給 3–4 個具體、互有分歧的行動（例：「按住他的脈，追問那包藥從何而來」「假意應允，暗中記下時辰」），不要「繼續」「觀察」「思考」之類空話，也不要與上一幕選項雷同。\n'
 +'6. 不重複【上幾回開頭】的句式、意象與台詞。\n'
 +'【示範（只示風格，勿抄內容）】\n{"scene":"燭芯「劈」地爆了一聲。\\n李斯將竹簡推回案上，指腹在刻痕上停了停。\\n李斯：「先生的方子，用藥極險。」\\n他抬眼，笑意不到眼底。\\n李斯：「若出了差池，這罪名，誰來擔？」","speaker":"lisi","time":0,"choices":[{"text":"直言藥性，請他當面試服"},{"text":"反問他為何深夜來查方子"},{"text":"收起竹簡，只說明日再議"}],"fx":{"ppl":{"lisi":{"trust":-1}}},"facts":[],"recap":"李斯夜查藥方，語帶威脅"}';
(function(){var os=AI.system;AI.system=function(){return os()+AI.STYLE;};})();
/* 反重複：記住最近三幕 */
AI.hist=function(){return (S.aiHist=S.aiHist||[]);};
AI.sim=function(a,b){a=String(a||'').replace(/\s/g,'');b=String(b||'').replace(/\s/g,'');if(a.length<20||b.length<20)return 0;var g={},n=0,h=0;for(var i=0;i<a.length-1;i++)g[a.substr(i,2)]=1;for(i=0;i<b.length-1;i++){n++;if(g[b.substr(i,2)])h++;}return n?h/n:0;};
(function(){var ou=AI.userMsg;AI.userMsg=function(a){var s=ou(a);var H=AI.hist();var ex=[];
 if(S.thread&&S.thread.cur&&S.thread.cur.recap)ex.push('【近期劇情】'+S.thread.cur.recap);var rc=H.map(function(h){return h.recap;}).filter(Boolean);if(rc.length)ex.push('【近期劇情摘要】'+rc.join('→'));
 if(H.length)ex.push('【上幾回開頭（勿重複）】'+H.map(function(h){return '「'+h.head+'」';}).join(' '));
 if(a._dup)ex.push('（上次輸出與前幕太相似或選項空泛，請換角度重寫：新的動作、新的資訊、具體分歧的選項。）');
 return ex.length?s+'\n'+ex.join('\n'):s;};})();
AI.weak=function(r){var bad=/^(繼續|觀察|思考|等待|離開|返回|告辭)$/;var ch=r.choices||[];if(ch.length<2)return 'few';if(ch.filter(function(c){return bad.test(String(c.text).trim());}).length>=2)return 'vague';var H=AI.hist();for(var i=0;i<H.length;i++)if(AI.sim(H[i].full,r.scene)>0.7)return 'dup';return '';};
(function(){var oq=AI.request;AI.request=function(a){return oq(a).then(function(r){var w=AI.weak(r);if(w&&!a._dup){var b={};for(var k in a)b[k]=a[k];b._dup=w;AI.lastWeak=w;return AI.request(b).then(function(r2){return AI.weak(r2)==='dup'?r:r2;},function(){return r;});}return r;});};})();
(function(){var op=AI.post;AI.post=function(r,a){var H=AI.hist();H.push({head:String(r.scene||'').replace(/\s+/g,'').slice(0,30),full:String(r.scene||'').slice(0,400),recap:String(r.recap||'').slice(0,40)});while(H.length>3)H.shift();return op(r,a);};})();
if(typeof SET!=='undefined'&&SET.maxTok===1800)SET.maxTok=2600;
