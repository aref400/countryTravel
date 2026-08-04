# Plan de correction des bogues — CountryTravel

## Objectif

Ce document consigne les anomalies détectées au cours du développement (via la recette manuelle, les retours utilisateurs ou l'exécution de la CI), leur analyse et le correctif apporté. Chaque fiche est rattachée au commit qui a résolu l'anomalie, pour assurer la traçabilité entre détection et résolution.

## Processus de traitement d'une anomalie

1. **Détection** — via un scénario du [cahier de recettes](./cahier-recettes.md) en échec, un retour utilisateur, un signalement de la [supervision](./supervision.md) (Sentry, moniteur d'uptime), ou un échec de la CI (`pr.yml`).
2. **Consignation** — ouverture d'une issue GitHub via le gabarit [`bug_report.yml`](../.github/ISSUE_TEMPLATE/bug_report.yml), qui impose les informations nécessaires à la reproduction (étapes, comportement attendu vs observé, gravité, périmètre, environnement). L'anomalie confirmée est ensuite reportée en fiche dans le présent document, qui fait office de registre consolidé. Un exemple de fiche renseignée figure dans [exemple-fiche-consignation.md](./exemple-fiche-consignation.md).
3. **Analyse** — identification de la cause racine dans le code.
4. **Correction** — développement du correctif sur une branche dédiée (convention `fix/CT-XXX/n` déjà en place sur le projet).
5. **Vérification** — rejeu du scénario de recette concerné + revue de la CI avant merge.

| Gravité     | Signification                             |
| ----------- | ----------------------------------------- |
| 🔴 Bloquant | Empêche l'usage normal de l'application   |
| 🟠 Majeur   | Fonctionnalité dégradée mais contournable |
| 🟡 Mineur   | Impact limité (UX, cas rare)              |

---

## BUG-01 — Crash de l'application sur JSON invalide en cache

- **Gravité** : 🔴 Bloquant
- **Scénario de recette associé** : SAV-11
- **Contexte / symptôme** : Au chargement de la page de recommandations, l'application relisait les résultats précédemment mis en cache dans `sessionStorage` (`reco_results`). Si cette valeur était corrompue ou non-JSON (ex: modification manuelle, ancien format de cache, coupure durant l'écriture), `JSON.parse` levait une exception non interceptée et faisait planter le rendu de la page (écran blanc).
- **Analyse (cause racine)** : `apps/front/src/features/recommendations/hooks/useRecommendations.ts` appelait `JSON.parse(cached)` sans bloc `try/catch` dans le `useEffect` d'hydratation du cache.
- **Correctif** : ajout d'un `try/catch` autour du `JSON.parse` ; en cas d'échec, la clé corrompue est supprimée du `sessionStorage` (`sessionStorage.removeItem("reco_results")`) et l'application repart sur un état vide au lieu de planter.
- **Vérification** : rejeu de SAV-11 (simulation d'une valeur de cache corrompue) — la page se charge normalement avec un état vide au lieu de crasher.
- **Commit** : [`3450182`] — _Correction si le JSON n'est pas valide, pour éviter de faire planter l'app_

---

## BUG-02 — Perte de session après rechargement de la page

- **Gravité** : 🟠 Majeur
- **Scénario de recette associé** : AUTH-18
- **Contexte / symptôme** : Après connexion, l'utilisateur était bien authentifié dans le store applicatif (Zustand), mais un rechargement de page (F5) déconnectait silencieusement l'utilisateur.
- **Analyse (cause racine)** : `setAuth` dans `apps/front/src/shared/store/auth.store.ts` mettait à jour l'état Zustand (`user`, `accessToken`) mais n'écrivait jamais le token dans `localStorage`. Seul `logout` le supprimait — il n'était donc jamais réellement présent pour être relu au démarrage de l'app.
- **Correctif** : `setAuth` écrit désormais explicitement `localStorage.setItem("token", accessToken)` avant de mettre à jour le state.
- **Vérification** : rejeu de AUTH-18 — connexion puis F5, l'utilisateur reste authentifié.
- **Commit** : [`b2182b0`] — _Correction du token pas mis dans le localStorage_

---

## BUG-03 — Perte du contexte du formulaire lors du retour arrière navigateur

- **Gravité** : 🟠 Majeur
- **Scénario de recette associé** : CTY-14
- **Contexte / symptôme** : Depuis les résultats du formulaire de recommandation, un clic sur un pays puis un retour arrière navigateur ramenait l'utilisateur sur un formulaire vide au lieu de réafficher les résultats déjà calculés — obligeant à tout ressaisir.
- **Analyse (cause racine)** : `useRecommendations` ne persistait pas les résultats calculés ; ils n'existaient qu'en state React local, perdu à chaque démontage/remontage du composant (ce qui se produit lors d'une navigation retour).
- **Correctif** : les résultats sont désormais sauvegardés dans `sessionStorage` (`reco_results`) juste après le calcul (`postRecommendation`), et réhydratés via un `useEffect` au montage du hook ; `reset()` nettoie cette clé.
- **Vérification** : rejeu de CTY-14 — clic sur un pays puis retour arrière, les résultats précédents sont bien réaffichés.
- **Commit** : [`741f1f7`] — _Correction du retour arrière au clique sur un pays depuis le formulaire_

> Note : c'est ce correctif (écriture en cache sans validation) qui a introduit le risque corrigé ensuite par BUG-01.

---

## BUG-04 — Erreur 404 sur les URLs directes hors page d'accueil (Netlify)

- **Gravité** : 🔴 Bloquant
- **Scénario de recette associé** : NAV-01
- **Contexte / symptôme** : En production (Netlify), accéder directement à une URL comme `/countries` ou `/random` (rafraîchissement de page, lien partagé, favori) renvoyait une erreur 404 au lieu de charger l'application React. Seule la navigation interne depuis `/` fonctionnait.
- **Analyse (cause racine)** : `react-router` gère le routing côté client (SPA), mais Netlify, en l'absence de configuration explicite, cherche un fichier physique correspondant à l'URL demandée sur le serveur et renvoie 404 s'il n'existe pas — comportement standard d'un hébergeur de fichiers statiques face à une SPA.
- **Correctif** : ajout d'une règle de réécriture (`apps/front/public/_redirects` + `apps/front/netlify.toml`) redirigeant toute route (`/*`) vers `index.html` avec un statut 200, laissant `react-router` prendre le relais côté client.
- **Vérification** : rejeu de NAV-01 en environnement de production — accès direct à `/countries`, `/random`, `/recommendations` fonctionnel.
- **Commit** : [`8d470d4`] — _Fix 404 error when accessing non-homepage URLs on website_

---

## BUG-05 — Échec de build en CI sur la page destination aléatoire

- **Gravité** : 🟡 Mineur (n'affectait pas la prod, bloquait l'intégration continue)
- **Scénario de recette associé** : RND-01, RND-02
- **Contexte / symptôme** : Le pipeline `pr.yml` échouait à l'étape `Lint Front` / `Build Front` sur les modifications de `RandomPage.tsx`.
- **Analyse (cause racine)** : le premier tirage aléatoire au montage de la page appelait `fetchRandom` (memoïsé via `useCallback`) directement dans les dépendances d'un `useEffect` (`useEffect(() => { fetchRandom(); }, [fetchRandom])`), ce qui déclenchait un avertissement ESLint (`react-hooks/exhaustive-deps`) remonté en erreur bloquante par la configuration stricte du lint en CI.
- **Correctif** : le chargement initial a été extrait dans un `useEffect` autonome et auto-suffisant (déclaration de la logique de fetch directement à l'intérieur de l'effet, avec gestion d'un flag `cancelled` pour éviter les mises à jour d'état après démontage), supprimant la dépendance problématique sans changer le comportement fonctionnel.
- **Vérification** : `npm run lint --workspace=apps/front` et `npm run build --workspace=apps/front` passent ; rejeu de RND-01/RND-02 en local — comportement inchangé pour l'utilisateur.
- **Commit** : [`0aacb35`] — _Correction de la pipeline_

---

## BUG-06 — Page blanche sur les URLs inconnues (absence de route 404)

- **Gravité** : 🟠 Majeur
- **Scénario de recette associé** : NAV-01
- **Contexte / symptôme** : L'accès à une URL non définie côté client (ex. `/une-url-qui-nexiste-pas`, ou `/dashboard` dont la page n'est pas encore développée) affichait une **page entièrement blanche** au lieu d'une page d'erreur. Détecté lors de l'exécution de la campagne de recette (scénario NAV-01).
- **Analyse (cause racine)** : `apps/front/src/app/router.tsx` ne définissait aucune route « attrape-tout » (`path="*"`). En l'absence de correspondance, `react-router` ne rend aucun élément, d'où l'écran blanc — sans erreur console, ce qui rendait l'anomalie silencieuse.
- **Correctif** : création d'un composant `apps/front/src/pages/NotFound.tsx` (message explicite, barre de navigation conservée, lien de retour à l'accueil) et ajout d'une route `<Route path="*" element={<NotFound />} />` en fin de configuration, à l'intérieur du layout applicatif.
- **Vérification** : rejeu de NAV-01 — l'URL inconnue affiche désormais la page 404 dédiée (titre « Cette destination n'existe pas », lien de retour fonctionnel vers `/`). `tsc --noEmit` et `eslint` au vert.
- **Commit** :[`13c3dc1`] _Ajout page 404_

