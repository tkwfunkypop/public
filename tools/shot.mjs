#!/usr/bin/env node
/**
 * LP をコンテナ内の Chromium で開いてスクリーンショットを撮るツール
 * ------------------------------------------------------------
 * commit & push して githack で目視、という往復をせずに、
 * その場で「PC幅・スマホ幅の見た目」を確認できます。
 *
 * スクロール出現（AP.onScroll）を確実に発火させるため、
 * 撮影前にページの下まで一度スクロールしてからフルページ撮影します。
 *
 * 【使い方】
 *   npm run shot -- lp/ae-short-course.html            # PC + SP の2枚
 *   npm run shot -- lp/foo.html --pc                   # PC幅だけ
 *   npm run shot -- lp/foo.html --sp                   # スマホ幅だけ
 *   npm run shot -- lp/foo.html --viewport 1920x1080   # 幅を指定
 *   npm run shot -- lp/foo.html --hero                 # ファーストビューだけ（全体を撮らない）
 *
 * 出力先: .shots/<ファイル名>-<pc|sp>.png（gitignore 済み）
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// この環境には Chromium が焼き込み済み。playwright のバージョンに依存しないよう実体を直接指定する。
const CHROMIUM = '/opt/pw-browsers/chromium';

const PRESETS = {
  pc: { width: 1440, height: 900, deviceScaleFactor: 1 },
  sp: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const argv = process.argv.slice(2);
const input = argv.filter((a) => !a.startsWith('-'))[0];
if (!input) {
  console.error(`使い方: npm run shot -- <HTMLファイル> [--pc] [--sp] [--hero] [--viewport 1920x1080]`);
  process.exit(1);
}

const inputAbs = resolve(ROOT, input);
if (!existsSync(inputAbs)) {
  console.error(`ファイルが見つかりません: ${input}`);
  process.exit(1);
}

const heroOnly = argv.includes('--hero');
const vpFlag = argv.indexOf('--viewport');

let targets;
if (vpFlag !== -1) {
  const [width, height] = String(argv[vpFlag + 1] || '').split('x').map(Number);
  if (!width || !height) {
    console.error('--viewport は 1920x1080 の形式で指定してください。');
    process.exit(1);
  }
  targets = [['custom', { width, height, deviceScaleFactor: 1 }]];
} else if (argv.includes('--pc')) {
  targets = [['pc', PRESETS.pc]];
} else if (argv.includes('--sp')) {
  targets = [['sp', PRESETS.sp]];
} else {
  targets = Object.entries(PRESETS);
}

const outDir = join(ROOT, '.shots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM });
const results = [];
const consoleErrors = [];

for (const [name, viewport] of targets) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.deviceScaleFactor });
  const page = await context.newPage();

  page.on('pageerror', (e) => consoleErrors.push(`[${name}] ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${name}] ${msg.text()}`);
  });

  await page.goto(pathToFileURL(inputAbs).href, { waitUntil: 'load' });

  if (!heroOnly) {
    // 下まで少しずつスクロールして IntersectionObserver（AP.onScroll）を全部発火させる
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 400));
      window.scrollTo(0, 0);
    });
    // 出現アニメの完了待ち
    await page.waitForTimeout(1200);
  } else {
    await page.waitForTimeout(1500);
  }

  const out = join(outDir, `${basename(inputAbs, extname(inputAbs))}-${name}.png`);
  await page.screenshot({ path: out, fullPage: !heroOnly });
  results.push(out);
  await context.close();
}

await browser.close();

console.log('📸 撮影しました:');
results.forEach((r) => console.log(`   ${r.replace(ROOT + '/', '')}`));
if (consoleErrors.length) {
  console.log('\n⚠️  ブラウザ側でエラーが出ています:');
  [...new Set(consoleErrors)].forEach((e) => console.log(`   - ${e}`));
  process.exitCode = 1;
}
