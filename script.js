/* ============================================================
   Portfolio Luka Salvo — interactions
   1. Hero "Hover members" : texte animé lettre à lettre
   2. Curseur personnalisé avec label
   3. Focus parallax au scroll
   4. Projets ExpandOnHover vertical
   5. Compétences extensibles (accordéon)
   6. Apparition des sections au scroll
      6 bis. À propos : texte mot à mot + pipeline CI rejouable,
      ligne svg dessinée au scroll, traînée d'images au curseur
   7. Dynamic Island : navigation, section courante, progression
      de lecture, repli au scroll descendant
   8. Parcours : pile de cartes au scroll (card stack)
   9. Expériences : words preloader piloté au scroll
   10. Certifications : text roll au survol
   11. Easter egg : terminal secret (taper « root » sur la page)
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- 1. Hero : texte animé lettre par lettre ---------- */
const heroTitle = document.getElementById("heroTitle");
const defaultName = heroTitle.textContent.trim();
let currentName = defaultName;
let swapTimeout = null;

function renderChars(text) {
  heroTitle.innerHTML = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";
    span.style.setProperty("--i", i);
    span.textContent = ch === " " ? " " : ch;
    heroTitle.appendChild(span);
  });
}

function swapName(newName) {
  if (newName === currentName) return;
  currentName = newName;

  if (prefersReducedMotion) {
    renderChars(newName);
    return;
  }

  const chars = heroTitle.querySelectorAll(".char");
  chars.forEach((c) => c.classList.add("out"));

  clearTimeout(swapTimeout);
  const outDuration = 350 + chars.length * 18;
  swapTimeout = setTimeout(() => {
    renderChars(currentName);
  }, Math.min(outDuration, 500));
}

renderChars(defaultName);

document.querySelectorAll(".member").forEach((member) => {
  const show = () => {
    heroTitle.classList.add("is-hovering");
    swapName(member.dataset.name);
  };
  const hide = () => {
    heroTitle.classList.remove("is-hovering");
    swapName(defaultName);
  };
  member.addEventListener("mouseenter", show);
  member.addEventListener("focus", show);
  member.addEventListener("mouseleave", hide);
  member.addEventListener("blur", hide);
  // Clic : navigation vers la section projets
  member.addEventListener("click", () => {
    const target = document.querySelector(member.dataset.target || "#projets");
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});

/* ---------- Bascule mode jour / nuit ----------
   Le thème initial est posé sur <html> par un script inline dans le
   <head> (localStorage puis prefers-color-scheme) pour éviter le flash. */
const themeToggle = document.getElementById("themeToggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  if (themeMeta) themeMeta.content = theme === "light" ? "#f1ead6" : "#101010";
}

applyTheme(document.documentElement.dataset.theme || "dark");
themeToggle.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

/* ---------- 2. Curseur personnalisé ---------- */
const cursor = document.getElementById("cursor");
const cursorLabel = document.getElementById("cursorLabel");

function bindCursorTargets() {
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener("mouseenter", () => {
      cursorLabel.textContent = el.dataset.cursor;
      cursor.classList.add("is-active");
    });
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
  document.querySelectorAll("[data-hover]").forEach((el) => {
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener("mouseenter", () => {
      cursorLabel.textContent = "";
      cursor.classList.add("is-active");
      cursor.style.width = "40px";
      cursor.style.height = "40px";
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
      cursor.style.width = "";
      cursor.style.height = "";
    });
  });
}

if (finePointer) {
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  (function animateCursor() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  })();
  bindCursorTargets();
}

/* ---------- 3. Focus : parallax cinématique au scroll ----------
   Progression 0 → 1 sur la hauteur de la section :
   - le clip-path passe d'un petit cadre arrondi à plein écran
   - l'image dé-zoome (1.4 → 1)
   - le titre s'éloigne et disparaît                             */
const showreel = document.querySelector(".showreel");
const showreelFrame = document.getElementById("showreelFrame");
const showreelImg = document.getElementById("showreelImg");
const showreelTitle = document.getElementById("showreelTitle");

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
// Easing douce pour un rendu cinématique
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function updateShowreel() {
  const rect = showreel.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const raw = clamp01(-rect.top / total);
  const p = easeInOut(raw);

  // Cadre : inset 38% -> 0%, rayon 24px -> 0
  showreelFrame.style.setProperty("--clip-x", lerp(38, 0, p) + "%");
  showreelFrame.style.setProperty("--clip-y", lerp(38, 0, p) + "%");
  showreelFrame.style.setProperty("--clip-r", lerp(24, 0, p) + "px");

  // Image : dé-zoom progressif
  showreelImg.style.setProperty("--img-scale", lerp(1.4, 1, p));

  // Titre : monte, rétrécit et s'efface sur la première moitié
  const t = clamp01(raw * 2);
  showreelTitle.style.setProperty("--title-o", 1 - t);
  showreelTitle.style.setProperty("--title-y", -t * 120 + "px");
  showreelTitle.style.setProperty("--title-s", lerp(1, 0.85, t));
}

if (!prefersReducedMotion && showreel) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateShowreel();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  updateShowreel();
}

