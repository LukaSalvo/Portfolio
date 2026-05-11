/* ============================================================
   THEME — dark default, persisted in localStorage
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

  /* ----------------------------------------------------------
     GSAP + ScrollTrigger
     ---------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     ScrollTrigger — sync with native scroll
     ---------------------------------------------------------- */

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

  themeToggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
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
     ANCHOR LINKS — native smooth scroll
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
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
     HERO — cancel CSS animations, drive with GSAP
     ---------------------------------------------------------- */
  const HERO_SEL = [
    '.hero-eyebrow', '.hero-title', '.hero-subtitle',
    '.hero-desc', '.hero-tags', '.hero-cta',
    '.hero-scroll', '.hero-stats'
  ];
  HERO_SEL.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.animation = 'none'; el.style.opacity = '0'; }
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced) {
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .fromTo('.hero-eyebrow',  { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0)
      .fromTo('.hero-title',    { opacity: 0, y: 52 }, { opacity: 1, y: 0, duration: 0.9,  ease: 'expo.out'   }, 0.12)
      .fromTo('.hero-subtitle', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.28)
      .fromTo('.hero-desc',     { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.4)
      .fromTo('.hero-tags',     { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.52)
      .fromTo('.hero-cta',      { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.62)
      .fromTo('.hero-scroll',   { opacity: 0 },        { opacity: 1, duration: 0.5 },                           0.88)
      .fromTo('.hero-stats',    { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.82);

    // One-shot title scramble on hero entrance
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
      if (el) el.style.opacity = '1';
    });
  }

  /* ----------------------------------------------------------
     WORD SPLIT REVEAL — GSAP ScrollTrigger
     Must run before generic .reveal handler.
     ---------------------------------------------------------- */
  function initWordReveal() {
    document.querySelectorAll('.section-title').forEach(el => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      el.classList.remove('reveal');
      el.style.opacity = '1';
      el.style.transform = 'none';

      const words = el.textContent.trim().split(' ');
      el.innerHTML = words.map(word =>
        `<span class="word-wrap"><span class="word">${word}</span></span>`
      ).join(' ');

      const wordSpans = el.querySelectorAll('.word');
      gsap.set(wordSpans, { y: '115%', rotate: 3 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 87%',
        once: true,
        onEnter: () => {
          gsap.to(wordSpans, {
            y: 0, rotate: 0,
            duration: 0.85,
            ease: 'expo.out',
            stagger: 0.08,
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
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ•·';

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
    }, 40);
  }

  document.querySelectorAll('.section-label').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => setTimeout(() => scrambleEl(el), 80)
    });
  });

  /* ----------------------------------------------------------
     PROJECT CARDS — GSAP wave stagger
     Must run before generic .reveal handler.
     ---------------------------------------------------------- */
  (function initProjectWave() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.project-card')];

    cards.forEach(card => {
      card.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4');
      gsap.set(card, { opacity: 0, y: 36, scale: 0.94 });
    });

    ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const cols = Math.round(grid.offsetWidth / (cards[0]?.offsetWidth || 260)) || 1;
        cards.forEach((card, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.72,
            ease: 'expo.out',
            delay: col * 0.07 + row * 0.04
          });
        });
      }
    });
  })();

  /* ----------------------------------------------------------
     GENERIC REVEAL — all remaining .reveal elements
     Section titles and project cards already handled above.
     ---------------------------------------------------------- */
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.set(el, { opacity: 0, y: 28 });
    const delay = el.classList.contains('reveal-d1') ? 0.1
                : el.classList.contains('reveal-d2') ? 0.2
                : el.classList.contains('reveal-d3') ? 0.3
                : el.classList.contains('reveal-d4') ? 0.4 : 0;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay })
    });
  });

  /* ----------------------------------------------------------
     PROGRESS BARS
     ---------------------------------------------------------- */
  document.querySelectorAll('.progress-fill').forEach(el => {
    gsap.set(el, { width: '0%' });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, {
        width: (el.getAttribute('data-width') || '0') + '%',
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.2
      })
    });
  });

  /* ----------------------------------------------------------
     STAT COUNTERS
     ---------------------------------------------------------- */
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const start  = parseInt(el.textContent, 10) || 0;
        const obj = { val: start };
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  /* ----------------------------------------------------------
     SECTION BACKGROUND NUMBERS — 01 … 06
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
    section.style.position = 'relative';
    section.style.overflow = 'hidden';
    section.insertBefore(div, section.firstChild);
    gsap.set(div, { opacity: 0, x: 40 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(div, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' })
    });
  });

  /* ----------------------------------------------------------
     SCROLL SPY + NAV SLIDING INDICATOR
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
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter:     () => activateNavLink(section.id),
      onEnterBack: () => activateNavLink(section.id)
    });
  });

  /* ----------------------------------------------------------
     SVG CIRCUIT DIVIDERS — animated neon paths between sections
     stroke-dashoffset draw + traveling orb via getPointAtLength
     ---------------------------------------------------------- */
  function initCircuitDividers() {
    if (reduced) return;
    if (window.innerWidth < 768) return;

    const pairs = [
      ['hero',        'about'      ],
      ['about',       'skills'     ],
      ['skills',      'journey'    ],
      ['journey',     'experiences'],
      ['experiences', 'work'       ],
    ];

    const pathDefs = [
      'M 0,40 L 120,40 L 120,12 L 360,12 L 360,40 L 480,40',
      'M 0,12 L 160,12 L 320,50 L 480,50',
      'M 0,50 L 80,50 L 80,18 L 200,18 L 200,50 L 340,50 L 340,18 L 480,18',
      'M 0,50 Q 240,8 480,50',
      'M 0,48 C 100,8 380,60 480,16',
    ];

    pairs.forEach(([aId, bId], index) => {
      const sectionA = aId === 'hero'
        ? document.querySelector('.hero')
        : document.getElementById(aId);
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
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="go-${uid}" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>
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
          trigger: wrapper,
          start: 'top 90%',
          end: 'top 10%',
          scrub: 1.5,
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

  /* ----------------------------------------------------------
     HERO PARALLAX — content follows cursor with lerp
     ---------------------------------------------------------- */
  (function initHeroParallax() {
    if (reduced) return;
    const hero        = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function update() {
      cx = lerp(cx, tx, 0.07);
      cy = lerp(cy, ty, 0.07);
      heroContent.style.transform = `translate(${cx * -16}px, ${cy * -10}px)`;
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
     INTERACTIVE TERMINAL
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
        btn.textContent = '🔄 Rejouer l\'animation';
        btn.style.cssText = 'margin-top:10px;padding:6px 14px;background:var(--accent);color:#000;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;font-weight:700;font-family:inherit;';
        btn.addEventListener('click', () => { writeLine(''); writeLine('$ sudo apt install easteregg'); runProgressBar(runHatchAnimation); });
        writeEl(btn);
      }
    }, 900);
  }

  function handleCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    writeLine('$ ' + raw.trim());
    if (cmd === 'ls') {
      writeLine(sections.map(s => s.name).join('   '));
    } else if (cmd === 'clear') {
      termOutput.innerHTML = '';
    } else if (cmd === 'whoami') { writeLine('luka.salvo');
    } else if (cmd === 'pwd')    { writeLine('/home/luka/portfolio');
    } else if (cmd === 'help')   { writeLine('Commandes : ls · cd <section> · whoami · pwd · clear · help · sudo apt install easteregg');
    } else if (cmd === 'sudo' || cmd === 'sudo ') { writeLine('Pas de droits suffisants — contactez-moi pour en obtenir 😄');
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

  if (termInput && termOutput) {
    writeLine('Bienvenue dans le terminal interactif !');
    writeLine('Commandes : ls · cd <section> · whoami · pwd · clear · help');
    writeLine('');
    const history = []; let histIdx = -1;
    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        if (val.trim()) history.unshift(val);
        histIdx = -1; handleCommand(val); termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < history.length - 1) { histIdx++; termInput.value = history[histIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        histIdx > 0 ? (histIdx--, termInput.value = history[histIdx]) : (histIdx = -1, termInput.value = '');
      }
    });
  }

  /* ----------------------------------------------------------
     CUSTOM CURSOR — velocity-based ring stretch
     ---------------------------------------------------------- */
  (function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (reduced) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = -200, my = -200, rx = -200, ry = -200;
    let velX = 0, velY = 0, prevMx = -200, prevMy = -200;

    document.addEventListener('mousemove', e => {
      velX = e.clientX - prevMx;
      velY = e.clientY - prevMy;
      prevMx = mx; prevMy = my;
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });

    (function animateRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      if (!ring.classList.contains('is-hovering') && !ring.classList.contains('is-clicking')) {
        const speed   = Math.hypot(velX, velY);
        const angle   = Math.atan2(velY, velX) * 180 / Math.PI;
        const stretch = Math.min(speed * 0.09, 0.5);
        ring.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.45})`;
      }
      velX *= 0.82; velY *= 0.82;
      requestAnimationFrame(animateRing);
    })();

    const hoverEls = document.querySelectorAll('a, button, .project-card, .info-card, .tag, .skill-card, .competence-card, .contact-link');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });
    document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));
  })();

  /* ----------------------------------------------------------
     HERO PARTICLES
     ---------------------------------------------------------- */
  (function initParticles() {
    if (reduced) return;
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize(); new ResizeObserver(resize).observe(canvas.parentElement);

    const COUNT = window.innerWidth < 768 ? 28 : 55;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38, vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.2 + 0.4
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      const rgb = isDark ? '0,255,65' : '0,168,50';

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb},${0.07 * (1 - d / 115)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.32)`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ----------------------------------------------------------
     3D CARD TILT
     ---------------------------------------------------------- */
  (function initTilt() {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const MAX = 7;
    document.querySelectorAll('.project-card, .info-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform  = `perspective(700px) rotateX(${-y * MAX}deg) rotateY(${x * MAX}deg) translateY(-5px)`;
        card.style.transition = 'box-shadow var(--t), border-color var(--t)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.transition = 'all var(--t)';
      });
    });
  })();

  /* ----------------------------------------------------------
     MAGNETIC BUTTONS
     ---------------------------------------------------------- */
  (function initMagnet() {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-primary, .btn-secondary, .contact-link').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.28;
        const y = (e.clientY - r.top  - r.height / 2) * 0.28;
        btn.style.transform  = `translate(${x}px, ${y}px) translateY(-2px)`;
        btn.style.transition = 'box-shadow 0.2s, filter 0.2s';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform  = '';
        btn.style.transition = 'all var(--t)';
      });
    });
  })();

});
