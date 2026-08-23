"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PortalLogout } from "@/components/PortalLogout";

type NavItem = { href: string; label: string };
type NavSection = { title?: string; items: NavItem[] };

const sections: NavSection[] = [
  { items: [{ href: "/portal/dashboard", label: "Dashboard" }] },
  {
    title: "Produção & Qualidade",
    items: [
      { href: "/portal/lotes", label: "Lotes" },
      { href: "/portal/produtos", label: "Produtos" },
      { href: "/portal/estoque", label: "Estoque & Expedição" },
      { href: "/portal/temperatura", label: "Temperatura" },
      { href: "/portal/cip", label: "CIP" },
    ],
  },
  {
    title: "Análises",
    items: [
      { href: "/portal/amostras", label: "Amostras / OS" },
      { href: "/portal/laudos", label: "Laudos" },
      { href: "/portal/sensorial", label: "Sensorial" },
      { href: "/portal/agua-processo", label: "Água de Processo" },
      { href: "/portal/cep", label: "CEP / SPC" },
    ],
  },
  {
    title: "Gestão da Qualidade",
    items: [
      { href: "/portal/nao-conformidades", label: "Não Conformidades" },
      { href: "/portal/sac", label: "SAC / Reclamações" },
      { href: "/portal/recall", label: "Recall" },
      { href: "/portal/appcc", label: "APPCC / HACCP" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/portal/clientes", label: "Clientes" },
      { href: "/portal/fornecedores", label: "Fornecedores" },
      { href: "/portal/insumos", label: "Insumos" },
      { href: "/portal/embalagens", label: "Embalagens" },
      { href: "/portal/embalagens/rotulos", label: "Rótulos" },
      { href: "/portal/pontos-coleta", label: "Pontos de Coleta" },
      { href: "/portal/equipamentos", label: "Equipamentos" },
    ],
  },
  {
    title: "Pessoas & Documentos",
    items: [
      { href: "/portal/colaboradores", label: "Colaboradores" },
      { href: "/portal/treinamentos", label: "Treinamentos" },
      { href: "/portal/documentos", label: "Documentos" },
    ],
  },
  {
    title: "Conformidade MAPA",
    items: [
      { href: "/portal/registro-mapa", label: "Registro MAPA" },
      { href: "/portal/declaracao-anual", label: "Declaração anual" },
      { href: "/portal/bpf", label: "BPF" },
      { href: "/portal/auditorias", label: "Auditorias" },
      { href: "/portal/auditoria", label: "Trilha de auditoria" },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { href: "/portal/relatorios", label: "Painel" },
      { href: "/portal/indicadores", label: "Indicadores da Qualidade" },
      { href: "/portal/relatorios/custos", label: "Custos de produção" },
      { href: "/portal/relatorios/livro-producao", label: "Livro de produção" },
      { href: "/portal/relatorios/etiqueta", label: "Etiqueta (impressora)" },
    ],
  },
];

type Props = {
  userName?: string | null;
  clienteNome?: string | null;
};

export function PortalSidebar({ userName, clienteNome }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col print:hidden">
      <div className="px-5 py-5 border-b border-slate-200">
        <Link href="/portal/dashboard" className="flex flex-col gap-2">
          <Logo />
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-agua/10 text-agua font-medium uppercase tracking-wide self-start">
            Portal do Cliente
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-4 text-sm overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <div className="px-3 mb-1 text-[10px] uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
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
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-slate-200">
        <div className="flex flex-col leading-tight mb-2">
          <span className="text-sm font-medium text-petroleo truncate">{userName ?? "Cliente"}</span>
          {clienteNome && (
            <span className="text-[11px] text-slate-500 truncate">{clienteNome}</span>
          )}
        </div>
        <PortalLogout />
      </div>
      <div className="px-5 py-2 text-[11px] text-slate-400 border-t border-slate-200">
        v0.1.0 · ISO 17025 · MAPA
      </div>
    </aside>
  );
}
