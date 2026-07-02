# AE早見帳（講座生配布用）

After Effects のショートカットとエクスプレッションをスマホで検索できる早見帳アプリ。
`index.html` 1ファイル完結（UI演出のみ anime.js CDN + `lib/animations.js` を参照）。

## 講座生への配布方法

**コミットSHA固定のCDN URL** を配布する（内容が変わらない限り永久キャッシュで安定・高速）。

```
https://rawcdn.githack.com/tkwfunkypop/public/<コミットSHA>/tools/ae-shortcuts/index.html
```

`<コミットSHA>` は配布したい時点の最新コミットのフルSHA。取得方法:

```
git rev-parse HEAD
```

アプリを更新したら、新しいSHAでURLを作り直して再配布する
（SHA固定URLはキャッシュが永久のため、同じURLの中身は更新されない）。

### 講座生向けの案内文テンプレ

> 📱 AE早見帳（ショートカット＆エクスプレッション辞典）
> 下のリンクをスマホで開いてください。
> `<配布URL>`
>
> ホーム画面に追加するとアプリのように使えます：
> - **iPhone (Safari)**: 共有ボタン →「ホーム画面に追加」
> - **Android (Chrome)**: メニュー(⋮) →「ホーム画面に追加」

## より本格的に運用する場合（任意）

リポジトリの Settings → Pages を有効にすれば
`https://tkwfunkypop.github.io/public/tools/ae-shortcuts/`
という短い固定URLで配布でき、更新も自動反映される（再配布不要になる）。

## 開発時のプレビュー

CLAUDE.md 記載のとおり、push 後に
`https://raw.githack.com/tkwfunkypop/public/<branch>/tools/ae-shortcuts/index.html`
