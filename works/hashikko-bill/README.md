# はしっこビルの明日づくり — アートディレクション・ボード

物語「はしっこビルの明日づくり」（世界の外れに立つ七階建て雑居ビル／七社の協働）を、
ゴシック・ストップモーション（ティム・バートン系）の世界観に翻案したビジュアル設計資料。

## 中身

`imageboard.html` 一枚に以下をまとめている。

| セクション | 内容 |
|---|---|
| 表紙 | 果端ビルのキーアート（七層が別々の角度で積まれ、七つの窓が七色に灯る） |
| 01 World & Look | 造形の四原則、パレット「七つの窓」、質感タイル6種 |
| 02 Character Design | 7F→B1 の全9人。造形コンセプト・仕様表・カラーコード・生成プロンプト |
| 03 Key Art | 第七章「16:44 の十一分間」 |
| 04 Do Not | 世界観を壊さないための禁じ手6項目 |

## 配色システム

地色は純黒ではなく青紫寄りの墨 `#151320`。
アクセントは各階の「窓の色」で、そのままその会社の人物の配色になっている。

| | 会社 | 色 |
|---|---|---|
| 1F | ホシノ葬祭 | 菊白 `#D8D2BE` |
| 2F | カガリ玩具製作所 | 真鍮 `#C9A24B` |
| 3F | みなも会計事務所 | 帳簿緑 `#4F8F6C` |
| 4F | 北緯零度気象観測所 | 硝子青 `#5D93BC` |
| 5F | 香料研究所アロマティカ | 香気紫 `#9B7BC4` |
| 6F | 印刷工房くろがね堂 | 校正朱 `#C2493C` |
| 7F | 仕出しふくふく亭 | 灯火橙 `#EE9A38` |
| B1 | 管理人室 | 電球黄 `#F0D488` |

ルール：**一画面に複数社の色が同時に出るのは、その二社が実際に協働しているときだけ。**

## 図版について

キャラクターは現状すべて**インラインSVGのシルエット**（＝影だけで誰か分かる、という設計原則の
そのままの実装）。これだけでボードとして完結する。

実写ライクな図版に差し替えたいときは、**Fal でバッチ生成**する（CLAUDE.md の方針どおり画像生成は Fal 優先）。

```bash
# ローカルPCで実行（このコンテナは queue.fal.run を弾く）
node --env-file=tools/fal/.env tools/fal/generate.mjs --batch works/hashikko-bill/prompts.json

# 一部だけ作り直す
node --env-file=tools/fal/.env tools/fal/generate.mjs --batch works/hashikko-bill/prompts.json --only f3_ukai
```

- 生成先は `works/hashikko-bill/assets/<id>.jpg`。
- **`imageboard.html` は起動時に `assets/` を探し、あればSVGを自動で画像に差し替える。**
  HTMLを編集する必要はない。無ければSVGのまま表示される。
- プロンプトは `prompts.json` が正。世界観の共通指定はマニフェストの `style` に一元化してある
  （各カットのプロンプトには書かない）。
- 生成される10カット: `key_building` `key_rooftop` `f7_hikari` `f6_kurogane` `f5_ri`
  `f4_kumoi` `f3_ukai` `f2_kaburagi` `f1_tome` `b1_hiiragi`

### 生成済み（2026-07-29／代替ツール）

Fal はこの作業コンテナのネットワークポリシーで弾かれるため（`queue.fal.run` が CONNECT 403）、
CLAUDE.md の「Fal が使えないときは代替」の方針どおり **Higgsfield / `nano_banana_pro`（2k）** で生成した。

**参照画像2枚方式。** 再設計はしていない。

| 参照 | 役割 |
|---|---|
| 1枚目：確定済みCORE（`01_*_CharacterBible_Core`） | デザインの正 |
| 2枚目：承認済み `b1_hiiragi`（job `a8434a32`） | 質感の正 |

プロンプトには**人物描写を一切書かず**、「デザインは1枚目から、表面質感は2枚目から取る」とだけ
指示している。`prompts.json` 自体は変更していない。

到達までの経緯:

- **v1** — `prompts.json` の人物描写（各900字前後）を併記。テキストが参照画像を上書きし、デザインが変わった。
  ただし質感は良く、この版の3体が人間承認されている。
- **v2** — 描写を全排除。デザインは合ったが、スタイル指定ごと落としたため質感が抜けた。
- **v3** — 参照2枚で両立。承認済み3体はv1のまま据え置き、残り6体をv3で作り直した。

全9体をCANON（`01 / CORE`）と1体ずつ突き合わせて検品済み。

