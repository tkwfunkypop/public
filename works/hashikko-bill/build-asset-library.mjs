#!/usr/bin/env node
// ASSET LIBRARY ビルダー（依存ゼロ / ローカルPC用・複数作品対応）
//
//   node works/hashikko-bill/build-asset-library.mjs
//
// ~/Documents/ASSETS を走査して次を生成する:
//   ASSETS/ASSET_LIBRARY.html          … 作品一覧（ハブ。ここを開けば全部たどれる）
//   ASSETS/Library/<slug>.html         … 作品ごとのページ
//
// ASSETS の構造は「素材種別（第1階層）→ 作品番号_作品名（第2階層）」。
// 作品を追加するときは下の WORKS に1行足すだけでページが増える。
// 台帳(generated.json)がある作品はメタ情報・検品バッジ付き、無い作品はフォルダ閲覧ページになる。
//
// 素材を足したときの更新手順:
//   1. generated.json に追記（台帳のある作品のみ）
//   2. node works/hashikko-bill/migrate-to-assets.mjs --run   （新素材をASSETSへ配置）
//   3. node works/hashikko-bill/build-asset-library.mjs       ← これを再実行

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(homedir(), 'Documents', 'ASSETS');
const LIB = join(ASSETS, 'Library');
// macOSの日本語フォルダ名はNFD。比較・生成は必ずNFDに揃える
const nfd = (s) => s.normalize('NFD');

if (!existsSync(ASSETS)) { console.error(`ASSETSがありません: ${ASSETS}`); process.exit(1); }

