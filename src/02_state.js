/* ===== 狀態、設定、存檔 ===== */
var S=null;
var DEFSET={ai:false,key:'',base:'https://api.deepseek.com/v1',model:'deepseek-chat',temp:0.85,maxTok:1800,aiTimeout:60,preset:'deepseek',hdr:'',aiSrc:'api',aiBlock:'',
 typer:true,speed:2,auto:1.6,font:17,diff:'normal',pace:'mid',inmode:'say',sfx:true,adult:false,firewall:true,wsane:true,decld:true,ncmd:true,actd:true};
var SET={};
var PRESETS={
 deepseek:{n:'DeepSeek',base:'https://api.deepseek.com/v1',model:'deepseek-chat',models:['deepseek-chat','deepseek-reasoner'],key:'到 platform.deepseek.com 建立 API Key 並儲值（餘額為 0 會回 HTTP 402）。建議用 deepseek-chat。'},
 xai:{n:'xAI Grok',base:'https://api.x.ai/v1',model:'grok-latest',models:['grok-latest','grok-4.3','grok-3-mini'],key:'到 console.x.ai 建立 API Key（Grok App 訂閱不能用）。'},
 openai:{n:'OpenAI',base:'https://api.openai.com/v1',model:'gpt-4o-mini',models:['gpt-4o-mini','gpt-4o','gpt-4.1-mini'],key:'到 platform.openai.com 建立 API Key。'},
 openrouter:{n:'OpenRouter',base:'https://openrouter.ai/api/v1',model:'deepseek/deepseek-chat',models:['deepseek/deepseek-chat','x-ai/grok-4-fast','openai/gpt-4o-mini','google/gemini-2.5-flash'],key:'到 openrouter.ai 建立 Key；模型名寫成「廠商/模型」。'},
 gemini:{n:'Google Gemini',base:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.5-flash',models:['gemini-2.5-flash','gemini-2.5-pro'],key:'到 aistudio.google.com 取得 API Key。'},
 groq:{n:'Groq',base:'https://api.groq.com/openai/v1',model:'llama-3.3-70b-versatile',models:['llama-3.3-70b-versatile','qwen/qwen3-32b'],key:'到 console.groq.com 建立 API Key。'},
 custom:{n:'自訂（OpenAI 相容）',base:'',model:'',models:[],key:'自行填入 Base URL、模型名與 Key。'}
};
var PRESET_ORDER=['deepseek','xai','openai','openrouter','gemini','groq','custom'];
function loadSettings(){var o={};try{o=JSON.parse(localStorage.getItem('qlv_settings')||'{}')||{};}catch(e){o={};}
 SET={};for(var k in DEFSET)SET[k]=(o[k]!==undefined&&typeof o[k]===typeof DEFSET[k])?o[k]:DEFSET[k];}
function saveSettings(){try{localStorage.setItem('qlv_settings',JSON.stringify(SET));}catch(e){}}
/* ---- 工具 ---- */
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
var _seed=Date.now()%2147483647;
function rand(){_seed=(_seed*16807)%2147483647;return (_seed-1)/2147483646;}
function rnd(n){return Math.floor(rand()*n);}
function pick(a){return a[rnd(a.length)];}
function roll(p){return rand()*100<p;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function cn(id){return id==='p'?(S?S.p.name:'你'):(CHARS[id]?CHARS[id].n:(id||''));}
function diffMul(){return {easy:1.5,normal:1,hard:0.75}[SET.diff]||1;}
/* ---- 新遊戲 ---- */
function newState(name){
 var s={v:1,day:1,per:0,ch:0,flags:{},p:{name:name||DEF_NAMES[0],med:12,cha:8,wit:8,fame:2,mind:70,gold:120,hp:100,exp:0},
  inv:{herb:4,sachet:1,salve:1,candy:0},c:{},mem:{},facts:[],letters:[],cg:{},endings:{},log:[],back:[],evseen:{},
  thread:null,pend:null,world:{maj:[],jail:{}},quests:[],place:'clinic',pendMs:[],chDay:1,secrets:{p:[{k:'master',t:'師父青囊子臨終前留下一卷禁方',kn:[]}]},seed:Date.now()%100000};
 CHAR_ORDER.forEach(function(id){var c=CHARS[id];
  s.c[id]={aff:0,trust:0,heart:0,jeal:0,sec:0,hp:{yingzheng:62,mengtian:70,lisi:72,fusu:58,hanfei:60,jingke:68,xuanye:50}[id],cured:0,stage:0,met:0,last:-9,gifts:0,dates:0,mood:'平靜',thought:'',knot:0,jailed:0,away:0};
  s.mem[id]=[];});
 return s;
}
/* ---- 存檔 ---- */
var SAVE_KEY='qlv_save_';
function saveSlot(slot,quiet){if(!S)return false;try{var o={t:Date.now(),name:S.p.name,day:S.day,ch:S.ch,s:S};localStorage.setItem(SAVE_KEY+slot,JSON.stringify(o));if(!quiet)toast('💾 已存檔（'+slotName(slot)+'）');return true;}catch(e){toast('存檔失敗：'+e.message);return false;}}
function slotName(s){return s==='auto'?'自動':'檔位 '+s;}
function slotInfo(slot){try{var o=JSON.parse(localStorage.getItem(SAVE_KEY+slot)||'null');if(!o)return null;return {t:o.t,name:o.name,day:o.day,ch:o.ch};}catch(e){return null;}}
function loadSlot(slot){try{var o=JSON.parse(localStorage.getItem(SAVE_KEY+slot)||'null');if(!o||!o.s)return false;S=o.s;migrate();return true;}catch(e){return false;}}
function migrate(){if(!S.pendMs)S.pendMs=[];if(!S.place)S.place='clinic';if(S.chDay===undefined)S.chDay=1;if(!S.world)S.world={maj:[],jail:{}};if(!S.back)S.back=[];if(!S.quests)S.quests=[];CHAR_ORDER.forEach(function(id){if(!S.c[id])S.c[id]=newState().c[id];if(!S.mem[id])S.mem[id]=[];});}
function addLog(t){if(!S)return;S.log.push({d:S.day,t:String(t).slice(0,120)});if(S.log.length>120)S.log.shift();}
/* ---- 時間 ---- */
function dateStr(){var s=Math.floor((S.day-1)/30)%4;var d=(S.day-1)%30+1;return SEASONS[s]+' · 第'+d+'日 · '+PERIODS[S.per];}
function season(){return Math.floor((S.day-1)/30)%4;}
function perName(){return PERIODS[S.per];}
