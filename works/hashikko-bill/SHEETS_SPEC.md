# はしっこビル キャラクターシート体系 — EMBER準拠仕様

正本：`refs/EMBER/`（CHARACTER BIBLE V2 の実例6枚＋仕様書2本）。
本書は EMBER の体系を「はしっこビルの明日づくり」の14キャラクターへ移植する対応表。

## シート体系（EMBERと同一）

| 番号 | シート | 内容（EMBERの実例から） |
|---|---|---|
| 01 | CORE | 顔・頭身・三面図・関節線・左右差・COLOR SYSTEM（本編9人は既存。脇役5体はターンアラウンドで代替済み） |
| 02 | CONSTRUCTION | HEAD & FACE MAP（三面の頭部＋番号付きランドマーク＋表情4種）／BODY FUNCTION（固有機構の状態×3＋HAND RANGE×5＋RANGE OF MOTION）／COSTUME / BODY LAYERS（全身＋衣装分解の名称付き）／MATERIAL SPEC（質感見本6種） |
| 03 | PROPS & INTERACTION | 正典プロップ2点（多面図＋部位拡大＋SCALE＋RESTING/IN USE/AFTERMATH）／GRIP & CONTACT（手の拡大・接触点マップ・収納位置） |
| 04 | STORY STATES | 物語内の状態変化（3〜5段階の全身比較）＋STATE DELTA TABLE＋LIGHT RELATION＋MOTIF LOCK＋COLOR SCRIPT帯 |
| 05 | MOTION & PERFORMANCE | LOCOMOTION（待機・歩き・停止・手伸ばし・膝つき・座り）／PERFORMANCE ARC（職能の所作5段階）／FOLLOW-THROUGH／FACE & VOICE（口形・6種）／PERFORMANCE RULES＋DO NOT |
| 06 | CONTINUITY CHECK | IDENTITY MATCH／PROPORTION MATCH（輪郭重ね）／ASYMMETRY & HANDEDNESS／COSTUME・PROP INSTANCE CHECK／MATERIAL & COLOR CHECK／RELEASE CHECKLIST（人間承認欄） |

- 表情4種は全キャラ共通ラベル：`NEUTRAL / JOY / WORRY / RESOLVE`
- シートは文字入り書式（CHARACTER BIBLE V2 と同じ）。**映像カットの「文字は編集で載せる」
  ルールとは別物**（シートは文書なので文字が正）
- 生成手法は確定手法を踏襲：**承認済み図版を第1参照＋COREを第2参照＋要点の言語化1行**
- 06 の承認欄は未チェックで生成し、`CANON RELEASE REQUIRES HUMAN APPROVAL` を明記

## キャラクター別の固有要素

| キャラ | BODY FUNCTION（固有機構） | 正典プロップ2点 | STORY STATES |
|---|---|---|---|
| ひかり | 頭上のトランク塔の均衡 | トランクの塔／宛先帳 | 依頼受領→奔走→蕎麦会→八社目の書き手 |
| 黒金 | 胴の印刷機（弾み車・活字トレイ） | 手押し印刷機の胴／活字ケース | 停止した工房→再稼働→協働刷り |
| 大和 | 手だけ親方と同じ黒（継承の記号） | 鍵束／活字スティック | 従属→自分の音→継承 |
| 李 | 胸の蒸留器と香気 | 薬瓶クラスタ／銅の蒸留器 | 閉室→調香→香りの回廊 |
| 雲井 | 吊るした真鍮計器群 | 気圧計／観測手帳 | 観測のみ→予報を配る→晴れの宣言 |
| 鵜飼 | 深紅の帳簿 | 帳簿／丸眼鏡 | 隠遁→回想（11歳）→仲裁者 |
| 鏑木 | ゼンマイと歯車前掛け | 機械の鉤爪手／玩具 | 独作→椅子の共作→上映会 |
| トメ | 襟の鈴と赤房の帳簿 | 鈴／式次第 | 送る人→祝う人 |
| 柊 | 電球の房（点灯段階） | 電球の房／鍵束 | 53歳(一個・未点灯)→老年(房・弱)→全点灯→引き継ぎ |
| 鵜飼11歳 | 縫い目の口の開閉 | 給食箱／紙飛行機 | 両親と→ひとり→（成人へ接続） |
| 鵜飼の母 | 襟の灯火橙 | 前掛け／重箱 | 7F勤め→不在 |
| 鵜飼の父 | 前掛けの歯車 | 歯車／木箱 | 2F勤め→不在 |
| 柊53歳 | 未点灯の電球一個 | 電球一個／新品の鍵束 | 就任→五十年の始まり |
| 開発業者 | 無色（どの階の色も持たない） | 書類鞄／名刺 | 来訪→提案→退場 |

## 進行

シート番号ごとに14キャラ一括生成→検品→`generated.json`＋`character-sheets.html`へ配線→コミット。
既存の暫定シート（02 EXPRESSION／03 POSE／04 PROPS）は EMBER 体系の 02/05/03 に吸収されるため、
新シートの検収後に `superseded` 扱いに整理する。
