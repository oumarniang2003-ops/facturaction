import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#1B2320] font-body selection:bg-[#2F6F4E] selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F7F5F0]/80 border-b border-[#1B2320]/5 px-4 py-4 lg:px-16 lg:py-5">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="inline-flex flex-shrink-0 items-center justify-center rounded-[28%] bg-[#2F6F4E] w-8 h-8 shadow-sm">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-white" aria-hidden="true">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="font-display font-bold tracking-tight text-lg">Factura</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm font-semibold text-neutral-600 hover:text-[#2F6F4E] transition-colors">Fonctionnalités</a>
            <a href="#fonctionnement" className="text-sm font-semibold text-neutral-600 hover:text-[#2F6F4E] transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="text-sm font-semibold text-neutral-600 hover:text-[#2F6F4E] transition-colors">Tarifs</a>
            <a href="#temoignages" className="text-sm font-semibold text-neutral-600 hover:text-[#2F6F4E] transition-colors">Témoignages</a>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-bold text-neutral-600 hover:text-[#2F6F4E] transition-colors" href="/login">
              Connexion
            </Link>
            <Link className="bg-[#2F6F4E] hover:bg-[#1F4D36] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]" href="/signup">
              Essai gratuit
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center px-4 pt-16 pb-20 gap-6 relative overflow-hidden lg:px-16 lg:pt-28 lg:pb-28 lg:gap-8 max-w-6xl mx-auto">
          {/* Floating Badges */}
          <div className="hidden md:flex absolute left-8 top-16 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 px-3.5 py-1.5 items-center gap-2 shadow-sm opacity-80 animate-bounce" style={{ animationDuration: '4s' }}>
            <span className="text-emerald-600 font-bold">📦</span>
            <span className="text-xs font-semibold">Stock à jour</span>
          </div>
          <div className="hidden md:flex absolute right-12 top-24 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 px-3.5 py-1.5 items-center gap-2 shadow-sm opacity-80 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
            <span className="text-amber font-bold">📈</span>
            <span className="text-xs font-semibold">Bénéfice estimé +35%</span>
          </div>
          <div className="hidden md:flex absolute left-16 bottom-20 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 px-3.5 py-1.5 items-center gap-2 shadow-sm opacity-80 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
            <span className="text-blue-500 font-bold">📄</span>
            <span className="text-xs font-semibold">Factures professionnelles</span>
          </div>

          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 bg-[#2F6F4E]/10 border border-[#2F6F4E]/20 rounded-full px-3 py-1.5 text-xs font-bold text-[#2F6F4E] uppercase tracking-wider">
            ⚡ Gestion & Facturation pour Commerçants
          </div>

          <h1 className="font-display text-4xl font-extrabold text-[#1B2320] leading-tight tracking-tight lg:text-6xl lg:max-w-4xl">
            Gérez vos factures et stocks<br/>
            <span className="relative inline-block mt-2">
              en <span className="text-[#2F6F4E]">12 secondes</span>
              <span className="absolute -bottom-1.5 left-0 w-full h-2.5 bg-[#C97B2E]/30 rounded-lg lg:-bottom-2 lg:h-3"></span>
            </span>
          </h1>

          <p className="text-sm font-medium text-neutral-600 leading-relaxed max-w-xl lg:text-lg lg:max-w-3xl">
            Créez des factures pro, suivez vos stocks, gérez vos clients et suivez vos bénéfices nets en temps réel. Conçu spécifiquement pour le commerce moderne et les boutiques en Afrique.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row w-full justify-center items-center mt-2">
            <Link className="w-full sm:w-auto bg-[#2F6F4E] hover:bg-[#1F4D36] text-white font-bold text-base px-10 py-4 rounded-xl text-center shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]" href="/signup">
              Créer mon premier reçu
            </Link>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Gratuit · Sans carte bancaire · Configuration en 2 minutes</span>

          {/* Social Proof stats */}
          <div className="flex flex-col gap-6 pt-10 w-full sm:flex-row sm:justify-center sm:gap-16 lg:pt-14">
            <div className="text-center bg-white/40 border border-white/60 p-4 rounded-2xl shadow-sm flex-1 max-w-[200px]">
              <p className="text-3xl font-display font-extrabold text-[#1B2320]">14 000+</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Commerçants</p>
            </div>
            <div className="text-center bg-white/40 border border-white/60 p-4 rounded-2xl shadow-sm flex-1 max-w-[200px]">
              <p className="text-3xl font-display font-extrabold text-[#1B2320]">12s</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Par facture</p>
            </div>
            <div className="text-center bg-white/40 border border-white/60 p-4 rounded-2xl shadow-sm flex-1 max-w-[200px]">
              <p className="text-3xl font-display font-extrabold text-[#1B2320]">100%</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-wider">Trésorerie claire</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fonctionnalites" className="px-4 py-20 bg-white border-y border-[#1B2320]/5 lg:px-16 lg:py-28">
          <div className="max-w-6xl mx-auto flex flex-col gap-14 lg:gap-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-[#2F6F4E]/10 border border-[#2F6F4E]/20 rounded-full px-3.5 py-1.5 w-fit">
                <span className="text-xs font-bold text-[#2F6F4E] uppercase tracking-wider">Fonctionnalités</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-[#1B2320] leading-tight lg:text-5xl lg:max-w-3xl">
                Tout ce qu'il faut pour maîtriser vos ventes et vos marges
              </h2>
            </div>

            {/* Grid layout for major features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Feature 1: Live calculations */}
              <div className="bg-[#F7F5F0] rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#2F6F4E]/30 transition-all hover:shadow-md lg:p-8">
                <div>
                  <div className="bg-[#2F6F4E]/10 border border-[#2F6F4E]/20 rounded-full px-3 py-1 text-xs font-bold text-[#2F6F4E] w-fit mb-4">
                    Comptabilité simplifiée
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#1B2320] lg:text-2xl mb-2">Bénéfice net en temps réel</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    Saisissez vos prix d'achat directement sur la facture. Factura calcule immédiatement vos coûts d'achat cumulés, votre bénéfice net et votre pourcentage de marge.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-inner space-y-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-100 pb-1.5">
                    <span className="font-semibold text-neutral-400 uppercase">Facture #FAC-2026</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">PAYÉE</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 font-medium">
                    <span>Coût d'achat total :</span>
                    <span>15 000 F CFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-700 font-bold">
                    <span>Bénéfice net estimé :</span>
                    <span className="text-emerald-600">+10 000 F CFA</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2F6F4E] h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Marge bénéficiaire :</span>
                    <span>40.0%</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Stock Alerts */}
              <div className="bg-[#F7F5F0] rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#2F6F4E]/30 transition-all hover:shadow-md lg:p-8">
                <div>
                  <div className="bg-[#C97B2E]/10 border border-[#C97B2E]/20 rounded-full px-3 py-1 text-xs font-bold text-[#C97B2E] w-fit mb-4">
                    Alertes Stocks
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#1B2320] lg:text-2xl mb-2">Suivi des stocks automatisé</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    Ne soyez plus jamais en rupture. Nos alertes visuelles et nos rapports automatiques vous informent dès qu'un produit passe sous le seuil d'alerte défini.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-inner space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50 border border-rose-100">
                    <div>
                      <p className="text-xs font-bold text-rose-950">Climatiseur Split 12000 BTU</p>
                      <p className="text-[10px] text-rose-800/80">Alerte sous : 5 unités</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-extrabold rounded bg-rose-100 text-rose-700">
                      1 Restant
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subfeatures list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-[#F7F5F0]/60 rounded-2xl border border-neutral-200/60 p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform">
                <div className="w-9 h-9 rounded-lg bg-[#2F6F4E]/10 flex items-center justify-center text-[#2F6F4E] font-bold text-lg">📄</div>
                <h4 className="font-display font-bold text-[#1B2320]">Facture & Devis PDF</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">Générez des PDF professionnels et envoyez-les en un clic à vos clients par WhatsApp ou Email.</p>
              </div>
              <div className="bg-[#F7F5F0]/60 rounded-2xl border border-neutral-200/60 p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform">
                <div className="w-9 h-9 rounded-lg bg-[#2F6F4E]/10 flex items-center justify-center text-[#2F6F4E] font-bold text-lg">📱</div>
                <h4 className="font-display font-bold text-[#1B2320]">Wave & Mobile Money</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">Suivez vos encaissements Wave, Orange Money, Free Money ou espèces de façon totalement isolée.</p>
              </div>
              <div className="bg-[#F7F5F0]/60 rounded-2xl border border-neutral-200/60 p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform">
                <div className="w-9 h-9 rounded-lg bg-[#2F6F4E]/10 flex items-center justify-center text-[#2F6F4E] font-bold text-lg">👥</div>
                <h4 className="font-display font-bold text-[#1B2320]">CRM & Fiches Clients</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">Conservez les coordonnées de vos clients fidèles pour réémettre une facture en quelques clics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="fonctionnement" className="bg-[#2F6F4E] text-[#F7F5F0] px-4 py-20 lg:px-16 lg:py-28">
          <div className="max-w-6xl mx-auto flex flex-col gap-14 lg:gap-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3.5 py-1.5 w-fit">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Simplicité</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-white leading-tight lg:text-5xl">
                De la vente au suivi de bénéfice net en 3 étapes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-3xl font-display font-extrabold text-[#C97B2E] leading-none lg:text-4xl">01</span>
                <h3 className="text-lg font-display font-bold text-white lg:text-xl">Créez votre boutique</h3>
                <p className="text-xs font-body text-neutral-200 leading-relaxed lg:text-sm">
                  Inscrivez-vous en 2 minutes avec votre email et le nom de votre commerce. Votre espace est immédiatement disponible.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-3xl font-display font-extrabold text-[#C97B2E] leading-none lg:text-4xl">02</span>
                <h3 className="text-lg font-display font-bold text-white lg:text-xl">Entrez vos produits</h3>
                <p className="text-xs font-body text-neutral-200 leading-relaxed lg:text-sm">
                  Ajoutez vos articles en configurant leur prix de vente standard et leur coût d'achat unitaire pour automatiser les calculs.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:bg-white/10 transition-colors lg:p-8">
                <span className="text-3xl font-display font-extrabold text-[#C97B2E] leading-none lg:text-4xl">03</span>
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
            <p className="text-lg font-display font-extrabold text-[#1B2320] leading-relaxed lg:text-2xl lg:tracking-tight -mt-4">
              Factura me permet de gérer mes ventes et d'émettre mes reçus 3x plus vite au marché de Sandaga. Mes calculs de bénéfice net sont exacts, mon stock est suivi au millimètre et je sais exactement ce que j'ai gagné en fin de journée.
            </p>
            <div className="flex items-center gap-3 lg:gap-4 lg:pt-2">
              <div className="w-10 h-10 rounded-full bg-[#2F6F4E]/10 flex items-center justify-center font-display font-bold text-[#2F6F4E] flex-shrink-0">
                F
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#1B2320] lg:text-sm">Fatou Sylla</p>
                <p className="text-xs text-neutral-500 font-medium">Boutique de cosmétiques · Dakar, Sénégal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="tarifs" className="px-4 py-20 bg-[#F7F5F0] border-t border-[#1B2320]/5 lg:px-16 lg:py-28">
          <div className="max-w-6xl mx-auto flex flex-col gap-12 lg:gap-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-1.5 bg-[#2F6F4E]/10 border border-[#2F6F4E]/20 rounded-full px-3.5 py-1.5 w-fit">
                <span className="text-xs font-bold text-[#2F6F4E] uppercase tracking-wider">Tarifs</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-[#1B2320] lg:text-5xl">
                Des tarifs clairs, adaptés à votre commerce
              </h2>
              <p className="text-sm font-medium text-neutral-500">Choisissez le forfait idéal pour votre boutique. Tarifs simplifiés en FCFA.</p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch max-w-5xl mx-auto w-full">
              {/* Starter Plan */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between gap-6 flex-1 hover:border-[#2F6F4E]/20 hover:shadow-sm transition-all lg:p-8">
                <div>
                  <p className="text-xs font-bold text-[#2F6F4E] uppercase tracking-wider">Starter</p>
                  <p className="text-xs text-neutral-500 mt-1">Pour lancer votre activité</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-display font-extrabold text-[#1B2320]">0</span>
                    <span className="text-xs font-bold text-neutral-500">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-neutral-100 my-6"></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Jusqu'à 10 factures / mois</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Suivi des stocks basique</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>1 utilisateur unique</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-xl py-3 font-semibold text-sm text-center border border-neutral-200 hover:bg-[#F7F5F0] transition-colors mt-4 text-[#1B2320]" href="/signup">
                  Démarrer gratuitement
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-[#2F6F4E] text-[#F7F5F0] rounded-3xl p-6 flex flex-col justify-between gap-6 flex-1 shadow-md relative overflow-hidden lg:p-8 hover:scale-[1.02] transition-transform">
                <div className="absolute top-4 right-4 bg-[#C97B2E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
                    <div className="flex items-center gap-2.5 text-xs text-white/90">
                      <span className="text-[#C97B2E] font-bold">✓</span>
                      <span className="font-semibold">Factures & Devis illimités</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-[#C97B2E] font-bold">✓</span>
                      <span>Calcul de bénéfice net & marge en direct</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-[#C97B2E] font-bold">✓</span>
                      <span>Alertes de stock en temps réel</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/95">
                      <span className="text-[#C97B2E] font-bold">✓</span>
                      <span>Suivi des paiements Wave / OM</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-xl py-3 font-semibold text-sm text-center bg-white text-[#2F6F4E] hover:bg-[#F7F5F0] transition-colors mt-4 shadow-sm" href="/signup">
                  Choisir le forfait Pro
                </Link>
              </div>

              {/* Business Plan */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between gap-6 flex-1 hover:border-[#2F6F4E]/20 hover:shadow-sm transition-all lg:p-8">
                <div>
                  <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Business</p>
                  <p className="text-xs text-neutral-500 mt-1">Pour plusieurs boutiques & équipes</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-display font-extrabold text-[#1B2320]">25 000</span>
                    <span className="text-xs font-bold text-neutral-500">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-neutral-100 my-6"></div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Tout le forfait Pro</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Gestion multi-boutiques & multi-utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Accès comptable dédié</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <span className="text-[#2F6F4E] font-bold">✓</span>
                      <span>Support VIP prioritaire par WhatsApp</span>
                    </div>
                  </div>
                </div>
                <Link className="w-full rounded-xl py-3 font-semibold text-sm text-center border border-neutral-200 hover:bg-[#F7F5F0] transition-colors mt-4 text-[#1B2320]" href="/signup">
                  Contacter l'équipe
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 py-16 bg-[#2F6F4E] text-[#F7F5F0] flex flex-col items-center gap-6 text-center lg:px-16 lg:py-24 lg:gap-8">
          <div className="flex flex-col gap-3 lg:gap-4 lg:max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-white leading-tight lg:text-4xl">
              Prêt à reprendre le contrôle de votre commerce ?
            </h2>
            <p className="text-sm text-neutral-200 lg:text-lg max-w-lg mx-auto">
              Rejoignez des milliers de commerçants. Lancez votre espace Factura en 2 minutes gratuitement.
            </p>
          </div>
          <Link className="w-full sm:w-auto bg-[#C97B2E] hover:bg-[#B06722] text-white font-bold text-base px-10 py-4 rounded-xl text-center shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]" href="/signup">
            Démarrer mon essai gratuit
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2320] text-[#F7F5F0]/60 px-4 pt-16 pb-8 border-t border-white/5 lg:px-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex flex-shrink-0 items-center justify-center rounded-[28%] bg-white w-6 h-6 shadow-sm">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" className="text-[#2F6F4E]" aria-hidden="true">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
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
