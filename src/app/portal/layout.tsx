import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PortalLogout } from "@/components/PortalLogout";
import { QualiHelpButton } from "@/components/QualiHelpButton";
import { getCurrentCliente } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// Portal depende de sessão de cliente — sempre dinâmico (ver comentário no
// (app)/layout.tsx sobre a mesma situação com next-auth/react no build).
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentCliente();

  const cliente = user
    ? await prisma.cliente.findUnique({
        where: { id: user.clienteId },
        select: { razaoSocial: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {user && (
        <header className="border-b border-slate-200 bg-white print:hidden">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/portal/dashboard" className="flex items-center gap-3">
              <Logo />
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-agua/10 text-agua font-medium uppercase tracking-wide">
                Portal do Cliente
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/portal/dashboard" className="text-slate-600 hover:text-petroleo">
                Dashboard
              </Link>
              <Link href="/portal/laudos" className="text-slate-600 hover:text-petroleo">
                Laudos
              </Link>
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-petroleo">{user.name}</span>
                <span className="text-[11px] text-slate-500">{cliente?.razaoSocial}</span>
              </div>
              <PortalLogout />
            </nav>
          </div>
        </header>
      )}
      <main className="max-w-6xl mx-auto px-6 py-6 print:max-w-none print:p-0">
        {children}
      </main>
      {user && <QualiHelpButton variant="portal" autoOpenKey="quali-tour-portal-v1" />}
    </div>
  );
}
