#!/usr/bin/env node
// ASSET LIBRARY ビルダー（依存ゼロ / ローカルPC用）
//
//   node works/hashikko-bill/build-asset-library.mjs
//
// generated.json（台帳）とデスクトップの実ファイルを突き合わせ、
// ~/Desktop/WFAIA_はしっこビル/ASSET_LIBRARY.html を1枚だけ生成する。
//
// 新しい素材を作ったら:
//   1. generated.json に追記   2. node works/hashikko-bill/setup-workspace.mjs
//   3. node works/hashikko-bill/build-asset-library.mjs   ← これを再実行するだけ
//
// 台帳のURLは一時URL（SJinn/Floyoは失効する）なので、表示はローカル実ファイルを正とする。
// ファイルが未ダウンロードの項目は「未取得」バッジ付きで台帳情報だけ表示する。

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(homedir(), 'Desktop', 'WFAIA_はしっこビル');
const OUT = join(ROOT, 'ASSET_LIBRARY.html');

if (!existsSync(ROOT)) {
  console.error(`素材フォルダがありません: ${ROOT}\n先に node works/hashikko-bill/setup-workspace.mjs を実行してください。`);
  process.exit(1);
}

// ── 1. 実ファイルを走査して id → 相対パス の索引を作る ────────────────────
// setup-workspace.mjs は `${id}${suffix}.${ext}` で保存する。suffix は _1.._4 等。
const fileIndex = new Map(); // id → [相対パス...]
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    const rel = relative(ROOT, full);
    const base = name.replace(/\.[^.]+$/, '');
    if (!fileIndex.has(base)) fileIndex.set(base, []);
    fileIndex.get(base).push(rel);
  }
};
walk(ROOT);

// id に対応するファイル群（完全一致 → `id_1` 等の連番も拾う）
const filesFor = (id) => {
  const out = [];
  if (fileIndex.has(id)) out.push(...fileIndex.get(id));
  for (const [base, paths] of fileIndex) {
    if (base !== id && base.startsWith(id + '_') && /^\d+$/.test(base.slice(id.length + 1))) out.push(...paths);
  }
  return [...new Set(out)].sort();
};

const mediaType = (p) => {
  const ext = p.toLowerCase().split('.').pop();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['wav', 'mp3', 'm4a'].includes(ext)) return 'audio';
  return 'other';
};

// ── 2. 台帳を読む ────────────────────────────────────────────────────────
const ledger = JSON.parse(readFileSync(join(here, 'generated.json'), 'utf8'));
// 同一idは後勝ち（最新版のみ）
const latest = new Map();
for (const it of ledger.items) if (it.id) latest.set(it.id, it);
const items = [...latest.values()];

// ── 3. 検品結果（qa/QA_REPORT_20260801.md が正本。ここは表示用の要約） ────
const QA = {
  retake: {
    c29_i2v_v1: '木箱ラベルに英字「BULBS」（実在文字）',
    c34_i2v_v1: '木箱ラベルに英字「BULBS」（c29と同一小道具）',
    c49_i2v_v1: '契約書タイトルに「CONTRACT」',
    c49b_i2v_v1: '図面に「DEMOLITION BLUEPRINT」＋実在数字',
    c54b_i2v_v1: '契約書に「CONTRACT」＋「MEMO」',
    c60_i2v_v1: '帳簿見出しに「FUNERAL LEDGER」',
    ad_4_yoko_v1: '階数パネルに実在数字 3/7/5/7',
    ad_6_tate_v1: '開いた口・歯・舌＋画風が本編から乖離',
    ad_10_tate_v1: '新聞に判読可能な漢字＋タイプライターに英字',
    ad_13_tate_v1: '時計文字盤に実在数字1〜12＋便箋に英単語',
    ad_14_tate_v1: 'グラフ軸に実在数字・英字',
  },
  check: {
    c11_i2v_v1: '架空文字に数字と読める字形が混在',
    c27_i2v_v1: 'ノートの手書きが筆記体英語に見えるか',
    c30_i2v_v1: '終盤フレームでのみ口が出現',
    c45_i2v_v1: '架空文字がハングル字母に酷似',
    c48_i2v_v1: '群衆が9体→1体に減少（継続性）',
    c51_i2v_v1: '散乱紙が30枚→1枚に激減（継続性）',
    c60b_i2v_v1: '架空文字がハングル字母に酷似',
    c68_i2v_v1: '柊の目が消灯（正典は全表情で発光）',
    ad_2_tate_v1: '背景キャラの口（ボケていて断定不可）',
    ad_8_yoko_v1: '縫い口ライン（鵜飼系正典の可能性）',
    ad_11_tate_v1: '縫い口ライン（同上）',
    ad_12_tate_v1: '表示パネルの文字＋縫い口',
    ad_cm15_yoko_v1: '背景キャラの口（被写界深度外）',
    ad_a3_i2v_v1: 'モブの口＋同一に見えるキャラ2体',
  },
};

