# 《青囊·秦心》新增場景／人物美術待補

Q 版大頭細身 chibi／水彩風格，與現有 `assets/char_*.webp`、`bg_*.webp` 一致。  
目前新場景複用現有背景；新人物暫用剪影印章（蒙毅暫借蒙恬頭像、鄭國暫借韓非頭像）。

## 給 Parent 的 GenerateImage 提示詞

### 背景（可選，放入 `assets/` 即自動生效）
- `bg_herbshop.webp` — Q-version chibi watercolor background, Qin dynasty herbal medicine market street, wooden medicine cabinets, hanging dried herbs, warm daylight, soft watercolor, vertical 9:16, no text
- `bg_dock.webp` — Q-version chibi watercolor, Wei River dock at Xianyang, wooden boats, porters, willow trees, soft mist, vertical 9:16, no text
- `bg_shrine.webp` — Q-version chibi watercolor, Qin ancestral shrine and altar, stone steps, incense smoke, solemn warm tones, vertical 9:16, no text
- `bg_garden.webp` — Q-version chibi watercolor, Shanglin park outer woods and pond, plum blossoms, soft green, vertical 9:16, no text
- `bg_prison.webp` — Q-version chibi watercolor, ancient Qin jail courtyard, wooden gates, muted browns, not scary, vertical 9:16, no text
- `bg_embassy.webp` — Q-version chibi watercolor, guest lodge for foreign envoys, lanterns, carved wood hall, warm interior, vertical 9:16, no text

### 立繪＋頭像（`char_<id>.webp` + `face_<id>.webp`）
風格：Q 版大頭細身、古風動漫、透明底、半身偏上。

- `mengyi` 蒙毅 — young Qin judicial officer, silver-gray hair like Meng Tian, cyan-blue robe, serious gentle chibi face, holding bamboo slips
- `baqing` 巴清 — young female Ba merchant, ornate brocade robe amber-gold, pearl earrings, confident smiling chibi, merchant pouch
- `nanheng` 南蘅 — young female Chu physician, green medical robe, herb pouch, proud competitive chibi expression, hairpin
- `yanshu` 晏姝 — young Qi envoy lady, purple-black elegant robe, jade pendant, cautious soft smile chibi
- `zhengguo` 鄭國 — middle-aged Han hydraulic engineer, muddy boots, bamboo measuring ruler, honest quiet chibi, practical clothes
- `aying` 阿瓔 — teenage palace maid, soft pink palace dress, shy chibi, holding candy or flower

生成後請跑既有 `tools/art.py` 流程去背／裁頭像，並把 id 加入 `PORTRAITS`。
