# 動画コンテ（アニマティック） — はしっこビルの明日づくり

絵コンテ78カット（全299秒＝4分59秒）を、**カットごとの実尺どおり**に並べた
動画コンテのRemotionプロジェクト。1920×1080 / 30fps。

各カットには以下をオーバーレイ表示する。

- 上部：カット番号（C01〜C78）／シーケンス名／サイズ（FS・MS・UP等）／実尺とタイムコード
- 上部2行目：アクション（ト書き）、あれば ※ノート
- 下部中央：セリフ・ナレーション（字幕）
- 最下部：全体プログレスバー（校正朱 `#C2493C`）と経過タイムコード
- 静止画には1カット内で 1.00→1.03 の緩いプッシュインを付与
- **音声**：全26カット・27クリップの仮ナレ・仮アフレコ（seed_audio TTS）。
  ナレーター=Arthur／ひかり=Emily／トメ=Mabel／雲井=Simone／黒金=Gideon／
  鵜飼=Julian／柊=Alistair／鏑木=Marcus／李=Luna。
  長い台詞はカットで切らず次カットへ流す（グローバル音声トラック）

## レンダリング手順（ローカルPCで実行）

> **注意：** この作業コンテナはパネル画像のCDN（cloudfront.net）を
> ネットワークポリシーで弾くため、**レンダはローカルPCで行う**。
> リポジトリを pull してから：

```bash
cd works/hashikko-bill/animatic
npm install
npm run dev      # Remotion Studio でプレビュー（http://localhost:3000）
npm run render   # out/animatic.mp4 に書き出し（約5分尺）
```

## データの流れ

```
../storyboard/storyboard.json（78カット・実尺・セリフ・ノート）
../generated.json（storyboard_panel のパネル画像URL）
        │  npm run data（scripts/build-data.mjs）
        ▼
src/cuts.json  →  src/Animatic.tsx が実尺どおりに再生
```

絵コンテ側（カット尺・セリフ・パネル差し替え）を更新したら `npm run data` で
`src/cuts.json` を再生成してからプレビュー／レンダする。

## 構成

| ファイル | 役割 |
|---|---|
| `src/cuts.json` | カットデータ（生成物。コミット済みなので install 直後でも動く） |
| `src/Animatic.tsx` | 本体。Series でカットを実尺連結＋オーバーレイ |
| `src/Root.tsx` | Composition 定義（総フレーム数は cuts.json から算出） |
| `scripts/build-data.mjs` | storyboard.json + generated.json → cuts.json |

## 今後の差し替え

- 声を録り直す場合は `generated.json` の `kind: narration_audio` の `url` を
  差し替えて `npm run data`（`cut`＝カット番号、`at`＝カット内オフセット秒）
- 環境音・音楽も同じく `<Audio>` の追加で載る
- パネルをI2Vの動画に差し替える場合は cuts.json の `url` を動画URLにし、
  `<Img>` を `<OffthreadVideo>` に置き換える
