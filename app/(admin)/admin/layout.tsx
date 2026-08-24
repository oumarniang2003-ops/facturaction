import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin";
import { DashboardShell } from "@/components/DashboardShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  if (!session) redirect("/dashboard");

  const links = [
    { href: "/admin", label: "Commerçants" },
    { href: "/dashboard", label: "Mon espace commerçant" },
  ];

  return (
    <DashboardShell merchantName="Super Admin" role="SUPER_ADMIN" links={links}>
      {children}
    </DashboardShell>
  );
}
