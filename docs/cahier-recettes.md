# Cahier de recettes — CountryTravel

## Objectif

Ce document liste les scénarios de test fonctionnels permettant de vérifier le bon fonctionnement des fonctionnalités livrées, ainsi que la bonne gestion des cas d'erreur et des régressions. Il couvre le périmètre fonctionnel implémenté au moment de la rédaction : authentification, consultation des pays, moteur de recommandation, sauvegarde des recommandations, page destination aléatoire, carte mondiale interactive, pays visités, avis sur les pays (API et fiche pays), tableau de bord utilisateur, ainsi que les mesures de sécurité et d'accessibilité mises en œuvre (voir aussi [Sécurité et accessibilité](./securite-accessibilite.md)).

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
| AUTH-01 | Inscription réussie | Email et username non utilisés | Envoyer `{email, username, password}` valides (username ≥ 3 car., password ≥ 8 car.) | Code 201, réponse contient `user` (id, email, username, role) + `accessToken` + `refreshToken` | ✅ |
| AUTH-02 | Email déjà utilisé | Un compte existe déjà avec cet email | Envoyer `register` avec cet email | Code 409 `ConflictException` — "Email already exists" | ✅ |
| AUTH-03 | Username déjà utilisé | Un compte existe déjà avec ce username | Envoyer `register` avec ce username (email différent) | Code 409 — "Username already exists" | ✅ |
| AUTH-04 | Email au format invalide | — | Envoyer `email: "pas-un-email"` | Code 400, message "Email doit être valide" | ✅ |
| AUTH-05 | Username trop court | — | Envoyer `username: "ab"` (2 caractères) | Code 400, message "Username doit avoir au moins 3 caractères" | ✅ |
| AUTH-06 | Password trop court | — | Envoyer `password: "abc123"` (6 caractères) | Code 400, message "Password doit avoir au moins 8 caractères" | ✅ |
| AUTH-07 | Champ requis manquant | — | Envoyer un body sans `email` | Code 400 — "Email est requis" | ✅ |
| AUTH-08 | Body JSON malformé | — | Envoyer un body non-JSON / vide sur `POST /auth/register` | Code 400, l'API ne plante pas | ✅ |
| AUTH-21 | Mot de passe sans chiffre | — | Envoyer `password: "abccddcsA"` | Code 400, message "Le mot de passe doit contenir au moins un chiffre" | ✅ |
| AUTH-22 | Mot de passe sans majuscule | — | Envoyer `password: "abccd123"` | Code 400, message "Le mot de passe doit contenir au moins une majuscule" | ✅ |

### 1.2 Connexion (`POST /auth/login`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AUTH-09 | Connexion réussie | Compte existant | Envoyer email/password corrects | Code 200/201, `user` + `accessToken` + `refreshToken` | ✅ |
| AUTH-10 | Email inconnu | Aucun compte avec cet email | Envoyer `login` avec un email inexistant | Code 401 — "User not found" | ✅ |
| AUTH-11 | Mot de passe incorrect | Compte existant | Envoyer le bon email, mauvais password | Code 401 — "Invalid password" | ✅ |
| AUTH-12 | Champ manquant | — | Envoyer `login` sans `password` | Code 400 — "Password est requis" | ✅ |

### 1.3 Rafraîchissement de token (`POST /auth/refresh`) et route protégée (`GET /auth/me`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AUTH-13 | Refresh token valide | Refresh token obtenu via login/register | Envoyer `POST /auth/refresh` avec ce token | Code 200/201, nouveau couple `accessToken`/`refreshToken` | ✅ |
| AUTH-14 | Refresh token invalide ou corrompu | — | Envoyer une chaîne aléatoire comme `refreshToken` | Code 401 — "Invalid refresh token" | ✅ |
| AUTH-15 | Refresh token expiré | Token généré il y a plus de 7 jours (ou secret modifié) | Envoyer ce token | Code 401 — "Invalid refresh token" | ✅ |
| AUTH-16 | Accès à `/auth/me` sans token | — | Appeler `GET /auth/me` sans header `Authorization` | Code 401 (Unauthorized) | ✅ |
| AUTH-17 | Accès à `/auth/me` avec token valide | Utilisateur connecté | Appeler `GET /auth/me` avec `Authorization: Bearer <accessToken>` | Code 200, retourne les infos de l'utilisateur courant | ✅ |
| AUTH-18 | Persistance de session côté front | Utilisateur vient de se connecter | Recharger la page front (F5) | L'utilisateur reste connecté (token bien présent en `localStorage`, régression corrigée) | ✅ |
| AUTH-19 | Refresh silencieux côté front | Utilisateur connecté, `accessToken` expiré (15 min), `refreshToken` encore valide | Effectuer une action authentifiée (ex. charger `/dashboard`) | L'action aboutit normalement : le front rafraîchit les tokens en coulisse via `POST /auth/refresh` et rejoue la requête — aucune interruption visible (régression BUG-10, couverte par `fetch.instance.test.ts`) | ✅ |
| AUTH-20 | Session totalement expirée | `accessToken` et `refreshToken` tous deux invalides/expirés | Effectuer une action authentifiée | Déconnexion propre : redirection vers `/auth/login?expired=1` avec le message « Votre session a expiré, veuillez vous reconnecter. » (`role="alert"`) | ✅ |

