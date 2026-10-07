/* ===== 青囊·秦心 v2 · 資料：時間、地點、物品、病例、人物、職業、遺傳 ===== */
var GAME_TITLE='青囊·秦心';
var DPS=10,DPY=40;                       /* 每季 10 日、每年 40 日（壓縮曆法） */
var START_BC=237;                         /* 開局：秦王政十年 */
var PERIODS=['清晨','上午','正午','午後','黃昏','深夜'];
var PER_S=['晨','巳','午','未','昏','夜'];
var SEASONS=['春','夏','秋','冬'];
var CN_NUM=['〇','一','二','三','四','五','六','七','八','九','十'];
function cnum(n){n=n|0;if(n<=10)return n===1?'元':CN_NUM[n];if(n<20)return '十'+(n%10?CN_NUM[n%10]:'');return CN_NUM[Math.floor(n/10)]+'十'+(n%10?CN_NUM[n%10]:'');}
function cnum0(n){n=n|0;if(n<=10)return CN_NUM[n];if(n<20)return '十'+(n%10?CN_NUM[n%10]:'');return CN_NUM[Math.floor(n/10)]+'十'+(n%10?CN_NUM[n%10]:'');}
/* 世界設定 */
var WORLDS={male:{n:'男尊',d:'男子主外：入仕、從軍、承家多由男子；女子行醫被視為離經叛道。'},female:{n:'女尊',d:'女子主外：官吏、將帥、家主多為女子；男子守內、以嫁入為常。'},equal:{n:'平等',d:'男女皆可入學、入仕、從軍、承家；婚嫁由兩家商議。'}};
/* 天氣 */
var WX={
 kinds:{晴:{i:'☀',dt:2,wet:0},多雲:{i:'⛅',dt:0,wet:0},陰:{i:'☁',dt:-1,wet:0},小雨:{i:'🌦',dt:-2,wet:1},大雨:{i:'🌧',dt:-4,wet:2},雷雨:{i:'⛈',dt:-3,wet:2},雪:{i:'🌨',dt:-3,wet:1},大雪:{i:'❄',dt:-6,wet:2},霧:{i:'🌫',dt:-1,wet:0},大風:{i:'🌬',dt:-4,wet:0},酷暑:{i:'🔥',dt:5,wet:0}},
 season:[{t:[8,20],w:{晴:4,多雲:3,陰:2,小雨:3,大雨:1,霧:2,大風:1}},{t:[22,33],w:{晴:4,多雲:2,陰:1,小雨:1,大雨:2,雷雨:2,酷暑:2}},{t:[9,21],w:{晴:4,多雲:3,陰:2,小雨:2,霧:2,大風:2}},{t:[-8,5],w:{晴:3,陰:3,雪:3,大雪:1,大風:2,霧:1}}],
 per:[-4,-1,3,2,-1,-5]
};
/* 地區與地點 */
var REGIONS={xianyang:{n:'咸陽',title:'咸陽輿圖',dt:0},frontier:{n:'邊地',title:'邊地輿圖',dt:-3},road:{n:'流放途中',title:'流放路',dt:-1}};
var PLACES={
 lodge:{r:'xianyang',s:'舍',n:'城南客舍',d:'簡陋客舍，十兩一宿；有了宅子便是家。',bg:'tavern',x:24,y:80,home:1},
 clinic:{r:'xianyang',s:'醫',n:'青囊醫館',d:'城南臨街的舖面。開館後便是你的醫館。',bg:'clinic',x:22,y:64},
 market:{r:'xianyang',s:'市',n:'咸陽市集',d:'人聲鼎沸，糧米、布帛、藥材、器物應有盡有。',bg:'market',x:52,y:62},
 plum:{r:'xianyang',s:'林',n:'城西梅林',d:'城西林地，可採野菜、柴薪與藥草。',bg:'plum',x:16,y:38,wild:1},
 camp:{r:'xianyang',s:'營',n:'城北軍營',d:'鼓角聲聲，可投軍、做軍醫。',bg:'camp',x:82,y:30},
 tavern:{r:'xianyang',s:'酒',n:'市井酒肆',d:'三教九流匯聚，打聽消息、結交遊俠之地。',bg:'tavern',x:78,y:72},
 palace:{r:'xianyang',s:'宮',n:'咸陽宮',d:'高台層闕。需官職、召見或熟人引見。',bg:'palace',x:54,y:20,need:'palace'},
 study:{r:'xianyang',s:'蘭',n:'蘭台書房',d:'宮中藏書之所。需官職或熟人引見。',bg:'study',x:38,y:40,need:'palace'},
 yamen:{r:'xianyang',s:'府',n:'內史官署',d:'京畿政務所在：應吏試、遞狀紙、辦戶籍。',bg:'palace',x:66,y:44},
 school:{r:'xianyang',s:'學',n:'學室',d:'官府學室，教子弟識字、律令與算術。',bg:'study',x:40,y:54},
 farm:{r:'xianyang',s:'田',n:'城郊田舍',d:'渭水邊的田地，置產後可耕作。',bg:'field',x:84,y:52},
 courtyard:{r:'xianyang',s:'庭',n:'夜色庭院',d:'月下庭院，只在入夜後前往。',bg:'night',x:62,y:30,night:1},
 home:{r:'frontier',s:'家',n:'家',d:'你在邊地的安身之所。',bg:'hut',x:30,y:66,home:1},
 field:{r:'frontier',s:'田',n:'荒地',d:'官府分下的荒地，開墾後可種。',bg:'field',x:58,y:74},
 forest:{r:'frontier',s:'林',n:'後山林',d:'野菜、野果、柴薪、藥草；也有毒物與野獸。',bg:'forest',x:22,y:32,wild:1},
 river:{r:'frontier',s:'河',n:'河灘',d:'可取水、捕魚、洗衣。',bg:'river',x:74,y:44,wild:1},
 village:{r:'frontier',s:'里',n:'里中',d:'流人與土著雜居的里巷。',bg:'village',x:46,y:50},
 fair:{r:'frontier',s:'集',n:'縣集',d:'五日一集，買賣糧布農具。',bg:'market',x:80,y:76},
 yamen2:{r:'frontier',s:'衙',n:'縣衙',d:'縣令與獄掾所在，流人須按時點卯。',bg:'palace',x:62,y:22},
 mountain:{r:'frontier',s:'山',n:'深山',d:'雲霧深處，傳說住著奇人。',bg:'title',x:14,y:14,wild:1},
 road:{r:'road',s:'途',n:'驛道營地',d:'押解的隊伍在此歇腳。',bg:'camp',x:50,y:50}
};
var REGION_PLACES={xianyang:['lodge','clinic','market','plum','camp','tavern','palace','study','yamen','school','farm','courtyard'],frontier:['home','field','forest','river','village','fair','yamen2','mountain'],road:['road']};
var EXILE_DEST=[{k:'shu',n:'蜀郡',d:'巴山蜀水，潮濕多瘴',dt:2,days:14},{k:'shang',n:'上郡',d:'黃土高坡，風沙苦寒',dt:-5,days:12},{k:'longxi',n:'隴西',d:'隴山之西，羌戎雜處',dt:-3,days:16}];
/* 物品 */
var ITEMS={
 grain:{n:'粟米',k:'food',p:6,food:22,d:'一升粟米，煮粥可飽一餐'},cake:{n:'麥餅',k:'food',p:5,food:18},gruel:{n:'稀粥',k:'food',p:2,food:10},
 veg:{n:'野菜',k:'food',p:1,food:7},fruit:{n:'野果',k:'food',p:1,food:5},mush:{n:'菌菇',k:'food',p:2,food:8},
 vegP:{n:'野菜',k:'food',p:1,food:7,poison:1,hide:1},fruitP:{n:'野果',k:'food',p:1,food:5,poison:1,hide:1},mushP:{n:'菌菇',k:'food',p:2,food:8,poison:2,hide:1},
 jerky:{n:'乾肉',k:'food',p:14,food:25},fish:{n:'鮮魚',k:'food',p:6,food:15},egg:{n:'雞蛋',k:'food',p:2,food:6},
 alcohol:{n:'酒精',k:'med',p:30,d:'蒸餾所得，消毒用'},bandage:{n:'繃帶',k:'med',p:6,d:'煮沸過的潔淨布條'},thread:{n:'縫合線',k:'med',p:10,d:'蠶絲浸酒製成'},
 antipyr:{n:'退燒散',k:'med',p:18,d:'柳樹皮提煉，退熱止痛'},ors:{n:'補液包',k:'med',p:6,d:'鹽糖配比，沖水補液'},salve:{n:'金創藥',k:'med',p:12,d:'傳統止血藥膏'},
 herb:{n:'草藥',k:'med',p:3},willow:{n:'柳樹皮',k:'mat',p:2},garlic:{n:'大蒜',k:'mat',p:2},garlicx:{n:'蒜汁',k:'med',p:10,d:'粗製抗菌汁液'},
 soap:{n:'草木灰皂',k:'med',p:8,d:'洗手潔身，減少疫病'},antidote:{n:'解毒湯',k:'med',p:20},splint:{n:'夾板',k:'med',p:5},
 wine:{n:'濁酒',k:'mat',p:8,gift:1},wood:{n:'柴薪',k:'mat',p:2},timber:{n:'木料',k:'mat',p:12},cloth:{n:'布',k:'mat',p:10},salt:{n:'鹽',k:'mat',p:5},honey:{n:'蜂蜜',k:'mat',p:12},
 fat:{n:'油脂',k:'mat',p:6},silk:{n:'蠶絲',k:'mat',p:15},seed:{n:'種子',k:'mat',p:4},thatch:{n:'茅草',k:'mat',p:1},clay:{n:'陶土',k:'mat',p:2},
 needle:{n:'針線包',k:'tool',p:12,d:'縫補衣物用'},axe:{n:'柴刀',k:'tool',p:30},hoe:{n:'鋤頭',k:'tool',p:35},still:{n:'陶甑蒸餾器',k:'tool',p:80,d:'蒸餾酒精必備'},
 steth:{n:'聽診筒',k:'tool',p:0,d:'師父所製的木筒，貼胸可聽心肺'},scalpel:{n:'手術刀具',k:'tool',p:120,d:'師父傳下的柳葉刀、鉗、針'},
 winterc:{n:'冬衣',k:'wear',p:60,d:'厚實棉麻冬衣，禦寒'},sandal:{n:'草鞋',k:'wear',p:3,d:'護腳，走長路少磨泡'},
 candy:{n:'糖人',k:'gift',p:4,gift:1},bamboo:{n:'竹簡',k:'gift',p:10,gift:1},rouge:{n:'胭脂',k:'gift',p:25,gift:1},jade:{n:'玉佩',k:'gift',p:120,gift:1},sword:{n:'好劍',k:'gift',p:150,gift:1},
 qinpu:{n:'古琴譜',k:'gift',p:35,gift:1},warmer:{n:'暖手爐',k:'gift',p:30,gift:1},ink:{n:'墨錠',k:'gift',p:15,gift:1},osm:{n:'桂花糖',k:'gift',p:6,gift:1},go:{n:'墨玉棋子',k:'gift',p:60,gift:1},
 notes:{n:'師父手札',k:'book',p:0,d:'解剖圖、刀法、藥理，西方醫術的心血'},lawbook:{n:'秦律抄本',k:'book',p:40,d:'讀之長文墨，利於吏試'},
 dose:{n:'緩解藥',k:'med',p:0,d:'壓制體內舊毒的藥（身世）'}
};
var SHOPS={market:['grain','cake','jerky','egg','wine','wood','timber','cloth','salt','honey','fat','silk','seed','needle','axe','hoe','still','winterc','sandal','herb','garlic','candy','bamboo','rouge','jade','sword','qinpu','warmer','ink','osm','go','lawbook'],fair:['grain','cake','jerky','wine','wood','cloth','salt','fat','seed','needle','axe','hoe','sandal','herb','garlic','winterc','candy','bamboo']};
/* 西醫技法 */
var TECHS={
 wash:{n:'煮沸洗手',d:'術前以皂與沸水洗手、煮器械'},alco:{n:'酒精消毒',d:'酒精擦拭傷口與器械',need:{alcohol:1}},debr:{n:'清創',d:'清除壞死組織與異物'},
 suture:{n:'縫合',d:'以縫合線閉合傷口',need:{thread:1}},bandage:{n:'包紮',d:'潔淨繃帶包覆',need:{bandage:1}},drain:{n:'切開引流',d:'切開膿腫排膿'},
 splint:{n:'夾板固定',d:'骨折復位後固定',need:{splint:1}},reduce:{n:'手法復位',d:'脫臼、骨折復位'},fever:{n:'退燒',d:'退燒散＋物理降溫',need:{antipyr:1}},
 ors:{n:'補液',d:'鹽糖水小口頻服',need:{ors:1}},isolate:{n:'隔離',d:'病患分室、器物煮沸'},tourn:{n:'止血帶',d:'近心端紮緊止血'},
 amput:{n:'截肢',d:'壞疽不可救時截去肢體以保命'},deliver:{n:'助產',d:'轉胎、側切、接生'},listen:{n:'聽診',d:'以聽診筒聽心肺',tool:'steth'},
 garlic:{n:'蒜汁抗菌',d:'外敷內服蒜汁',need:{garlicx:1}},rest:{n:'臥床靜養',d:'囑咐休息飲食'},herbs:{n:'草藥湯',d:'傳統湯藥（輔助）'},
 antid:{n:'解毒湯',d:'催吐後灌服解毒湯',need:{antidote:1}},incant:{n:'符水祝由',d:'方士之法（有害）'},bleed:{n:'放血',d:'古法放血（多半有害）'}
};
var TECH_ORDER=['wash','alco','debr','drain','suture','bandage','reduce','splint','tourn','amput','fever','ors','antid','garlic','isolate','deliver','listen','rest','herbs','incant','bleed'];
var TECH_BASIC=['wash','alco','debr','suture','bandage','drain','reduce','splint','fever','ors','antid','isolate','listen','rest','herbs','tourn'];
/* 西醫病例：vit 生命徵象、ex 檢查、dx 診斷、seq 理想步驟（依序）、bad 有害步驟 */
var CASES=[
 {k:'cut',p:'手臂被鐮刀割傷的農夫',c:'傷口長三寸，沾滿泥土',vit:{t:'37.2',pulse:'96 快',resp:'平穩',mind:'清醒'},ex:{look:'傷緣不齊、有泥沙',touch:'未傷及骨',listen:'心肺無異'},dx:'開放性割傷（污染）',wrong:['骨折','中暑'],seq:['wash','alco','debr','suture','bandage'],bad:['incant','bleed'],lv:1,fee:30},
 {k:'abscess',p:'腿上腫了個大膿包的挑夫',c:'紅腫熱痛，按之波動',vit:{t:'38.4',pulse:'104',resp:'略促',mind:'清醒'},ex:{look:'腫塊頂端發白',touch:'按之有波動感',listen:'心肺無異'},dx:'膿腫',wrong:['毒蛇咬傷','骨折'],seq:['wash','alco','drain','bandage'],bad:['suture','bleed'],lv:1,fee:30},
 {k:'fracture',p:'從屋頂摔下的工匠',c:'小腿變形，痛不可觸',vit:{t:'36.9',pulse:'110',resp:'急促',mind:'清醒、劇痛'},ex:{look:'小腿成角畸形',touch:'骨擦音，皮膚未破',listen:'心肺無異'},dx:'閉合性脛骨骨折',wrong:['扭傷','膿腫'],seq:['reduce','splint','rest'],bad:['bleed','drain'],lv:2,fee:50},
 {k:'disloc',p:'摔跤時肩膀脫臼的少年',c:'肩頭塌陷，手臂抬不起',vit:{t:'36.8',pulse:'100',resp:'平穩',mind:'清醒'},ex:{look:'肩峰突出、方肩',touch:'肱骨頭不在原位',listen:'心肺無異'},dx:'肩關節脫臼',wrong:['骨折','中風'],seq:['reduce','bandage','rest'],bad:['amput','bleed'],lv:1,fee:25},
 {k:'fever',p:'高燒三日的孩童',c:'渾身滾燙、昏昏欲睡',vit:{t:'40.1',pulse:'140 快',resp:'急促',mind:'嗜睡'},ex:{look:'口唇乾裂',touch:'皮膚滾燙、頸項柔軟',listen:'肺音清'},dx:'高熱脫水',wrong:['中邪','風寒輕症'],seq:['fever','ors','rest'],bad:['incant','bleed'],lv:1,fee:20},
 {k:'diarrhea',p:'上吐下瀉的一家人',c:'井邊數戶同時發病',vit:{t:'37.8',pulse:'120 弱',resp:'略促',mind:'虛弱'},ex:{look:'眼窩凹陷、皮膚皺',touch:'腹軟無壓痛',listen:'腸鳴亢進'},dx:'腹瀉脫水（井水不潔）',wrong:['食積','中毒'],seq:['ors','isolate','wash'],bad:['bleed','incant'],lv:2,fee:35,pub:1},
 {k:'arrow',p:'中了箭的兵士',c:'箭頭仍在大腿肉裡',vit:{t:'37.4',pulse:'118',resp:'急促',mind:'清醒'},ex:{look:'箭桿外露，滲血',touch:'箭頭有倒鉤',listen:'心肺無異'},dx:'箭傷（異物存留）',wrong:['骨折','膿腫'],seq:['tourn','wash','alco','debr','suture','bandage'],bad:['bleed','incant'],lv:2,fee:50},
 {k:'burn',p:'被滾油燙傷的廚娘',c:'手臂大片起泡',vit:{t:'37.0',pulse:'108',resp:'平穩',mind:'清醒、劇痛'},ex:{look:'水泡、部分破皮',touch:'疼痛明顯（淺二度）',listen:'心肺無異'},dx:'燙傷（淺二度）',wrong:['膿腫','疥瘡'],seq:['wash','bandage','ors'],bad:['debr','bleed'],lv:1,fee:25},
 {k:'gangrene',p:'腳趾發黑的老兵',c:'傷口潰爛發臭，黑色上延至踝',vit:{t:'39.2',pulse:'124',resp:'急促',mind:'時有譫語'},ex:{look:'足部發黑、捻髮音',touch:'冰冷無知覺',listen:'心音急'},dx:'壞疽（危及性命）',wrong:['凍瘡','痛風'],seq:['tourn','wash','alco','amput','bandage'],bad:['incant','herbs'],lv:3,fee:80,amp:1},
 {k:'append',p:'右下腹劇痛的書生',c:'痛從臍周轉到右下腹',vit:{t:'38.3',pulse:'110',resp:'淺快',mind:'清醒'},ex:{look:'屈膝蜷臥',touch:'右下腹壓痛、反跳痛',listen:'腸鳴減弱'},dx:'腸癰（闌尾發炎）',wrong:['食積','月事痛'],seq:['wash','alco','drain','suture','bandage'],bad:['bleed','herbs'],lv:3,fee:90,risky:1},
 {k:'birth',p:'難產一日一夜的婦人',c:'胎位不正，力竭',vit:{t:'37.6',pulse:'120',resp:'急促',mind:'力竭'},ex:{look:'宮縮無力',touch:'胎位橫臥',listen:'胎心尚在'},dx:'難產（胎位不正）',wrong:['腹瀉','中暑'],seq:['wash','deliver','ors'],bad:['incant','bleed'],lv:3,fee:70},
 {k:'tetanus',p:'牙關緊閉的鐵匠',c:'半月前被鏽釘扎傷',vit:{t:'38.0',pulse:'112',resp:'艱難',mind:'清醒、抽搐'},ex:{look:'苦笑面容、角弓反張',touch:'肌肉強直',listen:'呼吸費力'},dx:'破傷風',wrong:['中邪','中風'],seq:['wash','debr','isolate','rest'],bad:['incant','bleed'],lv:3,fee:60},
 {k:'lung',p:'咳嗽胸痛的老婦',c:'高燒咳黃痰，胸口刺痛',vit:{t:'39.0',pulse:'108',resp:'急促',mind:'清醒'},ex:{look:'口唇微紺',touch:'胸壁無傷',listen:'右下肺水泡音'},dx:'肺炎',wrong:['肺癆','心痛'],seq:['listen','fever','garlic','rest'],bad:['bleed','incant'],lv:2,fee:40},
 {k:'poison',p:'誤食毒菇腹痛如絞的漢子',c:'吃了山裡採的白菌，吐瀉不止',vit:{t:'37.3',pulse:'124',resp:'急促',mind:'煩躁'},ex:{look:'面色青灰、冷汗',touch:'腹痛拒按',listen:'腸鳴亢進'},dx:'誤食毒菌中毒',wrong:['腸癰','中邪'],seq:['antid','ors','rest'],bad:['bleed','incant'],lv:2,fee:35},
 {k:'snake',p:'被毒蛇咬了腳踝的樵夫',c:'兩個牙印，腫脹上延',vit:{t:'37.5',pulse:'116',resp:'略促',mind:'驚恐'},ex:{look:'牙印、瘀斑',touch:'腫脹至小腿',listen:'心肺無異'},dx:'毒蛇咬傷',wrong:['膿腫','扭傷'],seq:['rest','wash','bandage'],bad:['tourn','bleed'],lv:2,fee:40}
];
/* 製藥配方 */
var RECIPES=[
 {id:'alcohol',n:'蒸餾酒精',need:{wine:2,wood:1},tool:'still',out:1,sk:3,d:'濁酒入陶甑，取最先滴出的烈液'},
 {id:'antipyr',n:'柳皮退燒散',need:{willow:2,wood:1},out:2,sk:2,d:'柳樹皮久煎濃縮、曬乾研末'},
 {id:'bandage',n:'煮沸繃帶',need:{cloth:1,wood:1},out:3,sk:1,d:'布條沸煮晾乾'},
 {id:'thread',n:'製縫合線',need:{silk:1,alcohol:1},out:3,sk:2,d:'蠶絲搓線、浸酒精'},
 {id:'ors',n:'鹽糖補液',need:{salt:1,honey:1},out:3,sk:1,d:'鹽一撮、蜜一勺、沸水一碗'},
 {id:'soap',n:'草木灰皂',need:{fat:1,wood:1},out:2,sk:1,d:'草木灰水與油脂熬製'},
 {id:'garlicx',n:'蒜汁',need:{garlic:2},out:1,sk:1,d:'搗爛取汁，即製即用'},
 {id:'antidote',n:'解毒湯',need:{herb:2},out:1,sk:1,d:'甘草綠豆之屬'},
 {id:'splint',n:'削製夾板',need:{timber:1},out:3,sk:1,d:'削木為板'}
];
/* 野外採集：可辨識（hint 與 poison 外觀相似） */
var FORAGE=[
 {k:'veg',n:'一叢薺菜',t:'葉緣羽狀分裂，揉之有清香',safe:1},
 {k:'vegP',n:'一叢「野芹」',t:'莖有紫斑，揉之有鼠尿般怪味',safe:0,real:'毒芹'},
 {k:'mush',n:'幾朵褐色菌菇',t:'菌蓋灰褐，菌柄無環，斷面不變色',safe:1},
 {k:'mushP',n:'幾朵白色菌菇',t:'通體雪白，菌柄有環、基部有菌托',safe:0,real:'白毒傘'},
 {k:'fruit',n:'一串紅色漿果',t:'鳥雀啄食過，味酸甜',safe:1},
 {k:'fruitP',n:'一串黑亮漿果',t:'無鳥啄痕，汁液發苦',safe:0,real:'龍葵生果'},
 {k:'herb',n:'一把車前草',t:'葉基生，穗狀花序',safe:1},
 {k:'willow',n:'柳樹皮',t:'河邊垂柳，剝下內皮',safe:1,always:1},
 {k:'wood',n:'一捆柴薪',t:'枯枝乾燥易燃',safe:1,always:1},
 {k:'thatch',n:'一捆茅草',t:'可蓋屋頂',safe:1,always:1}
];
/* 官秩與爵位 */
var OFFICE=['','佐史','斗食吏','百石卒史','二百石縣丞','六百石縣令','千石郡丞','二千石郡守','中二千石九卿','上卿','丞相'];
var OFFICE_PAY=[0,40,60,100,180,320,480,700,1000,1400,2000];
var MEDOFF=['','縣醫','郡醫','侍醫','太醫丞','太醫令'];
var MEDOFF_PAY=[0,60,120,260,420,700];
var RANKS=['','公士','上造','簪裊','不更','大夫','官大夫','公大夫','公乘','五大夫','左庶長','右庶長','左更','中更','右更','少上造','大上造','駟車庶長','大庶長','關內侯','徹侯'];
var TIERS=[{n:'寒門',v:0},{n:'富戶',v:40},{n:'士族',v:120},{n:'望族',v:260}];
/* 人物生成 */
var SURNAMES='王李張趙陳劉孫周吳鄭馮白蘇沈葉顧韓魏楊黃林何高羅宋唐許鄧蕭曹程范田方石姜夏呂任江陸莊嚴秦衛燕齊屈景昭項樊酈'.split('');
var GN_M=['安','平','武','信','忠','義','禮','智','恆','遠','峻','朗','昭','承','澈','衡','禹','稷','嘉','勝','騫','煥','昱','臻','翊','修','暉','岳','柏','歧'];
var GN_F=['芷','蘅','黛','茵','葵','荷','蘭','瑤','瑾','嫣','姝','婉','妍','嬿','芊','蓁','苓','萱','蕙','蘊','窈','綰','綺','素','青','雲','鳶','霜','晞','棠'];
var GN_2=['之','子','伯','仲','叔','季','元','長','少','小'];
var MILK=['阿蠻','阿福','狗兒','石頭','豆豆','團團','小滿','阿圓','喜兒','栓子','丫丫','平安'];
var TRAITS={溫和:{gos:2,sym:3},暴躁:{sym:-2,fight:3},精明:{trade:2},憨厚:{sym:2},貪財:{bribe:3,steal:1},仗義:{sym:3,help:3},膽小:{fight:-3},傲慢:{sym:-2},多疑:{trust:-2},熱心:{help:3,gos:2},
 刻薄:{sym:-3,gos:3},開朗:{gos:2},沉默:{gos:-3},好色:{lust:3},孝順:{fam:3},懶散:{work:-3},勤快:{work:3},狡猾:{steal:2,bribe:1},正直:{bribe:-3,help:2},善妒:{jeal:3}};
