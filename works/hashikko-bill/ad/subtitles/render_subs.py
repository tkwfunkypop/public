#!/usr/bin/env python3
# CM英語字幕のクロマキー動画を生成する（依存: pillow + ffmpeg系バイナリ）
#   FFMPEG=<ffmpegパス> python3 render_subs.py [出力先dir]
# drawtextが無いffmpegビルドでも動くよう、Pillowで字幕PNGを描き concat で動画化する。
# クロマキー色 #00B140。字幕タイミングは subs-spec.json（JP/EN対訳つき）が正。

import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = json.load(open(os.path.join(HERE, 'subs-spec.json')))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
GREEN = (0, 177, 64)

def frame(w, h, text=None, fsz=46, ybase=150):
    img = Image.new('RGB', (w, h), GREEN)
    if text:
        d = ImageDraw.Draw(img)
        font = ImageFont.truetype(FONT, fsz)
        lines = text.split('\n')
        lh = fsz + 12
        total = lh * len(lines)
        for i, ln in enumerate(lines):
            tw = d.textlength(ln, font=font)
            x = (w - tw) / 2
            y = h - ybase - total + i * lh
            d.text((x, y), ln, font=font, fill='white', stroke_width=4, stroke_fill='black')
    return img

for item in SPEC['items']:
    w, h = (720, 1280) if item['aspect'] == '9:16' else (1280, 720)
    fsz = 44 if item['aspect'] == '9:16' else 46
    ybase = 300 if item['aspect'] == '9:16' else 130
    tmp = tempfile.mkdtemp()
    blank = os.path.join(tmp, 'blank.png')
    frame(w, h).save(blank)
    # タイムライン: 空白と字幕を交互に並べる
    segs, t = [], 0.0
    for i, s in enumerate(sorted(item['subs'], key=lambda x: x['start'])):
        if s['start'] > t:
            segs.append((blank, s['start'] - t))
        p = os.path.join(tmp, f'sub{i}.png')
        frame(w, h, s['en'], fsz, ybase).save(p)
        segs.append((p, s['end'] - s['start']))
        t = s['end']
    if t < item['dur']:
        segs.append((blank, item['dur'] - t))
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w') as f:
        for p, d in segs:
            f.write(f"file '{p}'\nduration {d}\n")
        f.write(f"file '{segs[-1][0]}'\n")
    out = os.path.join(OUT, f"{item['id']}.mp4")
    subprocess.run([FFMPEG, '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-vf', 'fps=24,format=yuv420p', '-c:v', 'libx264', '-crf', '22', out],
                   check=True, capture_output=True)
    print('OK', out)

print('\n完了。クロマキー色は #00B140')
