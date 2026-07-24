# Critères de qualité et de performance — CountryTravel

## Objectif

Ce document répond à la compétence **C2.1.1** du référentiel de certification : *« Mettre en œuvre des environnements de déploiement et de test en y intégrant les outils de suivi de performance et de qualité afin de permettre le bon déroulement de la phase de développement du logiciel. »*

Il décrit l'environnement de développement et les outils mobilisés, définit les critères de qualité et de performance retenus, et explique comment ils sont **vérifiés automatiquement**. Le protocole de déploiement continu, également attendu par cette compétence, est détaillé dans le [manuel de déploiement](./manuel-deploiement.md#6-déploiement-continu-github-actions).

---

## 1. Environnement de développement et outils mobilisés

| Composant | Outil retenu | Rôle |
|---|---|---|
| Éditeur de code | VS Code (configuration versionnée : `.vscode/settings.json`) | Développement, extensions ESLint/Prettier |
| Langage | TypeScript 5.7 (mode `strict`) | Typage statique sur l'ensemble du code |
| Compilateur | `tsc` (API, via `nest build`) et Vite/esbuild (front) | Compilation et vérification de types |
| Serveur d'application | NestJS 11 sur Node.js 24 (Node 20 en CI et en production) | Exécution de l'API REST |
| Base de données | PostgreSQL 17, accédée via l'ORM Prisma 7 | Persistance, migrations versionnées |
| Environnement local | Docker Compose (base PostgreSQL jetable) | Reproductibilité de l'environnement de développement |
| Gestion de sources | Git + GitHub, workflow par branches et pull requests | Historique, revue, traçabilité |
| Intégration continue | GitHub Actions (`.github/workflows/pr.yml`) | Portail qualité bloquant sur chaque PR |
| Déploiement continu | GitHub Actions → Railway (API) et Netlify (front) | Livraison automatisée depuis `main` |
| Qualité de code | ESLint (`eslint.config.mjs` / `eslint.config.js`), Prettier | Normes de code, formatage |
| Tests | Jest + ts-jest (API), Vitest + React Testing Library (front) | Tests unitaires et de non-régression |
| Couverture | `jest --coverage` (API), `@vitest/coverage-v8` (front) | Mesure de la couverture de tests |
| Sécurité des dépendances | `npm audit` | Détection des vulnérabilités connues |
| Documentation d'API | Swagger / OpenAPI (`/api/docs`, désactivé en production) | Contrat d'API pour le développement et la recette |

## 2. Critères de qualité

### 2.1 Critères et seuils retenus

| Critère | Exigence | Vérification | Bloquant |
|---|---|---|---|
| Absence d'erreur de lint | 0 erreur ESLint sur les deux applications | `npm run lint` | ✅ CI (PR) |
| Compilation | Build réussi de l'API et du front, typage strict sans erreur | `npm run build` | ✅ CI (PR) |
| Tests unitaires | 100 % des tests au vert (78 tests : 53 API + 25 front) | `npm test` | ✅ CI (PR) |
| Couverture de tests (API) | ≥ 80 % lignes/instructions, ≥ 75 % fonctions, ≥ 65 % branches | `npm run test:cov --workspace=apps/api` (seuil `coverageThreshold` appliqué par Jest) | ✅ CI (PR) |
| Recette fonctionnelle | Tous les scénarios du [cahier de recettes](./cahier-recettes.md) rejoués avant livraison | Exécution manuelle | Manuel |
| Vulnérabilités des dépendances | Aucune vulnérabilité haute ou critique exploitable ; les vulnérabilités résiduelles sont analysées et documentées | `npm audit` | Manuel — voir [sécurité](./securite-accessibilite.md) |
| Sécurité applicative | Couverture des 10 catégories OWASP Top 10 | Revue documentée dans [sécurité et accessibilité](./securite-accessibilite.md) | Manuel |
| Accessibilité | Conformité RGAA sur le périmètre fonctionnel défini | Scénarios A11Y du cahier de recettes | Manuel |

### 2.2 Couverture de tests — état mesuré et stratégie

**API — couverture mesurée : 85 % des instructions, 85 % des lignes, 79 % des fonctions, 71 % des branches.**
Le périmètre de mesure exclut volontairement le client Prisma généré (`src/generated/**`), les modules de câblage NestJS (`*.module.ts`) et le point d'entrée (`main.ts`) : ce sont du code généré ou de la configuration, dont la couverture ne renseigne en rien sur la qualité des tests. Un seuil plancher (`coverageThreshold`) est fixé **légèrement en dessous du niveau atteint** : il n'entrave pas le développement mais interdit toute régression de la couverture — la CI échoue si elle repasse sous le seuil.

