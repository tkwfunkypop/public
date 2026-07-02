# AE早見帳（講座生配布用アプリ）

After Effects のショートカットとエクスプレッションをスマホで検索できる早見帳。
**PWA（インストール型Webアプリ）** として配布できる:

- ホーム画面に追加すると「AE早見帳」アイコンから全画面のアプリとして起動
- Service Worker + ライブラリ同梱（`anime.umd.min.js`）により、**一度開けばオフライン（圏外・機内モード）でも動く**
- App Store / Google Play 不要・無料で配布できる

## 講座生への配布方法

**コミットSHA固定のCDN URL** を配布する（内容が変わらない限り永久キャッシュで安定・高速）。

```
https://rawcdn.githack.com/tkwfunkypop/public/<コミットSHA>/tools/ae-shortcuts/index.html
```

`<コミットSHA>` は配布したい時点の最新コミットのフルSHA（`git rev-parse HEAD` で取得）。

アプリを更新したら、新しいSHAでURLを作り直して再配布する
（SHA固定URLはキャッシュが永久のため、同じURLの中身は更新されない）。

### 講座生向けの案内文テンプレ

> 📱 AE早見帳（ショートカット＆エクスプレッション辞典アプリ）
> 下のリンクをスマホで開いて、ホーム画面に追加してください。
> 一度開けばオフラインでも使えます。
> `<配布URL>`
>
> **インストール方法**
> - **iPhone (Safari)**: 共有ボタン →「ホーム画面に追加」
> - **Android (Chrome)**: メニュー(⋮) →「ホーム画面に追加」（または表示される「インストール」）

## 更新も自動反映させたい場合（推奨・任意）

リポジトリの Settings → Pages を有効化（Branch: 配布したいブランチ / root）すると

```
https://tkwfunkypop.github.io/public/tools/ae-shortcuts/
```

の固定URLで配布でき、**再配布なしで全員のアプリが次回起動時に自動更新される**
（Service Worker が裏で最新を取得する設計のため）。アプリ配布の本命はこちら。

## ネイティブアプリ（ストア配布）にしたい場合

このフォルダがそのままWebViewラッパーの中身になる。
- **Google Play**: [PWABuilder](https://www.pwabuilder.com/) にPagesのURLを入れるとPlay提出用パッケージを生成できる（Google開発者登録 $25）
- **App Store**: Capacitor等でラップしてXcodeから提出（Apple Developer Program 年$99）

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | アプリ本体（データ・UI・デモすべて込み） |
| `sw.js` | オフライン用 Service Worker（キャッシュ優先＋裏で更新） |
| `manifest.webmanifest` | アプリ名・アイコン・全画面表示の定義 |
| `anime.umd.min.js` | anime.js v4 ローカル同梱（オフライン/CSP対応） |
| `icon-*.png` / `apple-touch-icon.png` | ホーム画面アイコン |

※ `../../lib/animations.js`（AP.* プリセット）を参照しているため、
リポジトリ外に単体コピーして配布する場合はそのファイルも同梱すること。

## 開発時のプレビュー

CLAUDE.md 記載のとおり、push 後に
`https://raw.githack.com/tkwfunkypop/public/<branch>/tools/ae-shortcuts/index.html`
