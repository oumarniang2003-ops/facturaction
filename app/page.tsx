import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 text-center">
      <p className="text-amber font-medium mb-3">Facturation & gestion pour commerçants</p>
      <h1 className="font-display text-5xl text-ink max-w-2xl leading-tight">
        Vos factures, votre stock, vos clients. Un seul endroit.
      </h1>
      <p className="text-neutral-600 mt-4 max-w-lg">
        Créez votre boutique en 2 minutes, choisissez votre abonnement, et gérez tout comme vous l'entendez.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup" className="rounded-lg bg-brand hover:bg-brand-dark text-white font-medium px-6 py-3 transition-colors">
          Créer ma boutique
        </Link>
        <Link href="/login" className="rounded-lg border border-neutral-300 text-ink font-medium px-6 py-3 hover:bg-white transition-colors">
          Se connecter
        </Link>
      </div>
    </main>
  );
}
