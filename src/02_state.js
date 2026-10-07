/* ===== 狀態、設定、工具、人物生成、存檔、跨存檔 Meta ===== */
var S=null;
var DEFSET={ai:false,key:'',base:'https://api.deepseek.com/v1',model:'deepseek-chat',temp:0.85,maxTok:1800,aiTimeout:60,preset:'deepseek',hdr:'',aiSrc:'api',aiBlock:'',
 typer:true,speed:2,auto:1.6,font:17,diff:'normal',pace:'slow',visitf:'mid',wdens:'mid',inmode:'say',sfx:true,adult:false,
 firewall:true,wsane:true,decld:true,ncmd:true,actd:true,seald:true,bondd:true,memd:'high',afx:true,aflauto:false,autoEat:true,aiEnd:true};
var SET={};
var PRESETS={
 deepseek:{n:'DeepSeek',base:'https://api.deepseek.com/v1',model:'deepseek-chat',models:['deepseek-chat','deepseek-reasoner'],key:'到 platform.deepseek.com 建立 API Key 並儲值（餘額為 0 會回 HTTP 402）。建議用 deepseek-chat。'},
 xai:{n:'xAI Grok',base:'https://api.x.ai/v1',model:'grok-latest',models:['grok-latest','grok-4.3','grok-3-mini'],key:'到 console.x.ai 建立 API Key（Grok App 訂閱不能用）。'},
 openai:{n:'OpenAI',base:'https://api.openai.com/v1',model:'gpt-4o-mini',models:['gpt-4o-mini','gpt-4o','gpt-4.1-mini'],key:'到 platform.openai.com 建立 API Key。'},
 openrouter:{n:'OpenRouter',base:'https://openrouter.ai/api/v1',model:'deepseek/deepseek-chat',models:['deepseek/deepseek-chat','x-ai/grok-4-fast','openai/gpt-4o-mini','google/gemini-2.5-flash'],key:'到 openrouter.ai 建立 Key；模型名寫成「廠商/模型」。'},
 gemini:{n:'Google Gemini',base:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.5-flash',models:['gemini-2.5-flash','gemini-2.5-pro'],key:'到 aistudio.google.com 取得 API Key。'},
 groq:{n:'Groq',base:'https://api.groq.com/openai/v1',model:'llama-3.3-70b-versatile',models:['llama-3.3-70b-versatile','qwen/qwen3-32b'],key:'到 console.groq.com 建立 API Key。'},
 custom:{n:'自訂（OpenAI 相容）',base:'',model:'',models:[],key:'自行填入 Base URL、模型名與 Key（本機 Ollama／LM Studio 可不填 Key）。'}
};
var PRESET_ORDER=['deepseek','xai','openai','openrouter','gemini','groq','custom'];
function loadSettings(){var o={};try{o=JSON.parse(localStorage.getItem('qlv_settings')||'{}')||{};}catch(e){o={};}
 SET={};for(var k in DEFSET)SET[k]=(o[k]!==undefined&&typeof o[k]===typeof DEFSET[k])?o[k]:DEFSET[k];if(['slow','mid','fast'].indexOf(SET.pace)<0)SET.pace='slow';}
function saveSettings(){try{localStorage.setItem('qlv_settings',JSON.stringify(SET));}catch(e){}}
/* ---- 工具 ---- */
function clamp(v,a,b){v=+v;if(isNaN(v))v=a;return v<a?a:(v>b?b:v);}
var _seed=Date.now()%2147483647||7;
function rand(){_seed=(_seed*16807)%2147483647;return (_seed-1)/2147483646;}
function rnd(n){return Math.floor(rand()*n);}
function pick(a){return a[rnd(a.length)];}
function roll(p){return rand()*100<p;}
function wpick(o){var t=0,k;for(k in o)t+=o[k];var r=rand()*t;for(k in o){r-=o[k];if(r<=0)return k;}return k;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1);var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function diffMul(){return {easy:1.5,normal:1,hard:0.75}[SET.diff]||1;}
function P(id){return S&&S.ppl?S.ppl[id]:null;}
function pc(){return S?S.ppl[S.pc]:null;}
function cn(id){if(!S)return id||'';if(id==='p'||id===S.pc)return pc().n;var p=S.ppl[id];return p?p.n:(id||'');}
function ageOf(p){if(!p)return 0;return Math.floor(((p.died||S.day)-p.born)/DPY);}
function isPC(id){return id==='p'||id===S.pc;}
function alive(id){var p=P(id);return !!(p&&p.alive);}
function gw(p,m,f){return p&&p.g==='f'?f:m;}  /* 依性別選字 */
function ta(p){return gw(p,'他','她');}
/* ---- 世界性別規則 ---- */
var Rule={
 lead:function(){return S.world==='male'?'m':(S.world==='female'?'f':'');},
 ok:function(p,what){var l=Rule.lead();if(!l)return true;var g=Gender?Gender.seen(p):p.g;return g===l||(what==='med');},
 why:function(p,what){return (S.world==='male'?'男尊之世，':'女尊之世，')+({office:'官府只收'+(S.world==='male'?'男':'女')+'子為吏',army:'軍中不收'+(S.world==='male'?'女':'男')+'子',school:'學室只收'+(S.world==='male'?'男':'女')+'童',head:'家主須由'+(S.world==='male'?'男':'女')+'子擔當'}[what]||'此路不通')+'。可考慮易裝。';},
 marryWord:function(a,b){var l=Rule.lead();if(!l)return '成親';return a.g===l?(b.g===l?'結契':'迎娶'):'出嫁';}
};
/* ---- 人物 ---- */
function newId(){S.seq=(S.seq||0)+1;return 'n'+S.seq;}
function rollAttr(base){return clamp(Math.round((base||10)+(rand()+rand()+rand()-1.5)*4),1,20);}
function genName(g,sur){var gn=g==='f'?pick(GN_F):pick(GN_M);if(rand()<0.4)gn=gn+(g==='f'?pick(GN_F):pick(GN_M));return {sur:sur||pick(SURNAMES),gn:gn};}
function genPerson(o){o=o||{};var g=o.g||(rand()<0.5?'m':'f');var nm=genName(g,o.sur);var age=o.age!=null?o.age:16+rnd(40);
 var p={id:o.id||newId(),sur:nm.sur,gn:o.gn||nm.gn,g:g,born:S.day-age*DPY-rnd(DPY),kind:o.kind||'npc',job:o.job||'none',
  pers:o.pers||shuffle(TRAIT_LIST).slice(0,2),like:o.like||shuffle(LIKES).slice(0,2),at:{},sk:{med:0,farm:0,craft:0,trade:0,mart:0,lit:0},genes:o.genes||[],expr:[],
  look:o.look||{hair:pick(HAIR),skin:pick(SKIN),seed:rnd(9999)},hp:100,food:80,sta:100,mood:65,temp:36.6,ill:[],feet:100,cloth:90,
  aff:o.aff||0,trust:o.trust||0,love:0,met:o.met||0,alive:1,died:0,spouse:'',par:o.par||[],kids:[],loc:o.loc||null,hh:o.hh||0,rank:0,office:0,medoff:0,title:o.title||'',mem:[],thought:'',tal:{},notes:{}};
 ['con','wit','look','cha','dex'].forEach(function(k){p.at[k]=o.at&&o.at[k]!=null?o.at[k]:rollAttr(10);});
 if(!o.genes){for(var gk in GENES)if(rand()<0.06)p.genes.push(gk);}
 Gene.express(p);
 if(o.sk)for(var k in o.sk)p.sk[k]=o.sk[k];else{var j=p.job;if(j==='farmer')p.sk.farm=30+rnd(30);if(j==='trader'||j==='owner')p.sk.trade=30+rnd(30);if(j==='tradoc')p.sk.med=25+rnd(25);if(j==='soldier'||j==='xia')p.sk.mart=30+rnd(30);if(j==='clerk'||j==='scholar')p.sk.lit=30+rnd(30);if(j==='smith'||j==='carpenter'||j==='weaver')p.sk.craft=30+rnd(30);}
 p.n=p.sur+p.gn;S.ppl[p.id]=p;return p;}
var Gene={
 express:function(p){p.expr=[];(p.genes||[]).forEach(function(g){var G=GENES[g];if(!G)return;var c=(p.genes2||[]).indexOf(g)>=0;if(c||rand()<G.dom||p._exprAll)p.expr.push(g);});
  p.expr.forEach(function(g){var fx=GENES[g].fx;for(var k in fx)p.at[k]=clamp(p.at[k]+fx[k],1,25);if(GENES[g].look==='silver')p.look.hair='#d8dce6';});},
 /* 子女：屬性＝雙親平均＋擾動；基因各從父母隨機承繼（雙份＝必顯，單份＝按顯性機率）；外貌逐項取自父或母（隔代：祖輩帶的銀髮等也可能出現） */
 child:function(a,b,o){var g=o.g||(rand()<0.5?'m':'f');var fam=S.fam;var sur=o.sur||fam.sur;var c=genPerson({g:g,age:0,sur:sur,kind:'fam',job:'child',hh:1,genes:[],par:[a.id,b.id],at:{},sk:{med:0,farm:0,craft:0,trade:0,mart:0,lit:0}});
  ['con','wit','look','cha','dex'].forEach(function(k){c.at[k]=clamp(Math.round(((a.at[k]||10)+(b.at[k]||10))/2+(rand()+rand()-1)*3+(o.env||0)),1,20);});
  var all={};(a.genes||[]).forEach(function(x){all[x]=(all[x]||0)+(rand()<0.5?1:0);});(b.genes||[]).forEach(function(x){all[x]=(all[x]||0)+(rand()<0.5?1:0);});
  c.genes=[];c.genes2=[];for(var x in all){if(all[x]>=1)c.genes.push(x);if(all[x]>=2)c.genes2.push(x);}
  if(rand()<0.05){var nk=pick(Object.keys(GENES));if(c.genes.indexOf(nk)<0)c.genes.push(nk);}
  c.look={hair:rand()<0.5?a.look.hair:b.look.hair,skin:rand()<0.5?a.look.skin:b.look.skin,seed:rnd(9999),eyeFrom:rand()<0.5?a.id:b.id};
  c.at.look=clamp(Math.round((a.at.look+b.at.look)/2+(rand()-0.5)*4),1,20);
  Gene.express(c);c.tal={};['med','mart','lit','trade','farm','craft'].forEach(function(k){c.tal[k]=Math.round(((a.sk[k]||0)+(b.sk[k]||0))/40+rand()*3);});
  c.milk=pick(MILK);return c;}
};
/* ---- 新遊戲 ---- */
function baseState(o){var s={v:2,seed:Date.now()%100000,world:o.world||'equal',mode:o.mode||'std',day:1,per:0,seq:0,ppl:{},pc:'',
 fam:{sur:'',gen:1,fame:0,tier:0,tech:{},land:0,plots:[],house:0,clinic:{open:0,lv:0,apps:[],days:0},grudge:null,hist:[]},gold:0,inv:{},
 region:'xianyang',place:'lodge',road:null,wx:{k:'晴',t:15},flags:{},evseen:{},log:[],back:[],full:[],facts:[],letters:[],invites:[],calls:[],apps:[],fseq:0,wev:{maj:[]},hist:{done:{},alt:''},
 pend:null,thread:null,focus:'',queue:[],stats:{pat:0,cure:0,dead:0},bond:{},nm:{},pace:{last:-99,per:{},q:[]},idn:{hist:[]},disg:null,afl:null,origin:null,seal:{},cmds:[],ends:[],lives:[]};return s;}
function addNamed(){NAMED_ORDER.forEach(function(k){var N=NAMED[k];var p={id:k,sur:'',gn:N.n,n:N.n,g:N.g,born:S.day-N.age*DPY,kind:'named',job:N.job,title:N.title,pers:N.pers.slice(),like:N.like.slice(),at:{},sk:{med:k==='xiawuju'?70:0,farm:0,craft:0,trade:0,mart:(k==='mengtian'||k==='jingke'||k==='xuanye')?70:10,lit:(k==='lisi'||k==='hanfei'||k==='fusu')?70:30},
  genes:N.hid.slice(),genes2:N.hid.slice(),expr:N.hid.slice(),look:{hair:k==='mengtian'||k==='xuanye'?'#d8dce6':'#1a1414',skin:'#f6e2d6',seed:7},hp:k==='fusu'?70:90,food:80,sta:100,mood:60,temp:36.6,ill:[],feet:100,cloth:100,
  aff:0,trust:0,love:0,met:0,alive:1,died:0,spouse:'',par:[],kids:[],loc:null,hh:0,rank:k==='mengtian'?9:0,office:k==='lisi'?8:(k==='zhaogao'?6:0),medoff:k==='xiawuju'?3:0,mem:[],thought:'',tal:{},notes:{},portrait:PORTRAITS.indexOf(k)>=0?k:''};
  for(var a in N.gene)p.at[a]=N.gene[a];S.ppl[k]=p;if(N.arrive&&START_BC>N.arrive)p.away=1;});
 S.ppl.hanfei.away=1;S.ppl.xuanye.hidden=1;}
function heroineState(o){S=baseState({world:o.world,mode:'std'});addNamed();var sur=(o.name||DEF_NAMES[0]).length>=3?o.name.slice(0,1):'白';
 var p=genPerson({id:'pc1',g:'f',age:19,sur:sur,kind:'pc',job:'doctor',hh:1,met:1,pers:['正直','熱心'],at:{con:12,wit:15,look:15,cha:12,dex:16},sk:{med:42,farm:5,craft:10,trade:5,mart:5,lit:25},genes:['hand']});
 p.gn=(o.name||DEF_NAMES[0]).length>=3?o.name.slice(1):(o.name||DEF_NAMES[0]);p.n=o.name||DEF_NAMES[0];p.sur=p.n.length>=3?p.n.slice(0,1):sur;p.portrait='heroine';p.look={hair:'#2a1c18',skin:'#f8e6da',seed:3};
 S.pc=p.id;S.fam.sur=p.sur;S.gold=160;S.inv={grain:3,cake:2,alcohol:3,bandage:6,thread:4,antipyr:2,ors:2,herb:4,soap:1,needle:1,steth:1,scalpel:1,notes:1,sandal:1};
 TECH_BASIC.forEach(function(t){S.fam.tech[t]=1;});S.region='xianyang';S.place='lodge';
 var m=genPerson({id:'master',g:'m',age:78,sur:'青囊',gn:'子',kind:'npc',job:'tradoc',met:1,aff:80,trust:80,pers:['溫和','正直'],loc:{r:'frontier',pl:'mountain'}});m.n='青囊子';m.title='師父';m.sk.med=95;
 FW.add('師父青囊子年輕時遠遊極西「大秦國」，學得解剖刀圭之術',['pc1','master'],'pc1',{k:'master',secret:1});
 S.flags.std=1;Weather.roll();return S;}
/* 全隨機：生成身世預覽（可重擲） */
function rollBirth(o){var b=o&&o.birth?BIRTHS.filter(function(x){return x.k===o.birth;})[0]:null;if(!b){var w={};BIRTHS.forEach(function(x){w[x.k]=x.w;});var k=wpick(w);b=BIRTHS.filter(function(x){return x.k===k;})[0];}
 var g=o&&o.g?o.g:(rand()<0.5?'f':'m');var baby=!!(o&&o.baby)&&b.k!=='exile';var age=baby?0:(b.k==='exile'?15+rnd(4):16+rnd(4));
 var tal=shuffle(['med','mart','lit','trade','farm','craft']).slice(0,2);var genes=[];for(var gk in GENES)if(rand()<0.12)genes.push(gk);
 return {birth:b.k,g:g,age:age,baby:baby,sur:pick(SURNAMES),gn:genName(g).gn,at:{con:rollAttr(10),wit:rollAttr(10),look:rollAttr(10),cha:rollAttr(10),dex:rollAttr(10)},tal:tal,genes:genes,crime:pick(CRIMES),dest:pick(EXILE_DEST).k,sibs:1+rnd(3),grand:rand()<0.5,seed:rnd(99999)};}
function randomState(r,o){S=baseState({world:o.world,mode:'rand'});addNamed();var B=BIRTHS.filter(function(x){return x.k===r.birth;})[0];
 var p=genPerson({id:'pc1',g:r.g,age:r.age,sur:r.sur,gn:r.gn,kind:'pc',job:r.age<14?'child':'none',hh:1,met:1,at:r.at,genes:r.genes.slice()});p.genes2=r.genes.filter(function(x){return rand()<0.4;});p.expr=[];Gene.express(p);
 r.tal.forEach(function(t){p.tal[t]=8;p.sk[t]=Math.min(30,r.age*2);});S.pc=p.id;S.fam.sur=r.sur;S.gold=B.gold;S.fam.tier=B.tier;S.flags.birth=r.birth;
 /* 家人：父母（可能祖母）＋兄弟姊妹 */
 var fa=genPerson({g:'m',age:r.age+20+rnd(10),sur:r.sur,kind:'fam',hh:1,met:1,aff:55,trust:50,job:{exile:'exile',farm:'farmer',merchant:'owner',gentry:'scholar',tradoc:'tradoc',orphan:'none'}[r.birth]});
 var mo=genPerson({g:'f',age:r.age+18+rnd(8),kind:'fam',hh:1,met:1,aff:65,trust:55,job:{exile:'exile',farm:'weaver',merchant:'trader',gentry:'none',tradoc:'tradoc',orphan:'none'}[r.birth]});
 fa.spouse=mo.id;mo.spouse=fa.id;fa.rel='父';mo.rel='母';p.par=[fa.id,mo.id];fa.kids=[p.id];mo.kids=[p.id];
 if(r.birth==='orphan'){fa.alive=0;fa.died=S.day-DPY*3;mo.alive=0;mo.died=S.day-DPY*3;fa.hh=0;mo.hh=0;}
 for(var i=0;i<r.sibs&&r.birth!=='orphan';i++){var sa=Math.max(0,r.age+rnd(9)-4);var sb=genPerson({age:sa,sur:r.sur,kind:'fam',hh:1,met:1,aff:45+rnd(25),trust:40,par:[fa.id,mo.id],job:sa<14?'child':'none'});sb.rel=(sa>r.age?(sb.g==='m'?'兄':'姊'):(sb.g==='m'?'弟':'妹'));fa.kids.push(sb.id);mo.kids.push(sb.id);}
 if(r.grand&&r.birth!=='orphan'){var gm=genPerson({g:'f',age:r.age+48+rnd(12),sur:pick(SURNAMES),kind:'fam',hh:1,met:1,aff:70,trust:60,pers:['溫和','孝順']});gm.rel='祖母';gm.hp=70;}
 if(r.birth==='tradoc'){fa.sk.med=55;p.sk.med=Math.max(p.sk.med,r.age*2);S.fam.tech.herbs=1;S.fam.tech.rest=1;S.inv.herb=6;}
 S.inv.grain=4;S.inv.cake=2;S.inv.needle=1;
 if(r.birth==='exile'){var D=EXILE_DEST.filter(function(x){return x.k===r.dest;})[0];S.region='road';S.place='road';S.road={day:1,total:D.days,dest:D.k,dn:D.n,dt:D.dt,food:1};S.gold=Math.min(S.gold,20);S.inv={gruel:2,cake:1,needle:1};
  S.fam.grudge={crime:r.crime,ev:0,clues:[],done:0};
  var g1=genPerson({g:'m',age:38,kind:'npc',job:'guard',met:1,pers:['貪財','暴躁'],sur:'王'});g1.title='押解衙役';g1.loc={r:'road',pl:'road'};
  var g2=genPerson({g:'m',age:24,kind:'npc',job:'guard',met:1,pers:['憨厚','溫和'],sur:'李'});g2.title='押解衙役';g2.loc={r:'road',pl:'road'};
  var ex1=genPerson({age:40,kind:'npc',job:'exile',met:1,pers:['精明','善妒']});ex1.title='同行流人';ex1.loc={r:'road',pl:'road'};
  var ex2=genPerson({age:19,kind:'npc',job:'exile',met:1,pers:['仗義','開朗'],sur:ex1.sur,par:[ex1.id]});ex2.title='同行流人';ex2.loc={r:'road',pl:'road'};
  S.road.guards=[g1.id,g2.id];S.road.mates=[ex1.id,ex2.id];
  FW.add(S.fam.sur+'家獲罪流放：'+r.crime,[p.id,fa.id,mo.id],p.id,{pub:1});}
 else if(r.birth==='farm'){S.region='xianyang';S.place='farm';S.fam.land=2;S.fam.house=1;S.inv.seed=4;S.inv.hoe=1;S.fam.plots=[{st:'fallow',d:0},{st:'fallow',d:0}];}
 else if(r.birth==='merchant'){S.place='market';S.fam.house=2;S.inv.cloth=6;S.inv.silk=2;}
 else if(r.birth==='gentry'){S.place='lodge';S.fam.house=2;S.inv.lawbook=1;S.inv.bamboo=2;p.sk.lit=Math.max(p.sk.lit,r.age*2);}
 else if(r.birth==='tradoc'){S.place='clinic';S.fam.house=2;}
 else{S.place='lodge';}
 S.home={r:S.region,pl:S.region==='road'?'road':(S.place==='farm'?'farm':'lodge')};Weather.roll();return S;}
/* ---- 存檔 ---- */
var SAVE_KEY='qlv2_save_';
function saveSlot(slot,quiet){if(!S)return false;try{var o={t:Date.now(),name:pc().n,day:S.day,gen:S.fam.gen,s:S};var js=JSON.stringify(o);
 if(js.length>3500000){S.full=S.full.slice(-80);js=JSON.stringify(o);}localStorage.setItem(SAVE_KEY+slot,js);if(!quiet)toast('💾 已存檔（'+slotName(slot)+'）');return true;}catch(e){try{S.full=S.full.slice(-40);localStorage.setItem(SAVE_KEY+slot,JSON.stringify({t:Date.now(),name:pc().n,day:S.day,gen:S.fam.gen,s:S}));return true;}catch(e2){}toast('存檔失敗：'+e.message);return false;}}
function slotName(s){return s==='auto'?'自動':'檔位 '+s;}
function slotInfo(slot){try{var o=JSON.parse(localStorage.getItem(SAVE_KEY+slot)||'null');if(!o)return null;return {t:o.t,name:o.name,day:o.day,gen:o.gen||1};}catch(e){return null;}}
function loadSlot(slot){try{var o=JSON.parse(localStorage.getItem(SAVE_KEY+slot)||'null');if(!o||!o.s||o.s.v!==2)return false;S=o.s;migrate();return true;}catch(e){return false;}}
function migrate(){if(typeof S.world!=='string')S.world='equal';var b=baseState({});for(var k in b)if(S[k]===undefined)S[k]=b[k];if(S.thread&&S.thread.cur&&S.thread.cur.inflight){S.thread.cur.inflight=0;S.thread.cur.status='paused';}
 for(var id in S.ppl){var p=S.ppl[id];if(!p.mem)p.mem=[];if(!p.ill)p.ill=[];if(!p.sk)p.sk={med:0,farm:0,craft:0,trade:0,mart:0,lit:0};}if(typeof Nom!=='undefined')Nom.migrate();}
function addLog(t,tag){if(!S)return;S.log.push({d:S.day,t:String(t).slice(0,160),g:tag||''});if(S.log.length>300)S.log.shift();}
/* ---- 跨存檔：結局冊、家族史 ---- */
var Meta={get:function(){if(Meta._g)return Meta._g;var g={};try{g=JSON.parse(localStorage.getItem('qlv2_meta')||'{}')||{};}catch(e){g={};}
 if(!g.ends)g.ends=[];if(!g.fixed)g.fixed={};if(!g.lives)g.lives=[];if(!g.seen)g.seen={};Meta._g=g;return g;},
 save:function(){var g=Meta._g;if(!g)return;if(g.ends.length>200)g.ends=g.ends.slice(-200);if(g.lives.length>200)g.lives=g.lives.slice(-200);try{localStorage.setItem('qlv2_meta',JSON.stringify(g));}catch(e){}}};