// ── キャラクター正典（台帳のある作品用） ───────────────────────────────
const HASHIKKO_CHARACTERS = [
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

// 検品結果（正本は works/hashikko-bill/qa/QA_REPORT_20260801.md）
const HASHIKKO_QA = {
  retake: {
    c29_i2v_v1: '木箱ラベルに英字「BULBS」（実在文字）', c34_i2v_v1: '木箱ラベルに英字「BULBS」（c29と同一小道具）',
    c49_i2v_v1: '契約書タイトルに「CONTRACT」', c49b_i2v_v1: '図面に「DEMOLITION BLUEPRINT」＋実在数字',
    c54b_i2v_v1: '契約書に「CONTRACT」＋「MEMO」', c60_i2v_v1: '帳簿見出しに「FUNERAL LEDGER」',
    ad_4_yoko_v1: '階数パネルに実在数字 3/7/5/7', ad_6_tate_v1: '開いた口・歯・舌＋画風が本編から乖離',
    ad_10_tate_v1: '新聞に判読可能な漢字＋タイプライターに英字', ad_13_tate_v1: '時計文字盤に実在数字1〜12＋便箋に英単語',
    ad_14_tate_v1: 'グラフ軸に実在数字・英字',
  },
  check: {
    c11_i2v_v1: '架空文字に数字と読める字形が混在', c27_i2v_v1: 'ノートの手書きが筆記体英語に見えるか',
    c30_i2v_v1: '終盤フレームでのみ口が出現', c45_i2v_v1: '架空文字がハングル字母に酷似',
    c48_i2v_v1: '群衆が9体→1体に減少（継続性）', c51_i2v_v1: '散乱紙が30枚→1枚に激減（継続性）',
    c60b_i2v_v1: '架空文字がハングル字母に酷似', c68_i2v_v1: '柊の目が消灯（正典は全表情で発光）',
    ad_2_tate_v1: '背景キャラの口（ボケていて断定不可）', ad_8_yoko_v1: '縫い口ライン（鵜飼系正典の可能性）',
    ad_11_tate_v1: '縫い口ライン（同上）', ad_12_tate_v1: '表示パネルの文字＋縫い口',
    ad_cm15_yoko_v1: '背景キャラの口（被写界深度外）', ad_a3_i2v_v1: 'モブの口＋同一に見えるキャラ2体',
  },
};

// ── 作品レジストリ（★ここに1行足せば新しい作品ページが増える） ──────────
const WORKS = [
  {
    slug: '003_hashikko-bill', dir: '003_はしっこビルの明日づくり',
    title: 'はしっこビルの明日づくり', sub: 'WFAIA 2026 応募作品 — Tim Burton風ゴシック × フェルト人形劇',
    ledger: join(here, 'generated.json'), characters: HASHIKKO_CHARACTERS, qa: HASHIKKO_QA,
    cover: '01_Main',
    links: [
      ['https://github.com/tkwfunkypop/public/blob/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/STORY.md', 'STORY.md（物語の正典）'],
      ['https://github.com/tkwfunkypop/public/blob/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/FLOYO_MIGRATION.md', 'FLOYO_MIGRATION.md（制作パイプライン）'],
      ['https://github.com/tkwfunkypop/public/blob/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/HANDOVER.md', 'HANDOVER.md（引き継ぎ書）'],
      ['https://github.com/tkwfunkypop/public/blob/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/qa/QA_REPORT_20260801.md', 'QA_REPORT（検品レポート）'],
      ['https://raw.githack.com/tkwfunkypop/public/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/character-sheets.html', 'character-sheets.html'],
      ['https://raw.githack.com/tkwfunkypop/public/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/startframes.html', 'startframes.html'],
    ],
  },
  { slug: '000_takahashi-teikoku', dir: '000_TakahashiTeikoku', title: '高橋帝国', sub: 'ブランド共通キャラクター（帝国ちゃん ほか）' },
  { slug: '001_ember', dir: '001_EMBER', title: 'EMBER', sub: 'キャラクター資産' },
  { slug: '002_kenta-ai-office', dir: '002_KENTA_AI_OFFICE', title: 'KENTA AI OFFICE', sub: 'キャラクター資産' },
];

// ── ASSETS走査 ───────────────────────────────────────────────────────────
const IGNORE = new Set(['.DS_Store']);
const categories = readdirSync(ASSETS).filter((c) => {
  const p = join(ASSETS, c);
  return !c.startsWith('.') && c !== 'Library' && existsSync(p) && statSync(p).isDirectory();
});

// 作品ごとに { category, sub[], rel(Library基準), base } を集める
function scanWork(dirName) {
  const want = nfd(dirName);
  const out = [];
  for (const cat of categories) {
    const catDir = join(ASSETS, cat);
    for (const d of readdirSync(catDir)) {
      if (nfd(d) !== want) continue;
      const root = join(catDir, d);
      (function walk(dir, sub) {
        for (const name of readdirSync(dir)) {
          if (name.startsWith('.') || IGNORE.has(name)) continue;
          const full = join(dir, name);
          if (statSync(full).isDirectory()) { walk(full, [...sub, name]); continue; }
          out.push({
            category: cat, sub, name,
            base: basename(name, extname(name)),
            rel: ['..', cat, d, ...sub, name].join('/'),
            size: statSync(full).size,
          });
        }
      })(root, []);
    }
  }
  return out;
}

const mediaType = (n) => {
  const e = n.toLowerCase().split('.').pop();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(e)) return 'image';
  if (['mp4', 'mov', 'webm'].includes(e)) return 'video';
  if (['wav', 'mp3', 'm4a'].includes(e)) return 'audio';
  return 'other';
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = (p) => p.split('/').map((s) => (s === '..' ? s : encodeURIComponent(s))).join('/');

function mediaTag(f) {
  if (!f) return `<div class="ph">—</div>`;
  const t = mediaType(f.name);
  if (t === 'image') return `<img loading="lazy" src="${enc(f.rel)}" alt="">`;
  if (t === 'video') return `<video preload="metadata" controls playsinline src="${enc(f.rel)}"></video>`;
  if (t === 'audio') return `<div class="ph aud">♪</div>`;
  return `<div class="ph">${esc(extname(f.name).slice(1).toUpperCase())}</div>`;
}

// 台帳IDと保存ファイル名が食い違う既知の素材（Floyo系は手動保存でidと別名）
const FILE_ALIAS = {
  angle_c17_main_zoom: 'c17_meeting_4presets_1', angle_c17_overhead: 'c17_meeting_4presets_2',
  angle_c17_reverse: 'c17_meeting_4presets_3', angle_c17_side: 'c17_meeting_4presets_4',
  c64_angle_low_v2: 'c64_lowangle_v2', c70b_interp_v1: 'c70b_stamp_interp',
  c70b_endframe_v3: 'c70b_stamp_endframe_v2',
};

const KIND_LABEL = {
  i2v_prod: '本線I2V', storyboard_panel: '絵コンテ', floyo_start_frame: '開始フレーム', end_frame: '終了フレーム',
  i2v_test: '動画テスト', interp_test: '補間テスト', ad_i2v: 'CM動画', ad_start_frame: 'CM開始フレーム',
  set_reference: 'セット正典', key_art: 'キーアート', key_visual: 'キービジュアル', design_variant: 'デザイン検討',
  narration_audio: 'ナレ音声', floyo_angle: 'Floyoアングル', character_sheet: 'キャラシート',
  bible_sheet: 'バイブル', supporting_cast: '脇役図版', animatic_export: '動画コンテ', guide_video: '解説動画',
};
const TABS = [
  { id: 'chars', label: 'キャラクター' },
  { id: 'story', label: '本編カット', kinds: ['i2v_prod', 'storyboard_panel', 'floyo_start_frame', 'end_frame', 'i2v_test', 'interp_test'] },
  { id: 'ad', label: 'CM', kinds: ['ad_i2v', 'ad_start_frame'] },
  { id: 'world', label: 'セット・世界観', kinds: ['set_reference', 'key_art', 'key_visual'] },
  { id: 'audio', label: 'ナレーション', kinds: ['narration_audio'] },
  { id: 'floyo', label: 'Floyo素材', kinds: ['floyo_angle'] },
  { id: 'files', label: '全ファイル' },
];

const CSS = `
:root{--bg:#14131a;--panel:#1d1b24;--line:#302d3c;--fg:#e9e6f0;--dim:#9a94ab;--acc:#f0a13c;--ok:#4caf7d;--warn:#e0b341;--bad:#e0655f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.6}
a{color:var(--acc)}
header.top{position:sticky;top:0;z-index:20;background:rgba(20,19,26,.96);border-bottom:1px solid var(--line);padding:13px 20px;backdrop-filter:blur(8px)}
.crumb{font-size:12px;color:var(--dim);margin-bottom:3px}
.crumb a{text-decoration:none}
h1{margin:0;font-size:19px;letter-spacing:.05em}
h1 small{color:var(--dim);font-weight:400;font-size:12px;margin-left:10px;letter-spacing:0}
.stats{color:var(--dim);font-size:12px;margin-top:3px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}
.tabs button{background:var(--panel);color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px;cursor:pointer;font-family:inherit}
.tabs button[aria-selected=true]{background:var(--acc);color:#1a1206;border-color:var(--acc);font-weight:600}
.tabs button b{font-weight:400;opacity:.65;margin-left:5px;font-size:11px}
#search{width:100%;margin-top:9px;background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--fg);padding:9px 12px;font-size:14px;font-family:inherit}
main{padding:20px;max-width:1600px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.thumb{background:#0d0c11;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;overflow:hidden}
.thumb img,.thumb video{width:100%;height:100%;object-fit:contain;display:block}
.ph{color:#4b4658;font-size:12px}.ph.aud{font-size:30px;color:var(--acc)}
.body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.body h4{margin:0;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
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
.open{font-size:11.5px;text-decoration:none;margin-top:auto}
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
h2.sec{font-size:13px;color:var(--dim);font-weight:600;letter-spacing:.08em;margin:22px 0 9px;border-left:3px solid var(--acc);padding-left:9px}
.hidden{display:none!important}
.empty{color:var(--dim);padding:40px 0;text-align:center}
footer{color:#5d5771;font-size:11.5px;padding:28px 20px;text-align:center;border-top:1px solid var(--line);margin-top:28px}
.works{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.work{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;text-decoration:none;color:var(--fg);display:flex;flex-direction:column}
.work:hover{border-color:var(--acc)}
.work .cov{aspect-ratio:16/9;background:#0d0c11;overflow:hidden}
.work .cov img{width:100%;height:100%;object-fit:cover}
.work .wb{padding:13px 15px}
.work h3{margin:0 0 3px;font-size:17px}
.work p{margin:0;color:var(--dim);font-size:12.5px}
.work .cnt{margin-top:8px;display:flex;gap:5px;flex-wrap:wrap}
.work .cnt span{background:#272433;color:var(--dim);border-radius:4px;padding:1px 7px;font-size:11px}
.linkrow{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:9px;margin-bottom:6px}
.linkrow a{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px 13px;text-decoration:none;color:var(--fg);font-size:13px}
.linkrow a:hover{border-color:var(--acc)}
`;

const SCRIPT = `
const panes=[...document.querySelectorAll('.pane')],btns=[...document.querySelectorAll('.tabs button')],q=document.getElementById('search'),nores=document.getElementById('noresult');
let tab=btns.length?btns[0].dataset.tab:'';
function filter(){
  const s=q.value.trim().toLowerCase(),pane=document.getElementById('pane-'+tab);
  if(!pane)return;let hit=0;
  const secs=pane.querySelectorAll('.charsec');
  secs.forEach(sec=>{
    let inner=0;
    sec.querySelectorAll('.card').forEach(c=>{const m=!s||c.dataset.q.includes(s);c.classList.toggle('hidden',!m);if(m)inner++;});
    const self=!s||sec.dataset.q.includes(s),vis=self||inner>0;
    if(self&&s)sec.querySelectorAll('.card').forEach(c=>c.classList.remove('hidden'));
    sec.classList.toggle('hidden',!vis);if(vis)hit++;
  });
  if(!secs.length){
    pane.querySelectorAll('.card').forEach(c=>{const m=!s||c.dataset.q.includes(s);c.classList.toggle('hidden',!m);if(m)hit++;});
    pane.querySelectorAll('.grp').forEach(g=>{g.classList.toggle('hidden',!g.querySelector('.card:not(.hidden)'));});
    if(pane.querySelector('.linkrow'))hit=1;
  }
  nores.classList.toggle('hidden',hit>0);
}
function show(){
  panes.forEach(p=>p.classList.toggle('hidden',p.id!=='pane-'+tab));
  btns.forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
  filter();
}
btns.forEach(b=>b.onclick=()=>{tab=b.dataset.tab;show();});
q.oninput=filter;show();
`;

// ── 作品ページ生成 ───────────────────────────────────────────────────────
function buildWorkPage(work) {
  const files = scanWork(work.dir);
  if (!files.length) return null;

  // basename → ファイル群
  const byBase = new Map();
  for (const f of files) {
    if (!byBase.has(f.base)) byBase.set(f.base, []);
    byBase.get(f.base).push(f);
  }
  const filesFor = (rawId) => {
    const id = FILE_ALIAS[rawId] || rawId;
    const out = [...(byBase.get(id) || [])];
    for (const [b, arr] of byBase) if (b !== id && b.startsWith(id + '_') && /^\d+$/.test(b.slice(id.length + 1))) out.push(...arr);
    return out;
  };

  // 台帳
  let items = [], latest = new Map();
  if (work.ledger && existsSync(work.ledger)) {
    const g = JSON.parse(readFileSync(work.ledger, 'utf8'));
    for (const it of g.items) if (it.id) latest.set(it.id, it);
    items = [...latest.values()];
  }
  const qa = work.qa || { retake: {}, check: {} };
  const usedFiles = new Set();

  const card = (it) => {
    const fs2 = filesFor(it.id);
    fs2.forEach((f) => usedFiles.add(f.rel));
    const kind = it.kind || 'figure';
    const badges = [];
    if (qa.retake[it.id]) badges.push(`<span class="b retake" title="${esc(qa.retake[it.id])}">要リテイク</span>`);
    else if (qa.check[it.id]) badges.push(`<span class="b check" title="${esc(qa.check[it.id])}">要確認</span>`);
    if (String(it.approved) === 'True') badges.push('<span class="b ok">承認済</span>');
    if (!fs2.length) badges.push('<span class="b none">ファイル未配置</span>');
    const meta = [KIND_LABEL[kind] || kind, it.cut ? `C${it.cut}` : '', it.model, it.resolution, it.duration_sec ? `${it.duration_sec}s` : '', it.voice, it.sheet]
      .filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join('');
    const auds = fs2.filter((f) => mediaType(f.name) === 'audio');
    return `<article class="card" data-q="${esc([it.id, it.note, it.text, it.character, it.sheet].filter(Boolean).join(' ').toLowerCase())}">
<div class="thumb">${mediaTag(fs2[0])}</div><div class="body">
<h4>${esc(it.id)}</h4><div class="meta">${meta}</div>
${badges.length ? `<div class="badges">${badges.join('')}</div>` : ''}
${it.text ? `<p class="quote">${esc(it.text)}</p>` : ''}
${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
${auds.map((f) => `<audio controls preload="none" src="${enc(f.rel)}"></audio>`).join('')}
${fs2.length ? `<a class="open" href="${enc(fs2[0].rel)}" target="_blank">原寸で開く ↗</a>` : ''}
</div></article>`;
  };

  const fileCard = (f) => {
    const t = mediaType(f.name);
    return `<article class="card" data-q="${esc([f.name, f.category, f.sub.join(' ')].join(' ').toLowerCase())}">
<div class="thumb">${mediaTag(f)}</div><div class="body">
<h4>${esc(f.name)}</h4>
<div class="meta"><span>${esc([f.category, ...f.sub].join(' / '))}</span><span>${(f.size / 1024 / 1024).toFixed(1)}MB</span></div>
${t === 'audio' ? `<audio controls preload="none" src="${enc(f.rel)}"></audio>` : ''}
<a class="open" href="${enc(f.rel)}" target="_blank">開く ↗</a></div></article>`;
  };

  const ALIAS = { HIIRAGI_53: 'HIIRAGI_GENZO_53', DEVELOPER: 'DEVELOPER_AGENT' };
  const charKey = (raw) => { if (!raw) return null; const k = String(raw).split('+')[0].trim(); return ALIAS[k] || k; };

  let panesHtml = '', tabsHtml = '', counts = {};
  if (work.characters) {
    // キャラクタータブ
    const charSection = (c) => {
      const own = items.filter((it) => charKey(it.character) === c.key);
      const sheets = own.filter((it) => ['character_sheet', 'bible_sheet', 'design_variant', 'supporting_cast'].includes(it.kind));
      const figFiles = filesFor(c.figure); figFiles.forEach((f) => usedFiles.add(f.rel));
      const introFiles = c.intro ? filesFor(c.intro) : []; introFiles.forEach((f) => usedFiles.add(f.rel));
      return `<section class="charsec" data-q="${esc([c.jp, c.en, c.floor, c.key].join(' ').toLowerCase())}">
<header class="charhead"><div class="charfig">${mediaTag(figFiles[0])}</div><div>
<h3>${esc(c.jp)} <small>${esc(c.en)}</small></h3><p class="floor">${esc(c.floor)}</p>
${c.uuid ? `<p class="uuid">参照UUID <code>${esc(c.uuid)}</code></p>` : ''}
<p class="counts">シート ${sheets.length}点${introFiles.length ? ' / 紹介カットあり' : ''}</p></div></header>
${introFiles.length ? `<div class="introrow"><video preload="metadata" controls playsinline src="${enc(introFiles[0].rel)}"></video><span>キャラ紹介カット <code>${esc(c.intro)}</code></span></div>` : ''}
<div class="grid">${sheets.map(card).join('')}</div></section>`;
    };
    const charsPane = work.characters.map(charSection).join('');
    counts.chars = work.characters.length;

    const kindItems = {};
    for (const t of TABS) if (t.kinds) kindItems[t.id] = items.filter((it) => t.kinds.includes(it.kind));
    const cutNum = (c) => { const m = String(c ?? '').match(/^(\d+)/); return m ? parseInt(m[1], 10) : 9999; };
    kindItems.story?.sort((a, b) => cutNum(a.cut) - cutNum(b.cut) || String(a.id).localeCompare(String(b.id)));
    kindItems.audio?.sort((a, b) => cutNum(a.cut) - cutNum(b.cut));

    const panes = [`<div id="pane-chars" class="pane">${charsPane}</div>`];
    for (const t of TABS) {
      if (!t.kinds) continue;
      counts[t.id] = kindItems[t.id].length;
      panes.push(`<div id="pane-${t.id}" class="pane hidden"><div class="grid">${kindItems[t.id].map(card).join('')}</div></div>`);
    }
    // 全ファイルタブ（台帳に載っていないものも含めカテゴリ別）
    const groups = new Map();
    for (const f of files) {
      const k = [f.category, ...f.sub].join(' / ');
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(f);
    }
    counts.files = files.length;
    panes.push(`<div id="pane-files" class="pane hidden">${[...groups].sort()
      .map(([k, fs2]) => `<div class="grp"><h2 class="sec">${esc(k)} <span style="color:#5d5771">(${fs2.length})</span></h2><div class="grid">${fs2.map(fileCard).join('')}</div></div>`).join('')}</div>`);
    panesHtml = panes.join('');
    tabsHtml = TABS.map((t, i) => `<button data-tab="${t.id}" aria-selected="${i === 0}">${t.label}<b>${counts[t.id] ?? 0}</b></button>`).join('');
  } else {
    // 台帳なし作品: カテゴリ別のフォルダ閲覧ページ
    const groups = new Map();
    for (const f of files) {
      const k = [f.category, ...f.sub].join(' / ');
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(f);
    }
    counts.files = files.length;
    panesHtml = `<div id="pane-files" class="pane">${[...groups].sort()
      .map(([k, fs2]) => `<div class="grp"><h2 class="sec">${esc(k)} <span style="color:#5d5771">(${fs2.length})</span></h2><div class="grid">${fs2.map(fileCard).join('')}</div></div>`).join('')}</div>`;
    tabsHtml = `<button data-tab="files" aria-selected="true">全ファイル<b>${files.length}</b></button>`;
  }

  const catCounts = [...new Set(files.map((f) => f.category))].sort()
    .map((c) => `<span>${esc(c)} ${files.filter((f) => f.category === c).length}</span>`).join('');

  const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(work.title)} — ASSET LIBRARY</title><style>${CSS}</style></head><body>
<header class="top">
<div class="crumb"><a href="../ASSET_LIBRARY.html">← ASSET LIBRARY（作品一覧）</a></div>
<h1>${esc(work.title)} <small>${esc(work.sub || '')}</small></h1>
<div class="stats">ファイル ${files.length}件${items.length ? ` / 台帳 ${items.length}件` : ''} ・ ${esc(work.dir)} ・ 更新 ${new Date().toISOString().slice(0, 10)}</div>
<div class="work cnt" style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">${catCounts}</div>
<nav class="tabs">${tabsHtml}</nav>
<input id="search" type="search" placeholder="検索（ファイル名・id・キャラ名・ノート・ナレ本文…）">
</header>
<main>
${work.links ? `<div class="linkrow">${work.links.map(([u, l]) => `<a href="${esc(u)}" target="_blank">${esc(l)}</a>`).join('')}</div>` : ''}
${panesHtml}
<p id="noresult" class="empty hidden">該当する素材がありません</p>
</main>
<footer>~/Documents/ASSETS を走査して自動生成 / 更新は build-asset-library.mjs を再実行</footer>
<script>${SCRIPT}</script></body></html>`;

  mkdirSync(LIB, { recursive: true });
  writeFileSync(join(LIB, `${work.slug}.html`), html, 'utf8');
  return { files, items, counts, cover: (work.cover ? filesFor(work.cover)[0] : null) || files.find((f) => mediaType(f.name) === 'image' && f.category === 'KV') || files.find((f) => mediaType(f.name) === 'image') };
}

// ── 作品一覧（ハブ） ─────────────────────────────────────────────────────
const built = [];
for (const w of WORKS) {
  const r = buildWorkPage(w);
  if (r) built.push([w, r]);
  else console.warn(`  スキップ（ファイルなし）: ${w.dir}`);
}

const coverRel = (f) => (f ? f.rel.replace(/^\.\./, '.') : null); // ハブはASSETS直下なので ../ → ./
const indexHtml = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ASSET LIBRARY</title><style>${CSS}</style></head><body>
<header class="top">
<h1>ASSET LIBRARY <small>~/Documents/ASSETS</small></h1>
<div class="stats">作品 ${built.length}件 / 総ファイル ${built.reduce((n, [, r]) => n + r.files.length, 0)}件 ・ 更新 ${new Date().toISOString().slice(0, 10)}</div>
</header>
<main>
<h2 class="sec">作品</h2>
<div class="works">
${built.map(([w, r]) => `<a class="work" href="Library/${esc(w.slug)}.html">
<div class="cov">${r.cover ? `<img loading="lazy" src="${enc(coverRel(r.cover))}" alt="">` : ''}</div>
<div class="wb"><h3>${esc(w.title)}</h3><p>${esc(w.sub || '')}</p>
<div class="cnt"><span>ファイル ${r.files.length}</span>${r.items.length ? `<span>台帳 ${r.items.length}</span>` : ''}${[...new Set(r.files.map((f) => f.category))].sort().map((c) => `<span>${esc(c)}</span>`).join('')}</div>
</div></a>`).join('')}
</div>
<h2 class="sec">フォルダ構成の決まり</h2>
<div class="linkrow">
<a href="#" onclick="return false">素材種別（第1階層） → 作品番号_作品名（第2階層） → 用途別サブフォルダ</a>
<a href="#" onclick="return false">日本語フォルダ名は NFD 正規化に統一（macOS慣習）</a>
<a href="#" onclick="return false">更新: migrate-to-assets.mjs --run → build-asset-library.mjs</a>
</div>
</main>
<footer>作品を追加するには build-asset-library.mjs の WORKS に1行足して再実行する</footer>
</body></html>`;
writeFileSync(join(ASSETS, 'ASSET_LIBRARY.html'), indexHtml, 'utf8');

console.log(`完成: ${join(ASSETS, 'ASSET_LIBRARY.html')}（作品一覧）`);
for (const [w, r] of built) console.log(`  Library/${w.slug}.html  ファイル${r.files.length} / 台帳${r.items.length}`);
