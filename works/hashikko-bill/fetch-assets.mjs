#!/usr/bin/env node
/**
 * generated.json に記録した生成済みカットを assets/ に取り込む（依存ゼロ・Node標準のみ）。
 *
 * 生成そのものは Fal（tools/fal/generate.mjs）が正だが、Fal が使えない環境で
 * 代替生成したときは結果URLが generated.json に残る。これはその取り込み専用。
 *
 * 使い方:
 *   node works/hashikko-bill/fetch-assets.mjs
 *   node works/hashikko-bill/fetch-assets.mjs --only f3_ukai,b1_hiiragi
 *   node works/hashikko-bill/fetch-assets.mjs --width 2048 --quality 88
 *   node works/hashikko-bill/fetch-assets.mjs --keep-png     # 変換前のPNGも残す
 *
 * imageboard.html は assets/<id>.jpg を探すので、保存名は必ず .jpg に揃える。
 * JPEG変換は sips / magick / convert / ffmpeg のうち見つかったものを使う。
 * どれも無い環境ではPNGのバイト列をそのまま .jpg として保存する
 * （ブラウザは中身で判定するので表示は崩れない）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(HERE, 'generated.json');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const WIDTH = Number(flag('width', 1600));
const QUALITY = Number(flag('quality', 82));
const KEEP_PNG = args.includes('--keep-png');

if (!fs.existsSync(MANIFEST)) {
  console.error('✗ generated.json が見つかりません: ' + MANIFEST);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

let items = cfg.items || [];
const only = flag('only', null);
if (only) {
  const ids = only.split(',').map((s) => s.trim());
  items = items.filter((it) => ids.includes(it.id));
}
// url を持たないカット（status: on_hold 等）は取得対象外
const held = items.filter((it) => !it.url && !it.file);
items = items.filter((it) => it.url || it.file);
if (!items.length) {
  console.error('✗ 取得対象がありません。');
  process.exit(1);
}

/** 使えるJPEG変換コマンドを1つ選ぶ */
function pickConverter() {
  const has = (bin) => spawnSync(bin, ['-version'], { stdio: 'ignore' }).status === 0;
  // sips は -version を持たないので存在確認だけ別扱い（macOS標準）
  if (process.platform === 'darwin' &&
      spawnSync('sips', ['--help'], { stdio: 'ignore' }).status !== null) return 'sips';
  if (has('magick')) return 'magick';
  if (has('convert')) return 'convert';
  if (has('ffmpeg')) return 'ffmpeg';
  return null;
}

/** png -> jpg。成功で true */
function toJpeg(conv, src, dst) {
  const runs = {
    sips: ['sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY),
                    '--resampleWidth', String(WIDTH), src, '--out', dst]],
    magick: ['magick', [src, '-resize', WIDTH + 'x>', '-quality', String(QUALITY), dst]],
    convert: ['convert', [src, '-resize', WIDTH + 'x>', '-quality', String(QUALITY), dst]],
    ffmpeg: ['ffmpeg', ['-y', '-loglevel', 'error', '-i', src,
                        '-vf', "scale='min(" + WIDTH + ",iw)':-2",
                        '-q:v', '3', dst]],
  };
  const [bin, argv] = runs[conv];
  return spawnSync(bin, argv, { stdio: 'inherit' }).status === 0;
}

async function main() {
  const outDir = path.resolve(HERE, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  const conv = pickConverter();
  console.log('→ ' + items.length + ' カット取得 / 変換=' + (conv || 'なし（PNGを.jpgとして保存）') +
              (conv ? ' / 最大幅' + WIDTH + ' 品質' + QUALITY : ''));

  let ok = 0;
  const failed = [];
  for (const it of items) {
    const url = it.url || (cfg.baseUrl + '/' + it.file);
    const jpg = path.join(outDir, it.id + '.jpg');
    const tmp = path.join(outDir, it.id + '.src.png');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));

      if (conv && toJpeg(conv, tmp, jpg)) {
        if (!KEEP_PNG) fs.unlinkSync(tmp);
      } else {
        // 変換できないときはPNGのバイト列をそのまま .jpg 名で置く
        fs.copyFileSync(tmp, jpg);
        if (!KEEP_PNG) fs.unlinkSync(tmp);
      }
      const kb = Math.round(fs.statSync(jpg).size / 1024);
      console.log('  [' + it.id + '] ✓ assets/' + it.id + '.jpg (' + kb + 'KB)');
      ok++;
    } catch (e) {
      console.error('  [' + it.id + '] ✗ ' + e.message);
      failed.push(it.id);
      if (fs.existsSync(tmp) && !KEEP_PNG) fs.unlinkSync(tmp);
    }
  }

  console.log('\n完了: 成功 ' + ok + ' / 失敗 ' + failed.length +
              (held.length ? ' / 保留 ' + held.length : ''));
  held.forEach(function (it) {
    console.log('  [' + it.id + '] − 保留: ' + (it.reason || 'URL未登録'));
  });
  if (failed.length) {
    console.log('再取得するには: --only ' + failed.join(','));
    process.exit(1);
  }
  console.log('imageboard.html を開くとSVGが画像に差し替わる。');
}

main().catch((e) => { console.error('✗ エラー:', e.message); process.exit(1); });
