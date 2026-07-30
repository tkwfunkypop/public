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
      const ratio = opts.threshold != null ? opts.threshold : 0.2;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // 画面より背の高い要素は threshold（要素比）に届かないため、見えた時点で発火する
          const tall = entry.boundingClientRect.height > window.innerHeight * 0.8;
          if (entry.intersectionRatio >= ratio || tall) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: [0, ratio] });
      els.forEach((el) => io.observe(el));
      return io;
    },

    /**
     * スクロール視差（パララックス）。要素が画面内にある間、本文と違う速さで上下に動かし奥行きを出す。
     * 強さは data-speed か opts.speed（目安 -0.3〜0.3。マイナスでゆっくり後追い）。
     *   AP.parallax('.ghost-num')        // 既定 -0.15
     *   <div class="ghost-num" data-speed="-0.25">01</div>
     */
    parallax(selector, opts = {}) {
      const els = Array.prototype.slice.call(document.querySelectorAll(selector));
      if (!els.length) return null;
      const base = opts.speed != null ? opts.speed : -0.15;
      let ticking = false;
      const update = () => {
        const vh = window.innerHeight;
        els.forEach((el) => {
          const speed = el.dataset.speed != null ? parseFloat(el.dataset.speed) : base;
          const rect = el.getBoundingClientRect();
          const offset = rect.top + rect.height / 2 - vh / 2;
          el.style.transform = 'translate3d(0,' + (offset * speed).toFixed(1) + 'px,0)';
        });
        ticking = false;
      };
      const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
      return { update };
    },

    /**
     * ゆっくり漂うアンビエント動作（背景の光・装飾向け。ループで往復）。
     *   AP.drift('.glow', { x: 40, y: -30, scale: 1.15, duration: 11000 })
     */
    drift(targets, opts = {}) {
      return animate(targets, {
        translateX: opts.x != null ? opts.x : 40,
        translateY: opts.y != null ? opts.y : -30,
        scale: opts.scale != null ? opts.scale : 1.15,
        duration: opts.duration != null ? opts.duration : 9000,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    },
  };

  global.AP = AP;
  if (typeof module !== 'undefined' && module.exports) module.exports = AP;
})(typeof window !== 'undefined' ? window : this);
