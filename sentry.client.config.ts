import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture 100% des erreurs. Pour les traces de performance, on échantillonne
  // à 20% pour ne pas exploser le quota gratuit à mesure que le trafic grandit.
  tracesSampleRate: 0.2,
  // N'active Sentry que si un DSN est configuré (évite des erreurs en local
  // si vous n'avez pas encore de compte Sentry configuré dans .env)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
