# 青囊·秦心（qinlove）— 開發筆記

- 線上：https://oceanson17.github.io/qinlove-d3b528b8/
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
- 無圖像生成工具：立繪/背景/CG 為 SVG 佔位，清單與提示詞見 assets/README.md。
- 離線劇情台詞為固定劇本＋關鍵詞回應；自由對話要開 AI 才豐富。
- 存檔在瀏覽器 localStorage：Safari 與主畫面 App 不互通。
