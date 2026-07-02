# AE早見帳 — iOS / Android ネイティブアプリ

`tools/ae-shortcuts`（Webアプリ本体）を **Capacitor** でラップした
iOS / Android アプリのプロジェクト一式。

- アプリID: `jp.aehayamicho.app` ／ アプリ名: **AE早見帳**
- アイコン・スプラッシュは生成済み（元画像: `assets/logo.png`）
- `android/` は Android Studio、`ios/App/` は Xcode でそのまま開ける
  （iOSはSwift Package Manager構成なのでCocoaPods不要）

## ビルド手順

前提: Node 18+。Androidは [Android Studio](https://developer.android.com/studio)、
iOSは Mac + Xcode 15+。

```bash
cd tools/ae-shortcuts-app
npm install        # Capacitor本体を取得
npm run sync       # Webアプリを www/ に集めて両プラットフォームへ反映
```

### Android

```bash
npx cap open android   # Android Studio で開く
```

- **動作確認**: 実機をUSB接続して ▶ Run（開発者モードが必要）
- **講座生に直接配布（ストア不要）**: Build > Build App Bundle(s)/APK(s) > **Build APK(s)**
  → できた `app-debug.apk` を配って「提供元不明のアプリ」を許可してインストール
- **Google Play配布**: Build > **Generate Signed App Bundle** で `.aab` を作成し
  [Play Console](https://play.google.com/console)（開発者登録 $25・買い切り）へアップロード

### iOS

```bash
npx cap open ios   # Xcode で開く
```

1. `App` ターゲット > Signing & Capabilities で自分のTeamを選択
2. 実機を選んで ▶ Run で動作確認
3. 配布は Product > **Archive** → App Store Connect にアップロード
   - **TestFlight**（審査ほぼなし・最大10,000人・90日ごとに更新）が講座配布に最適
   - App Store公開も同じArchiveから申請できる
   - いずれも [Apple Developer Program](https://developer.apple.com/programs/)（年 $99）が必要

> iOSはAndroidと違い、ストア（またはTestFlight）を通さない一般配布ができない。
> 費用をかけたくない場合は PWA配布（`../ae-shortcuts/README.md`）が現実解。

## アプリを更新するとき

1. `tools/ae-shortcuts/index.html`（Webアプリ本体）を編集
2. `npm run sync` で www/ と各プラットフォームに反映
3. それぞれ再ビルドして配布し直す

## アイコンを変えるとき

`assets/logo.png`（1024×1024）を差し替えて:

```bash
npx @capacitor/assets generate \
  --iconBackgroundColor '#1d1a3f' --iconBackgroundColorDark '#1d1a3f' \
  --splashBackgroundColor '#14141c' --splashBackgroundColorDark '#14141c'
```

## コードサインなしでPlayストア用パッケージを作る別ルート

[PWABuilder](https://www.pwabuilder.com/) に PWA配布URL（GitHub Pages推奨）を入れると、
Playストア提出用のAndroidパッケージをブラウザだけで生成できる。
Android Studioを入れたくない場合はこちらが手軽。
