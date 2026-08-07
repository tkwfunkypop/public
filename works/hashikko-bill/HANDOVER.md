# 引き継ぎ書（メインアカウント用・最終版 2026-07-31）

**目的**: このドキュメント1枚で、WFAIA作品「はしっこビルの明日づくり」を
**別のClaudeアカウント・新しいセッションで完全に引き継ぐ**。
生成フェーズは完了済みなので、引き継ぎ後の仕事は「仕上げ・検品・応募サポート」が中心。

---

## 0. 新セッションに最初に貼る指示文（コピペ用）

```
リポジトリ tkwfunkypop/public の works/hashikko-bill/HANDOVER.md を読んで、
プロジェクトを引き継いでください。作業ブランチは
claude/prompts-json-10cut-generation-cisssw、PR #16 が対応PRです。
生成フェーズ（本編89カット・CM14本・日英ナレ20本・字幕・ロゴ）は完了済み。
正典（STORY.md / FLOYO_MIGRATION.md / CM_LINEUP.md / edit/EDIT_PLAN.md）と
台帳 generated.json で現状を把握し、HANDOVER.md「7. 残作業」の順で
仕上げ（検品・リテイク・編集サポート・WFAIA応募準備）を進めてください。
作品ルール（HANDOVER.md §5）は絶対に守ること。
```

---

## 1. プロジェクト概要

- **作品**: 「はしっこビルの明日づくり」— Tim Burton風ゴシック×フェルト製ストップモーション人形劇
- **応募先**: **WFAIA = WORLD Floyo.AI CREATIVE AWARDS 2026 in Tokyo**（Floyo公式アワード）
  - 応募: https://wfaia2026.floyo.ai/ （2026/6/15受付開始・賞金総額100万円・Google Cloud後援）
  - **AIアニメ部門**: 尺1〜5分・横16:9・賞金¥300,000 → 本編4分56秒で適合済み
  - **広告部門**: 尺15〜60秒・縦横不問・賞金¥300,000 → CM14本すべて適合
  - **CMは制作のどこかで必ずFloyoを使う**のが本プロジェクトの絶対則（Floyo主催のため）

## 2. 完成データの場所

### ユーザーのMac（ローカル）
- `~/Desktop/hashikko_honpen_v1.mp4` — **本編完成版**（4分56秒・88カット・英語ナレ10本入り）
- `~/Desktop/WFAIA_はしっこビル/` — 全素材（12_本線I2V=89本 / 13_広告CM=14本 / 05_音声=日英ナレ20本 / 10_Floyo出力 / 00_正典ドキュメント ほか）
- `~/Documents/ASSETS/` — **素材の正式な保管場所**（2026-08-01に移行）。構造は「素材種別（第1階層）→ `003_はしっこビルの明日づくり`（第2階層）→ 用途別サブフォルダ」。日本語フォルダ名はNFD正規化に統一
- `~/Documents/ASSETS/ASSET_LIBRARY.html` — **作品一覧ハブ**。ここから各作品ページへ
- `~/Documents/ASSETS/Works/003_hashikko-bill.html` — 本作の資産ページ（キャラ/本編/CM/世界観/ナレ/Floyo/全ファイルのタブ・横断検索・検品バッジ付き）
- `~/repos/public` — リポジトリのローカルクローン

