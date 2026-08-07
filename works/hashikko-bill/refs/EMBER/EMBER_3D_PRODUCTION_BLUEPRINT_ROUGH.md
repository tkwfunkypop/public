# EMBER — 3D Production Blueprint Rough

## Document Control

- Character ID：`EMBER-001`
- Blueprint Revision：`0.1`
- Status：`ROUGH / HUMAN REVIEW REQUIRED`
- Unit：`1 Blender Unit = 1 meter`
- Base frame rate：`24 fps`（暫定）
- Color management：AgXを想定。実制作開始時のBlender環境で再確認する
- Canon source：EMBER Character Bible V2

本書の寸法、フレーム範囲、UDIM、粗さ、色温度、ライト強度、パーティクル数は、キャラクターシートから制作を開始するための暫定設計です。`APPROVED CANON`ではなく、モデラー、リガー、アニメーター、FX、撮影、照明の各担当者による検証前提です。

## Canon References

- `../CharacterSheet/01_EMBER_CharacterBible_Core.png`
- `../CharacterSheet/02_EMBER_CharacterBible_Constraction.png`
- `../CharacterSheet/03_EMBER_CharacterBible_Props&Interaction.png`
- `../CharacterSheet/04_EMBER_CharacterBible_StoryStates.png`
- `../CharacterSheet/05_EMBER_CharacterBible_Motion&Performance.png`
- `../CharacterSheet/06_EMBER_CharacterBible_ContinuityChecks.png`

## Department Blueprints

1. `../CharacterSheet/99_3DCG_ProductionBluePrint/01_Modeling_Raugh.png`
2. `../CharacterSheet/99_3DCG_ProductionBluePrint/02_Texture_Lookdev_Raugh.png`
3. `../CharacterSheet/99_3DCG_ProductionBluePrint/03_Rigging Raugh.png`
4. `../CharacterSheet/99_3DCG_ProductionBluePrint/04_Animation_Raugh.png`
5. `../CharacterSheet/99_3DCG_ProductionBluePrint/05_FX_Raugh.png`
6. `../CharacterSheet/99_3DCG_ProductionBluePrint/06_Enviroment_Raugh.png`
7. `../CharacterSheet/99_3DCG_ProductionBluePrint/07_CameraWork_Raugh.png`
8. `../CharacterSheet/99_3DCG_ProductionBluePrint/08_Lighting_Raugh.png`

## Shared Production Rules

### Coordinate and scale

- World origin：街灯の台座中心 `(0, 0, 0)`
- Z-up
- Character forward：ローカル`-Y`を暫定採用。プロジェクト開始時に統一
- 左右：キャラクター本人から見た左右
- Side view：`CHARACTER LEFT`
- Handedness：右利き。左手でフレット、右手でストラム

### Provisional dimensions

| Item | Value |
|---|---:|
| EMBER total height, including root crown | 1.95 m |
| Scalp height | 1.73 m |
| Shoulder line | 1.48 m |
| Hip line | 1.00 m |
| Knee line | 0.54 m |
| Shoulder width | 0.38 m |
| Arm span | 1.86 m |
| Hand length | 0.25 m |
| Foot length | 0.31 m |
| Guitar total length | 1.02 m |
| Streetlamp height | 2.75 m |

### Canon invariants

- 8.5頭身の極端に細い体型
- 白亜色の骸骨状の顔、固定された顔の亀裂、黒い眼窩、小さな琥珀色の瞳
- 上後方へ流れる枯れ根状の髪
- 胸骨中央の枝分かれした青い発光亀裂
- 青灰色の乾いた粘土、樹皮状の薄い粘土布、古い巻き布
- 肩マント、胴体層、腰の分割パネル、前腕・脛の巻き布、巻き靴
- ギター、街灯、衣装は全カットで同一個体
- 左右非対称、破損、縫い目、亀裂をミラーしない

## Proposed Blender Collection Structure

```text
EMBER_PRODUCTION
├── CHR_EMBER
│   ├── CHR_EMBER_GEO
│   ├── CHR_EMBER_RIG
│   ├── CHR_EMBER_CTRL
│   ├── CHR_EMBER_SIM
│   └── CHR_EMBER_GUIDES
├── PROP_GUITAR
├── PROP_STREETLAMP
├── ENV_EMBER_STREET
├── FX_EMBER
├── LGT_EMBER
├── CAM_EMBER
└── RENDER_EMBER
```

---

# 01 — Modeling Blueprint

## Modeling strategy

