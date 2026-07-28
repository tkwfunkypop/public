#!/usr/bin/env node
/**
 * Fal API で画像を生成する最小スクリプト（依存ゼロ・Node標準のみ）。
 * このリポジトリでは画像生成は Fal を最優先で使う（CLAUDE.md 参照）。
 *
 * 使い方:
 *   単発:
 *     node --env-file=tools/fal/.env tools/fal/generate.mjs "a crooked seven-story building in fog"
 *   バッチ（マニフェストの全カットをまとめて生成）:
 *     node --env-file=tools/fal/.env tools/fal/generate.mjs --batch works/hashikko-bill/prompts.json
 *
 * 主な環境変数:
 *   FAL_KEY          必須。fal.ai のAPIキー（チャットに貼らないこと）
 *   FAL_MODEL        モデルID（既定 fal-ai/flux-pro/v1.1-ultra）
 *   FAL_OUT_DIR      保存先ディレクトリ（既定 ./out）
 *   FAL_ASPECT       アスペクト比（既定 1:1）。21:9 16:9 4:3 3:2 1:1 2:3 3:4 9:16 9:21
 *   FAL_CONCURRENCY  バッチ時の同時実行数（既定 3）
 *   FAL_SEED         シード固定（省略でランダム）
 *
 * ※ モデルIDは fal 側で追加・改名されるため、通らない場合は https://fal.ai/models で確認して
 *   FAL_MODEL かマニフェストの "model" を差し替えてください。
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error('✗ FAL_KEY を環境変数で設定してください（チャットに貼らないこと）。');
  console.error('  例: tools/fal/.env.example を tools/fal/.env にコピーして記入し、');
  console.error('      node --env-file=tools/fal/.env tools/fal/generate.mjs ...');
  process.exit(1);
}

const QUEUE = 'https://queue.fal.run';
const DEFAULT_MODEL = process.env.FAL_MODEL || 'fal-ai/flux-pro/v1.1-ultra';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const headers = { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' };

/** 1カット生成して保存。成功でファイルパスを返す */
async function generate(item, cfg) {
  const model = item.model || cfg.model || DEFAULT_MODEL;
  const prompt = [item.prompt, cfg.style].filter(Boolean).join(' ');
  const input = {
    prompt,
    aspect_ratio: item.aspect_ratio || cfg.aspect_ratio || process.env.FAL_ASPECT || '1:1',
    output_format: item.output_format || cfg.output_format || 'jpeg',
    num_images: 1,
    ...(cfg.extra || {}),
    ...(item.extra || {}),
  };
  const seed = item.seed ?? cfg.seed ?? (process.env.FAL_SEED ? Number(process.env.FAL_SEED) : undefined);
  if (seed !== undefined) input.seed = seed;

  const submit = await fetch(QUEUE + '/' + model, {
    method: 'POST', headers, body: JSON.stringify(input),
  });
  const sj = await submit.json().catch(() => ({}));
  if (!submit.ok) {
    throw new Error('submit ' + submit.status + ' ' + JSON.stringify(sj).slice(0, 400));
  }

  const statusUrl = sj.status_url || (QUEUE + '/' + model + '/requests/' + sj.request_id + '/status');
  const responseUrl = sj.response_url || (QUEUE + '/' + model + '/requests/' + sj.request_id);
  console.log('  [' + item.id + '] queued: ' + sj.request_id);

  // ポーリング（最大10分）
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    const st = await fetch(statusUrl, { headers });
    const stj = await st.json().catch(() => ({}));
    if (stj.status === 'COMPLETED') break;
    if (stj.status === 'FAILED' || stj.status === 'ERROR') {
      throw new Error('generation failed: ' + JSON.stringify(stj).slice(0, 400));
    }
    if (i === 119) throw new Error('timeout (10min) request_id=' + sj.request_id);
  }

  const res = await fetch(responseUrl, { headers });
  const rj = await res.json().catch(() => ({}));
  const url = rj?.images?.[0]?.url;
  if (!url) throw new Error('no image in response: ' + JSON.stringify(rj).slice(0, 400));

  const outDir = cfg.outDir || process.env.FAL_OUT_DIR || './out';
  fs.mkdirSync(outDir, { recursive: true });
  const ext = (input.output_format === 'png') ? 'png' : 'jpg';
  const file = path.join(outDir, item.id + '.' + ext);
  const bin = await fetch(url);
  fs.writeFileSync(file, Buffer.from(await bin.arrayBuffer()));
  console.log('  [' + item.id + '] ✓ ' + file);
  return file;
}

/** 同時実行数を絞って順に流す */
async function runPool(items, cfg, limit) {
  const results = [];
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        results.push({ id: item.id, file: await generate(item, cfg), ok: true });
      } catch (e) {
        console.error('  [' + item.id + '] ✗ ' + e.message);
        results.push({ id: item.id, error: e.message, ok: false });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const batchIdx = args.indexOf('--batch');

  if (batchIdx !== -1) {
    const manifestPath = args[batchIdx + 1];
    if (!manifestPath || !fs.existsSync(manifestPath)) {
      console.error('✗ マニフェストが見つかりません: ' + manifestPath);
      process.exit(1);
    }
    const cfg = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // --only id1,id2 で一部だけ再生成できる
    const onlyIdx = args.indexOf('--only');
    let items = cfg.items || [];
    if (onlyIdx !== -1 && args[onlyIdx + 1]) {
      const ids = args[onlyIdx + 1].split(',').map((s) => s.trim());
      items = items.filter((it) => ids.includes(it.id));
    }
    if (!items.length) { console.error('✗ 生成対象がありません。'); process.exit(1); }

    const limit = Number(process.env.FAL_CONCURRENCY || 3);
    console.log('→ Fal バッチ生成: ' + items.length + ' カット / model=' + (cfg.model || DEFAULT_MODEL) + ' / 同時' + limit);
    const results = await runPool(items, cfg, limit);
    const ng = results.filter((r) => !r.ok);
    console.log('\n完了: 成功 ' + (results.length - ng.length) + ' / 失敗 ' + ng.length);
    if (ng.length) {
      console.log('再試行するには: --only ' + ng.map((r) => r.id).join(','));
      process.exit(1);
    }
    return;
  }

  const prompt = args.filter((a) => !a.startsWith('--')).join(' ');
  if (!prompt) {
    console.error('✗ プロンプトを指定してください:');
    console.error('  node --env-file=tools/fal/.env tools/fal/generate.mjs "your prompt"');
    console.error('  node --env-file=tools/fal/.env tools/fal/generate.mjs --batch <manifest.json>');
    process.exit(1);
  }
  console.log('→ Fal 生成: model=' + DEFAULT_MODEL);
  await generate({ id: 'out-' + Date.now(), prompt }, {});
}

main().catch((e) => { console.error('✗ エラー:', e.message); process.exit(1); });
