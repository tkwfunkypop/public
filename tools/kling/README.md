# Kling 公式API 連携（image2video）

あなたが持っている **Kling 公式API** で、画像から「揺れの少ない」動画を生成するためのスクリプトです。
依存ゼロ（Node標準のみ）。`generate.mjs` 一本で完結します。

## なぜ別スクリプトなのか

- これまでの動画は Higgsfield 経由の Kling でした。今回は**あなたの公式APIキー**を直接使います。
- この作業コンテナはネットワークが許可リスト制で **`api.klingai.com` を弾く**ため、
  このスクリプトは **あなたのローカルPC**（またはKlingへ到達できる環境）で実行してください。

## セットアップ

1. Kling のデベロッパー管理画面で **AccessKey / SecretKey** を取得。
2. 認証情報を環境変数で渡す（**チャットに貼らない**）。どちらかの方法で:
   - シェルで `export KLING_ACCESS_KEY=... KLING_SECRET_KEY=...`
   - または `tools/kling/.env.example` を `tools/kling/.env` にコピーして記入し、実行時に `--env-file` で渡す。
3. Node 20+ 推奨（`--env-file` を使う場合）。

## 使い方

```bash
# 起点画像 = URL の場合
node --env-file=tools/kling/.env tools/kling/generate.mjs "https://example.com/hero.png"

# 起点画像 = ローカルファイルの場合（自動でbase64化）
node --env-file=tools/kling/.env tools/kling/generate.mjs ./lp/assets/hero.png

# 完成動画をそのまま保存したい場合
KLING_OUT=./lp/assets/hero.mp4 node --env-file=tools/kling/.env tools/kling/generate.mjs ./lp/assets/hero.png
```

実行すると、タスクIDを受け取り、完成までポーリングして動画URL（と任意で保存先）を表示します。

## 「揺れ」を抑える設計

今回の上下のゆらぎ対策として、既定で次を入れています:

- `camera_control`: `type: simple` で**カメラを固定し、ゆっくりズーム（push-in）だけ**を許可（`KLING_ZOOM` で量を調整、既定3）。
- `negative_prompt`: `camera shake / wobble / vertical movement / bouncing …` を明示的に抑制。
- `prompt`: 「三脚固定・ごく僅かなpush-inのみ」と指示。
- `mode: pro`（既定）で品質と安定性を優先。

> もし `camera_control` 非対応のモデルでエラーになる場合は `KLING_CAMERA=off` で再実行してください
> （その場合はプロンプト＆ネガティブプロンプトのみで安定化）。

## モデル名（環境により利用可否が異なります）

`kling-v2-6` / `kling-v2-5-turbo` / `kling-v2-1` / `kling-v2-master` / `kling-v1-6` など。
既定は `kling-v2-1`。`KLING_MODEL` で変更できます。

## 生成後：LPへの差し込み

完成した `hero.mp4` を `lp/assets/` に置く（または公開URLにする）と、ヒーロー背景を動画に戻せます。
`lp/ae-short-course.html` の `.hero-media` を、`<img>` から下記の `<video>` に差し替えるだけです:

```html
<video autoplay muted loop playsinline preload="auto"
       poster="（ポスター画像のURL/パス）">
  <source src="（hero.mp4 のURL/パス）" type="video/mp4" />
</video>
```

差し替えは私の方でもできます。動画ができたら声をかけてください。
