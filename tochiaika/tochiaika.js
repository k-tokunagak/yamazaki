// ナビゲーション: スクロール時のスタイル
(function() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// スクロール時にフェードイン
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ===========================================================
   ===== モバイルメニュー制御（.mm-*）========================
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

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // メニュー内の他ページへの遷移：閉じてから遷移
  menu.querySelectorAll('a[data-menu-link]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') {
        // 外部ページへの遷移
        closeMenu();
        return;
      }
      e.preventDefault();
      const target = document.querySelector(href);
      closeMenu();
      setTimeout(function() {
        if (target) {
          const y = target.getBoundingClientRect().top + window.pageYOffset - 0;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 180);
    });
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && isOpen) closeMenu();
  });
})();


/* ===========================================================
   ===== 上へ戻るボタン & スマホお問い合わせボタン制御 =====
   =========================================================== */
(function() {
  const backTop = document.getElementById('backTop');
  const fab = document.getElementById('fabContact');

  function updateFloatingButtons() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;

    if (backTop) {
      backTop.classList.toggle('show', y > 380);
    }

    if (fab) {
      fab.classList.toggle('is-visible', y > 140);
    }
  }

  window.addEventListener('scroll', updateFloatingButtons, { passive: true });
  window.addEventListener('resize', updateFloatingButtons, { passive: true });
  updateFloatingButtons();

  if (backTop) {
    backTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
