# Manuel de mise à jour — CountryTravel

Ce manuel décrit les procédures pour faire évoluer l'application : livrer une modification de code, mettre à jour les dépendances, faire évoluer le schéma de base de données ou les données de référence, et revenir en arrière en cas de problème.

## 1. Livrer une modification de code

Workflow git :

1. Créer une branche depuis `main` (ex. `CT-042-nouvelle-fonctionnalite`, `fix/bug-login`)
2. Développer, avec tests unitaires quand pertinent (Jest côté API, Vitest côté front)
3. Ouvrir une **pull request vers `main`** — le workflow `pr.yml` exécute automatiquement lint, tests et build des deux applications ; la PR ne doit être fusionnée que si tout est vert
4. À la fusion sur `main`, le déploiement est **automatique** : `deploy-api.yml` (Railway) et/ou `deploy-front.yml` (Netlify) se déclenchent selon les fichiers touchés
5. Dérouler la checklist post-déploiement du [manuel de déploiement](./manuel-deploiement.md#7-checklist-post-déploiement)

À chaque livraison de fonctionnalité : mettre à jour le [cahier de recettes](./cahier-recettes.md) (nouveaux scénarios) et, pour toute anomalie corrigée, le [plan de correction des bogues](./plan-correction-bogues.md).

## 2. Mise à jour des dépendances

Fréquence recommandée : mensuelle, et immédiate en cas d'alerte de sécurité.

```bash
npm audit                 # état des vulnérabilités connues
npm audit fix             # corrections sans changement de version majeure
npm outdated              # dépendances en retard (informationnel)
```

Règles :

- **Jamais `npm audit fix --force` sans analyse** : il peut rétrograder ou monter des versions majeures. Analyser chaque cas (exploitabilité réelle, chemin de dépendance) — exemple documenté dans [Sécurité et accessibilité](./securite-accessibilite.md#limites-connues-et-décisions-documentées).
- Après toute mise à jour : `npx tsc --noEmit` + suite de tests complète (`npm test`) avant commit.
- Les montées de version majeures (NestJS, Prisma, React, Vite) se font isolément, une à la fois, dans une PR dédiée.

## 3. Évolution du schéma de base de données

Le schéma est défini dans `apps/api/prisma/schema.prisma`. Pour le modifier :

```bash
cd apps/api
# 1. Éditer schema.prisma
npx prisma migrate dev --name description_du_changement   # crée + applique la migration en local, régénère le client
npm test                                                   # vérifier l'absence de régression
# 2. Committer le dossier prisma/migrations/<timestamp>_description généré
```

### ⚠️ Application en production

Le pipeline de déploiement **n'applique pas les migrations** sur la base Railway. Après la fusion d'une PR contenant une migration :

```bash
cd apps/api
DATABASE_URL="<url-de-la-base-railway>" npx prisma migrate deploy
DATABASE_URL="<url-de-la-base-railway>" npx prisma migrate status   # vérification
```

L'URL de production se récupère dans le dashboard Railway (service PostgreSQL → Variables). `migrate deploy` n'applique que les migrations en attente, sans jamais réinitialiser les données. _Amélioration identifiée : intégrer cette étape au workflow `deploy-api.yml` pour supprimer l'opération manuelle._

## 4. Mise à jour des données de référence

Les données servies par le seed sont embarquées dans `apps/api/prisma/data/` :

| Fichier             | Contenu                                                          | Pour ajouter un pays                                                                                                   |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `countries.json`    | État civil des pays (nom, capitale, drapeau, monnaie, continent) | Ajouter une entrée (les informations peuvent être récupérées via l'API Rest Countries **v5**, manuellement, hors seed) |
| `criteria.json`     | Notes 1–5 par pays alimentant le moteur de recommandation        | Ajouter la fiche de critères correspondante (donnée éditoriale)                                                        |
| `descriptions.json` | Descriptions rédigées en français                                | Ajouter la description correspondante                                                                                  |

Après modification : `npm run db:setup` (local) — le seed est idempotent (upserts), il met à jour l'existant et insère le nouveau sans dupliquer. Pour la production, exécuter le seed avec l'URL Railway (même précaution qu'au §3).

> Historique : le seed appelait autrefois l'API restcountries.com v3.1 au moment de l'exécution ; cette API a été coupée (dépréciation), rendant le seed inopérant sur toute nouvelle installation. Les données sont depuis embarquées dans le repo précisément pour immuniser l'installation contre la disparition de services externes.

## 5. Versions et retour arrière

- **Code** : l'historique git fait foi ; chaque déploiement correspond à un commit de `main`. Pour un retour arrière propre : `git revert` du commit fautif puis push (le pipeline redéploie), plutôt qu'un `push --force`.
- **API (Railway)** : le dashboard Railway conserve l'historique des déploiements et permet un rollback en un clic vers un déploiement antérieur.
- **Front (Netlify)** : le dashboard Netlify conserve chaque déploiement ; « Publish deploy » sur un déploiement antérieur restaure instantanément la version correspondante.
- **Base de données** : les migrations Prisma ne se « dé-appliquent » pas automatiquement — un retour arrière de schéma se traite par une **nouvelle** migration inverse. En cas de perte de données, restaurer depuis les sauvegardes Railway.

## 6. Journal des versions

Les évolutions notables sont consignées dans le [journal des versions](../CHANGELOG.md) (`CHANGELOG.md`, format _Keep a Changelog_), qui regroupe les livraisons par version en s'appuyant sur les merge commits de `main` (une PR = une évolution) et les fiches du [plan de correction des bogues](./plan-correction-bogues.md) pour les correctifs. À chaque nouvelle version livrée, ajouter une entrée en tête sous une section datée.