/* ---------- 4. Projets : ExpandOnHover vertical ----------
   Le panneau survolé/focus/cliqué reçoit .is-open ; les autres
   se compriment (piloté par flex en CSS).                    */
const panels = document.querySelectorAll(".panel");

function openPanel(panel) {
  panels.forEach((p) => p.classList.toggle("is-open", p === panel));
}

panels.forEach((panel) => {
  if (finePointer) {
    panel.addEventListener("mouseenter", () => openPanel(panel));
  }
  // Clic / tap (mobile) et clavier
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) return; // laisser les liens fonctionner
    openPanel(panel);
  });
  panel.addEventListener("focus", () => openPanel(panel));
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPanel(panel);
    }
  });
});

/* ---------- 5. Compétences : feature block façon Apple ----------
   Clic sur une carte : elle se déplie (une seule ouverte à la fois)
   et l'illustration de la scène change en fondu. */
const feats = document.querySelectorAll(".feat");
const showcaseVisuals = document.querySelectorAll(".showcase__visual");

function openFeat(feat) {
  feats.forEach((f) => {
    const open = f === feat;
    f.classList.toggle("is-open", open);
    f.querySelector(".feat__head").setAttribute("aria-expanded", open);
  });
  showcaseVisuals.forEach((v) =>
    v.classList.toggle("is-active", v.dataset.for === feat.dataset.idx)
  );
}

feats.forEach((feat) => {
  feat.querySelector(".feat__head").addEventListener("click", () => openFeat(feat));
});

/* ---------- 7. Dynamic Island ----------
   La pastille affiche la section courante ; au survol (desktop) ou
   au tap (mobile) elle se déploie et révèle les liens. Un rebond
   accompagne chaque changement de section, le libellé roule
   verticalement, une fine ligne trace la progression de lecture et
   l'île s'éclipse quand on descend (elle revient dès qu'on remonte). */
const island = document.getElementById("island");
const islandStatus = document.getElementById("islandStatus");
const islandProgress = document.getElementById("islandProgress");

if (island) {
  if (finePointer) {
    island.addEventListener("mouseenter", () => island.classList.add("is-open"));
    island.addEventListener("mouseleave", () => island.classList.remove("is-open"));
  }
  // Tap sur la pastille (mobile) : bascule ouvert / fermé
  island.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    island.classList.toggle("is-open");
  });
  // Navigation clavier : l'île s'ouvre au focus
  island.addEventListener("focusin", () => island.classList.add("is-open"));
  island.addEventListener("focusout", (e) => {
    if (!island.contains(e.relatedTarget)) island.classList.remove("is-open");
  });
  // Clic hors de l'île ou touche Échap : on referme (surtout mobile)
  document.addEventListener("click", (e) => {
    if (island.classList.contains("is-open") && !island.contains(e.target)) {
      island.classList.remove("is-open");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") island.classList.remove("is-open");
  });
  // Clic sur un lien : on referme
  const islandLinks = island.querySelectorAll(".island__row a");
  islandLinks.forEach((a) =>
    a.addEventListener("click", () => island.classList.remove("is-open"))
  );

  // Libellé de section : roulement vertical (le texte change à mi-course)
  let statusTimer = null;
  function setIslandStatus(label) {
    if (prefersReducedMotion) {
      islandStatus.textContent = label;
      return;
    }
    islandStatus.classList.remove("is-swapping");
    void islandStatus.offsetWidth; // relance l'animation
    islandStatus.classList.add("is-swapping");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (islandStatus.textContent = label), 230);
  }

  // Scrollspy : la section qui traverse le centre de l'écran
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const label = entry.target.dataset.islandLabel;
        if (islandStatus.textContent !== label) {
          setIslandStatus(label);
          if (!prefersReducedMotion) {
            island.classList.remove("bounce");
            void island.offsetWidth; // relance l'animation
            island.classList.add("bounce");
          }
        }
        islandLinks.forEach((a) => {
          const active = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("is-active", active);
          if (active) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  document.querySelectorAll("[data-island-label]").forEach((s) => spy.observe(s));

  // Progression de lecture + repli au scroll descendant
  let lastScrollY = window.scrollY;
  let islandTicking = false;

  function updateIsland() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    islandProgress.style.transform = `scaleX(${max > 0 ? clamp01(y / max) : 0})`;

    if (island.classList.contains("is-open") || y < 120) {
      island.classList.remove("is-hidden");
    } else if (y > lastScrollY + 6 && y > 320) {
      island.classList.add("is-hidden");
    } else if (y < lastScrollY - 6) {
      island.classList.remove("is-hidden");
    }
    lastScrollY = y;
  }

  window.addEventListener("scroll", () => {
    if (!islandTicking) {
      requestAnimationFrame(() => {
        updateIsland();
        islandTicking = false;
      });
      islandTicking = true;
    }
  }, { passive: true });
  updateIsland();
}