---

## BUG-07 — Message de validation erroné sur la longueur du mot de passe

- **Gravité** : 🟡 Mineur
- **Scénario de recette associé** : AUTH-06
- **Contexte / symptôme** : À l'inscription avec un mot de passe trop court, l'API renvoyait le message « Password doit avoir au moins **6** caractères », alors que la règle réellement appliquée impose **8** caractères (`@MinLength(8)`). Message trompeur pour l'utilisateur. Détecté lors du rejeu de AUTH-06.
- **Analyse (cause racine)** : incohérence entre le décorateur `@MinLength(8)` et le texte du message d'erreur dans `apps/api/src/auth/dto/register.dto.ts` (le message n'avait pas été mis à jour lors d'un changement de la contrainte).
- **Correctif** : alignement du message sur la contrainte réelle — « Password doit avoir au moins 8 caractères ».
- **Vérification** : rejeu de AUTH-06 — un mot de passe de 6 caractères est bien rejeté (code 400) avec un message cohérent.
- **Commit** :[`d26f396`] _fix aligner le mesage du mot de passe a la regle_

---

## BUG-08 — Seed inopérant : dépendance à une API externe dépréciée

- **Gravité** : 🔴 Bloquant (pour toute nouvelle installation)
- **Scénario de recette associé** : installation à froid (voir [manuel de déploiement](./manuel-deploiement.md)) — préalable à l'ensemble des scénarios nécessitant des données
- **Contexte / symptôme** : Sur une base de données vierge, la commande de seed échouait (`TypeError: all.filter is not a function`), laissant la base sans aucun pays. Détecté lors du test de lancement à froid du projet sur une base PostgreSQL neuve.
- **Analyse (cause racine)** : `apps/api/prisma/seed.ts` récupérait la liste des pays via un appel réseau à l'API `restcountries.com/v3.1` **au moment du seed**. Cette version de l'API ayant été dépréciée et coupée, la réponse n'était plus un tableau JSON mais un objet d'erreur, d'où l'échec. La base de production existante n'était pas affectée (seedée avant la coupure), ce qui masquait l'anomalie.
- **Correctif** : suppression de la dépendance réseau. Les données des pays ont été exportées (depuis la base existante) vers un fichier versionné `apps/api/prisma/data/countries.json`, et `seed.ts` réécrit pour le lire — même approche que les fichiers `descriptions.json` et `criteria.json` déjà présents. Le seed est désormais **déterministe, reproductible et hors-ligne**.
- **Vérification** : `npm run db:setup` sur une base Docker vierge insère les 30 pays + 30 fiches critères ; l'application (liste, carte, moteur de recommandation) est fonctionnelle sur cette base fraîche.
- **Commit** :[`5b75e22`] _Packages shared retirer + documentation faite_

