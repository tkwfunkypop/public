#!/usr/bin/env node
// Floyo ワークフローAPIランナー（依存ゼロ / Node 22+）
//
// 使い方:
//   node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow <name> --batch <manifest.json> [--dry-run]
//
// APIの流れ（docs.floyo.ai/floyo-api-* 準拠）:
//   1. 入力画像URLをダウンロード → POST /files でチーム保存領域へアップロード → input_path を得る
//   2. graphs/<name>.json（Copy Floyo API Code の「Workflow JSON only」）に
//      workflows.json の patches 定義どおり入力を差し込む
//   3. POST /runs { name, workflow } → run id
//   4. GET /runs/<id>?expand=outputs_presigned_url をポーリング → 出力URLを保存
//
// 認証: 環境変数 FLOYO_API_KEY（Team Settings > Floyo API で発行。チャット・コミットに載せない）

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.floyo.ai';
const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const dryRun = args.includes('--dry-run');

const wfName = opt('workflow');
const manifestPath = opt('batch');
if (!wfName || !manifestPath) {
  console.error('usage: run.mjs --workflow <name> --batch <manifest.json> [--dry-run]');
  process.exit(1);
}

const registry = JSON.parse(readFileSync(join(here, 'workflows.json'), 'utf8'));
const wf = registry[wfName];
if (!wf) {
  console.error(`unknown workflow "${wfName}" — workflows.json のキー: ${Object.keys(registry).join(', ')}`);
  process.exit(1);
}
const graphPath = join(here, 'graphs', `${wfName}.json`);
if (!existsSync(graphPath)) {
  console.error(`graphs/${wfName}.json がありません。`);
  console.error('Floyoエディタ: メニュー → Copy Floyo API Code → 「Workflow JSON only」をコピーして保存してください。');
  process.exit(1);
}
const graphTemplate = JSON.parse(readFileSync(graphPath, 'utf8'));

const apiKey = process.env.FLOYO_API_KEY;
if (!apiKey && !dryRun) {
  console.error('FLOYO_API_KEY が未設定です（tools/floyo/.env を参照）');
  process.exit(1);
}
const authHeaders = { authorization: `Bearer ${apiKey}`, accept: 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 画像URL → ダウンロード → POST https://cdn.floyo.ai/upload → input_path
const uploadCache = new Map();
async function uploadImage(url) {
  if (uploadCache.has(url)) return uploadCache.get(url);
  const src = await fetch(url);
  if (!src.ok) throw new Error(`download failed ${src.status}: ${url}`);
  const blob = await src.blob();
  const name = basename(new URL(url).pathname) || 'input.png';
  const form = new FormData();
  form.append('file', blob, name);
  form.append('path', '/wfaia');
  form.append('on_conflict', 'rename');
  const res = await fetch('https://cdn.floyo.ai/upload', { method: 'POST', headers: authHeaders, body: form });
  if (!res.ok) throw new Error(`upload failed ${res.status}: ${await res.text()}`);
  const file = await res.json();
  const inputPath = file.input_path ?? file.inputPath;
  if (!inputPath) throw new Error(`upload response に input_path が無い: ${JSON.stringify(file)}`);
  console.log(`  uploaded ${name} -> ${inputPath}`);
  uploadCache.set(url, inputPath);
  return inputPath;
}

// patches: { 論理名: {node:"274", field:"image", upload:true} }。upload:true はURLを /upload に通して input_path 化
async function buildGraph(inputs) {
  const graph = structuredClone(graphTemplate);
  for (const [key, value] of Object.entries(inputs)) {
    const patch = wf.patches?.[key];
    if (!patch) {
      console.warn(`  (warn) patches に "${key}" が未定義 — スキップ`);
      continue;
    }
    const node = graph[patch.node];
    if (!node) throw new Error(`graph にノード ${patch.node} が無い（patches "${key}"）`);
    node.inputs[patch.field] = patch.upload && !dryRun ? await uploadImage(value) : value;
  }
  return graph;
}

// 取得は一覧API: GET /runs?search=<ラン名>（単一ラン取得エンドポイントは無い）
// presigned_url_expires_in の上限は 84600 (24h)
async function findRun(name, id = null) {
  const u = `${API}/runs?search=${encodeURIComponent(name)}&expand=outputs_presigned_url&presigned_url_expires_in=84600&limit=10`;
  const res = await fetch(u, { headers: authHeaders });
  if (!res.ok) throw new Error(`list runs failed ${res.status}: ${await res.text()}`);
  const body = await res.json();
  const runs = body.data ?? body.runs ?? body.items ?? (Array.isArray(body) ? body : []);
  if (id) return runs.find((r) => r.id === id) ?? null;
  return runs.find((r) => (r.status ?? '').toLowerCase() === 'complete') ?? runs[0] ?? null;
}

async function pollRun(name, id) {
  for (let i = 0; i < 360; i++) {
    const run = await findRun(name, id);
    if (run) {
      const status = (run.status ?? '').toLowerCase();
      if (status === 'complete') return run;
      if (['failed', 'canceled', 'cancelled'].includes(status)) throw new Error(JSON.stringify(run).slice(0, 500));
    }
    process.stdout.write('.');
    await sleep(10000);
  }
  throw new Error('poll timeout (60min)');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const outDir = join(here, 'results');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// --fetch: ラン投入をスキップし、既存ランの結果だけをラン名で取得する
const fetchOnly = args.includes('--fetch');

const results = [];
for (const item of manifest.items ?? []) {
  console.log(`\n[${item.id}]`);
  const runName = `${wf.run_prefix ?? wfName}_${item.id}`;
  try {
    let runId = null;
    if (!fetchOnly) {
      const graph = await buildGraph(item.inputs ?? {});
      const payload = { name: runName, workflow: graph };
      if (dryRun) {
        const patched = Object.entries(wf.patches ?? {})
          .map(([k, p]) => `  ${k} -> node ${p.node}.${p.field} = ${JSON.stringify(graph[p.node]?.inputs?.[p.field])?.slice(0, 120)}`);
        console.log(`  POST ${API}/runs name=${payload.name}\n${patched.join('\n')}`);
        continue;
      }
      const res = await fetch(`${API}/runs`, {
        method: 'POST',
        headers: { ...authHeaders, 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`create run failed ${res.status}: ${await res.text()}`);
      ({ id: runId } = await res.json());
      console.log(`  run ${runId} queued`);
    }
    const done = await pollRun(runName, runId);
    const outputs = done.outputs ?? done.output_files ?? [];
    console.log(`\n  ${done.id} complete: ${outputs.length} output(s)`);
    results.push({ id: item.id, cut: item.cut, ok: true, run_id: done.id, outputs });
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
    results.push({ id: item.id, cut: item.cut, ok: false, error: String(e.message).slice(0, 500) });
  }
}

if (!dryRun) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = join(outDir, `${wfName}-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify({ workflow: wfName, manifest: manifestPath, results }, null, 2));
  console.log(`\nresults -> ${outPath}`);
  console.log('presigned URLは期限付き。合格出力は早めに保存し works/hashikko-bill/generated.json に追記すること。');
}