/* ---------- 8. Parcours : pile de cartes au scroll ----------
   Chaque carte qui monte recouvre la précédente ; les cartes déjà
   posées rétrécissent proportionnellement (effet card stack). */
const stackItems = [...document.querySelectorAll(".stack__item")];

if (stackItems.length && !prefersReducedMotion) {
  const stackCards = stackItems.map((item) => item.querySelector(".stack__card"));

  function updateStack() {
    const vh = window.innerHeight;
    const progress = stackItems.map((item) =>
      clamp01(1 - item.getBoundingClientRect().top / vh)
    );
    stackCards.forEach((card, i) => {
      let cover = 0;
      for (let j = i + 1; j < progress.length; j++) cover += progress[j];
      card.style.setProperty("--s", (1 - Math.min(cover * 0.05, 0.18)).toFixed(4));
    });
  }

  let stackTicking = false;
  window.addEventListener("scroll", () => {
    if (!stackTicking) {
      requestAnimationFrame(() => {
        updateStack();
        stackTicking = false;
      });
      stackTicking = true;
    }
  }, { passive: true });
  updateStack();
}

/* ---------- 9. Expériences : words preloader au scroll ----------
   La section est épinglée ; la progression du scroll choisit
   l'expérience affichée (le CSS anime l'entrée par le bas et la
   sortie par le haut — l'effet est réversible). */
const exp = document.getElementById("exp");

if (exp && !prefersReducedMotion) {
  const expItems = [...exp.querySelectorAll(".exp__item")];
  const expIndex = document.getElementById("expIndex");
  const expTotal = document.getElementById("expTotal");
  const expBar = document.getElementById("expBar");
  // Total calculé depuis le HTML — impossible de le désynchroniser
  if (expTotal) expTotal.textContent = String(expItems.length).padStart(2, "0");
  // -1 force la première passe à poser les classes is-active / is-past,
  // même si le HTML en contient de trop (une seule carte visible à la fois)
  let expCurrent = -1;

  function updateExp() {
    const rect = exp.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p = clamp01(-rect.top / total);
    expBar.style.transform = `scaleX(${p})`;

    const idx = Math.min(expItems.length - 1, Math.floor(p * expItems.length));
    if (idx !== expCurrent) {
      expCurrent = idx;
      expItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === idx);
        item.classList.toggle("is-past", i < idx);
      });
      expIndex.textContent = String(idx + 1).padStart(2, "0");
    }
  }

  let expTicking = false;
  window.addEventListener("scroll", () => {
    if (!expTicking) {
      requestAnimationFrame(() => {
        updateExp();
        expTicking = false;
      });
      expTicking = true;
    }
  }, { passive: true });
  updateExp();
}

/* ---------- 10. Certifications : text roll au survol ----------
   Chaque lettre est doublée : la copie du dessous (teintée accent)
   remonte en cascade au survol de la ligne. */
document.querySelectorAll("[data-textroll]").forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let index = 0;

  text.split(" ").forEach((word, w, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "trword";
    wordSpan.setAttribute("aria-hidden", "true");
    [...word].forEach((ch) => {
      const charSpan = document.createElement("span");
      charSpan.className = "trchar";
      charSpan.style.setProperty("--j", index);
      const top = document.createElement("span");
      top.textContent = ch;
      const bottom = document.createElement("span");
      bottom.textContent = ch;
      charSpan.append(top, bottom);
      wordSpan.appendChild(charSpan);
      index++;
    });
    el.appendChild(wordSpan);
    if (w < words.length - 1) {
      el.appendChild(document.createTextNode(" "));
      index++;
    }
  });
});

/* ---------- 6 bis. À propos : mots en cascade + pipeline CI ----------
   Le texte d'intro est découpé en mots (chacun glisse depuis le bas
   de sa fenêtre) et les infos clés se déroulent comme une pipeline
   CI. Contrairement aux .reveal (une seule fois), l'état est remis à
   zéro dès que la section sort de l'écran : la séquence complète se
   rejoue à chaque passage — le compteur de run en témoigne. */
const about = document.getElementById("apropos");
const pipeline = document.getElementById("pipeline");
const aboutText = document.getElementById("aboutText");

