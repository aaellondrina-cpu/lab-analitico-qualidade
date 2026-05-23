"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/amostras", label: "Amostras" },
  { href: "/produtos", label: "Produtos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/laudos", label: "Laudos" },
  { href: "/nao-conformidades", label: "Não Conformidades" },
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/relatorios", label: "Relatórios" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
        {nav.map((item) => {
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
      </nav>
      <div className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-200">
        v0.1.0 · ISO 17025
      </div>
    </aside>
  );
}
