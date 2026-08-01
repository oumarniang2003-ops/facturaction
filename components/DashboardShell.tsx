"use client";

import { useState } from "react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper font-body">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-ink text-white px-6 py-4 sticky top-0 z-40 border-b border-white/10 shadow-sm">
        <div>
          <p className="font-display text-base font-bold tracking-tight">{merchantName}</p>
          <p className="text-[10px] text-white/50">Espace commerçant</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/80 hover:text-white focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Drawer - Desktop and Mobile overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:z-auto shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Desktop Header */}
        <div className="px-6 py-6 border-b border-white/10 hidden md:block">
          <p className="font-display text-lg font-bold">{merchantName}</p>
          <p className="text-xs text-white/50 mt-1">Espace commerçant</p>
        </div>
        
        {/* Mobile Header Inside Drawer */}
        <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center md:hidden">
          <div>
            <p className="font-display text-lg font-bold">{merchantName}</p>
            <p className="text-xs text-white/50 mt-1">Espace commerçant</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/60 hover:text-white p-2 focus:outline-none transition-colors"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-h-screen bg-paper">
        {children}
      </main>
    </div>
  );
}
