"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-paper flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-ink mb-2">Une erreur est survenue</h1>
          <p className="text-neutral-600 mb-6">
            Le problème a été signalé automatiquement à notre équipe. Vous pouvez réessayer.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-brand hover:bg-brand-dark text-white font-medium px-5 py-2.5 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