// ── 4. キャラクター正典（character-sheets.html と同じ定義） ──────────────
const CHARACTERS = [
  { key: 'HIIRAGI_GENZO', jp: '柊源三', en: 'HIIRAGI GENZO', floor: 'B1 管理人室', figure: 'b1_hiiragi', intro: 'intro_hiiragi_v1', uuid: '0bc9bf7a' },
  { key: 'HOSHINO_TOME', jp: '星野トメ', en: 'HOSHINO TOME', floor: '1F ホシノ葬祭', figure: 'f1_tome', intro: 'intro_tome_v1', uuid: 'ab614b7b' },
  { key: 'KABURAGI', jp: '鏑木', en: 'KABURAGI', floor: '2F カガリ玩具製作所', figure: 'f2_kaburagi', intro: 'intro_kaburagi_v1', uuid: 'c4f0ecbe' },
  { key: 'UKAI', jp: '鵜飼', en: 'UKAI', floor: '3F みなも会計事務所', figure: 'f3_ukai', intro: 'intro_ukai_v1', uuid: '48c63be0' },
  { key: 'KUMOI', jp: '雲井', en: 'KUMOI', floor: '4F 北緯零度気象観測所', figure: 'f4_kumoi', intro: 'intro_kumoi_v1', uuid: 'a05b985c' },
  { key: 'LI', jp: '李', en: 'LI', floor: '5F 香料研究所アロマティカ', figure: 'f5_ri', intro: 'intro_li_v1', uuid: '3846f10c' },
  { key: 'KUROGANE', jp: '黒金', en: 'KUROGANE', floor: '6F 印刷工房くろがね堂', figure: 'f6_kurogane', intro: 'intro_kurogane_v1', uuid: '7de3b8e2' },
  { key: 'YAMATO', jp: '大和', en: 'YAMATO', floor: '6F 印刷工房くろがね堂', figure: 'f6_yamato', intro: 'intro_yamato_v1', uuid: '4ffb2cf3' },
  { key: 'NANAO_HIKARI', jp: '七尾ひかり', en: 'NANAO HIKARI', floor: '7F 仕出しふくふく亭', figure: 'f7_hikari', intro: 'intro_hikari_v1', uuid: 'ea03da32' },
  { key: 'HIIRAGI_GENZO_53', jp: '柊源三（53歳）', en: 'HIIRAGI GENZO — 53', floor: '回想（第一章・第七章）', figure: 'cast_hiiragi_53' },
  { key: 'UKAI_CHILD', jp: '鵜飼（11歳）', en: 'UKAI — CHILD', floor: '回想（第六章）', figure: 'cast_ukai_child' },
  { key: 'UKAI_MOTHER', jp: '鵜飼の母', en: 'UKAI — MOTHER', floor: '回想（第六章）', figure: 'cast_ukai_mother' },
  { key: 'UKAI_FATHER', jp: '鵜飼の父', en: 'UKAI — FATHER', floor: '回想（第六章）', figure: 'cast_ukai_father' },
  { key: 'DEVELOPER_AGENT', jp: '開発業者', en: 'DEVELOPER AGENT', floor: '第五章', figure: 'cast_developer' },
];
// 台帳の character 表記ゆれを正規化
const CHAR_ALIAS = { HIIRAGI_53: 'HIIRAGI_GENZO_53', DEVELOPER: 'DEVELOPER_AGENT' };
const charKey = (raw) => {
  if (!raw) return null;
  const k = String(raw).split('+')[0].trim();
  return CHAR_ALIAS[k] || k;
};