1. 三面図から全身のブロックアウト
2. 高密度スカルプトで顔、粘土表面、衣装の一次形状を作成
3. 変形用メッシュをリトポロジー
4. 薄い粘土布は身体から分離
5. 根状髪は主要束をCurveで構築し、細枝は補助カーブまたはインスタンス
6. 胸の亀裂は凹形状、発光マスク、FX用マスクを分離
7. 崩壊対象を通常変形メッシュから分離可能な構造にする

## Geometry components

| Object name | Role | Deforms | Breakaway |
|---|---|---:|---:|
| `EMB_Body` | 身体基礎 | Yes | Partial |
| `EMB_Head` | 頭部殻 | Yes | No |
| `EMB_Face` | 白亜色の顔面プレート | Yes | Limited |
| `EMB_Root` | 根状髪の主要束 | Secondary | Optional |
| `EMB_Crack` | 胸の凹形状・発光 | Driven | No |
| `EMB_Mantle` | 肩の積層マント | Secondary | Edge |
| `EMB_TorsoLayer` | 胴体レイヤー | Secondary | Edge |
| `EMB_WaistPanel` | 腰から垂れる分割層 | Secondary | Yes |
| `EMB_Wrap_Arm` | 前腕の巻き布 | Corrective | Partial |
| `EMB_Wrap_Leg` | 脛の巻き布 | Corrective | No |
| `EMB_Shoe` | 巻き靴 | Yes | No |

## Topology priorities

- 顔：目、顎、口角、頬の圧縮に必要なループ
- 肩：マント下の肩関節とマント表層を分ける
- 肘・膝：細い体積を潰しすぎない補助ループ
- 手：5本指を維持。各指3節
- 手首：ギター運指用のねじれ余裕
- 腰：身体の骨盤と長い腰パネルを分離
- 崩壊域：指先、右前腕、外套端

## Form hierarchy

- Primary：長く細いシルエット、根状髪、外套の大きな流れ
- Secondary：肩マント、胴体の層、巻き布、靴
- Tertiary：亀裂、縫い目、繊維、欠け、表面粒度

---

# 02 — Texture and Lookdev Blueprint

## Material zones

| ID | Material | Visual behavior | Roughness rough target |
|---|---|---|---:|
| M01 | Blue-gray clay | 乾燥、深い亀裂、光沢なし | 0.78–0.92 |
| M02 | Chalk face | 白亜、細かい粉状、孔質 | 0.82–0.95 |
| M03 | Root fiber | ねじれ、脆い、暗色 | 0.72–0.88 |
| M04 | Bark cloth | 積層、裂け、樹皮状 | 0.75–0.90 |
| M05 | Aged wrap | 繊維質、乾燥、毛羽立ち | 0.80–0.95 |
| M06 | Shoe clay | 圧縮された粘土と巻き布 | 0.78–0.92 |
| M07 | Inner blue emission | 胸と分離直前の欠片 | Controlled |

## Proposed UDIM plan

| Tile | Assignment | Priority |
|---|---|---|
| 1001 | Head / face | High |
| 1002 | Torso / arms | High |
| 1003 | Legs / feet | Medium |
| 1004 | Mantle / waist panels | High |
| 1005 | Root crown | Medium |
| 1006 | Guitar | High |

顔の亀裂、胸の亀裂、衣装破損、ギター破損はミラーUV禁止です。

## Map responsibilities

- Base Color：青灰色、白亜、根、巻き布の色差。亀裂を黒線として描かない
- Roughness：乾燥度、摩耗、圧縮部の差
- Normal：微細な粘土粒、繊維、浅いひび
- Displacement：中〜大規模な亀裂、剥離、樹皮層
- AO / Cavity：実際の凹部補助。ベイク結果を過度にBase Colorへ焼かない
- Emission Mask：胸、瞳、分離直前の欠片
- Damage Mask：FXとLookdevが共有する破損範囲

## Damage scale library

- Micro：1–2 mm
- Small：5 mm前後
- Medium：20 mm前後
- Hero chip：20–60 mm

---

# 03 — Rigging Blueprint

## Core hierarchy

```text
EMB_Root
└── EMB_COG
    └── EMB_Pelvis
        ├── EMB_Spine_01
        │   └── EMB_Spine_02
        │       └── EMB_Chest
        │           └── EMB_Neck
        │               └── EMB_Head
        │                   └── EMB_Jaw
        ├── Leg.L
        └── Leg.R
```

腕、脚はIK／FK切替を持たせます。手は左右とも5本指、各3節です。

## Main controls

- `CTRL_ROOT`
- `CTRL_COG`
- `CTRL_CHEST`
- `CTRL_HEAD`
- `CTRL_GAZE`
- `CTRL_JAW`
- `CTRL_HAND_L`
- `CTRL_HAND_R`
- `CTRL_GUITAR`
- `CTRL_CRACK`
- `CTRL_CRUMBLE_L`
- `CTRL_CRUMBLE_R`
- `CTRL_EMISSION`
- `CTRL_ROOT_DRAG`

