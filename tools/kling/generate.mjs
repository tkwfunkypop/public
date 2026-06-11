#!/usr/bin/env node
/**
 * Kling 公式API で画像→動画（image2video）を生成する最小スクリプト（依存ゼロ）。
 * 「揺れの少ない」設定（カメラを固定し、ゆっくりズームのみ／anti-shakeのネガティブプロンプト）を既定にしています。
 *
 * 使い方（あなたのマシンで実行）:
 *   1. 公式デベロッパー管理画面で AccessKey / SecretKey を取得
 *   2. 環境変数に設定（チャットに貼らないでください）:
 *        export KLING_ACCESS_KEY=xxxxx
 *        export KLING_SECRET_KEY=yyyyy
 *      もしくは tools/kling/.env を作って `node --env-file=tools/kling/.env ...` で渡す
 *   3. 実行（第1引数 = 起点画像のURL もしくは ローカル画像パス）:
 *        node tools/kling/generate.mjs <画像URL or パス>
 *      例:
 *        node tools/kling/generate.mjs https://example.com/hero.png
 *        node tools/kling/generate.mjs ./lp/assets/hero.png
 *
 * 主な環境変数（任意）:
 *   KLING_MODEL     使用モデル（既定 kling-v2-1）。例: kling-v2-5-turbo / kling-v2-master / kling-v1-6
 *   KLING_BASE_URL  既定 https://api.klingai.com（シンガポール: https://api-singapore.klingai.com）
 *   KLING_MODE      std | pro（既定 pro）
 *   KLING_DURATION  5 | 10（既定 5）
 *   KLING_PROMPT / KLING_NEGATIVE_PROMPT  プロンプト上書き
 *   KLING_CAMERA    on | off（既定 on＝固定カメラ＋ゆっくりズーム。モデル非対応なら off に）
 *   KLING_ZOOM      ズーム量 -10〜10（既定 3＝弱い push-in）
 *   KLING_OUT       指定すると完成動画をそのパスに保存（例 ./lp/assets/hero.mp4）
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

const AK = process.env.KLING_ACCESS_KEY;
const SK = process.env.KLING_SECRET_KEY;
if (!AK || !SK) {
  console.error('✗ KLING_ACCESS_KEY / KLING_SECRET_KEY を環境変数で設定してください（チャットに貼らないこと）。');
  process.exit(1);
}

const BASE = (process.env.KLING_BASE_URL || 'https://api.klingai.com').replace(/\/$/, '');
const MODEL = process.env.KLING_MODEL || 'kling-v2-1';
const MODE = process.env.KLING_MODE || 'pro';
const DURATION = process.env.KLING_DURATION || '5';
const CAMERA_ON = (process.env.KLING_CAMERA || 'on') !== 'off';
const ZOOM = Number(process.env.KLING_ZOOM || 3);
const OUT = process.env.KLING_OUT || '';
const IMAGE = process.argv[2] || process.env.KLING_IMAGE;

if (!IMAGE) {
  console.error('✗ 起点画像を指定してください: node tools/kling/generate.mjs <画像URL or ローカルパス>');
  process.exit(1);
}

// 揺れを抑える既定プロンプト
const PROMPT = process.env.KLING_PROMPT ||
  'Locked-off tripod shot. The camera stays perfectly still, with only a very slow and smooth push-in. ' +
  'Warm orange screen light gently flickers on the desk and the editor\'s hands; faint haze and dust drift slowly. ' +
  'Premium, calm, restrained, cinematic. No people entering or leaving.';
const NEGATIVE_PROMPT = process.env.KLING_NEGATIVE_PROMPT ||
  'camera shake, shaking, wobble, bobbing, vertical movement, up and down motion, jitter, bouncing, ' +
  'unstable, hand-held, sudden motion, fast movement, warping, morphing';

/** HS256 JWT を Node 標準のcryptoだけで生成（依存なし） */
function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function makeToken(accessKey, secretKey) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: accessKey, exp: now + 1800, nbf: now - 5 };
  const data = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secretKey).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return data + '.' + sig;
}

/** 画像入力を解決：URLならそのまま、ローカルパスならbase64文字列に */
function resolveImage(src) {
  if (/^https?:\/\//i.test(src)) return src;
  if (!fs.existsSync(src)) {
    console.error('✗ 画像が見つかりません: ' + src);
    process.exit(1);
  }
  return fs.readFileSync(src).toString('base64'); // Kling は base64（プレフィックスなし）を受け付ける
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const token = makeToken(AK, SK);
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  const body = {
    model_name: MODEL,
    image: resolveImage(IMAGE),
    prompt: PROMPT,
    negative_prompt: NEGATIVE_PROMPT,
    cfg_scale: 0.5,
    mode: MODE,
    duration: DURATION,
  };
  // 固定カメラ＋ゆっくりズーム（ランダムな上下の揺れを抑える）
  if (CAMERA_ON) {
    body.camera_control = {
      type: 'simple',
      config: { horizontal: 0, vertical: 0, pan: 0, tilt: 0, roll: 0, zoom: ZOOM },
    };
  }

  console.log('→ 生成リクエスト送信中 (model=' + MODEL + ', mode=' + MODE + ', duration=' + DURATION + 's, camera=' + (CAMERA_ON ? 'on/zoom' + ZOOM : 'off') + ')');
  const res = await fetch(BASE + '/v1/videos/image2video', {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.code !== 0) {
    console.error('✗ 生成リクエスト失敗:', res.status, JSON.stringify(json));
    if (CAMERA_ON) console.error('  ヒント: camera_control 非対応モデルの可能性。KLING_CAMERA=off で再試行してください。');
    process.exit(1);
  }
  const taskId = json.data.task_id;
  console.log('✓ タスク受付: ' + taskId + '（完了までポーリングします）');

  // ポーリング
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    const q = await fetch(BASE + '/v1/videos/image2video/' + taskId, {
      headers: { Authorization: 'Bearer ' + makeToken(AK, SK) },
    });
    const qj = await q.json().catch(() => ({}));
    const status = qj?.data?.task_status;
    process.stdout.write('  status: ' + (status || '?') + '\r');
    if (status === 'succeed') {
      const url = qj.data.task_result.videos[0].url;
      console.log('\n✓ 完成: ' + url);
      if (OUT) {
        const v = await fetch(url);
        const buf = Buffer.from(await v.arrayBuffer());
        fs.writeFileSync(OUT, buf);
        console.log('✓ 保存: ' + OUT + ' (' + (buf.length / 1e6).toFixed(1) + ' MB)');
      }
      return;
    }
    if (status === 'failed') {
      console.error('\n✗ 生成失敗:', JSON.stringify(qj.data));
      process.exit(1);
    }
  }
  console.error('\n✗ タイムアウト（10分）。あとで task_id ' + taskId + ' を再確認してください。');
  process.exit(1);
}

main().catch((e) => { console.error('✗ エラー:', e.message); process.exit(1); });
