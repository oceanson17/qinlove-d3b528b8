# 美術資源清單（assets/）

## 目前狀態（2026-10-07：v2 新增需求見第 5 節）
已整合正式美術（原圖在 `assets/raw/`，不入 git；由 `tools/art.py` 轉換）：

| 類別 | 檔案 | 處理 |
|---|---|---|
| 半身立繪 ×8 | `char_<id>.webp` | rembg（isnet-anime）去背 → 裁到人物外框、頭頂留 4% → 透明 WebP q85（每張 46–104KB）|
| 頭像 ×8 | `face_<id>.webp` | 由立繪裁頭部 192×192（地圖頭像、女主角小頭像、診治病人頭像）|
| 背景 ×9 | `bg_<k>.webp` | 1280×720 → WebP q80；直向畫面用 `object-fit:cover`，焦點見下表 |
| CG ×21 | （未有） | 暫用「正式背景＋角色立繪＋女主角立繪」合成佔位；放入 `cg_<id>.webp` 即自動取代 |

背景焦點（`src/03_art.js` 的 `ART.BGPOS`，值為 object-position x%；直向 420×912 只見原圖約 26% 闊度）：
clinic 66（藥櫃）、palace 50（正殿）、plum 43（梅徑）、market 43（街道）、camp 66（營帳軍旗）、night 39（月亮＋月洞門）、study 57（窗＋書案）、tavern 74（燈籠）、title 77（山＋梅枝）。
對應規則：`courtyard` 共用 `bg_night`；開場（青囊谷）用 `bg_title`。

立繪臉部中心（`ART.FACE`，圖寬%／圖高%）用嚟令立繪臉部置中、圖鑑卡裁切；更換立繪後要同步更新 `ART.FACE` 及 `tools/art.py` 的 `FACE`。
立繪顯示：高度＝立繪區 80%（頂部對齊），臉在對話框及選項之上；左右闊過畫面時兩側衣袖會被裁。
表情差分：`char_<id>_<expr>.webp`（smile/blush/sad/angry/shy）存在就用，否則用同一張。

重新處理：`/home/box/venv-rembg/bin/python tools/art.py && node build.js`（build 會掃描 assets/ 頂層 png/webp/jpg，以外部檔案載入，唔會 base64 內嵌）。

**規則**：全部為原創動漫角色，均為成年人；不得描繪或模仿任何真實人物或現有作品角色。參考圖只參考畫風（古風動漫、半身、精緻線條），不可臨摹。

共用風格前綴（Style）：
```
ancient Chinese historical game illustration, anime style, Warring States Qin era hanfu with cross collar, soft cel shading, delicate clean line art, pastel pink-white palette with vermilion and gold accents, original character, adult
```
共用負面提示（Negative）：
```
photorealistic, 3d render, real person, celebrity likeness, child, loli, modern clothing, text, logo, watermark, extra fingers, deformed hands, nsfw
```

## 1. 半身立繪（8 張，已完成；以下為原始提示詞）
尺寸 **1200×1800**（2:3），**透明背景 PNG**，腰部以上半身、正面略側、頭頂留約 8% 空白，人物置中。可另加表情差分：`char_<id>_smile.png`、`_blush`、`_sad`、`_angry`、`_shy`（同尺寸同構圖）。