var TRAIT_LIST=Object.keys(TRAITS);
var JOBS={doctor:'西醫',farmer:'農夫',hunter:'獵戶',trader:'商販',owner:'掌櫃',guard:'衙役',clerk:'縣吏',soldier:'兵士',smith:'鐵匠',weaver:'織工',tradoc:'醫者',wizard:'巫醫',fangshi:'方士',scholar:'儒生',xia:'遊俠',beggar:'乞丐',singer:'樂伎',boat:'船夫',carpenter:'木匠',none:'閒人',child:'孩童',exile:'流人',apprentice:'學徒'};
var LIKES=['酒','糖','竹簡','布帛','胭脂','好劍','琴譜','肉','玉器','花草','糕點','兵書'];
/* 遺傳：天賦（顯性機率 dom）與隱藏基因 */
var GENES={
 prodigy:{n:'神童',fx:{wit:4},dom:0.15,good:1},iron:{n:'百病不侵',fx:{con:4},dom:0.15,good:1},beauty:{n:'傾城',fx:{look:5},dom:0.2,good:1},
 heart:{n:'先天心疾',fx:{con:-5},dom:0.05,bad:1},mute:{n:'口吃',fx:{cha:-3},dom:0.1,bad:1},memory:{n:'過目不忘',fx:{wit:3},dom:0.1,good:1},
 strong:{n:'天生神力',fx:{con:3},dom:0.15,good:1},hand:{n:'醫者之手',fx:{dex:4},dom:0.1,good:1},silver:{n:'銀髮',fx:{},dom:0.05,look:'silver'},
 migraine:{n:'頭風',fx:{con:-2},dom:0.25,bad:1},longev:{n:'長壽',fx:{con:2},dom:0.2,good:1,life:10},color:{n:'色盲',fx:{dex:-2},dom:0.05,bad:1}
};
var HAIR=['#1a1414','#2a1c18','#3a2a20','#4a3626','#6a4a30'];
var SKIN=['#f8e6da','#f2dccc','#e6c6ae','#d4ae90'];
/* 有立繪的歷史人物（原創動漫化，均為成年人）＋無立繪歷史人物 */
var NAMED={
 yingzheng:{n:'嬴政',g:'m',age:24,job:'秦王',title:'秦王',col:'#7a1f2b',sub:'玄袍金冠的青年君王',pers:['多疑','精明'],like:['兵書','玉器'],auth:10,
  bio:'秦國之主，冷峻寡言，夜不能寐。',gene:{con:12,wit:17,look:15,cha:15,dex:10},hid:['migraine'],ail:'頭痛失眠',at:['palace','palace','palace','study','study','courtyard'],die:210},
 mengtian:{n:'蒙恬',g:'m',age:23,job:'將軍',title:'將軍',col:'#3d5a7a',sub:'銀甲白袍的少年將軍',pers:['仗義','開朗'],like:['糖','好劍','酒'],auth:6,
  bio:'蒙氏將門之後，愛笑、愛熱鬧，常溜去市集。',gene:{con:16,wit:12,look:15,cha:14,dex:12},hid:['silver','strong'],ail:'舊箭傷',at:['camp','camp','camp','market','market','camp'],die:210},
 lisi:{n:'李斯',g:'m',age:27,job:'客卿',title:'客卿',col:'#2f6b5f',sub:'青衣含笑的謀士',pers:['精明','狡猾'],like:['竹簡','花草'],auth:6,
  bio:'上蔡布衣，入秦為客卿；笑意不達眼底。',gene:{con:11,wit:17,look:13,cha:14,dex:11},hid:[],ail:'胃疾',at:['yamen','palace','plum','study','study','study'],die:208},
 fusu:{n:'扶蘇',g:'m',age:22,job:'長公子',title:'長公子',col:'#8a7a5a',sub:'白裘溫潤的長公子',pers:['溫和','正直'],like:['琴譜','花草'],auth:5,
  bio:'秦王長子，愛書愛民，體弱畏寒。',gene:{con:9,wit:14,look:15,cha:15,dex:11},hid:['heart'],ail:'寒症',at:['study','study','school','plum','study','study'],die:210},
 hanfei:{n:'韓非',g:'m',age:28,job:'韓國公子',title:'公子',col:'#4a4a6a',sub:'寡言的天才公子',pers:['沉默','正直'],like:['竹簡','墨'],auth:2,
  bio:'著書十餘萬言，口吃而筆利。',gene:{con:10,wit:18,look:13,cha:8,dex:12},hid:['mute','memory'],ail:'心悸',at:['study','study','plum','plum','courtyard','study'],arrive:233,die:233},
 jingke:{n:'荊軻',g:'m',age:26,job:'遊俠',title:'遊俠',col:'#9a3a2a',sub:'醉臥酒肆的劍客',pers:['仗義','開朗'],like:['酒','好劍','琴譜'],auth:1,
  bio:'衛人，好讀書擊劍，嗜酒，一諾千金。',gene:{con:15,wit:12,look:13,cha:14,dex:15},hid:['strong'],ail:'舊毒',at:['market','market','tavern','tavern','tavern','tavern'],die:227},
 xuanye:{n:'玄夜',g:'m',age:25,job:'影衛',title:'影衛',col:'#3a3a48',sub:'銀髮覆面的影子',pers:['沉默','正直'],like:['糖','花草'],auth:1,hidden:1,
  bio:'權臣府中的影子，無名無姓。',gene:{con:15,wit:13,look:16,cha:9,dex:16},hid:['silver'],ail:'刀傷',at:['','','','','','courtyard']},
 xiawuju:{n:'夏無且',g:'m',age:40,job:'侍醫',title:'侍醫',col:'#6a5a3a',sub:'背著藥囊的宮中侍醫',pers:['刻薄','精明'],like:['竹簡','糕點'],auth:4,np:1,
  bio:'秦王侍醫，精湯藥，對刀圭之術嗤之以鼻。',gene:{con:11,wit:14,look:9,cha:10,dex:12},hid:[],at:['palace','palace','market','clinic','yamen','']},
 xufu:{n:'徐福',g:'m',age:35,job:'方士',title:'方士',col:'#5a4a7a',sub:'鶴氅羽扇的方士',pers:['狡猾','傲慢'],like:['玉器','酒'],auth:3,np:1,
  bio:'齊地方士，言海上有仙山、長生藥。',gene:{con:12,wit:15,look:12,cha:16,dex:10},hid:[],at:['market','tavern','palace','palace','tavern','courtyard'],leave:219},
 zhaogao:{n:'趙高',g:'m',age:30,job:'中車府令',title:'中車府令',col:'#4a3a2a',sub:'陰鷙謙卑的宦者',pers:['狡猾','多疑'],like:['玉器'],auth:6,np:1,
  bio:'精通獄法，深得君心。',gene:{con:11,wit:16,look:9,cha:12,dex:11},hid:[],at:['palace','palace','palace','yamen','palace','palace'],die:207},
 gaojianli:{n:'高漸離',g:'m',age:27,job:'樂師',title:'樂師',col:'#7a6a5a',sub:'抱筑的樂師',pers:['沉默','仗義'],like:['琴譜','酒'],auth:1,np:1,
  bio:'善擊筑，荊軻摯友。',gene:{con:12,wit:13,look:13,cha:12,dex:16},hid:[],at:['tavern','tavern','tavern','market','tavern','tavern'],die:218}
};
var NAMED_ORDER=['yingzheng','mengtian','lisi','fusu','hanfei','jingke','xuanye','xiawuju','xufu','zhaogao','gaojianli'];
var PORTRAITS=['yingzheng','mengtian','lisi','fusu','hanfei','jingke','xuanye'];
var RELNET=[['yingzheng','lisi','君臣·倚重'],['yingzheng','fusu','父子·理念相左'],['yingzheng','hanfei','求賢·猜忌'],['lisi','hanfei','同門·嫉才'],['mengtian','fusu','摯友'],['mengtian','yingzheng','君臣·忠誠'],['jingke','yingzheng','宿命·刺秦'],['jingke','gaojianli','知己'],['xiawuju','yingzheng','侍醫'],['zhaogao','yingzheng','近侍'],['xufu','yingzheng','求仙']];
var DEF_NAMES=['白芷','蘇問荊','沈若蘅','葉青黛','顧當歸'];
/* 家世（全隨機） */
var BIRTHS=[
 {k:'exile',n:'流放罪臣之家',w:3,gold:20,tier:0,d:'父親獲罪，全家流放邊地'},
 {k:'farm',n:'關中農家',w:3,gold:40,tier:0,d:'渭水邊世代耕作'},
 {k:'merchant',n:'咸陽商賈',w:2,gold:300,tier:1,d:'市集經營布帛'},
 {k:'gentry',n:'沒落士族',w:2,gold:120,tier:1,d:'祖上曾為大夫，家道中落'},
 {k:'tradoc',n:'醫者世家',w:2,gold:150,tier:1,d:'祖傳湯藥醫術'},
 {k:'orphan',n:'市井孤兒',w:1,gold:5,tier:0,d:'無父無母，在咸陽街頭討生活'}
];
var CRIMES=['父親直言進諫，觸怒權貴','父親被誣貪墨軍糧','祖父受嫪毐之亂牽連','父親替朋友作保，朋友叛逃','家中藏有禁書被告發'];
