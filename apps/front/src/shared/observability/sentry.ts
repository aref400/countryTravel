import * as Sentry from "@sentry/react";

/**
 * Initialise Sentry pour la capture des erreurs applicatives côté front.
 *
 * No-op si `VITE_SENTRY_DSN` n'est pas défini (développement local, CI) : la
 * supervision des erreurs ne s'active qu'en environnement explicitement
 * configuré, ce qui évite tout bruit et toute fuite en dehors de la production.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Échantillonnage des traces de performance (10 %) pour limiter le volume.
    tracesSampleRate: 0.1,
    // On n'envoie pas de données personnelles identifiantes par défaut.
    sendDefaultPii: false,
  });
}
