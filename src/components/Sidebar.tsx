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
    title: "Produção & Qualidade",
    items: [
      { href: "/lotes", label: "Lotes" },
      { href: "/produtos", label: "Produtos" },
      { href: "/estoque", label: "Estoque & Expedição" },
      { href: "/temperatura", label: "Temperatura" },
      { href: "/cip", label: "CIP" },
    ],
  },
  {
    title: "Análises",
    items: [
      { href: "/amostras", label: "Amostras / OS" },
      { href: "/laudos", label: "Laudos" },
      { href: "/sensorial", label: "Sensorial" },
      { href: "/agua-processo", label: "Água de Processo" },
      { href: "/cep", label: "CEP / SPC" },
    ],
  },
  {
    title: "Gestão da Qualidade",
    items: [
      { href: "/nao-conformidades", label: "Não Conformidades" },
      { href: "/sac", label: "SAC / Reclamações" },
      { href: "/recall", label: "Recall" },
      { href: "/appcc", label: "APPCC / HACCP" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/clientes", label: "Clientes" },
      { href: "/fornecedores", label: "Fornecedores" },
      { href: "/insumos", label: "Insumos" },
      { href: "/embalagens", label: "Embalagens" },
      { href: "/embalagens/rotulos", label: "Rótulos" },
      { href: "/pontos-coleta", label: "Pontos de Coleta" },
      { href: "/equipamentos", label: "Equipamentos" },
    ],
  },
  {
    title: "Pessoas & Documentos",
    items: [
      { href: "/colaboradores", label: "Colaboradores" },
      { href: "/treinamentos", label: "Treinamentos" },
      { href: "/documentos", label: "Documentos" },
    ],
  },
  {
    title: "Conformidade MAPA",
    items: [
      { href: "/registro-mapa", label: "Registro MAPA" },
      { href: "/declaracao-anual", label: "Declaração anual" },
      { href: "/bpf", label: "BPF" },
      { href: "/auditorias", label: "Auditorias" },
      { href: "/auditoria", label: "Trilha de auditoria" },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { href: "/relatorios", label: "Painel" },
      { href: "/relatorios/custos", label: "Custos de produção" },
      { href: "/relatorios/livro-producao", label: "Livro de produção" },
      { href: "/relatorios/etiqueta", label: "Etiqueta (impressora)" },
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
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col print:hidden">
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
