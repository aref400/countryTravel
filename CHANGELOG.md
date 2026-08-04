# Journal des versions — CountryTravel

Toutes les évolutions notables de l'application sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/). Chaque version regroupe un jalon de livraison (ensemble de pull requests fusionnées sur `main`). Le détail des correctifs est tenu dans le [plan de correction des bogues](docs/plan-correction-bogues.md) ; les scénarios de validation dans le [cahier de recettes](docs/cahier-recettes.md).

## [Non publié]

Travaux du Bloc 4 (maintien en condition opérationnelle).

### Ajouté

- **Supervision — endpoints de santé** : `GET /api/v1/health` (readiness, teste la connexion PostgreSQL et mesure son temps de réponse) et `GET /api/v1/health/live` (liveness). Construits avec `@nestjs/terminus`. Cible du moniteur d'uptime externe.
- **Supervision — Sentry** : intégration de `@sentry/nestjs` (API) et `@sentry/react` (front) pour la capture des erreurs applicatives, activée par variable d'environnement (`SENTRY_DSN` / `VITE_SENTRY_DSN`).
- **Documentation de supervision** : [docs/supervision.md](docs/supervision.md) (sondes, indicateurs, seuils d'alerte, modalités de signalement).
- **Consignation des anomalies** : gabarit d'issue GitHub « rapport de bogue » ([.github/ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE/)) pour outiller la collecte.
- **Journal des versions** : ce fichier.

## [0.4.0] — 2026-07-24

Robustesse et documentation projet (préparation du dossier Bloc 2).

### Corrigé

- **BUG-11** : validation du secret `JWT_REFRESH_SECRET` au démarrage, pour transformer un échec 500 tardif en erreur explicite au boot. Voir [plan de correction des bogues](docs/plan-correction-bogues.md).

### Sécurité

- Correction d'une vulnérabilité critique remontée par `npm audit` sur une dépendance transitive.

### Documentation

- Rédaction du dossier Bloc 2, des manuels (déploiement, utilisation, mise à jour), de la documentation qualité/performance et sécurité/accessibilité ; clarification des README.

## [0.3.0] — 2026-07-17

Carte mondiale, espace utilisateur, avis, et mise en place de la démarche qualité.

### Ajouté

- **Carte mondiale interactive** (CT-018) des pays.
- **Module « pays visités »** (CT-019) : l'utilisateur marque les pays visités.
- **Module « avis »** (CT-020) : notes et commentaires sur les pays.
- **Page de profil** (CT-021) et affichage avis + marquage « visité » sur la page pays (CT-022).
- **Pipeline de tests en CI** (`pr.yml`) : lint, tests et build des deux applications sur chaque PR.
- **Tests front** (Vitest) et **suite de tests API** (Jest) avec seuil de couverture.
- **Accessibilité et sécurité** : ajout de leviers d'accessibilité, page 404 dédiée, boutons « réessayer » sur les erreurs. Voir [sécurité et accessibilité](docs/securite-accessibilite.md).

### Corrigé

- **BUG-05** à **BUG-10** : échec de build CI sur la page aléatoire, page blanche sur URL inconnue, message de validation du mot de passe erroné, seed dépendant d'une API externe dépréciée, absence de retour après sauvegarde d'une recommandation, expiration de session silencieuse. Détail dans le [plan de correction des bogues](docs/plan-correction-bogues.md).

## [0.2.0] — 2026-05-14

Moteur de recommandation et catalogue de pays côté interface.

### Ajouté

- **Catalogue de pays** (CT-013) : liste paginée et page de détail d'un pays.
- **Recommandation** (CT-014) : endpoint de recommandation et tirage aléatoire d'un pays.
- **Gestion des recommandations sauvegardées** (CT-015) : endpoints save / delete / getById / getAll et formulaire de recommandation.
- **Affichage des recommandations et de la page aléatoire** (CT-016), sauvegarde côté front (CT-017), barre de navigation.

### Corrigé

- **BUG-01** : crash sur JSON de cache invalide (`sessionStorage`).
- **BUG-02** : perte de session après rechargement (token non persisté).
- **BUG-03** : perte du contexte du formulaire au retour arrière navigateur.
- **BUG-04** : erreur 404 sur les URLs directes hors page d'accueil (routage SPA Netlify).

## [0.1.0] — 2026-04-23

Fondations du projet et premières fonctionnalités.

### Ajouté

- **Socle technique** : monorepo NestJS (API) + React/Vite (front), ORM Prisma sur PostgreSQL.
- **Intégration et déploiement continus** : pipelines de déploiement API (Railway) et front (Netlify).
- **Authentification** (CT-05, CT-07) : API d'inscription / connexion et écrans associés côté front.
- **Données de référence** (CT-08, CT-09) : seed d'importation des pays et de leurs critères.
- **API pays et moteur de score** (CT-010, CT-011) : endpoints des pays et scoring engine.
- **Page d'accueil** (CT-012) et descriptions des pays.

[Non publié]: https://github.com/aref400/countryTravel/compare/main...HEAD
