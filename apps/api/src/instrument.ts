import * as dotenv from 'dotenv';
import * as Sentry from '@sentry/nestjs';

/**
 * Initialisation de Sentry pour la capture des erreurs applicatives de l'API.
 *
 * Ce fichier DOIT être importé en tout premier dans main.ts (avant NestFactory
 * et les autres modules) pour que Sentry puisse instrumenter les bibliothèques.
 *
 * Comme ce code s'exécute avant le chargement du ConfigModule de NestJS, on
 * charge ici le .env manuellement pour disposer de SENTRY_DSN en local. En
 * production (Railway), la variable est déjà présente dans l'environnement.
 *
 * No-op si SENTRY_DSN n'est pas défini (développement local, CI, tests) : la
 * supervision des erreurs ne s'active qu'en environnement configuré.
 */
dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Échantillonnage des traces de performance (10 %) pour limiter le volume.
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