---

## 2. Consultation des pays

### 2.1 Liste des pays (`GET /countries`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| CTY-01 | Liste par défaut | Base seedée (30 pays via `npm run db:setup`) | `GET /countries` sans paramètre | Code 200, page 1, 20 résultats (limite par défaut), total cohérent | ✅ |
| CTY-02 | Pagination | — | `GET /countries?page=2&limit=10` | Code 200, 10 résultats correspondant à la page 2 | ✅ |
| CTY-03 | Filtre par continent | — | `GET /countries?continent=europe` | Code 200, uniquement des pays du continent demandé | ✅ |
| CTY-04 | Filtre par devise | — | `GET /countries?currency=EUR` | Code 200, uniquement des pays utilisant cette devise | ✅ |
| CTY-05 | Recherche texte | — | `GET /countries?search=fra` | Code 200, résultats contenant "fra" dans le nom (ex: France) | ✅ |
| CTY-06 | Recherche sans résultat | — | `GET /countries?search=zzzzz` | Code 200, tableau vide, pas d'erreur 500 | ✅ |
| CTY-07 | Combinaison de filtres | — | `GET /countries?continent=europe&search=fra&page=1&limit=5` | Code 200, filtres cumulés correctement appliqués | ✅ |
| CTY-08 | Front — filtres UI | Page `/pays` ouverte | Modifier les filtres dans `CountryFilters`, naviguer, revenir en arrière | La liste se met à jour sans erreur ; le retour arrière ne casse pas la navigation (régression corrigée) | ✅ |

### 2.2 Détail, carte, aléatoire

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| CTY-09 | Détail d'un pays existant | — | `GET /countries/FR` (code ISO 3166-1 alpha-2) | Code 200, détail complet du pays + note moyenne des reviews | ✅ |
| CTY-10 | Détail d'un pays inexistant | — | `GET /countries/ZZ` | Code 404 (pays non trouvé), pas de crash serveur | ✅ |
| CTY-11 | Détail avec code ISO invalide | — | `GET /countries/123` ou `GET /countries/` | Réponse gérée proprement (400 ou 404), pas d'exception non catchée | ✅ |
| CTY-12 | Données pour la carte | — | `GET /countries/map/all` | Code 200, données allégées pour l'ensemble des pays en base (30 après seed) | ✅ |
| CTY-13 | Pays aléatoire | — | `GET /countries/random` | Code 200, un pays différent à chaque appel (probabiliste) | ✅ |
| CTY-14 | Front — clic sur un pays depuis le formulaire de reco | Résultats de recommandation affichés | Cliquer sur un pays du top 5, puis revenir en arrière | Retour à l'état précédent du formulaire, sans perte de contexte (résultats persistés en `sessionStorage`, régression corrigée) | ✅ |

---

## 3. Moteur de recommandation

