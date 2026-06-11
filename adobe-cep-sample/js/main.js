/**
 * パネルのロジック。
 * - UIの動きは AP.*（lib/animations.js のプリセット）に集約。
 * - After Effects の操作は CEP.evalScript で hostscript.jsx の関数を呼ぶ。
 */
(function () {
  const statusEl = document.getElementById('status');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  // 1) パネルを開いたらUIを順に出現させる
  AP.fadeInUp('#head');
  AP.fadeInUp('#info-card', { delay: 100 });
  AP.fadeInUp('#add-card', { delay: 200 });

  // 2)「コンポ情報を取得」
  document.getElementById('btn-info').addEventListener('click', async (e) => {
    AP.pop(e.currentTarget);
    setStatus('取得中…');
    try {
      const json = await CEP.evalScript('getCompInfo()');
      const data = JSON.parse(json);
      if (!data.ok) { setStatus(data.message, 'err'); return; }

      // コンポ名はフェードで差し替え
      const nameEl = document.getElementById('comp-name');
      nameEl.textContent = data.name;
      AP.fadeIn(nameEl);

      // 数字はカウントアップで表示（anime.jsの見せ場）
      AP.countUp('#layer-count', data.layerCount);
      AP.countUp('#duration', data.durationSec);

      setStatus(`${data.width}×${data.height} / ${data.frameRate}fps`, 'ok');
    } catch (err) {
      setStatus('エラー: ' + err.message, 'err');
    }
  });

  // 3)「テキストレイヤーを追加」
  document.getElementById('btn-add').addEventListener('click', async (e) => {
    AP.pop(e.currentTarget);
    const text = document.getElementById('text-input').value || 'Hello anime.js';
    // ExtendScript に文字列を安全に渡す（JSON.stringifyで引用符をエスケープ）
    const arg = JSON.stringify(text);
    setStatus('追加中…');
    try {
      const json = await CEP.evalScript(`addTextLayer(${arg})`);
      const data = JSON.parse(json);
      if (!data.ok) { setStatus(data.message, 'err'); return; }
      AP.countUp('#layer-count', data.layerCount);
      setStatus(`追加しました: ${data.name}`, 'ok');
    } catch (err) {
      setStatus('エラー: ' + err.message, 'err');
    }
  });

  // ブラウザ単体で開いたとき用の注記（CEP外）
  if (!window.__adobe_cep__) {
    setStatus('※ ブラウザ単体表示中。AE操作はAEのパネルとして開くと有効になります。');
  }
})();
