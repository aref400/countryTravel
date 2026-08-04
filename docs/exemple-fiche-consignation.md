# Exemple de fiche de consignation d'une anomalie

Cette fiche illustre le résultat du gabarit d'issue [`bug_report.yml`](../.github/ISSUE_TEMPLATE/bug_report.yml) renseigné pour une anomalie réellement rencontrée au cours du projet (BUG-02). Elle contient l'ensemble des informations permettant de **reproduire** le bogue, préalable indispensable à son analyse et à sa correction.

---

**Titre** : `[BUG] Perte de session après rechargement de la page`
**N° de suivi** : BUG-02
**Date de consignation** : 2026-05-14
**Statut** : Résolu

| Champ                | Valeur                                                        |
| -------------------- | ------------------------------------------------------------ |
| Gravité              | 🟠 Majeur — fonctionnalité dégradée mais contournable        |
| Périmètre concerné   | Front (React)                                                |
| Source de détection  | Scénario de recette AUTH-18 (recette manuelle)               |
| Environnement        | Chrome 126 / Windows 11 — application déployée (Netlify)     |

### Description

Après s'être connecté avec succès, l'utilisateur est déconnecté silencieusement dès qu'il rafraîchit la page (F5). Il doit se reconnecter à chaque rechargement.

### Étapes de reproduction

1. Aller sur la page de connexion de l'application.
2. Se connecter avec des identifiants valides.
3. Constater que l'on accède bien à l'espace authentifié (menu utilisateur visible).
4. Appuyer sur F5 (ou recharger l'onglet).
5. Observer que l'on est renvoyé à l'état non connecté.

### Comportement attendu

Après rafraîchissement, la session est conservée : l'utilisateur reste authentifié tant que son token est valide.

### Comportement observé

L'utilisateur est déconnecté à chaque rechargement, sans message. L'état d'authentification (store Zustand) est réinitialisé et aucun token n'est retrouvé au démarrage de l'application.

### Analyse (cause racine)

`setAuth` dans `apps/front/src/shared/store/auth.store.ts` mettait à jour l'état Zustand (`user`, `accessToken`) mais **n'écrivait jamais le token dans `localStorage`**. Seule la fonction `logout` y touchait (pour le supprimer) : le token n'était donc jamais présent pour être relu à l'initialisation de l'application.

### Correctif

`setAuth` écrit désormais explicitement `localStorage.setItem("token", accessToken)` avant de mettre à jour le state. Le token est ainsi réhydraté au démarrage.

### Vérification

Rejeu du scénario AUTH-18 : connexion puis F5 — l'utilisateur reste authentifié. Correctif rattaché au commit `b2182b0` et livré via le pipeline d'intégration/déploiement continu.

---

> Le cycle complet (détection → consignation → analyse → correction → vérification) est décrit dans le [plan de correction des bogues](./plan-correction-bogues.md), qui référence l'ensemble des anomalies traitées sur le projet.