function splitAboutWords() {
  // Déjà découpé (le retour au FR restaure le HTML découpé) : on sort
  if (!aboutText || aboutText.querySelector(".w")) return;
  let w = 0;
  (function wrap(root) {
    [...root.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        wrap(node); // descend dans <em> pour garder sa couleur accent
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/\s+/).forEach((word, i) => {
        if (i > 0) frag.appendChild(document.createTextNode(" "));
        if (!word) return;
        const outer = document.createElement("span");
        outer.className = "w";
        const inner = document.createElement("span");
        inner.className = "w__in";
        inner.style.setProperty("--w", w++);
        inner.textContent = word;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      root.replaceChild(frag, node);
    });
  })(aboutText);
}

if (about && !prefersReducedMotion) {
  splitAboutWords();
  const aboutSpy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        about.classList.toggle("is-inview", entry.isIntersecting)
      );
    },
    { threshold: 0.25 }
  );
  const intro = about.querySelector(".about__intro");
  if (intro) aboutSpy.observe(intro);
}

/* Ligne sinueuse « svg follow scroll » : le tracé se dessine avec la
   progression du scroll dans la section (stroke-dashoffset), dans les
   deux sens — il se retrace donc à chaque passage. */
const aboutPath = document.getElementById("aboutPath");

if (about && aboutPath && !prefersReducedMotion) {
  const pathLength = aboutPath.getTotalLength();
  aboutPath.style.strokeDasharray = pathLength;
  aboutPath.style.strokeDashoffset = pathLength;

  function updateAboutPath() {
    const rect = about.getBoundingClientRect();
    // 0 quand la section entre par le bas, 1 quand la pipeline est au
    // centre de l'écran — la ligne finit de se tracer sur son 1er nœud
    const p = clamp01((window.innerHeight * 0.85 - rect.top) / (rect.height * 0.95));
    aboutPath.style.strokeDashoffset = String(pathLength * (1 - p));
  }

  let pathTicking = false;
  window.addEventListener("scroll", () => {
    if (!pathTicking) {
      requestAnimationFrame(() => {
        updateAboutPath();
        pathTicking = false;
      });
      pathTicking = true;
    }
  }, { passive: true });
  updateAboutPath();
}

/* Traînée d'images au curseur (image cursor trail) : en survolant
   l'intro, des vignettes de projets naissent sous le pointeur tous
   les ~80 px parcourus, puis s'estompent et sont retirées du DOM. */
const aboutTrail = document.getElementById("aboutTrail");

if (about && aboutTrail && finePointer && !prefersReducedMotion) {
  const TRAIL_IMAGES = [
    "img/OSINT_MAX.png",
    "img/mac-Monitor.png",
    "img/mbash.png",
    "img/NRVProject.png",
    "img/DiagrammeClasse.png",
    "img/tableaudeBord1.png",
  ];
  const TRAIL_STEP = 80;   // distance min entre deux vignettes
  const TRAIL_MAX = 9;     // vignettes simultanées au plus
  let trailIdx = 0;
  let lastX = null;
  let lastY = null;

  const intro = about.querySelector(".about__intro");
  intro.addEventListener("mouseleave", () => { lastX = lastY = null; });
  intro.addEventListener("mousemove", (e) => {
    if (lastX === null) { lastX = e.clientX; lastY = e.clientY; return; }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (dx * dx + dy * dy < TRAIL_STEP * TRAIL_STEP) return;
    lastX = e.clientX;
    lastY = e.clientY;

    const rect = aboutTrail.getBoundingClientRect();
    const img = document.createElement("img");
    img.src = TRAIL_IMAGES[trailIdx++ % TRAIL_IMAGES.length];
    img.alt = "";
    img.style.left = e.clientX - rect.left + "px";
    img.style.top = e.clientY - rect.top + "px";
    img.style.setProperty("--tr", (Math.random() * 16 - 8).toFixed(1) + "deg");
    img.addEventListener("animationend", () => img.remove());
    aboutTrail.appendChild(img);
    while (aboutTrail.children.length > TRAIL_MAX) aboutTrail.firstChild.remove();
  });
}

if (pipeline && !prefersReducedMotion) {
  const pipelineRun = document.getElementById("pipelineRun");
  let runCount = 0;

  const pipeSpy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (pipeline.classList.contains("is-run")) return;
          runCount++;
          if (pipelineRun) pipelineRun.textContent = "#" + String(runCount).padStart(2, "0");
          pipeline.classList.add("is-run");
        } else {
          pipeline.classList.remove("is-run"); // reset : prêt à rejouer
        }
      });
    },
    { threshold: 0.3 }
  );
  pipeSpy.observe(pipeline);
}

/* ---------- 6. Apparition au scroll ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ---------- 11. Easter egg : terminal secret ----------
   Déclencheur : taper « root » n'importe où sur la page. Un faux
   terminal s'ouvre sur une pluie de caractères façon Matrix et
   tape ses lignes une à une. Échap, ✕ ou clic à côté pour fermer. */
const egg = document.getElementById("egg");
const eggBody = document.getElementById("eggBody");
const eggClose = document.getElementById("eggClose");
const eggRain = document.getElementById("eggRain");

