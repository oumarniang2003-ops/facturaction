import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const merchantName = (session as any).merchantName;
  const role = (session as any).role;
  const isSuperAdmin = (session as any).isSuperAdmin;

  const links = [
    { href: "/dashboard", label: "Vue d'ensemble" },
    { href: "/dashboard/invoices", label: "Factures & devis" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/products", label: "Produits & stock" },
    { href: "/dashboard/sales/new", label: "Quick Sale" },
    { href: "/dashboard/reports", label: "Rapports & Bénéfices" },
    ...(role === "OWNER" ? [{ href: "/dashboard/billing", label: "Mon abonnement" }] : []),
    { href: "/dashboard/settings", label: "Paramètres" },
    ...(isSuperAdmin ? [{ href: "/admin", label: "Super Admin" }] : []),
  ];

  return (
    <DashboardShell merchantName={merchantName} role={role} links={links}>
      {children}
    </DashboardShell>
  );
}
