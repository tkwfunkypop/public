# Anime.js × After Effects — CEPパネル サンプル

After Effects の CEPパネルで、**UIの動きを anime.js（プリセット `AP.*`）で付けつつ、ExtendScript で実際にAEを操作する**最小サンプルです。

## できること

- パネルを開くと各セクションがふわっと出現（`AP.fadeInUp`）
- 「コンポ情報を取得」→ アクティブコンポの名前・レイヤー数・尺を取得し、**数字をカウントアップ表示**（`AP.countUp`）
- 「テキストレイヤーを追加」→ アクティブコンポに実際にテキストレイヤーを作成

## 構成

```
adobe-cep-sample/
├─ CSXS/manifest.xml   … 拡張の定義（対象アプリ=AEFT, パネルサイズ等）
├─ index.html          … パネルのUI
├─ css/style.css       … AEに馴染むダークテーマ
├─ js/cep.js           … ExtendScriptを呼ぶ最小ラッパー(evalScript)
├─ js/main.js          … パネルのロジック（UI=AP.* / AE操作=CEP.evalScript）
├─ jsx/hostscript.jsx  … AE側で動くExtendScript（getCompInfo / addTextLayer）
├─ lib/anime.umd.min.js … anime.js本体（オフラインでも動くよう同梱）
├─ lib/animations.js   … プリセット集（リポジトリ共通の AP.* と同じ）
└─ .debug              … 開発時のデバッグ用（localhost:8088）
```

> 設計のキモ: **見た目の動き＝anime.js / アプリ操作＝ExtendScript** と役割を分離。
> 同じ作りで Illustrator(ILST)・Premiere(PPRO)・Photoshop(PHXS) にも展開できます（manifestの `Host Name` を変えるだけ）。

## インストール手順

### 1. 署名なし拡張を許可する（PlayerDebugMode）

開発中の未署名パネルを読み込めるようにします。**AEを終了した状態**で:

- **Mac**（ターミナル）: お使いのCEPバージョンに合わせて実行（複数打ってOK）
  ```bash
  defaults write com.adobe.CSXS.11 PlayerDebugMode 1
  defaults write com.adobe.CSXS.12 PlayerDebugMode 1
  killall cfprefsd
  ```
- **Windows**（レジストリ）: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`（および `.12`）に
  文字列値 `PlayerDebugMode` を作り、値を `1` にする。

### 2. パネルを配置する

`adobe-cep-sample` フォルダごと、CEP拡張ディレクトリにコピー:

- **Mac**: `~/Library/Application Support/Adobe/CEP/extensions/`
- **Windows**: `%APPDATA%\Adobe\CEP\extensions\`

### 3. AEで開く

After Effects を起動し、メニュー **ウィンドウ → エクステンション → Anime.js Sample**。

## 使い方

1. 適当なコンポを開く（アクティブにする）
2. 「コンポ情報を取得」を押す → 数字がカウントアップ
3. テキストを入れて「アクティブコンポに追加」→ レイヤーが作られる

## 動かないとき

- パネルが一覧に出ない → PlayerDebugMode（手順1）とフォルダ位置（手順2）を再確認。
  バージョン番号（CSXS.11/12等）はお使いのAEに合わせて。
- UIは出るがボタンが効かない → コンポがアクティブか確認。
  デバッグは Chrome で `http://localhost:8088` を開くとパネルのコンソールが見える。

## ブラウザでのUI確認

AEなしでも、UIとanime.jsの動きだけは普通のブラウザで確認できます
（AE操作部分は「ブラウザ単体表示中」と出て無効になります）。