if (egg) {
  const EGG_LINES = [
    { prompt: true, text: "su root" },
    { text: "Mot de passe : ••••••••" },
    { text: "ROOT ACCESS GRANTED ✔", ok: true },
    { text: "" },
    { prompt: true, text: "whoami" },
    { text: "root — mais le vrai maître des lieux, c'est Luka." },
    { text: "" },
    { text: "Bien joué, tu as trouvé le passage secret." },
    { text: "« Qui cherche root trouve. »" },
    { text: "" },
    { prompt: true, text: "./recruter_luka.sh --now" },
    { text: "→ luka.salvo23@gmail.com", link: "mailto:luka.salvo23@gmail.com" },
  ];

  // Version anglaise du terminal — choisie à l'ouverture selon <html lang>
  const EGG_LINES_EN = [
    { prompt: true, text: "su root" },
    { text: "Password: ••••••••" },
    { text: "ROOT ACCESS GRANTED ✔", ok: true },
    { text: "" },
    { prompt: true, text: "whoami" },
    { text: "root — but the real owner here is Luka." },
    { text: "" },
    { text: "Well played, you found the secret passage." },
    { text: "« Seek root and you shall find. »" },
    { text: "" },
    { prompt: true, text: "./hire_luka.sh --now" },
    { text: "→ luka.salvo23@gmail.com", link: "mailto:luka.salvo23@gmail.com" },
  ];

  let eggOpenFlag = false;
  let rainRAF = null;
  let typeTimer = null;
  let lastFocus = null;

  function startRain() {
    if (prefersReducedMotion) return;
    const ctx = eggRain.getContext("2d");
    eggRain.width = window.innerWidth;
    eggRain.height = window.innerHeight;
    const glyphs = "01アイウエオカキクケコサシスセソ<>/{}$#";
    const size = 16;
    const cols = Math.ceil(eggRain.width / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    let last = 0;

    function draw(now) {
      rainRAF = requestAnimationFrame(draw);
      if (now - last < 50) return; // ~20 fps suffisent
      last = now;
      ctx.fillStyle = "rgba(5, 5, 5, 0.12)";
      ctx.fillRect(0, 0, eggRain.width, eggRain.height);
      ctx.fillStyle = "#ff4d2e";
      ctx.font = size + "px monospace";
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y * size);
        drops[i] = y * size > eggRain.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }
    rainRAF = requestAnimationFrame(draw);
  }

  function typeLines() {
    const lines = document.documentElement.lang === "en" ? EGG_LINES_EN : EGG_LINES;
    eggBody.innerHTML = "";
    let li = 0;

    function nextLine() {
      if (li >= lines.length) return;
      const spec = lines[li++];
      const line = document.createElement("p");
      line.className = "egg__line" +
        (spec.prompt ? " egg__line--prompt" : "") +
        (spec.ok ? " egg__line--ok" : "");
      eggBody.appendChild(line);

      const commit = () => {
        if (spec.link) {
          line.textContent = "";
          const a = document.createElement("a");
          a.href = spec.link;
          a.textContent = spec.text;
          line.appendChild(a);
        } else {
          line.textContent = spec.text || " ";
        }
      };

      if (prefersReducedMotion) {
        commit();
        nextLine();
        return;
      }

      const caret = document.createElement("span");
      caret.className = "egg__caret";
      let ci = 0;
      (function typeChar() {
        line.textContent = spec.text.slice(0, ci);
        line.appendChild(caret);
        if (ci++ < spec.text.length) {
          typeTimer = setTimeout(typeChar, spec.prompt ? 45 : 14);
        } else {
          caret.remove();
          commit();
          typeTimer = setTimeout(nextLine, spec.text ? 260 : 90);
        }
      })();
    }
    nextLine();
  }

  function openEgg() {
    if (eggOpenFlag) return;
    eggOpenFlag = true;
    lastFocus = document.activeElement;
    egg.hidden = false;
    document.body.style.overflow = "hidden";
    startRain();
    typeLines();
    eggClose.focus();
  }

  function closeEgg() {
    if (!eggOpenFlag) return;
    eggOpenFlag = false;
    egg.hidden = true;
    document.body.style.overflow = "";
    cancelAnimationFrame(rainRAF);
    clearTimeout(typeTimer);
    if (lastFocus) lastFocus.focus();
  }

  eggClose.addEventListener("click", closeEgg);
  egg.addEventListener("click", (e) => {
    if (!e.target.closest(".egg__terminal")) closeEgg();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEgg();
  });

  // Déclencheur : taper « root » n'importe où sur la page
  const SECRET = "root";
  let typedBuffer = "";
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-SECRET.length);
    if (typedBuffer === SECRET) {
      typedBuffer = "";
      openEgg();
    }
  });

  // Indice pour les curieux qui ouvrent la console — bon réflexe.
  console.log(
    "%cLS.",
    "font: 800 44px 'Bricolage Grotesque', sans-serif; color: #ff4d2e;"
  );
  console.log(
    "%cCurieux ? J'aime ça. Sur ce site, l'accès %croot%c n'est pas si protégé… tape-le quelque part.",
    "font-size: 12px; color: #8d887f;",
    "font-size: 12px; color: #ff4d2e; font-weight: 700;",
    "font-size: 12px; color: #8d887f;"
  );
}

