# 引き継ぎ書（別アカウント／新セッション用・完全版）

**目的**: このドキュメント1枚で、WFAIA作品「はしっこビルの明日づくり」の制作を
**別のClaudeアカウント・新しいセッションでも完全に再開できる**ようにする。
専門知識がなくても、上から順に読めば進められる書き方にしてある。

---

## 0. 新セッションに最初に貼る指示文（コピペ用）

新しいセッションを開いたら、まずこれをそのまま貼る:

```
リポジトリ tkwfunkypop/public の works/hashikko-bill/HANDOVER.md を読んで、
書いてあるルール・進捗・残作業に従って制作を再開してください。
作業ブランチは claude/prompts-json-10cut-generation-cisssw、PR #16 が対応PRです。
正典ドキュメント（STORY.md / FLOYO_MIGRATION.md / CM_LINEUP.md / INTRO_SCENES.md /
OPENING_ENDING.md / SCENE_NARRATION.md）を先に読み、
generated.json（台帳）と sjinn-jobs.json（生成タスクID）で現状を把握してから、
「7. 残作業リスト」の上から順に進めてください。
```

---

## 1. プロジェクト概要

- **作品**: 「はしっこビルの明日づくり」— Tim Burton風ゴシック×フェルト製ストップモーション人形劇
- **応募先**: WFAIA 2部門
  - **AIアニメ部門**: 尺1〜5分・横16:9・賞金¥300,000。審査観点=キャラデザ/世界観の独創性/ビジュアル完成度/演出力/ディレクション
  - **広告部門**: 尺15〜60秒・縦横不問・賞金¥300,000。審査観点=広告実用性/訴求力/独創性/短尺印象設計/ブランド構築力
- **⚠️ 尺の注意**: 本編コンテは89カット・実尺合計346秒（5分46秒）で**5分を46秒超過**。
  編集時に各カットの余白を詰めて300秒以内に収める（生成は10秒尺だが実尺は3〜5秒目安なので現実的）。

## 2. 場所（リポジトリとファイル地図)

- リポジトリ: `tkwfunkypop/public` ／ ブランチ: `claude/prompts-json-10cut-generation-cisssw` ／ PR: **#16（draft）**
- ローカルPC側の作業コピー: `~/repos/public`（Macユーザー: takahashiteikoku）

| ファイル | 中身 |
|---|---|
| `works/hashikko-bill/STORY.md` | 物語・シーン構成の正典 |
| `works/hashikko-bill/FLOYO_MIGRATION.md` | **制作パイプラインの正典**（§2.7三層体制・§2.8命名規則） |
| `works/hashikko-bill/generated.json` | **台帳**。全アセット641件（id/kind/url）。新規生成は必ずここに追記 |
| `works/hashikko-bill/sjinn-jobs.json` | SJinn生成タスクID（カット番号→task_id）。回収に使う |
| `works/hashikko-bill/storyboard/i2v-prompts.json` | 全89カットのI2Vプロンプト・秒数 |
| `tools/floyo/manifests/i2v-prod.json` | 本線I2V用マニフェスト（カット別プロンプト+開始フレームURL） |
| `works/hashikko-bill/ad/CM_LINEUP.md` | CM10本の正典（ナレ原稿 日英・カット割り） |
| `works/hashikko-bill/intro/INTRO_SCENES.md` + `telops.html` | キャラ紹介9カット+ネームテロップ（刺繍作字v3） |
| `works/hashikko-bill/narration/OPENING_ENDING.md` | 本編冒頭/締めナレ（日英+カット対応表） |
| `works/hashikko-bill/narration/SCENE_NARRATION.md` | 章替わりナレ8本（日英） |
| `works/hashikko-bill/setup-workspace.mjs` | **ローカルPCで実行**→デスクトップ`WFAIA_はしっこビル/`に全素材を種類別保存 |
| `tools/floyo/run.mjs` + `workflows.json` + `manifests/` | Floyo実行ランナー |
| `tools/fish/generate.mjs` | Fish Audioナレ生成（ローカル実行） |

## 3. アカウント・APIキー（★新アカウントで最初にやること）

キーは**絶対にチャットに貼らない**。すべて `.env` ファイルに置く（gitにはコミットしない）。