**Front — stratégie de couverture ciblée.** La couverture globale du front est faible (≈ 14 %) et ce chiffre est assumé, car il reflète un choix explicite :

| Couche | Couverture | Moyen de validation |
|---|---|---|
| Services d'accès à l'API (`shared/services`) | **94 %** | Tests unitaires (Vitest) |
| Utilitaires et client HTTP (`shared/lib`) | **81 %** | Tests unitaires (Vitest) |
| Store d'authentification, hooks métier | Couverts par tests dédiés | Tests unitaires (Vitest) |
| Composants de présentation, pages | Non couverts unitairement | **Recette fonctionnelle manuelle** (71 scénarios) + scénarios d'accessibilité |

Les tests unitaires du front ciblent la **logique** (transformation de données, gestion d'état, appels réseau, régressions BUG-01/02/03) là où ils apportent une valeur de non-régression réelle. Le rendu des composants est validé par la recette, plus pertinente pour de l'interface. Aucun seuil global n'est imposé au front : exiger un pourcentage sur du code de présentation produirait des tests de façade sans valeur.

## 3. Critères de performance

### 3.1 API — temps de réponse

Mesures réalisées en environnement **local** (API Node + base PostgreSQL Docker sur le poste de développement), moyenne sur 5 appels par endpoint :

| Endpoint | Temps de réponse mesuré | Exigence retenue |
|---|---|---|
| `GET /countries` (liste paginée) | 10 ms | < 300 ms |
| `GET /countries/:isoCode` (détail) | 8 ms | < 300 ms |
| `GET /countries/map/all` (données carte) | 6 ms | < 300 ms |
| `POST /recommendations/compute` (scoring) | 57 ms | < 500 ms |

Le calcul de recommandation est l'opération la plus coûteuse (scoring de l'ensemble du catalogue) et reste largement dans l'exigence. Ces valeurs étant mesurées en local, elles ne tiennent pas compte de la latence réseau ni des performances de la base hébergée : les exigences sont volontairement fixées avec une marge importante pour rester valables en production.

### 3.2 Front — poids des ressources

| Ressource | Mesure (build de production) | Exigence retenue |
|---|---|---|
| Bundle JS principal | 1 294 kB brut / **412 kB gzippé** | < 500 kB gzippé |
| CSS | 37,7 kB brut / 7,6 kB gzippé | < 50 kB gzippé |
| Polices (woff2) | 58,4 kB au total | — |

**Point de vigilance identifié** : le bundle JS dépasse le seuil d'alerte par défaut de Vite (500 kB brut) et reste à 412 kB une fois compressé, essentiellement à cause de la carte interactive (`react-simple-maps` et les données géographiques `world-atlas`). L'exigence en gzip est respectée, mais avec peu de marge.

## 4. Séquences de vérification

| Moment | Vérifications | Portail |
|---|---|---|
| Développement local | `npm run lint`, `npm test`, `npx tsc --noEmit` | Développeur |
| Ouverture d'une pull request | Lint + tests + **couverture avec seuil** + build, sur l'API et le front | **Bloquant** (`pr.yml`) |
| Avant livraison | Rejeu des scénarios du cahier de recettes concernés | Manuel |
| Après déploiement | Checklist post-déploiement du [manuel de déploiement](./manuel-deploiement.md#7-checklist-post-déploiement) | Manuel |
| Périodique | `npm audit` et mise à jour des dépendances | [Manuel de mise à jour](./manuel-mise-a-jour.md#2-mise-à-jour-des-dépendances) |

Aucune pull request ne peut être fusionnée si un seul de ces contrôles automatisés échoue : la qualité est donc garantie par l'outillage plutôt que par la discipline individuelle.

## 5. Limites connues et axes d'amélioration

- **Poids du bundle front** : le découpage de la route `/carte` en chargement différé (`React.lazy` + `Suspense`) sortirait la librairie de cartographie et ses données du bundle initial, au bénéfice de toutes les autres pages. Amélioration identifiée, non mise en œuvre à ce stade.
- **Couverture du front non imposée en CI** : la mesure est disponible (`npm run test:cov`) mais aucun seuil n'est appliqué, conformément à la stratégie exposée en 2.2. Un seuil ciblé sur la seule couche logique pourrait être introduit.
- **Absence de supervision en production** : les critères de performance sont vérifiés lors du développement, mais aucune sonde ne mesure les temps de réponse réels en production. Ce volet relève du monitoring (Bloc 4).
- **Pas de test de charge** : les mesures portent sur des appels unitaires, sans concurrence. L'application n'a pas été éprouvée sous charge.
