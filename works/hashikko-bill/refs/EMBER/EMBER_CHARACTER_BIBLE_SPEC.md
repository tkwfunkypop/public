# EMBER Character Bible V2 — Canonical Specification

## 管理情報

- Character ID：`EMBER-001`
- Revision：`2.0`
- Canon Status：`CANON CANDIDATE`
- Body Type：`BIPED`
- Handedness：`RIGHT`
- Side View：`CHARACTER LEFT`
- Proportion：`8.5 HEADS`
- 最終承認：`HUMAN REVIEW REQUIRED`

## 物語の核

- ログライン：歌うたびに体が崩れていく、粘土でできた音楽家の話。
- テーマ：創作は身を削る。それでも鳴らす。
- 主人公の選択：崩れることを恐れて沈黙するか、失われながら歌って誰かに光を届けるか。
- 反復モチーフ：亀裂、街灯、光る欠片、新芽。

## EMBERの固定外見

- 極端に細く、手足が長い青灰色の粘土製人型
- 白亜色の骸骨状の顔。深い黒い眼窩と小さな琥珀色の瞳
- 顔に固有の深い亀裂。ページ間で亀裂位置を変えない
- 髪は上方から後方へ流れる、枯れ根・蔓・小枝の塊
- 胸骨中央に枝分かれした青い発光亀裂
- 肩に裂けた積層マント。胴体は薄い粘土布と樹皮状繊維の重なり
- 前腕と脛は古い巻き布。手は長い5本指。足元は巻き布の靴
- 長い外套の裾は左右に分かれ、地面近くまで垂れる
- 質感は乾燥した粘土、白亜、樹皮繊維、古い包帯。金属鎧や通常の布ではない
- 正面、左側面、背面は同じ地面線と関節位置に揃える
- キャラクター本人から見た左手でフレットを押さえ、右手で弦を鳴らす
- 顔の亀裂、胸の亀裂、衣装の破損、縫い目は左右反転させない

## 色と光の固定ルール

- 本体：低彩度の青灰色
- 顔：ひび割れた白亜色
- 眼：ごく小さな琥珀色
- 胸の内なる光：冷たい淡い青。常時弱く、歌唱で段階的に増える
- 街灯：暖かい琥珀色。最後の聴衆と命の灯り
- 欠片：本体と同じ青灰色。分離直前だけ淡い青に光る
- 再生：夜明けの抑えた淡い金色。鮮やかな虹色は使わない

## 装備・重要プロップ

### ギター

- 白っぽい青灰色の、ひび割れた手作りアコースティックギター
- 6弦、暗いサウンドホール、不揃いの手作りペグ
- 粘土または白亜塗装のような本体。傷と補修跡を固定
- EMBERが座った状態で無理なく抱えられる縮尺

### 街灯

- 細長い、古く風化した暗色の鉄製街灯
- 曲線の支持金具と浅い円盤状の灯具
- 光は暖かな琥珀色のみ
- EMBERの「最後の聴衆」「命の灯り」として扱う

## 状態変化の正本

1. `BEFORE THE CRACK`：滑らかで損傷が少なく、指先と衣装が保たれている。胸の光は休眠。
2. `SILENT / WEATHERED`：現在形。全身が乾燥して深くひび割れ、衣装が荒れている。胸にごく弱い青い亀裂。
3. `FIRST NOTE`：指先から少量の欠片が落ち始め、胸の光が目覚める。
4. `FULL SONG`：腕や衣装端が包帯のようにほどけ、光る欠片が螺旋を描く。顔とギターは判読可能なまま。
5. `AFTERLIGHT`：体は消え、空の外套、震えるギター、粘土片、枯れ根形の小さな新芽、役目を終える街灯が残る。

崩壊は乾いた粘土の欠けと剥離として描写し、血、肉、灰、煙、爆発にはしません。

## EMBER専用・必須一貫性プロンプト

以下を、EMBERを生成・編集するすべてのプロンプトにそのまま追加します。

```text
EMBER CANON LOCK — MANDATORY
Depict the exact same canonical EMBER established by the approved character-bible sheets.

EMBER is an extremely slender, elongated street musician made from dry cracked blue-gray clay. He has a chalk-pale skull-like face, deep black eye sockets with tiny warm-amber pupils, a fixed map of deep facial cracks, and tall swept hair formed from tangled dry roots, vines, and twigs. His sternum carries one fixed branching crack that emits a restrained cool-blue inner light. His costume is constructed from thin distressed clay-cloth and bark-like fiber: a layered ragged shoulder mantle, neck wraps, narrow torso shell, split waist panels, wrapped forearms and shins, long five-fingered hands, and worn wrapped shoes.

Identity invariants:
- preserve the approved skull geometry, eye spacing, facial crack map, root-hair silhouette, ear shape, height, limb length, shoulder width, hand size, and foot size
- preserve the exact costume layers, seams, holes, ties, asymmetry, damage map, and trailing panel lengths
- preserve the muted blue-gray, chalk white, charcoal, cool-blue, and warm-amber palette
- preserve the canonical guitar and streetlamp geometry, scale, surface damage, and material treatment
- all views and poses must resolve to one physically coherent stop-motion clay maquette

Story-effect invariants:
- the body is dry blue-gray clay, never flesh, bone, smoke, ash, or metal
- damage progresses as crack → chip → separated clay fragment
- a fragment glows softly cool blue only immediately before separation
- the chest crack is cool blue and restrained, never bright neon
- the streetlamp is warm amber and represents the last audience/life-light
- no blood, gore, fire, explosion, rainbow magic, literal music-note symbols, new accessories, weapons, or costume redesign

Change only the explicitly requested pose, expression, camera, lighting, or canonical story stage. Everything else remains unchanged.
```

## 各ページの役割

- `01 / CORE`：顔、8.5頭身、三面図、関節線、左右差、色体系
- `02 / CONSTRUCTION`：顔の固定ランドマーク、表情、可動、衣装分解、素材挙動
- `03 / PROPS & INTERACTION`：ギター、街灯、縮尺、右利き、接触点、状態比較
- `04A / STORY STATES`：5段階の崩壊と再生、状態差分、光、モチーフ
- `05 / MOTION & PERFORMANCE`：移動、ためらい、演奏、追従、口形、禁止動作
- `06 / CONTINUITY CHECK`：顔、比率、左右差、衣装、装備、色、人間承認

次回以降は承認済みの`01 / CORE`と`02 / CONSTRUCTION`を必須参照にします。装備が登場する場合は`03 / PROPS & INTERACTION`、変化状態を描く場合は`04A / STORY STATES`、動作を描く場合は`05 / MOTION & PERFORMANCE`も参照します。`06 / CONTINUITY CHECK`で人間承認されるまで`APPROVED CANON`とは扱いません。
