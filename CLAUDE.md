# プロジェクトメモ（Claude Code 用）

このファイルは Claude Code が毎セッション自動で読み込みます。
ここに書いたルールに沿って作業してください。

## このリポジトリの目的

クリエイティブ／マーケティング制作の作業場です。主に次を扱います。

- **LP（ランディングページ）** の制作
- **Adobe 拡張**（UXP / CEP パネル＝HTML/CSS/JS）や各種スクリプト
- 外部ツール・オリジナル自動化ツール

## アカウント間の情報共有（重要）

このリポジトリは **複数のアカウントから共通で使う**。
チャット履歴はアカウントをまたいで共有されず、コンテナも毎回まっさらに起動するため、
**リポジトリに push された内容だけが、もう片方のアカウントから見える情報**になる。

そのため、毎回のセッションで必ず次を守ること。

1. **セッションの最初に `HANDOFF.md` を読む。** 直近の状況・進行中の作業はそこに書いてある。
   あわせて `git log --oneline -20` と未マージPRも確認する。
2. **作業は必ず commit & push する。** ローカルに置いたままの変更は「無かったこと」になる。
   中途半端でも、区切りがついたところで push する。
3. **セッションの最後に `HANDOFF.md` の「作業ログ」へ1〜3行追記して push する。**
   何をしたか・次に何をすべきかが、もう片方のアカウントから読めば分かる状態にする。
4. **情報はチャットではなくリポジトリに残す。** 手順・URL・決めごとは
   該当する README や `HANDOFF.md` に書く。チャットの中だけで完結させない。
5. **APIキー・トークン・個人情報はコミットしない。** 公開リポジトリなので誰でも読める。
   鍵は `.env`（`.gitignore` 済み）に置き、`.env.example` に項目名だけ書く。

補足: リポジトリ <https://github.com/tkwfunkypop/public> は公開設定なので、
別のGitHubアカウントからもログイン不要で閲覧できる。書き込みも必要な場合のみ、
Settings → Collaborators でそのアカウントを追加する。

## アニメーションの方針（anime.js v4）

- アニメーションは **anime.js v4** を使う（`package.json` の `animejs`）。
- 動きは必ず **`lib/animations.js` のプリセット（`AP.*`）経由**で付ける。
  個別に `animate()` を散らかさず、再利用できる形に寄せること。
- 新しい動きが必要なら、その場限りで書かず **`lib/animations.js` にプリセットを追加**する。

### よく使うプリセット

| 呼び方 | 用途 |
|---|---|
| `AP.fadeInUp(t)` | 下からふわっと出現（見出し・画像） |
| `AP.staggerReveal(t)` | 複数要素を時間差で出現 |
| `AP.countUp(t)` | 数字のカウントアップ（実績訴求） |
| `AP.pop(t)` / `AP.pulse(t)` | CTAボタンの強調（単発 / ループ） |
| `AP.drawSVG(t)` | SVGを手書き風に描く |
| `AP.onScroll(sel, fn)` | スクロールで画面に入ったら発火（LPの主役） |

各プリセットは第2引数で anime.js のパラメータを上書き可能。

### 読み込み方（ビルドなしのLP / パネル）

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.umd.min.js"></script>
<script src="./lib/animations.js"></script>
```

※ビルド環境（Vite等）がある場合は `import { animate } from 'animejs'`（v4は名前付きインポート）。

## 新しいLPを作るとき

- **`templates/lp-starter.html` を複製**して中身を書き換えるのが基本。
  雛形にスクロール出現・カウントアップ・CTA脈打ちが組み込み済み。
- 出現させたい要素には `class="reveal"` を付ける。
- 数字は `<span class="stat" data-to="目標値">0</span>` の形で書く。

## 動作確認（プレビュー）の手順

用途に応じて3つある。**push が要るのは 3 だけ**なので、まず 1 を使う。

### 1. コンテナ内でスクショを撮る（最速・push不要）

このコンテナには Chromium が入っているので、その場で見た目を確認できる。

```bash
npm run shot -- lp/foo.html          # PC(1440) と SP(390) の2枚
npm run shot -- lp/foo.html --pc     # PC幅だけ
npm run shot -- lp/foo.html --hero   # ファーストビューだけ
```

- 出力は `.shots/`（gitignore 済み）。Claude はこの画像をそのまま確認・共有できる。
- 撮影前に自動で最下部までスクロールするので、`AP.onScroll` の出現アニメも反映される。
- JSエラーがあれば撮影後に一覧表示される（**アニメが動かないときの原因調査に使う**）。

### 2. Artifact で共有URLを出す（クライアント確認用・push不要）

Claude の Artifact に上げると、非公開URLで実物を触ってもらえる。
**Artifact は外部CDNを全部ブロックする**ので、必ず standalone ビルドを通す。

```bash
npm run build -- lp/foo.html --artifact --fetch-remote
# → dist/foo.artifact.html を Artifact ツールに渡す
```

### 3. githack で見る（実機ブラウザで触りたいとき）

1. 変更を commit & push する。
2. `https://raw.githack.com/tkwfunkypop/public/<branch>/<path>` を開く。
   - 確認画面が出たら赤い「Open the page」を押す。
   - 最新を確実に見るなら `raw.githack.com` を `rawcdn.githack.com` に変え、`<branch>` をコミットSHAにする。
- `htmlpreview.github.io` は JS が動かないことがあるので使わない。

## standalone ビルド（1ファイル完結HTML）

`npm run build` は anime.js・`lib/animations.js`・CSS・画像・Webフォントを
すべて HTML に埋め込んで、**1枚で動く HTML** を `dist/` に出力する。

```bash
npm run build -- lp/foo.html                    # 通常（納品・配布用）
npm run build -- lp/foo.html --fetch-remote     # Google Fonts や外部画像も落として埋め込む
npm run build -- lp/foo.html --artifact         # Artifact用（<html>/<head>/<body>を除去）
npm run build -- lp/foo.html -o dist/納品.html  # 出力先指定
```

- 埋め込めなかった外部参照は**ビルド時に警告として一覧表示**される。
  警告が残ったまま Artifact / UXP に持っていくと、その部分は表示されない。
- 日本語Webフォントはサブセットが100個以上あるため、
  **ページで実際に使っている文字のぶんだけ**自動で絞り込んで埋め込む。
- クライアントへの納品でWeb公開する場合は、Google Fonts は外部参照のまま
  （＝`--fetch-remote` なし）のほうがキャッシュが効いて軽い。

## Adobe パネル（UXP/CEP）で使うときの注意

- パネルUIもHTML/CSS/JSなので `AP.*` がそのまま使える。
- ただし UXP は CSP が厳しく外部CDN/`eval` を弾く。
  **`npm run build` で standalone 化したものをパネルに入れれば解決する**
  （anime.js が HTML 内に埋め込まれるため、CDN も別ファイルも不要）。

## 環境セットアップ

`.claude/hooks/session-start.sh` がセッション開始時に `npm install` を自動実行するので、
`npm run build` / `npm run shot` はセッション開始直後から使える（手動セットアップ不要）。

## Git

- 作業ブランチ: `claude/add-animejs-dependency-iqs0v1`（指定がなければこのブランチ）。
- PR は明示的に依頼されたときだけ作る。
- **push を後回しにしない。** 上の「アカウント間の情報共有」の通り、
  push されていない作業はもう片方のアカウントからは存在しないのと同じ。
