/**
 * CEP ヘルパー — ホスト(After Effects)の ExtendScript を呼ぶための最小ラッパー。
 * Adobe公式の CSInterface.js を使わず、CEPが注入する window.__adobe_cep__ を直接使う。
 * これだけで evalScript は十分動くので、依存を増やさずに済む。
 */
window.CEP = {
  /**
   * ExtendScript を実行し、戻り値(文字列)を Promise で受け取る。
   *   const json = await CEP.evalScript('getCompInfo()');
   */
  evalScript(script) {
    return new Promise((resolve, reject) => {
      if (!window.__adobe_cep__) {
        reject(new Error('CEP環境ではありません（ブラウザ単体では evalScript は使えません）'));
        return;
      }
      window.__adobe_cep__.evalScript(script, (result) => resolve(result));
    });
  },

  /** ホストアプリのIDなどを取得（参考用） */
  getHostEnvironment() {
    if (!window.__adobe_cep__) return null;
    try {
      return JSON.parse(window.__adobe_cep__.getHostEnvironment());
    } catch (e) {
      return null;
    }
  },
};
