# 青囊·秦心（qinlove）— 開發筆記

- 線上：https://oceanson17.github.io/qinlove-d3b528b8/
- 最新線上 md5：bff62dfce96f01dc34b043541b198668
- Repo：https://github.com/oceanson17/qinlove-d3b528b8 （main 分支根目錄＝GitHub Pages）
- 以《秦風》（/workspace/qinfeng）為基礎的**古風乙女 AI 文字戀愛遊戲**；《秦風》本身及其線上版未有改動。
- 單檔 ES5：`src/NN_*.js` + `ui/style.css` 由 `node build.js` 嵌入 `shell.html` → `index.html`；build 時掃描 `assets/` 產生 `ASSET_FILES`（有圖用圖，冇圖用 SVG）。
- 備份：`bash bk.sh <label>` → /home/box/sanguo-backup/qinlove/（tgz＋index_<label>_TS.html＋md5）。
- 推送：`git -c credential.helper='!gh auth git-credential' push`；唔好用廣泛 pkill node。

## 模組
| 檔 | 內容 |
|---|---|
| 01_data | 7 位可攻略角色（含隱藏玄夜）、8 地點、禮物/藥材、8 病例＋7 角色病況、5 章、21 CG、12 結局、4 節日、關係網 |
| 02_state | 設定（localStorage `qlv_settings`）、PRESETS（DeepSeek/xAI/OpenAI/OpenRouter/Gemini/Groq/自訂）、新局、存檔（自動＋3 格 `qlv_save_*`）|
| 03_art | 參數化 SVG 古風動漫半身立繪（6 種表情）、9 張 SVG 背景、CG 合成；`ART.html()` 優先用 assets 圖檔 |
| 04_ai | OpenAI 相容 API（quirks 重試、json 格式、逾時）、手動貼上模式、驗證/清洗、乙女系統提示；知情防火牆 FW（M13）、反失憶 Nom（M21）、心態卡 Mood（M20）、AI.fail 封鎖/暫停 |
| 05_engine | 時間（四時辰、四季）、數值與好感提示、里程碑（25/50/75＋心動/信任門檻）、章節推進、結局判定、Meta（跨存檔 CG/結局）、世界節制 WS（M26：限頻、須有起因、近期大事）|
| 06_story | 開場、地點、初遇、閒聊/心願/心結、送禮、約會（地點偏好＋問答）、診治角色、坐診、製藥、採藥、市集、讀書、撫琴、21 段里程碑、主線事件（入宮→香中毒三線索→風雨（救韓非／追荊軻）→終章告白）、節日、修羅場、AI 接續、斷線接續（M15）|
| 07_input | 書信（模板＋回信）、輸入分流：💬說／⚙指令（Act 動作、Ncmd 導演命令＋權限，M24/M25）／📜設定（Decl 宣告成真＋寬限調整，M27）、秘密得知（M22）|
| 08_ui | VN 播放（打字機、自動、快進、回顧）、HUD、好感印章提示、地圖、圖鑑/關係網/我、書信（八行箋直書）、CG 相冊/結局、選單/存讀檔/設定、名字、手動 AI 對話框、VV 視窗＋Kb 全屏輸入面板（M19）|
| 09_medic | 望聞問切→辨證→處方小遊戲（醫術 25 自動一診、才智 15 提示劣方）|

## 測試（bash t/all.sh chromium|webkit；420×912）
- play1：開局改名→行醫→市集→蒙恬/李斯/荊軻三線第一里程碑＋CG→診治→書信→圖鑑/相冊/選單→存讀檔→重開續玩
- ai1：AI 模擬：場景/選項/fx/記憶、系統規則、反失憶、防火牆、說/指令/設定、命令權限與執行、斷線→離線→重試、讀檔後接續、402 封鎖、壞 JSON 重試、手動貼上、離線
- story1：五章主線、三線索指認、風雨抉擇、節日、修羅場、HE/BE/隱藏/NE 結局、世界節制 120 日模擬
- kb1（觸控）：全屏輸入面板、IME Enter、收起保留草稿、親筆回信、版面不溢出/觸控目標 ≥38px
- monkey.js <engine> <steps> <seed>：亂點＋亂輸入＋AI 亂碼/失敗，檢查錯誤與數值不變式

