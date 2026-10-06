# 美術資源清單（assets/）

目前無圖像生成工具，遊戲內全部用高質素 SVG 佔位（立繪、背景、CG 都會自動畫出）。
把下列檔案放入 `assets/`（PNG/WebP/JPG 均可，檔名不含副檔名要一致），執行 `node build.js` 重新建置，遊戲就會自動改用圖檔；缺少的仍用 SVG。

**規則**：全部為原創動漫角色，均為成年人；不得描繪或模仿任何真實人物或現有作品角色。參考圖只參考畫風（古風動漫乙女、半身、精緻線條），不可臨摹。

共用風格前綴（Style）：
```
ancient Chinese otome game illustration, anime style, Warring States Qin era hanfu with cross collar, soft cel shading, delicate clean line art, pastel pink-white palette with vermilion and gold accents, original character, adult
```
共用負面提示（Negative）：
```
photorealistic, 3d render, real person, celebrity likeness, child, loli, modern clothing, text, logo, watermark, extra fingers, deformed hands, nsfw
```

## 1. 半身立繪（8 張，必要）
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

## 2. 背景（9 張，必要）
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

## 3. 里程碑 CG（21 張，建議）
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

## 4. 其他（選用）
- `bg_title.png` 若加入，標題畫面背景會換成圖檔（logo 文字仍由網頁繪製）。
- 圖檔大小建議每張 < 400KB（WebP 品質 80），iPhone 載入較快。