| 檔名 | 角色 | 英文提示詞（接在 Style 後） |
|---|---|---|
| `char_yingzheng.png` | 嬴政（秦王） | half-body portrait, waist-up, facing viewer, a 24-year-old young king, long straight black hair with a golden ornate crown (mian-style headpiece with red jewels), sharp dark-red eyes, cold and dignified expression, black imperial robe with crimson inner collar and gold cloud embroidery, transparent background |
| `char_mengtian.png` | 蒙恬（少年將軍） | half-body portrait, waist-up, facing viewer, a 23-year-old young general, long silver-white high ponytail tied with a navy ribbon, bright blue eyes, warm sunny smile, white robe under polished silver scale armor with pauldrons, navy collar trim, transparent background |
| `char_lisi.png` | 李斯（客卿） | half-body portrait, waist-up, facing viewer, a 27-year-old scheming scholar-strategist, dark brown half-up hair with a small jade hairpin crown, gentle fox-like smile that does not reach the eyes, teal-green scholar robe with vermilion collar, a plum blossom branch nearby, transparent background |
| `char_fusu.png` | 扶蘇（長公子） | half-body portrait, waist-up, facing viewer, a 22-year-old gentle crown prince, soft brown hair in a neat topknot with small guan crown, kind warm brown eyes, pale and slightly frail, ivory robe with white fox-fur cloak, holding a small bronze hand warmer, transparent background |
| `char_hanfei.png` | 韓非（韓國公子） | half-body portrait, waist-up, facing viewer, a 28-year-old melancholic genius scholar, loose long black hair, shy downcast indigo eyes, faint blush, dark indigo robe with light grey collar, holding a bamboo scroll and brush, transparent background |
| `char_jingke.png` | 荊軻（遊俠） | half-body portrait, waist-up, facing viewer, a 26-year-old roguish wandering swordsman, messy dark brown hair with a red headband, carefree grin, slightly tanned skin, worn dark red-brown robe, bronze sword on his back, a wine gourd, transparent background |
| `char_xuanye.png` | 玄夜（影衛・隱藏） | half-body portrait, waist-up, facing viewer, a 25-year-old silent shadow guard, short silver hair, crimson eyes, black cloth mask covering the lower face, black close-fitting assassin robe with dark violet trim, moonlit mysterious atmosphere, transparent background |
| `char_heroine.png` | 女主角（青囊谷女神醫） | half-body portrait, waist-up, facing viewer, a young adult female divine doctor just graduated from a mountain sect, dark brown hair in twin buns with a pink plum-blossom hairpin and dangling ornaments, gentle brown eyes, soft pink-white hanfu with rose collar, a wooden medicine box strap across her chest and a red herbal sachet at her waist, transparent background |

## 2. 背景（9 張，已完成；以下為原始提示詞）
尺寸 **1080×1920**（9:16 直向），無人物，下方 35% 會被對話框蓋住，重點放在中上部。

| 檔名 | 場景 | 英文提示詞（接在 Style 後，去掉 original character, adult） |
|---|---|---|
| `bg_clinic.png` | 青囊醫館 | background art, no people, vertical composition, a cozy ancient Chinese herbal clinic interior, wall of wooden medicine drawers, hanging red lanterns, herbs on the counter, warm morning light |
| `bg_palace.png` | 咸陽宮 | background art, no people, vertical composition, Xianyang palace of the Qin state, grand stone stairs leading to a red-pillared hall with black roof, black Qin banners, misty sky |
| `bg_plum.png` | 梅林 | background art, no people, vertical composition, a plum blossom grove in light snow, pink and crimson blossoms, soft mist, romantic and quiet |
| `bg_market.png` | 咸陽市集 | background art, no people, vertical composition, a bustling ancient Xianyang market street, wooden stalls with colorful awnings, lanterns, sugar-figure vendor, warm afternoon |
| `bg_camp.png` | 城北軍營 | background art, no people, vertical composition, a Qin army camp north of the city, canvas tents, black banners with gold character, distant mountains, dusty plain |
| `bg_night.png` | 夜色庭院（courtyard 共用） | background art, no people, vertical composition, a moonlit night courtyard, full moon, bamboo grove, stone wall and red lanterns, cool blue tones |
| `bg_study.png` | 蘭台書房 | background art, no people, vertical composition, Lantai imperial library, shelves of bamboo scrolls, lattice window with soft light, low writing desk with ink stone |
| `bg_tavern.png` | 市井酒肆 | background art, no people, vertical composition, a lively ancient tavern at evening, wine flag, wooden tables and wine jars, warm lantern glow |
| `bg_title.png` | 標題畫面 | background art, no people, vertical composition, title screen landscape, misty layered mountains in ink-wash style, plum blossom branches in the foreground, falling petals, pastel pink sky, empty space in the upper center for a logo |

## 3. 里程碑 CG（21 張，未做，建議）
尺寸 **1080×1920**（9:16），角色與女主角同框（女主角參考 `char_heroine` 外觀），浪漫光影，下方 20% 會放字幕。