| サービス | 役割 | キーの場所 |
|---|---|---|
| SJinn (MCP) | 本編I2V生成（seedance2） | Claude側のMCP接続（SJINN_TOKEN）。新アカウントでは**SJinn MCCPを接続し直す** |
| Higgs Field (MCP) | 画像生成（nano banana）・CM動画（seedance_2_0）・音声（seed_audio）・MiniMax H3 | Claude側のMCP接続。新アカウントで接続し直す |
| Floyo | カメラアングル（Qwen）・LTX補間 | `tools/floyo/.env` に `FLOYO_API_KEY=`（ローカルPCの `~/repos/public` にある） |
| Fish Audio | ナレ別候補ボイス | `tools/fish/.env` に `FISH_AUDIO_KEY=` |

**ネットワーク制約**: Claudeの作業コンテナからは floyo.ai / fish.audio / queue.fal.run /
edit.comfyonline.app へ直接アクセスできない。→ **FloyoとFishはローカルPCのターミナルで実行**し、
結果JSONをチャットに貼って渡す。動画の保存も `setup-workspace.mjs`（ローカル）で行う。

## 4. 制作パイプライン（三層+CM）

1. **開始フレーム（静止画）**: Higgsfieldの nano banana（キャラ参照UUID付き）。終了フレームも nano banana（Qwenは頭部が変わるため禁止）
2. **本編I2V**: SJinn `create_video_task`（model=seedance2, 720p, 16:9, quality, **duration=max(10, 実尺+2)**）。**同時5タスクまで**。6本目はエラーになるので5本ずつ「波」で投入→完了待ち→次の波
3. **Floyo**（ローカル実行）: ①Qwenアングル=1ラン4方向 ②LTX Start-End補間（開始+終了フレームから中割り）
4. **CM**: Higgsfield `generate_video`（seedance_2_0、日本語音声可、15秒上限、9:16対応）と MiniMax H3（**2Kのみ動作。768Pは故障中**）。
   **絶対則: すべてのCMは制作のどこかで必ずFloyoを使う**（アングル素材をスタートフレームか差し込みカットに）

### よく使うコマンド（ローカルPCで）

```bash
cd ~/repos/public && git pull
# Floyoアングル生成（例: CM#4〜10素材）
node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow qwen-angle --batch tools/floyo/manifests/ad-angles2.json
# 実行済みランの結果だけ回収（再課金なし）
node ... run.mjs --workflow qwen-angle --batch <同じmanifest> --fetch
# 素材を全部デスクトップに保存（presigned URL失効前に！）
node works/hashikko-bill/setup-workspace.mjs
# Fish Audioナレ（2声で全ナレ生成）
node --env-file=tools/fish/.env tools/fish/generate.mjs --voice "e36ebe,c3f03b" --all
```

## 5. 作品ルール（正典・違反禁止）

1. キャラシートの14キャラ以外を登場させない（モブも正典の脇役のみ）
2. 同一キャラを同一シーンに2体出さない
3. ひかりは弁当の塔を**両手で頭上に**掲げる
4. 会話は喃語（mm/uu）のみ。口は描かない
5. テロップ・BGM・音符を映像に焼き込まない（SEは可）。テロップは編集で重ねる
6. 映像内の文字はすべて**架空文字**（日本語/英語/数字は不可）
7. CMは架空ブランドのみ（実在ブランド偽装禁止）
8. ナレ音声: 女性=Hana `c25f78a0-714e-42af-8da3-a399cef94968`、男性=Arthur `30fc8796-ceb6-4a66-b3a7-4a145ef7f346`（seed_audio。感情は（）書き接頭）

### キャラ参照UUID（Higgsfield）
TOME=ab614b7b / KABURAGI=c4f0ecbe / UKAI=48c63be0 / KUMOI=a05b985c / LI=3846f10c /
KUROGANE=7de3b8e2 / YAMATO=4ffb2cf3 / HIKARI=ea03da32 / HIIRAGI=0bc9bf7a /
BUILDING=84c99ff4 / 廊下セット=3d600592

