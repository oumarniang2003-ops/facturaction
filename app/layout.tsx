import { Archivo, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Factura — Facturation pour commerçants",
  description: "Gérez vos factures, votre stock et vos clients, où que vous vendiez.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${ibmPlexSans.variable}`}>
      <body className="bg-paper text-ink font-body antialiased">{children}</body>
    </html>
  );
}
