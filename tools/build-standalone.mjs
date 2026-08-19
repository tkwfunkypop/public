#!/usr/bin/env node
/**
 * HTML を「1ファイル完結（standalone）」に変換するビルドスクリプト
 * ------------------------------------------------------------
 * 外部ファイル（anime.js / lib/animations.js / CSS / 画像 / フォント）を
 * すべて HTML の中に埋め込んで、1枚の HTML だけで動く状態にします。
 *
 * 【なぜ必要か】
 * Artifact（claude.ai の即時プレビュー）や Adobe UXP パネルは CSP が厳しく、
 * CDN からの読み込みを全部ブロックします。埋め込んでおけば同じ HTML が
 * 「Artifact / UXPパネル / githack / 納品ファイル」のどこでもそのまま動きます。
 *
 * 【使い方】
 *   npm run build -- templates/lp-starter.html            # 通常の standalone HTML
 *   npm run build -- lp/foo.html --artifact               # Artifact 投稿用（後述）
 *   npm run build -- lp/foo.html --fetch-remote           # Google Fonts や外部画像も落として埋め込む
 *   npm run build -- lp/foo.html -o dist/納品用.html      # 出力先を指定
 *
 * 【--fetch-remote について】
 * Google Fonts・CDN画像など外部URLを実際にダウンロードして埋め込みます。
 * これを付けないと外部参照は残り、Artifact / UXP パネルでは表示されません
 * （ビルド時に警告として一覧表示されます）。
 *
 * 【--artifact モードについて】
 * Artifact は投稿時に <!doctype html><head></head><body> を自動で被せる仕様のため、
 * こちら側で <html>/<head>/<body> を持っているとタグが二重になります。
 * --artifact を付けると <title> + <style> + body の中身 + <script> だけを出力し、
 * そのまま Artifact ツールに渡せる形にします。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANIME_UMD = join(ROOT, 'node_modules/animejs/dist/bundles/anime.umd.min.js');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const warnings = [];
const inlined = [];
let fetchRemote = false; // --fetch-remote 指定時に true

/** 外部URL（http/https/data///）かどうか */
const isRemote = (src) => /^(https?:)?\/\//i.test(src) || src.startsWith('data:');

