# Cahier de recettes — CountryTravel

## Objectif

Ce document liste les scénarios de test fonctionnels permettant de vérifier le bon fonctionnement des fonctionnalités livrées, ainsi que la bonne gestion des cas d'erreur et des régressions. Il couvre le périmètre fonctionnel implémenté au moment de la rédaction : authentification, consultation des pays, moteur de recommandation, sauvegarde des recommandations et page destination aléatoire.

## Méthodologie

- **Environnement de test** : instance locale (API sur `http://localhost:3000/api/v1`, Front sur `http://localhost:5173`) ou environnement de recette dédié.
- **Chaque scénario est rejoué manuellement** (ou via Swagger `/api/docs` pour les scénarios API) avant chaque mise en production, et systématiquement après une modification touchant le module concerné.
- **Statut** : à renseigner lors de l'exécution — ✅ OK / ❌ KO / ⏳ Non exécuté.

| Légende | Signification |
|---|---|
| ✅ | Résultat conforme à l'attendu |
| ❌ | Anomalie détectée (voir [plan de correction des bogues](./plan-correction-bogues.md)) |
| ⏳ | Scénario non encore exécuté |

---

## 1. Authentification

### 1.1 Inscription (`POST /auth/register`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AUTH-01 | Inscription réussie | Email et username non utilisés | Envoyer `{email, username, password}` valides (username ≥ 3 car., password ≥ 8 car.) | Code 201, réponse contient `user` (id, email, username, role) + `accessToken` + `refreshToken` | ⏳ |
| AUTH-02 | Email déjà utilisé | Un compte existe déjà avec cet email | Envoyer `register` avec cet email | Code 409 `ConflictException` — "Email already exists" | ⏳ |
| AUTH-03 | Username déjà utilisé | Un compte existe déjà avec ce username | Envoyer `register` avec ce username (email différent) | Code 409 — "Username already exists" | ⏳ |
| AUTH-04 | Email au format invalide | — | Envoyer `email: "pas-un-email"` | Code 400, message "Email doit être valide" | ⏳ |
| AUTH-05 | Username trop court | — | Envoyer `username: "ab"` (2 caractères) | Code 400, message "Username doit avoir au moins 3 caractères" | ⏳ |
| AUTH-06 | Password trop court | — | Envoyer `password: "abc123"` (6 caractères) | Code 400, message de validation sur la longueur minimale (8 caractères) | ⏳ |
| AUTH-07 | Champ requis manquant | — | Envoyer un body sans `email` | Code 400 — "Email est requis" | ⏳ |
| AUTH-08 | Body JSON malformé | — | Envoyer un body non-JSON / vide sur `POST /auth/register` | Code 400, l'API ne plante pas | ⏳ |

### 1.2 Connexion (`POST /auth/login`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AUTH-09 | Connexion réussie | Compte existant | Envoyer email/password corrects | Code 200/201, `user` + `accessToken` + `refreshToken` | ⏳ |
| AUTH-10 | Email inconnu | Aucun compte avec cet email | Envoyer `login` avec un email inexistant | Code 401 — "User not found" | ⏳ |
| AUTH-11 | Mot de passe incorrect | Compte existant | Envoyer le bon email, mauvais password | Code 401 — "Invalid password" | ⏳ |
| AUTH-12 | Champ manquant | — | Envoyer `login` sans `password` | Code 400 — "Password est requis" | ⏳ |

### 1.3 Rafraîchissement de token (`POST /auth/refresh`) et route protégée (`GET /auth/me`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AUTH-13 | Refresh token valide | Refresh token obtenu via login/register | Envoyer `POST /auth/refresh` avec ce token | Code 200/201, nouveau couple `accessToken`/`refreshToken` | ⏳ |
| AUTH-14 | Refresh token invalide ou corrompu | — | Envoyer une chaîne aléatoire comme `refreshToken` | Code 401 — "Invalid refresh token" | ⏳ |
| AUTH-15 | Refresh token expiré | Token généré il y a plus de 7 jours (ou secret modifié) | Envoyer ce token | Code 401 — "Invalid refresh token" | ⏳ |
| AUTH-16 | Accès à `/auth/me` sans token | — | Appeler `GET /auth/me` sans header `Authorization` | Code 401 (Unauthorized) | ⏳ |
| AUTH-17 | Accès à `/auth/me` avec token valide | Utilisateur connecté | Appeler `GET /auth/me` avec `Authorization: Bearer <accessToken>` | Code 200, retourne les infos de l'utilisateur courant | ⏳ |
| AUTH-18 | Persistance de session côté front | Utilisateur vient de se connecter | Recharger la page front (F5) | L'utilisateur reste connecté (token bien présent en `localStorage`, régression corrigée) | ⏳ |