// ── 5. タブ定義（kind → タブ） ──────────────────────────────────────────
const TABS = [
  { id: 'chars', label: 'キャラクター', kinds: null },
  { id: 'story', label: '本編カット', kinds: ['i2v_prod', 'storyboard_panel', 'floyo_start_frame', 'end_frame', 'i2v_test', 'interp_test'] },
  { id: 'ad', label: 'CM', kinds: ['ad_i2v', 'ad_start_frame'] },
  { id: 'world', label: 'セット・世界観', kinds: ['set_reference', 'key_art', 'key_visual', 'design_variant'] },
  { id: 'audio', label: 'ナレーション', kinds: ['narration_audio'] },
  { id: 'floyo', label: 'Floyo素材', kinds: ['floyo_angle'] },
  { id: 'docs', label: 'ドキュメント', kinds: null },
];
const KIND_LABEL = {
  i2v_prod: '本線I2V', storyboard_panel: '絵コンテ', floyo_start_frame: '開始フレーム', end_frame: '終了フレーム',
  i2v_test: '動画テスト', interp_test: '補間テスト', ad_i2v: 'CM動画', ad_start_frame: 'CM開始フレーム',
  set_reference: 'セット正典', key_art: 'キーアート', key_visual: 'キービジュアル', design_variant: 'デザイン検討',
  narration_audio: 'ナレ音声', floyo_angle: 'Floyoアングル', character_sheet: 'キャラシート',
  bible_sheet: 'バイブル', supporting_cast: '脇役図版', animatic_export: '動画コンテ', guide_video: '解説動画',
};

// ── 6. HTML生成 ─────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

function mediaTag(paths) {
  if (!paths.length) return `<div class="ph">未取得</div>`;
  const p = paths[0], t = mediaType(p);
  if (t === 'image') return `<img loading="lazy" src="${enc(p)}" alt="">`;
  if (t === 'video') return `<video preload="metadata" controls playsinline src="${enc(p)}"></video>`;
  if (t === 'audio') return `<div class="ph aud">♪</div>`;
  return `<div class="ph">?</div>`;
}

function card(it) {
  const paths = filesFor(it.id);
  const kind = it.kind || 'figure';
  const badges = [];
  if (QA.retake[it.id]) badges.push(`<span class="b retake" title="${esc(QA.retake[it.id])}">要リテイク</span>`);
  else if (QA.check[it.id]) badges.push(`<span class="b check" title="${esc(QA.check[it.id])}">要確認</span>`);
  if (String(it.approved) === 'True') badges.push('<span class="b ok">承認済</span>');
  if (!paths.length) badges.push('<span class="b none">未取得</span>');
  const meta = [KIND_LABEL[kind] || kind, it.cut ? `C${it.cut}` : '', it.model, it.resolution, it.duration_sec ? `${it.duration_sec}s` : '', it.voice, it.sheet]
    .filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join('');
  const audios = paths.filter((p) => mediaType(p) === 'audio');
  return `<article class="card" data-tab="${tabOf(kind)}" data-kind="${esc(kind)}" data-char="${esc(charKey(it.character) || '')}" data-q="${esc([it.id, it.note, it.text, it.character, it.sheet].filter(Boolean).join(' ').toLowerCase())}">
  <div class="thumb">${mediaTag(paths)}</div>
  <div class="body">
    <h4>${esc(it.id)}</h4>
    <div class="meta">${meta}</div>
    ${badges.length ? `<div class="badges">${badges.join('')}</div>` : ''}
    ${it.text ? `<p class="quote">${esc(it.text)}</p>` : ''}
    ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
    ${audios.map((p) => `<audio controls preload="none" src="${enc(p)}"></audio>`).join('')}
    ${paths.length > 1 ? `<div class="more">${paths.map((p, i) => `<a href="${enc(p)}" target="_blank">${i + 1}</a>`).join('')}</div>` : ''}
    ${paths.length ? `<a class="open" href="${enc(paths[0])}" target="_blank">原寸で開く ↗</a>` : ''}
  </div>
</article>`;
}

const KIND_TAB = {};
for (const t of TABS) for (const k of t.kinds || []) KIND_TAB[k] = t.id;
const tabOf = (kind) => KIND_TAB[kind] || 'chars';

