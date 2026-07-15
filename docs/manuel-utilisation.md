# Manuel d'utilisation — CountryTravel

CountryTravel aide à choisir sa prochaine destination de voyage : consultation de fiches pays, moteur de recommandation personnalisé, carte mondiale interactive et fonctions communautaires (avis). Ce manuel décrit les fonctionnalités du point de vue de l'utilisateur final.

## 1. Accéder à l'application

- **En ligne** : via l'URL de production (front Netlify).
- **En local** : http://localhost:5173 après installation (voir [manuel de déploiement](./manuel-deploiement.md)).

L'application est utilisable **sans compte** pour toute la partie consultation et recommandation. Un compte n'est nécessaire que pour sauvegarder ses recommandations et accéder à son tableau de bord.

## 2. Compte utilisateur

### Inscription

« S'inscrire » (barre de navigation) → renseigner un nom d'utilisateur (≥ 3 caractères), un email valide et un mot de passe (≥ 8 caractères), accepter les conditions. Les erreurs de saisie sont signalées champ par champ.

### Connexion / déconnexion

« Connexion » → email + mot de passe. La session persiste après rechargement de la page. « Déconnexion » depuis la barre de navigation. En cas d'oubli du mot de passe, un lien « Mot de passe oublié ? » est présent sur l'écran de connexion.

> Sécurité : après 5 tentatives de connexion en moins d'une minute, le service bloque temporairement les nouvelles tentatives (réponse « Too Many Requests »). Attendre une minute avant de réessayer.

## 3. Explorer les pays

- **Liste des pays** (« Page pays ») : cartes avec drapeau et informations clés, pagination.
- **Recherche** : par nom, depuis la barre de navigation (loupe) ou le champ de recherche de la liste.
- **Filtres** : par continent et par monnaie, cumulables avec la recherche ; bouton « Réinitialiser ».
- **Fiche pays** : cliquer sur une carte → description, capitale, continent, caractéristiques notées sur 5 (budget, sécurité, température…), types d'expériences (nature, culture, gastronomie…), note moyenne et avis des voyageurs.

## 4. Obtenir des recommandations personnalisées

« Recommandation » → répondre à un questionnaire en plusieurs étapes : chaque critère (budget, sécurité, température, nature, culture, sport, gastronomie, vie urbaine, détente, vie nocturne, histoire) se note de « Pas du tout » à « Énormément », plus un interrupteur « Voyage en famille ».

Résultat : **top 5 des destinations** avec un score de compatibilité en pourcentage. Cliquer sur une destination ouvre sa fiche pays ; « Recommencer » relance le questionnaire.

### Sauvegarder ses recommandations (compte requis)

Sur l'écran de résultats, « Sauvegarder ces recommandations » → nommer la sauvegarde (ex. « Voyage été 2027 »). Les sauvegardes se retrouvent dans le tableau de bord (clic sur son nom d'utilisateur), où chacune peut être consultée ou supprimée.

## 5. Destination aléatoire

« Destination aléatoire » (page d'accueil) ou l'URL `/random` : tirage d'un pays au hasard avec ses informations principales. Relancer autant de fois que souhaité.

## 6. Carte mondiale interactive

« Carte » : planisphère où chaque pays est coloré selon sa note moyenne (légende en bas de page — vert : bien noté, orange : moyen, rouge : mal noté, bleu : pas encore noté, gris : non disponible).

- **Survol** d'un pays : nom, note moyenne et nombre d'avis.
- **Clic** : ouvre la fiche du pays.
- **Zoom** : Ctrl + molette (le défilement de page reste normal sinon) ; cliquer-glisser pour déplacer.

## 7. Accessibilité

L'application vise la conformité au référentiel **RGAA** sur son périmètre fonctionnel (démarche détaillée dans [Sécurité et accessibilité](./securite-accessibilite.md)) :

- **Navigation au clavier** : tous les parcours sont réalisables sans souris — y compris la carte mondiale (`Tab` pour passer de pays en pays, contour vert visible, `Entrée` pour ouvrir la fiche) et les fenêtres modales (`Échap` pour fermer).
- **Lecteurs d'écran** : champs de formulaire nommés, erreurs de validation annoncées automatiquement, structure de page sémantique (`main`, `nav`), langue déclarée en français.

## 8. Problèmes courants

| Symptôme | Cause probable | Solution  |
| ------- | ---------- |--------------- |
| « Too Many Requests » à la connexion  |  Limite anti-brute-force (5/min)    | Attendre 1 minute     |
| Liste des pays vide (installation locale)        | Base non seedée    | `npm run db:setup` ([manuel de déploiement](./manuel-deploiement.md)) |
| Message d'erreur sur le calcul de recommandation | API injoignable   | Vérifier que l'API tourne (`npm run dev`)  |
| Déconnecté après ~15 minutes   | Le jeton de session expire au bout de 15 minutes (choix de sécurité) | Se reconnecter  |
