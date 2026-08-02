"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, User, AlertTriangle, Key, Mail, Phone, MapPin, Store, Check, Info } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"company" | "profile" | "danger">("company");
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
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

  const isConfirmValid =
    resetConfirmText.trim().toUpperCase() === "REINITIALISER" ||
    resetConfirmText.trim().toUpperCase() === "RÉINITIALISER";

  async function handleResetData() {
    if (!isConfirmValid || resetting) return;
    
    setResetting(true);
    setResetMessage(null);

    try {
      const res = await fetch("/api/merchant/reset", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setResetMessage({
          type: "success",
          text: "Données réinitialisées ! Redirection vers la vue d'ensemble...",
        });
        setResetConfirmText("");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000);
      } else {
        setResetMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (err) {
      setResetMessage({ type: "error", text: "Erreur de connexion avec le serveur." });
    } finally {
      setResetting(false);
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
        <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-brand" />
          </div>
          <span>Paramètres</span>
        </h1>
        <p className="text-neutral-500 text-sm mt-1.5 font-semibold">
          Gérez les informations de votre entreprise ainsi que vos identifiants de connexion.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-neutral-200/60">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("company")}
          className={`h-11 px-5 py-2 text-sm font-bold rounded-none border-b-2 bg-transparent hover:bg-transparent shadow-none transition-all duration-200 ${
            activeTab === "company"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <Building2 className="size-4 mr-2" />
          <span>Mon Entreprise</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("profile")}
          className={`h-11 px-5 py-2 text-sm font-bold rounded-none border-b-2 bg-transparent hover:bg-transparent shadow-none transition-all duration-200 ${
            activeTab === "profile"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <User className="size-4 mr-2" />
          <span>Mon Profil</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("danger")}
          className={`h-11 px-5 py-2 text-sm font-bold rounded-none border-b-2 bg-transparent hover:bg-transparent shadow-none transition-all duration-200 ${
            activeTab === "danger"
              ? "border-amber text-amber"
              : "border-transparent text-neutral-400 hover:text-amber"
          }`}
        >
          <AlertTriangle className="size-4 mr-2" />
          <span>Zone de danger</span>
        </Button>
      </div>

      {/* Content Tabs */}
      <Card className="bg-white border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {activeTab === "company" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                  <Building2 className="size-5 text-brand" /> Profil de l'entreprise
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Ces informations apparaîtront sur vos factures, devis et reçus générés en PDF.
                </p>
              </div>

              {!isOwner && (
                <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-xs text-amber font-semibold flex items-center gap-2">
                  <Info className="size-4 text-amber shrink-0" />
                  <span>Modification restreinte. Seul le propriétaire de l'établissement (rôle OWNER) peut modifier ces informations.</span>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Nom de l'entreprise *
                  </label>
                  <Input
                    required
                    type="text"
                    disabled={!isOwner}
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                    value={companyForm.businessName}
                    onChange={(e) => setCompanyForm({ ...companyForm, businessName: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Secteur d'activité / Description (Sous-titre PDF)
                  </label>
                  <Input
                    type="text"
                    disabled={!isOwner}
                    placeholder="Ex: Vente tous matériaux Électroménagers..."
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white rounded-full px-4 font-semibold"
                    value={companyForm.businessSubtitle}
                    onChange={(e) => setCompanyForm({ ...companyForm, businessSubtitle: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Email de facturation *
                  </label>
                  <Input
                    required
                    type="email"
                    disabled={!isOwner}
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Téléphone
                  </label>
                  <Input
                    type="text"
                    disabled={!isOwner}
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Adresse physique
                  </label>
                  <Input
                    type="text"
                    disabled={!isOwner}
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    N° TVA / SIRET / Identifiant unique
                  </label>
                  <Input
                    type="text"
                    disabled={!isOwner}
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={companyForm.vatNumber}
                    onChange={(e) => setCompanyForm({ ...companyForm, vatNumber: e.target.value })}
                  />
                </div>

                {isOwner && (
                  <div className="md:col-span-2 pt-4">
                    <Button
                      type="submit"
                      disabled={savingCompany}
                      className="w-full md:w-auto h-11 px-8 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
                    >
                      {savingCompany ? "Enregistrement..." : "Sauvegarder l'entreprise"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                  <User className="size-5 text-brand" /> Mon Profil
                </h2>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Nom complet
                  </label>
                  <Input
                    required
                    type="text"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Rôle de l'utilisateur
                  </label>
                  <Input
                    disabled
                    type="text"
                    className="h-10 border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    value={profileForm.role === "OWNER" ? "Propriétaire (OWNER)" : profileForm.role === "EMPLOYEE" ? "Employé" : "Comptable"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Adresse e-mail
                  </label>
                  <Input
                    required
                    type="email"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 border-t border-neutral-100 my-2 pt-5">
                  <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <Key className="size-4 text-neutral-400" />
                    <span>Changer le mot de passe</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                    Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe actuel.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    className="h-10 border-neutral-200 focus-visible:border-brand bg-white"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full md:w-auto h-11 px-8 font-bold shadow-md shadow-brand/20 hover:opacity-95 transition-all duration-200 rounded-full bg-gradient-to-r from-brand to-[#7C6FF0] text-white"
                  >
                    {savingProfile ? "Enregistrement..." : "Sauvegarder le profil"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-red-600 font-display flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-600" /> Zone de danger
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Remettez votre boutique à zéro pour recommencer à l'utiliser comme neuve.
                </p>
              </div>

              {!isOwner && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <Info className="size-4 text-rose-600 shrink-0" />
                  <span>Action restreinte. Seul le propriétaire de l'établissement (rôle OWNER) peut réinitialiser la boutique.</span>
                </div>
              )}

              {isOwner && (
                <>
                  <div className="p-4 bg-red-50/50 border border-red-200/60 rounded-xl text-xs text-red-950 space-y-2.5">
                    <p className="font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="size-4 text-red-700" /> Action irréversible !
                    </p>
                    <p className="leading-relaxed font-semibold">
                      Si vous confirmez la réinitialisation :
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-neutral-600 font-medium">
                      <li>Tous vos <strong>produits</strong> et <strong>stocks</strong> seront définitivement supprimés.</li>
                      <li>Tous vos <strong>clients</strong> seront supprimés.</li>
                      <li>Toutes vos <strong>factures</strong>, <strong>devis</strong> et <strong>paiements</strong> seront supprimés.</li>
                      <li>Le <strong>compteur de facturation</strong> sera remis à zéro (les prochains numéros de factures recommenceront à 1).</li>
                      <li><strong>Votre compte utilisateur, les autres employés et votre abonnement resteront actifs.</strong></li>
                    </ul>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block">
                        Veuillez saisir <strong className="text-red-600">RÉINITIALISER</strong> ci-dessous pour confirmer :
                      </label>
                      <Input
                        type="text"
                        placeholder="Saisissez REINITIALISER ou RÉINITIALISER"
                        className="h-10 md:w-1/2 border-neutral-200 focus-visible:border-red-600 bg-white"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                      />
                    </div>

                    {resetMessage && (
                      <div
                        className={`p-4 rounded-xl border text-sm font-medium ${
                          resetMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        {resetMessage.text}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        disabled={!isConfirmValid || resetting}
                        onClick={handleResetData}
                        variant="destructive"
                        className="h-11 px-6 font-bold shadow-sm hover:shadow transition-all duration-200 rounded-full flex items-center gap-2"
                      >
                        <span>{resetting ? "Réinitialisation..." : "Réinitialiser toutes les données"}</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
