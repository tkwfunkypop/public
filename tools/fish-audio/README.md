# Fish Audio MCP 接続メモ

Fish Audio（<https://fish.audio>）の**公式MCPサーバ**をこのリポジトリに繋いだ。
Claude から直接、音声合成（TTS）・ボイスライブラリの検索・音声の文字起こしができる。

このリポジトリの `.mcp.json`（プロジェクトスコープ）に設定済みなので、
**clone してくれば、どのアカウント・どの端末からでも同じ設定が読み込まれる**。
あとは各端末で1回だけログインすればいい。

---

## 接続情報

| 項目 | 値 |
|---|---|
| エンドポイント | `https://api.fish.audio/mcp` |
| トランスポート | Streamable HTTP |
| 認証 | OAuth（ブラウザでFish Audioアカウントにログイン。**APIキー不要**） |
| 課金 | プランのパッケージクレジットを消費（Web版と同じ。開発者API用クレジットは減らない） |

APIキーを持たない方式なので、**このリポジトリに鍵をコミットする必要がない**。
（CLAUDE.md の「APIキー・トークンはコミットしない」ルールと相性が良い）

---

## 使い始める手順（各端末で1回だけ）

### 1. リポジトリを最新にする

```bash
git pull origin claude/add-animejs-dependency-iqs0v1
```

`.mcp.json` がリポジトリ直下にあることを確認する。

### 2. Claude Code を起動して設定を承認する

```bash
claude
```

プロジェクトスコープの `.mcp.json` は**初回に承認ダイアログが出る**（勝手には繋がらない仕様）。
「Use this MCP server」を選んで承認する。

承認前に `claude mcp list` を叩くと `⏸ Pending approval` と表示される。それが正常。

### 3. OAuth ログイン

Claude Code の中で:

```
/mcp
```

`fish-audio` を選んで認証すると、ブラウザが開く。Fish Audio アカウントでログインすればおしまい。

CLI から直接やる場合:

```bash
claude mcp login fish-audio
```

### 4. 確認

```bash
claude mcp list
```

`fish-audio: https://api.fish.audio/mcp (HTTP) - ✔ connected` になればOK。

---

## 手動でセットアップする場合

`.mcp.json` を使わず、自分の環境だけに入れたいとき:

```bash
# 自分のユーザー全体で使う
claude mcp add --transport http --scope user fish-audio https://api.fish.audio/mcp

# この端末のこのプロジェクトだけ
claude mcp add --transport http fish-audio https://api.fish.audio/mcp
```

Claude Desktop / Cursor など他のMCPクライアントでも、同じURLをHTTP(Streamable)サーバとして登録すれば動く。

---

## できること

- **音声合成（TTS）** — テキストを渡すと音声を生成する。日本語・英語・中国語ほか多言語対応。
- **ボイスライブラリの検索** — Fish Audio 上のボイスモデル（自分でクローンしたものを含む）を一覧・検索する。
- **文字起こし** — 音声ファイルをテキストに変換する。

制作フロー的には、ナレーション生成をこのMCP経由でやると、
`character-sheet-builder` → `ai-video-workflow` の音声パートをClaudeの中で完結できる。

---

## 注意点・ハマりどころ

- **Claude Code on the web（リモート実行環境）からは繋がらない。**
  リモートコンテナは外向き通信がネットワークポリシーで制限されていて、`api.fish.audio` への
  CONNECT が 403 で弾かれる。さらに OAuth はブラウザを開く必要があるので、
  **ローカルの Claude Code（ターミナル / デスクトップアプリ）でログインすること。**
- 認証情報は各端末のローカルに保存される。リポジトリには入らないので、
  **アカウントごと・端末ごとに1回ずつログインが必要**。
- 認証が切れたら `claude mcp login fish-audio` で入れ直す。
  完全にリセットしたいときは `claude mcp logout fish-audio` してからログインし直す。
- クレジットはプランのパッケージ分を消費する。長尺ナレーションを一気に生成する前に残量を確認すること。

---

## 参考リンク

- 公式ドキュメント（MCP）: <https://docs.fish.audio/overview/mcp>
- Fish Audio ブログ（llms.txt / MCP / Agent Skills）: <https://fish.audio/blog/llms-txt-mcp-agent-skills/>
- Fish Audio: <https://fish.audio>
