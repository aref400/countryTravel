# Dossier Bloc 2 — Concevoir et développer des applications logicielles

**Certification** : Expert(e) en Développement Logiciel (RNCP39583) — Ynov Campus
**Candidat** : Lucas Lafourcade
**Projet support** : CountryTravel — plateforme de découverte de destinations de voyage
**Code source** : https://github.com/aref400/countryTravel (remis avec ce dossier)

## Table de correspondance avec le référentiel

| Élément exigé par le référentiel | Section | Version complète (repo remis avec le dossier) |
|---|---|---|
| Protocole d'intégration continue | §4.1 | `.github/workflows/pr.yml` |
| Protocole de déploiement continu | §4.2 | `.github/workflows/deploy-*.yml`, `docs/manuel-deploiement.md` |
| Critères de qualité et de performance | §5 | `docs/qualite-performance.md` |
| Architecture logicielle structurée / maintenabilité | §2 | — |
| Présentation d'un prototype réalisé | §3 | — |
| Frameworks et paradigmes de développement | §2.3 | — |
| Jeu de tests unitaires sur une fonctionnalité | §6 | `apps/api/src/scoring/scoring.service.spec.ts` |
| Mesures de sécurité (OWASP Top 10) | §7 | `docs/securite-accessibilite.md` |
| Actions accessibilité + référentiel justifié (RGAA) | §8 | `docs/securite-accessibilite.md` |
| Cahier de recettes | §9 | `docs/cahier-recettes.md` |
| Plan de correction des bogues | §10 | `docs/plan-correction-bogues.md` |
| Historique des différentes versions | §11 | Historique git + PRs |
| Dernière version du logiciel fonctionnel | §1.3 | URLs de production |
| Manuel de déploiement | §12.1 | `docs/manuel-deploiement.md` |
| Manuel d'utilisation | §12.2 | `docs/manuel-utilisation.md` |
| Manuel de mise à jour | §12.3 | `docs/manuel-mise-a-jour.md` |

---

## 1. Présentation du projet

### 1.1 Le produit

CountryTravel aide un voyageur à choisir sa prochaine destination : moteur de
recommandation personnalisé (formulaire multi-étapes → top 5 de pays scorés),
destination aléatoire, carte mondiale interactive colorée par les notes de la
communauté, fiches pays détaillées, et un volet communautaire (pays visités,
avis notés, tableau de bord personnel).

Le but de CountryTravel est de proposer une liste de pays adaptée aux préférences des utilisateurs,
tout en gardant un aspect communautaire (via les notes et les avis des voyageurs…).

### 1.2 Périmètre livré

Fonctionnalités en production à la date de remise :
- Authentification e-mail/mot de passe (JWT access + refresh)
- Catalogue de 30 pays avec critères de voyage (budget, sécurité, climat, 8 « niveaux » thématiques)
- Moteur de recommandation (score 0–100, filtres éliminatoires puis pondération)
- Sauvegarde des recommandations, destination aléatoire, carte mondiale interactive
- Pays visités, avis avec note (1 avis max par pays, réservé aux pays visités), tableau de bord

### 1.3 Logiciel fonctionnel en production

| | URL |
|---|---|
| Front (Netlify) | https://grand-stardust-e3ca80.netlify.app/ |
| API (Railway) | https://disciplined-art-production-4eaa.up.railway.app/api/v1 |

