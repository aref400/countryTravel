# Manuel de déploiement — CountryTravel

Ce manuel décrit comment installer, lancer et déployer l'application CountryTravel. Il s'adresse à un développeur ou un évaluateur récupérant le projet pour la première fois, ainsi qu'à l'exploitant des environnements de production.

## 1. Architecture et technologies

Monorepo npm workspaces :

| Composant | Chemin       | Stack                           | Port local |
| --------- | ------------ | ------------------------------- | ---------- |
| API       | `apps/api`   | NestJS 11, Prisma 7, PostgreSQL | 3000       |
| Front     | `apps/front` | React 18, TypeScript, Vite      | 5173       |

Production : API hébergée sur **Railway** (avec sa base PostgreSQL), front hébergé sur **Netlify**. Déploiement continu via GitHub Actions (voir §6).

## 2. Prérequis

- **Node.js ≥ 20** et npm ≥ 10 (seul prérequis indispensable)
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (optionnel — uniquement pour la base de données locale du parcours B)
- Un compte sur l'application n'exige rien d'autre qu'un navigateur récent

## 3. Installation locale

Trois parcours possibles selon votre situation :

### Parcours A — sans rien installer : l'application déployée

L'application de production est accessible en ligne (front Netlify + API Railway). Pour simplement utiliser ou évaluer le logiciel, aucun clonage n'est nécessaire — voir le [manuel d'utilisation](./manuel-utilisation.md).

### Parcours B — local avec Docker (recommandé)

```bash
git clone <url-du-repo> && cd countryTravel
docker compose up -d                      # démarre PostgreSQL 17 en local
cp apps/api/.env.example apps/api/.env    # la DATABASE_URL par défaut pointe déjà sur cette base
# → éditer apps/api/.env : renseigner JWT_SECRET et JWT_REFRESH_SECRET (voir ci-dessous)
npm install                               # installe les workspaces + génère le client Prisma
npm run db:setup                          # applique les migrations + seed (30 pays, 30 fiches critères)
npm run dev                               # démarre API (:3000) et front (:5173) en parallèle
```

> **Générer les deux secrets JWT.** `JWT_SECRET` et `JWT_REFRESH_SECRET` doivent être
> **deux valeurs distinctes** (le refresh token vit 7 jours : une clé compromise ne doit
> pas suffire à forger les deux types de jetons). L'API **refuse de démarrer** si l'un des
> deux est absent. Lancez donc la commande **deux fois** — une valeur par variable :
>
> ```bash
> openssl rand -base64 64      # à exécuter 2 fois : copier chaque sortie dans une variable
> ```
>
> Si votre terminal ne dispose pas d'`openssl` (fréquent sous Windows/PowerShell), utilisez
> Node, forcément présent puisque requis par le projet :
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"   # idem, 2 fois
> ```

### Parcours C — local sans Docker

Identique au parcours B, en remplaçant l'étape Docker par une base PostgreSQL à vous :
soit un PostgreSQL installé nativement, soit une base cloud gratuite (Neon, Supabase, `npx create-db`…).
Renseignez son URL dans `apps/api/.env` (`DATABASE_URL`), puis reprenez à `npm install`.

### Vérification de l'installation

| Vérification                           | Attendu                                             |
| -------------------------------------- | --------------------------------------------------- |
| http://localhost:5173                  | Page d'accueil CountryTravel                        |
| http://localhost:3000/api/v1/countries | JSON, 30 pays au total                              |
| http://localhost:3000/api/docs         | Documentation Swagger (en développement uniquement) |

Le seed est **idempotent** (upserts) : relancer `npm run db:setup` est toujours sans risque. Les données pays sont embarquées dans le repo (`apps/api/prisma/data/*.json`) — aucune dépendance à un service externe au moment du seed.

## 4. Variables d'environnement

Fichier `apps/api/.env` (modèle complet dans `apps/api/.env.example`) :

| Variable                                    | Rôle                          | Note                                         |
| ------------------------------------------- | ----------------------------- | -------------------------------------------- |
| `DATABASE_URL`                              | Connexion PostgreSQL          | Par défaut : base Docker locale              |
| `JWT_SECRET`                                | Signature des access tokens   | **L'API refuse de démarrer s'il est absent** |
| `JWT_REFRESH_SECRET`                        | Signature des refresh tokens  | **Distinct de `JWT_SECRET` ; l'API refuse aussi de démarrer s'il est absent** |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Durées de vie                 | 15 min / 7 jours                             |
| `PORT`                                      | Port de l'API                 | 3000 par défaut                              |
| `NODE_ENV`                                  | Environnement                 | `production` désactive Swagger               |
| `FRONTEND_URL`                              | Origine autorisée par le CORS | `http://localhost:5173` par défaut           |

Côté front, une seule variable (optionnelle en local) : `VITE_API_URL` — URL de base de l'API **avec** le préfixe `/api` (ex. `https://<domaine-railway>/api`). Sans elle, le front cible `http://localhost:3000/api`.

## 5. Build et exécution en mode production

```bash
npm run build:api && npm run build:front   # compile les deux applications
npm run start:api                          # exécute l'API compilée (node dist/src/main)
```

Le build front (`apps/front/dist/`) est un site statique servi par n'importe quel hébergeur (Netlify en production).

En production, définir `NODE_ENV=production` : cela désactive l'exposition de Swagger (`/api/docs` renvoie alors 404). **Cette variable doit être positionnée sur le service Railway** — rien dans le code ne peut le garantir à sa place.

## 6. Déploiement continu (GitHub Actions)

Trois workflows dans `.github/workflows/` :

| Workflow           | Déclencheur                                                | Actions                                       |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------- |
| `pr.yml`           | Pull request vers `main`/`develop`                         | Lint + tests + build des deux apps (bloquant) |
| `deploy-api.yml`   | Push sur `main` touchant `apps/api`   | Build puis `railway up --service api`        |
| `deploy-front.yml` | Push sur `main` touchant `apps/front` | Build Vite puis déploiement Netlify `--prod` |

Secrets GitHub requis : `RAILWAY_TOKEN`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `VITE_API_URL`.

⚠️ **Les migrations de base de données ne sont pas appliquées par le pipeline** : après un déploiement incluant une migration, l'appliquer manuellement — procédure détaillée dans le [manuel de mise à jour](./manuel-mise-a-jour.md#3-évolution-du-schéma-de-base-de-données).

## 7. Checklist post-déploiement

1. `GET https://<api>/api/v1/countries` → 200, liste non vide
2. `GET https://<api>/api/docs` → **404** (Swagger bien désactivé)
3. Front : page d'accueil, connexion, calcul d'une recommandation
4. En cas de migration : vérifier `npx prisma migrate status` contre la base de production
5. Rejouer les scénarios du [cahier de recettes](./cahier-recettes.md) touchés par la livraison
