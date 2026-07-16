# CountryTravel

Application web d'aide au choix de destination de voyage : fiches pays, moteur de recommandation personnalisé, carte mondiale interactive et avis communautaires.

Projet support de la certification **« Expert(e) en Développement Logiciel »** (RNCP39583, Ynov Campus).

## Lancer le projet en 5 commandes

Prérequis : Node.js ≥ 20. Docker Desktop (optionnel, pour la base locale).

```bash
docker compose up -d                      # 1. PostgreSQL local (ou utilisez votre propre base)
cp apps/api/.env.example apps/api/.env    # 2. puis renseigner les secrets JWT dans le fichier
npm install                               # 3. dépendances des 3 workspaces
npm run db:setup                          # 4. migrations + données (30 pays)
npm run dev                               # 5. API :3000 + front :5173
```

Détail complet et alternatives (sans Docker, application déployée) : [manuel de déploiement](docs/manuel-deploiement.md).

## Structure

| Dossier           | Contenu                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `apps/api`   | API REST — NestJS 11, Prisma 7, PostgreSQL ([README](apps/api/README.md)) |
| `apps/front` | Interface — React 18, TypeScript, Vite ([README](apps/front/README.md))   |
| `docs/`      | Documentation projet (voir ci-dessous)                                    |

## Documentation

- [Manuel de déploiement](docs/manuel-deploiement.md) — installation, environnements, CI/CD
- [Manuel d'utilisation](docs/manuel-utilisation.md) — fonctionnalités côté utilisateur
- [Manuel de mise à jour](docs/manuel-mise-a-jour.md) — dépendances, migrations, données, rollback
- [Cahier de recettes](docs/cahier-recettes.md) — scénarios de tests fonctionnels
- [Plan de correction des bogues](docs/plan-correction-bogues.md) — anomalies analysées et corrigées
- [Sécurité et accessibilité](docs/securite-accessibilite.md) — mapping OWASP Top 10 et démarche RGAA
- [Critères de qualité et de performance](docs/qualite-performance.md) — outillage, seuils, portails de vérification

## Qualité

- Tests unitaires : Jest (API) et Vitest + React Testing Library (front)
- CI : lint + tests + build sur chaque pull request (`.github/workflows/pr.yml`)
- Déploiement continu : Railway (API) et Netlify (front) sur push `main`