## Secondary motion

- Root crown：主要10–14チェーン
- Shoulder mantle：6–8短チェーン
- Coat tails：8–12チェーン
- Wraps：局所補正骨だけを使用

枝1本ごとに骨を作らず、主要束にCurve ControlまたはB-Bone系の制御を使用します。

## Shape keys and masks

- `SILENT`
- `FEAR`
- `RESOLVE`
- `SINGING_A`
- `SINGING_E`
- `SINGING_O`
- `ELBOW_BEND`
- `KNEE_BEND`
- `WRIST_FRET`
- `CRACK_LEVEL`
- `BODY_LOSS`
- `FRAGMENT_RELEASE`
- `CHEST_GLOW`

骨格変形で破砕トポロジーを直接動かさず、崩壊はShape Key、Geometry Nodes、FX Maskで分離します。

---

# 04 — Animation Blueprint

## Motion language

- 低エネルギー
- 小さな歩幅
- 胸を守る閉じた姿勢
- 動作の開始は指先から
- 髪と外套は身体より遅れて追従
- 歌唱に合わせて姿勢が開く
- 大きなアスレチックポーズや弾性の強い動きは禁止

## Rough hero timeline

| Beat | Frames | Description |
|---|---:|---|
| A Silence | F000–F095 | 街灯の下で沈黙 |
| B Reach | F096–F167 | ギターへ手を伸ばす |
| C Retract | F168–F215 | 怖くなり手を引く |
| D Commit / Lift | F216–F311 | 決意してギターを持つ |
| E First Note | F312–F383 | 最初の音。胸と指先が反応 |
| F Build / Full Song | F384–F671 | 演奏、発光、崩壊が増える |
| G Release / Afterlight | F672–F863 | 身体が失われ、余韻と新芽へ |

合計864フレーム、24 fpsで約36秒のラフです。最終尺ではありません。

## Clip library

- `IDLE_01`
- `WALK_01`
- `REACH_01`
- `RETRACT_01`
- `LIFT_GUITAR_01`
- `PLAY_SOFT_01`
- `PLAY_FULL_01`
- `SING_A_E_O`
- `CRUMBLE_ARM_R`
- `COLLAPSE_COAT`
- `SPROUT_GROW`

## Follow-through offsets

- Root crown：+3〜5 frames
- Mantle：+2〜4 frames
- Coat tails：+4〜8 frames
- Fragments：イベント駆動

---

# 05 — FX Blueprint

## Trigger channels

- `CRACK_LEVEL`
- `BODY_LOSS`
- `FRAGMENT_RELEASE`
- `CHEST_GLOW`
- `LAMP_LEVEL`

## Clay fracture

1. Source mesh
2. Pre-cutまたはprocedural cells
3. Damage mask
4. Breakaway collection
5. Collision
6. Cache

破砕サイズは暫定で次の3階層です。

- Dustless micro：2–5 mm
- Small：5–20 mm
- Hero：20–60 mm

粉塵雲、灰、煙の爆発は使用しません。

## Fragment behavior

- 初速は表面法線方向に弱く与える
- 上昇は緩やか
- 演奏弧の周囲に螺旋を作る
- 分離直前だけ冷たい青に発光
- 分離後は通常の青灰色の粘土へ戻る
- 爆発的な放射状運動は禁止

## FX systems

| Cache name | Owner | Role |
|---|---|---|
| `FX_ClayBreak` | Geometry Nodes / Simulation | 破砕 |
| `FX_FragmentFlow` | Geometry Nodes | 欠片の流れ |
| `FX_FogRetreat` | Volume | 霧が音で退く |
| `FX_WindowLight` | Shader / Lighting | 窓明かりの伝播 |
| `FX_SproutGrow` | Geometry / Shape | 新芽の成長 |

---

# 06 — Environment Blueprint

## Master plan

- Set footprint：40 m × 24 m
- Street width：8 m
- Facade height：7–12 m
- Performance zone：街灯を中心に半径4 m
- Hero zone：0–8 m
- Mid zone：8–20 m
- Far zone：20–40 m

## Placement

| Asset | Position |
|---|---|
| Streetlamp | `(0, 0, 0)` |
| Ember seated | `(-1.4, -0.8, 0)` |
| Guitar resting | `(-2.2, -0.5, 0)` |

## Modular set kit

