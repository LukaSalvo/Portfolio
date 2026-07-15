/* ============================================================
   Portfolio Luka Salvo — scroll stories
   Animations de scroll (GSAP + ScrollTrigger) et fond génératif,
   inspirées de gsap.com/scroll et experiments.p5aholic.me :
   A. Hero : champ de particules génératif (canvas) — les points
      ondulent, s'excitent avec la vélocité du scroll et fuient
      le curseur (façon p5aholic)
   B. Hero : parallax de sortie scrubbed (vignettes / titre /
      légendes partent à des vitesses différentes)
   C. Skew par vélocité : les blocs se penchent selon la vitesse
      du scroll puis reviennent élastiquement
   D. Marquees : bandes défilantes dont vitesse et direction
      suivent la vélocité du scroll
   E. Titres de section : lettres révélées par masques, pilotées
      par le scroll (réversible)
   F. Projets : entrée en cascade des panneaux + parallax interne
      des images (object-position, sans toucher aux transforms CSS)
   G. Certifications : lignes en cascade scrubbed
   H. Contact : montée scrubbed du mail + espacement des lettres
   ============================================================ */

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- A. Champ de particules du hero (canvas) ----------
     Grille de points monochromes déplacée par des sinus superposés.
     L'amplitude gonfle avec la vélocité du scroll ; au pointeur fin,
     les points fuient le curseur. Dessin coupé hors écran. */
  (function initField() {
    const hero = document.querySelector(".hero");
    const canvas = document.getElementById("heroField");
    if (!hero || !canvas) return;
    const ctx = canvas.getContext("2d");

    let inkDim = "#8d887f";
    let accent = "#ff4d2e";
    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      inkDim = cs.getPropertyValue("--ink-dim").trim() || inkDim;
      accent = cs.getPropertyValue("--accent").trim() || accent;
    }
    readColors();
    new MutationObserver(readColors).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let w, h, gap, cols, rows;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 720 ? 34 : 26;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.max(6, Math.round(h / (w < 720 ? 64 : 52)));
    }
    resize();
    window.addEventListener("resize", resize);

    // Curseur : répulsion douce (desktop uniquement)
    let mx = -1e4, my = -1e4;
    if (fine) {
      hero.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      });
      hero.addEventListener("mouseleave", () => { mx = my = -1e4; });
    }

    // Vélocité de scroll lissée : elle nourrit amplitude et tempo
    let lastY = window.scrollY;
    let vel = 0;
    let visible = true;
    new IntersectionObserver((es) => es.forEach((e) => (visible = e.isIntersecting)))
      .observe(hero);

    const R = 140; // rayon de répulsion du curseur
    let t = 0;
    (function frame() {
      requestAnimationFrame(frame);
      const y = window.scrollY;
      vel += (Math.abs(y - lastY) - vel) * 0.06;
      lastY = y;
      if (!visible || document.hidden) return;

      t += 0.012 + Math.min(0.05, vel * 0.0012);
      const amp = 1 + Math.min(2.2, vel / 60);
      ctx.clearRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        const baseY = ((r + 1) / (rows + 1)) * h;
        const phase = r * 0.7;
        for (let c = 0; c < cols; c++) {
          const x = c * gap;
          let dy =
            Math.sin(x * 0.006 + t + phase) * 14 * amp +
            Math.sin(x * 0.013 - t * 0.8 + phase * 1.7) * 6 * amp;
          let dx = 0;
          const ddx = x - mx;
          const ddy = baseY + dy - my;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 34;
            dx += (ddx / d) * f;
            dy += (ddy / d) * f;
          }
          ctx.globalAlpha = 0.1 + 0.28 * Math.min(1, Math.abs(dy) / (22 * amp));
          ctx.fillStyle = (c * 31 + r * 7) % 97 === 0 ? accent : inkDim;
          ctx.fillRect(x + dx, baseY + dy, 2, 2);
        }
      }
      ctx.globalAlpha = 1;
    })();
  })();

  /* ---------- Le reste requiert GSAP (CDN) ---------- */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- B. Hero : parallax de sortie scrubbed ----------
     En quittant le hero, chaque étage part à sa vitesse : les
     vignettes filent vers le haut, le titre traîne vers le bas
     (profondeur), les légendes s'effacent. Les transforms restent
     sur les conteneurs — le hover CSS des vignettes reste intact. */
  gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  })
    .to(".hero__members", { yPercent: -60, ease: "none" }, 0)
    .to(".hero__title", { yPercent: 45, opacity: 0.12, ease: "none" }, 0)
    .to(".hero__eyebrow", { opacity: 0, y: -24, ease: "none" }, 0)
    .to(".hero__hint", { opacity: 0, ease: "none" }, 0)
    .to("#heroField", { opacity: 0.3, ease: "none" }, 0);

  /* ---------- C. Skew par vélocité ----------
     Classique de la vitrine ScrollTrigger : les blocs se penchent
     proportionnellement à la vitesse du scroll, puis reviennent
     à zéro avec une décélération élastique. */
  const skewEls = [".hero__members", "#expander", ".certlist"]
    .flatMap((s) => gsap.utils.toArray(s));
  if (skewEls.length) {
    gsap.set(skewEls, { transformOrigin: "center center" });
    const setters = skewEls.map((el) => gsap.quickSetter(el, "skewY", "deg"));
    const clampSkew = gsap.utils.clamp(-4, 4);
    const proxy = { s: 0 };
    ScrollTrigger.create({
      onUpdate(self) {
        const s = clampSkew(self.getVelocity() / -350);
        if (Math.abs(s) > Math.abs(proxy.s)) {
          proxy.s = s;
          gsap.to(proxy, {
            s: 0,
            duration: 0.9,
            ease: "power3.out",
            overwrite: true,
            onUpdate: () => setters.forEach((set) => set(proxy.s)),
          });
        }
      },
    });
  }

  /* ---------- D. Marquees pilotés par la vélocité ----------
     La piste boucle en continu (deux copies, -50 %) ; la vélocité
     du scroll accélère la bande et lui fait suivre la direction du
     scroll, avant un retour au régime de croisière. */
  gsap.utils.toArray(".marquee__track").forEach((track) => {
    const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 26, repeat: -1 });
    // Grande avance de lecture : la boucle peut reculer sans buter sur 0
    loop.totalTime(loop.duration() * 1000);
    let settle;
    ScrollTrigger.create({
      trigger: track.closest(".marquee"),
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const v = self.getVelocity();
        loop.timeScale(gsap.utils.clamp(-6, 6, v / 250 + (v < 0 ? -1 : 1)));
        if (settle) settle.kill();
        settle = gsap.to(loop, {
          timeScale: v < 0 ? -1 : 1,
          duration: 1.4,
          ease: "power3.out",
        });
      },
    });
  });

  /* ---------- E. Titres de section : lettres masquées scrubbed ----------
     Chaque titre est découpé en mots (masques overflow:hidden) puis en
     lettres ; les lettres montent hors de leur masque au fil du scroll,
     en cascade — réversible en remontant. Le découpage préserve les
     <span class="accent"> et se reconstruit au changement de langue. */
  const titleTweens = [];

  function unsplitTitle(el) {
    el.querySelectorAll(".st-w").forEach((w) =>
      w.replaceWith(document.createTextNode(w.textContent))
    );
    el.normalize();
  }

  function splitTitle(root) {
    [...root.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        splitTitle(node); // descend dans <span class="accent">
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const word = document.createElement("span");
        word.className = "st-w";
        [...part].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "st-c";
          c.textContent = ch;
          word.appendChild(c);
        });
        frag.appendChild(word);
      });
      root.replaceChild(frag, node);
    });
  }

  function buildTitles() {
    titleTweens.splice(0).forEach((tw) => {
      if (tw.scrollTrigger) tw.scrollTrigger.kill();
      tw.kill();
    });
    document.querySelectorAll(".section__title").forEach((title) => {
      title.classList.remove("reveal"); // GSAP remplace l'ancien reveal IO
      unsplitTitle(title);
      splitTitle(title);
      const tw = gsap.fromTo(
        title.querySelectorAll(".st-c"),
        { yPercent: 130, rotate: 6 },
        {
          yPercent: 0,
          rotate: 0,
          ease: "power2.out",
          stagger: 0.035,
          scrollTrigger: { trigger: title, start: "top 94%", end: "top 55%", scrub: 0.6 },
        }
      );
      titleTweens.push(tw);
    });
    ScrollTrigger.refresh();
  }

  buildTitles();
  // Le toggle FR/EN réécrit l'innerHTML des titres : on redécoupe après
  // (ce listener est enregistré après celui de script.js, il passe donc
  // toujours en second)
  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.addEventListener("click", buildTitles);

  /* ---------- F. Projets : cascade d'entrée + parallax interne ----------
     Les panneaux montent en cascade à l'arrivée (une fois, puis GSAP
     nettoie ses styles inline pour rendre la main aux transitions CSS
     du hover). Les images glissent dans leur cadre via object-position
     pendant toute la traversée — sans toucher à leurs transforms CSS. */
  const expander = document.getElementById("expander");
  if (expander) {
    expander.classList.remove("reveal");
    gsap.from(".panel", {
      y: 90,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.09,
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: expander, start: "top 85%", once: true },
    });
    gsap.fromTo(
      ".panel__img",
      { objectPosition: "50% 32%" },
      {
        objectPosition: "50% 68%",
        ease: "none",
        scrollTrigger: { trigger: expander, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  }

  /* ---------- G. Certifications : cascade scrubbed ----------
     Chaque ligne monte et se révèle sur sa propre fenêtre de scroll :
     la cascade suit exactement le doigt / la molette. */
  const certlist = document.querySelector(".certlist");
  if (certlist) {
    certlist.classList.remove("reveal");
    gsap.utils.toArray(".certline").forEach((line) => {
      gsap.from(line, {
        y: 70,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: line, start: "top 100%", end: "top 80%", scrub: 0.5 },
      });
    });
  }

  /* ---------- H. Contact : montée scrubbed du mail ----------
     L'accroche resserre son espacement de lettres, le mail grossit en
     montant (transform posé sur le lien : le micro-lift CSS du survol,
     posé sur le span interne, reste fonctionnel). */
  const contact = document.querySelector(".contact");
  if (contact) {
    const eyebrow = contact.querySelector(".contact__eyebrow");
    if (eyebrow) eyebrow.classList.remove("reveal");
    gsap.timeline({
      scrollTrigger: { trigger: contact, start: "top 88%", end: "top 40%", scrub: 0.6 },
    })
      .fromTo(eyebrow, { opacity: 0, letterSpacing: "0.55em" },
        { opacity: 1, letterSpacing: "0.18em", ease: "none" }, 0)
      .fromTo(".contact__mail", { y: 80, scale: 0.86, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: "none" }, 0);

    gsap.from([".contact__cv", ".contact__bottom"], {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.15,
      clearProps: "all",
      scrollTrigger: { trigger: ".contact__cv", start: "top 94%", once: true },
    });
  }
})();