// キャラクタータブ: 図版・シート類をキャラ単位でまとめる
const charAssets = (key) => items.filter((it) => charKey(it.character) === key);
const charSection = (c) => {
  const own = charAssets(c.key);
  const figure = latest.get(c.figure);
  const introFiles = c.intro ? filesFor(c.intro) : [];
  const sheets = own.filter((it) => ['character_sheet', 'bible_sheet'].includes(it.kind));
  const variants = own.filter((it) => it.kind === 'design_variant');
  return `<section class="charsec" data-char="${c.key}" data-q="${esc([c.jp, c.en, c.floor, c.key].join(' ').toLowerCase())}">
  <header class="charhead">
    <div class="charfig">${mediaTag(figure ? filesFor(figure.id) : filesFor(c.figure))}</div>
    <div>
      <h3>${esc(c.jp)} <small>${esc(c.en)}</small></h3>
      <p class="floor">${esc(c.floor)}</p>
      ${c.uuid ? `<p class="uuid">参照UUID <code>${esc(c.uuid)}</code></p>` : ''}
      <p class="counts">図版・シート ${sheets.length + (figure ? 1 : 0)}点${variants.length ? ` / 検討案 ${variants.length}点` : ''}${introFiles.length ? ' / 紹介カットあり' : ''}</p>
    </div>
  </header>
  ${introFiles.length ? `<div class="introrow"><video preload="metadata" controls playsinline src="${enc(introFiles[0])}"></video><span>キャラ紹介カット <code>${esc(c.intro)}</code></span></div>` : ''}
  <div class="grid">${[...sheets, ...variants].map(card).join('')}</div>
</section>`;
};

const DOCS = [
  ['STORY.md', '物語・シーン構成の正典'],
  ['FLOYO_MIGRATION.md', '制作パイプラインの正典（三層体制・命名規則）'],
  ['HANDOVER.md', '引き継ぎ書（進捗・残作業）'],
  ['qa/QA_REPORT_20260801.md', '検品レポート（リテイク確定・要人間確認）'],
  ['ad/CM_LINEUP.md', 'CMラインナップ正典（ナレ原稿 日英）'],
  ['intro/INTRO_SCENES.md', 'キャラ紹介9カット'],
  ['narration/OPENING_ENDING.md', '冒頭・締めナレ'],
  ['narration/SCENE_NARRATION.md', '章替わりナレ8本'],
  ['edit/EDIT_PLAN.md', '本編ラフカット自動アセンブリ'],
  ['wfaia/PLAN.md', 'WFAIA応募計画'],
];
const VIEWERS = [
  ['character-sheets.html', 'キャラクターシート一覧'],
  ['startframes.html', '開始フレーム＋I2Vプロンプト'],
  ['sets.html', 'セット正典'],
  ['imageboard.html', 'イメージボード'],
  ['hikari-costumes.html', 'ひかり衣装検討'],
  ['building-fusions.html', 'ビル外観検討'],
  ['intro/telops.html', 'ネームテロップ v3'],
];
const REPO = 'https://raw.githack.com/tkwfunkypop/public/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/';
const GH = 'https://github.com/tkwfunkypop/public/blob/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/';

const byTab = {};
for (const t of TABS) byTab[t.id] = [];
for (const it of items) {
  const kind = it.kind || 'figure';
  if (['character_sheet', 'bible_sheet', 'design_variant'].includes(kind)) continue; // キャラタブで扱う
  if (kind === 'figure' || kind === 'supporting_cast') continue;
  const tab = KIND_TAB[kind];
  if (tab) byTab[tab].push(it);
}
// 本編カットはカット番号順
const cutNum = (c) => { const m = String(c ?? '').match(/^(\d+)/); return m ? parseInt(m[1], 10) : 9999; };
byTab.story.sort((a, b) => cutNum(a.cut) - cutNum(b.cut) || String(a.id).localeCompare(String(b.id)));
byTab.audio.sort((a, b) => cutNum(a.cut) - cutNum(b.cut));

