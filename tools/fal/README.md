# Fal API 画像生成（このリポジトリの既定手段）

**画像生成は Fal を最優先で使う。** その実行スクリプトがこれ。
依存ゼロ（Node標準のみ）で、単発生成とバッチ生成の両方に対応する。

## 重要：実行はローカルPCで

この作業コンテナはネットワークが許可リスト制で、**`queue.fal.run` への接続を弾く**
（CONNECT に 403 が返る）。Kling と同じ事情なので、**あなたのローカルPCで実行**すること。

## セットアップ

1. https://fal.ai/dashboard/keys で API キーを取得。
2. `tools/fal/.env.example` を `tools/fal/.env` にコピーして `FAL_KEY` を記入（**チャットに貼らない**）。
3. Node 20+ 推奨（`--env-file` を使うため）。

## 使い方

```bash
# 単発
node --env-file=tools/fal/.env tools/fal/generate.mjs "a crooked seven-story building swallowed by fog"

# バッチ（マニフェストの全カットをまとめて生成）
node --env-file=tools/fal/.env tools/fal/generate.mjs --batch works/hashikko-bill/prompts.json

# 失敗したカットだけ再生成
node --env-file=tools/fal/.env tools/fal/generate.mjs --batch works/hashikko-bill/prompts.json --only f3_ukai,b1_hiiragi
```

## マニフェストの形

```jsonc
{
  "model": "fal-ai/flux-pro/v1.1-ultra",   // 省略時は FAL_MODEL → 既定値
  "outDir": "works/hashikko-bill/assets",  // 保存先
  "aspect_ratio": "2:3",                   // 全体の既定
  "style": "…全カットに共通で後置されるスタイル文…",
  "items": [
    { "id": "f7_hikari", "aspect_ratio": "2:3", "prompt": "…このカット固有の指示…" }
  ]
}
```

- `style` は各 `prompt` の**うしろに連結**される。世界観を1か所で管理するための仕組み。
- ファイル名は `outDir/<id>.jpg`。`id` はそのまま素材名になるので命名を揃えておくとよい。
- 同一キャラの別カットで絵柄を揃えたいときは `seed` を固定する（マニフェスト全体 or アイテム個別）。

## 環境変数

| 変数 | 既定 | 用途 |
|---|---|---|
| `FAL_KEY` | （必須） | APIキー |
| `FAL_MODEL` | `fal-ai/flux-pro/v1.1-ultra` | モデルID |
| `FAL_OUT_DIR` | `./out` | 保存先（マニフェストの `outDir` が優先） |
| `FAL_ASPECT` | `1:1` | アスペクト比 |
| `FAL_CONCURRENCY` | `3` | バッチ同時実行数 |
| `FAL_SEED` | （なし） | シード固定 |

アスペクト比は `21:9 16:9 4:3 3:2 1:1 2:3 3:4 9:16 9:21`。

## モデルの選び方

| 用途 | 候補 |
|---|---|
| キーアート・キャラの決め絵 | `fal-ai/flux-pro/v1.1-ultra` |
| 数を出す・ラフ | `fal-ai/flux/dev` |
| 参照画像を渡して一貫性を保つ編集 | `fal-ai/nano-banana/edit` |

> モデルIDは fal 側で追加・改名される。通らなくなったら https://fal.ai/models で確認して
> `FAL_MODEL` かマニフェストの `model` を差し替える。

## エラーの読み方

- `submit 401` → `FAL_KEY` が未設定か無効。
- `submit 404` → モデルIDが違う（改名・廃止の可能性）。
- `submit 403` / `CONNECT tunnel failed` → ネットワークで弾かれている。ローカルPCで実行する。
- `timeout (10min)` → 混雑。`--only <id>` で該当カットだけ再試行する。
