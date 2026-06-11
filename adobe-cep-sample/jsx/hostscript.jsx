/**
 * ExtendScript（ホスト側）— After Effects の中で実行されるコード。
 * パネル(JavaScript)から evalScript で呼び出され、結果を JSON文字列で返す。
 * ※ ここは ES3 相当の ExtendScript なので、let/const/アロー関数は使わない。
 */

/** アクティブコンポの情報を取得 */
function getCompInfo() {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        return JSON.stringify({ ok: false, message: "アクティブなコンポがありません" });
    }
    return JSON.stringify({
        ok: true,
        name: comp.name,
        durationSec: Math.round(comp.duration * 100) / 100,
        frameRate: Math.round(comp.frameRate * 100) / 100,
        layerCount: comp.numLayers,
        width: comp.width,
        height: comp.height
    });
}

/** アクティブコンポにテキストレイヤーを追加 */
function addTextLayer(text) {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        return JSON.stringify({ ok: false, message: "アクティブなコンポがありません" });
    }
    app.beginUndoGroup("Add Text Layer (anime.js sample)");
    var layer = comp.layers.addText(text || "Hello anime.js");
    app.endUndoGroup();
    return JSON.stringify({ ok: true, name: layer.name, layerCount: comp.numLayers });
}
