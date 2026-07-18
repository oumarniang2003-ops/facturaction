import "./globals.css";

export const metadata = {
  title: "Factura — Facturation pour commerçants",
  description: "Gérez vos factures, votre stock et vos clients, où que vous vendiez.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
