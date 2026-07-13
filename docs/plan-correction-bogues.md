# Plan de correction des bogues — CountryTravel

## Objectif

Ce document consigne les anomalies détectées au cours du développement (via la recette manuelle, les retours utilisateurs ou l'exécution de la CI), leur analyse et le correctif apporté. Chaque fiche est rattachée au commit qui a résolu l'anomalie, pour assurer la traçabilité entre détection et résolution.

## Processus de traitement d'une anomalie

1. **Détection** — via un scénario du [cahier de recettes](./cahier-recettes.md) en échec, un retour utilisateur, ou un échec de la CI (`pr.yml`).
2. **Consignation** — création d'une fiche dans ce document : contexte, comportement observé vs attendu, gravité.
3. **Analyse** — identification de la cause racine dans le code.
4. **Correction** — développement du correctif sur une branche dédiée (convention `fix/CT-XXX/n` déjà en place sur le projet).
5. **Vérification** — rejeu du scénario de recette concerné + revue de la CI avant merge.

| Gravité | Signification |
|---|---|
| 🔴 Bloquant | Empêche l'usage normal de l'application |
| 🟠 Majeur | Fonctionnalité dégradée mais contournable |
| 🟡 Mineur | Impact limité (UX, cas rare) |

---

## BUG-01 — Crash de l'application sur JSON invalide en cache

- **Gravité** : 🔴 Bloquant
- **Scénario de recette associé** : SAV-11
- **Contexte / symptôme** : Au chargement de la page de recommandations, l'application relisait les résultats précédemment mis en cache dans `sessionStorage` (`reco_results`). Si cette valeur était corrompue ou non-JSON (ex: modification manuelle, ancien format de cache, coupure durant l'écriture), `JSON.parse` levait une exception non interceptée et faisait planter le rendu de la page (écran blanc).
- **Analyse (cause racine)** : `apps/front/src/features/recommendations/hooks/useRecommendations.ts` appelait `JSON.parse(cached)` sans bloc `try/catch` dans le `useEffect` d'hydratation du cache.
- **Correctif** : ajout d'un `try/catch` autour du `JSON.parse` ; en cas d'échec, la clé corrompue est supprimée du `sessionStorage` (`sessionStorage.removeItem("reco_results")`) et l'application repart sur un état vide au lieu de planter.
- **Vérification** : rejeu de SAV-11 (simulation d'une valeur de cache corrompue) — la page se charge normalement avec un état vide au lieu de crasher.
- **Commit** : [`1abd088`](../../commit/1abd088) — *Correction si le JSON n'est pas valide, pour éviter de faire planter l'app*

---

## BUG-02 — Perte de session après rechargement de la page

- **Gravité** : 🟠 Majeur
- **Scénario de recette associé** : AUTH-18
- **Contexte / symptôme** : Après connexion, l'utilisateur était bien authentifié dans le store applicatif (Zustand), mais un rechargement de page (F5) déconnectait silencieusement l'utilisateur.
- **Analyse (cause racine)** : `setAuth` dans `apps/front/src/shared/store/auth.store.ts` mettait à jour l'état Zustand (`user`, `accessToken`) mais n'écrivait jamais le token dans `localStorage`. Seul `logout` le supprimait — il n'était donc jamais réellement présent pour être relu au démarrage de l'app.
- **Correctif** : `setAuth` écrit désormais explicitement `localStorage.setItem("token", accessToken)` avant de mettre à jour le state.
- **Vérification** : rejeu de AUTH-18 — connexion puis F5, l'utilisateur reste authentifié.
- **Commit** : [`f5e46bb`](../../commit/f5e46bb) — *Correction du token pas mis dans le localStorage*

---

## BUG-03 — Perte du contexte du formulaire lors du retour arrière navigateur

- **Gravité** : 🟠 Majeur
- **Scénario de recette associé** : CTY-14
- **Contexte / symptôme** : Depuis les résultats du formulaire de recommandation, un clic sur un pays puis un retour arrière navigateur ramenait l'utilisateur sur un formulaire vide au lieu de réafficher les résultats déjà calculés — obligeant à tout ressaisir.
- **Analyse (cause racine)** : `useRecommendations` ne persistait pas les résultats calculés ; ils n'existaient qu'en state React local, perdu à chaque démontage/remontage du composant (ce qui se produit lors d'une navigation retour).
- **Correctif** : les résultats sont désormais sauvegardés dans `sessionStorage` (`reco_results`) juste après le calcul (`postRecommendation`), et réhydratés via un `useEffect` au montage du hook ; `reset()` nettoie cette clé.
- **Vérification** : rejeu de CTY-14 — clic sur un pays puis retour arrière, les résultats précédents sont bien réaffichés.
- **Commit** : [`c7f42a0`](../../commit/c7f42a0) — *Correction du retour arrière au clique sur un pays depuis le formulaire*

> Note : c'est ce correctif (écriture en cache sans validation) qui a introduit le risque corrigé ensuite par BUG-01 — bon exemple de régression secondaire détectée par la recette.

---

## BUG-04 — Erreur 404 sur les URLs directes hors page d'accueil (Netlify)

- **Gravité** : 🔴 Bloquant
- **Scénario de recette associé** : NAV-01
- **Contexte / symptôme** : En production (Netlify), accéder directement à une URL comme `/countries` ou `/random` (rafraîchissement de page, lien partagé, favori) renvoyait une erreur 404 au lieu de charger l'application React. Seule la navigation interne depuis `/` fonctionnait.
- **Analyse (cause racine)** : `react-router` gère le routing côté client (SPA), mais Netlify, en l'absence de configuration explicite, cherche un fichier physique correspondant à l'URL demandée sur le serveur et renvoie 404 s'il n'existe pas — comportement standard d'un hébergeur de fichiers statiques face à une SPA.
- **Correctif** : ajout d'une règle de réécriture (`apps/front/public/_redirects` + `apps/front/netlify.toml`) redirigeant toute route (`/*`) vers `index.html` avec un statut 200, laissant `react-router` prendre le relais côté client.
- **Vérification** : rejeu de NAV-01 en environnement de production — accès direct à `/countries`, `/random`, `/recommendations` fonctionnel.
- **Commit** : [`49d66e8`](../../commit/49d66e8) — *Fix 404 error when accessing non-homepage URLs on website*

---

## BUG-05 — Échec de build en CI sur la page destination aléatoire

- **Gravité** : 🟡 Mineur (n'affectait pas la prod, bloquait l'intégration continue)
- **Scénario de recette associé** : RND-01, RND-02
- **Contexte / symptôme** : Le pipeline `pr.yml` échouait à l'étape `Lint Front` / `Build Front` sur les modifications de `RandomPage.tsx`.
- **Analyse (cause racine)** : le premier tirage aléatoire au montage de la page appelait `fetchRandom` (memoïsé via `useCallback`) directement dans les dépendances d'un `useEffect` (`useEffect(() => { fetchRandom(); }, [fetchRandom])`), ce qui déclenchait un avertissement ESLint (`react-hooks/exhaustive-deps`) remonté en erreur bloquante par la configuration stricte du lint en CI.
- **Correctif** : le chargement initial a été extrait dans un `useEffect` autonome et auto-suffisant (déclaration de la logique de fetch directement à l'intérieur de l'effet, avec gestion d'un flag `cancelled` pour éviter les mises à jour d'état après démontage), supprimant la dépendance problématique sans changer le comportement fonctionnel.
- **Vérification** : `npm run lint --workspace=apps/front` et `npm run build --workspace=apps/front` passent ; rejeu de RND-01/RND-02 en local — comportement inchangé pour l'utilisateur.
- **Commit** : [`f89983d`](../../commit/f89983d) — *Correction de la pipeline*

---

## Synthèse

| ID | Titre | Gravité | Module | Statut |
|---|---|---|---|---|
| BUG-01 | Crash sur JSON invalide en cache | 🔴 | Front — recommendations | ✅ Corrigé |
| BUG-02 | Token non persisté en localStorage | 🟠 | Front — auth | ✅ Corrigé |
| BUG-03 | Perte de contexte au retour arrière | 🟠 | Front — recommendations | ✅ Corrigé |
| BUG-04 | 404 sur URLs directes (Netlify SPA) | 🔴 | Front — déploiement | ✅ Corrigé |
| BUG-05 | Échec de lint CI sur RandomPage | 🟡 | Front — CI/CD | ✅ Corrigé |

Ce document doit être complété à chaque nouvelle anomalie détectée, au même titre que le [cahier de recettes](./cahier-recettes.md) doit être mis à jour à chaque nouvelle fonctionnalité.
