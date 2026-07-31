#!/usr/bin/env node
// Floyo ワークフローAPIランナー（依存ゼロ）
// 使い方:
//   node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow <name> --batch <manifest.json> [--dry-run]
//
// - <name> は workflows.json のキー（qwen-angle / ltx-startend など）
// - endpoint が未設定のワークフローは実行前にエラーで止まる。
//   Floyoでワークフローをフォーク保存 → Copy API Snippet で得た
//   エンドポイントURLを workflows.json に記入してから使う。
// - APIキーは環境変数 FLOYO_API_KEY（.env に記入。チャット・コミットに載せない）
//
// マニフェスト形式:
//   { "items": [ { "id": "c17_side", "inputs": { ...ワークフロー入力... } }, ... ] }
// inputs は workflows.json の defaults とマージされ、そのままAPIに送られる。

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const wfName = opt('workflow');
const manifestPath = opt('batch');
const dryRun = flag('dry-run');
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
if (!wf.endpoint && !dryRun) {
  console.error(`workflow "${wfName}" の endpoint が未設定です。`);
  console.error('Floyoでフォーク保存 → Copy API Snippet のURLを workflows.json に記入してください。');
  process.exit(1);
}
const apiKey = process.env.FLOYO_API_KEY;
if (!apiKey && !dryRun) {
  console.error('FLOYO_API_KEY が未設定です（tools/floyo/.env を参照）');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const items = manifest.items ?? [];
const outDir = join(here, 'results');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const headers = {
  'content-type': 'application/json',
  ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pollUntilDone(job) {
  // レスポンスに含まれる状態確認URL（status_url / urls.get 等）を優先。
  // 無ければ workflows.json の poll_url_template（{id} を置換）を使う。
  const pollUrl =
    job.status_url ?? job.urls?.get ??
    (wf.poll_url_template && job.id ? wf.poll_url_template.replace('{id}', job.id) : null);
  if (!pollUrl) return job; // 同期APIならそのまま結果
  for (let i = 0; i < 240; i++) {
    await sleep(5000);
    const res = await fetch(pollUrl, { headers });
    const body = await res.json();
    const status = (body.status ?? body.state ?? '').toLowerCase();
    if (['completed', 'succeeded', 'success', 'done'].includes(status)) return body;
    if (['failed', 'error', 'cancelled'].includes(status)) throw new Error(JSON.stringify(body));
    process.stdout.write('.');
  }
  throw new Error('poll timeout (20min)');
}

const results = [];
for (const item of items) {
  const payload = { ...(wf.defaults ?? {}), ...(item.inputs ?? {}) };
  console.log(`\n[${item.id}] POST ${wf.endpoint}`);
  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    continue;
  }
  const res = await fetch(wf.endpoint, {
    method: wf.method ?? 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`  HTTP ${res.status}: ${await res.text()}`);
    results.push({ id: item.id, ok: false, status: res.status });
    continue;
  }
  try {
    const done = await pollUntilDone(await res.json());
    console.log(`\n  done: ${JSON.stringify(done).slice(0, 300)}`);
    results.push({ id: item.id, ok: true, result: done });
  } catch (e) {
    console.error(`\n  FAILED: ${e.message}`);
    results.push({ id: item.id, ok: false, error: e.message });
  }
}

if (!dryRun) {
  const outPath = join(outDir, `${wfName}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(outPath, JSON.stringify({ workflow: wfName, manifest: manifestPath, results }, null, 2));
  console.log(`\nresults -> ${outPath}`);
  console.log('合格した出力は works/hashikko-bill/generated.json に追記して台帳を一元管理すること。');
}