### リポジトリ（tkwfunkypop/public、ブランチ claude/prompts-json-10cut-generation-cisssw）
| パス | 中身 |
|---|---|
| `works/hashikko-bill/generated.json` | **台帳**（全アセット733件の id/kind/URL。何かを探すときはまずここ） |
| `works/hashikko-bill/STORY.md` | 物語・シーン構成の正典 |
| `works/hashikko-bill/FLOYO_MIGRATION.md` | 制作パイプラインの正典（三層体制・命名規則） |
| `works/hashikko-bill/edit/assemble.mjs` + `EDIT_PLAN.md` | **本編自動アセンブラ**（ローカル実行で1本化。--jaで日本語ナレ版） |
| `works/hashikko-bill/migrate-to-assets.mjs` | **ASSETSへの配置スクリプト**（デスクトップ作業フォルダ → `~/Documents/ASSETS` の種別/作品構造へコピー。上書きしない・予行演習あり） |
| `works/hashikko-bill/build-asset-library.mjs` | **ASSET LIBRARY ビルダー**（ASSETS走査＋台帳＋検品結果 → 作品一覧ハブ＋作品別ページ。`WORKS` に1行足せば作品が増える） |
| `works/hashikko-bill/qa/QA_REPORT_20260801.md` | 検品レポート（リテイク確定11件・要人間確認14件。ライブラリのバッジの正本） |
| `works/hashikko-bill/ad/CM_LINEUP.md` | CM14本の正典（日英ナレ原稿・ひらがな音声ルール） |
| `works/hashikko-bill/ad/subtitles/` | CM字幕一式: `subs-spec.json`（JP/EN対訳の正）→ `out/`クロマキー動画17本・`srt/`SRT34ファイル・`CM_SUBTITLES.md`一覧・`render_subs.py`再生成スクリプト |
| `works/hashikko-bill/ad/logo/` | 鏑木ロゴv2（3DCG風タイポ。クロマキー/透過PNG+元HTML） |
| `works/hashikko-bill/intro/` | キャラ紹介: `INTRO_SCENES.md`・`telops.html`（刺繍作字テロップ9枚）・`intro-i2v.json` |
| `works/hashikko-bill/narration/` | 日英ナレ原稿（`OPENING_ENDING.md`にナレ×カット対応表）・`SCENE_NARRATION.md`・`en-audio-jobs.json` |
| `works/hashikko-bill/sjinn-jobs.json` | SJinn全タスクID（再回収用） |
| `tools/floyo/` | Floyoランナー（run.mjs / workflows.json / manifests/） |
| `tools/fish/generate.mjs` | Fish Audioナレ生成 |

## 3. アカウント・APIキー（新アカウントで最初にやること）

キーは**絶対にチャットに貼らない**。すべて `.env`（gitに入れない）。

| サービス | 役割 | キー/接続 |
|---|---|---|
| SJinn (MCP) | 本編I2V生成（seedance2） | 新アカウントでMCP接続し直す（またはsjinn CLI+`sjinn auth login`） |
| Higgs Field (MCP) | 画像(nano banana)・CM動画(seedance_2_0)・音声(seed_audio)・H3 | 新アカウントでMCP接続し直す |
| Floyo | アングル/LTX補間（ローカル実行） | Macの `tools/floyo/.env` に `FLOYO_API_KEY` |
| Fish Audio | 予備ボイス（ローカル実行） | Macの `tools/fish/.env` に `FISH_AUDIO_KEY` |

**ネットワーク制約**: Claudeの作業コンテナから floyo.ai / fish.audio / edit.comfyonline.app /
d8j0ntlcm91z4.cloudfront.net へは直接アクセス不可。**FloyoとFishと動画保存はローカルPCで実行**し、
結果JSONをチャットに貼ってもらう運用。

## 4. よく使うコマンド（ローカルPCで）

```bash
cd ~/repos/public && git pull
node works/hashikko-bill/setup-workspace.mjs        # 台帳の全素材をデスクトップへ保存
node works/hashikko-bill/migrate-to-assets.mjs      # 予行演習（新素材の配置先を表示）
node works/hashikko-bill/migrate-to-assets.mjs --run  # デスクトップ作業フォルダ → ~/Documents/ASSETS へ配置
node works/hashikko-bill/build-asset-library.mjs    # ASSET LIBRARY（作品一覧＋作品別ページ）を再生成
node works/hashikko-bill/edit/assemble.mjs          # 本編を1本に自動アセンブル（英語ナレ）
node works/hashikko-bill/edit/assemble.mjs --ja     # 同・日本語ナレ版（_ja.mp4 に出力）
node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow qwen-angle --batch <manifest>       # Floyoアングル
node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow qwen-angle --batch <同> --fetch     # 再課金なし回収
python3 works/hashikko-bill/ad/subtitles/render_subs.py   # 字幕クロマキー動画の再生成（要pillow+ffmpeg）
```

## 5. 作品ルール（正典・違反禁止）

1. キャラシートの14キャラ以外を登場させない
2. 同一キャラを同一シーンに2体出さない
3. ひかりは弁当の塔を**両手で頭上に**掲げる
4. 会話は喃語（mm/uu）のみ。口は描かない
5. テロップ・BGM・音符を映像に焼き込まない（SE可）。文字要素は編集で重ねる
6. 映像内のプロップ文字はすべて**架空文字**（日本語/英語/数字は不可）
7. CMは架空ブランドのみ。**CMは必ずどこかでFloyoを使う**
8. CMナレのセリフはプロンプト内で**全文ひらがな表記**（発音精度対策）＋読点で間を制御
9. ナレ声: 女性=Hana `c25f78a0-714e-42af-8da3-a399cef94968`、男性=Arthur `30fc8796-ceb6-4a66-b3a7-4a145ef7f346`（seed_audio、感情は（）書き接頭）
10. 本編I2V: SJinn seedance2 / 720p / 16:9 / quality / duration=max(10,実尺+2) / **同時5タスク上限**
11. 終了フレーム生成は nano banana（Qwenは頭部が変わるためアングル専用）
12. 生成物は必ず台帳 `generated.json` に追記（命名: `c{カット}_i2v_v{版}` / `ad_{番号}_{向き}_v{版}` / `vo_{内容}_v{版}`）