/* ---------- 12. Langue FR / EN ----------
   Le français du HTML est la langue source : au premier passage en
   anglais, chaque texte / attribut d'origine est mémorisé (Map par
   élément), puis le dictionnaire EN prend le relais. Le retour au
   français restaure l'original — aucune duplication de page. */
const langToggle = document.getElementById("langToggle");

const EN_TEXT = [
  [".skip-link", "Skip to content"],
  ["#cursorLabel", "View"],
  ['.island__row a[href="#projets"]', "Projects"],
  ['.island__row a[href="#competences"]', "Skills"],
  ['.island__row a[href="#parcours"]', "Background"],
  ['.island__row a[href="#experiences"]', "Experience"],
  [".hero__eyebrow", "Portfolio — Sysadmin · Cybersecurity · DevOps"],
  [".hero__hint", "( hover the images — then scroll )"],
  [".showreel__caption", "Flagship project — MAC Monitor"],
  [".about__text",
    "I administer <em>Unix systems</em>, secure infrastructures and automate everything that can be automated. Currently finishing a BUT in Computer Science (DACS track) before an engineering apprenticeship at IMT Nord Europe, I practice cybersecurity daily — CTF, TryHackMe, OSINT."],
  [".pipeline__stage:nth-child(1) .pipeline__label", "Role"],
  [".pipeline__stage:nth-child(1) .pipeline__value", "Sysadmin · Cybersecurity · DevOps"],
  [".pipeline__stage:nth-child(2) .pipeline__value", "Linux · Docker · Bash · Networks · GCP"],
  [".pipeline__stage:nth-child(3) .pipeline__label", "Location"],
  [".pipeline__stage:nth-child(4) .pipeline__label", "Languages"],
  [".pipeline__stage:nth-child(4) .pipeline__value", "French · German (B2) · English (B1)"],
  [".pipeline__stage:nth-child(5) .pipeline__label", "Mobility"],
  [".pipeline__stage:nth-child(5) .pipeline__value", "Driving licence"],
  [".pipeline__status-text", "pipeline passed"],
  [".projects .section__title", 'Selected<span class="accent"> projects</span>'],
  [".features .section__title", 'What I<span class="accent"> practice</span>'],
  [".journey .section__title", 'Background<span class="accent"> &amp; education</span>'],
  [".experiences .section__title", 'Work<span class="accent"> experience</span>'],
  [".certs .section__title", 'Certifications<span class="accent"> &amp; badges</span>'],
  [".panel:nth-child(1) .panel__details p",
    "Web app centralizing dozens of OSINT tools — IP, WHOIS, social networks, geolocation · Ruby · HTML/CSS"],
  [".panel:nth-child(2) .panel__details p",
    "System monitoring for macOS &amp; Linux — CPU, RAM, disk, network · Ruby · GitHub Actions CI/CD"],
  [".panel:nth-child(3) .panel__label span", "GLPI Dashboard"],
  [".panel:nth-child(3) h3", "GLPI Dashboard"],
  [".panel:nth-child(3) .panel__details p",
    "Automated IT ticket reporting — CASC internship, Sarreguemines · SQL · Access"],
  [".panel:nth-child(3) .panel__links a", "Internship report ↗"],
  [".panel:nth-child(4) .panel__details p",
    "Unix shell written in C — core commands, SAE project · C · Systems"],
  [".panel:nth-child(4) .panel__links a:nth-child(2)", "Report ↗"],
  [".panel:nth-child(5) .panel__label span", "Secure Website"],
  [".panel:nth-child(5) h3", "Secure Website"],
  [".panel:nth-child(5) .panel__details p",
    "Encryption, input validation, XSS / SQLi protection · PHP · HTML/CSS"],
  [".panel:nth-child(6) .panel__label span", "UML Generator"],
  [".panel:nth-child(6) h3", "UML Generator"],
  [".panel:nth-child(6) .panel__details p",
    "Class diagrams generated from .class files · Java · JavaFX"],
  [".projects__more-label", "Also"],
  [".projects__more a:nth-of-type(1)", "BUDGETTE — budget management, Python / JS ↗"],
  [".projects__more a:nth-of-type(2)", "Maze Game — Java / JavaFX ↗"],
  [".projects__more a:nth-of-type(3)", "This portfolio — HTML / CSS / JS ↗"],
  ['.feat[data-idx="0"] .feat__title', "System administration"],
  ['.feat[data-idx="0"] .inner',
    "<p>Installing, configuring and maintaining Linux servers — from the command line to production.</p><ul><li>Linux · Debian · Ubuntu · macOS</li><li>Bash · SSH · Nginx · Apache</li><li>Automated backups</li></ul>"],
  ['.feat[data-idx="1"] .feat__title', "Networking"],
  ['.feat[data-idx="1"] .inner',
    "<p>Designing and securing networks: segmentation, routing and firewalls on Cisco and virtualized environments.</p><ul><li>Cisco · VLANs · Routing</li><li>Firewall &amp; hardening</li><li>Marionnet — virtual networks</li></ul>"],
  ['.feat[data-idx="2"] .feat__title', "Virtualization &amp; Cloud"],
  ['.feat[data-idx="2"] .inner',
    "<p>Isolated, reproducible environments — from containers to the public cloud, with observability.</p><ul><li>Docker · Compose · Kubernetes</li><li>Vagrant · VirtualBox</li><li>GCP · Grafana · Prometheus</li></ul>"],
  ['.feat[data-idx="3"] .feat__title', "Cybersecurity"],
  ['.feat[data-idx="3"] .inner',
    "<p>Regular offensive and defensive practice: CTF, reconnaissance, exploitation, forensics and OSINT.</p><ul><li>TryHackMe — active CTF practice</li><li>OSINT · reconnaissance</li><li>Hardening &amp; OWASP best practices</li></ul>"],
  ['.feat[data-idx="4"] .feat__title', "Development"],
  ['.feat[data-idx="4"] .inner',
    "<p>From automation scripts to full applications, with version control and continuous integration.</p><ul><li>Python · Java · PHP · Ruby · C</li><li>HTML / CSS / JS · LaTeX · VBA</li><li>Git · GitHub Actions</li></ul>"],
  ['.feat[data-idx="5"] .feat__title', "AI &amp; LLM"],
  ['.feat[data-idx="5"] .inner',
    "<p>Continuous self-training on Anthropic, Google and Cisco tools — from using agents to the API.</p><ul><li>Claude Code · MCP · Subagents</li><li>Anthropic &amp; Google AI certifications</li><li>Dedicated AI Linux server (ATE internship)</li></ul>"],
  [".stack__item:nth-child(1) .stack__title", "Brevet — Highest Honours"],
  [".stack__item:nth-child(1) .stack__desc", "Collège Himmelsberg, Sarreguemines."],
  [".stack__item:nth-child(2) .stack__title", "Baccalauréat — With Honours"],
  [".stack__item:nth-child(2) .stack__desc",
    "Computer Science (NSI) &amp; Mathematics tracks, European German section. Lycée Jean de Pange, Sarreguemines."],
  [".stack__item:nth-child(3) .stack__title", "BUT in Computer Science — DACS track"],
  [".stack__item:nth-child(3) .stack__desc",
    "IUT Nancy-Charlemagne. Deployment and administration of communicating systems and networks."],
  [".stack__item:nth-child(4) .stack__title", "Computer Science &amp; Telecommunications Engineering"],
  [".stack__item:nth-child(4) .stack__desc",
    "IMT Nord Europe — work-study programme, 2 weeks school / 5 weeks company."],
  [".exp__item:nth-child(1) .exp__meta",
    '<span class="exp__tag">Seasonal</span><span class="exp__date">Jul – Aug 2026</span>'],
  [".exp__item:nth-child(1) .exp__desc",
    "Automated Windows 11 workstation deployment and production rollout of a Linux server dedicated to Artificial Intelligence. IT maintenance."],
  [".exp__item:nth-child(2) .exp__meta",
    '<span class="exp__tag">Internship</span><span class="exp__date">Apr – Jul 2026</span>'],
  [".exp__item:nth-child(2) .exp__desc",
    "Automated Windows 11 workstation deployment and production rollout of a Linux server dedicated to Artificial Intelligence."],
  [".exp__item:nth-child(3) .exp__meta",
    '<span class="exp__tag">Seasonal</span><span class="exp__date">Summer 2025</span>'],
  [".exp__item:nth-child(3) .exp__desc",
    "Mission within the IT department of the agglomeration community."],
  [".exp__item:nth-child(4) .exp__meta",
    '<span class="exp__tag">Internship</span><span class="exp__date">Feb – Apr 2025</span>'],
  [".exp__item:nth-child(4) .exp__desc",
    'GLPI dashboard with Microsoft Access and SQL — automated IT ticket reporting. <a href="pdf/main.pdf" target="_blank" rel="noopener" data-hover>Report ↗</a>'],
  [".exp__item:nth-child(5) .exp__meta",
    '<span class="exp__tag">Temp work</span><span class="exp__date">Summer 2024</span>'],
  [".exp__item:nth-child(5) .exp__desc",
    "Industrial assignments — rigour, discipline and stress management."],
  [".exp__item:nth-child(6) .exp__meta",
    '<span class="exp__tag">Seasonal</span><span class="exp__date">Summers 2022 &amp; 2023</span>'],
  [".exp__item:nth-child(6) .exp__desc",
    "Road repair — teamwork and intercultural communication in German."],
  [".exp__hint", "( scroll )"],
  [".certline__status:not(.certline__status--wip)", "Earned"],
  [".certline__status--wip", "In progress"],
  [".certs__more summary", 'All certifications <span class="accent">(15 more)</span>'],
  [".certs__list li:nth-child(5)", "Introduction to Claude Cowork — Anthropic"],
  [".certs__list li:nth-child(6)", "Introduction to Cybersecurity — Cisco Networking Academy"],
  [".certs__list li:nth-child(12)", 'Linux Unhatched — Cisco <span class="certs__wip">in progress</span>'],
  [".certs__list li:nth-child(13)", 'Network Defense — Cisco <span class="certs__wip">in progress</span>'],
  [".certs__list li:nth-child(14)", 'Introduction to Modern AI — Cisco <span class="certs__wip">in progress</span>'],
  [".certs__list li:nth-child(15)", 'Applying AI: Analyzing Customer Reviews — Cisco <span class="certs__wip">in progress</span>'],
  [".certs__credly", "See my badges on Credly ↗"],
  [".contact__eyebrow", "A project, a question?"],
  [".contact__cv", "Download my CV ↓"],
];

