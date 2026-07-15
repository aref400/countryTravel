# CountryTravel — API

Backend NestJS 11 + Prisma 7 + PostgreSQL.

## Démarrage rapide

1. Base de données : `docker compose up -d` depuis la racine du repo (ou toute URL PostgreSQL à vous)
2. Copier `.env.example` en `.env` et renseigner les secrets JWT (`openssl rand -base64 64`)
3. `npm install` (depuis la racine du monorepo)
4. `npm run db:setup` (migrations + seed — idempotent)
5. `npm run start:dev` (ou `npm run dev` à la racine pour lancer API + front)

Documentation complète : [manuel de déploiement](../../docs/manuel-deploiement.md) · [manuel de mise à jour](../../docs/manuel-mise-a-jour.md) · [sécurité et accessibilité](../../docs/securite-accessibilite.md)

## Docs API

Swagger : http://localhost:3000/api/docs (désactivé en production).

## Commandes

```bash
npm run start:dev    # développement (watch)
npm run build        # compilation
npm run start:prod   # exécution du build (node dist/src/main)
npm run db:setup     # migrations + seed
npm test             # tests unitaires (Jest)
npm run test:cov     # couverture
npm run lint         # ESLint
```
