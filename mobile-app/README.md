# 高橋帝国 モバイルアプリ

React Native / Expo で作った会員向け学習アプリです。

## セットアップ

```bash
cd mobile-app
npm install
npx expo start
```

QRコードをExpo Goアプリで読み込むと実機確認できます。

## 動画URLの設定

`src/data/courseData.js` を開いて各レッスンの `videoId` / `videoUrl` を差し替えてください。

| フィールド | 説明 |
|---|---|
| `videoType: 'youtube'` | YouTube動画。`videoId` に動画IDを設定 |
| `videoType: 'mp4'` | MP4直リンク。`videoUrl` にURLを設定 |

## 認証のセットアップ（Supabase）

1. Supabase でプロジェクトを作成
2. `src/context/AuthContext.js` の以下を書き換え：
   - `YOUR_SUPABASE_URL` → プロジェクトURL
   - `YOUR_SUPABASE_ANON_KEY` → anonキー
3. `signIn` 関数内のコメントアウトを外し、モック実装を削除

## ビルド（App Store / Play Store 配信）

```bash
# EASクラウドビルド（要Expoアカウント）
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## 画面構成

```
ログイン画面
  └── メインタブ
        ├── コース（タブ1）
        │     ├── モジュール一覧（14モジュール）
        │     │     └── レッスン一覧
        │     │           └── レッスン再生（YouTube / MP4）
        │     └── ...
        └── マイページ（タブ2）
```