// Attributs (curseur, pastille, aria, alt) : FR -> EN
const EN_ATTR = {
  "Voir": "View",
  "Voir le projet": "View project",
  "Ouvrir": "Open",
  "Détails": "Details",
  "Certificat": "Certificate",
  "Déplier": "Expand",
  "Écrire": "Write",
  "Accueil": "Home",
  "Projet phare": "Flagship project",
  "À propos": "About",
  "Projets": "Projects",
  "Compétences": "Skills",
  "Parcours": "Background",
  "Expériences": "Experience",
  "Sécurité": "Security",
  "Navigation principale": "Main navigation",
  "Basculer entre mode jour et mode nuit": "Toggle light / dark mode",
  "Projet OSINT MAX": "OSINT MAX project",
  "Projet MAC Monitor": "MAC Monitor project",
  "Projet Shell mbash": "mbash shell project",
  "Projet Site Web Sécurisé": "Secure Website project",
  "Projet Générateur UML": "UML Generator project",
  "Voir MAC Monitor sur GitHub": "View MAC Monitor on GitHub",
  "MAC Monitor — projet phare": "MAC Monitor — flagship project",
  "Portrait de Luka Salvo": "Portrait of Luka Salvo",
  "Terminal secret": "Secret terminal",
  "Fermer le terminal": "Close the terminal",
  "Informations clés": "Key facts",
};
const FR_ATTR = Object.fromEntries(Object.entries(EN_ATTR).map(([fr, en]) => [en, fr]));
const I18N_ATTRS = ["data-cursor", "data-island-label", "data-name", "aria-label", "alt"];

