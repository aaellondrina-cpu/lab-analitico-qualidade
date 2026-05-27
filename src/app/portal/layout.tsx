import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PortalLogout } from "@/components/PortalLogout";
import { QualiHelpButton } from "@/components/QualiHelpButton";
import { getCurrentCliente } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { PortalSidebar } from "./_components/PortalSidebar";

// Portal depende de sessão de cliente — sempre dinâmico.
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentCliente();

  const cliente = user
    ? await prisma.cliente.findUnique({
        where: { id: user.clienteId },
        select: { razaoSocial: true },
      })
    : null;

  // Telas públicas (login/signup) não devem mostrar a sidebar.
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex print:bg-white print:block">
      <PortalSidebar userName={user.name} clienteNome={cliente?.razaoSocial ?? null} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-200 bg-white print:hidden lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>
            <PortalLogout />
          </div>
        </header>
        <main className="flex-1 px-6 py-6 overflow-y-auto print:p-0">
          {children}
        </main>
      </div>
      <QualiHelpButton variant="portal" autoOpenKey="quali-tour-portal-v2" />
    </div>
  );
}