| カット | 人物 | 版 | CORE照合 |
|---|---|---|---|
| `f7_hikari` | 七尾ひかり | v1 | 一致 |
| `f6_kurogane` | 黒金 | v3 | 一致 |
| `f6_yamato` | 大和 | v4 | 一致（顔をCANON構造に修正） |
| `f5_ri` | 李 | v3 | 一致 |
| `f4_kumoi` | 雲井 | v3 | 一致 |
| `f3_ukai` | 鵜飼 | v3 | 一致 |
| `f2_kaburagi` | 鏑木 | v1 | 一致 |
| `f1_tome` | 星野トメ | v3 | 一致 |
| `b1_hiiragi` | 柊源三 | v5 | 一致（v1がCANONと違ったため差し替え） |
| `key_building` | — | — | **保留**（建物CANON未確定） |
| `key_rooftop` | — | — | **保留**（同上・九人が揃うカット） |

`prompts.json` の人物描写はCANON確定前に書かれたもので、**現在のCANONとは別人**を指している
（例：星野トメは「菊の髪飾りの小柄な老婆」ではなく裾長の黒衣の柱状シルエット、
雲井は「硝子ドームの頭」ではなく卵型の白い顔）。図版の正はCOREであり、`prompts.json` ではない。

### 脇役キャラクターデザイン（絵コンテ用に追加）

物語に必要で九人のCANONに含まれていない人物を5体追加した。`generated.json` の
`kind: supporting_cast`。いずれも既存COREを参照に渡して造形を引き継いでいる。

| ID | 人物 | 出番 | 設計 |
|---|---|---|---|
| `cast_ukai_child` | 鵜飼（11歳） | 第六章の回想 | UKAI CORE から。角ばった白い頭・黒い炎の髪・縫い目の口・石板色はそのまま、比率だけ子供に。ボタンシャツ／半ズボン／膝下靴下 |
| `cast_ukai_mother` | 鵜飼の母 | 同上 | 細長い柱状。のっぺりした白い卵形の顔。生成りの前掛け＋墨色のワンピース。襟に灯火橙が一点だけ入り7Fの人だと分かる |
| `cast_ukai_father` | 鵜飼の父 | 同上 | 真鍮色を差して2Fの人だと分かる |
| `cast_hiiragi_53` | 柊源三（53歳） | 第一章・第七章の回想 | 猫背ではなくまだ背が伸びている。電球は房ではなく一個、まだ点いていない |
| `cast_developer` | 開発業者 | 第五章 | **意図的にハウススタイルを外している**。滑らかで左右対称、現代的なスーツ、修理跡なし、吊り下げ道具なし、**自分の色を持たない**。このビルの人間ではない、という記号 |

`cast_developer` だけが配色システムの外にいる。これは「一画面に複数社の色が出るのは協働時だけ」
というルールの裏返しで、彼はどの階の色も持てない。

### 絵コンテ（5分尺アニメ版）

`storyboard/` に手描き鉛筆風の絵コンテ一式。

| ファイル | 内容 |
|---|---|
| `storyboard/storyboard.json` | カット表の正本。全78カット／9シーケンス／299秒（4:59） |
| `storyboard/storyboard.html` | 絵コンテ用紙形式のシート。カット番号・画・内容・台詞・注記・秒数 |
| `storyboard/panel-prompts.json` | 各カットの鉛筆パネル生成プロンプト。共通指定は `suffix`、参照COREは `refs` に一元化 |

```
https://raw.githack.com/tkwfunkypop/public/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/storyboard/storyboard.html
```

七章＋エピローグを300秒に収めるため、**同アングルの反復と反転**で語っている。

| 前半 | 後半 | 意味 |
|---|---|---|
| A3 無人の階段 | H64 七社で椅子を担ぐ階段 | 隔てる縦動線 → 繋ぐ縦動線 |
| C17 隙間だらけの長机 | H67 肩が触れる食卓 | 距離 → ゼロ |
| B5 閉じた七つの扉 | I74 開いたままの七つの扉 | 不干渉 → 開放 |
| A4 点かない2と6 | I75 全ランプ点灯 | 四十年の断絶 → 解消 |

鉛筆パネルは全78カット分そろっている。`generated.json` の `kind: storyboard_panel` に記録。人物入りのカットは
確定済みCOREを参照に渡して鉛筆で描き直しているため、造形は追える。
**ただしパネルはコンテ用のラフであり、CORE照合は通していない**
（群衆カットのH67・H64は人物が一般化している。本番作画では各キャラのCORE参照が必要）。

台詞・見出し・時計の数字などの文字は、すべて編集段階で載せる前提で生成物に入れていない。

### キャラクターシート

`character-sheets.html` に9体分をまとめてある。CORE（設計の正）と図版を左右に並べ、
CANONメタ情報（`CHARACTER ID` / `REVISION` / `CANON STATUS` / `BODY TYPE` / `HANDEDNESS`）と
`COLOR SYSTEM` の5色、CORE照合の結果を載せている。

#### 詳細シート（2026-07-30 追加）

本編9人それぞれに詳細シート3種、脇役5体にターンアラウンドを追加した。
`generated.json` の `kind: character_sheet`（32件）。

