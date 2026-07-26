#!/bin/bash
# セッション開始時に依存関係を用意するフック
# ------------------------------------------------------------
# このコンテナは毎回まっさらで起動するため、node_modules が空の状態から始まります。
# anime.js（LP・パネル用）と playwright（スクショ確認用）をここで入れておくことで、
# セッション開始直後から `npm run build` / `npm run shot` が使える状態になります。
set -euo pipefail

# ローカルMacでは不要なのでスキップ（Claude Code on the web でのみ実行）
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Chromium はこの環境に焼き込み済みなので、再ダウンロードさせない
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

npm install --no-audit --no-fund

echo "依存関係の準備が完了しました（npm run build / npm run shot が使えます）"
