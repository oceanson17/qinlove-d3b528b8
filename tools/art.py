#!/usr/bin/env python3
"""美術處理流程（重現用）：assets/raw/*.jpg → assets/*.webp
用法：/home/box/venv-rembg/bin/python tools/art.py   （需要 rembg + isnet-anime 模型、Pillow）
1. 立繪 char_<id>.jpg：rembg(isnet-anime) 去背 → alpha <12 清零、>243 實心 → 依 alpha>24 外框裁切，頭頂留 4% → char_<id>.webp（q85，>400KB 自動降質）
2. 頭像 face_<id>.webp：依 FACE（臉部中心，佔裁切後立繪縮圖 400px 方框比例）裁正方形 192px
3. 背景 bg_<k>.jpg → bg_<k>.webp（q80，保持 1280×720；焦點於 src/03_art.js ART.BGPOS）
"""
import glob,os,sys
from PIL import Image
from rembg import remove,new_session
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
# 縮圖方框座標（與 src/03_art.js ART.FACE 同步維護；ART.FACE 用圖寬/圖高 %）
FACE={'yingzheng':(.42,.32),'mengtian':(.41,.25),'lisi':(.44,.29),'fusu':(.42,.31),'hanfei':(.44,.29),'jingke':(.45,.29),'xuanye':(.40,.27),'heroine':(.52,.29)}
sess=new_session('isnet-anime')
for f in sorted(glob.glob('assets/raw/char_*.jpg')):
    cid=os.path.basename(f)[5:-4]
    im=remove(Image.open(f).convert('RGB'),session=sess).convert('RGBA')
    a=im.getchannel('A').point(lambda v:0 if v<12 else (255 if v>243 else v));im.putalpha(a)
    x0,y0,x1,y1=a.point(lambda v:255 if v>24 else 0).getbbox();pad=max(10,int((y1-y0)*.04))
    x0=max(0,x0-6);x1=min(im.width,x1+6);top=max(0,y0-pad)
    crop=im.crop((x0,top,x1,y1));c=Image.new('RGBA',(x1-x0,crop.height+pad-(y0-top)),(0,0,0,0));c.alpha_composite(crop,(0,c.height-crop.height))
    out='assets/char_%s.webp'%cid;q=85
    while True:
        c.save(out,'WEBP',quality=q,method=6)
        if os.path.getsize(out)<400*1024 or q<60:break
        q-=5
    print(out,c.size,os.path.getsize(out)//1024,'KB')
    if cid in FACE:
        fx,fy=FACE[cid];w,h=c.size;s=400/max(w,h);ox=(400-w*s)/2
        cx=(fx*400-ox)/s;cy=(fy-.01)*400/s;side=.40*400/s
        b=(int(cx-side/2),int(cy-side/2),int(cx+side/2),int(cy+side/2))
        fc=Image.new('RGBA',(int(side),int(side)),(0,0,0,0));fc.alpha_composite(c.crop((max(0,b[0]),max(0,b[1]),b[2],b[3])),(max(0,-b[0]),max(0,-b[1])))
        fc.resize((192,192),Image.LANCZOS).save('assets/face_%s.webp'%cid,'WEBP',quality=85,method=6)
for f in sorted(glob.glob('assets/raw/bg_*.jpg')):
    k=os.path.basename(f)[:-4];Image.open(f).convert('RGB').save('assets/%s.webp'%k,'WEBP',quality=80,method=6)
    print('assets/%s.webp'%k,os.path.getsize('assets/%s.webp'%k)//1024,'KB')
