"use client";

import { useEffect, useState } from "react";

type MerchantData = {
  businessName: string;
  businessSubtitle?: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
};

type ProfileData = {
  name: string;
  email: string;
  role: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"company" | "profile">("company");
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form states
  const [companyForm, setCompanyForm] = useState<MerchantData>({
    businessName: "",
    businessSubtitle: "",
    email: "",
    phone: "",
    address: "",
    vatNumber: "",
  });

  const [profileForm, setProfileForm] = useState<ProfileData>({
    name: "",
    email: "",
    role: "EMPLOYEE",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  // Feedback states
  const [companyMessage, setCompanyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileMessage, setCompanyProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [resMerchant, resProfile] = await Promise.all([
          fetch("/api/merchant"),
          fetch("/api/profile"),
        ]);

        if (resMerchant.ok) {
          const merchant = await resMerchant.json();
          setCompanyForm({
            businessName: merchant.businessName || "",
            businessSubtitle: merchant.businessSubtitle || "",
            email: merchant.email || "",
            phone: merchant.phone || "",
            address: merchant.address || "",
            vatNumber: merchant.vatNumber || "",
          });
        }

        if (resProfile.ok) {
          const profile = await resProfile.json();
          setProfileForm({
            name: profile.name || "",
            email: profile.email || "",
            role: profile.role || "EMPLOYEE",
          });
        }
      } catch (err) {
        console.error("Erreur lors du chargement des paramètres", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const isOwner = profileForm.role === "OWNER";

  async function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    
    setSavingCompany(true);
    setCompanyMessage(null);

    try {
      const res = await fetch("/api/merchant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });

      const data = await res.json();

      if (res.ok) {
        setCompanyMessage({ type: "success", text: "Paramètres de l'entreprise enregistrés avec succès !" });
        // Eventuellement rafraichir le header/sidebar si besoin
      } else {
        setCompanyMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (err) {
      setCompanyMessage({ type: "error", text: "Erreur de connexion avec le serveur." });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setCompanyProfileMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setSavingProfile(true);
    setCompanyProfileMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          password: passwordForm.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCompanyProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
        setPasswordForm({ password: "", confirmPassword: "" });
      } else {
        setCompanyProfileMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (err) {
      setCompanyProfileMessage({ type: "error", text: "Erreur de connexion avec le serveur." });
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
        <p className="text-sm text-neutral-500 font-medium">Chargement de vos paramètres...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Paramètres</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Gérez les informations de votre entreprise ainsi que vos identifiants de connexion.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("company")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "company"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          💼 Mon Entreprise
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "profile"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          👤 Mon Profil
        </button>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm">
        {activeTab === "company" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink">Profil de l'entreprise</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Ces informations apparaîtront sur vos factures, devis et reçus générés en PDF.
              </p>
            </div>

            {!isOwner && (
              <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-xs text-amber font-semibold flex items-center gap-2">
                ⚠️ Modification restreinte. Seul le propriétaire de l'établissement (rôle OWNER) peut modifier ces informations.
              </div>
            )}

            {companyMessage && (
              <div
                className={`p-4 rounded-xl border text-sm font-medium ${
                  companyMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {companyMessage.text}
              </div>
            )}

            <form onSubmit={handleCompanySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Nom de l'entreprise *
                </label>
                <input
                  required
                  type="text"
                  disabled={!isOwner}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.businessName}
                  onChange={(e) => setCompanyForm({ ...companyForm, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Secteur d'activité / Description (Sous-titre PDF)
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  placeholder="Ex: Vente tous matériaux Électroménagers..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.businessSubtitle}
                  onChange={(e) => setCompanyForm({ ...companyForm, businessSubtitle: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Email de facturation *
                </label>
                <input
                  required
                  type="email"
                  disabled={!isOwner}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Téléphone
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Adresse physique
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  N° TVA / SIRET / Identifiant unique
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    isOwner
                      ? "border-neutral-300 bg-white text-ink"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                  }`}
                  value={companyForm.vatNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, vatNumber: e.target.value })}
                />
              </div>

              {isOwner && (
                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="w-full md:w-auto rounded-lg bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white text-sm font-semibold px-6 py-2.5 shadow-sm transition-all"
                  >
                    {savingCompany ? "Enregistrement en cours..." : "Sauvegarder l'entreprise"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink">Mon Profil</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configurez vos accès et vos informations de connexion personnelles.
              </p>
            </div>

            {profileMessage && (
              <div
                className={`p-4 rounded-xl border text-sm font-medium ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Nom complet
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 bg-white text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Rôle de l'utilisateur
                </label>
                <input
                  disabled
                  type="text"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 px-3 py-2 text-sm cursor-not-allowed"
                  value={profileForm.role === "OWNER" ? "Propriétaire (OWNER)" : profileForm.role === "EMPLOYEE" ? "Employé" : "Comptable"}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Adresse e-mail
                </label>
                <input
                  required
                  type="email"
                  className="w-full rounded-lg border border-neutral-300 bg-white text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 border-t border-neutral-100 my-2 pt-4">
                <h3 className="text-sm font-bold text-ink">Changer le mot de passe</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-lg border border-neutral-300 bg-white text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-lg border border-neutral-300 bg-white text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full md:w-auto rounded-lg bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white text-sm font-semibold px-6 py-2.5 shadow-sm transition-all"
                >
                  {savingProfile ? "Enregistrement en cours..." : "Sauvegarder le profil"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
