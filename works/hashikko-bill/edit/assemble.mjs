#!/usr/bin/env node
// 本編ラフカット自動アセンブラ（ローカルPC用・依存: ffmpeg ※無ければ `npm i ffmpeg-static`）
//
//   node works/hashikko-bill/edit/assemble.mjs          # 英語ナレ版（既定）
//   node works/hashikko-bill/edit/assemble.mjs --ja     # 日本語ナレ版
//
// やること:
//  1. 台帳(generated.json)の本編クリップを物語順に並べる（紹介9カットはA章の後に挿入）
//  2. 絵コンテの実尺×自動スケールで各カットをトリムし、合計を5分以内に収める
//  3. 各章の頭に章ナレ（英語 or 日本語）を重ねる（冒頭=オープニング、C73〜=エンディング）
//  4. デスクトップに hashikko_honpen_v1.mp4 を書き出す
//
// 素材は先に `node works/hashikko-bill/setup-workspace.mjs` でダウンロードしておくこと。
// 映像は 1280x720/24fps に統一。クリップ音声は使わず、音はナレーションのみ
// （SE/BGMは編集ソフトで足す前提のラフカット）。

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir, tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const ROOT = join(homedir(), 'Desktop', 'WFAIA_はしっこビル');
const VID = join(ROOT, '12_本線I2V');
const AUD = join(ROOT, '05_音声_ナレーション');
const OUT = join(homedir(), 'Desktop', 'hashikko_honpen_v1.mp4');
const JA = process.argv.includes('--ja');
const BUDGET = 280;          // カット群の合計尺（秒）。+アウトロ14秒で294秒≦5分
const OUTRO = 14;            // 最終カットの最終フレームをホールド（締めナレの余韻+タイトル用）
const INTRO_SEC = 2.4;       // 紹介カットの実尺
const SUB_DEFAULT = 3.5;     // 絵コンテに秒数が無いサブカットの実尺

let FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
try { execFileSync(FFMPEG, ['-version'], { stdio: 'ignore' }); }
catch {
  try { FFMPEG = (await import('ffmpeg-static')).default; }
  catch { console.error('ffmpeg が見つかりません。`brew install ffmpeg` か `npm i ffmpeg-static` を実行してください'); process.exit(1); }
}

// ---- 1. クリップの並び ----
const g = JSON.parse(readFileSync(join(repo, 'generated.json'), 'utf8'));
const sb = JSON.parse(readFileSync(join(repo, 'storyboard', 'i2v-prompts.json'), 'utf8'));
const secOf = {};
for (const v of Object.values(sb)) secOf[String(v.no)] = v.sec;

// 同一カットは最新版（後勝ち）を採用
const latest = new Map();
for (const it of g.items) if (it.kind === 'i2v_prod') latest.set(it.id.replace(/_v\d+$/, ''), it);

const INTRO_ORDER = ['intro_hiiragi','intro_tome','intro_kaburagi','intro_ukai','intro_kumoi','intro_li','intro_kurogane','intro_yamato','intro_hikari'];
const story = [...latest.values()].filter(i => i.cut !== 'intro');
story.sort((a, b) => {
  const key = c => { const m = String(c).match(/^(\d+)([a-z]?)$/); return m ? [+m[1], m[2]] : [-1, String(c)]; };
  const [na, sa] = key(a.cut), [nb, sb2] = key(b.cut);
  return na - nb || (sa < sb2 ? -1 : sa > sb2 ? 1 : 0);
});
// C00a(cut='00a')は key が [-1] になり先頭に来る＝正しい

// A章(〜C06)の直後に紹介モンタージュを挿入
const timeline = [];
for (const it of story) {
  timeline.push(it);
  if (String(it.cut) === '6') for (const id of INTRO_ORDER) { const x = latest.get(id); if (x) timeline.push(x); }
}

// ---- 2. 尺の自動配分 ----
const planned = it => it.cut === 'intro' ? INTRO_SEC : (secOf[String(it.cut)] ?? SUB_DEFAULT);
const totalPlanned = timeline.reduce((s, it) => s + planned(it), 0);
const scale = Math.min(1, BUDGET / totalPlanned);
const durOf = it => it.cut === 'intro' ? INTRO_SEC : Math.max(2, Math.round(planned(it) * scale * 10) / 10);