| 檔名 | 角色 | 標題 | 英文提示詞（接在 Style 後） |
|---|---|---|---|
| `cg_yz1.png` | 嬴政 | 夜半診脈 | romantic event CG, vertical, the heroine taking the pulse of the young king at his wrist by candlelight in a dark palace hall, he looks away tired but trusting, heroine with twin buns and pink hanfu |
| `cg_yz2.png` | 嬴政 | 玄袍覆肩 | romantic event CG, vertical, first snow outside the palace, the king places his black outer robe over the heroine's shoulders, heroine with twin buns and pink hanfu |
| `cg_yz3.png` | 嬴政 | 章台月下 | romantic event CG, vertical, under the moon on a palace terrace, the king holds the heroine's hand and confesses, both blushing, heroine with twin buns and pink hanfu |
| `cg_mt1.png` | 蒙恬 | 糖人與少年 | romantic event CG, vertical, the young general proudly hands the heroine a clumsy sugar figure shaped like her at the market, both laughing, heroine with twin buns and pink hanfu |
| `cg_mt2.png` | 蒙恬 | 策馬北原 | romantic event CG, vertical, the general and the heroine riding one horse across a wide northern grassland, wind in their hair, heroine with twin buns and pink hanfu |
| `cg_mt3.png` | 蒙恬 | 銀甲下的心跳 | romantic event CG, vertical, the general in silver armor under a plum tree, proposing to the heroine before leaving for the frontier, heroine with twin buns and pink hanfu |
| `cg_ls1.png` | 李斯 | 梅下對弈 | romantic event CG, vertical, the strategist and the heroine playing go under plum blossoms, petals falling on the board, heroine with twin buns and pink hanfu |
| `cg_ls2.png` | 李斯 | 卸下笑容 | romantic event CG, vertical, late night in a study, the strategist without his usual smile leans his forehead on the heroine's shoulder, heroine with twin buns and pink hanfu |
| `cg_ls3.png` | 李斯 | 一枝梅 | romantic event CG, vertical, the strategist places a plum branch in the heroine's palm, sincere expression, heroine with twin buns and pink hanfu |
| `cg_fs1.png` | 扶蘇 | 暖爐與白裘 | romantic event CG, vertical, the prince in white fur cloak hands the heroine his hand warmer in a cold library, heroine with twin buns and pink hanfu |
| `cg_fs2.png` | 扶蘇 | 琴聲 | romantic event CG, vertical, the prince playing a guqin for the heroine in the library, soft light, heroine with twin buns and pink hanfu |
| `cg_fs3.png` | 扶蘇 | 雪中誓言 | romantic event CG, vertical, the prince under a snowy plum tree, white fur covered in snow, making a promise to the heroine, heroine with twin buns and pink hanfu |
| `cg_hf1.png` | 韓非 | 墨痕 | romantic event CG, vertical, the shy scholar showing the heroine a bamboo slip with her name written on it, heroine with twin buns and pink hanfu |
| `cg_hf2.png` | 韓非 | 雨夜長談 | romantic event CG, vertical, rainy night, the scholar and the heroine talking by a window with candlelight, heroine with twin buns and pink hanfu |
| `cg_hf3.png` | 韓非 | 不再孤筆 | romantic event CG, vertical, the scholar asking the heroine to write a book together, holding her hands over a scroll, heroine with twin buns and pink hanfu |
| `cg_jk1.png` | 荊軻 | 酒肆初逢 | romantic event CG, vertical, the swordsman in a tavern pushing a bowl of water toward the heroine with a grin, heroine with twin buns and pink hanfu |
| `cg_jk2.png` | 荊軻 | 筑聲 | romantic event CG, vertical, in a tavern, a musician plays a zhu while the swordsman sings for the heroine, heroine with twin buns and pink hanfu |
| `cg_jk3.png` | 荊軻 | 易水寒 | romantic event CG, vertical, by the cold Yi river at night, the swordsman throws his sword into the water and turns back to the heroine, heroine with twin buns and pink hanfu |
| `cg_xy1.png` | 玄夜 | 影中人 | romantic event CG, vertical, night courtyard, the masked shadow guard catches the falling heroine by the waist, heroine with twin buns and pink hanfu |
| `cg_xy2.png` | 玄夜 | 名字 | romantic event CG, vertical, moonlight, the shadow guard stunned as the heroine gives him a name, heroine with twin buns and pink hanfu |
| `cg_xy3.png` | 玄夜 | 摘下面具 | romantic event CG, vertical, under plum blossoms the shadow guard removes his mask, revealing a pale gentle face, heroine with twin buns and pink hanfu |

## 4. 其他
- `bg_title` 已用於標題畫面（logo 文字由網頁繪製，上下加柔光）。
- 圖檔大小建議每張 < 400KB（WebP 品質 80–85）。
- 生成器只出 1280×720 橫向圖：立繪可照用（去背後裁切）；CG 若都係橫向，直向畫面會用 cover 裁走兩側，構圖請將兩人放中間 30% 闊度內。

## 5. v2 新增美術需求（未做；現時以 SVG 背景／剪影印章頭像代替）

