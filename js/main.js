/* ══════════════════════════════════════════════════════════════
   ANTONY CHANDLER ARCHITECTS
   main.js — Interactions & Animation
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── CUSTOM CURSOR ──────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Scale on interactive elements
  const interactives = 'a, button, .filter-btn, .project-card__link, .featured__link, .cta__btn';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2)';
      cursor.style.opacity   = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity   = '1';
    });
  });
})();

/* ─── NAV — SCROLL BEHAVIOUR ─────────────────────────────────── */
(function initNav() {
  const nav      = document.getElementById('nav');
  const toggle   = document.getElementById('navToggle');
  const overlay  = document.getElementById('navOverlay');
  const overlayLinks = document.querySelectorAll('.overlay-link');

  if (!nav) return;

  // Scroll → glass effect + hide on down / show on up
  let lastY = window.scrollY;
  const onScroll = () => {
    const currentY = window.scrollY;
    nav.classList.toggle('scrolled', currentY > 40);
    if (currentY > lastY && currentY > 120) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastY = currentY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const openMenu = () => {
    toggle.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle?.addEventListener('click', () => {
    toggle.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlayLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Stagger project cards
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.setProperty('--i', i % 3);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  // Stagger items within containers
  const grouped = {};
  items.forEach(el => {
    const parent = el.closest('section') || document.body;
    const key = parent.id || Math.random();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(el);
  });

  Object.values(grouped).forEach(group => {
    group.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.07}s`;
      observer.observe(el);
    });
  });
})();

/* ─── PROJECT FILTER + PAGINATION ───────────────────────────── */
(function initFilter() {
  const buttons    = document.querySelectorAll('.filter-btn');
  const cards      = Array.from(document.querySelectorAll('.project-card'));
  const pagination = document.getElementById('pagination');
  if (!buttons.length || !cards.length) return;

  const PER_PAGE = 6;
  let activeFilter = 'all';
  let activePage   = 1;

  function getFiltered() {
    return cards.filter(c => activeFilter === 'all' || c.dataset.category === activeFilter);
  }

  function renderPagination(total) {
    if (!pagination) return;
    const pages = Math.ceil(total / PER_PAGE);
    pagination.innerHTML = '';
    if (pages <= 1) return;

    const base = 'font-size:13px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; background:transparent; border:none; cursor:pointer; transition:color 0.25s;';

    // Prev
    const prev = document.createElement('button');
    prev.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">west</span> Prev';
    prev.style.cssText = base + 'display:flex; align-items:center; gap:6px; color:' + (activePage === 1 ? '#374151' : '#6b7280') + ';';
    prev.disabled = activePage === 1;
    if (activePage > 1) {
      prev.addEventListener('mouseenter', () => { prev.style.color = '#fff'; });
      prev.addEventListener('mouseleave', () => { prev.style.color = '#6b7280'; });
      prev.addEventListener('click', () => { activePage--; render(); });
    }
    pagination.appendChild(prev);

    // Numbers
    const nums = document.createElement('div');
    nums.style.cssText = 'display:flex; gap:24px;';
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.textContent = String(i).padStart(2, '0');
      btn.style.cssText = i === activePage
        ? base + 'color:#fff; border-bottom:1px solid #ec5b13; padding-bottom:2px;'
        : base + 'color:#4b5563;';
      btn.addEventListener('mouseenter', () => { if (i !== activePage) btn.style.color = '#fff'; });
      btn.addEventListener('mouseleave', () => { if (i !== activePage) btn.style.color = '#4b5563'; });
      btn.addEventListener('click', () => { activePage = i; render(); });
      nums.appendChild(btn);
    }
    pagination.appendChild(nums);

    // Next
    const next = document.createElement('button');
    next.innerHTML = 'Next <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">east</span>';
    next.style.cssText = base + 'display:flex; align-items:center; gap:6px; color:' + (activePage === pages ? '#374151' : '#6b7280') + ';';
    next.disabled = activePage === pages;
    if (activePage < pages) {
      next.addEventListener('mouseenter', () => { next.style.color = '#fff'; });
      next.addEventListener('mouseleave', () => { next.style.color = '#6b7280'; });
      next.addEventListener('click', () => { activePage++; render(); });
    }
    pagination.appendChild(next);
  }

  function render() {
    const filtered = getFiltered();
    const start    = (activePage - 1) * PER_PAGE;
    const visible  = new Set(filtered.slice(start, start + PER_PAGE));

    cards.forEach(card => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (visible.has(card)) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });

    renderPagination(filtered.length);

    // Update active state on filter buttons
    buttons.forEach(b => {
      const isActive = b.dataset.filter === activeFilter;
      b.classList.toggle('active', isActive);
      b.classList.toggle('text-white', isActive);
      b.classList.toggle('font-bold', isActive);
      b.classList.toggle('border-b-2', isActive);
      b.classList.toggle('border-primary', isActive);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      activePage   = 1;
      render();
    });
  });

  render();
})();

/* ─── PARALLAX — SUBTLE ─────────────────────────────────────── */
(function initParallax() {
  const philosophyImgs = document.querySelectorAll('.philosophy__img img');
  if (!philosophyImgs.length) return;

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        philosophyImgs.forEach((img, i) => {
          const speed = i === 0 ? -0.06 : 0.06;
          img.style.transform = `scale(1.12) translateY(${scrolled * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── HERO — INITIAL REVEAL ──────────────────────────────────── */
(function initHeroReveal() {
  const reveals = document.querySelectorAll('.hero .reveal');
  let delay = 400;
  reveals.forEach(el => {
    setTimeout(() => el.classList.add('visible'), delay);
    delay += 160;
  });
})();

/* ─── IMAGE LAZY LOAD WITH FADE ─────────────────────────────── */
(function initImageFade() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    const show = () => { img.style.opacity = '1'; };
    if (img.complete) {
      show();
    } else {
      img.addEventListener('load', show);
    }
  });
})();

/* ─── PHILOSOPHY BOXES — EQUAL HEIGHT ───────────────────────── */
(function initPhiloEqualHeight() {
  const textA = document.querySelector('.philo-cell--text-a');
  const textB = document.querySelector('.philo-cell--text-b');
  if (!textA || !textB) return;

  function sync() {
    textB.style.height = '';
    const h = textA.offsetHeight;
    textB.style.height = h + 'px';
  }

  // Wait for fonts so text-a's height is measured correctly
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    sync();
  });
  window.addEventListener('load', sync);
  window.addEventListener('resize', sync, { passive: true });
})();

/* ─── MOBILE GRAYSCALE — pointer events (mouse + touch unified) ── */
(function initMobileGrayscale() {
  const selectors = [
    '.hero',
    '.philosophy__img',
    '.project-card',
    '.svc-hero',
    '.svc-row__img',
  ];

  const els = [];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => els.push(el));
  });
  if (!els.length) return;

  els.forEach(el => {
    // pointerenter fires on: mouse hover (DevTools) + finger touch (real phone)
    el.addEventListener('pointerenter', () => {
      el.classList.add('touch-active');
    });
    // pointerleave fires on: mouse out (DevTools) + finger lift (real phone)
    el.addEventListener('pointerleave', () => {
      el.classList.remove('touch-active');
    });
  });
})();

/* ─── SECTION PROGRESS INDICATOR ────────────────────────────── */
(function initProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 1px;
    background: rgba(236,91,19,0.6); z-index: 2000;
    width: 0%; transition: width 0.1s linear; pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }, { passive: true });
})();
