/**
 * Anime.js プリセット集 (v4 / AP = Anime Presets)
 * ------------------------------------------------------------
 * 名前を呼ぶだけでよく使う動きを再生するためのヘルパー集です。
 * LP やパネルUIに「ここに fadeInUp かけて」だけで組み込めます。
 *
 * 【使い方】HTML で anime.js(UMD) を読み込んだ後、このファイルを読み込む:
 *   <script src="https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.umd.min.js"></script>
 *   <script src="./lib/animations.js"></script>
 * すると window.AP に各プリセットが入ります。
 *
 * どのプリセットも第2引数 opts で anime.js のパラメータを上書きできます。
 *   AP.fadeInUp('.hero', { duration: 1200, delay: 200 })
 */
(function (global) {
  const anime = global.anime;
  if (!anime) {
    console.error('[AP] anime.js が読み込まれていません。先に anime.umd.min.js を読み込んでください。');
    return;
  }
  const { animate, stagger, svg } = anime;

  const AP = {
    /** ふわっと下から出現（見出し・画像・セクションの定番） */
    fadeInUp(targets, opts = {}) {
      return animate(targets, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        ease: 'outQuad',
        ...opts,
      });
    },

    /** その場でフェードイン */
    fadeIn(targets, opts = {}) {
      return animate(targets, { opacity: [0, 1], duration: 600, ease: 'outQuad', ...opts });
    },

    /** ポンと一度だけ強調（クリック時のCTAなどに） */
    pop(targets, opts = {}) {
      return animate(targets, { scale: [1, 1.12, 1], duration: 420, ease: 'inOutQuad', ...opts });
    },

    /** 注目を引く脈打ち（ループ。常時動かしたいCTAボタンに） */
    pulse(targets, opts = {}) {
      return animate(targets, { scale: [1, 1.05, 1], duration: 1200, loop: true, ease: 'inOutSine', ...opts });
    },

    /** 複数要素を時間差で順番に出現（特徴リスト・カードなど） */
    staggerReveal(targets, opts = {}) {
      const { each = 80, ...rest } = opts;
      return animate(targets, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(each),
        duration: 600,
        ease: 'outQuad',
        ...rest,
      });
    },

    /**
     * 数字をカウントアップ。実績・人数・金額の訴求に。
     * 目標値は 引数 to か、要素の data-to 属性で指定。
     *   <span class="stat" data-to="1280">0</span>
     *   AP.countUp('.stat', null, { suffix: '名' })
     */
    countUp(target, to, opts = {}) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      const end = to != null ? to : Number((el.dataset.to || el.textContent).replace(/[^0-9.]/g, ''));
      const { prefix = '', suffix = '', ...rest } = opts;
      const obj = { n: 0 };
      return animate(obj, {
        n: end,
        duration: 1600,
        ease: 'outExpo',
        ...rest,
        onUpdate: () => { el.textContent = prefix + Math.round(obj.n).toLocaleString() + suffix; },
      });
    },

    /** SVGパスを手書き風に描く（ロゴ・チェックマーク・下線など） */
    drawSVG(targets, opts = {}) {
      const drawables = svg.createDrawable(targets);
      return animate(drawables, { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuad', ...opts });
    },

    /**
     * 【LPの主役】スクロールして画面に入った瞬間にアニメを実行。
     *   AP.onScroll('.reveal')                       // 既定で fadeInUp
     *   AP.onScroll('.stat', el => AP.countUp(el))   // カスタム動作も渡せる
     *   AP.onScroll('.card', el => AP.staggerReveal(el.children))
     */
    onScroll(selector, animFn, opts = {}) {
      const els = document.querySelectorAll(selector);
      const run = animFn || ((el) => AP.fadeInUp(el));
      // 既定動作のときは、出現前に隠してチラつきを防ぐ
      if (!animFn) els.forEach((el) => { el.style.opacity = '0'; });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: opts.threshold != null ? opts.threshold : 0.2 });
      els.forEach((el) => io.observe(el));
      return io;
    },
  };

  global.AP = AP;
  if (typeof module !== 'undefined' && module.exports) module.exports = AP;
})(typeof window !== 'undefined' ? window : this);
