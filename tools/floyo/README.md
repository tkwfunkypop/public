# tools/floyo — Floyo ワークフローAPIランナー

「はしっこビルの明日づくり」の三層パイプラインのうち、Floyo担当分
（**Qwen別アングル**と**LTX2.3 Start-End補間**が基本、他は必要時のみ）をAPIで回すためのツール。

## 前提（Floyo側の仕組み）

- Floyoでは**保存（フォーク）したワークフローがそのままAPIエンドポイントになる**。
  エディタの **Copy API Snippet** でエンドポイントURL・入力フィールド名・APIキーが取れる。
- 課金はブラウザ実行と同じ財布：オープンソースモデルは **FloTime**、
  Partner Nodes（Nano Banana等のクローズドAPI）は **$残高**。
  ここで使うワークフローはすべてオープンソース系＝FloTimeのみ消費。

## セットアップ（1回だけ）

1. Floyoで次の2本を**フォーク保存**する：
   - Camera Angle Control with Qwen
   - LTX2.3 Start-End Frame (opensauce)
2. 各ワークフローの **Copy API Snippet** から、**APIキー以外**（エンドポイントURL・
   HTTPメソッド・入力フィールド名・ポーリング方法）を `workflows.json` に記入する。
   マニフェスト（`manifests/*.json`）の `inputs` キー名もSnippetの実名に合わせる。
3. `cp tools/floyo/.env.example tools/floyo/.env` して `FLOYO_API_KEY` を記入
   （**チャット・コミットに載せない**。`.env` はgitignore対象）。

## 実行

```bash
# 送信内容の確認（APIを呼ばない）
node tools/floyo/run.mjs --workflow qwen-angle --batch tools/floyo/manifests/qwen-angle-test.json --dry-run

# 本実行
node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow qwen-angle --batch tools/floyo/manifests/qwen-angle-test.json
node --env-file=tools/floyo/.env tools/floyo/run.mjs --workflow ltx-startend --batch tools/floyo/manifests/ltx-startend-test.json
```

結果は `tools/floyo/results/` にJSONで保存される。
**合格した出力は `works/hashikko-bill/generated.json` に追記**（台帳の一元管理を維持）。

## どこで実行するか

- **ローカルPC推奨**（`tools/fal` と同じ運用）。作業コンテナのネットワークポリシーは
  `floyo.ai` 系ホストを弾くため、コンテナからは直接呼べない。
- コンテナから回したい場合は、Claude Code環境設定のネットワーク許可リストに
  `floyo.ai` / `api.floyo.ai` を追加し、環境変数 `FLOYO_API_KEY` を登録する。

## 運用ルール（三層分業）

| 層 | 役割 |
|---|---|
| Higgsfield（MiniMax H3） | 本線I2V：芝居・雰囲気。コンテの `i2v_prompt`＋`gen_sec` をそのまま送る |
| SJinn（seedance2） | H3不調カットの救済・スチル増産（MCP接続済み） |
| Floyo（本ツール） | ①Qwenで別アングル・終了フレーム製造 ②LTX2.3 Start-Endで終わり姿勢固定カットの補間 |

- **Start-End向きのカット**（終わり姿勢が決まっている）：
  C70b（判押し）・C77b/C77・C52・C74・C75・C09・C61
- **Qwenアングルの用途**：編集用の切り返し増産（例 C17俯瞰・C64煽り）と、
  Start-End用の終了フレーム生成（例 C70bの「判を押し切った姿勢」）
- **禁止**：文書クローズアップ（架空文字カット）へのアングル変更・部分修正
  （グリフが崩れる）。実在文字が読めてしまう出力は不合格。
- 予備札（必要時のみフォークして `workflows.json` に追記）：
  Wan 2.2 14B I2V+End Frame（予備I2V）／Qwen Image Edit 2509（部分修正）／
  SeedVR2 Upscale（採用分のみ）／Wan2.2 Fun+RealismBoost（V2V補正）
- FloTime残量は少ない（数十本ぶん）。**テスト→本数を絞って本番**の順で使う。
