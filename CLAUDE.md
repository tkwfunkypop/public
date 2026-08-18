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

このコンテナは毎回まっさらに起動するため、ブラウザ確認は GitHub 経由で行う。

1. 変更を commit & push する。
2. 次のURLを開く（`<branch>` `<path>` は対象に合わせる）:
   `https://raw.githack.com/tkwfunkypop/public/<branch>/<path>`
   - 確認画面が出たら赤い「Open the page」を押す。
   - 最新を確実に見るなら `raw.githack.com` を `rawcdn.githack.com` に変え、`<branch>` をコミットSHAにする。
- `htmlpreview.github.io` は JS が動かないことがあるので使わない。

## Adobe パネル（UXP/CEP）で使うときの注意

- パネルUIもHTML/CSS/JSなので `AP.*` がそのまま使える。
- ただし UXP は CSP が厳しく外部CDN/`eval` を弾くことがある。その場合は
  `node_modules/animejs/dist/bundles/anime.umd.min.js` を **パネル内にローカル同梱**して読み込む。

## MCP サーバ

- プロジェクト共通のMCP設定は**リポジトリ直下の `.mcp.json`** に置く。
  cloneすれば両アカウントに同じ設定が入るので、MCPの追加はここでやること。
- 初回はClaude Code側で承認ダイアログが出る（`claude mcp list` で `⏸ Pending approval` と出るのが正常）。
  認証は端末ごとに `/mcp` または `claude mcp login <name>` で1回だけ行う。
- 設定済み: `fish-audio`（音声合成・ボイス検索・文字起こし）。詳細は `tools/fish-audio/README.md`。
- **APIキー方式のMCPを足すときは `.mcp.json` に鍵を直書きしない。** 環境変数参照にして `.env` に置く。

## Git

- 作業ブランチ: `claude/add-animejs-dependency-iqs0v1`（指定がなければこのブランチ）。
- PR は明示的に依頼されたときだけ作る。
- **push を後回しにしない。** 上の「アカウント間の情報共有」の通り、
  push されていない作業はもう片方のアカウントからは存在しないのと同じ。
