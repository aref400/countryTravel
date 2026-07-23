# CountryTravel

Application web d'aide au choix de destination de voyage : un moteur de recommandation
personnalisé propose un **top 5 de pays** selon les préférences du voyageur, complété par
une carte mondiale interactive, des fiches pays détaillées et un volet communautaire
(pays visités, avis notés).

Projet support de la certification **« Expert(e) en Développement Logiciel »**
(RNCP39583, Ynov Campus).

![Page d'accueil de CountryTravel](docs/images/page-accueil.png)

## À propos

Choisir sa prochaine destination est difficile : trop de critères (budget, sécurité,
climat, type d'expérience) et trop d'options. CountryTravel répond à un questionnaire de
préférences par un classement de destinations **scoré de 0 à 100**, transparent et
personnalisé. L'application est utilisable **sans compte** pour toute la partie
consultation et recommandation ; un compte débloque la sauvegarde et le tableau de bord.

## Fonctionnalités

- **Moteur de recommandation** — questionnaire multi-étapes → top 5 de pays scorés (filtres éliminatoires puis pondération)
- **Catalogue** de 30 pays avec fiches détaillées (budget, sécurité, climat, expériences)
- **Carte mondiale interactive** colorée selon les notes de la communauté (accessible au clavier)
- **Destination aléatoire** pour se laisser surprendre
- **Espace membre** — authentification JWT, sauvegarde des recommandations, pays visités, avis notés, tableau de bord personnel

## Stack technique

| Couche | Technologies |
| --- | --- |
| API | NestJS 11, Prisma 7, PostgreSQL |
| Front | React 18, TypeScript, Vite, Zustand, TailwindCSS |
| Qualité / Ops | Jest, Vitest, GitHub Actions (CI/CD), Railway + Netlify |

## Démarrage rapide (Docker)

**Prérequis** : Node.js ≥ 20. Docker Desktop (pour la base PostgreSQL locale).

```bash
git clone https://github.com/aref400/countryTravel.git && cd countryTravel
docker compose up -d                      # 1. PostgreSQL 17 en local
cp apps/api/.env.example apps/api/.env    # 2. créer le fichier d'environnement de l'API
npm install                               # 3. dépendances (workspaces) + client Prisma
npm run db:setup                          # 4. migrations + données (30 pays)
npm run dev                               # 5. API :3000 + front :5173
```

**Étape 2 — générer les deux secrets JWT.** `JWT_SECRET` et `JWT_REFRESH_SECRET` doivent
être **deux valeurs distinctes** (l'API refuse de démarrer si l'une manque). Lancez l'une
de ces commandes **deux fois** et reportez chaque sortie dans `apps/api/.env` :

```bash
openssl rand -base64 64
# ou, si openssl est absent (fréquent sous Windows) :
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### Vérifier que tout tourne

| Adresse | Attendu |
| --- | --- |
| http://localhost:5173 | Page d'accueil CountryTravel |
| http://localhost:3000/api/v1/countries | JSON, 30 pays |
| http://localhost:3000/api/docs | Documentation Swagger (dev uniquement) |

Alternatives (sans Docker, ou application déjà déployée) : [manuel de déploiement](docs/manuel-deploiement.md).

## Structure du dépôt

| Dossier | Contenu |
| --- | --- |
| `apps/api` | API REST — NestJS 11, Prisma 7, PostgreSQL ([README](apps/api/README.md)) |
| `apps/front` | Interface — React 18, TypeScript, Vite ([README](apps/front/README.md)) |
| `docs/` | Documentation projet (voir ci-dessous) |

## Documentation

- [Manuel de déploiement](docs/manuel-deploiement.md) — installation, environnements, CI/CD
- [Manuel d'utilisation](docs/manuel-utilisation.md) — fonctionnalités côté utilisateur
- [Manuel de mise à jour](docs/manuel-mise-a-jour.md) — dépendances, migrations, données, rollback
- [Cahier de recettes](docs/cahier-recettes.md) — 125 scénarios de tests fonctionnels
- [Plan de correction des bogues](docs/plan-correction-bogues.md) — anomalies analysées et corrigées
- [Sécurité et accessibilité](docs/securite-accessibilite.md) — mapping OWASP Top 10 et démarche RGAA
- [Critères de qualité et de performance](docs/qualite-performance.md) — outillage, seuils, portails de vérification

## Qualité

- **Tests unitaires** : Jest (API) et Vitest + React Testing Library (front)
- **Intégration continue** : lint + tests + build sur chaque pull request (`.github/workflows/pr.yml`)
- **Déploiement continu** : Railway (API) et Netlify (front) sur push `main`