### 命名規則
動画=`c{カット}_i2v_v{版}` ／ CM=`ad_{番号}_{向き}_v{版}` ／ ナレ=`vo_{内容}_v{版}`。
生成したら必ず `generated.json` に追記（kind: i2v_prod / ad_i2v / ad_start_frame / narration_audio / floyo_angle 等）

## 6. 現在の進捗（2026-07-31時点）

### 完了
- キャラシート14体系・絵コンテ89カット・スタートフレーム全カット・テロップv3・キーアート
- **本編I2V 完成29本**: C02〜C31のうち C02-C06,C13,C15-C30（URLは台帳の kind=i2v_prod）
- ナレ音声17本（冒頭34.5s/締め27.1s/章替わりB〜H 7本/CM用#4〜#10）
- CM: #1 HOTARU横15秒完パケ（音声内蔵）、Floyoアングル ad_a1×4 / ad_a3×4 / ad_a2×1 回収済み

### 実行中（回収待ち）— IDは sjinn-jobs.json にもある
| 内容 | タスクID | 状態 |
|---|---|---|
| C31（つぎはぎ手紙接写） | SJinn `6e69fa7b-d7f0-4d01-8953-d8ffa9534ea5` | pending |
| **C06 v2（煙をドライアイス風に修正）** | SJinn `313eb7ee-4d85-4309-8ee5-43422347a6b7` | pending |
| C32 / C33 / C34 | SJinn `fc6f8b94…` / `ef467767…` / `f0c72308…`（完全IDはsjinn-jobs.json） | pending |
| 60秒オムニバスCM 4パート | Higgsfield `df682572` `c43e6dec` `5b614cf3` `6577f5ad` | 回収待ち |
| 縦型HOTARU CM#2 | Higgsfield `a67167be` | 回収待ち |
| I章ナレ | Higgsfield `ff62ec3e` | 回収待ち |
| CM#4〜10用Floyoアングル32枚 | ローカルで `ad-angles2.json` 実行中 | 結果JSON待ち |

回収方法: SJinnは `get_task(task_id)`、Higgsfieldは `job_display`。取れたURLを台帳に追記→ローカルで setup-workspace 実行。

## 7. 残作業リスト（優先順）

1. **実行中タスクの回収**（上の表）→ 台帳追記 → setup-workspace で保存
2. **本編I2V続き**: C35〜C78 の約44カット。`tools/floyo/manifests/i2v-prod.json` のプロンプト+開始フレームをそのまま SJinn seedance2（720p/16:9/quality/10秒）に投入。**5本/波**
3. **短尺再生成**: C02〜C18 のうち初期に短い尺で作った16本を10秒版v2で作り直し（同manifestのプロンプト使用）
4. **キャラ紹介9カット**: `INTRO_SCENES.md` の表どおり（所作+最後にカメラ目線、10秒）
5. **C00a 古地図カット**: 冒頭ナレ用の新規1カット（`OPENING_ENDING.md` 参照）
6. **CM10本の動画化**: ad-angles2 の結果が来たら検品→合格フレームを MiniMax H3（**2K**・10秒・縦横は CM_LINEUP.md の向き）のスタートフレームに
7. **Floyo Start-End 7カット**: 終了フレームを nano banana で量産→ ltx-startend で補間
8. **Fish Audio 2声版**: ローカルで `--voice "e36ebe,c3f03b" --all`
9. **編集**: 本編を300秒以内に（超過46秒分は余白詰め）。テロップ・ナレ・SEを重ねる

## 8. 過去のハマりどころ（同じ穴に落ちない）

- **H3の768Pは故障中**（10本連続failed）。H3は必ず2Kで
- SJinnは**同時5タスクまで**。超えると task_creation_failed
- SJinn出力URL（edit.comfyonline.app）は一時URL。**早めにローカル保存**
- Floyoの presigned URL は約24時間で失効。`--fetch` で再取得可能（再課金なし）
- Floyoの `expand` は `outputs.presigned_url`（ドット）。`presigned_url_expires_in` は 84600 以下
- Qwenアングルで自由編集する時は free_prompt を `120.prompt_1` に文字列で（空文字リンクはNG）
- Cloudflare 502 が散発 → 60〜90秒待って再送すれば通る
