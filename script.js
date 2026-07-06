/* ============================================================
   Portfolio Luka Salvo — interactions
   1. Hero "Hover members" : texte animé lettre à lettre
   2. Curseur personnalisé avec label
   3. Focus parallax au scroll
   4. Projets ExpandOnHover vertical
   5. Compétences extensibles (accordéon)
   6. Apparition des sections au scroll
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

/* ---------- 5. Compétences : blocs extensibles ----------
   Clic sur une carte : elle s'ouvre (accordéon fluide), une seule
   carte ouverte à la fois.                                       */
const features = document.querySelectorAll(".feature");

features.forEach((feature) => {
  const toggle = () => {
    const isOpen = feature.classList.contains("is-open");
    features.forEach((f) => f.classList.remove("is-open"));
    if (!isOpen) feature.classList.add("is-open");
  };
  feature.addEventListener("click", toggle);
  feature.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
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