---

## BUG-09 — Aucun retour utilisateur après la sauvegarde d'une recommandation

- **Gravité** : 🟠 Majeur (UX — l'utilisateur ne sait pas si son action a réussi)
- **Scénario de recette associé** : SAV-10, SAV-12
- **Contexte / symptôme** : Détecté lors d'une campagne de **tests utilisateurs**. Dans la modale de sauvegarde d'une recommandation, la validation ne produisait aucun retour visible : en cas de succès la modale se fermait silencieusement (impossible de distinguer un succès d'une annulation), et trois défauts secondaires aggravaient le flux : (1) le message d'erreur d'un essai précédent restait affiché à la réouverture de la modale, (2) le bouton « Sauvegarder » restait cliquable pendant la requête (risque de doubles sauvegardes), (3) une reco sans nom était enregistrée sous le libellé de debug « Test ».
- **Analyse (cause racine)** : dans `apps/front/src/pages/RecommendationPage.tsx`, `handleSave` fermait la modale en cas de succès sans état de confirmation (`setIsModalOpen(false)` seul) ; l'état d'erreur `saveError` n'était jamais réinitialisé ; aucun état « requête en cours » n'existait ; valeur par défaut `name || "Test"` oubliée du développement.
- **Correctif** : remplacement des booléens épars par une machine à états `SaveRecoStatus` (`inactive → saving → success | error`) portée par la page et transmise à `SaveRecoModal`. La modale affiche désormais : un message de confirmation (`role="status"`, avec lien vers le tableau de bord) en cas de succès, un message d'erreur (`role="alert"`) avec bouton « Réessayer » en cas d'échec, et désactive le bouton pendant la sauvegarde (« Sauvegarde… »). L'état est réinitialisé à chaque ouverture de la modale, le focus est déplacé sur « Fermer » à l'affichage de la confirmation (accessibilité clavier), et le nom vide est envoyé `undefined` (affiché « Recherche sans nom » sur le dashboard).
- **Vérification** : rejeu manuel en conditions réelles — cas d'échec observé avec un vrai 401 (token expiré) : message d'erreur affiché, bouton « Réessayer » fonctionnel ; cas de succès après reconnexion : confirmation affichée, reco visible sur `/dashboard`. 5 tests unitaires ajoutés (`SaveRecoModal.test.tsx`) couvrant les quatre états.
- **Commit** :[`b612864`] _Modification de la modale pour afficher quand la sauvegarde a eu lieu_

---

## BUG-10 — Expiration de session silencieuse (utilisateur jamais informé)

- **Gravité** : 🟠 Majeur (UX + cohérence d'état — l'application paraît connectée alors que la session est morte)
- **Scénario de recette associé** : AUTH-19, AUTH-20
- **Contexte / symptôme** : Découvert dans la foulée de BUG-09 (le premier échec de sauvegarde observé était en réalité un 401). L'`accessToken` expire au bout de 15 minutes ; passé ce délai, l'interface continuait d'afficher l'utilisateur comme connecté (pseudo dans la navbar), mais chaque appel authentifié échouait en 401 sans aucun message. L'utilisateur n'était **jamais** informé de sa déconnexion et n'avait aucun moyen de comprendre pourquoi ses actions échouaient.
- **Analyse (cause racine)** : le front ne stockait pas le `refreshToken` pourtant renvoyé par l'API depuis CT-005 (`setAuth` ne conservait que l'`accessToken`), et l'endpoint `POST /auth/refresh` n'était jamais appelé. Aucune gestion centralisée du 401 dans `apps/front/src/shared/lib/fetch.instance.ts` : chaque appelant recevait l'erreur brute sans traitement.
- **Correctif** : (1) le store d'auth conserve désormais le couple `accessToken`/`refreshToken` (`setAuth` étendu, nouveau `setTokens`) ; (2) `fetch.instance.ts` intercepte les 401 des appels authentifiés (hors endpoints `/auth/*` où un 401 signifie « mauvais identifiants ») : il appelle `POST /auth/refresh` en coulisse — une seule requête de refresh en vol, partagée entre appels concurrents — puis rejoue la requête d'origine une fois ; (3) si le refresh échoue aussi, `expireSession()` vide la session et redirige vers `/auth/login?expired=1`, où un bandeau `role="alert"` affiche « Votre session a expiré, veuillez vous reconnecter. »
- **Vérification** : simulation en conditions réelles — access token corrompu + refresh valide : le dashboard se charge normalement et le token est renouvelé sans que l'utilisateur ne voie quoi que ce soit ; les deux tokens corrompus : redirection immédiate vers le login avec le bandeau explicatif. 4 tests unitaires ajoutés sur `fetch.instance` (refresh + rejeu, échec du refresh, exclusion des endpoints d'auth, visiteur anonyme) et 2 sur le store (`setTokens`, `expireSession`).
- **Commit** :[`8733df4`] _Correction du bug liée au refreshToken pas sauvegardé côté front_

