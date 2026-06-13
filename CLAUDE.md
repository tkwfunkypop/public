# プロジェクトメモ（Claude Code 用）

このファイルは Claude Code が毎セッション自動で読み込みます。
ここに書いたルールに沿って作業してください。

## このリポジトリの目的

クリエイティブ／マーケティング制作の作業場です。主に次を扱います。

- **LP（ランディングページ）** の制作
- **Adobe 拡張**（UXP / CEP パネル＝HTML/CSS/JS）や各種スクリプト
- 外部ツール・オリジナル自動化ツール

## コンテンツ発信の絶対ルール（X / note / 記事）

X（ポスト・スレッド）、note 記事、その他の外部公開コンテンツを作成・下書きするときは、
次のルールを**例外なく**守ること。これは最優先ルールで、他の効率や締切より優先する。

- **絶対に、間違った情報や不確定な情報を出さない。**
  「たぶんこう」「おそらく合っている」レベルの情報は、そのまま書かない。
- 事実・数字・製品名・機能・価格・日付・固有名詞などを含める場合は、
  **必ずエビデンス（一次情報・公式ソース）に基づいて確認**してから書く。
  確認できたソースの URL を作業ログ（チャット）に必ず残す。
- **正しい情報であると確信が持てる場合にのみ使用する。**
  確認できない・裏が取れない情報は、**書かずに削る**か、本人に確認を求める。
- 健太さん本人の体験・実績・主観（例: 自分が作った・触った・感じた）は事実として扱ってよいが、
  それ以外の客観的事実（他社製品の仕様・業界の数字・ニュース等）は必ず裏取りする。
- AI 生成の企画ブリーフやドラフトに含まれる事実情報は、**未確認の前提**で扱う。
  そのまま転記せず、必ず一次情報で検証する。
- 検証に使える MCP（WebSearch / WebFetch 等）が使えない・確証が得られないときは、
  断定を避け、その旨を明示して本人の確認を仰ぐ。憶測で埋めない。

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

## Git

- 作業ブランチ: `claude/add-animejs-dependency-iqs0v1`（指定がなければこのブランチ）。
- PR は明示的に依頼されたときだけ作る。