// ---- 3. 章ナレの配置（章の開始カット → ナレid）----
const suffix = JA ? '' : '_en';
const NARR = [
  ['00a', `vo_opening${JA ? '_hana' : '_en'}_v1`],
  ['7',   `vo_seq_b${suffix}_v1`],
  ['17',  `vo_seq_c${suffix}_v1`],
  ['28',  `vo_seq_d${suffix}_v1`],
  ['37',  `vo_seq_e${suffix}_v1`],
  ['48b', `vo_seq_f${suffix}_v1`],
  ['55',  `vo_seq_g${suffix}_v1`],
  ['63',  `vo_seq_h${suffix}_v1`],
  ['71',  `vo_seq_i${suffix}_v1`],   // 柊の死の静けさ→葬式にかけて
  ['73',  `vo_ending${JA ? '_hana' : '_en'}_v1`],  // 朝の窓→ラスト+アウトロにかけて
];

// ---- 4. トリム→連結→ナレ合成 ----
const tmp = join(tmpdir(), 'hashikko_edit');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

let t = 0, listTxt = '', missing = [];
const offsets = {};                    // cut → 開始秒
const segs = [];
const avail = timeline.filter(it => existsSync(join(VID, `${it.id}.mp4`)));
missing.push(...timeline.filter(it => !avail.includes(it)).map(it => it.id));
for (let i = 0; i < avail.length; i++) {
  const it = avail[i];
  const src = join(VID, `${it.id}.mp4`);
  const d = durOf(it);
  const last = i === avail.length - 1;
  offsets[String(it.cut === 'intro' ? it.id : it.cut)] = t;
  const seg = join(tmp, `seg${segs.length}.mp4`);
  const vf = last
    ? `trim=duration=${d},setpts=PTS-STARTPTS,scale=1280:720,fps=24,tpad=stop_mode=clone:stop_duration=${OUTRO}`
    : 'scale=1280:720,fps=24';
  const cmd = ['-y', '-i', src, ...(last ? [] : ['-t', String(d)]),
    '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', seg];
  execFileSync(FFMPEG, cmd, { stdio: 'pipe' });
  listTxt += `file '${seg}'\n`;
  segs.push(seg);
  t += d + (last ? OUTRO : 0);
  if (segs.length % 15 === 0) console.log(`  ...${segs.length}/${avail.length} カット処理`);
}
writeFileSync(join(tmp, 'list.txt'), listTxt);
const silent = join(tmp, 'silent.mp4');
execFileSync(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'), '-c', 'copy', silent], { stdio: 'pipe' });

// ナレを adelay で章頭に配置して amix
const args = ['-y', '-i', silent];
const mixes = [];
let idx = 1;
for (const [cut, voId] of NARR) {
  const wav = join(AUD, `${voId}.wav`);
  if (!existsSync(wav) || offsets[cut] === undefined) { missing.push(`${voId}(→C${cut})`); continue; }
  args.push('-i', wav);
  const ms = Math.round(offsets[cut] * 1000);
  mixes.push(`[${idx}:a]adelay=${ms}|${ms}[a${idx}]`);
  idx++;
}
if (mixes.length === 0) {
  execFileSync(FFMPEG, ['-y', '-i', silent, '-c', 'copy', OUT], { stdio: 'pipe' });
} else {
  const fc = mixes.join(';') + ';' + mixes.map((_, i) => `[a${i + 1}]`).join('') + `amix=inputs=${mixes.length}:normalize=0[aout]`;
  execFileSync(FFMPEG, [...args, '-filter_complex', fc,
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', OUT], { stdio: 'pipe' });
}

console.log(`\n完成: ${OUT}`);
console.log(`合計尺: ${Math.floor(t / 60)}分${Math.round(t % 60)}秒（上限5分） / カット${segs.length}本 / ナレ${mixes.length}本(${JA ? '日本語' : '英語'})`);
if (missing.length) console.log(`見つからず飛ばした素材: ${missing.join(', ')}`);
console.log('※クリップ音声は外してあります。SE/BGM・テロップは編集ソフトで重ねてください');
