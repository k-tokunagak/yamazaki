/* ===========================================================
   採用情報ページ — 共通スクリプト
   - モバイルメニュー / FAB / Reveal / Back to top / スムーススクロール
   =========================================================== */

/* ===== モバイルメニュー ===== */
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

  menu.querySelectorAll('a[data-menu-link]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const href = a.getAttribute('href') || '';
      if (href.indexOf('#') !== 0) {
        // 別ページへの遷移 — メニューを閉じてからナビゲートさせる
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

/* ===== フローティング お問い合わせボタン ===== */
(function() {
  const fab = document.getElementById('fabContact');
  if (!fab) return;
  const contactSection = document.getElementById('contact');

  function update() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 140) {
      fab.classList.add('is-visible');
    } else {
      fab.classList.remove('is-visible');
    }
    if (contactSection) {
      const rect = contactSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6;
      fab.classList.toggle('at-contact', inView);
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  fab.addEventListener('click', function(e) {
    if (!contactSection) return;
    e.preventDefault();
    const y = contactSection.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();

/* ===== Nav scroll (採用ページは常に scrolled 状態) ===== */
(function() {
  const nav    = document.getElementById('main-nav');
  const backTo = document.getElementById('backTop');
  if (!nav) return;
  // 採用ページは白背景がベースなので、常時 scrolled スタイル
  nav.classList.add('scrolled');
  window.addEventListener('scroll', function() {
    if (backTo) {
      backTo.classList.toggle('show', window.scrollY > 400);
    }
  }, { passive: true });
})();

/* ===== Reveal on scroll ===== */
(function() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;
  const io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function(el) { io.observe(el); });
})();

/* ===== ページ内アンカーのスムーススクロール ===== */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
})();