### キャラ参照UUID（Higgsfield）
TOME=ab614b7b / KABURAGI=c4f0ecbe / UKAI=48c63be0 / KUMOI=a05b985c / LI=3846f10c /
KUROGANE=7de3b8e2 / YAMATO=4ffb2cf3 / HIKARI=ea03da32 / HIIRAGI=0bc9bf7a /
BUILDING=84c99ff4 / 廊下セット=3d600592

## 6. 完成状況（2026-07-31 生成フェーズ完了）

- ✅ 本編I2V **89本**（C00a古地図+C02〜C78全カット+回想サブカット+キャラ紹介9本）
- ✅ **本編1本化済み**: hashikko_honpen_v1.mp4（4分56秒・章頭に英語ナレ10本・ラスト14秒ホールド）
- ✅ CM **14本**（#1〜#3初期版、#4〜#14ひらがな音声版。縦8・横6）
- ✅ CM英語字幕: クロマキー動画17本+SRT日英34+対訳表
- ✅ ナレ音声: 日本語10本+英語10本
- ✅ テロップv3・鏑木ロゴv2・キーアート・キャラシート14体系・絵コンテ89カット
- ✅ Floyoアングル: ad_a1×4/ad_a3×4/ad_a2×1 回収済み、**CM#4〜10用32枚 生成済み**（結果JSONはMacの`tools/floyo/results/qwen-angle-2026-07-31T12-39-59-588Z.json`。setup-workspace再実行で保存）

## 7. 残作業（優先順）

1. **Floyoアングル32枚の保存確認**: ローカルで `git pull && node works/hashikko-bill/setup-workspace.mjs`（壊れたJSONをスキップする修正済み）。presigned URL失効時は `--fetch` で再取得
2. **検品とリテイク**: 本編89本の目視検品。NGカットはSJinn seedance2で同プロンプト再生成（ルール§5-10）
3. **編集の仕上げ**: ラフカット(hashikko_honpen_v1)にSE/BGM・テロップ(telops.html)・タイトル(アウトロ14秒の場所)を重ねる。CMは字幕クロマキーを載せる
4. **WFAIA応募**: https://wfaia2026.floyo.ai/ アニメ部門=本編、広告部門=CM選抜（推し: #1 HOTARU横 or #14 雲井占い縦）
5. （任意）H3版CM: Floyoアングル32枚を検品→MiniMax H3（**2Kのみ・768Pは故障中**）で10秒生成
6. （任意）Floyo Start-End 7カット: 終了フレームをnano bananaで作成→ltx-startendで補間
7. （任意）Fish Audio 2声版: `node --env-file=tools/fish/.env tools/fish/generate.mjs --voice "e36ebe,c3f03b" --all`

## 8. ハマりどころ（同じ穴に落ちない）

- SJinnは**同時5タスクまで**。6本目はtask_creation_failed → 5本/波で運用
- SJinn出力URL（edit.comfyonline.app）は一時URL。**早めにsetup-workspaceで保存**
- Floyo presigned URLは約24時間で失効。`--fetch`で再取得（再課金なし）。`expand=outputs.presigned_url`（ドット）、`presigned_url_expires_in`≦84600
- MiniMax H3の768Pは故障中（10連続failed実績）。**必ず2K**
- Higgsfieldで「IN THE DARK」等のプリセット提案が出たら `declined_preset_id` を付けて再送
- seed_audioは連投すると429 → 60〜90秒待って再送
- コンテナのffmpeg-staticは**drawtext非搭載** → 字幕はPillowでPNG描画→concat方式（render_subs.py）
- CSSの`background-clip:text`は子要素にtransformがあると壊れる → ロゴ類はSVGグラデ塗りで作字
- 台帳への記録漏れに注意（C26漏れの前科あり）。生成→即台帳→即コミットの順を守る
