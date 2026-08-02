const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"] },
};

module.exports = withSentryConfig(nextConfig, {
  // Options de l'étape de build Sentry (source maps, etc.)
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Ne bloque jamais le build même si Sentry n'est pas configuré (ex: en local)
  disableLogger: true,
});
