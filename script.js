/* ============================================================
   Portfolio Luka Salvo — interactions
   1. Hero "Hover members" : texte animé lettre à lettre
   2. Curseur personnalisé avec label
   3. Focus parallax au scroll
   4. Projets ExpandOnHover vertical
   5. Compétences extensibles (accordéon)
   6. Apparition des sections au scroll
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
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = "1";
    el.addEventListener("mouseenter", () => {
      cursorLabel.textContent = el.dataset.cursor;
      cursor.classList.add("is-active");
    });
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
  document.querySelectorAll("[data-hover]").forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = "1";
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
    eggBody.innerHTML = "";
    let li = 0;

    function nextLine() {
      if (li >= EGG_LINES.length) return;
      const spec = EGG_LINES[li++];
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