const counts = Object.fromEntries(TABS.map((t) => [t.id, t.id === 'chars' ? CHARACTERS.length : t.id === 'docs' ? DOCS.length + VIEWERS.length : byTab[t.id].length]));
const downloaded = items.filter((it) => filesFor(it.id).length).length;

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ASSET LIBRARY — はしっこビルの明日づくり</title>
<style>
:root{--bg:#14131a;--panel:#1d1b24;--line:#302d3c;--fg:#e9e6f0;--dim:#9a94ab;--acc:#f0a13c;--ok:#4caf7d;--warn:#e0b341;--bad:#e0655f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.6}
header.top{position:sticky;top:0;z-index:20;background:rgba(20,19,26,.96);border-bottom:1px solid var(--line);padding:14px 20px;backdrop-filter:blur(8px)}
h1{margin:0;font-size:19px;letter-spacing:.06em}
h1 small{color:var(--dim);font-weight:400;font-size:12px;margin-left:10px;letter-spacing:0}
.stats{color:var(--dim);font-size:12px;margin-top:4px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.tabs button{background:var(--panel);color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px;cursor:pointer;font-family:inherit}
.tabs button[aria-selected=true]{background:var(--acc);color:#1a1206;border-color:var(--acc);font-weight:600}
.tabs button b{font-weight:400;opacity:.65;margin-left:5px;font-size:11px}
#search{width:100%;margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--fg);padding:9px 12px;font-size:14px;font-family:inherit}
main{padding:20px;max-width:1600px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.thumb{background:#0d0c11;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;overflow:hidden}
.thumb img,.thumb video{width:100%;height:100%;object-fit:contain;display:block}
.ph{color:#4b4658;font-size:12px}.ph.aud{font-size:30px;color:var(--acc)}
.body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.body h4{margin:0;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
.meta{display:flex;gap:5px;flex-wrap:wrap}
.meta span{background:#272433;color:var(--dim);border-radius:4px;padding:1px 6px;font-size:11px}
.badges{display:flex;gap:5px;flex-wrap:wrap}
.b{font-size:11px;border-radius:4px;padding:1px 7px;font-weight:600;cursor:help}
.b.retake{background:rgba(224,101,95,.18);color:var(--bad);border:1px solid rgba(224,101,95,.4)}
.b.check{background:rgba(224,179,65,.15);color:var(--warn);border:1px solid rgba(224,179,65,.35)}
.b.ok{background:rgba(76,175,125,.15);color:var(--ok)}
.b.none{background:#272433;color:#6b6580}
.note{margin:0;font-size:12px;color:var(--dim)}
.quote{margin:0;font-size:12.5px;border-left:2px solid var(--acc);padding-left:8px}
audio{width:100%;height:32px}
.more{display:flex;gap:4px;flex-wrap:wrap}
.more a{background:#272433;color:var(--dim);border-radius:4px;padding:0 7px;font-size:11px;text-decoration:none}
.open{font-size:11.5px;color:var(--acc);text-decoration:none;margin-top:auto}
.charsec{margin-bottom:34px;border-bottom:1px solid var(--line);padding-bottom:22px}
.charhead{display:flex;gap:16px;align-items:flex-start;margin-bottom:12px}
.charfig{width:130px;flex:none;background:#0d0c11;border:1px solid var(--line);border-radius:8px;overflow:hidden;aspect-ratio:2/3;display:flex;align-items:center;justify-content:center}
.charfig img,.charfig video{width:100%;height:100%;object-fit:cover}
.charhead h3{margin:0;font-size:20px}.charhead h3 small{color:var(--dim);font-size:12px;font-weight:400;margin-left:8px;letter-spacing:.08em}
.floor{margin:2px 0;color:var(--acc);font-size:13px}
.uuid,.counts{margin:2px 0;color:var(--dim);font-size:12px}
code{background:#272433;border-radius:3px;padding:1px 5px;font-size:11.5px}
.introrow{display:flex;gap:12px;align-items:center;margin-bottom:12px;color:var(--dim);font-size:12px}
.introrow video{width:230px;border-radius:8px;border:1px solid var(--line)}
.doclist{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
.doclist a{display:block;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 14px;text-decoration:none;color:var(--fg)}
.doclist a:hover{border-color:var(--acc)}
.doclist b{display:block;font-size:13.5px}.doclist span{color:var(--dim);font-size:12px}
h2.sec{font-size:14px;color:var(--dim);font-weight:600;letter-spacing:.08em;margin:24px 0 10px;border-left:3px solid var(--acc);padding-left:9px}
.hidden{display:none!important}
.empty{color:var(--dim);padding:40px 0;text-align:center}
footer{color:#5d5771;font-size:11.5px;padding:30px 20px;text-align:center;border-top:1px solid var(--line);margin-top:30px}
</style></head><body>
<header class="top">
  <h1>ASSET LIBRARY <small>はしっこビルの明日づくり</small></h1>
  <div class="stats">台帳 ${items.length} 件 / ローカル取得済み ${downloaded} 件 ・ 生成 ${new Date().toISOString().slice(0, 10)}</div>
  <nav class="tabs">${TABS.map((t, i) => `<button data-tab="${t.id}" aria-selected="${i === 0}">${t.label}<b>${counts[t.id]}</b></button>`).join('')}</nav>
  <input id="search" type="search" placeholder="検索（id・キャラ名・ノート・ナレ本文…）">
</header>
<main>
  <div id="pane-chars" class="pane">${CHARACTERS.map(charSection).join('')}</div>
  ${['story', 'ad', 'world', 'audio', 'floyo'].map((t) => `<div id="pane-${t}" class="pane hidden"><div class="grid">${byTab[t].map(card).join('')}</div></div>`).join('')}
  <div id="pane-docs" class="pane hidden">
    <h2 class="sec">ビューア（HTML）</h2>
    <div class="doclist">${VIEWERS.map(([f, d]) => `<a href="${REPO}${f}" target="_blank"><b>${esc(f)}</b><span>${esc(d)}</span></a>`).join('')}</div>
    <h2 class="sec">正典ドキュメント（GitHub）</h2>
    <div class="doclist">${DOCS.map(([f, d]) => `<a href="${GH}${f}" target="_blank"><b>${esc(f)}</b><span>${esc(d)}</span></a>`).join('')}</div>
    <h2 class="sec">このライブラリの更新方法</h2>
    <div class="doclist"><a href="#" onclick="return false"><b>node works/hashikko-bill/build-asset-library.mjs</b><span>generated.json に追記 → setup-workspace.mjs → このコマンドで再生成</span></a></div>
  </div>
  <p id="noresult" class="empty hidden">該当する素材がありません</p>
</main>
<footer>generated.json（台帳）とデスクトップ実ファイルから自動生成 / 検品バッジの正本は qa/QA_REPORT_20260801.md</footer>
<script>
const panes=[...document.querySelectorAll('.pane')],btns=[...document.querySelectorAll('.tabs button')],q=document.getElementById('search'),nores=document.getElementById('noresult');
let tab='chars';
function show(){
  panes.forEach(p=>p.classList.toggle('hidden',p.id!=='pane-'+tab));
  btns.forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
  filter();
}
function filter(){
  const s=q.value.trim().toLowerCase();
  const pane=document.getElementById('pane-'+tab);
  if(!pane) return;
  let hit=0;
  pane.querySelectorAll('.charsec').forEach(sec=>{
    let inner=0;
    sec.querySelectorAll('.card').forEach(c=>{const m=!s||c.dataset.q.includes(s);c.classList.toggle('hidden',!m);if(m)inner++;});
    const self=!s||sec.dataset.q.includes(s);
    const vis=self||inner>0;
    if(self&&s)sec.querySelectorAll('.card').forEach(c=>c.classList.remove('hidden'));
    sec.classList.toggle('hidden',!vis);
    if(vis)hit++;
  });
  if(!pane.querySelector('.charsec')){
    pane.querySelectorAll('.card').forEach(c=>{const m=!s||c.dataset.q.includes(s);c.classList.toggle('hidden',!m);if(m)hit++;});
    if(pane.querySelector('.doclist'))hit=1;
  }
  nores.classList.toggle('hidden',hit>0);
}
btns.forEach(b=>b.onclick=()=>{tab=b.dataset.tab;show();});
q.oninput=filter;
show();
</script>
</body></html>`;

writeFileSync(OUT, html, 'utf8');
console.log(`完成: ${OUT}`);
console.log(`台帳 ${items.length}件 / ローカル取得済み ${downloaded}件`);
console.log(TABS.map((t) => `  ${t.label}: ${counts[t.id]}`).join('\n'));