## 已知限制
- 立繪、背景、頭像已用正式美術（見下「美術整合」）；CG 仍為佔位（背景＋立繪合成），清單見 assets/README.md。
- 立繪只有一個表情（無差分），對白表情變化只會有輕微彈動。
- 離線劇情台詞為固定劇本＋關鍵詞回應；自由對話要開 AI 才豐富。
- 存檔在瀏覽器 localStorage：Safari 與主畫面 App 不互通。

## 試玩發現與修正（v1）
1. `Eng.pass(0)` 被當成 1：初遇、對白都會偷偷過一個時辰，角色講講下就走咗 → 修正（undefined 才預設 1）。
2. 地圖移動消耗時辰 → 地圖顯示「某人在此」但到埗已換時辰 → 改為移動不耗時，只有行動耗時。
3. 對話對象換時辰就消失 → 加「陪伴」：互動過的角色在同地點最多再留 2 個時辰。
4. CG 關閉時重覆回地圖，吞咗後面待處理事件（例如斷線接續提示）→ CG 改為關閉後才回地圖。
5. 多個 inline SVG 同 id，第一個喺隱藏畫面時漸層失效（地圖頭像空白）→ 每次插入改唯一 id。
6. 「擁抱他」等動作在無人時報錯（monkey 發現）→ 改為「身邊沒有人」。
7. 介面：提示字條遮住面板標題 → 移到底部；未相識圖鑑卡一片灰 → 加「緣」字印剪影；地圖印章字錯（咸陽宮顯示「陽」）→ 每地點專屬印字；女主角說話時無頭像 → 名牌旁加圓形頭像；頭像裁切改用臉部 viewBox。
8. 魅力／才智原本冇用 → 魅力 15 加送禮/約會收益、才智 15 問診提示、才智 20 可救韓非；加「梅下撫琴」「蘭台讀書」行動；心境低落有提示。
9. 早期蒙恬「北疆巡邊」會令新手搵唔到人 → 第 12 日後才可能發生。
10. 全屏輸入面板可直接點模式籤切換說／指令／設定，placeholder 跟模式變。

## 美術整合（2026-10-06）
- 原圖 `assets/raw/`（1280×720 JPG，不入 git，備份 tar 有包）→ `tools/art.py` 轉成 `assets/char_*.webp`（透明）、`face_*.webp`（頭像）、`bg_*.webp`。
- 去背：rembg isnet-anime（venv `/home/box/venv-rembg`），白衣／銀甲／白裘／銀髮（蒙恬、扶蘇、玄夜）用對照圖逐張檢查冇被挖空；alpha<12 清零去殘影。
- `ART.html` 背景圖加 object-position（`ART.BGPOS`）；立繪 img 加 `class="pimg"` 及 `--fx/--fy`（`ART.FACE`），CSS 用 translateX(-fx) 令臉置中；`ART.face` 優先 `face_<id>`。
- 立繪：立繪區頂部對齊、高 80%（420×912 下臉中心約 y≈250，高過選項同對話框）。
- 背景加暗角＋上下柔光（`#fx`）；標題 `.tbg:after` 柔光令 logo/按鈕易讀。
- CG：未有 `cg_*` 時用 `ART.cgImg` 合成（模糊背景＋角色色調＋角色立繪＋女主角前景＋金框）；全部缺圖才退回 SVG。
- 標題畫面後 1.2 秒預載全部圖檔（約 1.9MB），轉場唔會閃。
- 截圖：`node t/art.js chromium|webkit` → `screenshots/art_<eng>_NN_*.png`。
