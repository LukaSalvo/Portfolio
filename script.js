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
  // Otherwise keep the class="dark" already set in <html>
})();

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     THEME TOGGLE
     ---------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');
  const html        = document.documentElement;

  function syncThemeIcon() {
    if (!themeIcon) return;
    const isDark = html.classList.contains('dark');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  syncThemeIcon();

  themeToggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncThemeIcon();
  });

  /* ----------------------------------------------------------
     HAMBURGER MENU
     ---------------------------------------------------------- */
  const hamburger     = document.getElementById('hamburger');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const navLinks      = document.getElementById('nav-links');

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    if (hamburgerIcon) {
      hamburgerIcon.className = navLinks.classList.contains('active')
        ? 'fas fa-times'
        : 'fas fa-bars';
    }
  });

  // Close on nav link click (mobile)
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (hamburgerIcon) hamburgerIcon.className = 'fas fa-bars';
    });
  });

  /* ----------------------------------------------------------
     SMOOTH SCROLL for anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const scrollBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    if (!scrollBar) return;
    const scrolled  = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (scrolled / docHeight * 100) + '%';
  }, { passive: true });

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — scroll reveal
     ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     PROGRESS BARS — animate width on scroll
     ---------------------------------------------------------- */
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill  = entry.target;
        const width = fill.getAttribute('data-width') || '0';
        // Small delay so reveal animation runs first
        setTimeout(() => { fill.style.width = width + '%'; }, 200);
        progressObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.progress-fill').forEach(el => progressObserver.observe(el));

  /* ----------------------------------------------------------
     STAT COUNTERS — animate numbers in hero
     ---------------------------------------------------------- */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const start  = parseInt(el.textContent, 10) || 0;
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => statObserver.observe(el));

  /* ----------------------------------------------------------
     SCROLL SPY — highlight active nav link
     ---------------------------------------------------------- */
  const navAnchorEls = document.querySelectorAll('.nav-links a[href^="#"]');
  const spySections  = [...navAnchorEls]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchorEls.forEach(a => a.classList.remove('nav-active'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('nav-active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  spySections.forEach(el => spyObserver.observe(el));

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

  function pickSet() {
    return Math.random() < 0.15 ? commandSets[2] : commandSets[Math.floor(Math.random() * 2)];
  }

  function addLine(text) {
    const div = document.createElement('div');
    div.textContent = text;
    terminalAbout.appendChild(div);
    terminalAbout.scrollTop = terminalAbout.scrollHeight;
  }

  function typeNext() {
    if (!terminalAbout) return;
    if (cmdIdx >= cmds.length) { setTimeout(restart, 4500); return; }

    const current = cmds[cmdIdx];
    if (typing) {
      if (charIdx === 0) addLine('$ ' + current.cmd);
      const last = terminalAbout.lastChild;
      if (charIdx < current.cmd.length) {
        last.textContent = '$ ' + current.cmd.slice(0, charIdx + 1);
        charIdx++;
        setTimeout(typeNext, 70 + Math.random() * 50);
      } else {
        if (current.out) addLine(current.out);
        addLine('');
        typing = false; charIdx = 0;
        setTimeout(typeNext, 400);
      }
    } else {
      typing = true; cmdIdx++;
      setTimeout(typeNext, 400);
    }
  }

  function restart() {
    if (!terminalAbout) return;
    terminalAbout.innerHTML = '';
    cmdIdx = 0; charIdx = 0; typing = true;
    cmds = [...pickSet()];
    setTimeout(typeNext, 800);
  }

  if (terminalAbout) {
    cmds = [...pickSet()];
    setTimeout(typeNext, 1200);
  }

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
    const div = document.createElement('div');
    div.textContent = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function writeEl(el) {
    if (!termOutput) return;
    termOutput.appendChild(el);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  // Progress bar animation for easter egg
  function runProgressBar(cb) {
    let pct = 0;
    writeLine('');
    const div = document.createElement('div');
    termOutput.appendChild(div);

    const iv = setInterval(() => {
      pct += 10;
      const filled = Math.floor(pct / 10);
      div.textContent = `Téléchargement... [${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${pct}%`;
      termOutput.scrollTop = termOutput.scrollHeight;
      if (pct >= 100) { clearInterval(iv); setTimeout(cb, 300); }
    }, 180);
  }

  const eggFrames = [
`   ___
  /   \\
 /     \\
(_______)
  [Egg]`,
`   ___
  /* *\\
 /* * *\\
(______*)
[Hatching]`,
`  *****
 *     *
* ( ^v^)*
 *     *
  *****
[Cracked!]`
  ];

  function runHatchAnimation() {
    let fi = 0;
    const div = document.createElement('div');
    div.style.fontFamily = 'monospace';
    div.style.whiteSpace = 'pre';
    termOutput.appendChild(div);

    const iv = setInterval(() => {
      div.textContent = eggFrames[fi];
      termOutput.scrollTop = termOutput.scrollHeight;
      fi++;
      if (fi >= eggFrames.length) {
        clearInterval(iv);
        writeLine('');
        writeLine('🎉 Félicitations ! Tu as trouvé l\'easter egg secret !');

        const btn = document.createElement('button');
        btn.textContent = '🔄 Rejouer l\'animation';
        btn.style.cssText = 'margin-top:10px;padding:6px 14px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;';
        btn.addEventListener('click', () => {
          writeLine('');
          writeLine('$ sudo apt install easteregg');
          runProgressBar(runHatchAnimation);
        });
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
    } else if (cmd === 'whoami') {
      writeLine('luka.salvo');
    } else if (cmd === 'pwd') {
      writeLine('/home/luka/portfolio');
    } else if (cmd === 'help') {
      writeLine('Commandes : ls · cd <section> · whoami · pwd · clear · help · sudo apt install easteregg');
    } else if (cmd === 'sudo' || cmd === 'sudo ') {
      writeLine('Pas de droits suffisants — contactez-moi pour en obtenir 😄');
    } else if (cmd === 'sudo apt install easteregg') {
      runProgressBar(runHatchAnimation);
    } else if (cmd.startsWith('sudo apt install')) {
      writeLine('Erreur : paquet introuvable.');
    } else if (cmd.startsWith('cd ')) {
      const name = cmd.slice(3).trim();
      const found = sections.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (found) {
        document.getElementById(found.id)?.scrollIntoView({ behavior: 'smooth' });
        writeLine(`→ Navigation vers "${found.name}"`);
      } else {
        writeLine(`Erreur : section "${name}" non trouvée. Tapez ls pour voir les sections.`);
      }
    } else if (cmd === '') {
      // do nothing
    } else {
      writeLine(`Commande non reconnue : "${raw.trim()}". Tapez help pour l'aide.`);
    }
    writeLine('');
  }

  if (termInput && termOutput) {
    writeLine('Bienvenue dans le terminal interactif !');
    writeLine('Commandes : ls · cd <section> · whoami · pwd · clear · help');
    writeLine('');

    // Command history
    const history = [];
    let histIdx = -1;

    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        if (val.trim()) history.unshift(val);
        histIdx = -1;
        handleCommand(val);
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < history.length - 1) {
          histIdx++;
          termInput.value = history[histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) {
          histIdx--;
          termInput.value = history[histIdx];
        } else {
          histIdx = -1;
          termInput.value = '';
        }
      }
    });
  }

  /* ----------------------------------------------------------
     CUSTOM CURSOR
     ---------------------------------------------------------- */
  (function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function animateRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
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
     HERO PARTICLES (canvas)
     ---------------------------------------------------------- */
  (function initParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);

    const COUNT = window.innerWidth < 768 ? 28 : 55;
    const pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r:  Math.random() * 1.2 + 0.4
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      const rgb = isDark ? '41,151,255' : '0,113,227';

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb},${0.07 * (1 - d / 115)})`;
            ctx.lineWidth   = 1;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.32)`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ----------------------------------------------------------
     3D CARD TILT
     ---------------------------------------------------------- */
  (function initTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  /* ----------------------------------------------------------
     HERO TITLE TEXT SCRAMBLE
     ---------------------------------------------------------- */
  (function initScramble() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = document.querySelector('.hero-title');
    if (!el) return;
    const FINAL = el.textContent;
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&';
    let frame = 0;
    const TOTAL = 20;

    setTimeout(() => {
      const iv = setInterval(() => {
        const progress = frame / TOTAL;
        el.textContent = FINAL.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i / FINAL.length < progress) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++frame > TOTAL) { clearInterval(iv); el.textContent = FINAL; }
      }, 42);
    }, 450);
  })();

});
