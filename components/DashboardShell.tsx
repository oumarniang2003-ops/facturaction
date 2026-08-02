"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Zap, 
  BarChart3, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X 
} from "lucide-react";

type LinkItem = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  merchantName: string;
  role: string;
  links: LinkItem[];
  children: React.ReactNode;
};

export function DashboardShell({ merchantName, role, links, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function getLinkIcon(href: string) {
    switch (href) {
      case "/dashboard":
        return <LayoutDashboard className="size-4.5" />;
      case "/dashboard/invoices":
        return <FileText className="size-4.5" />;
      case "/dashboard/clients":
        return <Users className="size-4.5" />;
      case "/dashboard/products":
        return <Package className="size-4.5" />;
      case "/dashboard/sales/new":
        return <Zap className="size-4.5" />;
      case "/dashboard/reports":
        return <BarChart3 className="size-4.5" />;
      case "/dashboard/billing":
        return <CreditCard className="size-4.5" />;
      case "/dashboard/settings":
        return <Settings className="size-4.5" />;
      default:
        return <FileText className="size-4.5" />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper font-body">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-ink text-white px-6 py-4 sticky top-0 z-40 border-b border-white/5 shadow-sm">
        <div>
          <p className="font-display text-base font-bold tracking-tight text-white">{merchantName}</p>
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Espace commerçant</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-300 hover:text-white focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Sidebar Drawer - Desktop and Mobile overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-auto shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Desktop Header */}
        <div className="px-6 py-5 border-b border-white/5 hidden md:block">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-gradient-to-tr from-brand to-[#7C6FF0] flex items-center justify-center shadow-md shadow-brand/20 shrink-0">
              <FileText className="size-4.5 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="font-display text-base font-bold tracking-tight truncate text-white">{merchantName}</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Espace commerçant</p>
            </div>
          </div>
        </div>
        
        {/* Mobile Header Inside Drawer */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-gradient-to-tr from-brand to-[#7C6FF0] flex items-center justify-center shadow-md shadow-brand/20 shrink-0">
              <FileText className="size-4.5 text-white" />
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-tight text-white">{merchantName}</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Espace commerçant</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-neutral-400 hover:text-white p-2 focus:outline-none transition-colors"
            aria-label="Close menu"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all duration-200 font-semibold group
                  ${isActive 
                    ? "bg-brand text-white shadow-md shadow-brand/20 font-bold" 
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-neutral-400 group-hover:text-white"}`}>
                  {getLinkIcon(l.href)}
                </div>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="size-4.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-28 md:p-8 overflow-x-hidden bg-paper">
        {children}
      </main>
    </div>
  );
}