/** 外部URLを取得（--fetch-remote 用）。失敗したら null。 */
const remoteCache = new Map();
function fetchRemoteBuffer(url) {
  const abs = url.startsWith('//') ? `https:${url}` : url;
  if (remoteCache.has(abs)) return remoteCache.get(abs);
  let buf = null;
  try {
    // 環境のプロキシ設定をそのまま使うため curl を利用。
    // Google Fonts は UA で配信形式（woff2）を出し分けるため、モダンなUAを送る。
    buf = execFileSync('curl', [
      '-sSL', '--max-time', '30',
      '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      abs,
    ], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    if (!buf.length) buf = null;
  } catch {
    buf = null;
  }
  if (!buf) warnings.push(`外部ファイルの取得に失敗しました: ${abs}`);
  remoteCache.set(abs, buf);
  return buf;
}

/** 拡張子から MIME を推定（URL のクエリは無視） */
const mimeOf = (pathOrUrl) =>
  MIME[extname(pathOrUrl.split(/[?#]/)[0]).toLowerCase()] || 'application/octet-stream';

/** anime.js 本体を指しているか（CDN URL でもローカルパスでも拾う） */
const isAnimeJs = (src) => /anime\.umd(\.min)?\.js/i.test(src) || /animejs@/i.test(src);

/** </script> でHTMLが途中終了しないようにエスケープ */
const safeScript = (js) => js.replace(/<\/script/gi, '<\\/script');

/** ローカルファイルを data: URI 化 */
function toDataUri(absPath) {
  return `data:${mimeOf(absPath)};base64,${readFileSync(absPath).toString('base64')}`;
}

/**
 * WebフォントCSSから「ページで実際に使っている文字」の @font-face だけを残す
 * ------------------------------------------------------------
 * 日本語のGoogle Fontsは文字を100個以上のサブセットに分割して配信するため、
 * 全部埋め込むと数MBになります。ページ内の文字が含まれるサブセットだけを残すことで
 * 実用サイズ（数十〜数百KB）に収めます。
 */
function filterFontFaces(css, usedChars) {
  let kept = 0;
  let dropped = 0;

  const out = css.replace(/@font-face\s*\{[^}]*\}/gi, (block) => {
    const m = block.match(/unicode-range\s*:\s*([^;}]+)/i);
    if (!m) { kept++; return block; } // 範囲指定がないものは常に残す

    const ranges = m[1].split(',').map((r) => r.trim().replace(/^U\+/i, ''));
    const hit = ranges.some((range) => {
      if (range.includes('?')) {
        // U+30?? のようなワイルドカード表記
        const from = parseInt(range.replace(/\?/g, '0'), 16);
        const to = parseInt(range.replace(/\?/g, 'F'), 16);
        return usedChars.some((cp) => cp >= from && cp <= to);
      }
      const [a, b] = range.split('-');
      const from = parseInt(a, 16);
      const to = b ? parseInt(b, 16) : from;
      return usedChars.some((cp) => cp >= from && cp <= to);
    });

    if (hit) { kept++; return block; }
    dropped++;
    return '';
  });

  if (dropped) inlined.push(`フォントサブセット ${kept}/${kept + dropped} 個を採用`);
  return out;
}

/**
 * CSS 内の url(...) をたどってアセットを data: URI に置換
 * base は { dir: ローカルCSSの場所 } か { url: 取得元CSSのURL }
 */
function inlineCssAssets(css, base) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (whole, quote, url) => {
    // SVGフィルタ等の内部参照（#id / %23id）と data: はそのまま
    if (url.startsWith('#') || url.startsWith('%23') || url.startsWith('data:')) return whole;

    // 取得元がリモートCSSの場合、相対パスもリモートとして解決する
    if (base.url || isRemote(url)) {
      const absUrl = base.url ? new URL(url, base.url).href : url;
      if (!fetchRemote) {
        warnings.push(`CSS内の外部ファイルは埋め込まれていません（--fetch-remote で取得できます）: ${absUrl}`);
        return whole;
      }
      const buf = fetchRemoteBuffer(absUrl);
      if (!buf) return whole;
      inlined.push(absUrl.split('/').pop().split('?')[0]);
      return `url("data:${mimeOf(absUrl)};base64,${buf.toString('base64')}")`;
    }

    const abs = resolve(base.dir, url.split(/[?#]/)[0]);
    if (!existsSync(abs)) {
      warnings.push(`CSS内のファイルが見つかりません: ${url}`);
      return whole;
    }
    inlined.push(url);
    return `url("${toDataUri(abs)}")`;
  });
}

let usedChars = [];

function build(html, htmlDir) {
  // ページで使われている文字の一覧（Webフォントのサブセット絞り込みに使う）
  usedChars = [...new Set([...html].map((c) => c.codePointAt(0)))];

  // ── <script src="..."> を中身に置き換え ──
  html = html.replace(
    /<script\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>\s*<\/script>/gi,
    (whole, _q, src) => {
      // anime.js は CDN 指定でも node_modules の実体に差し替える
      if (isAnimeJs(src)) {
        if (!existsSync(ANIME_UMD)) {
          warnings.push('anime.js が未インストールです。`npm install` を実行してください。');
          return whole;
        }
        inlined.push('animejs (node_modules)');
        return `<script>${safeScript(readFileSync(ANIME_UMD, 'utf8'))}</script>`;
      }
      if (isRemote(src)) {
        if (!fetchRemote) {
          warnings.push(`外部スクリプトは未取得です（--fetch-remote で埋め込めます）: ${src}`);
          return whole;
        }
        const buf = fetchRemoteBuffer(src);
        if (!buf) return whole;
        inlined.push(src.split('/').pop().split('?')[0]);
        return `<script>${safeScript(buf.toString('utf8'))}</script>`;
      }
      const abs = resolve(htmlDir, src.split(/[?#]/)[0]);
      if (!existsSync(abs)) {
        warnings.push(`スクリプトが見つかりません: ${src}`);
        return whole;
      }
      inlined.push(src);
      return `<script>${safeScript(readFileSync(abs, 'utf8'))}</script>`;
    }
  );

  // ── <link rel="stylesheet"> を <style> に展開 ──
  html = html.replace(/<link\b[^>]*>/gi, (whole) => {
    if (!/rel=(['"]?)stylesheet\1/i.test(whole)) return whole;
    const m = whole.match(/href=(['"])(.*?)\1/i);
    if (!m) return whole;
    const href = m[2];
    if (isRemote(href)) {
      if (!fetchRemote) {
        warnings.push(`外部CSSは未取得です（--fetch-remote で埋め込めます）: ${href}`);
        return whole;
      }
      const buf = fetchRemoteBuffer(href);
      if (!buf) return whole;
      inlined.push(href.replace(/^https?:\/\//, '').split('/')[0]); // 例: fonts.googleapis.com
      // 使う文字のサブセットだけに絞ってから、フォント本体を埋め込む
      const remoteCss = filterFontFaces(buf.toString('utf8'), usedChars);
      return `<style>${inlineCssAssets(remoteCss, { url: href })}</style>`;
    }
    const abs = resolve(htmlDir, href.split(/[?#]/)[0]);
    if (!existsSync(abs)) {
      warnings.push(`CSSが見つかりません: ${href}`);
      return whole;
    }
    inlined.push(href);
    return `<style>${inlineCssAssets(readFileSync(abs, 'utf8'), { dir: dirname(abs) })}</style>`;
  });

  // ── 既存の <style> 内の url(...) も data: URI 化 ──
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (whole, css) =>
    whole.replace(css, inlineCssAssets(css, { dir: htmlDir }))
  );

  // ── <img src="..."> / <video>/<source> のローカル参照を data: URI 化 ──
  html = html.replace(
    /(<(?:img|source|video|audio)\b[^>]*\bsrc=)(['"])(.*?)\2/gi,
    (whole, head, quote, src) => {
      if (src.startsWith('data:')) return whole;
      if (isRemote(src)) {
        if (!fetchRemote) {
          warnings.push(`外部画像は未取得です（--fetch-remote で埋め込めます）: ${src}`);
          return whole;
        }
        const buf = fetchRemoteBuffer(src);
        if (!buf) return whole;
        inlined.push(src.split('/').pop().split('?')[0]);
        return `${head}${quote}data:${mimeOf(src)};base64,${buf.toString('base64')}${quote}`;
      }
      const abs = resolve(htmlDir, src.split(/[?#]/)[0]);
      if (!existsSync(abs)) {
        warnings.push(`画像が見つかりません: ${src}`);
        return whole;
      }
      inlined.push(src);
      return `${head}${quote}${toDataUri(abs)}${quote}`;
    }
  );

  return html;
}

/**
 * Artifact 投稿用に <html>/<head>/<body> を外し、
 * <title> + <style> + bodyの中身 だけの「ページ内容」にする
 */
function toArtifactFragment(html) {
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const styles = [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map((m) => m[0]);
  const bodyMatch = html.match(/<body\b([^>]*)>([\s\S]*)<\/body>/i);

  if (!bodyMatch) {
    warnings.push('<body> が見つからないため、そのまま出力しました。');
    return html;
  }
  if (bodyMatch[1].trim()) {
    warnings.push(`<body${bodyMatch[1]}> の属性は Artifact では引き継がれません。CSSは body{} セレクタで指定してください。`);
  }

  const parts = [];
  if (title) parts.push(`<title>${title.trim()}</title>`);
  parts.push(...styles);
  parts.push(bodyMatch[2].trim());
  return parts.join('\n');
}

// ───────────────────────── CLI ─────────────────────────
const argv = process.argv.slice(2);
const artifactMode = argv.includes('--artifact');
fetchRemote = argv.includes('--fetch-remote');
const outFlag = argv.indexOf('-o');
const outArg = outFlag !== -1 ? argv[outFlag + 1] : null;
// フラグと -o の値を除いた最初の引数が入力ファイル
const input = argv.filter((a, i) => !a.startsWith('-') && !(outFlag !== -1 && i === outFlag + 1))[0];

if (!input) {
  console.error(`使い方: npm run build -- <入力HTML> [--artifact] [-o <出力先>]

  例) npm run build -- templates/lp-starter.html
      npm run build -- lp/ae-short-course.html --artifact`);
  process.exit(1);
}

const inputAbs = resolve(ROOT, input);
if (!existsSync(inputAbs)) {
  console.error(`入力ファイルが見つかりません: ${input}`);
  process.exit(1);
}

const suffix = artifactMode ? '.artifact.html' : '.standalone.html';
const outAbs = outArg
  ? resolve(ROOT, outArg)
  : join(ROOT, 'dist', basename(inputAbs, extname(inputAbs)) + suffix);

let out = build(readFileSync(inputAbs, 'utf8'), dirname(inputAbs));
if (artifactMode) out = toArtifactFragment(out);

mkdirSync(dirname(outAbs), { recursive: true });
writeFileSync(outAbs, out, 'utf8');

// ── 結果表示 ──
const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
console.log(`✅ ${input} → ${outAbs.replace(ROOT + '/', '')} (${kb(Buffer.byteLength(out))})`);
if (inlined.length) console.log(`   埋め込み: ${inlined.join(', ')}`);
if (artifactMode) console.log('   モード: Artifact用（<html>/<head>/<body> を除去済み）');
if (warnings.length) {
  console.log('\n⚠️  未解決の参照があります（Artifact/UXP では動きません）:');
  warnings.forEach((w) => console.log(`   - ${w}`));
}
