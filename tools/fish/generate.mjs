#!/usr/bin/env node
// Fish Audio TTS ランナー（依存ゼロ / ローカルPC用）
// ナレーション原稿は works/hashikko-bill/generated.json の kind:narration_audio から自動で引く。
//
// 使い方（すべて tools/fish/.env に FISH_AUDIO_KEY が必要）:
//   node --env-file=tools/fish/.env tools/fish/generate.mjs --search "ナレーション"
//       … 日本語の公開ボイスを検索して id と名前を一覧表示
//   node --env-file=tools/fish/.env tools/fish/generate.mjs --audition
//       … 人気の日本語ボイス上位5種で冒頭ナレ(C02)を1本ずつ生成 → 聴き比べ用
//   node --env-file=tools/fish/.env tools/fish/generate.mjs --voice <reference_id> --sample
//       … 指定ボイスで冒頭ナレ3本(C02/C03/C05)を生成
//   node --env-file=tools/fish/.env tools/fish/generate.mjs --voice <reference_id> --all
//       … 指定ボイスで全ナレ・台詞30本を再生成（命名: c{cut}_vo_fish_v1.mp3）
//
// 出力先: tools/fish/out/

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.fish.audio';
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'out');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const key = process.env.FISH_AUDIO_KEY;
if (!key) {
  console.error('FISH_AUDIO_KEY が未設定です。tools/fish/.env.example をコピーして記入してください。');
  process.exit(1);
}
const auth = { authorization: `Bearer ${key}` };
// TTSエンジン。s1 が最新。必要なら .env の FISH_MODEL で変更（speech-1.5 等）
const engine = process.env.FISH_MODEL ?? 's1';

// 台帳からナレ原稿を読む
const ledgerPath = join(here, '..', '..', 'works', 'hashikko-bill', 'generated.json');
const narrations = JSON.parse(readFileSync(ledgerPath, 'utf8'))
  .items.filter((it) => it.kind === 'narration_audio' && it.text);
const byId = new Map(narrations.map((n) => [n.id, n]));

async function searchVoices(title) {
  const u = `${API}/model?language=ja&sort_by=task_count&page_size=15${title ? `&title=${encodeURIComponent(title)}` : ''}`;
  const res = await fetch(u, { headers: auth });
  if (!res.ok) throw new Error(`search failed ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return body.items ?? body.data ?? [];
}

async function tts(text, referenceId, dest) {
  const res = await fetch(`${API}/v1/tts`, {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json', model: engine },
    body: JSON.stringify({ text, reference_id: referenceId, format: 'mp3', normalize: true, latency: 'normal' }),
  });
  if (!res.ok) throw new Error(`tts failed ${res.status}: ${await res.text()}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`  saved ${dest}`);
}

const SAMPLE_IDS = ['vo_c02', 'vo_c03', 'vo_c05'];

if (flag('search') || opt('search')) {
  const kw = opt('search') && !opt('search').startsWith('--') ? opt('search') : '';
  const voices = await searchVoices(kw);
  if (!voices.length) console.log('該当なし。キーワードを変えて試してください。');
  for (const v of voices) {
    console.log(`${v._id ?? v.id}  |  ${v.title}  |  使用${v.task_count ?? "?"}回  |  ${(v.languages ?? []).join(',')}`);
  }
} else if (flag('audition')) {
  const line = byId.get('vo_c02');
  const voices = (await searchVoices('')).slice(0, 5);
  console.log(`聴き比べ: 上位${voices.length}ボイスで「${line.text}」を生成`);
  for (const v of voices) {
    const id = v._id ?? v.id;
    const safe = String(v.title).replace(/[^\w぀-ヿ一-鿿-]+/g, '_').slice(0, 24);
    try {
      await tts(line.text, id, join(outDir, `audition_${safe}_${id.slice(0, 6)}.mp3`));
    } catch (e) {
      console.error(`  NG ${v.title}: ${e.message}`);
    }
  }
  console.log('\ntools/fish/out/ の audition_*.mp3 を聴き比べて、気に入った id を教えてください。');
} else {
  const voice = opt('voice');
  if (!voice) {
    console.error('使い方: --search "キーワード" / --audition / --voice <id> --sample / --voice <id> --all');
    process.exit(1);
  }
  const targets = flag('all') ? narrations : SAMPLE_IDS.map((id) => byId.get(id)).filter(Boolean);
  console.log(`${targets.length}本を生成します (voice=${voice}, engine=${engine})`);
  for (const n of targets) {
    const name = `c${n.cut}_vo_fish_v1.mp3`;
    try {
      await tts(n.text, voice, join(outDir, name));
    } catch (e) {
      console.error(`  NG ${name}: ${e.message}`);
    }
  }
  console.log('\n完了。採用が決まったら works/hashikko-bill/generated.json への登録とデスクトップ反映をやります。');
}