| シート | 内容 |
|---|---|
| `02 EXPRESSION` | 表情6面（3×2グリッド）。**顔パーツの追加は全プロンプトで禁止**。顔の無いキャラは首の角度・姿勢・手だけで6感情を語る |
| `03 POSE` | アクション5態（作業・歩き・受け渡し・座り・会話の身振り） |
| `04 PROPS & COSTUME` | 全身＋持ち物・手・足元・留め具の拡大詳細 |
| `01 TURNAROUND`（脇役のみ） | 正面・側面・背面＋シルエット。COREを持たない5体の01相当 |

生成は全て参照2枚方式（デザインの正＝CORE または承認済み図版／質感の正＝`a8434a32`）。
リテイク記録：大和02は目の暗色化→驚きコマの口、の2段階を経てv3採用。雲井02・トメ02・鏑木02は
床面アーティファクトや文字混入でリテイク（経緯は `generated.json` の `note` と `superseded_job_id`）。

**注意：シート構成（02〜04の内訳）は EMBER の参照シートが未入手のため、CHARACTER BIBLE V2 の
既知の規約から定義した暫定版。** EMBER のシート一式が届いたら構成を照合して差分を作り直す。
ローカル保存先（`ASSETS/Character/003_はしっこビルの明日づくり`）への取り込みは
`fetch-assets.mjs` と同様に `generated.json` のURLから行える。

```
https://raw.githack.com/tkwfunkypop/public/claude/prompts-json-10cut-generation-cisssw/works/hashikko-bill/character-sheets.html
```

アニメーションは CLAUDE.md の方針どおり `AP.staggerReveal` / `AP.onScroll` のみ。

### 目視検品について

作業コンテナは画像配信CDNへの直接アクセスをネットワークポリシーで弾かれるが、
**Adobe コネクタの `asset_inline_preview` は画像を取得して表示できる**ため、
生成物とCANONを見比べての検品が可能。URLを渡すだけでよい。

```
asset_inline_preview(presignedUrl: "<画像URL>", size: 700)
```

大和の顔の修正はこれで差分を特定して直した。以後の検品もこの手順で行う。

なお Adobe の画像**編集**ツール（`image_apply_adjustments` 等）は許可ドメイン制で、
Higgsfield の配信ドメインを受け付けない。閲覧はできるが編集はできない。

`key_building` / `key_rooftop` は建物外形が写る。建物候補Y7の確定承認が出ていないため、
外形をCANON固定しない方針でここでは生成していない。`fetch-assets.mjs` はこの2件を
`status: on_hold` として自動的に取得対象外にする。

大和は `prompts.json` に専用カットが無い追加カット。**6Fは親方と若手の二人なので、
`imageboard.html` の6Fだけ図版枠を二つに組み替えてある**（`.floor__pair`）。
`data-asset="f6_yamato"` のスロットとフォールバック用シルエットを追加済み。

あわせて `imageboard.html` の大和の仕様行を修正した。元は「ひょろ長い青年／ヘッドフォン」
と書かれていたが、これはCANON確定前の記述で、CANONは片側へ流れる長い黒髪と立襟の
ワインコートの華奢な人形。CANONに合わせて書き換えている
（「手だけが親方と同じ黒＝継承の記号」はCANONの黒い手と両立するので残した）。

結果URLは `generated.json` に記録してある。取り込みはローカルPCで:

```bash
node works/hashikko-bill/fetch-assets.mjs                 # 10カットを assets/ に取り込む
node works/hashikko-bill/fetch-assets.mjs --only f3_ukai  # 一部だけ
node works/hashikko-bill/fetch-assets.mjs --width 2048 --quality 88
```

- 元画像はPNG（16:9 は 2752×1536、2:3 は 1696×2528／各6〜8MB）。
  そのままではリポジトリに重いので、既定で長辺1600pxのJPEGに変換して `assets/<id>.jpg` に保存する
  （合計約5MB）。変換には `sips` / `magick` / `convert` / `ffmpeg` のうち見つかったものを使う。
- **絵柄を Fal の `flux-pro/v1.1-ultra` に統一したい場合は、キーを設定してローカルで上の
  `generate.mjs --batch` を回せば `assets/` を上書きできる。** `prompts.json` は変更していない。

なお HTML 内の各キャラカードにも `生成プロンプト（EN）` を畳んで入れてあるので、
1カットだけ他ツールで試したいときはそこから COPY できる。

## プレビュー

CLAUDE.md の手順どおり GitHub 経由で確認する。

```
https://raw.githack.com/tkwfunkypop/public/claude/seven-companies-collaboration-qducmu/works/hashikko-bill/imageboard.html
```

## アニメーション

CLAUDE.md の方針どおり `lib/animations.js` のプリセット（`AP.*`）経由のみ。
個別に `animate()` は書いていない。

- `AP.staggerReveal` — 表紙の要素、原則カード、質感タイル、禁じ手リスト
- `AP.onScroll` — 各階セクションの出現
- `AP.drift` — 表紙の霧
- `AP.pop` — プロンプトの COPY ボタン

anime.js が読めない環境（UXP の CSP 等）では要素を隠さないので、素の表示のまま崩れない。
`prefers-reduced-motion` 指定時は全アニメーションを止める。
