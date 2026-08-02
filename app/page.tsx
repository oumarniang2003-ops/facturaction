import Link from "next/link";
import { 
  TrendingUp, 
  Package, 
  FileText, 
  Smartphone, 
  Users, 
  CheckCircle, 
  Zap, 
  ArrowRight, 
  Award, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-paper min-h-screen text-ink font-body selection:bg-brand selection:text-white overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/80 border-b border-ink/5 px-4 py-4 lg:px-16 lg:py-5">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] w-9 h-9 shadow-md shadow-brand/10">
              <FileText className="text-white size-5" />
            </div>
            <span className="font-display font-bold tracking-tight text-xl">Factura</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm font-semibold text-neutral-600 hover:text-brand transition-colors">Fonctionnalités</a>
            <a href="#fonctionnement" className="text-sm font-semibold text-neutral-600 hover:text-brand transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="text-sm font-semibold text-neutral-600 hover:text-brand transition-colors">Tarifs</a>
            <a href="#temoignages" className="text-sm font-semibold text-neutral-600 hover:text-brand transition-colors">Témoignages</a>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-bold text-neutral-600 hover:text-brand transition-colors" href="/login">
              Connexion
            </Link>
            <Link className="bg-gradient-to-r from-brand to-[#7C6FF0] hover:opacity-95 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]" href="/signup">
              Essai gratuit
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Soft atmospheric blurred background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber/10 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[40%] left-[20%] w-[45%] h-[45%] rounded-full bg-mint/10 blur-[120px] pointer-events-none -z-10" />

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center px-4 pt-16 pb-20 gap-6 relative lg:px-16 lg:pt-28 lg:pb-28 lg:gap-8 max-w-6xl mx-auto">
          {/* Floating Badges */}
          <div className="hidden md:flex absolute left-8 top-16 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-4 py-2 items-center gap-2 shadow-sm animate-bounce" style={{ animationDuration: '4s' }}>
            <div className="size-6 rounded-full bg-mint/10 flex items-center justify-center">
              <Package className="size-3.5 text-mint" />
            </div>
            <span className="text-xs font-bold text-neutral-700">Stock à jour</span>
          </div>
          <div className="hidden md:flex absolute right-12 top-24 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-4 py-2 items-center gap-2 shadow-sm animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
            <div className="size-6 rounded-full bg-amber/10 flex items-center justify-center">
              <TrendingUp className="size-3.5 text-amber" />
            </div>
            <span className="text-xs font-bold text-neutral-700">Bénéfice estimé +35%</span>
          </div>
          <div className="hidden md:flex absolute left-16 bottom-20 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-4 py-2 items-center gap-2 shadow-sm animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
            <div className="size-6 rounded-full bg-brand/10 flex items-center justify-center">
              <FileText className="size-3.5 text-brand" />
            </div>
            <span className="text-xs font-bold text-neutral-700">Factures pro PDF</span>
          </div>

          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-xs font-bold text-brand uppercase tracking-wider">
            <Zap className="size-3.5 fill-current" />
            <span>Gestion & Facturation pour Commerçants</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-ink leading-tight tracking-tight lg:text-6xl lg:max-w-4xl">
            Gerez vos factures et stocks<br/>
            <span className="relative inline-block mt-2">
              en <span className="text-brand">12 secondes</span>
              <span className="absolute -bottom-1.5 left-0 w-full h-2.5 bg-brand/10 rounded-full lg:-bottom-2 lg:h-3"></span>
            </span>
          </h1>

          <p className="text-sm font-medium text-neutral-600 leading-relaxed max-w-xl lg:text-lg lg:max-w-3xl">
            Créez des factures pro, suivez vos stocks, gérez vos clients et suivez vos bénéfices nets en temps réel. Conçu spécifiquement pour le commerce moderne et les boutiques en Afrique.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row w-full justify-center items-center mt-2">
            <Link className="w-full sm:w-auto bg-gradient-to-r from-brand to-[#7C6FF0] hover:opacity-95 text-white font-bold text-base px-10 py-4 rounded-full text-center shadow-lg shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2" href="/signup">
              <span>Créer mon premier reçu</span>
              <ArrowRight className="size-5" />
            </Link>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Gratuit · Sans carte bancaire · Configuration en 2 minutes</span>

          {/* Social Proof stats */}
          <div className="flex flex-col gap-6 pt-10 w-full sm:flex-row sm:justify-center sm:gap-16 lg:pt-14">
            <div className="text-center bg-white/70 backdrop-blur-sm border border-neutral-100 p-5 rounded-3xl shadow-sm flex-1 max-w-[200px] hover:shadow-md transition-shadow">
              <p className="text-3xl font-display font-extrabold text-ink">14 000+</p>
              <p className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-wider">Commerçants</p>
            </div>
            <div className="text-center bg-white/70 backdrop-blur-sm border border-neutral-100 p-5 rounded-3xl shadow-sm flex-1 max-w-[200px] hover:shadow-md transition-shadow">
              <p className="text-3xl font-display font-extrabold text-ink">12s</p>
              <p className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-wider">Par facture</p>
            </div>
            <div className="text-center bg-white/70 backdrop-blur-sm border border-neutral-100 p-5 rounded-3xl shadow-sm flex-1 max-w-[200px] hover:shadow-md transition-shadow">
              <p className="text-3xl font-display font-extrabold text-ink">100%</p>
              <p className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-wider">Trésorerie claire</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fonctionnalites" className="px-4 py-20 bg-white border-y border-ink/5 lg:px-16 lg:py-28">
          <div className="max-w-6xl mx-auto flex flex-col gap-14 lg:gap-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 w-fit">
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Fonctionnalités</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-ink leading-tight lg:text-5xl lg:max-w-3xl">
                Tout ce qu'il faut pour maîtriser vos ventes et vos marges
              </h2>
            </div>

            {/* Grid layout for major features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Feature 1: Live calculations */}
              <div className="bg-paper rounded-3xl border border-neutral-200/60 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-brand/30 transition-all hover:shadow-md lg:p-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="size-6 text-mint" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-mint uppercase tracking-wider">Comptabilité simplifiée</span>
                      <h3 className="text-xl font-display font-bold text-ink lg:text-2xl mt-0.5">Bénéfice net en temps réel</h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    Saisissez vos prix d'achat directement sur la facture. Factura calcule immédiatement vos coûts d'achat cumulés, votre bénéfice net et votre pourcentage de marge.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-50 pb-1.5">
                    <span className="font-bold text-neutral-400 uppercase tracking-wider">Facture #FAC-2026</span>
                    <span className="bg-mint/10 text-mint font-bold px-2 py-0.5 rounded-full text-[10px]">PAYÉE</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 font-semibold">
                    <span>Coût d'achat total :</span>
                    <span>15 000 F CFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-800 font-bold">
                    <span>Bénéfice net estimé :</span>
                    <span className="text-mint">+10 000 F CFA</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-mint h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                    <span>Marge bénéficiaire :</span>
                    <span>40.0%</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Stock Alerts */}
              <div className="bg-paper rounded-3xl border border-neutral-200/60 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-brand/30 transition-all hover:shadow-md lg:p-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                      <Package className="size-6 text-amber" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-amber uppercase tracking-wider">Alertes Stocks</span>
                      <h3 className="text-xl font-display font-bold text-ink lg:text-2xl mt-0.5">Suivi des stocks automatisé</h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    Ne soyez plus jamais en rupture. Nos alertes visuelles et nos rapports automatiques vous informent dès qu'un produit passe sous le seuil d'alerte défini.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-amber/5 border border-amber/10">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">Climatiseur Split 12000 BTU</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Seuil critique : 5 unités</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-amber/10 text-amber">
                      1 Restant
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subfeatures list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-paper/40 rounded-3xl border border-neutral-200/60 p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-brand" />
                </div>
                <h4 className="font-display font-bold text-ink text-base">Facture & Devis PDF</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Générez des PDF professionnels et envoyez-les en un clic à vos clients par WhatsApp ou Email.</p>
              </div>
              <div className="bg-paper/40 rounded-3xl border border-neutral-200/60 p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform">
                <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                  <Smartphone className="size-5 text-mint" />
                </div>
                <h4 className="font-display font-bold text-ink text-base">Wave & Mobile Money</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Suivez vos encaissements Wave, Orange Money, Free Money ou espèces de façon totalement isolée.</p>
              </div>
              <div className="bg-paper/40 rounded-3xl border border-neutral-200/60 p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Users className="size-5 text-gold" />
                </div>
                <h4 className="font-display font-bold text-ink text-base">CRM & Fiches Clients</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Conservez les coordonnées de vos clients fidèles pour réémettre une facture en quelques clics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="fonctionnement" className="bg-brand text-white px-4 py-20 lg:px-16 lg:py-28 relative overflow-hidden">
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col gap-14 lg:gap-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 w-fit">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Simplicité</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-white leading-tight lg:text-5xl">
                De la vente au suivi de bénéfice net en 3 étapes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-4xl font-display font-extrabold text-amber leading-none">01</span>
                <h3 className="text-lg font-display font-bold text-white lg:text-xl">Créez votre boutique</h3>
                <p className="text-xs font-body text-neutral-200 leading-relaxed lg:text-sm">
                  Inscrivez-vous en 2 minutes avec votre email et le nom de votre commerce. Votre espace est immédiatement disponible.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-4xl font-display font-extrabold text-amber leading-none">02</span>
                <h3 className="text-lg font-display font-bold text-white lg:text-xl">Entrez vos produits</h3>
                <p className="text-xs font-body text-neutral-200 leading-relaxed lg:text-sm">
                  Ajoutez vos articles en configurant leur prix de vente standard et leur coût d'achat unitaire pour automatiser les calculs.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-4xl font-display font-extrabold text-amber leading-none">03</span>
                <h3 className="text-lg font-display font-bold text-white lg:text-xl">Générez et encaissez</h3>
                <p className="text-xs font-body text-neutral-200 leading-relaxed lg:text-sm">
                  Créez des reçus et factures pro. Obtenez en temps réel le détail de votre chiffre d'affaires, marge et bénéfice net.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section id="temoignages" className="px-4 py-20 bg-white flex flex-col items-center gap-10 lg:px-16 lg:py-28 lg:gap-14">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">
            <span className="text-5xl font-display text-neutral-200 lg:text-7xl leading-none">“</span>
            <p className="text-lg font-display font-extrabold text-ink leading-relaxed lg:text-2xl lg:tracking-tight -mt-4">
              Factura me permet de gérer mes ventes et d'émettre mes reçus 3x plus vite au marché de Sandaga. Mes calculs de bénéfice net sont exacts, mon stock est suivi au millimètre et je sais exactement ce que j'ai gagné en fin de journée.
            </p>
            <div className="flex items-center gap-3 lg:gap-4 lg:pt-2">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-display font-bold text-brand flex-shrink-0">
                F
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-ink lg:text-sm">Fatou Sylla</p>
                <p className="text-xs text-neutral-500 font-medium">Boutique de cosmétiques · Dakar, Sénégal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="tarifs" className="px-4 py-20 bg-paper border-t border-ink/5 lg:px-16 lg:py-28">
          <div className="max-w-6xl mx-auto flex flex-col gap-12 lg:gap-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 w-fit">
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Tarifs</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-ink lg:text-5xl">
                Des tarifs clairs, adaptés à votre commerce
              </h2>
              <p className="text-sm font-medium text-neutral-500">Choisissez le forfait idéal pour votre boutique. Tarifs simplifiés en FCFA.</p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch max-w-5xl mx-auto w-full">
              {/* Starter Plan */}
              <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 flex flex-col justify-between gap-6 flex-1 hover:border-brand/20 hover:shadow-sm transition-all lg:p-8">
                <div>
                  <p className="text-xs font-bold text-brand uppercase tracking-wider">Starter</p>
                  <p className="text-xs text-neutral-500 mt-1">Pour lancer votre activité</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-display font-extrabold text-ink">0</span>
                    <span className="text-xs font-bold text-neutral-500">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-neutral-100 my-6"></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Jusqu'à 10 factures / mois</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Suivi des stocks basique</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>1 utilisateur unique</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-full py-3 font-bold text-sm text-center border border-neutral-200 hover:bg-paper transition-colors mt-4 text-ink" href="/signup">
                  Démarrer gratuitement
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-brand text-white rounded-3xl p-6 flex flex-col justify-between gap-6 flex-1 shadow-[0_8px_30px_rgb(91,79,232,0.18)] relative overflow-hidden lg:p-8 hover:scale-[1.02] transition-transform">
                <div className="absolute top-4 right-4 bg-amber text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Recommandé
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Pro</p>
                  <p className="text-xs text-white/60 mt-1">Pour gérer votre stock et vos marges</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-display font-extrabold text-white">10 000</span>
                    <span className="text-xs font-bold text-white/80">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-white/10 my-6"></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-amber font-bold">✓</span>
                      <span className="font-semibold">Factures & Devis illimités</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-amber font-bold">✓</span>
                      <span>Calcul de bénéfice net & marge en direct</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-amber font-bold">✓</span>
                      <span>Alertes de stock en temps réel</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-amber font-bold">✓</span>
                      <span>Suivi des paiements Wave / OM</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-full py-3 font-bold text-sm text-center bg-white text-brand hover:bg-paper transition-colors mt-4 shadow-sm" href="/signup">
                  Choisir le forfait Pro
                </Link>
              </div>

              {/* Business Plan */}
              <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 flex flex-col justify-between gap-6 flex-1 hover:border-brand/20 hover:shadow-sm transition-all lg:p-8">
                <div>
                  <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Business</p>
                  <p className="text-xs text-neutral-500 mt-1">Pour plusieurs boutiques & équipes</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-display font-extrabold text-ink">25 000</span>
                    <span className="text-xs font-bold text-neutral-500">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-neutral-100 my-6"></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Tout le forfait Pro</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Gestion multi-boutiques & multi-utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Accès comptable dédié</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-brand font-bold">✓</span>
                      <span>Support VIP prioritaire par WhatsApp</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-full py-3 font-bold text-sm text-center border border-neutral-200 hover:bg-paper transition-colors mt-4 text-ink" href="/signup">
                  Contacter l'équipe
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 py-16 bg-brand text-white flex flex-col items-center gap-6 text-center lg:px-16 lg:py-24 lg:gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand to-[#7C6FF0] opacity-90 -z-10" />
          <div className="flex flex-col gap-3 lg:gap-4 lg:max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-white leading-tight lg:text-4xl">
              Prêt à reprendre le contrôle de votre commerce ?
            </h2>
            <p className="text-sm text-neutral-200 lg:text-lg max-w-lg mx-auto">
              Rejoignez des milliers de commerçants. Lancez votre espace Factura en 2 minutes gratuitement.
            </p>
          </div>
          <Link className="w-full sm:w-auto bg-amber hover:opacity-95 text-white font-bold text-base px-10 py-4 rounded-full text-center shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2" href="/signup">
            <span>Démarrer mon essai gratuit</span>
            <ArrowRight className="size-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-ink text-neutral-400 px-4 pt-16 pb-8 border-t border-white/5 lg:px-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-white w-7 h-7 shadow-sm">
                  <FileText className="text-brand size-4" />
                </div>
                <span className="font-display font-bold tracking-tight text-white">Factura</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                La solution complète de facturation, gestion de stock et comptabilité simplifiée pour les petits commerces et boutiques en Afrique.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Produit</span>
                <a href="#fonctionnalites" className="text-xs hover:text-white transition-colors">Fonctionnalités</a>
                <a href="#tarifs" className="text-xs hover:text-white transition-colors">Tarifs</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Légal</span>
                <span className="text-xs cursor-pointer hover:text-white transition-colors">Confidentialité</span>
                <span className="text-xs cursor-pointer hover:text-white transition-colors">CGU</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Contact</span>
                <span className="text-xs text-neutral-400">Dakar, Sénégal</span>
                <span className="text-xs text-neutral-400">support@factura.app</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-[10px] text-neutral-500">
            © 2026 Factura. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
