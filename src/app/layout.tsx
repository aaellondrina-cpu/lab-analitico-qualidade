import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

// AuthProvider importa next-auth/react, que ao avaliar o módulo faz
// parseUrl(process.env.NEXTAUTH_URL). Se NEXTAUTH_URL estiver vazio durante
// o build (caso de Vercel sem env var setada, ou .env.production com ""),
// "new URL('')" derruba o prerender. Forçar dynamic no root garante que
// nenhuma página tente prerender e leve o build pro chão.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LimsQual — Controle de Qualidade",
  description:
    "LIMS para indústria de bebidas e refrigerantes — rastreabilidade, conformidade e laudos automatizados.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