### 3.1 Calcul des recommandations (`POST /recommendations/compute`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| REC-01 | Calcul nominal | — | Envoyer un `RecoFormDto` complet avec toutes les valeurs entre 1 et 5 | Code 200/201, top 5 pays classés par score décroissant | ✅ |
| REC-02 | Valeur hors bornes (trop haute) | — | Envoyer `budget: 8` (max autorisé = 5) | Code 400, erreur de validation | ✅ |
| REC-03 | Valeur hors bornes (trop basse) | — | Envoyer `safety: 0` (min autorisé = 1) | Code 400, erreur de validation | ✅ |
| REC-04 | Valeur décimale sur un champ entier | — | Envoyer `temperature: 2.5` | Code 400, erreur de validation (`IsInt`) | ✅ |
| REC-05 | Champ requis manquant | — | Envoyer le formulaire sans `familyFriendly` | Code 400, erreur de validation | ✅ |
| REC-06 | Type incorrect | — | Envoyer `familyFriendly: "oui"` (string au lieu de boolean) | Code 400, erreur de validation | ✅ |
| REC-07 | Calcul en tant qu'utilisateur connecté | Utilisateur connecté (guard optionnel) | Envoyer le formulaire avec un `Authorization` valide | Code 200/201, résultats identiques au mode anonyme (le endpoint reste public) | ✅ |
| REC-08 | Front — parcours multi-étapes complet | Page `/recommandation` ouverte | Remplir les 5 étapes du formulaire jusqu'au résultat | Les 5 pays s'affichent avec leur score, sans blocage entre les étapes | ✅ |

### 3.2 Sauvegarde des recommandations

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| SAV-01 | Sauvegarde réussie | Utilisateur connecté, résultats calculés | `POST /recommendations/save` avec `criteriaSnapshot` + `resultsSnapshot` | Code 201, recommandation créée et associée à l'utilisateur | ✅ |
| SAV-02 | Sauvegarde sans authentification | — | `POST /recommendations/save` sans token | Code 401 (Unauthorized) | ✅ |
| SAV-03 | Sauvegarde sans `resultsSnapshot` | Utilisateur connecté | Envoyer le body sans ce champ | Code 400, erreur de validation | ✅ |
| SAV-04 | Nom trop long | Utilisateur connecté | Envoyer `name` de plus de 100 caractères | Code 400, erreur de validation (`MaxLength`) | ✅ |
| SAV-05 | Récupération de mes recommandations | Utilisateur connecté avec ≥1 reco sauvegardée | `GET /recommendations/saved` | Code 200, liste des recommandations de l'utilisateur uniquement | ✅ |
| SAV-06 | Récupération d'une reco par id | Recommandation existante appartenant à l'utilisateur | `GET /recommendations/saved/:id` | Code 200, détail de la recommandation | ✅ |
| SAV-07 | Récupération d'une reco d'un autre utilisateur | Recommandation appartenant à un autre compte | `GET /recommendations/saved/:id` avec l'id d'un autre utilisateur | Code 403/404 — accès refusé, pas de fuite de données | ✅ |
| SAV-08 | Suppression d'une reco | Recommandation existante | `DELETE /recommendations/saved/:id` | Code 200/204, recommandation supprimée | ✅ |
| SAV-09 | Suppression d'une reco inexistante | — | `DELETE /recommendations/saved/id-inconnu` | Code 404, pas de crash serveur | ✅ |
| SAV-10 | Front — modale de sauvegarde (`SaveRecoModal`) | Résultats de recommandation affichés, utilisateur connecté | Ouvrir la modale, saisir un nom, valider | `POST /recommendations/save` renvoie 201, un message de confirmation explicite s'affiche dans la modale (`role="status"`, lien vers le tableau de bord), le bouton est désactivé pendant la requête. Les recos sauvegardées sont consultables sur `/dashboard` (voir section 11, CT-021) | ✅ |
| SAV-11 | Front — sauvegarde de données JSON invalides | Cas limite déjà rencontré en production | Simuler une réponse API malformée pour les recommandations sauvegardées | Le front affiche un état d'erreur/vide au lieu de crasher (régression BUG-01, couverte par test unitaire `useRecommendations`) | ✅ |
| SAV-12 | Front — échec de la sauvegarde (modale) | Sauvegarde vouée à l'échec (ex. token expiré → 401) | Valider la modale de sauvegarde | Message d'erreur affiché dans la modale (`role="alert"`), bouton « Réessayer » proposé, l'erreur d'un essai précédent n'apparaît plus à la réouverture (régression BUG-09, couverte par `SaveRecoModal.test.tsx`) | ✅ |

---