共通風格（每條提示詞前面加）：`original anime-style character art, ancient Qin dynasty China setting (fictional), soft cel shading, muted ink-wash palette with warm accents, clean lineart, no text, no watermark` 。全部為原創動漫角色，不描繪真實人物。

檔名 → 用途 → 英文提示詞：

| 檔名 | 用途 | 提示詞 |
|---|---|---|
| `char_heroine_doc.webp` | 女主角西醫裝（行醫／手術場景立繪） | half-body portrait of a young woman physician, 19 years old, hair tied up in a simple bun wrapped in a white cloth cap, plain undyed linen robe with tight sleeves bound by cloth straps, a clean white apron, small leather satchel of instruments, calm focused eyes, holding a boiled cloth bandage, transparent background |
| `char_baby.webp` | 嬰兒開局／族譜子女（0–2 歲） | an infant swaddled in coarse hemp cloth with a small red cord bracelet, sleeping peacefully, simple soft lighting, transparent background |
| `char_child.webp` | 童年（3–13 歲） | a curious 8-year-old child in a short ancient Chinese tunic and trousers, hair in two small buns, holding a bamboo slip, bright smile, transparent background |
| `char_elder.webp` | 長者（祖母／老年主角） | a kind elderly woman in her seventies, grey hair pinned with a wooden hairpin, layered brown hemp robes, gentle wrinkles, leaning on a walking stick, transparent background |
| `bg_farm.webp` | 城郊田舍（農家開局） | a modest Qin-era farmhouse with rammed-earth walls and a thatched roof beside millet fields, the Wei river in the distance, morning mist, wide landscape |
| `bg_road.webp` | 流放路上（驛道營地） | a desolate exile road across a dry loess wasteland at dusk, a few ragged travellers resting by a small campfire beside an ox cart, distant beacon tower, cold wind, wide landscape |
| `bg_surgery.webp` | 醫館手術室（西醫處置） | interior of a small ancient clinic converted into a clean treatment room, a wooden table covered with boiled white cloth, copper basins of steaming water, rows of ceramic jars, a distilling apparatus, bright window light |
| `bg_village.webp` | 邊地里中 | a poor frontier village at the northern border, mud-brick houses, wooden palisade, goats, distant snowy mountains, overcast sky |
| `bg_field.webp` | 荒地／田（邊地與城郊共用；`bg_farm` 優先用於城郊田舍） | a rocky barren field being cleared for farming at the frontier, simple wooden hoes, piles of stones, wild grass, a small hut, late afternoon light |
| `bg_hut.webp` | 草棚／邊地的家 | a cramped interior of a straw hut with a clay stove, straw bedding, hanging dried herbs, a single oil lamp, warm dim light |
| `bg_forest.webp` | 後山林／深山採集 | a dense mountain forest with mossy rocks, mushrooms and wild herbs, shafts of light through pine trees |
| `bg_river.webp` | 河灘 | a pebbled riverbank with reeds, a simple fish trap, shallow clear water, distant hills |
| `face_xiawuju.webp`／`char_xiawuju.webp` | 夏無且（宮中侍醫，原創造型） | middle-aged court physician, neat beard, dark official robe with a medicine box on his back, cautious intelligent eyes, transparent background |
| `face_xufu.webp`／`char_xufu.webp` | 徐福（方士，原創造型） | a mysterious alchemist in flowing grey-blue robes decorated with star patterns, holding a gourd and a bundle of talismans, enigmatic smile, transparent background |
| `face_zhaogao.webp`／`char_zhaogao.webp` | 趙高（宦官，原創造型） | a pale, soft-spoken palace official in black and crimson robes with a tall hat, narrow smiling eyes, hands folded in sleeves, unsettling aura, transparent background |
| `face_gaojianli.webp`／`char_gaojianli.webp` | 高漸離（樂師，原創造型） | a lean young musician in simple dark robes carrying a zhu zither wrapped in cloth, melancholy gentle expression, loose hair tied with a ribbon, transparent background |

對應規則：場景先找 `bg_<地點id>`（如 `bg_farm`、`bg_road`），冇就用地點的背景鍵 `bg_<bg>`，再冇就用 SVG。`bg_surgery` 預留給醫館手術室（現暫用 `bg_clinic`）；`char_heroine_doc`、`char_baby/child/elder` 及四位配角立繪需要接駁程式（見 NOTES 已知限制）。

尺寸：立繪 1024×1536（透明 PNG/WebP），背景 1280×720。放入 `assets/` 後 `node build.js` 會自動偵測並取代 SVG。
