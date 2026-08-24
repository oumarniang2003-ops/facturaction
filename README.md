# Factura — SaaS de facturation pour commerçants

Chaque commerçant crée son compte, choisit son abonnement, et gère sa propre
boutique (factures, devis, clients, stock) de façon totalement indépendante
des autres (architecture **multi-tenant**).

## Ce qui est déjà fonctionnel

- Inscription → création automatique d'une boutique (`Merchant`) isolée
- Connexion (NextAuth, credentials + mot de passe hashé)
- Choix d'un abonnement (Starter / Pro / Business) via Stripe Checkout
- Dashboard avec vue d'ensemble (CA encaissé, factures, clients, alertes stock)
- Création de factures/devis avec lignes dynamiques, calcul TVA automatique,
  numérotation séquentielle légale (`FAC-2026-0001`)
- Gestion clients (CRM léger)
- Gestion produits + suivi de stock avec alerte stock bas
- Isolation stricte des données : **toutes** les requêtes sont filtrées par
  `merchantId` (voir `lib/auth.ts` et les routes dans `app/api/`)
- **Génération de facture en PDF** (`components/InvoicePdf.tsx` +
  `app/api/invoices/[id]/pdf/route.tsx`) — bouton "Voir" sur chaque ligne
  de la liste des factures
- **Webhook Stripe** (`app/api/webhooks/stripe/route.ts`) qui active
  automatiquement l'abonnement après paiement, gère les renouvellements,
  les échecs de paiement et les annulations
- **Envoi d'email** (Resend) : bouton "Envoyer" sur chaque facture, qui
  transmet le PDF au client et passe la facture en statut "Envoyée"
- **Relances automatiques** (`app/api/cron/reminders/route.ts`) : à
  brancher sur un scheduler (voir plus bas), détecte les factures en retard
  et renvoie automatiquement un email de rappel avec le PDF
- **Rôles** (`lib/permissions.ts`) : matrice de permissions OWNER /
  EMPLOYEE / ACCOUNTANT, déjà appliquée sur la gestion de l'abonnement
  (seul le propriétaire peut changer de plan) et sur l'affichage du menu
- **Panneau Super Admin** (`app/(admin)/admin`) : tant que Stripe n'est pas
  branché, cette page liste tous les commerçants inscrits (boutique,
  propriétaire, date d'inscription, dernière connexion, nombre de factures/
  clients) et permet de changer manuellement leur plan et leur statut
  d'abonnement (Essai / Actif / Impayé / Suspendu). Un commerçant passé en
  "Suspendu" ne peut plus se connecter (`lib/auth.ts`). Accès réservé aux
  utilisateurs avec `isSuperAdmin = true` — voir "Devenir super admin"
  ci-dessous.

## Installation

```bash
npm install
cp .env.example .env       # puis remplissez vos vraies valeurs
npx prisma migrate dev --name init
npm run dev
```

Ouvrez http://localhost:3000

### Devenir super admin

Créez d'abord un compte normal via `/signup`, puis promouvez-le :

```bash
npm run admin:promote -- votre@email.com
```

Reconnectez-vous : l'onglet "Super Admin" apparaît dans le menu et donne
accès à `/admin`, la liste de tous les commerçants inscrits sur le SaaS.

## Ce qu'il vous reste à faire

1. **Base de données** : créez une base PostgreSQL (Supabase, Neon ou Railway
   ont un plan gratuit) et collez son URL dans `DATABASE_URL`.
2. **Stripe** : créez un compte, ajoutez 3 produits/prix récurrents
   (Starter/Pro/Business), collez les Price IDs dans `.env`, puis :
   - En local, installez la Stripe CLI et lancez
     `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
     (elle vous donnera le `STRIPE_WEBHOOK_SECRET` à mettre dans `.env`)
   - En production, créez le endpoint webhook dans le Dashboard Stripe en
     pointant vers `https://votre-domaine.com/api/webhooks/stripe`, pour les
     événements : `checkout.session.completed`, `invoice.paid`,
     `invoice.payment_failed`, `customer.subscription.deleted`
3. **Email** : créez un compte sur [resend.com](https://resend.com), vérifiez
   votre domaine d'envoi, collez la clé API et l'adresse `EMAIL_FROM`.
4. **Relances automatiques** : programmez un appel quotidien vers
   `/api/cron/reminders` (Vercel Cron, cron-job.org, ou GitHub Actions), en
   passant `Authorization: Bearer <CRON_SECRET>`. Exemple avec Vercel Cron
   dans `vercel.json` :
   ```json
   { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 8 * * *" }] }
   ```
5. **Rôles avancés** : la matrice de permissions existe dans
   `lib/permissions.ts` et est déjà appliquée sur l'abonnement ; étendez-la
   aux autres routes sensibles selon vos besoins (ex: interdire à
   `ACCOUNTANT` de créer des factures).
6. **Multi-boutiques** (plan Business) : un même utilisateur pourrait être
   lié à plusieurs `Merchant` — actuellement chaque `User` n'a qu'un seul
   `merchantId`, à faire évoluer en relation many-to-many si besoin.

## Structure du projet

```
app/
  page.tsx                    → landing publique
  (auth)/signup, login        → inscription / connexion
  (dashboard)/dashboard/...   → espace commerçant (protégé)
  (admin)/admin                → panneau super admin (protégé, isSuperAdmin)
  api/                         → toutes les routes backend
lib/
  auth.ts                     → NextAuth + injection du merchantId
  prisma.ts                   → client base de données
  invoice-utils.ts            → calcul TVA + numérotation factures
prisma/schema.prisma          → modèle de données complet
```

## Sécurité multi-tenant — règle à respecter partout

Toute nouvelle route ou requête Prisma doit être filtrée par le
`merchantId` de la session (`session.merchantId`), jamais par un ID passé
librement dans l'URL ou le body, pour empêcher qu'un commerçant accède aux
données d'un autre.
