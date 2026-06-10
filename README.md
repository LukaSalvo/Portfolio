# Portfolio — Luka Salvo

[![CI](https://github.com/LukaSalvo/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/LukaSalvo/Portfolio/actions/workflows/ci.yml)

Site vitrine personnel présentant mon parcours, mes compétences et mes projets.
Futur apprenti ingénieur à l'**IMT Nord Europe** (2026-2029), spécialisé en
administration système, cybersécurité et DevOps.

🔗 **Démo en ligne : [lukasalvo.netlify.app](https://lukasalvo.netlify.app/)**

## ✨ Fonctionnalités

- 🎨 Design moderne avec grille *bento* pour les projets
- 🌗 Thème sombre / clair
- 🎬 Animations au scroll avec **GSAP** (ScrollTrigger)
- 💻 Terminal interactif intégré
- 🥚 Easter egg caché (saurez-vous le trouver ?)
- 📱 Entièrement responsive
- ♿ Attributs ARIA et HTML sémantique

## 🛠️ Stack technique

| Composant   | Technologie                  |
|-------------|------------------------------|
| Structure   | HTML5 sémantique             |
| Style       | CSS3 (variables, grid, flex) |
| Interactions| JavaScript vanilla           |
| Animations  | GSAP + ScrollTrigger (CDN)   |
| Icônes      | Font Awesome                 |
| Hébergement | Netlify                      |

Aucun framework, aucun build : le site est 100 % statique.

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
- **Lint JS** — ESLint (config navigateur, globales GSAP déclarées)
- **Liens cassés** — lychee scanne tous les liens du site (les repos privés
  et les codes anti-bot type LinkedIn sont exclus)

## 📂 Structure du projet

```
Portfolio/
├── index.html          # Page unique du site
├── style.css           # Styles (thèmes, animations, responsive)
├── script.js           # Interactions, terminal, easter egg
├── img/                # Captures des projets, avatar, OG image
├── pdf/                # Rapports de stage
└── .github/
    └── workflows/
        └── ci.yml      # Pipeline de vérification
```

## 📬 Contact

- 💼 [LinkedIn](https://www.linkedin.com/in/luka-salvo-289b10291/)
- 🐙 [GitHub](https://github.com/LukaSalvo)

> 🎯 En recherche d'une **alternance de 3 ans à partir de septembre 2026**
> (rythme 2 semaines école / 5 semaines entreprise).
