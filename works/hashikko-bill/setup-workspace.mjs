#!/usr/bin/env node
// WFAIA制作ワークスペースをデスクトップに構築する（依存ゼロ / ローカルPC用）
//
//   node works/hashikko-bill/setup-workspace.mjs
//
// ~/Desktop/WFAIA_はしっこビル/ を作り、generated.json の全アセットを
// 種類別フォルダにダウンロードする。既存ファイルはスキップ（再実行安全）。
// 同一idは後勝ち（最新版のみ落とす）。Floyoの結果(tools/floyo/results/*.json)が
// あれば presigned URL の生存中に 08_Floyo出力 へ保存する。

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url)); // works/hashikko-bill
const repoRoot = join(here, '..', '..');
const ROOT = join(homedir(), 'Desktop', 'WFAIA_はしっこビル');

const FOLDERS = {
  docs: '00_正典ドキュメント',
  character_sheet: '01_キャラクターシート',
  bible_sheet: '01_キャラクターシート/バイブル',
  supporting_cast: '01_キャラクターシート/脇役',
  set_reference: '02_セット正典',
  storyboard_panel: '03_絵コンテ',
  floyo_start_frame: '04_スタートフレーム',
  narration_audio: '05_音声_ナレーション',
  key_art: '06_キーアート_ポスター',
  key_visual: '06_キーアート_ポスター',
  design_variant: '07_デザイン検討_過去案',
  i2v_test: '08_動画テスト',
  i2v_prod: '12_本線I2V',
  interp_test: '12_本線I2V',
  animatic_export: '09_動画コンテ',
  guide_video: '09_動画コンテ',
  floyo: '10_Floyo出力',
  final: '11_採用カット_本番',
};

for (const f of Object.values(FOLDERS)) mkdirSync(join(ROOT, f), { recursive: true });

// 正典ドキュメントをコピー
for (const doc of ['STORY.md', 'FLOYO_MIGRATION.md', 'character-sheets.html', 'startframes.html', 'generated.json']) {
  const src = join(here, doc);
  if (existsSync(src)) copyFileSync(src, join(ROOT, FOLDERS.docs, doc));
}

const g = JSON.parse(readFileSync(join(here, 'generated.json'), 'utf8'));
// 同一idは後勝ち＝最新版だけを対象にする
const latest = new Map();
for (const it of g.items) if (it.id && it.url) latest.set(it.id, it);

const extOf = (url, mime) => {
  const m = new URL(url).pathname.match(/\.(\w{2,4})$/);
  if (m) return m[1];
  if (mime?.includes('wav')) return 'wav';
  if (mime?.includes('mp4')) return 'mp4';
  return 'png';
};

let done = 0, skipped = 0, failed = 0;
async function grab(url, dest) {
  if (existsSync(dest)) { skipped++; return; }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    done++;
    if (done % 25 === 0) console.log(`  ...${done} 件保存`);
  } catch (e) {
    failed++;
    console.error(`  NG ${dest.split('/').pop()}: ${e.message}`);
  }
}

console.log(`保存先: ${ROOT}`);
console.log(`アセット ${latest.size} 件をダウンロードします（既存はスキップ）`);
for (const it of latest.values()) {
  const folder = FOLDERS[it.kind] ?? '99_その他';
  mkdirSync(join(ROOT, folder), { recursive: true });
  await grab(it.url, join(ROOT, folder, `${it.id}.${extOf(it.url, it.mime_type)}`));
}

// Floyoの実行結果（presigned URLが生きていれば保存）
const resultsDir = join(repoRoot, 'tools', 'floyo', 'results');
if (existsSync(resultsDir)) {
  for (const f of readdirSync(resultsDir).filter((f) => f.endsWith('.json'))) {
    const r = JSON.parse(readFileSync(join(resultsDir, f), 'utf8'));
    for (const item of r.results ?? []) {
      // 命名規則: c{カット}_{内容}_v{版}（複数出力は連番を付ける）
      const outs = item.outputs ?? [];
      for (let i = 0; i < outs.length; i++) {
        const out = outs[i];
        if (!out.presigned_url) continue;
        const ext = (out.file_name?.match(/\.(\w{2,4})$/) ?? [, 'png'])[1];
        const suffix = outs.length > 1 ? `_${i + 1}` : '';
        await grab(out.presigned_url, join(ROOT, FOLDERS.floyo, `${item.id}${suffix}.${ext}`));
      }
    }
  }
}

console.log(`\n完了: 保存 ${done} / スキップ ${skipped} / 失敗 ${failed}`);
if (failed) console.log('失敗分はURL期限切れの可能性。presigned系は取り直しが必要です。');
console.log(`\n次の一歩: ${join(ROOT, FOLDERS.docs, 'startframes.html')} をブラウザで開くと全カットを確認できます`);
