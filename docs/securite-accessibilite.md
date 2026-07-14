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
| **A06 — Vulnerable and Outdated Components** | Dépendances majeures à jour (NestJS 11, Prisma 7), lockfile committé ; `npm audit fix` appliqué (31 vulnérabilités dont 17 en sévérité "high" réduites à 3 modérées, sans changement majeur de version ni régression — 53 tests toujours au vert) | `apps/api/package.json` |
| **A07 — Identification and Authentication Failures** | Plus de secret JWT par défaut : l'API refuse de démarrer si `JWT_SECRET` est absent de l'environnement ; rate limiting sur `/auth/login` et `/auth/register` | `apps/api/src/auth/strategies/jwt.strategy.ts` |
| **A08 — Software and Data Integrity Failures** | Lockfile committé, CI utilise `npm ci` (installation reproductible) | `.github/workflows/pr.yml` |
| **A09 — Security Logging and Monitoring Failures** | Les tentatives de connexion (succès et échec) sont loggées via le `Logger` NestJS, sans jamais journaliser le mot de passe | `apps/api/src/auth/auth.service.ts` |
| **A10 — Server-Side Request Forgery** | Non applicable : l'API n'effectue aucune requête sortante pilotée par une entrée utilisateur | — |

### Limites connues et décisions documentées

- **`npm audit`** : 28 des 31 vulnérabilités initiales corrigées via `npm audit fix` (mises à jour mineures/patch, sans breaking change — vérifié par `tsc --noEmit` et la suite de tests, 53/53 au vert). Les 3 restantes (sévérité modérée) proviennent toutes de `@hono/node-server`, une dépendance interne à l'outil `prisma dev` (serveur Postgres local de développement de Prisma 7) — un sous-composant du CLI `prisma`, jamais invoqué par le processus API en exécution (`node dist/main.js` n'utilise que `@prisma/client`). Le correctif proposé par `npm audit fix --force` imposerait de rétrograder `prisma` de `^7.5.0` vers `6.19.3`, une régression de version majeure pour corriger une vulnérabilité dans un outil qui n'est pas utilisé par ce projet (`DATABASE_URL` pointe vers une instance Postgres Railway réelle, pas `prisma dev`) — décision assumée de ne pas downgrader pour ce risque résiduel non exploitable en pratique.
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

### Vérification

Le correctif clavier sur la carte interactive a été testé de bout en bout dans un navigateur réel : navigation par `Tab` jusqu'au Vietnam, tooltip identique au contenu affiché au survol souris, activation par `Entrée` menant correctement à `/pays/VN`.

### Limites connues

- Le titre de la page (`<title>`) est statique ("CountryTravel") pour toute l'application — une conformité complète au critère RGAA 8.5 (titre de page pertinent) nécessiterait des titres dynamiques par route, non implémenté à ce stade.
- Le périmètre de correction couvre les parcours du cahier de recettes ; il ne s'agit pas d'un audit RGAA exhaustif des 106 critères sur l'ensemble de l'application.

---

## 3. Statut vis-à-vis de la compétence C2.2.3

Les correctifs de code (sécurité + accessibilité) ci-dessus sont réalisés et vérifiés (type-check, lint, suite de tests automatisés, test manuel en navigateur). Ce document constitue la présentation écrite attendue par le référentiel ("présentation des mesures de sécurité mises en œuvre" et "présentation des actions mises en œuvre pour l'accessibilité"). Il reste à l'intégrer, avec le reste des pièces déjà prêtes (cahier de recettes, plan de correction des bogues), dans le dossier écrit de 30 pages maximum remis au jury pour le Bloc 2.