---

## 2. Consultation des pays

### 2.1 Liste des pays (`GET /countries`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| CTY-01 | Liste par défaut | Base seedée (195 pays) | `GET /countries` sans paramètre | Code 200, page 1, 20 résultats (limite par défaut), total cohérent | ⏳ |
| CTY-02 | Pagination | — | `GET /countries?page=2&limit=10` | Code 200, 10 résultats correspondant à la page 2 | ⏳ |
| CTY-03 | Filtre par continent | — | `GET /countries?continent=Europe` | Code 200, uniquement des pays du continent demandé | ⏳ |
| CTY-04 | Filtre par devise | — | `GET /countries?currency=EUR` | Code 200, uniquement des pays utilisant cette devise | ⏳ |
| CTY-05 | Recherche texte | — | `GET /countries?search=fra` | Code 200, résultats contenant "fra" dans le nom (ex: France) | ⏳ |
| CTY-06 | Recherche sans résultat | — | `GET /countries?search=zzzzz` | Code 200, tableau vide, pas d'erreur 500 | ⏳ |
| CTY-07 | Combinaison de filtres | — | `GET /countries?continent=Europe&search=fra&page=1&limit=5` | Code 200, filtres cumulés correctement appliqués | ⏳ |
| CTY-08 | Front — filtres UI | Page `/countries` ouverte | Modifier les filtres dans `CountryFilters`, naviguer, revenir en arrière | La liste se met à jour sans erreur ; le retour arrière ne casse pas la navigation (régression corrigée) | ⏳ |

### 2.2 Détail, carte, aléatoire

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| CTY-09 | Détail d'un pays existant | — | `GET /countries/FRA` | Code 200, détail complet du pays + note moyenne des reviews | ⏳ |
| CTY-10 | Détail d'un pays inexistant | — | `GET /countries/ZZZ` | Code 404 (pays non trouvé), pas de crash serveur | ⏳ |
| CTY-11 | Détail avec code ISO invalide | — | `GET /countries/123` ou `GET /countries/` | Réponse gérée proprement (400 ou 404), pas d'exception non catchée | ⏳ |
| CTY-12 | Données pour la carte | — | `GET /countries/map/all` | Code 200, données allégées pour les 195 pays | ⏳ |
| CTY-13 | Pays aléatoire | — | `GET /countries/random` | Code 200, un pays différent à chaque appel (probabiliste) | ⏳ |
| CTY-14 | Front — clic sur un pays depuis le formulaire de reco | Résultats de recommandation affichés | Cliquer sur un pays du top 5, puis revenir en arrière | Retour à l'état précédent du formulaire, sans perte de contexte (régression corrigée) | ⏳ |

---

## 3. Moteur de recommandation

### 3.1 Calcul des recommandations (`POST /recommendations/compute`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| REC-01 | Calcul nominal | — | Envoyer un `RecoFormDto` complet avec toutes les valeurs entre 1 et 5 | Code 200/201, top 5 pays classés par score décroissant | ⏳ |
| REC-02 | Valeur hors bornes (trop haute) | — | Envoyer `budget: 8` (max autorisé = 5) | Code 400, erreur de validation | ⏳ |
| REC-03 | Valeur hors bornes (trop basse) | — | Envoyer `safety: 0` (min autorisé = 1) | Code 400, erreur de validation | ⏳ |
| REC-04 | Valeur décimale sur un champ entier | — | Envoyer `temperature: 2.5` | Code 400, erreur de validation (`IsInt`) | ⏳ |
| REC-05 | Champ requis manquant | — | Envoyer le formulaire sans `familyFriendly` | Code 400, erreur de validation | ⏳ |
| REC-06 | Type incorrect | — | Envoyer `familyFriendly: "oui"` (string au lieu de boolean) | Code 400, erreur de validation | ⏳ |
| REC-07 | Calcul en tant qu'utilisateur connecté | Utilisateur connecté (guard optionnel) | Envoyer le formulaire avec un `Authorization` valide | Code 200/201, résultats identiques au mode anonyme (le endpoint reste public) | ⏳ |
| REC-08 | Front — parcours multi-étapes complet | Page `/recommendations` ouverte | Remplir chaque étape du formulaire jusqu'au résultat | Les 5 pays s'affichent avec leur score, sans blocage entre les étapes | ⏳ |

