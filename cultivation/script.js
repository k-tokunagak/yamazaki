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

  // メニュー内のリンク → 閉じてからナビゲート
  menu.querySelectorAll('a[data-menu-link]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const href = a.getAttribute('href') || '';
      const isHashOnly = href.charAt(0) === '#';
      const isSamePage = href === './cultivation.html' || href === 'cultivation.html';
      if (isHashOnly) {
        e.preventDefault();
        closeMenu();
        setTimeout(function() {
          const target = document.querySelector(href);
          if (target) {
            const y = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 180);
      } else if (isSamePage) {
        e.preventDefault();
        closeMenu();
        setTimeout(function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 180);
      } else {
        // 別ページ → 閉じてからリンク先に遷移
        e.preventDefault();
        closeMenu();
        setTimeout(function() {
          window.location.href = href;
        }, 250);
      }
    });
  });

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
  function update() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 140) fab.classList.add('is-visible'); else fab.classList.remove('is-visible');
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

 // Nav scroll
  const nav = document.getElementById('main-nav');
  const backTop = document.getElementById('backTop');
  if (nav) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      if (backTop) backTop.classList.toggle('show', y > 400);
    }, { passive: true });
  }

  // Reveal on scroll
  const allReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });
  allReveal.forEach(el => io.observe(el));

  // Full-width image parallax trigger
  const fwImgs = document.querySelectorAll('.cult-fullwidth-img');
  const fwObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('in-view', e.isIntersecting);
    });
  }, { threshold: 0.05 });
  fwImgs.forEach(el => fwObs.observe(el));

  // Smooth scroll
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