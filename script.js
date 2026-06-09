/* ============================================================
   THEME
   ============================================================ */
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (!saved && !prefersDark) {
    document.documentElement.classList.remove('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     ADAPTIVE VELOCITY
     ---------------------------------------------------------- */
  let _vel = 0;
  let _lastY = window.scrollY;
  let _lastT = Date.now();
  window.addEventListener('scroll', () => {
    const now = Date.now();
    const dt  = now - _lastT;
    if (dt > 0) _vel = Math.abs(window.scrollY - _lastY) / dt * 1000;
    _lastY = window.scrollY;
    _lastT = now;
  }, { passive: true });

  function getVel() { return _vel; }
  function dur(normal) {
    const v = getVel();
    if (v > 1200) return 0.08;
    if (v >  500) return Math.max(0.08, normal * 0.45);
    return normal;
  }
  function del(normal) {
    return getVel() > 500 ? 0 : normal;
  }
  function stag(normal) {
    const v = getVel();
    if (v > 1200) return 0;
    if (v >  500) return normal * 0.3;
    return normal;
  }

  /* ----------------------------------------------------------
     INTRO SCREEN
     ---------------------------------------------------------- */
  (function initIntro() {
    const intro = document.getElementById('intro-screen');
    if (!intro) return;
    if (reduced) { intro.remove(); return; }
    document.documentElement.style.overflow = 'hidden';

    gsap.set('.intro-c1, .intro-c2, .intro-c3', { y: 90 });
    gsap.set('.intro-name',    { y: 28 });
    gsap.set('.intro-eyebrow', { y: 12 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to('.intro-c2', { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' }, 0.1)
      .to('.intro-c1', { opacity: 1, y: 0, duration: 0.95, ease: 'expo.out' }, 0.28)
      .to('.intro-c3', { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' }, 0.44)
      .to('.intro-eyebrow', { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.55)
      .to('.intro-name',    { opacity: 1, y: 0, duration: 0.80, ease: 'expo.out'   }, 0.66)
      .to('.intro-role',    { opacity: 1,        duration: 0.50, ease: 'power2.out' }, 0.98)
      .to('.intro-hint',    { opacity: 1,        duration: 0.45, ease: 'power2.out' }, 1.45);

    tl.call(() => {
      gsap.to('.intro-c1', { y: -14, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to('.intro-c2', { y: -9,  duration: 3.1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.5 });
      gsap.to('.intro-c3', { y: -11, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.0 });
    }, null, 1.6);

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      gsap.killTweensOf('.intro-c1, .intro-c2, .intro-c3');
      gsap.to('.intro-c2', { x: -160, y: 380, rotate: -22, opacity: 0, duration: 0.55, ease: 'power3.in' });
      gsap.to('.intro-c1', { y: 280, scale: 0.88, opacity: 0, duration: 0.48, ease: 'power3.in', delay: 0.07 });
      gsap.to('.intro-c3', { x: 160, y: 340, rotate: 20, opacity: 0, duration: 0.55, ease: 'power3.in', delay: 0.12 });
      gsap.to('.intro-text, .intro-hint', { opacity: 0, y: -18, duration: 0.32, ease: 'power2.in' });
      gsap.to('#intro-screen', {
        y: '-100%', duration: 0.88, ease: 'power3.inOut', delay: 0.30,
        onStart: () => { document.documentElement.style.overflow = ''; },
        onComplete: () => { intro.remove(); }
      });
    }

    intro.addEventListener('click',      dismiss, { once: true });
    intro.addEventListener('touchstart', dismiss, { once: true, passive: true });
    window.addEventListener('wheel',     () => { if (!dismissed) dismiss(); }, { once: true, passive: true });
    document.addEventListener('keydown', e => {
      if (['ArrowDown', ' ', 'Enter', 'PageDown'].includes(e.key)) { e.preventDefault(); dismiss(); }
    }, { once: true });
    setTimeout(dismiss, 10000);
  })();

  /* ----------------------------------------------------------
     THEME TOGGLE
     ---------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');
  const html        = document.documentElement;

  function syncThemeIcon() {
    if (!themeIcon) return;
    themeIcon.className = html.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
  }
  syncThemeIcon();

  function applyTheme() {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    syncThemeIcon();
  }

  themeToggle?.addEventListener('click', () => {
    /* Révélation circulaire depuis le bouton (View Transitions API, fallback direct) */
    if (!document.startViewTransition || reduced) { applyTheme(); return; }
    const r = themeToggle.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );
    document.startViewTransition(applyTheme).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
        { duration: 480, easing: 'cubic-bezier(0.4,0,0.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });

  /* Suit le thème système tant que l'utilisateur n'a pas choisi manuellement */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('theme')) return;
    html.classList.toggle('dark', e.matches);
    syncThemeIcon();
  });

  /* ----------------------------------------------------------
     HAMBURGER
     ---------------------------------------------------------- */
  const hamburger     = document.getElementById('hamburger');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const navLinks      = document.getElementById('nav-links');

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    if (hamburgerIcon) {
      hamburgerIcon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    }
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (hamburgerIcon) hamburgerIcon.className = 'fas fa-bars';
    });
  });

  /* ----------------------------------------------------------
     ANCHOR SMOOTH SCROLL
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ----------------------------------------------------------
     SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const scrollBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    if (!scrollBar) return;
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    scrollBar.style.width = pct + '%';
  }, { passive: true });

  /* ----------------------------------------------------------
     HERO — GSAP entrance
     ---------------------------------------------------------- */
  const HERO_SEL = [
    '.hero-available',
    '.hero-eyebrow', '.hero-title', '.hero-subtitle',
    '.hero-desc', '.hero-tags', '.hero-cta',
    '.hero-scroll', '.hero-stats'
  ];
  HERO_SEL.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.animation = 'none'; el.style.opacity = '0'; }
  });

  if (!reduced) {
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .fromTo('.hero-available', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0)
      .fromTo('.hero-eyebrow',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0)
      .fromTo('.hero-title',    { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out'   }, 0.12)
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0.28)
      .fromTo('.hero-desc',     { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0.4)
      .fromTo('.hero-tags',     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, 0.52)
      .fromTo('.hero-cta',      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, 0.62)
      .fromTo('.hero-scroll',   { opacity: 0 },        { opacity: 1, duration: 0.5 },                            0.85)
      .fromTo('.hero-stats',    { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, 0.8);

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const FINAL = heroTitle.textContent;
      const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&';
      let frame = 0;
      heroTl.call(() => {
        const iv = setInterval(() => {
          const p = frame / 20;
          heroTitle.textContent = FINAL.split('').map((ch, i) => {
            if (ch === ' ') return ' ';
            return i / FINAL.length < p ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          if (++frame > 20) { clearInterval(iv); heroTitle.textContent = FINAL; }
        }, 42);
      }, null, 0.12);
    }
  } else {
    HERO_SEL.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
  }

  /* ----------------------------------------------------------
     WORD SPLIT REVEAL — section titles
     ---------------------------------------------------------- */
  function initWordReveal() {
    document.querySelectorAll('.section-title').forEach(el => {
      if (el.dataset.split) return;
      if (el.closest('#skills')) {
        el.style.opacity = '1'; el.style.transform = 'none'; return;
      }
      el.dataset.split = '1';
      el.classList.remove('reveal');
      el.style.opacity = '1';
      el.style.transform = 'none';
      const words = el.textContent.trim().split(' ');
      el.innerHTML = words.map(w => `<span class="word-wrap"><span class="word">${w}</span></span>`).join(' ');
      const wordSpans = el.querySelectorAll('.word');
      gsap.set(wordSpans, { y: '110%', rotate: 2 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => {
          gsap.to(wordSpans, {
            y: 0, rotate: 0,
            duration: dur(0.55), ease: 'expo.out', stagger: stag(0.05),
            onComplete: () => el.classList.add('words-revealed')
          });
        }
      });
    });
  }
  initWordReveal();

  /* ----------------------------------------------------------
     SECTION LABEL SCRAMBLE
     ---------------------------------------------------------- */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ•·—';
  function scrambleEl(el) {
    const final = el.dataset.original || el.textContent;
    el.dataset.original = final;
    let frame = 0;
    const TOTAL = 16;
    const iv = setInterval(() => {
      const p = frame / TOTAL;
      el.textContent = final.split('').map((ch, i) =>
        i / final.length < p ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      ).join('');
      if (++frame > TOTAL) { clearInterval(iv); el.textContent = final; }
    }, 38);
  }
  document.querySelectorAll('.section-label').forEach(el => {
    if (el.closest('#skills')) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => setTimeout(() => scrambleEl(el), getVel() > 500 ? 0 : 80)
    });
  });

  /* Skill cards — pas d'animation de scroll, visibles directement */

  /* ----------------------------------------------------------
     PROJETS — CADRAN ROTATIF façon téléphone fixe
     Construit depuis les cartes bento existantes (zéro duplication).
     Desktop uniquement ; la grille reste le fallback mobile/reduced.
     ---------------------------------------------------------- */
  let rotaryIsDefault = false;
  (function initRotaryProjects() {
    const work = document.getElementById('work');
    const grid = work?.querySelector('.bento-grid');
    if (!work || !grid || reduced || window.innerWidth < 900) return;

    const srcCards = [...grid.querySelectorAll('.bento-card')];
    if (srcCards.length < 3) return;
    const projects = srcCards.map(card => ({
      title: (card.querySelector('.bento-hover-title') || card.querySelector('.bento-title'))?.textContent.trim() || '',
      desc:  card.querySelector('.bento-desc')?.textContent.trim() || '',
      chips: [...card.querySelectorAll('.bento-chip')].map(c => c.textContent.trim()),
      badge: card.querySelector('.bento-badge'),
      glyph: card.querySelector('.bento-glyph')?.textContent.trim() || '',
      links: [...card.querySelectorAll('.bento-link')],
      media: card.querySelector('.bento-bg img, .bento-bg video'),
      grad:  card.style.getPropertyValue('--bento-grad').trim()
    }));
    const N = projects.length;
    const STEP = 360 / N;

    /* — DOM — */
    const wrap = document.createElement('div');
    wrap.className = 'rotary-wrap reveal';
    wrap.innerHTML = `
      <div class="rotary-col">
        <div class="rotary-stage" tabindex="0" role="group"
          aria-label="Cadran de navigation des projets — utilisez les flèches pour tourner">
          <div class="rotary-dial"></div>
          <div class="rotary-center">
            <div class="rotary-center-glyph"></div>
            <div class="rotary-center-index"></div>
            <div class="rotary-center-label">Projets</div>
          </div>
          <div class="rotary-marker" aria-hidden="true"></div>
        </div>
        <p class="rotary-hint">⟲ Glisse pour composer · molette · flèches · clique un numéro</p>
      </div>
      <div class="rotary-detail">
        <div class="terminal-header">
          <div class="terminal-dot red"></div>
          <div class="terminal-dot yellow"></div>
          <div class="terminal-dot green"></div>
          <div class="terminal-window-title rotary-detail-path"></div>
        </div>
        <div class="rotary-detail-media"></div>
        <div class="rotary-detail-body" aria-live="polite"></div>
      </div>`;
    grid.parentNode.insertBefore(wrap, grid);

    const stage       = wrap.querySelector('.rotary-stage');
    const dial        = wrap.querySelector('.rotary-dial');
    const centerGlyph = wrap.querySelector('.rotary-center-glyph');
    const centerIndex = wrap.querySelector('.rotary-center-index');
    const detailPath  = wrap.querySelector('.rotary-detail-path');
    const detailMedia = wrap.querySelector('.rotary-detail-media');
    const detailBody  = wrap.querySelector('.rotary-detail-body');

    const holes = projects.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rotary-hole';
      b.setAttribute('aria-label', `Projet ${i + 1} : ${p.title}`);
      b.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>`;
      dial.appendChild(b);
      return b;
    });
    const labels = holes.map(h => h.firstChild);

    /* — Rotation : le cadran tourne, les numéros restent droits — */
    const state = { v: 0 };
    let R = 0;
    function applyRotation(v) {
      state.v = v;
      dial.style.transform = `rotate(${v}deg)`;
      labels.forEach((s, i) => { s.style.transform = `rotate(${-(i * STEP + v)}deg)`; });
    }
    function layout() {
      R = dial.offsetWidth / 2 - holes[0].offsetWidth / 2 - 14;
      holes.forEach((h, i) => { h.style.transform = `rotate(${i * STEP}deg) translate(0, ${-R}px)`; });
      applyRotation(state.v);
    }

    function slugify(s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function renderDetail(i, animate) {
      const p = projects[i];
      detailPath.textContent = `luka@portfolio — ~/projets/${slugify(p.title)}`;
      detailMedia.innerHTML = '';
      if (p.media) {
        const m = p.media.cloneNode(true);
        if (m.tagName === 'VIDEO') { m.muted = true; m.autoplay = true; m.loop = true; m.playsInline = true; m.play?.(); }
        detailMedia.appendChild(m);
      } else {
        const g = document.createElement('div');
        g.className = 'rotary-media-grad';
        if (p.grad) g.style.background = p.grad;
        g.textContent = p.glyph;
        detailMedia.appendChild(g);
      }
      detailBody.innerHTML = '';
      if (p.badge) detailBody.appendChild(p.badge.cloneNode(true));
      const h = document.createElement('h3');
      h.className = 'rotary-detail-title'; h.textContent = p.title;
      detailBody.appendChild(h);
      const d = document.createElement('p');
      d.className = 'rotary-detail-desc'; d.textContent = p.desc;
      detailBody.appendChild(d);
      if (p.chips.length) {
        const cw = document.createElement('div');
        cw.className = 'rotary-detail-chips';
        p.chips.forEach(c => {
          const s = document.createElement('span');
          s.className = 'rotary-chip'; s.textContent = c;
          cw.appendChild(s);
        });
        detailBody.appendChild(cw);
      }
      if (p.links.length) {
        const lw = document.createElement('div');
        lw.className = 'rotary-detail-links';
        p.links.forEach(a => {
          const c = a.cloneNode(true);
          c.className = 'rotary-link';
          lw.appendChild(c);
        });
        detailBody.appendChild(lw);
      }
      if (animate) {
        gsap.fromTo([detailMedia, detailBody],
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.06 });
      }
    }

    let active = -1;
    function setActive(i, animate = true) {
      const changed = i !== active;
      active = i;
      holes.forEach((h, j) => h.classList.toggle('active', j === i));
      /* cible équivalente la plus proche pour tourner par le chemin court */
      let target = -i * STEP;
      target += Math.round((state.v - target) / 360) * 360;
      gsap.killTweensOf(state);
      if (animate) {
        gsap.to(state, {
          v: target, duration: changed ? 0.7 : 0.45, ease: 'back.out(1.4)',
          onUpdate: () => applyRotation(state.v)
        });
      } else {
        applyRotation(target);
      }
      if (changed) {
        renderDetail(i, animate);
        centerGlyph.textContent = projects[i].glyph || String(i + 1).padStart(2, '0');
        centerIndex.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
      }
    }

    /* — Interactions — */
    let dragging = false, dragMoved = 0, lastA = 0;
    function pointerAngle(e) {
      const r = stage.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
    }
    stage.addEventListener('pointerdown', e => {
      dragging = true; dragMoved = 0; lastA = pointerAngle(e);
      gsap.killTweensOf(state);
      stage.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const a = pointerAngle(e);
      let d = a - lastA;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      lastA = a;
      dragMoved += Math.abs(d);
      applyRotation(state.v + d);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
      const snapped = Math.round(state.v / STEP) * STEP;
      setActive(((-Math.round(snapped / STEP)) % N + N) % N);
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    holes.forEach((h, i) => h.addEventListener('click', () => { if (dragMoved < 6) setActive(i); }));

    let wheelLock = 0;
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock < 180) return;
      wheelLock = now;
      setActive((active + (e.deltaY > 0 ? 1 : -1) + N) % N);
    }, { passive: false });

    stage.addEventListener('keydown', e => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); setActive((active + 1) % N); }
      else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setActive((active - 1 + N) % N); }
    });

    let rT;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 150); });

    /* Tour d'élan à l'arrivée dans la section */
    ScrollTrigger.create({
      trigger: stage, start: 'top 80%', once: true,
      onEnter: () => {
        if (dragging) return;
        gsap.fromTo(state, { v: state.v - 150 },
          { v: -active * STEP, duration: 1.4, ease: 'power4.out', onUpdate: () => applyRotation(state.v) });
      }
    });

    /* — Init (mesure avant que setView ne puisse masquer le cadran) — */
    layout();
    setActive(0, false);

    /* — Toggle Cadran / Grille — */
    const toggle = document.createElement('div');
    toggle.className = 'work-view-toggle';
    toggle.innerHTML = `
      <button type="button" data-view="rotary"><i class="fas fa-circle-notch"></i> Cadran</button>
      <button type="button" data-view="grid"><i class="fas fa-table-cells-large"></i> Grille</button>`;
    wrap.parentNode.insertBefore(toggle, wrap);
    function setView(v) {
      work.classList.toggle('view-rotary', v === 'rotary');
      work.classList.toggle('view-grid', v === 'grid');
      toggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
      localStorage.setItem('workView', v);
      if (v === 'rotary') layout();
      ScrollTrigger.refresh();
    }
    toggle.querySelectorAll('button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    const startView = localStorage.getItem('workView') === 'grid' ? 'grid' : 'rotary';
    setView(startView);
    rotaryIsDefault = startView === 'rotary';
  })();

  /* ----------------------------------------------------------
     BENTO GRID — slide from bottom + rebond par carte
     ---------------------------------------------------------- */
  (function initBento() {
    const cards = document.querySelectorAll('.bento-card');
    if (!cards.length) return;
    /* Si le cadran est la vue par défaut, la grille est masquée :
       pas d'animation d'entrée (les cartes restent visibles au toggle) */
    if (reduced || rotaryIsDefault) return;
    cards.forEach((card, i) => {
      card.style.willChange = 'transform, opacity';
      gsap.set(card, { opacity: 0, y: 60, scale: 0.96 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: dur(0.7),
            ease: 'back.out(1.4)',
            delay: del((i % 4) * 0.10),
            onComplete: () => { card.style.willChange = 'auto'; }
          });
        }
      });
    });
  })();

  /* ----------------------------------------------------------
     TIMELINE — draw de la ligne verticale + entrées
     ---------------------------------------------------------- */
  document.querySelectorAll('.timeline').forEach(timeline => {
    /* Ligne animée */
    if (!reduced) {
      const line = document.createElement('div');
      line.className = 'timeline-progress-line';
      timeline.style.position = 'relative';
      timeline.insertBefore(line, timeline.firstChild);
      line.style.willChange = 'height';
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 1.4,
        onUpdate: (self) => {
          line.style.height = (self.progress * 100) + '%';
        },
        onLeave: () => { line.style.willChange = 'auto'; }
      });
    }
    /* Entrées des items */
    timeline.querySelectorAll('.timeline-item').forEach((el, i) => {
      if (!reduced) {
        const xDir = i % 2 === 0 ? -28 : 28;
        gsap.set(el, { opacity: 0, x: xDir });
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: () => gsap.to(el, {
            opacity: 1, x: 0,
            duration: dur(0.55), ease: 'power3.out',
            delay: del((i % 3) * 0.06)
          })
        });
      }
    });
  });

  /* ----------------------------------------------------------
     GENERIC REVEAL
     ---------------------------------------------------------- */
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.classList.contains('timeline-item')) return;
    /* Elements in #skills — always visible, no animation */
    if (el.closest('#skills')) {
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }
    gsap.set(el, { opacity: 0, y: 22 });
    const baseDelay = el.classList.contains('reveal-d1') ? 0.05
                    : el.classList.contains('reveal-d2') ? 0.10
                    : el.classList.contains('reveal-d3') ? 0.15
                    : el.classList.contains('reveal-d4') ? 0.20 : 0;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(el, {
        opacity: 1, y: 0,
        duration: dur(0.42), ease: 'power3.out',
        delay: del(baseDelay)
      })
    });
  });

  /* ----------------------------------------------------------
     STAT COUNTERS — count-up depuis 0
     ---------------------------------------------------------- */
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: dur(1.2), ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  /* ----------------------------------------------------------
     SECTION BACKGROUND NUMBERS
     ---------------------------------------------------------- */
  const sectionMeta = [
    { id: 'about',       num: '01' },
    { id: 'skills',      num: '02' },
    { id: 'journey',     num: '03' },
    { id: 'experiences', num: '04' },
    { id: 'work',        num: '05' },
    { id: 'contact',     num: '06' },
  ];
  sectionMeta.forEach(({ id, num }) => {
    const section = document.getElementById(id);
    if (!section) return;
    const div = document.createElement('div');
    div.className = 'section-bg-num';
    div.textContent = num;
    section.insertBefore(div, section.firstChild);
    if (id === 'skills') return; // Pas de numéro animé dans skills
    gsap.set(div, { opacity: 0, x: 28 });
    ScrollTrigger.create({
      trigger: section, start: 'top 85%', once: true,
      onEnter: () => gsap.to(div, { opacity: 1, x: 0, duration: dur(0.9), ease: 'power3.out' })
    });
  });

  /* ----------------------------------------------------------
     SCROLL SPY + NAV INDICATOR
     ---------------------------------------------------------- */
  const navAnchorEls = document.querySelectorAll('.nav-links a[href^="#"]');
  const spySections  = [...navAnchorEls]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const navLinksEl = document.getElementById('nav-links');
  let navIndicator = null;

  if (navLinksEl && window.innerWidth > 768) {
    navIndicator = document.createElement('span');
    navIndicator.className = 'nav-indicator';
    navLinksEl.appendChild(navIndicator);
    function moveIndicatorTo(linkEl) {
      if (!linkEl || !navIndicator) return;
      const lr = linkEl.getBoundingClientRect();
      const nr = navLinksEl.getBoundingClientRect();
      navIndicator.style.left    = (lr.left - nr.left) + 'px';
      navIndicator.style.width   = lr.width + 'px';
      navIndicator.style.opacity = '1';
    }
    navAnchorEls.forEach(a => a.addEventListener('mouseenter', () => moveIndicatorTo(a)));
    navLinksEl.addEventListener('mouseleave', () => {
      const active = navLinksEl.querySelector('.nav-active');
      active ? moveIndicatorTo(active) : (navIndicator.style.opacity = '0');
    });
  }

  function activateNavLink(id) {
    navAnchorEls.forEach(a => a.classList.remove('nav-active'));
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.classList.add('nav-active');
      if (navIndicator && navLinksEl) {
        const lr = link.getBoundingClientRect();
        const nr = navLinksEl.getBoundingClientRect();
        navIndicator.style.left    = (lr.left - nr.left) + 'px';
        navIndicator.style.width   = lr.width + 'px';
        navIndicator.style.opacity = '1';
      }
    }
  }

  spySections.forEach(section => {
    ScrollTrigger.create({
      trigger: section, start: 'top 40%', end: 'bottom 40%',
      onEnter:     () => activateNavLink(section.id),
      onEnterBack: () => activateNavLink(section.id)
    });
  });

  /* ----------------------------------------------------------
     SVG CIRCUIT DIVIDERS (palette verte)
     ---------------------------------------------------------- */
  function initCircuitDividers() {
    if (reduced || window.innerWidth < 768) return;
    const pairs = [
      ['hero','about'], ['about','skills'], ['skills','journey'],
      ['journey','experiences'], ['experiences','work'],
    ];
    const pathDefs = [
      'M 0,40 L 120,40 L 120,12 L 360,12 L 360,40 L 480,40',
      'M 0,12 L 160,12 L 320,50 L 480,50',
      'M 0,50 L 80,50 L 80,18 L 200,18 L 200,50 L 340,50 L 340,18 L 480,18',
      'M 0,50 Q 240,8 480,50',
      'M 0,48 C 100,8 380,60 480,16',
    ];
    pairs.forEach(([aId, bId], index) => {
      const sectionA = aId === 'hero' ? document.querySelector('.hero') : document.getElementById(aId);
      const sectionB = document.getElementById(bId);
      if (!sectionA || !sectionB) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'circuit-divider';
      const d = pathDefs[index];
      const uid = `cd-${index}`;
      wrapper.innerHTML = `
        <svg class="circuit-svg" viewBox="0 0 480 60" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="gp-${uid}" x="-10%" y="-150%" width="120%" height="400%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="go-${uid}" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path class="circuit-base" d="${d}" fill="none"/>
          <path class="circuit-draw" d="${d}" fill="none" filter="url(#gp-${uid})"/>
          <circle class="circuit-orb" r="4" cx="-20" cy="-20" filter="url(#go-${uid})"/>
        </svg>`;
      sectionA.parentNode.insertBefore(wrapper, sectionB);
      const drawPath = wrapper.querySelector('.circuit-draw');
      const orbEl    = wrapper.querySelector('.circuit-orb');
      requestAnimationFrame(() => {
        const len = drawPath.getTotalLength();
        gsap.set(drawPath, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set(orbEl, { opacity: 0 });
        ScrollTrigger.create({
          trigger: wrapper, start: 'top 90%', end: 'top 10%', scrub: 1.5,
          onUpdate: (self) => {
            const p = self.progress;
            drawPath.style.strokeDashoffset = len * (1 - p);
            if (p > 0.04) {
              const pt = drawPath.getPointAtLength(p * len);
              orbEl.setAttribute('cx', pt.x);
              orbEl.setAttribute('cy', pt.y);
              orbEl.style.opacity = Math.min(p * 10, 1);
            } else {
              orbEl.style.opacity = 0;
            }
          }
        });
      });
    });
  }
  initCircuitDividers();

  if (!document.querySelector('style[data-circuit]')) {
    const s = document.createElement('style');
    s.dataset.circuit = '1';
    s.textContent = `
      .circuit-divider{position:relative;width:100%;height:60px;overflow:visible;pointer-events:none;display:none;}
      @media(min-width:768px){.circuit-divider{display:block;}}
      .circuit-svg{width:100%;height:100%;overflow:visible;}
      .circuit-base{stroke:rgba(130,130,130,0.07);stroke-width:1.5;stroke-dasharray:6 12;}
      html.dark .circuit-base{stroke:rgba(82,183,136,0.08);}
      .circuit-draw{stroke:rgba(45,106,79,0.35);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
      html.dark .circuit-draw{stroke:rgba(82,183,136,0.55);}
      .circuit-orb{fill:#2D6A4F;}
      html.dark .circuit-orb{fill:#52B788;}
    `;
    document.head.appendChild(s);
  }

  /* ----------------------------------------------------------
     HERO PARALLAX
     ---------------------------------------------------------- */
  (function initHeroParallax() {
    if (reduced) return;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function update() {
      cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
      heroContent.style.transform = `translate(${cx * -14}px, ${cy * -9}px)`;
      raf = (Math.abs(cx - tx) > 0.01 || Math.abs(cy - ty) > 0.01)
        ? requestAnimationFrame(update) : null;
    }
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width  - 0.5;
      ty = (e.clientY - r.top)  / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
  })();

  /* ----------------------------------------------------------
     ABOUT TERMINAL — typing animation
     ---------------------------------------------------------- */
  const terminalAbout = document.getElementById('terminal-output');
  const commandSets = [
    [
      { cmd: 'cd Documents/Alternance', out: '' },
      { cmd: 'cat recherche.txt', out: 'Étudiant en BUT Informatique (DACS),\nAdmis IMT Nord Europe — recherche alternance 2026-2029\nSpécialité : Admin Système · Cybersécurité · DevOps' }
    ],
    [
      { cmd: 'cd Mes_Passions', out: '' },
      { cmd: 'cat passions.txt', out: 'Cybersécurité, CTF TryHackMe, Linux,\nSports de combat, Course à pied,\nNouveaux outils et veille technologique' }
    ],
    [
      { cmd: 'cd EasterEgg', out: '' },
      { cmd: 'cat indice.txt', out: '> Tape cette commande dans le terminal interactif :\n  sudo apt install easteregg' }
    ]
  ];
  let cmds = [], cmdIdx = 0, charIdx = 0, typing = true;
  function pickSet() { return Math.random() < 0.15 ? commandSets[2] : commandSets[Math.floor(Math.random() * 2)]; }
  function addLine(text) {
    if (!terminalAbout) return;
    const d = document.createElement('div'); d.textContent = text;
    terminalAbout.appendChild(d); terminalAbout.scrollTop = terminalAbout.scrollHeight;
  }
  function typeNext() {
    if (!terminalAbout) return;
    if (cmdIdx >= cmds.length) { setTimeout(restart, 4500); return; }
    const cur = cmds[cmdIdx];
    if (typing) {
      if (charIdx === 0) addLine('$ ' + cur.cmd);
      const last = terminalAbout.lastChild;
      if (charIdx < cur.cmd.length) {
        last.textContent = '$ ' + cur.cmd.slice(0, charIdx + 1);
        charIdx++;
        setTimeout(typeNext, 70 + Math.random() * 50);
      } else {
        if (cur.out) addLine(cur.out);
        addLine('');
        typing = false; charIdx = 0;
        setTimeout(typeNext, 400);
      }
    } else { typing = true; cmdIdx++; setTimeout(typeNext, 400); }
  }
  function restart() {
    if (!terminalAbout) return;
    terminalAbout.innerHTML = '';
    cmdIdx = 0; charIdx = 0; typing = true;
    cmds = [...pickSet()];
    setTimeout(typeNext, 800);
  }
  if (terminalAbout) { cmds = [...pickSet()]; setTimeout(typeNext, 1200); }

  /* ----------------------------------------------------------
     INTERACTIVE TERMINAL (easter egg préservé)
     ---------------------------------------------------------- */
  const termInput  = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-interactive-output');
  const sections = [
    { name: 'A propos',    id: 'about'       },
    { name: 'Competences', id: 'skills'      },
    { name: 'Parcours',    id: 'journey'     },
    { name: 'Experiences', id: 'experiences' },
    { name: 'Projets',     id: 'work'        },
    { name: 'Contact',     id: 'contact'     },
    { name: 'Terminal',    id: 'terminal'    }
  ];

  function writeLine(text) {
    if (!termOutput) return;
    const d = document.createElement('div'); d.textContent = text;
    termOutput.appendChild(d); termOutput.scrollTop = termOutput.scrollHeight;
  }
  function writeEl(el) {
    if (!termOutput) return;
    termOutput.appendChild(el); termOutput.scrollTop = termOutput.scrollHeight;
  }
  function runProgressBar(cb) {
    let pct = 0; writeLine('');
    const div = document.createElement('div'); termOutput.appendChild(div);
    const iv = setInterval(() => {
      pct += 10;
      const f = Math.floor(pct / 10);
      div.textContent = `Téléchargement... [${'█'.repeat(f)}${'░'.repeat(10 - f)}] ${pct}%`;
      termOutput.scrollTop = termOutput.scrollHeight;
      if (pct >= 100) { clearInterval(iv); setTimeout(cb, 300); }
    }, 180);
  }
  const eggFrames = [
`   ___\n  /   \\\n /     \\\n(_______)\n  [Egg]`,
`   ___\n  /* *\\\n /* * *\\\n(______*)\n[Hatching]`,
`  *****\n *     *\n* ( ^v^)*\n *     *\n  *****\n[Cracked!]`
  ];
  function runHatchAnimation() {
    let fi = 0;
    const div = document.createElement('div');
    div.style.cssText = 'font-family:monospace;white-space:pre';
    termOutput.appendChild(div);
    const iv = setInterval(() => {
      div.textContent = eggFrames[fi]; termOutput.scrollTop = termOutput.scrollHeight; fi++;
      if (fi >= eggFrames.length) {
        clearInterval(iv); writeLine(''); writeLine('🎉 Félicitations ! Tu as trouvé l\'easter egg secret !');
        const btn = document.createElement('button');
        btn.textContent = '↺ Rejouer l\'animation';
        btn.style.cssText = 'margin-top:10px;padding:6px 14px;background:var(--accent);color:var(--accent-fg);border:none;border-radius:2px;cursor:pointer;font-size:0.75rem;font-weight:700;font-family:var(--mono);letter-spacing:0.06em;text-transform:uppercase;';
        btn.addEventListener('click', () => { writeLine(''); writeLine('$ sudo apt install easteregg'); runProgressBar(runHatchAnimation); });
        writeEl(btn);
      }
    }, 900);
  }
  const NEOFETCH = [
    '        .--.       luka@portfolio',
    '       |o_o |      ───────────────',
    '       |:_/ |      OS       Portfolio Linux x86_64',
    '      //   \\ \\     Cursus   BUT Info DACS → IMT Nord Europe',
    '     (|     | )    Shell    mbash (fait maison, en C)',
    '    /\'\\_   _/`\\    Stack    Linux · Docker · GCP · Cyber',
    '    \\___)=(___/    Statut   Dispo alternance · sept. 2026',
    '                   Contact  luka.salvo23@gmail.com',
  ];
  function handleCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    writeLine('$ ' + raw.trim());
    if (cmd === 'ls') {
      writeLine(sections.map(s => s.name).join('   '));
    } else if (cmd === 'clear') {
      termOutput.innerHTML = '';
    } else if (cmd === 'whoami')  { writeLine('luka.salvo');
    } else if (cmd === 'pwd')     { writeLine('/home/luka/portfolio');
    } else if (cmd === 'date')    { writeLine(new Date().toLocaleString('fr-FR'));
    } else if (cmd === 'neofetch') {
      const pre = document.createElement('div');
      pre.style.cssText = 'font-family:var(--mono);white-space:pre;color:#7ee787;';
      pre.textContent = NEOFETCH.join('\n');
      writeEl(pre);
    } else if (cmd.startsWith('echo ')) { writeLine(raw.trim().slice(5));
    } else if (cmd === 'history') {
      termHistory.slice().reverse().forEach((h, i) => writeLine(`  ${i + 1}  ${h}`));
    } else if (cmd === 'help')    { writeLine('Commandes : ls · cd <section> · whoami · pwd · neofetch · date · echo · history · clear · help · sudo apt install easteregg  (Tab = autocomplétion)');
    } else if (cmd === 'sudo' || cmd === 'sudo ') { writeLine('Pas de droits suffisants — contactez-moi pour en obtenir.');
    } else if (cmd === 'sudo apt install easteregg') { runProgressBar(runHatchAnimation);
    } else if (cmd.startsWith('sudo apt install')) { writeLine('Erreur : paquet introuvable.');
    } else if (cmd.startsWith('cd ')) {
      const name = cmd.slice(3).trim();
      const found = sections.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (found) {
        const target = document.getElementById(found.id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        writeLine(`→ Navigation vers "${found.name}"`);
      } else writeLine(`Erreur : section "${name}" non trouvée. Tapez ls pour voir les sections.`);
    } else if (cmd !== '') {
      writeLine(`Commande non reconnue : "${raw.trim()}". Tapez help pour l'aide.`);
    }
    writeLine('');
  }

  const termHistory = [];
  if (termInput && termOutput) {
    writeLine('Bienvenue dans le terminal interactif !');
    writeLine('Commandes : ls · cd <section> · neofetch · whoami · pwd · clear · help');
    writeLine('');
    let histIdx = -1;
    const COMPLETIONS = ['ls', 'cd ', 'clear', 'whoami', 'pwd', 'neofetch', 'date', 'echo ', 'history', 'help', 'sudo apt install easteregg'];
    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        if (val.trim()) termHistory.unshift(val);
        histIdx = -1; handleCommand(val); termInput.value = '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const val = termInput.value;
        if (!val) return;
        /* Complète d'abord les noms de section après "cd ", sinon les commandes */
        if (val.toLowerCase().startsWith('cd ')) {
          const part = val.slice(3).toLowerCase();
          const match = sections.find(s => s.name.toLowerCase().startsWith(part));
          if (match) termInput.value = 'cd ' + match.name;
        } else {
          const match = COMPLETIONS.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
          if (match) termInput.value = match;
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < termHistory.length - 1) { histIdx++; termInput.value = termHistory[histIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        histIdx > 0 ? (histIdx--, termInput.value = termHistory[histIdx]) : (histIdx = -1, termInput.value = '');
      }
    });
  }

  /* ----------------------------------------------------------
     CUSTOM CURSOR
     ---------------------------------------------------------- */
  (function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches || reduced) return;
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    let mx = -200, my = -200, rx = -200, ry = -200;
    let velX = 0, velY = 0, prevMx = -200, prevMy = -200;
    document.addEventListener('mousemove', e => {
      velX = e.clientX - prevMx; velY = e.clientY - prevMy;
      prevMx = mx; prevMy = my;
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });
    (function animateRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      if (!ring.classList.contains('is-hovering') && !ring.classList.contains('is-clicking')) {
        const speed  = Math.hypot(velX, velY);
        const angle  = Math.atan2(velY, velX) * 180 / Math.PI;
        const stretch = Math.min(speed * 0.09, 0.45);
        ring.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.4})`;
      }
      velX *= 0.82; velY *= 0.82;
      requestAnimationFrame(animateRing);
    })();
    const hoverEls = document.querySelectorAll('a,button,.info-card,.tag,.skill-card,.contact-link,.bento-card,.cert-card,.comp-row');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });
    document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));
  })();

  /* ----------------------------------------------------------
     PAGE SPOTLIGHT
     ---------------------------------------------------------- */
  (function initSpotlight() {
    if (reduced) return;
    const el = document.createElement('div');
    el.className = 'page-spotlight';
    document.body.appendChild(el);
    document.addEventListener('mousemove', e => {
      el.style.setProperty('--sx', e.clientX + 'px');
      el.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });
  })();

  /* ----------------------------------------------------------
     BIG HERO MARQUEE
     ---------------------------------------------------------- */
  (function initBigMarquee() {
    const about = document.getElementById('about');
    if (!about) return;
    const row1 = ['ADMIN SYS', '·', 'CYBERSÉCURITÉ', '·', 'DEVOPS', '·', 'CLOUD', '·', 'RÉSEAUX', '·', 'OSINT', '·', 'CTF', '·'];
    const row2 = ['IMT NORD EUROPE', '·', 'ALTERNANCE 2026', '·', 'LINUX', '·', 'DOCKER', '·', 'GCP', '·', 'TRYHACKME', '·'];
    const marquee = document.createElement('div');
    marquee.className = 'hero-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    [row1, row2].forEach((words, ri) => {
      const track = document.createElement('div');
      track.className = `hero-marquee-track row-${ri + 1}`;
      [...words, ...words].forEach(w => {
        const el = document.createElement('span');
        el.className = w === '·' ? 'marq-sep' : 'marq-word';
        el.textContent = w;
        track.appendChild(el);
      });
      marquee.appendChild(track);
    });
    about.parentNode.insertBefore(marquee, about);
  })();

  /* ----------------------------------------------------------
     SKILLS TICKER (sans emojis)
     ---------------------------------------------------------- */
  (function initSkillsTicker() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    const allSkills = [
      'Linux', 'Docker', 'GCP', 'Cybersécurité', 'Grafana', 'Prometheus',
      'DevOps', 'Vagrant', 'Kubernetes', 'Réseaux', 'Java', 'PHP',
      'Python', 'Ruby', 'Bash', 'LaTeX', 'HTML / CSS', 'VirtualBox',
      'OSINT', 'TryHackMe', 'Claude AI', 'Git',
    ];
    const container = document.createElement('div');
    container.className = 'skills-ticker-container';
    const track = document.createElement('div');
    track.className = 'skills-ticker-track';
    [...allSkills, ...allSkills].forEach(n => {
      const item = document.createElement('div');
      item.className = 'ticker-item';
      item.innerHTML = `<span class="ticker-dot"></span>${n}`;
      track.appendChild(item);
    });
    container.appendChild(track);
    const firstGroup = skillsSection.querySelector('.skills-group');
    if (firstGroup) firstGroup.parentNode.insertBefore(container, firstGroup);
  })();

  /* ----------------------------------------------------------
     GLITCH FLASH sur group title hover
     ---------------------------------------------------------- */
  (function initGlitch() {
    if (reduced) return;
    document.querySelectorAll('.skills-group-title').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (el.classList.contains('glitch-flash')) return;
        el.classList.add('glitch-flash');
        el.addEventListener('animationend', () => el.classList.remove('glitch-flash'), { once: true });
      });
    });
  })();

  /* ----------------------------------------------------------
     SIDE NAV DOTS
     ---------------------------------------------------------- */
  (function initSideNav() {
    const sects = [
      { id: 'about',       label: 'À propos'    },
      { id: 'skills',      label: 'Compétences' },
      { id: 'journey',     label: 'Parcours'    },
      { id: 'experiences', label: 'Expériences' },
      { id: 'work',        label: 'Projets'     },
      { id: 'contact',     label: 'Contact'     },
    ];
    const nav = document.createElement('nav');
    nav.className = 'sidenav-dots';
    nav.setAttribute('aria-label', 'Navigation rapide par section');
    sects.forEach(({ id, label }, i) => {
      const btn = document.createElement('button');
      btn.className = 'sidenav-dot';
      btn.dataset.label = label;
      btn.setAttribute('aria-label', `Aller à : ${label}`);
      btn.addEventListener('click', () => {
        const t = document.getElementById(id);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
      nav.appendChild(btn);
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: 'top 50%', end: 'bottom 50%',
        onEnter:     () => nav.querySelectorAll('.sidenav-dot').forEach((d, j) => d.classList.toggle('active', j === i)),
        onEnterBack: () => nav.querySelectorAll('.sidenav-dot').forEach((d, j) => d.classList.toggle('active', j === i)),
      });
    });
    document.body.appendChild(nav);
  })();

  /* ----------------------------------------------------------
     KINETIC PARALLAX — section-desc
     ---------------------------------------------------------- */
  (function initKineticParallax() {
    if (reduced) return;
    gsap.utils.toArray('.section-desc').forEach(el => {
      if (el.closest('#skills')) return; // Pas de parallax dans skills
      gsap.fromTo(el, { y: 10 }, {
        y: -10, scrollTrigger: { trigger: el, scrub: 2, start: 'top bottom', end: 'bottom top' }
      });
    });
  })();

  /* ----------------------------------------------------------
     MAGNETIC BUTTONS
     ---------------------------------------------------------- */
  (function initMagnet() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-primary,.btn-secondary,.contact-link').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.25;
        const y = (e.clientY - r.top  - r.height / 2) * 0.25;
        btn.style.transform  = `translate(${x}px, ${y}px) translateY(-1px)`;
        btn.style.transition = 'box-shadow 0.2s';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform  = '';
        btn.style.transition = 'all var(--t)';
      });
    });
  })();

  /* ----------------------------------------------------------
     MAGNETIC TIMELINE DOTS
     ---------------------------------------------------------- */
  (function initTimelineMagnets() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.timeline-item').forEach(item => {
      const dot = item.querySelector('.timeline-dot');
      if (!dot) return;
      item.addEventListener('mousemove', e => {
        const r = dot.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) {
          const f = (1 - dist / 90) * 7;
          dot.style.transform = `translate(${(dx / dist) * f}px, ${(dy / dist) * f}px)`;
        } else {
          dot.style.transform = '';
        }
      });
      item.addEventListener('mouseleave', () => { dot.style.transform = ''; });
    });
  })();

  /* ----------------------------------------------------------
     TERMINAL TILT (about section)
     ---------------------------------------------------------- */
  (function initTerminalTilt() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const term = document.querySelector('.about-grid .terminal');
    if (!term) return;
    term.addEventListener('mousemove', e => {
      const r = term.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 5;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 3;
      term.style.transform  = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.01)`;
      term.style.transition = 'box-shadow 0.2s';
    });
    term.addEventListener('mouseleave', () => {
      term.style.transform  = '';
      term.style.transition = 'all var(--t)';
    });
  })();

  /* ----------------------------------------------------------
     HERO TITLE CURSOR (after scramble)
     ---------------------------------------------------------- */
  (function initHeroTitleCursor() {
    if (reduced) return;
    const title = document.querySelector('.hero-title');
    if (!title) return;
    setTimeout(() => {
      const cursor = document.createElement('span');
      cursor.className = 'hero-title-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      title.appendChild(cursor);
      setTimeout(() => {
        gsap.to(cursor, { opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: () => cursor.remove() });
      }, 5500);
    }, 1300);
  })();

  /* ----------------------------------------------------------
     BACK TO TOP BUTTON
     ---------------------------------------------------------- */
  (function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ----------------------------------------------------------
     MOBILE BENTO TOUCH EXPAND
     ---------------------------------------------------------- */
  (function initMobileBentoTouch() {
    if (window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const isActive = card.classList.contains('touch-active');
        document.querySelectorAll('.bento-card').forEach(c => c.classList.remove('touch-active'));
        if (!isActive) card.classList.add('touch-active');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.bento-card')) {
        document.querySelectorAll('.bento-card').forEach(c => c.classList.remove('touch-active'));
      }
    });
  })();

  /* ----------------------------------------------------------
     BENTO SPOTLIGHT — halo suivant la souris sur les cartes
     ---------------------------------------------------------- */
  (function initBentoSpotlight() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.bento-card, .skill-card, .cert-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  })();

  /* ----------------------------------------------------------
     SCROLL VELOCITY — cursor ring
     ---------------------------------------------------------- */
  (function initScrollVelocity() {
    if (reduced) return;
    const ring = document.getElementById('cursor-ring');
    if (!ring) return;
    let lastY = 0, ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const v = Math.abs(window.scrollY - lastY);
        lastY = window.scrollY;
        if (v > 18 && !ring.classList.contains('is-hovering')) {
          const s = Math.min(1 + v * 0.01, 1.5);
          ring.style.transform = `translate(-50%,-50%) scale(${s})`;
          setTimeout(() => { ring.style.transform = ''; }, 200);
        }
        ticking = false;
      });
    }, { passive: true });
  })();

});