### 3.2 Sauvegarde des recommandations

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| SAV-01 | Sauvegarde réussie | Utilisateur connecté, résultats calculés | `POST /recommendations/save` avec `criteriaSnapshot` + `resultsSnapshot` | Code 201, recommandation créée et associée à l'utilisateur | ⏳ |
| SAV-02 | Sauvegarde sans authentification | — | `POST /recommendations/save` sans token | Code 401 (Unauthorized) | ⏳ |
| SAV-03 | Sauvegarde sans `resultsSnapshot` | Utilisateur connecté | Envoyer le body sans ce champ | Code 400, erreur de validation | ⏳ |
| SAV-04 | Nom trop long | Utilisateur connecté | Envoyer `name` de plus de 100 caractères | Code 400, erreur de validation (`MaxLength`) | ⏳ |
| SAV-05 | Récupération de mes recommandations | Utilisateur connecté avec ≥1 reco sauvegardée | `GET /recommendations/saved` | Code 200, liste des recommandations de l'utilisateur uniquement | ⏳ |
| SAV-06 | Récupération d'une reco par id | Recommandation existante appartenant à l'utilisateur | `GET /recommendations/saved/:id` | Code 200, détail de la recommandation | ⏳ |
| SAV-07 | Récupération d'une reco d'un autre utilisateur | Recommandation appartenant à un autre compte | `GET /recommendations/saved/:id` avec l'id d'un autre utilisateur | Code 403/404 — accès refusé, pas de fuite de données | ⏳ |
| SAV-08 | Suppression d'une reco | Recommandation existante | `DELETE /recommendations/saved/:id` | Code 200/204, recommandation supprimée | ⏳ |
| SAV-09 | Suppression d'une reco inexistante | — | `DELETE /recommendations/saved/id-inconnu` | Code 404, pas de crash serveur | ⏳ |
| SAV-10 | Front — modale de sauvegarde (`SaveRecoModal`) | Résultats de recommandation affichés | Ouvrir la modale, saisir un nom, valider | La reco apparaît sauvegardée côté utilisateur, retour visuel de confirmation | ⏳ |
| SAV-11 | Front — sauvegarde de données JSON invalides | Cas limite déjà rencontré en production | Simuler une réponse API malformée pour les recommandations sauvegardées | Le front affiche un état d'erreur/vide au lieu de crasher (régression corrigée) | ⏳ |

---

## 4. Page destination aléatoire (front — CT-017)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| RND-01 | Tirage aléatoire | Page `/random` ouverte | Cliquer sur "Surprends-moi" | Un pays s'affiche avec ses informations principales | ⏳ |
| RND-02 | Nouveau tirage successif | Un pays déjà affiché | Cliquer à nouveau sur le bouton de tirage | Un nouveau pays s'affiche (potentiellement différent), sans erreur d'affichage | ⏳ |
| RND-03 | Accès direct à l'URL `/random` | Non connecté | Naviguer directement vers `/random` | La page se charge sans erreur 404 (régression sur les routes non-homepage corrigée) | ⏳ |
| RND-04 | Erreur réseau lors du tirage | API indisponible (simulation) | Cliquer sur "Surprends-moi" | Message d'erreur affiché à l'utilisateur, pas de page blanche | ⏳ |

---

## 5. Navigation générale front

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| NAV-01 | Accès à une URL inconnue | — | Naviguer vers `/une-url-qui-nexiste-pas` | Page 404 gérée par le routeur, pas d'erreur blanche (régression corrigée) | ⏳ |
| NAV-02 | Accès à une page protégée sans connexion | Non connecté | Naviguer vers une route nécessitant `PrivateRoute` | Redirection vers la page de login | ⏳ |
| NAV-03 | Page d'accueil accessible sans connexion | Non connecté | Naviguer vers `/` | Page d'accueil affichée, liens vers login/register visibles | ⏳ |

---

## Traçabilité

Les anomalies détectées lors de l'exécution de ces scénarios sont consignées dans le [plan de correction des bogues](./plan-correction-bogues.md), avec pour chacune : contexte, analyse, correctif appliqué et commit associé.