## 4. Page destination aléatoire (front — CT-017)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| RND-01 | Tirage aléatoire | Page `/random` ouverte | La page effectue un tirage au chargement | Un pays s'affiche avec ses informations principales | ✅ |
| RND-02 | Nouveau tirage successif | Un pays déjà affiché | Cliquer sur "Rejouer" | Un nouveau pays s'affiche (potentiellement différent), sans erreur d'affichage | ✅ |
| RND-03 | Accès direct à l'URL `/random` | Non connecté | Naviguer directement vers `/random` | La page se charge sans erreur 404 (régression sur les routes non-homepage corrigée) | ✅ |
| RND-04 | Erreur réseau lors du tirage | API indisponible (simulation) | Cliquer sur "Rejouer" | Message d'erreur affiché dans un composant `ErrorState` (`role="alert"`) avec un bouton « Réessayer » fonctionnel, pas de page blanche | ✅ |

---

## 5. Carte mondiale interactive (front — CT-018)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| MAP-01 | Affichage de la carte | Page `/carte` ouverte | Charger la page | Une carte SVG du monde s'affiche, chaque pays coloré selon sa note moyenne (gris si aucune review) | ✅ |
| MAP-02 | Tooltip au survol | Carte affichée | Survoler un pays (ex. la France) | Un tooltip affiche le nom du pays, sa note moyenne et son nombre de reviews | ✅ |
| MAP-03 | Navigation vers la fiche pays | Carte affichée | Cliquer sur un pays reconnu (ex. le Vietnam) | Redirection vers `/pays/VN` | ✅ |
| MAP-04 | Zoom et déplacement | Carte affichée | Utiliser Ctrl + molette pour zoomer, glisser pour déplacer la carte | La carte zoome et se déplace sans erreur d'affichage | ✅ |
| MAP-05 | Clic sur une zone non reconnue | Carte affichée | Cliquer sur une zone du TopoJSON sans correspondance ISO (ex. territoire non souverain) | Aucune navigation ni erreur ; le clic est ignoré silencieusement (pays non focusable, `tabIndex=-1`) | ✅ |
| MAP-06 | Accès à `/carte` sans connexion | Non connecté | Naviguer directement vers `/carte` | La page se charge normalement (route publique) | ✅ |

---

## 6. Navigation générale front

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| NAV-01 | Accès à une URL inconnue | — | Naviguer vers `/une-url-qui-nexiste-pas` | Page 404 dédiée affichée par la route catch-all `*` (composant `NotFound`), avec la barre de navigation et un lien de retour ; pas de page blanche (anomalie BUG-06 corrigée) | ✅ |
| NAV-02 | Accès à une page protégée sans connexion | Non connecté | Naviguer vers une route nécessitant `PrivateRoute` (ex. `/dashboard`) | Redirection vers `/auth/login` | ✅ |
| NAV-03 | Page d'accueil accessible sans connexion | Non connecté | Naviguer vers `/` | Page d'accueil affichée, liens vers login/register visibles | ✅ |

---

## 7. Sécurité

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| SEC-01 | Démarrage sans secret JWT (`JWT_SECRET` ou `JWT_REFRESH_SECRET`) | L'une des deux variables `JWT_SECRET` / `JWT_REFRESH_SECRET` absente de l'environnement | Démarrer l'API | L'API refuse de démarrer (erreur explicite nommant la variable manquante), pas de démarrage avec un secret par défaut ni d'échec différé à la première requête d'authentification | ✅ |
| SEC-02 | Rate limiting sur `/auth/login` | — | Envoyer 6 requêtes `POST /auth/login` en moins d'une minute depuis la même IP | Les 5 premières sont traitées normalement, la 6e renvoie 429 Too Many Requests | ✅ |
| SEC-03 | Rate limiting sur `/auth/register` | — | Envoyer 6 requêtes `POST /auth/register` en moins d'une minute depuis la même IP | La 6e renvoie 429 Too Many Requests | ✅ |
| SEC-04 | Logging d'une tentative de connexion échouée | — | Tenter une connexion avec un email valide et un mauvais mot de passe | Un log serveur de niveau warning est émis (email visible, mot de passe jamais loggé) | ✅ |
| SEC-05 | Logging d'une connexion réussie | Compte existant | Se connecter avec des identifiants valides | Un log serveur de niveau info confirme la connexion | ✅ |
| SEC-06 | Swagger désactivé en production | `NODE_ENV=production` | Appeler `GET /api/docs` | Code 404, la documentation d'API n'est pas exposée publiquement | ✅ |
| SEC-07 | Swagger disponible en développement | `NODE_ENV` différent de `production` | Appeler `GET /api/docs` | Code 200, documentation accessible (comportement dev inchangé) | ✅ |

