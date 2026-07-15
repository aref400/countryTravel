# CountryTravel — Front

Interface React 18 + TypeScript + Vite, organisée par feature (`src/features/*`).

## Démarrage rapide

Depuis la racine du monorepo (l'API doit tourner — voir [manuel de déploiement](../../docs/manuel-deploiement.md)) :

```bash
npm install
npm run dev:front     # http://localhost:5173
```

Variable d'environnement optionnelle : `VITE_API_URL` — URL de base de l'API avec le préfixe `/api` (défaut : `http://localhost:3000/api`).

## Structure

```
src/
├── app/           # routing, layouts
├── features/      # un dossier par fonctionnalité (auth, countries, recommendations, countriesMap, random…)
│   └── <feature>/ # components/, services/, hooks/, schemas/, types
├── pages/         # pages liées aux routes
└── shared/        # composants, hooks, store et utilitaires transverses
```

## Commandes

```bash
npm run dev          # développement (HMR)
npm run build        # build de production (dist/)
npm test             # tests unitaires (Vitest + React Testing Library)
npm run lint         # ESLint
```

## Accessibilité

Le front vise la conformité RGAA sur son périmètre fonctionnel : navigation clavier complète (y compris la carte SVG interactive), formulaires labellisés, erreurs annoncées (`role="alert"`), modales avec piège de focus. Détail : [sécurité et accessibilité](../../docs/securite-accessibilite.md).
