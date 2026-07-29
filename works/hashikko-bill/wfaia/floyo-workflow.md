# Floyo ワークフロー仕様 — WFAIA提出用

WFAIAは**作品提出と同時にFloyoワークフローを1点以上提出することが必須**。
このファイルは、Floyo（ブラウザ版ComfyUI）上で組むワークフローの設計書。
アニメ部門・広告部門の両方に同じワークフローを添付する。

## ワークフロー名（提出用）

`hashikko-i2v-stopmotion` — CANON準拠スチルからストップモーション調カットを起こすI2Vライン

## グラフ構成

```
[1] Load Image（開始フレーム）
      │
[2] Resize / Pad → 目標アスペクト（16:9 or 9:16）
      │    単体キャラ2:3 → 16:9 は左右アウトペイント系ノード
      │    （Flux Fill / 任意のoutpaintノード。生成済みフレームはスキップ可）
      │
[3] Image-to-Video ノード
      │    Kling 2.x / Wan 2.x など。モデルは固定しない（Floyoはモデル差し替え自由）
      │    ・duration: 5s
      │    ・prompt: ショット表の motion + 共通サフィックス（下記）
      │    ・negative: morphing, redesign, extra facial features, text, watermark
      │
[4] フレーム処理（ストップモーション化）
      │    24fps出力 → 2コマ打ち化：偶数フレームを間引いて各フレームを2連持続
      │    （Select Every Nth Frame → Frame Duplicate、または fps=12 で出力して
      │      編集段階で24fpsタイムラインに置く）
      │
[5] Film Grain ノード（弱〜中。既存スチルの粒子感に合わせる）
      │
[6] Video Combine / 書き出し（ProRes or 高ビットレートmp4）
```

## 共通プロンプトサフィックス（[3]に毎回後置）

> Handcrafted stop-motion puppet animation, shot on twos at 12fps with subtle
> frame-to-frame armature jitter, fabric and felt texture preserved, practical
> miniature set lighting, film grain, static camera unless specified.
> Keep the exact puppet design from the start frame — no morphing, no redesign,
> no added facial features.

## 運用ルール

- **1ショット＝1ラン**。ラン名にショットID（`a02_hiiragi` 等）を付ける。
  Floyoのラン履歴がそのまま制作ログになり、審査の「プロセス評価」への提出物になる。
- リテイクは同ランを複製してプロンプトのみ変更（seedを振り直す）。
- 開始フレームのURLは `../generated.json` が正。
- 大和・雲井・李・トメ・鵜飼は**顔にパーツを足させない**のが最重要。
  I2Vが顔を「補完」しがちなので、negative と共通サフィックスを絶対に外さない。

## 提出時に添える説明（下書き）

> 全カットの開始フレームは、キャラクター正本（CHARACTER BIBLE）を参照画像として
> 生成し、正本と1体ずつ照合・検品したもの。本ワークフローはその開始フレームから
> ストップモーション調の動きを起こす共通ラインで、全ショットをこの1本で生成した。
> ラン履歴＝ショット履歴として保存している。