![Page d'accueil](images/page-accueil.png)

---

## 2. Architecture logicielle

### 2.1 Vue d'ensemble

Monorepo npm workspaces à deux applications :

- **`apps/api`** — NestJS 11 + Prisma 7 + PostgreSQL. Découpage en modules métier
  (auth, countries, recommendations, scoring, visits, reviews), chacun regroupant
  controller / service / DTOs. Documentation Swagger générée (`/api/docs`, hors production).
- **`apps/front`** — React + TypeScript + Vite. Organisation par fonctionnalité
  (`src/features/*` : auth, countries, recommendations, reviews, dashboard…),
  couche partagée (`src/shared` : client HTTP, store Zustand, composants UI).

```mermaid
flowchart LR
    U["Utilisateur<br/>(navigateur)"] -->|HTTPS| F["Front React + Vite<br/>hébergé sur Netlify"]
    F -->|"REST /api/v1<br/>JWT Bearer"| A["API NestJS 11<br/>hébergée sur Railway"]
    A -->|"Prisma 7<br/>(requêtes paramétrées)"| DB[("PostgreSQL<br/>Railway")]
    GH["GitHub Actions<br/>CI (pr.yml) + CD"] -.->|deploy-front.yml| F
    GH -.->|deploy-api.yml| A
```

<!-- ✍️ TODO : exporter ce schéma en image pour la version Word/PDF finale -->

### 2.2 Choix structurants pour la maintenabilité

- Séparation stricte controller (HTTP) / service (métier) / Prisma (accès données) côté API
- Validation systématique des entrées aux frontières (`class-validator` sur les DTOs, `ValidationPipe` global whitelist)
- Côté front, découpage par feature : chaque fonctionnalité embarque ses composants, hooks, services et schémas — une feature se comprend et se modifie sans toucher aux autres
- Typage TypeScript strict de bout en bout, y compris le client Prisma généré
- Base de données versionnée par migrations Prisma commitées

### 2.3 Frameworks et paradigmes

| Couche | Framework / outil | Paradigmes mis en œuvre |
|---|---|---|
| API | NestJS 11 | Injection de dépendances, modules, décorateurs, guards/pipes (AOP) |
| ORM | Prisma 7 | Schéma déclaratif, requêtes paramétrées, migrations versionnées |
| Front | React 18 + Vite | Composants fonctionnels, hooks, état immutable |
| État global | Zustand | Store minimal, sélecteurs |
| Formulaires | React Hook Form + Zod | Validation déclarative par schéma, typage inféré |
| Styles | TailwindCSS + shadcn/ui | Utility-first, composants accessibles |

Côté API, NestJS impose un découpage en **modules métier** (`auth`, `countries`, `recommendations`…), chacun encapsulant son contrôleur (HTTP), son service (métier) et ses DTO validés, l'accès aux données restant isolé derrière Prisma. Un module se teste et évolue seul : c'est le pendant back du découpage par feature du front, la même logique de maintenabilité appliquée aux deux applications.

Côté front, le découpage est **par fonctionnalité** (`src/features/*`) plutôt que par type technique : chaque feature embarque ses composants, hooks, services et schémas, et se modifie sans risquer d'en casser une autre. Compromis assumé : le module `auth`, le plus sensible, colocalise ses pages *et* ses routes là où les autres pages vivent dans `src/pages` — choix délibéré, harmonisation identifiée comme axe d'amélioration.

## 3. Présentation d'un prototype : le moteur de recommandation

Fonctionnalité retenue : le parcours « formulaire multi-étapes → top 5 recommandé »,
cœur métier du produit (C2.2.1).

### 3.1 Parcours utilisateur

![Formulaire de recommandation](images/form-reco.png) -> ![Recommandation proposées](images/reco-propose.png) -> ![Modale de sauvegarde](images/modale-sauvegarde-reco.png) -> ![page pays](images/page-pays.png)

### 3.2 Fonctionnement du scoring

1. **Filtres éliminatoires** : les pays incompatibles avec les critères non négociables
   (ex. sécurité minimale) sont exclus avant tout calcul.
2. **Score pondéré 0–100** : chaque critère du formulaire (budget, climat, affinités
   de voyage…) contribue au score selon sa pondération.
3. **Top 5** : les pays sont classés, les 5 premiers sont retournés avec leur score et rang.

Ce service (`ScoringService`) est volontairement **pur et injectable** (aucun accès
base de données) : c'est ce qui le rend exhaustivement testable — voir §6.

### 3.3 Ergonomie et sécurité du prototype

- Formulaire en 5 étapes avec état conservé (retour arrière sans perte de saisie)
- Utilisable sans compte (guard JWT optionnel) ; la sauvegarde exige l'authentification
- Réponse mesurée : 57 ms en local pour un calcul complet (voir §5.3)

---

## 4. Intégration et déploiement continus

### 4.1 Protocole d'intégration continue

Chaque pull request vers `main` déclenche le workflow `pr.yml` (GitHub Actions) :

1. Installation reproductible (`npm ci`, Node 20, cache npm) et génération du client Prisma
2. **Lint API** (ESLint) — échec bloquant
3. **Tests API avec couverture** (`test:cov`) — les seuils de couverture (80 % statements /
   65 % branches / 75 % fonctions / 80 % lignes) sont vérifiés par Jest : passer dessous
   fait échouer le job
4. **Build API** (compilation TypeScript stricte)
5. **Lint Front**, **tests Front** (Vitest), **build Front** (Vite)

Une PR ne peut être fusionnée que si l'ensemble passe. Le seuil de couverture est
**bloquant** : une baisse sous les seuils fait échouer la CI (voir §5.2).

### 4.2 Protocole de déploiement continu

Tout merge sur `main` déclenche :
- `deploy-api.yml` → build et déploiement de l'API sur **Railway** (PostgreSQL managé)
- `deploy-front.yml` → build Vite et déploiement du front sur **Netlify**

Particularité documentée : les migrations de base de données ne sont **pas** appliquées
par le pipeline — procédure manuelle décrite dans le manuel de mise à jour (complet : `docs/manuel-mise-a-jour.md`),
avec l'axe d'amélioration identifié (ajout d'une étape `prisma migrate deploy`).

![CI github](images/CI-github.png)

---

## 5. Critères de qualité et de performance

Synthèse — le détail complet, les seuils et les séquences de vérification sont dans `docs/qualite-performance.md`.

### 5.1 Outils qualité

TypeScript strict, ESLint, Prettier, tests Jest (API) et Vitest + React Testing Library
(front), CI bloquante sur lint + tests, revues par pull request.

### 5.2 Couverture de tests — mesures réelles

- **API : 85 % statements / 85 % lignes / 79 % fonctions / 71 % branches**, après
  exclusion du code généré (client Prisma) et du câblage des modules. Seuils bloquants
  en CI : 80/65/75/80.
- **Front : stratégie assumée** — tests unitaires ciblés sur la couche logique
  (`shared/services` 94 %, `shared/lib` 81 %, store, hooks) ; les composants de
  présentation sont couverts par la recette manuelle (125 scénarios, `docs/cahier-recettes.md`).
  La couverture globale front (14 %) n'est volontairement pas seuillée : ce chiffre
  et cette décision sont documentés et justifiés dans `docs/qualite-performance.md`.

### 5.3 Performance — mesures réelles (local, DB Docker)

| Endpoint | Temps |
|---|---|
| `GET /countries` (liste paginée) | 10 ms |
| `GET /countries/:iso` (détail) | 8 ms |
| `GET /countries/map/all` (carte) | 6 ms |
| `POST /recommendations/compute` | 57 ms |

Bundle front : 1 294 kB brut / **412 kB gzip** — au-dessus du seuil d'alerte Vite (500 kB),
cause identifiée (react-simple-maps + world-atlas), axe d'amélioration documenté
(lazy-loading de la route `/carte`).

---

## 6. Jeu de tests unitaires : le ScoringService

Fonctionnalité couverte : le calcul de recommandation (§3), testé par
`apps/api/src/scoring/scoring.service.spec.ts` — 10 cas couvrant les filtres
éliminatoires, la pondération, les bornes du score et les cas limites.

Le service étant pur (aucune dépendance à mocker), les tests instancient le module Nest
réel et vérifient le comportement métier directement. Deux cas représentatifs :

```ts
// Filtre éliminatoire : un pays sous le niveau de sécurité exigé est exclu (score 0),
// quelle que soit la qualité de ses autres critères
it('should return 0 if safety is too low', () => {
  const result = service.calculateScore(
    makeCriteria({ safety: 2 }),
    { ...baseForm, safety: 3 },
  );
  expect(result).toBe(0);
});

// Pondération : un écart de 1 (sur 4 possibles) sur chacun des 8 niveaux d'activité
// donne 1 − 1/4 = 0,75 par niveau, soit un score global de 75/100
it('should return 75 if all activity levels are half distance apart', () => {
  const result = service.calculateScore(
    makeCriteria({ natureLevel: 4 /* …les 8 niveaux à 4 */ }),
    { ...baseForm, natureLevel: 5 /* …les 8 niveaux demandés à 5 */ },
  );
  expect(result).toBe(75);
});
```

Les autres cas couvrent les bornes (0 et 100), l'exigence « adapté aux familles »
(éliminatoire dans un sens, neutre dans l'autre), et la garantie d'un score entier.

Harnais anti-régression complet : **86 tests API** (12 fichiers de spec — dont
AuthService : doublon à l'inscription, mauvais mot de passe ; ReviewsService : upsert
et rejet 422 pays non visité) et **53 tests front** (12 fichiers — Vitest + React
Testing Library), soit **139 tests**, tous verts, exécutés à chaque PR (§4.1).

---

## 7. Mesures de sécurité (OWASP Top 10)

Synthèse du mapping complet dans `docs/securite-accessibilite.md`. Points saillants par faille :

- **A01 Contrôle d'accès** : guards JWT, vérification de propriété (403 sur les
  ressources d'autrui), décision documentée sur le champ `role` (pas encore de routes admin)
- **A02 Données sensibles** : mots de passe bcrypt (12 rounds), secrets hors repo
  (`.env` + variables Railway/Netlify), `.env.example` fourni
- **A03 Injection** : requêtes 100 % paramétrées via Prisma, validation DTO en entrée,
  **aucun filtrage de caractères** — choix argumenté (le filtrage serait de la fausse
  sécurité et affaiblirait les mots de passe, position OWASP/ANSSI)
- **A04 Conception** : rate limiting global (100 req/min/IP) + strict sur
  `/auth/login` et `/auth/register` (5/min)
- **A05 Configuration** : Helmet, CORS, Swagger désactivé en production,
  démarrage refusé si `JWT_SECRET` absent et `JWT_REFRESH_SECRET` absent
- **A06 Composants vulnérables** : audit npm triagé et documenté — 12 alertes résiduelles
  (9 *high*, 3 *moderate*) réparties en deux chaînes transitives : ReDoS `d3-color` via
  `react-simple-maps` (la carte), et la CLI `prisma dev` / `shadcn`, jamais exécutées par
  l'API en production. Aucune n'est atteignable à l'exécution, et leur correction imposerait
  une régression de version majeure : décision argumentée dans `docs/securite-accessibilite.md`
- **A07 Authentification** : JWT courts (15 min) + refresh (7 j), politique de mot de
  passe (8 caractères min, au moins un chiffre et une majuscule — validée front **et** API)
- **A08 Intégrité logicielle** : lockfile commité, installation reproductible en CI (`npm ci`)
- **A09 Journalisation** : tentatives de connexion journalisées, jamais les mots de passe
- **A10 SSRF** : non applicable — l'API n'effectue aucune requête sortante pilotée par une entrée utilisateur

---

## 8. Accessibilité

**Référentiel choisi : RGAA** (Référentiel Général d'Amélioration de l'Accessibilité) —
référentiel officiel français, adossé aux WCAG, plus adapté qu'une checklist qualité
générale type OPQUAST pour justifier des critères précis. Justification complète dans `docs/securite-accessibilite.md`.

Actions mises en œuvre (extraits — liste complète et vérifications dans `docs/securite-accessibilite.md`) :

- **Carte mondiale accessible au clavier** : ~195 formes SVG initialement 100 % souris,
  désormais focusables (`tabIndex`, `role="button"`, `aria-label`), contour de focus
  visible, tooltip au focus, activation Entrée/Espace — vérifié en conditions réelles
- Formulaires : labels liés, `aria-invalid`, `aria-describedby`, messages `role="alert"`
- Modale de sauvegarde : piège de focus, fermeture Échap, restitution du focus
- Landmarks (`<main>`), `lang="fr"`, hiérarchie de titres
- **Titre de page unique par route** (RGAA 8.5/8.6) : hook `usePageTitle`, y compris
  dynamique sur la fiche pays (« France — CountryTravel »)
- **Contrastes conformes AA** (RGAA 3.2) : 37 textes informatifs relevés de `gray-400`
  (~2,5:1) à `gray-500`/`gray-600` (≥ 4,5:1) ; seules les icônes décoratives de champs
  déjà labellisés conservent le gris clair
- 16 scénarios de recette dédiés (SEC-01..07, A11Y-01..09), tous rejoués et validés

Limite connue assumée : périmètre RGAA ciblé sur les parcours du cahier de recettes,
pas un audit exhaustif des 106 critères du référentiel.

---

## 9. Cahier de recettes

Le cahier complet — **125 scénarios** répartis en 12 sections (authentification, pays,
recommandation, sauvegarde, aléatoire, carte, navigation, sécurité, accessibilité,
visites, avis, tableau de bord) — est remis avec le code source
(`docs/cahier-recettes.md`). Le dossier en présente la méthodologie, le bilan par
section et un extrait représentatif.

### 9.1 Méthodologie

Chaque scénario précise : préconditions, étapes, résultat attendu, résultat obtenu,
statut. Les scénarios API sont exécutés via requêtes réelles (curl), les scénarios
front en navigation réelle.

### 9.2 Exécution

Campagne complète rejouée le 15/07/2026 puis complétée à la livraison du sprint 4 :
la campagne a révélé de vrais défauts (BUG-06, BUG-07, BUG-08 — voir §10),
démontrant que la recette est un outil de détection, pas une formalité.

Les scénarios couvrent trois natures de tests : **fonctionnels** (parcours métier —
inscription, recommandation, visites, avis, tableau de bord), **structurels / de
robustesse** (validation des bornes, codes ISO invalides, JSON malformé, doublons) et
**de sécurité** (contrôles d'accès 401/403, rate limiting, refus de démarrage sans secret
— section 7). La dernière campagne affiche **125 scénarios au vert (100 %)**.

### 9.3 Bilan par section

| # | Section | Scénarios | Réussite |
|---|---|---|---|
| 1 | Authentification | 22 | 100 % |
| 2 | Consultation des pays | 14 | 100 % |
| 3 | Moteur de recommandation (calcul + sauvegarde) | 20 | 100 % |
| 4 | Destination aléatoire | 4 | 100 % |
| 5 | Carte mondiale interactive | 6 | 100 % |
| 6 | Navigation générale | 3 | 100 % |
| 7 | Sécurité | 7 | 100 % |
| 8 | Accessibilité (RGAA) | 9 | 100 % |
| 9 | Pays visités | 11 | 100 % |
| 10 | Avis sur les pays (API) | 12 | 100 % |
| 11 | Tableau de bord utilisateur | 8 | 100 % |
| 12 | Avis sur la fiche pays (front) | 9 | 100 % |
| | **Total** | **125** | **100 %** |

### 9.4 Extrait représentatif (un scénario par section)

| ID | Scénario | Résultat attendu | Statut |
|---|---|---|---|
| AUTH-11 | Mot de passe incorrect à la connexion | 401 « Invalid password » | ✅ |
| CTY-10 | Détail d'un pays inexistant (`GET /countries/ZZ`) | 404, pas de crash serveur | ✅ |
| REC-01 | Calcul de recommandation nominal | 200, top 5 classé par score décroissant | ✅ |
| SAV-02 | Sauvegarde d'une reco sans authentification | 401 (Unauthorized) | ✅ |
| RND-04 | Erreur réseau lors du tirage aléatoire | Message `role="alert"` + « Réessayer », pas de page blanche | ✅ |
| MAP-03 | Clic sur un pays de la carte (Vietnam) | Redirection vers `/pays/VN` | ✅ |
| NAV-01 | Accès à une URL inconnue | Page 404 dédiée (anomalie BUG-06 corrigée) | ✅ |
| SEC-01 | Démarrage de l'API sans secret JWT | L'API refuse de démarrer, message explicite | ✅ |
| A11Y-01 | Navigation clavier sur la carte | Focus visible, tooltip, `Entrée` navigue vers la fiche | ✅ |
| VIS-02 | Ajout d'un pays déjà visité (doublon) | 409 « Country already marked as visited » | ✅ |
| REV-03 | Avis sur un pays non visité | 422 « You must have visited this country to review it » | ✅ |
| DASH-04 | Suppression d'une visite (tableau de bord) | Retrait immédiat de la liste, de la carte et du compteur, sans rechargement | ✅ |
| AVI-05 | Modification de mon avis (upsert) | Avis mis à jour sans doublon (même id) | ✅ |

---

## 10. Plan de correction des bogues

Le plan complet — **11 fiches** (BUG-01 à BUG-11), chacune avec symptôme, analyse de
cause, correction, commit de référence et test de non-régression — est remis avec le
code source (`docs/plan-correction-bogues.md`). Le dossier en présente le processus,
un tableau de synthèse des 11 fiches et une fiche complète en exemple.

### 10.1 Processus de traitement

1. **Détection** — scénario de recette en échec, retour utilisateur, ou échec CI
2. **Consignation** — fiche dans le plan : contexte, observé vs attendu, gravité
   (🔴 bloquant / 🟠 majeur / 🟡 mineur)
3. **Analyse** — identification de la cause racine dans le code
4. **Correction** — branche dédiée (`fix/CT-XXX/n` ou `BUG-XX`), pull request
5. **Vérification** — rejeu du scénario de recette concerné + CI verte avant merge,
   test de non-régression ajouté quand c'est pertinent

### 10.2 Synthèse des anomalies traitées

Gravité : 🔴 bloquant · 🟠 majeur · 🟡 mineur. Les 11 sont corrigées et couvertes par un
rejeu de recette (et, quand pertinent, un test de non-régression).

| ID | Titre | Gravité | Origine |
|---|---|---|---|
| BUG-01 | Crash sur JSON invalide en cache | 🔴 | Front — recommandation |
| BUG-02 | Token non persisté en `localStorage` | 🟠 | Front — auth |
| BUG-03 | Perte de contexte au retour arrière | 🟠 | Front — recommandation |
| BUG-04 | 404 sur URLs directes (SPA Netlify) | 🔴 | Front — déploiement |
| BUG-05 | Échec de lint en CI | 🟡 | Front — CI/CD |
| BUG-06 | Page blanche sur URLs inconnues | 🟠 | Front — routing |
| BUG-07 | Message erroné sur la longueur du mot de passe | 🟡 | API — validation |
| BUG-08 | Seed inopérant (API externe dépréciée) | 🔴 | API — données |
| BUG-09 | Sauvegarde de reco sans retour utilisateur | 🟠 | Front — recommandation |
| BUG-10 | Expiration de session silencieuse (401 muets) | 🟠 | Front — auth |
| BUG-11 | Secret de refresh non validé au démarrage | 🟡 | API — auth/config |

### 10.3 Exemple de fiche

**BUG-08 — Seed inopérant : dépendance à une API externe dépréciée** (🔴 bloquant
pour toute nouvelle installation)

- **Symptôme** : sur une base vierge, le seed échouait (`TypeError: all.filter is not
  a function`) — détecté lors du test d'installation à froid du projet.
- **Cause racine** : `prisma/seed.ts` appelait l'API `restcountries.com/v3.1` au moment
  du seed ; cette version de l'API a été coupée et renvoie désormais un objet d'erreur.
  La base de production, seedée avant la coupure, masquait l'anomalie.
- **Correctif** : suppression de la dépendance réseau — données exportées vers un fichier
  versionné `prisma/data/countries.json`, seed réécrit pour le lire. Le seed est désormais
  déterministe, reproductible et hors-ligne.
- **Vérification** : `npm run db:setup` sur une base Docker vierge insère les 30 pays,
  l'application complète fonctionne sur cette base fraîche.

Cette fiche illustre l'intérêt du processus : une anomalie invisible en production,
révélée uniquement parce que le manuel de déploiement a été testé en conditions réelles.

---

## 11. Historique des versions

Flux de travail : une branche par ticket ou bug (`CT-xxx`, `BUG-xx`), pull request,
CI verte obligatoire, merge sur `main` qui déclenche le déploiement. **118 commits,
32 pull requests** à la date de rédaction.

| Jalon | Contenu livré | PRs |
|---|---|---|
| Sprint 1 | Socle technique (NestJS, React, Prisma, CI/CD), authentification | #1–#3 |
| Sprint 2 | Catalogue pays, seed, moteur de scoring, fiches pays | #3–#8 |
| Sprint 3 | Recommandation multi-étapes, sauvegarde, aléatoire, carte mondiale | #9–#19 |
| Qualité | Tests front, sécurité/accessibilité (C2.2.3), docs, qualité/perf (C2.1.1) | #17–#23 |
| Sprint 4 | Pays visités, avis, tableau de bord | #24–#26 |
| Corrections | BUG-09, BUG-10, BUG-11 | #27–#32 |

---

## 12. Manuels

Les trois manuels figurent ici en version condensée (~1,5 page chacun dans la version
finale) ; les versions complètes sont remises avec le code source (`docs/manuel-*.md`).

### 12.1 Manuel de déploiement (complet : `docs/manuel-deploiement.md`)

Prérequis : Node ≥ 20. Installation locale recommandée (base PostgreSQL via Docker) :

```bash
git clone <url-du-repo> && cd countryTravel
docker compose up -d                      # PostgreSQL 17 en local
cp apps/api/.env.example apps/api/.env    # puis renseigner JWT_SECRET et JWT_REFRESH_SECRET
npm install                               # workspaces + client Prisma
npm run db:setup                          # migrations + seed (30 pays, 30 fiches critères)
npm run dev                               # API :3000 + front :5173
```

`JWT_SECRET` et `JWT_REFRESH_SECRET` doivent être **deux valeurs distinctes** (l'API refuse
de démarrer si l'une manque) — les générer avec `openssl rand -base64 64` (ou
`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` sous Windows),
lancé deux fois. Deux autres parcours sont documentés (application déjà déployée ; base
PostgreSQL sans Docker).

Production : `npm run build:api && npm run build:front`, `NODE_ENV=production` (désactive
Swagger). **Déploiement continu** par GitHub Actions à chaque merge sur `main`
(`deploy-api.yml` → Railway, `deploy-front.yml` → Netlify). **Point de vigilance** : les
migrations de base ne sont **pas** appliquées par le pipeline (étape manuelle, voir §12.3).
Le manuel se termine par une checklist post-déploiement. **Testé par une installation à froid
sur base vierge**, test qui a lui-même révélé et fait corriger BUG-08.

### 12.2 Manuel d'utilisation (complet : `docs/manuel-utilisation.md`)

L'application est utilisable **sans compte** pour toute la consultation et la
recommandation ; un compte n'est requis que pour **sauvegarder** ses recommandations et
accéder au **tableau de bord**.

- **Explorer** : liste des pays (recherche, filtres continent/monnaie), fiche pays détaillée.
- **Recommandation** : questionnaire multi-étapes (chaque critère de « Pas du tout » à
  « Énormément » + interrupteur famille) → **top 5** avec score de compatibilité.
- **Carte mondiale** : pays colorés par note moyenne ; survol pour le détail, clic pour la
  fiche, zoom `Ctrl` + molette. Entièrement **navigable au clavier** (`Tab` / `Entrée`).
- **Sécurité perçue** : après 5 tentatives de connexion en moins d'une minute, blocage
  temporaire (« Too Many Requests ») ; session expirée après 15 min (reconnexion demandée).

Le manuel détaille aussi les fonctions d'accessibilité (clavier, lecteurs d'écran) et un
tableau de résolution des problèmes courants.

### 12.3 Manuel de mise à jour (complet : `docs/manuel-mise-a-jour.md`)

**Livrer une modification** : branche depuis `main` → pull request (la CI `pr.yml` exécute
lint + tests + build, fusion seulement si tout est vert) → merge → déploiement automatique.

**Dépendances** : `npm audit` / `npm audit fix` ; **jamais `--force` sans analyse** (montées
majeures non maîtrisées). Après mise à jour : `npx tsc --noEmit` + suite de tests avant commit.

**Évolution de schéma** : `npx prisma migrate dev --name <desc>` en local (commit du dossier
de migration généré) ; en production, étape **manuelle** car hors pipeline :

```bash
cd apps/api
DATABASE_URL="<url-railway>" npx prisma migrate deploy
```

**Retour arrière** : `git revert` (jamais `push --force`) ; rollback en un clic depuis les
dashboards Railway et Netlify. L'historique des versions est porté par les merge commits de
`main` (une PR = une évolution) et les fiches du plan de correction des bogues.

---

## Améliorations et suite

**Axes d'amélioration technique identifiés**

- Automatiser l'application des migrations Prisma dans le pipeline `deploy-api.yml` (aujourd'hui étape manuelle en production)
- Renforcer la couverture de tests des composants d'interface côté front (actuellement couverts par la recette manuelle)
- Alléger le bundle de la carte mondiale par un chargement différé de la route `/carte` (react-simple-maps + world-atlas)
- Harmoniser l'organisation des pages sur le découpage par feature adopté partout ailleurs

**Roadmap produit**

- Module de profil utilisateur et gestion RGPD (CT-023)
- Ouverture complète du volet communautaire (avis, amis) pour donner toute sa valeur à la carte notée
- Authentification via fournisseurs externes (OAuth)
- Supervision et alerting en production (relève du Bloc 4 « maintien en condition opérationnelle »)

---

## Documents complets remis avec le code source

Le dossier ci-dessus condense chaque élément ; les versions intégrales sont dans le
dépôt (`docs/`), remis avec le dossier :

- Cahier de recettes — `docs/cahier-recettes.md` (125 scénarios)
- Plan de correction des bogues — `docs/plan-correction-bogues.md` (11 fiches)
- Sécurité et accessibilité — `docs/securite-accessibilite.md`
- Critères de qualité et de performance — `docs/qualite-performance.md`
- Manuels de déploiement / utilisation / mise à jour — `docs/manuel-*.md`
