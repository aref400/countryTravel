# Système de supervision — CountryTravel

Ce document décrit le dispositif de supervision mis en place pour garantir la disponibilité de l'application en production : le périmètre supervisé, les sondes, les indicateurs suivis, les seuils d'alerte et les modalités de signalement. Il constitue la base de la section « supervision » du dossier du Bloc 4 (compétence C4.1.2).

## 1. Périmètre de supervision

L'application est déployée sur trois composants, chacun devant rester disponible :

| Composant             | Hébergement          | Rôle                                       |
| --------------------- | -------------------- | ------------------------------------------ |
| API REST (NestJS)     | Railway              | Cœur métier, expose `/api/v1`              |
| Base PostgreSQL       | Railway              | Persistance (utilisateurs, pays, avis…)    |
| Front (React/Vite)    | Netlify              | Interface utilisateur (SPA statique)       |

La disponibilité de l'API dépend directement de celle de la base : une API vivante mais sans base n'est pas en mesure de servir. La supervision distingue donc explicitement ces deux états.

## 2. Sondes mises en place

### 2.1 Sonde de liveness — `GET /api/v1/health/live`

Répond immédiatement, sans tester aucune dépendance. Finalité : déterminer si le process Node répond (« l'API est-elle debout ? »). Réponse :

```json
{ "status": "ok", "uptime": 1342.7, "timestamp": "2026-08-03T10:12:04.512Z" }
```

### 2.2 Sonde de readiness — `GET /api/v1/health`

Construite avec `@nestjs/terminus`. Agrège une sonde applicative — la connexion à la base — via un `SELECT 1` (requête triviale, sans effet de bord) dont on **mesure le temps de réponse**. Finalité : déterminer si l'API est réellement capable de servir. Code source : [`apps/api/src/health/`](../apps/api/src/health/).

- Base joignable → HTTP **200** :

```json
{
  "status": "ok",
  "info": { "database": { "status": "up", "responseTime": 12 } },
  "error": {},
  "details": { "database": { "status": "up", "responseTime": 12 } }
}
```

- Base injoignable → HTTP **503** :

```json
{
  "status": "error",
  "error": { "database": { "status": "down", "message": "connection refused" } }
}
```

C'est cette sonde qui est interrogée par le moniteur d'uptime externe : le code HTTP (200 vs 503) traduit directement l'aptitude au service.

### 2.3 Sonde d'erreurs applicatives — Sentry

`@sentry/nestjs` (API) et `@sentry/react` (front) capturent les exceptions non gérées et les remontées d'erreurs runtime. Côté API, un filtre global (`SentryGlobalFilter`) intercepte toute exception, la transmet à Sentry, puis délègue le rendu de la réponse HTTP au comportement par défaut (aucune modification du contrat d'erreur de l'API).

L'activation est conditionnée à une variable d'environnement (voir §5) : sans DSN, le SDK est un no-op — aucune donnée n'est émise en développement ni en CI.

### 2.4 Sonde de disponibilité externe — moniteur d'uptime

Un service tiers (UptimeRobot ou Better Stack, offre gratuite) interroge la sonde de readiness à intervalle régulier depuis l'extérieur du réseau d'hébergement. Il mesure la disponibilité réelle telle que perçue par un client et déclenche l'alerte en cas d'indisponibilité. Procédure de configuration au §6.

## 3. Indicateurs de suivi

| Indicateur                       | Source                          | Ce qu'il mesure                                    |
| -------------------------------- | ------------------------------- | -------------------------------------------------- |
| Disponibilité (uptime %)         | Moniteur externe                | Part du temps où l'API répond 200 sur `/health`    |
| Temps de réponse readiness (ms)  | Sonde readiness + moniteur      | Latence API + aller-retour base                    |
| Statut de la base (up/down)      | Sonde readiness                 | Connectivité PostgreSQL                            |
| Nombre / taux d'erreurs runtime  | Sentry                          | Exceptions non gérées front et API                 |
| Uptime process (s)               | Sonde liveness                  | Durée depuis le dernier redémarrage de l'API       |

## 4. Seuils d'alerte

Seuils retenus, dimensionnés pour une application à trafic modéré :

| Condition                                                        | Niveau      | Action                          |
| --------------------------------------------------------------- | ----------- | ------------------------------- |
| `/health` renvoie ≠ 200 sur **2 vérifications consécutives**    | 🔴 Critique | Alerte immédiate (indispo)      |
| Temps de réponse readiness > **2000 ms**                        | 🟠 Alerte   | Notification                    |
| Temps de réponse readiness > **500 ms** (sur la durée)          | 🟡 Vigilance| Surveillance (dégradation)      |
| Nouvelle erreur non encore vue remontée par Sentry              | 🟠 Alerte   | Notification par e-mail         |
| Disponibilité mensuelle < **99 %**                              | 🟠 Alerte   | Analyse a posteriori            |

Avec un intervalle de vérification de 5 minutes, la règle « 2 vérifications consécutives » déclenche une alerte en ~10 minutes, ce qui évite les faux positifs sur un incident réseau transitoire tout en garantissant une détection rapide.

## 5. Modalité de signalement

- **Moniteur d'uptime** : e-mail à l'exploitant dès qu'un incident est ouvert (indisponibilité) puis à sa résolution. Un canal supplémentaire (webhook, SMS) peut être ajouté sans changer le dispositif.
- **Sentry** : e-mail sur nouvelle erreur et sur pic de fréquence, avec la stack trace et le contexte permettant le diagnostic.

Activation de Sentry (variables d'environnement) :

| Composant | Variable          | Où la renseigner                                   |
| --------- | ----------------- | -------------------------------------------------- |
| API       | `SENTRY_DSN`      | Variables du service API sur Railway               |
| Front     | `VITE_SENTRY_DSN` | Secret Netlify / GitHub Actions (injecté au build) |

Tant que ces variables ne sont pas définies, la supervision d'erreurs reste inactive (no-op), sans impact sur l'application.

## 6. Configuration du moniteur d'uptime (procédure)

1. Créer un compte gratuit (UptimeRobot ou Better Stack).
2. Ajouter un monitor de type **HTTP(s)** sur l'URL publique de la readiness :
   `https://<domaine-api-railway>/api/v1/health`
3. Intervalle de vérification : **5 minutes**.
4. Condition d'alerte : code HTTP différent de `200` (la sonde renvoie 503 si la base est KO).
5. Renseigner l'e-mail de notification (ouverture et résolution d'incident).
6. Conserver le lien de la page de statut publique (rapport de disponibilité) : elle fournit l'historique d'uptime à joindre au dossier.

## 7. Vérifier la supervision en local

Pour capturer une réponse réelle des sondes (utile comme preuve dans le dossier) :

```bash
docker compose up -d          # démarre PostgreSQL
cd apps/api && npm run dev     # démarre l'API sur http://localhost:3000

# Dans un autre terminal :
curl http://localhost:3000/api/v1/health        # readiness (base testée)
curl http://localhost:3000/api/v1/health/live   # liveness

# Simulation d'incident base : arrêter la base et rejouer la readiness
docker compose stop db
curl -i http://localhost:3000/api/v1/health     # doit renvoyer 503 + status "down"
```
