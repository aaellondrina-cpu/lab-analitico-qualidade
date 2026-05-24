"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

type NavItem = { href: string; label: string; adminOnly?: boolean };
type NavSection = { title?: string; items: NavItem[]; adminOnly?: boolean };

const sections: NavSection[] = [
  {
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    title: "Operação",
    items: [
      { href: "/amostras", label: "Amostras" },
      { href: "/lotes", label: "Lotes" },
      { href: "/laudos", label: "Laudos" },
      { href: "/nao-conformidades", label: "Não Conformidades" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/produtos", label: "Produtos" },
      { href: "/clientes", label: "Clientes" },
      { href: "/fornecedores", label: "Fornecedores" },
      { href: "/insumos", label: "Insumos" },
      { href: "/embalagens", label: "Embalagens" },
      { href: "/pontos-coleta", label: "Pontos de Coleta" },
      { href: "/equipamentos", label: "Equipamentos" },
    ],
  },
  {
    title: "Qualidade",
    items: [
      { href: "/cep", label: "CEP / SPC" },
      { href: "/appcc", label: "APPCC / HACCP" },
    ],
  },
  {
    title: "Pessoas & Docs",
    items: [
      { href: "/documentos", label: "Documentos" },
      { href: "/colaboradores", label: "Colaboradores" },
      { href: "/treinamentos", label: "Treinamentos" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { href: "/cip", label: "CIP" },
      { href: "/auditorias", label: "Auditorias" },
      { href: "/relatorios", label: "Relatórios" },
      { href: "/auditoria", label: "Trilha de auditoria" },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [{ href: "/configuracoes", label: "Configurações", adminOnly: true }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-3 space-y-4 text-sm overflow-y-auto">
        {sections.map((section, idx) => {
          if (section.adminOnly && !isAdmin) return null;
          const visibleItems = section.items.filter((it) => !it.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={idx}>
              {section.title && (
                <div className="px-3 mb-1 text-[10px] uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        "block rounded-md px-3 py-2 transition-colors " +
                        (active
                          ? "bg-petroleo text-white"
                          : "text-slate-700 hover:bg-slate-100")
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <UserMenu />
      <div className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-200">
        v0.1.0 · ISO 17025 · MAPA
      </div>
    </aside>
  );
}