const frTextMap = new Map();  // élément -> innerHTML français d'origine
const frAttrMap = new Map();  // élément -> { attribut: valeur française }

function applyLang(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  EN_TEXT.forEach(([selector, en]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!frTextMap.has(el)) frTextMap.set(el, el.innerHTML);
      el.innerHTML = lang === "en" ? en : frTextMap.get(el);
    });
  });

  document.querySelectorAll(I18N_ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
    if (!frAttrMap.has(el)) {
      const saved = {};
      I18N_ATTRS.forEach((a) => {
        if (el.hasAttribute(a)) saved[a] = el.getAttribute(a);
      });
      frAttrMap.set(el, saved);
    }
    Object.entries(frAttrMap.get(el)).forEach(([attr, fr]) => {
      el.setAttribute(attr, lang === "en" ? (EN_ATTR[fr] || fr) : fr);
    });
  });

  // Le texte À propos vient d'être remplacé : on le redécoupe en mots
  if (!prefersReducedMotion) splitAboutWords();

  // La pastille affiche la section courante : on la traduit aussi
  const current = islandStatus.textContent;
  islandStatus.textContent = lang === "en" ? (EN_ATTR[current] || current) : (FR_ATTR[current] || current);

  // Les liens recréés via innerHTML doivent récupérer le curseur custom
  if (finePointer) bindCursorTargets();

  langToggle.textContent = lang === "en" ? "FR" : "EN";
  langToggle.setAttribute("aria-label", lang === "en" ? "Passer en français" : "Switch to English");
}

if (langToggle) {
  langToggle.addEventListener("click", () =>
    applyLang(document.documentElement.lang === "en" ? "fr" : "en")
  );
  if (localStorage.getItem("lang") === "en") applyLang("en");
}
