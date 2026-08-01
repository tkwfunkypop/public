#!/usr/bin/env node
// デスクトップ作業フォルダ → ~/Documents/ASSETS への移行（依存ゼロ / ローカルPC用）
//
//   node works/hashikko-bill/migrate-to-assets.mjs          # 予行演習（何をどこへ入れるか表示のみ）
//   node works/hashikko-bill/migrate-to-assets.mjs --run    # 実際にコピー
//
// ASSETS の既存規約「素材種別（第1階層）→ 作品番号_作品名（第2階層）」を拡張する形で配置する。
// - 既存ファイルは絶対に上書きしない（存在したらスキップ）
// - コピーであって移動ではない。デスクトップ側は残るので、確認後に健太さんが手で消す
// - キャラ関連は台帳の character 情報で per-character フォルダへ振り分ける

import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const RUN = process.argv.includes('--run');
const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(homedir(), 'Desktop', 'WFAIA_はしっこビル');
const ASSETS = join(homedir(), 'Documents', 'ASSETS');
// macOSの既存フォルダはNFD正規化で保存されている。NFCで作ると見た目同じ別表記になるので必ず揃える
const WORK = '003_はしっこビルの明日づくり'.normalize('NFD');

if (!existsSync(SRC)) { console.error(`作業フォルダがありません: ${SRC}`); process.exit(1); }
if (!existsSync(ASSETS)) { console.error(`ASSETSがありません: ${ASSETS}`); process.exit(1); }

// 台帳から id → character を引く
const ledger = JSON.parse(readFileSync(join(here, 'generated.json'), 'utf8'));
const charOf = new Map();
const ALIAS = { HIIRAGI_53: 'HIIRAGI_GENZO_53', DEVELOPER: 'DEVELOPER_AGENT' };
for (const it of ledger.items) {
  if (!it.id || !it.character) continue;
  const k = String(it.character).split('+')[0].trim();
  charOf.set(it.id, ALIAS[k] || k);
}
// 確定図版の id → キャラ（台帳に character が無い figure 用の保険）
const FIGURE_CHAR = {
  b1_hiiragi: 'HIIRAGI_GENZO', f1_tome: 'HOSHINO_TOME', f2_kaburagi: 'KABURAGI', f3_ukai: 'UKAI',
  f4_kumoi: 'KUMOI', f5_ri: 'LI', f6_kurogane: 'KUROGANE', f6_yamato: 'YAMATO', f7_hikari: 'NANAO_HIKARI',
};

// 種別フォルダ（第1階層）→ 作品フォルダ（第2階層）→ 任意のサブフォルダ
const dest = (category, ...sub) => join(ASSETS, category, WORK, ...sub);

// デスクトップの各フォルダをどこへ入れるか。fn は 1ファイルごとの行き先（null でスキップ）
const RULES = [
  ['01_キャラクターシート', (f) => characterDest(f)],
  ['02_セット正典', () => dest('Enviroment', 'Set')],
  ['03_絵コンテ', () => dest('Storyboard')],
  ['04_スタートフレーム', () => dest('StartFrame')],
  ['05_音声_ナレーション', () => dest('Audio', 'Narration')],
  ['06_キーアート_ポスター', () => dest('KV', 'KeyArt')],
  ['07_デザイン検討_過去案', (f) => characterDest(f, 'Variant') || dest('Design')],
  ['08_動画テスト', () => dest('Video', 'Test')],
  ['09_動画コンテ', () => dest('Video', 'Animatic')],
  ['10_Floyo出力', () => dest('Floyo')],
  ['11_採用カット_本番', () => dest('Video', 'Final')],
  ['12_本線I2V', () => dest('Video', 'Main')],
  ['13_広告CM', () => dest('Video', 'CM')],
  ['00_正典ドキュメント', () => dest('Docs')],
  ['99_その他', (f) => miscDest(f)],
];

function characterDest(file, force) {
  const id = basename(file, extname(file));
  const key = charOf.get(id) || FIGURE_CHAR[id] || charOf.get(id.replace(/_v\d+$/, ''));
  if (!key) return null;
  const bucket = force || (id.startsWith('bible_') ? 'Bible' : 'CharacterSheet');
  // 「果端ビル」はキャラクターではなく建物なので Enviroment 側へ
  if (key === '果端ビル') return dest('Enviroment', 'Building', bucket === 'Bible' ? 'Bible' : force || 'Design');
  return dest('Character', key, bucket);
}
function miscDest(file) {
  const id = basename(file, extname(file));
  if (FIGURE_CHAR[id]) return characterDest(file);
  if (id.startsWith('wfaia_')) return dest('KV', 'WFAIA');
  if (id.includes('endframe')) return dest('StartFrame', 'EndFrame');
  return dest('Misc');
}

const files = [];
const walk = (dir, ruleFn) => {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { walk(full, ruleFn); continue; }
    files.push([full, ruleFn(name)]);
  }
};
for (const [folder, fn] of RULES) {
  const d = join(SRC, folder);
  if (existsSync(d)) walk(d, fn);
}

let copied = 0, skipped = 0, unsorted = 0, bytes = 0;
const perDest = new Map();
for (const [src, dst] of files) {
  const target = dst || dest('_unsorted');
  if (!dst) unsorted++;
  const out = join(target, basename(src));
  perDest.set(target, (perDest.get(target) || 0) + 1);
  if (existsSync(out)) { skipped++; continue; }
  if (RUN) {
    mkdirSync(target, { recursive: true });
    copyFileSync(src, out);
  }
  bytes += statSync(src).size;
  copied++;
}

const rel = (p) => p.replace(ASSETS + '/', '');
console.log(RUN ? '=== 実行（コピー） ===' : '=== 予行演習（--run で実際にコピー） ===');
for (const [d, n] of [...perDest].sort()) console.log(`  ${String(n).padStart(4)}  ${rel(d)}`);
console.log(`\n対象 ${files.length}件 / ${RUN ? 'コピー' : 'コピー予定'} ${copied}件 (${(bytes / 1024 / 1024).toFixed(0)}MB) / 既存スキップ ${skipped}件 / 振り分け不能 ${unsorted}件`);
if (!RUN) console.log('\n実行するには: node works/hashikko-bill/migrate-to-assets.mjs --run');
