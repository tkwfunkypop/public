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

**キャラクターは確定済みCORE（`01_*_CharacterBible_Core`）を参照画像として渡し、
正面全身1カットに起こし直したもの。** 再設計はしていない。

プロンプトには**人物描写を一切書いていない**。設計は参照画像だけに担わせ、
指示は「参照の設計を厳密に再現し、提示のしかただけ変える」に限定している。
`prompts.json` の人物描写（各900字前後）を併記した最初の版はデザインが変わってしまったため、
描写を全部外して作り直した。`prompts.json` 自体は変更していない。

| カット | 人物 | 状態 |
|---|---|---|
| `f7_hikari` | 七尾ひかり | 検品待ち |
| `f6_kurogane` | 黒金 | **未生成**（生成が滞留・要再投入） |
| `f6_yamato` | 大和 | 検品待ち・`prompts.json` に無い追加カット |
| `f5_ri` | 李 | 検品待ち |
| `f4_kumoi` | 雲井 | 検品待ち |
| `f3_ukai` | 鵜飼 | 検品待ち |
| `f2_kaburagi` | 鏑木 | 検品待ち |
| `f1_tome` | 星野トメ | 検品待ち |
| `b1_hiiragi` | 柊源三 | 検品待ち |
| `key_building` | — | **保留**（建物CANON未確定） |
| `key_rooftop` | — | **保留**（同上・九人が揃うカット） |

**生成物の目視検品はしていない。** この作業コンテナは画像配信CDNをネットワークポリシーで
弾かれるため、生成した画像を開いて確認する手段が無い。合否判定は人間側で行う必要がある。

`key_building` / `key_rooftop` は建物外形が写る。建物候補Y7の確定承認が出ていないため、
外形をCANON固定しない方針でここでは生成していない。`fetch-assets.mjs` はこの2件を
`status: on_hold` として自動的に取得対象外にする。

大和は `prompts.json` に専用カットが無いため、`imageboard.html:471` の仕様
（ひょろ長い青年／ヘッドフォン／指先だけ親方と同じ黒＝継承の記号）からプロンプトを起こした。
`imageboard.html` 側に `data-asset="f6_yamato"` の枠はまだ無い。

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
