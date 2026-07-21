# Sécurité et accessibilité — CountryTravel

## Objectif

Ce document présente les mesures de sécurité mises en œuvre (mappées à l'OWASP Top 10) et les actions d'accessibilité réalisées (référentiel RGAA), en réponse aux exigences de la compétence **C2.2.3** du référentiel de certification "Expert(e) en Développement Logiciel" (RNCP39583) : *"Développer le logiciel en veillant à l'évolutivité et à la sécurisation du code source, aux exigences d'accessibilité et aux spécifications techniques et fonctionnelles définies."*

Section correspondante du cahier de recettes : [Sécurité (§7) et Accessibilité (§8)](./cahier-recettes.md).

---

## 1. Mesures de sécurité — mapping OWASP Top 10 (2021)

| Catégorie OWASP | Mesures en place | Fichiers |
|---|---|---|
| **A01 — Broken Access Control** | Les recommandations sauvegardées vérifient l'appartenance à l'utilisateur connecté (via le token, jamais via l'URL/body) avant lecture ou suppression | `apps/api/src/recommendations/recommendations.service.ts` |
| **A02 — Cryptographic Failures** | Mots de passe hashés en bcrypt (cost factor 12) ; secrets JWT et chaîne de connexion en variables d'environnement, jamais commités (`.gitignore`) | `apps/api/src/auth/auth.service.ts` |
| **A03 — Injection** | 100% des requêtes passent par le client Prisma typé (pas de SQL brut) ; `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) filtre tout payload inattendu | `apps/api/src/main.ts` |
| **A04 — Insecure Design** | Séparation access token (15 min) / refresh token (7 jours) ; limite stricte de 5 requêtes/minute sur les endpoints d'authentification pour freiner le brute-force | `apps/api/src/auth/auth.controller.ts` |
| **A05 — Security Misconfiguration** | `helmet()` actif, CORS restreint à l'origine du front, préfixe API dédié, documentation Swagger désactivée en production | `apps/api/src/main.ts` |
| **A06 — Vulnerable and Outdated Components** | Dépendances majeures à jour (NestJS 11, Prisma 7), lockfile committé ; `npm audit fix` non destructif appliqué (vulnérabilité critique, modérées et basses résolues, sans changement de version majeure ni régression). Résiduel trié ci-dessous : 5 alertes *high* d'une seule chaîne transitive (ReDoS `d3-color` via `react-simple-maps`), non exploitable en contexte | `apps/front/package.json` |
| **A07 — Identification and Authentication Failures** | Plus de secret JWT par défaut : l'API refuse de démarrer si `JWT_SECRET` **ou** `JWT_REFRESH_SECRET` est absent (validation au boot, deux secrets distincts obligatoires) ; rate limiting sur `/auth/login` et `/auth/register` | `apps/api/src/auth/auth.service.ts`, `.../strategies/jwt.strategy.ts` |
| **A08 — Software and Data Integrity Failures** | Lockfile committé, CI utilise `npm ci` (installation reproductible) | `.github/workflows/pr.yml` |
| **A09 — Security Logging and Monitoring Failures** | Les tentatives de connexion (succès et échec) sont loggées via le `Logger` NestJS, sans jamais journaliser le mot de passe | `apps/api/src/auth/auth.service.ts` |
| **A10 — Server-Side Request Forgery** | Non applicable : l'API n'effectue aucune requête sortante pilotée par une entrée utilisateur | — |

### Limites connues et décisions documentées

- **`npm audit`** : `npm audit fix` (non destructif, sans `--force`) a résolu la vulnérabilité **critique** (`shell-quote`, tirée par l'outil de développement `concurrently` — jamais présent dans le bundle de production) ainsi que les alertes **modérées** et **basses**, sans changement de version majeure ni régression (build front et suites de tests au vert). Il reste **5 alertes de sévérité *high*** partageant une **cause racine unique** : une faille ReDoS de `d3-color`, propagée par la chaîne d3 (`d3-interpolate`, `d3-transition`, `d3-zoom`) tirée par `react-simple-maps` (librairie de la carte mondiale). Décision assumée de ne pas corriger en l'état, pour deux raisons : (1) **non exploitable dans ce contexte** — une ReDoS suppose une chaîne d'entrée hostile, or `d3-color` ne reçoit que des valeurs de couleur générées par l'application (échelle de notes de la carte), jamais une saisie utilisateur arbitraire ; (2) **le seul correctif proposé par `npm audit` est un downgrade majeur** de `react-simple-maps` (3.x → 1.0.0, `isSemVerMajor`), qui casserait la carte interactive — précisément la fonctionnalité durcie pour l'accessibilité au clavier (voir section Accessibilité). Axe d'amélioration identifié : migrer la carte vers une version de `react-simple-maps` (ou une alternative) reposant sur d3 v3+, hors périmètre de la présente livraison.
- Le champ `role` existe sur le modèle `User` mais n'est vérifié par aucun `RolesGuard` : décision assumée, car aucune route ne nécessite aujourd'hui de distinction admin/utilisateur. À mettre en place si une fonctionnalité d'administration est ajoutée.
- La désactivation de Swagger en production dépend de la variable `NODE_ENV=production` réglée sur l'environnement d'hébergement (Railway) — à vérifier manuellement lors du déploiement, rien dans le code applicatif ne peut le garantir depuis le repo.

---

## 2. Accessibilité — choix et justification du référentiel

**Référentiel retenu : RGAA (Référentiel Général d'Amélioration de l'Accessibilité)**, plutôt qu'OPQUAST.

Justification : le RGAA est le référentiel officiel français dédié spécifiquement à l'accessibilité numérique, construit sur la base de WCAG 2.1. OPQUAST est une checklist de bonnes pratiques qualité web plus large (dont l'accessibilité n'est qu'une sous-partie parmi la performance, le SEO, l'ergonomie...). Pour une démonstration ciblée de conformité accessibilité dans le cadre de la certification, le RGAA est le référentiel le plus pertinent et le plus reconnu par un jury professionnel.

**Périmètre retenu** : les critères RGAA ont été appliqués sur le parcours fonctionnel couvert par le cahier de recettes (authentification, filtres de recherche, moteur de recommandation, sauvegarde, carte interactive) plutôt que sur l'intégralité des 106 critères de niveau AA — démarche réaliste pour le périmètre d'un projet de certification, conforme à l'exigence du référentiel ("le prototype permet de répondre aux exigences du référentiel d'accessibilité préalablement établi").

### Actions mises en œuvre

| Thématique RGAA | Constat initial | Action réalisée | Fichiers |
|---|---|---|---|
| 8.3 — Langue de la page | `<html lang="en">` alors que l'interface est en français | Correction en `lang="fr"` | `apps/front/index.html` |
| 12 — Navigation / zones | Aucun repère `<main>` pour le contenu principal | Ajout du landmark `<main>` autour du contenu de page | `apps/front/src/app/layouts/AppLayouts.tsx` |
| 11 — Formulaires | Labels visuellement présents mais non liés (`htmlFor`/`id` absents) sur les formulaires de connexion/inscription ; filtres de recherche sans aucun label | Association `label`/`id`, ajout `aria-invalid` et `aria-describedby` ; ajout d'`aria-label` sur les champs de filtre | `LoginForm.tsx`, `RegisterForm.tsx`, `CountryFilters.tsx` |
| 11 — Formulaires (messages d'erreur) | Erreurs de validation affichées visuellement mais non annoncées | Ajout de `role="alert"` sur les messages d'erreur (auth, sauvegarde de reco, moteur de recommandation, carte) | `LoginForm.tsx`, `RegisterForm.tsx`, `SaveRecoModal.tsx`, `MapPage.tsx`, `RecommendationPage.tsx` |
| 11 — Formulaires (groupes de sélection) | Sélecteurs de critère (1 à 5) et interrupteur "voyage en famille" sans sémantique de groupe/état | Ajout `role="radiogroup"`/`role="radio"`/`aria-checked` et `role="switch"`/`aria-checked` | `CriteriaSelector.tsx`, `Step1Practical.tsx` |
| 13 — Cadres / boîtes de dialogue | Modale de sauvegarde sans piège de focus, sans fermeture au clavier, sans restitution du focus | Ajout d'un piège de focus (Tab cantonné à la modale), fermeture par `Echap`, focus déplacé à l'ouverture et restitué à la fermeture | `SaveRecoModal.tsx` |
| 7 — Scripts / composants riches | La carte interactive du monde (composant SVG, ~195 tracés de pays) n'était accessible qu'à la souris : aucun `tabIndex`, aucune gestion clavier | Chaque pays reconnu devient focusable (`tabIndex=0`, `role="button"`, `aria-label` avec le nom du pays), un contour visible identifie l'élément actif au clavier (équivalent du survol souris), le même tooltip s'affiche via `onFocus`, et `Entrée`/`Espace` déclenchent la navigation comme un clic | `apps/front/src/shared/components/WorldMap.tsx` |
| 8.5/8.6 — Titre de page | Titre statique ("CountryTravel") sur toute l'application : impossible d'identifier la page courante depuis l'onglet ou un lecteur d'écran | Hook `usePageTitle` : titre unique par route (« Accueil — CountryTravel », « Connexion — CountryTravel »…), y compris dynamique sur la fiche pays (« France — CountryTravel ») | `shared/hooks/usePageTitle.ts` + toutes les pages |
| 3.2 — Contrastes | Textes informatifs en `text-gray-400` (ratio ~2,5:1 sur fond clair, sous le seuil AA de 4,5:1) — 46 occurrences dans 21 fichiers | 37 occurrences corrigées en `gray-500`/`gray-600` selon l'importance du texte et le fond ; les icônes interactives (afficher le mot de passe, fermer la modale) relevées aussi ; les 9 occurrences conservées sont des icônes décoratives accompagnant des champs déjà labellisés | 19 fichiers front (formulaires, listes du dashboard, étapes de recommandation, navbar…) |

### Vérification

Le correctif clavier sur la carte interactive a été testé de bout en bout dans un navigateur réel : navigation par `Tab` jusqu'au Vietnam, tooltip identique au contenu affiché au survol souris, activation par `Entrée` menant correctement à `/pays/VN`. Les titres de page dynamiques ont été vérifiés de la même façon (onglet « France — CountryTravel » sur `/pays/FR`, mise à jour au chargement des données), ainsi que le rendu des nouveaux contrastes (scénarios A11Y-08 et A11Y-09 du cahier de recettes).

### Limites connues

- Le périmètre de correction couvre les parcours du cahier de recettes ; il ne s'agit pas d'un audit RGAA exhaustif des 106 critères sur l'ensemble de l'application.

---

## 3. Statut vis-à-vis de la compétence C2.2.3

Les correctifs de code (sécurité + accessibilité) ci-dessus sont réalisés et vérifiés (type-check, lint, suite de tests automatisés, test manuel en navigateur). Ce document constitue la présentation écrite attendue par le référentiel ("présentation des mesures de sécurité mises en œuvre" et "présentation des actions mises en œuvre pour l'accessibilité"). Il reste à l'intégrer, avec le reste des pièces déjà prêtes (cahier de recettes, plan de correction des bogues), dans le dossier écrit de 30 pages maximum remis au jury pour le Bloc 2.