---

## 8. Accessibilité (RGAA)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| A11Y-01 | Navigation clavier sur la carte du monde | Page `/carte` ouverte | Naviguer avec `Tab` jusqu'à atteindre un pays reconnu, observer le focus, valider avec `Entrée` | Un contour vert identifie visuellement le pays actif au clavier ; le tooltip affiche les mêmes informations qu'au survol souris ; `Entrée`/`Espace` déclenche la navigation vers `/pays/:code` comme un clic | ✅ |
| A11Y-02 | Fermeture de la modale de sauvegarde au clavier | Modale `SaveRecoModal` ouverte | Appuyer sur `Echap` | La modale se ferme, le focus revient sur l'élément qui l'a ouverte | ✅ |
| A11Y-03 | Piège de focus dans la modale | Modale `SaveRecoModal` ouverte | Appuyer sur `Tab` de façon répétée | Le focus reste cantonné aux éléments interactifs de la modale, ne s'échappe pas vers la page en dessous | ✅ |
| A11Y-04 | Association labels/champs — formulaires d'authentification | — | Naviguer au clavier ou avec un lecteur d'écran dans `LoginForm`/`RegisterForm` | Chaque champ est annoncé avec son label associé (email, mot de passe, username, confirmation) | ✅ |
| A11Y-05 | Annonce des erreurs de validation | — | Soumettre un formulaire invalide (login, register, sauvegarde de reco, moteur de recommandation) | Le message d'erreur est annoncé automatiquement (zone `role="alert"`), sans action supplémentaire de l'utilisateur | ✅ |
| A11Y-06 | Filtres de la liste des pays accessibles | Page `/pays` ouverte | Naviguer au clavier/lecteur d'écran dans `CountryFilters` | Chaque champ (recherche, continent, monnaie) possède un nom accessible (`aria-label`) | ✅ |
| A11Y-07 | Langue déclarée de la page | — | Inspecter l'attribut `lang` de `<html>` | `lang="fr"` | ✅ |
| A11Y-08 | Titre de page unique par route | — | Naviguer entre `/`, `/carte`, `/pays/FR`, `/dashboard`, `/auth/login` et observer l'onglet du navigateur | Chaque page affiche « <Nom de la page> — CountryTravel » ; la fiche pays affiche le nom du pays chargé (ex. « France — CountryTravel ») | ✅ |
| A11Y-09 | Contraste des textes informatifs | — | Inspecter les textes secondaires sur fond clair (sous-titres, dates, états vides, placeholders, compteur d'avis) | Couleur `gray-500` ou `gray-600` (ratio ≥ 4,5:1, conforme AA) ; `gray-400` réservé aux icônes décoratives de champs déjà labellisés | ✅ |

---

## 9. Pays visités (API — CT-019)

### 9.1 Ajout et suppression de visites (`POST /visits`, `DELETE /visits/:countryId`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| VIS-01 | Ajout d'un pays visité | Utilisateur connecté, pays existant | `POST /visits` avec `{countryId}` valide | Code 201, visite créée avec les infos du pays (isoCode, name, flagUrl) | ✅ |
| VIS-02 | Ajout en doublon | Le pays est déjà dans les visites de l'utilisateur | Renvoyer le même `POST /visits` | Code 409 — "Country already marked as visited" | ✅ |
| VIS-03 | Ajout sans authentification | — | `POST /visits` sans header `Authorization` | Code 401 (Unauthorized) | ✅ |
| VIS-04 | Pays inexistant | — | `POST /visits` avec un UUID ne correspondant à aucun pays | Code 404 — "Country not found" | ✅ |
| VIS-05 | `countryId` invalide | — | `POST /visits` avec `countryId: "pas-un-uuid"` | Code 400, erreur de validation (`IsUUID`) | ✅ |
| VIS-06 | Suppression d'une visite | Visite existante | `DELETE /visits/:countryId` | Code 200, le pays disparaît de `GET /users/me/visits` | ✅ |
| VIS-07 | Suppression d'une visite inexistante | Le pays n'est pas dans les visites | `DELETE /visits/:countryId` | Code 404 — "Visit not found", pas de crash serveur | ✅ |

### 9.2 Consultation (`GET /users/me/visits`, `GET /visits/map/:username`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| VIS-08 | Liste de mes visites | Utilisateur connecté avec ≥1 visite | `GET /users/me/visits` | Code 200, liste des visites avec les infos pays incluses | ✅ |
| VIS-09 | Liste sans authentification | — | `GET /users/me/visits` sans token | Code 401 (Unauthorized) | ✅ |
| VIS-10 | Carte personnelle publique | Utilisateur `testuser` existant avec ≥1 visite | `GET /visits/map/testuser` sans token | Code 200, tableau `[{isoCode, name}]` des pays visités | ✅ |
| VIS-11 | Carte d'un utilisateur inconnu | — | `GET /visits/map/utilisateur_inconnu` | Code 404 — "User not found" | ✅ |

---

## 10. Avis sur les pays (API — CT-020)

### 10.1 Création / mise à jour (`POST /reviews`, upsert)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| REV-01 | Création d'un avis | Utilisateur connecté ayant visité le pays | `POST /reviews` avec `{countryId, rating: 4, content}` | Code 201, review créée avec les infos du user (username, avatarUrl) | ✅ |
| REV-02 | Mise à jour via le même endpoint (upsert) | Une review existe déjà pour ce user + pays | Renvoyer `POST /reviews` avec `rating: 5` | Code 201, **même id de review**, rating et contenu mis à jour — jamais de doublon (contrainte unique `userId+countryId`) | ✅ |
| REV-03 | Avis sur un pays non visité | Le pays n'est pas dans les visites de l'utilisateur | `POST /reviews` avec ce `countryId` | Code 422 — "You must have visited this country to review it" | ✅ |
| REV-04 | Avis sans authentification | — | `POST /reviews` sans token | Code 401 (Unauthorized) | ✅ |
| REV-05 | Rating hors bornes | — | `POST /reviews` avec `rating: 6` (ou 0) | Code 400, erreur de validation (`Min`/`Max`) | ✅ |
| REV-06 | Pays inexistant | — | `POST /reviews` avec un UUID ne correspondant à aucun pays | Code 404 — "Country not found" | ✅ |

### 10.2 Suppression et consultation (`DELETE /reviews/:id`, `GET /reviews/country/:isoCode`, `GET /reviews/me`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| REV-07 | Suppression par le propriétaire | Review existante appartenant à l'utilisateur | `DELETE /reviews/:id` | Code 200, review supprimée | ✅ |
| REV-08 | Suppression par un autre utilisateur | Review appartenant à un autre compte | `DELETE /reviews/:id` avec le token d'un autre user | Code 403 (Forbidden) — pas de suppression | ✅ |
| REV-09 | Suppression d'une review inexistante | — | `DELETE /reviews/id-inconnu` | Code 404, pas de crash serveur | ✅ |
| REV-10 | Avis d'un pays (public) | ≥1 review visible sur le pays | `GET /reviews/country/FR` sans token | Code 200, liste des reviews (`isVisible: true` uniquement) avec username de l'auteur | ✅ |
| REV-11 | Avis d'un pays inexistant | — | `GET /reviews/country/ZZ` | Code 404 | ✅ |
| REV-12 | Mes avis | Utilisateur connecté avec ≥1 review | `GET /reviews/me` | Code 200, liste de ses reviews avec les infos pays incluses | ✅ |

---

## 11. Tableau de bord utilisateur (front — CT-021)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| DASH-01 | Accès sans connexion | Non connecté (pas de token) | Naviguer vers `/dashboard` | Redirection vers `/auth/login` (`PrivateRoute`) | ✅ |
| DASH-02 | Affichage des statistiques | Utilisateur connecté avec ≥1 visite et ≥1 avis | Ouvrir `/dashboard` | Les compteurs "Pays visités", "Avis publiés" et "Recos sauvegardées" reflètent les données réelles de l'utilisateur | ✅ |
| DASH-03 | Carte personnelle colorisée | ≥1 pays visité | Observer la carte "Ma carte du monde" | Les pays visités apparaissent en bleu, les autres en gris ; le tooltip au survol indique "✓ Visité" ou "Pas encore visité" | ✅ |
| DASH-04 | Suppression d'une visite | ≥1 pays dans "Mes pays visités" | Cliquer sur "Retirer" à côté d'un pays | Le pays disparaît immédiatement de la liste **et** de la carte **et** du compteur, sans rechargement de page | ✅ |
| DASH-05 | Échec de suppression | API indisponible (simulation) | Cliquer sur "Retirer" | La liste reste intacte, un message d'erreur s'affiche (couvert par test unitaire `useMyVisits`) | ✅ |
| DASH-06 | Listes vides | Nouvel utilisateur sans donnée | Ouvrir `/dashboard` | Chaque section affiche un état vide explicite avec un texte d'invite (pas de zone blanche) | ✅ |
| DASH-07 | Navigation vers une fiche pays | ≥1 pays visité | Cliquer sur le nom d'un pays (liste) ou sur un pays bleu (carte) | Redirection vers `/pays/:isoCode` | ✅ |
| DASH-08 | Suppression d'une recommandation sauvegardée | ≥1 reco dans "Mes recommandations sauvegardées" | Cliquer sur "Supprimer" à côté d'une reco | `DELETE /recommendations/saved/:id` renvoie 200 ; la reco disparaît immédiatement de la liste et le compteur se met à jour, sans rechargement (échec réseau : liste intacte + message d'erreur, couvert par test unitaire `useSavedRecos`) | ✅ |

---

## 12. Avis sur la fiche pays (front — CT-022)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Statut |
|---|---|---|---|---|---|
| AVI-01 | Visiteur non connecté | Aucun token | Ouvrir `/pays/DE`, section "Avis voyageurs" | Lien « Connectez-vous pour donner votre avis », pas de formulaire ; la liste des avis reste consultable (endpoint public) | ✅ |
| AVI-02 | Connecté, pays non visité | Utilisateur connecté, pays absent de ses visites | Ouvrir la fiche du pays | Message « Vous devez avoir visité ce pays pour donner votre avis. » + bouton « J'y suis allé » (pas de formulaire) | ✅ |
| AVI-03 | Marquer le pays visité depuis la fiche | État AVI-02 | Cliquer « J'y suis allé » | `POST /visits` renvoie 201 ; le formulaire d'avis apparaît immédiatement, sans rechargement | ✅ |
| AVI-04 | Publication d'un avis | Connecté + pays visité | Choisir une note (étoiles), saisir un texte, « Publier mon avis » | `POST /reviews` renvoie 201 ; l'avis apparaît immédiatement en tête de liste avec la mention « (vous) », le compteur du titre s'incrémente, sans rechargement | ✅ |
| AVI-05 | Modification de mon avis (upsert) | Un avis existant sur ce pays | Le formulaire est pré-rempli (« Mettre à jour mon avis ») ; changer la note, soumettre | L'avis est mis à jour dans la liste **sans doublon** (même id) | ✅ |
| AVI-06 | Soumission sans note | Formulaire vierge | Cliquer « Publier mon avis » sans choisir d'étoile | Message « Choisissez une note avant de publier votre avis. » (`role="alert"`), aucun appel API | ✅ |
| AVI-07 | Suppression de mon avis | Mon avis affiché dans la liste | Cliquer « Supprimer » (visible uniquement sur mon avis) | L'avis disparaît de la liste, le formulaire repasse en mode création ; le bouton n'apparaît pas sur les avis des autres utilisateurs | ✅ |
| AVI-08 | Accessibilité de la notation | — | Naviguer au clavier jusqu'aux étoiles | Le groupe est un `radiogroup` (une seule tabulation), les flèches changent la note, chaque étoile est annoncée « x sur 5 » (couvert par `StarRating.test.tsx`) | ✅ |
| AVI-09 | Limite de longueur de l'avis | Formulaire affiché | Saisir un texte | Compteur `x/2000` visible, saisie bloquée à 2000 caractères (`maxLength`, aligné sur le `MaxLength` API) | ✅ |

---

## Traçabilité

Les anomalies détectées lors de l'exécution de ces scénarios sont consignées dans le [plan de correction des bogues](./plan-correction-bogues.md), avec pour chacune : contexte, analyse, correctif appliqué et commit associé.