---

## BUG-11 — Secret de refresh non validé au démarrage (échec 500 tardif)

- **Gravité** : 🟡 Mineur (n'affecte qu'un environnement mal configuré, mais l'échec était trompeur)
- **Scénario de recette associé** : SEC-01 (démarrage sans secret JWT) — étendu au `JWT_REFRESH_SECRET`
- **Contexte / symptôme** : Détecté en clarifiant la procédure d'installation. L'API validait `JWT_SECRET` au démarrage (refus de booter si absent), mais **pas** `JWT_REFRESH_SECRET`. Si ce dernier était oublié dans le `.env`, l'API démarrait normalement — puis renvoyait une **erreur 500 opaque à la première inscription/connexion** (au moment de signer le refresh token), sans en indiquer la cause. Le comportement asymétrique entre les deux secrets rendait le diagnostic déroutant à l'installation.
- **Analyse (cause racine)** : `apps/api/src/auth/auth.service.ts` lisait `process.env.JWT_REFRESH_SECRET` directement au moment de signer/vérifier le refresh token. Contrairement à `JWT_SECRET` (gardé au démarrage dans `jwt.strategy.ts`), aucune validation n'était faite au boot ; une valeur `undefined` ne se manifestait qu'à l'exécution, sous la forme d'une exception de `jsonwebtoken` convertie en 500.
- **Correctif** : les deux secrets sont désormais validés dans le constructeur d'`AuthService` — l'API **refuse de démarrer** avec un message explicite si `JWT_SECRET` **ou** `JWT_REFRESH_SECRET` est absent — et stockés dans des champs `private readonly` typés, supprimant les lectures dispersées de `process.env`. La documentation (`manuel-deploiement.md`, `.env.example`) a été clarifiée en parallèle : deux valeurs distinctes à générer, commande à lancer deux fois, alternative Node si `openssl` est indisponible (fréquent sous Windows).
- **Vérification** : 2 tests unitaires ajoutés (`auth.service.spec.ts`) vérifiant que l'instanciation du service échoue si l'un ou l'autre secret manque ; suite auth complète verte (11 tests), `tsc --noEmit` et `eslint` au vert.
- **Commit** : _(à renseigner à la livraison)_

---

## Synthèse

| ID     | Titre                                          | Gravité | Module                  | Statut     |
| ------ | ---------------------------------------------- | ------- | ----------------------- | ---------- |
| BUG-01 | Crash sur JSON invalide en cache               | 🔴      | Front — recommendations | ✅ Corrigé |
| BUG-02 | Token non persisté en localStorage             | 🟠      | Front — auth            | ✅ Corrigé |
| BUG-03 | Perte de contexte au retour arrière            | 🟠      | Front — recommendations | ✅ Corrigé |
| BUG-04 | 404 sur URLs directes (Netlify SPA)            | 🔴      | Front — déploiement     | ✅ Corrigé |
| BUG-05 | Échec de lint CI sur RandomPage                | 🟡      | Front — CI/CD           | ✅ Corrigé |
| BUG-06 | Page blanche sur URLs inconnues (route 404)    | 🟠      | Front — routing         | ✅ Corrigé |
| BUG-07 | Message erroné sur la longueur du mot de passe | 🟡      | API — validation        | ✅ Corrigé |
| BUG-08 | Seed inopérant (API externe dépréciée)         | 🔴      | API — données           | ✅ Corrigé |
| BUG-09 | Sauvegarde de reco sans retour utilisateur     | 🟠      | Front — recommendations | ✅ Corrigé |
| BUG-10 | Expiration de session silencieuse (401 muets)  | 🟠      | Front — auth            | ✅ Corrigé |
| BUG-11 | Secret de refresh non validé au démarrage      | 🟡      | API — auth/config       | ✅ Corrigé |

Ce document doit être complété à chaque nouvelle anomalie détectée, au même titre que le [cahier de recettes](./cahier-recettes.md) doit être mis à jour à chaque nouvelle fonctionnalité.