- Pavement Tile A / B
- Curb
- Drain
- Facade A / B / C
- Window Dark / Lit
- Door
- Roofline
- Distant Tower
- Streetlamp
- Debris Cluster

## Environment restrictions

- 人物なし
- 車両なし
- 読める看板なし
- ネオンなし
- 賑やかな市場なし
- 清潔な現代都市にしない
- 全アセットを手作り感、経年劣化、不完全さで統一

## Fog depth

- Foreground：low
- Midground：medium
- Background：high

---

# 07 — Camera Work Blueprint

## Frame and grammar

- Master frame：16:9
- Safe crop：2.39:1暫定
- 沈黙中は固定または極めて遅い移動
- EMBERが決意した時だけカメラが動き始める
- ネガティブスペースは沈黙を表す
- Full Songで画面を開く
- Aftermathで再び固定へ戻る

## Shot list

| ID | Shot | Lens | Move |
|---|---|---:|---|
| C01 | Establishing wide | 28 mm | Static → slow push |
| C02 | Lamp + Ember profile | 50 mm | Locked |
| C03 | Hand to guitar | 85 mm | Micro dolly |
| C04 | Last light in eye | 100 mm | Locked |
| C05 | First note | 50 mm | Slow push |
| C06 | Full song | 35 mm | Restrained 25° arc |
| C07 | Fragment river + city | 24 mm | Crane back |
| C08 | Aftermath | 50 mm | Locked hold |
| C09 | Sprout | 100 mm macro | Slow tilt |

## Provisional camera heights

- Low detail：0.45 m
- Seated eye：1.05 m
- Standing eye：1.68 m
- High reveal：3–6 m

## Focus path

`Eye → Hand → Guitar → Fragments → Windows → Sprout`

手持ち揺れ、スナップズーム、ダッチアングル、高速オービット、絶え間ないカットは禁止です。

---

# 08 — Lighting Blueprint

## Story-state intensity table

相対値であり、最終ワット数や露出ではありません。

| State | World cool | Streetlamp amber | Chest blue | Fragments blue | Windows amber | Dawn sun |
|---|---:|---:|---:|---:|---:|---:|
| Silent Night | 25 | 35 | 5 | 0 | 0 | 0 |
| Lamp Fading | 20 | 8 | 5 | 0 | 0 | 0 |
| First Note | 20 | 20 | 25 | 10 | 0 | 0 |
| Full Song / Relit | 20 | 100 | 70 | 80 | 35 | 0 |
| Dawn / Afterlight | 45 | 5 | 0 | 0 | 10 | 60 |

## Visual temperature targets

| Source | Target |
|---|---|
| World / sky | 7000–9000 K, cold blue |
| Streetlamp | 2000–2400 K, warm amber |
| Chest / fragments | cool cyan-blue |
| Windows | 2200–2800 K, warm amber |
| Dawn sun | 3500–4500 K, pale gold |

温度は見た目の方向性です。最終露出ではありません。

## Lighting collections

- `LGT_WorldCool`
- `LGT_LampPractical`
- `LGT_ColdRim`
- `LGT_NegFill`
- `LGT_EmberEmission`
- `LGT_Windows`
- `LGT_Dawn`

## Render passes

- Beauty
- Diffuse
- Specular
- Emission
- Volume
- Shadow
- Mist
- Cryptomatte Character
- Cryptomatte Props
- Light Groups：World / Lamp / Ember / Windows / Dawn

## Lighting restrictions

- 冷色世界と暖色の聴衆光という意味を守る
- 暖色キーを複数競合させない
- ランプ中心を白飛びさせない
- 黒い眼窩を潰さない
- 胸や欠片の発光をキーライト代わりにしない
- ネオンシアン、虹色リム、平坦な全面フィルは禁止

---

# Human Approval Checklist

## Before modeling

- [ ] 全高1.95 mを承認
- [ ] ギター1.02 m、街灯2.75 mを承認
- [ ] メッシュ分割を承認
- [ ] 崩壊ゾーンを承認

## Before lookdev

- [ ] UDIM割当を承認
- [ ] 粗さレンジを承認
- [ ] 亀裂の固定位置を承認
- [ ] 発光色と範囲を承認

## Before rigging and animation

- [ ] 右利きとギター接触を承認
- [ ] 根状髪と外套のチェーン数を承認
- [ ] 口形と表情範囲を承認
- [ ] 36秒のラフタイムラインを承認または改訂

## Before FX and final layout

- [ ] 破片サイズと密度を承認
- [ ] 環境寸法と原点を承認
- [ ] C01〜C09のショット構成を承認
- [ ] ライティングの相対値と色関係を承認

このチェックが完了するまでは、8枚の設計図を実制作の確定仕様として扱いません。
