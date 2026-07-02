/**
 * Webアプリ本体 (../ae-shortcuts) を www/ にコピーしてネイティブ用に整える。
 * アプリを更新したら `npm run sync` を実行 → 各プラットフォームに反映される。
 * - lib/animations.js はリポジトリ共通のものを同梱コピー（単一ソースは ../../lib）
 * - Service Worker はネイティブでは不要なので同梱しない（登録はhttps時のみなので無害）
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'ae-shortcuts');
const www = join(here, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(join(www, 'lib'), { recursive: true });

for (const f of ['anime.umd.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
  cpSync(join(src, f), join(www, f));
}
cpSync(join(here, '..', '..', 'lib', 'animations.js'), join(www, 'lib', 'animations.js'));

// index.html はネイティブ同梱用にパスだけ書き換える
let html = readFileSync(join(src, 'index.html'), 'utf8');
html = html.replace('src="../../lib/animations.js"', 'src="./lib/animations.js"');
writeFileSync(join(www, 'index.html'), html);

console.log('www/ synced');
