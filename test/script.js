
/* ===========================================================
   ===== モバイルメニュー & FAB 制御 =========================
   =========================================================== */
(function() {
  const ham      = document.getElementById('navHamburger');
  const menu     = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  const closeBtn = document.getElementById('mobileMenuClose');
  if (!ham || !menu || !backdrop) return;

  let savedScrollY = 0;
  let isOpen = false;

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.classList.add('menu-open');
    menu.classList.add('is-open');
    backdrop.classList.add('is-open');
    ham.classList.add('is-active');
    ham.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    ham.classList.remove('is-active');
    ham.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    // 元のスクロール位置を復元
    window.scrollTo(0, savedScrollY);
  }

  ham.addEventListener('click', function(e) {
    e.preventDefault();
    if (isOpen) closeMenu(); else openMenu();
  });
  closeBtn && closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeMenu();
  });
  backdrop.addEventListener('click', closeMenu);

  // メニュー外クリックで閉じる（念のため）— 実質backdropで処理されるが ESC も対応
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // メニュー内のアンカーリンクをクリック → 一旦閉じてから滑らかにスクロール
  menu.querySelectorAll('a[data-menu-link]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') {
        // 外部ページへの遷移：先にメニューを閉じてから遷移
        closeMenu();
        return;
      }
      e.preventDefault();
      const target = document.querySelector(href);
      closeMenu();
      // メニューを閉じてから少し遅らせてスクロール
      setTimeout(function() {
        if (target) {
          const y = target.getBoundingClientRect().top + window.pageYOffset - 0;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (href === '#hero' || href === '#top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 180);
    });
  });

  // リサイズでPCに戻ったら閉じる
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && isOpen) closeMenu();
  });
})();

/* ===========================================================
   ===== フローティング お問い合わせボタン =================
   =========================================================== */
(function() {
  const fab = document.getElementById('fabContact');
  if (!fab) return;
  const contactSection = document.getElementById('contact');

  function update() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    // 100px以上スクロールしたら表示
    if (y > 140) {
      fab.classList.add('is-visible');
    } else {
      fab.classList.remove('is-visible');
    }
    // contactセクションが画面に入ったら隠す（重複導線を避ける）
    if (contactSection) {
      const rect = contactSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6;
      fab.classList.toggle('at-contact', inView);
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  // クリック時：スムーススクロール（既存のa[href^="#"]ハンドラに任せず明示）
  fab.addEventListener('click', function(e) {
    if (!contactSection) return;
    e.preventDefault();
    const y = contactSection.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();


  // ===== STORY CHARACTER: 黒背景除去 =====
  (function() {
    const canvas = document.getElementById('storyCharacterCanvas');
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = './tochiaika_character2.png';

    img.onload = function() {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width  = w;
      canvas.height = h;
      canvas.style.width  = '320px';
      canvas.style.height = (320 * h / w) + 'px';

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      /**
       * 黒背景除去アルゴリズム
       * この画像の特徴：
       *   - 背景：純粋な黒 (R≈0, G≈0, B≈0)
       *   - キャラクター：白・グレー・黒服・赤いちご
       * 戦略：
       *   - 彩度が低く、かつ非常に暗いピクセル → 背景と判定して透明化
       *   - ただし黒い服（ダークグレー）はキャラクターの一部 → 保持
       * キーポイント：背景の黒はほぼ完全な黒(max < 15)
       *              黒服はやや明るい(max 30〜80程度)
       */
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        // 彩度（0〜1）
        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

        if (maxC < 12) {
          // ほぼ純粋な黒 → 完全に透明（背景）
          data[i + 3] = 0;
        } else if (maxC < 30 && sat < 0.15) {
          // 非常に暗い無彩色 → フェードアウトでエッジを滑らかに
          const alpha = Math.round((maxC - 12) / 18 * 180);
          data[i + 3] = Math.max(0, Math.min(255, alpha));
        }
        // それ以外（黒服・白顔・赤いちご等）はそのまま保持
      }

      ctx.putImageData(imageData, 0, 0);
    };

    img.onerror = function() {
      canvas.style.display = 'none';
    };
  })();

  // ===== 疑似PARALLAX（スマホ対応） =====
  (function() {
    const bg = document.getElementById('parallaxBg');
    const section = document.querySelector('.parallax');
    if (!bg || !section) return;

    function updateParallax() {
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      bg.classList.toggle('visible', inView);
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    updateParallax();
  })();

  // Nav scroll
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('backTop').classList.toggle('show', window.scrollY > 400);
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Contact tabs
  const tabs = document.querySelectorAll('.tab-btn');
  const biz = document.querySelectorAll('.business-fields');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isBiz = tab.dataset.tab === 'business';
      biz.forEach(f => f.classList.toggle('show', isBiz));
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Form submit feedback
  document.querySelector('.btn-submit').addEventListener('click', function() {
    this.textContent = '送信しました ✓';
    this.style.background = 'var(--green)';
    setTimeout(() => {
      this.innerHTML = '<span>送信する</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      this.style.background = '';
    }, 3000);
  });
  /* ─── 営業日カレンダー生成 ─── */
(function() {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const monthLabel = document.getElementById('cal-month-label');
  if (!monthLabel) return; // 旧式カレンダーUIが存在しない場合は何もしない
  monthLabel.textContent = year + '年 ' + monthNames[month];

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // シーズン外チェック (6月〜10月は休業)
  const isOffSeason = (month >= 5 && month <= 9);

  const headers = ['日','月','火','水','木','金','土'];
  const headerClasses = ['sun','','','','','','sat'];
  const grid = document.getElementById('shop-calendar');
  if (!grid) return;

  // ヘッダー行
  headers.forEach((h, i) => {
    const d = document.createElement('div');
    d.className = 'shop-cal-day-header' + (headerClasses[i] ? ' ' + headerClasses[i] : '');
    d.textContent = h;
    grid.appendChild(d);
  });

  // 空セル
  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.className = 'shop-cal-day empty';
    grid.appendChild(e);
  }

  // 日付セル
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow  = date.getDay(); // 0=Sun, 1=Mon
    const cell = document.createElement('div');

    const isToday   = (d === today.getDate());
    const isMonday  = (dow === 1);
    const isSunday  = (dow === 0);
    const isSaturday= (dow === 6);
    const isClosed  = isOffSeason || isSunday;

    let cls = 'shop-cal-day';
    if (isToday)    cls += ' today';
    else if (isClosed) cls += ' closed';
    else            cls += ' open';
    if (isMonday && !isToday && !isClosed)  cls += ' mon-day';
    if (isSaturday && !isToday) cls += ' sat-day';

    cell.className = cls;
    cell.textContent = d;
    grid.appendChild(cell);
  }
})();
