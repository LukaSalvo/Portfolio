# Portfolio — Luka Salvo

[![CI](https://github.com/LukaSalvo/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/LukaSalvo/Portfolio/actions/workflows/ci.yml)

Site vitrine personnel présentant mon parcours, mes compétences et mes projets.
Apprenti ingénieur à l'**IMT Nord Europe** (2026-2029), spécialisé en
administration système, cybersécurité et DevOps.

🔗 **Démo en ligne : [lukasalvo.netlify.app](https://lukasalvo.netlify.app/)**

## ✨ Fonctionnalités

- 🖤 Design éditorial sombre — typographie **Anton** / **Space Grotesk**
- 🎯 Hero interactif : les projets survolés réécrivent le titre lettre à lettre
- 🎬 Section *focus* en parallax cinématique au scroll (clip-path animé)
- 🌀 Scroll stories GSAP : parallax de sortie du hero, skew par vélocité,
  marquees réactifs, titres révélés lettre à lettre, cascades scrubbed
- ✨ Champ de particules génératif dans le hero (canvas, réactif au
  scroll et au curseur — inspiré de experiments.p5aholic.me)
- 🗂️ Projets en panneaux verticaux extensibles au survol
- 🪗 Compétences en cartes accordéon
- 🖱️ Curseur personnalisé avec labels contextuels
- 📱 Entièrement responsive
- ♿ HTML sémantique, ARIA, support `prefers-reduced-motion`

## 🛠️ Stack technique

| Composant   | Technologie                  |
|-------------|------------------------------|
| Structure   | HTML5 sémantique             |
| Style       | CSS3 (variables, grid, flex) |
| Interactions| JavaScript vanilla           |
| Scroll      | GSAP + ScrollTrigger (vendorés) |
| Hébergement | Netlify                      |

Aucun framework, aucun build : le site est 100 % statique. GSAP est
vendoré dans `js/vendor/` — aucune dépendance CDN au runtime.

## 🚀 Lancer en local

```bash
git clone https://github.com/LukaSalvo/Portfolio.git
cd Portfolio

# Ouvrir directement index.html dans un navigateur, ou servir le dossier :
python3 -m http.server 8000
# → http://localhost:8000
```

## ✅ Intégration continue

Une pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute à chaque
push et pull request sur `main` :

- **Lint HTML** — HTMLHint
- **Lint CSS** — Stylelint (règles cosmétiques désactivées, seuls les vrais
  problèmes font échouer le build)
- **Lint JS** — ESLint (config navigateur)
- **Liens cassés** — lychee scanne tous les liens du site (les repos privés
  et les codes anti-bot type LinkedIn sont exclus)

## 📂 Structure du projet

```
Portfolio/
├── index.html          # Page unique du site
├── style.css           # Styles (animations, responsive)
├── script.js           # Interactions (hero, parallax, panneaux, curseur)
├── scroll.js           # Scroll stories GSAP + champ de particules canvas
├── js/vendor/          # GSAP & ScrollTrigger (v3.13.0, vendorés)
├── img/                # Captures des projets, avatar, OG image
├── pdf/                # CV, rapports de stage, certificats
└── .github/
    └── workflows/
        └── ci.yml      # Pipeline de vérification
```

## 📬 Contact

- 💼 [LinkedIn](https://www.linkedin.com/in/luka-salvo-289b10291/)
- 🐙 [GitHub](https://github.com/LukaSalvo)
