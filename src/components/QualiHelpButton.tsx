"use client";

import { useEffect, useState } from "react";
import { QualiMascote } from "./QualiMascote";

type Props = {
  variant?: "lab" | "portal";
  // chave LocalStorage usada pra abrir automaticamente na primeira visita.
  autoOpenKey?: string;
};

export function QualiHelpButton({ variant = "lab", autoOpenKey }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoOpenKey || typeof window === "undefined") return;
    const seen = window.localStorage.getItem(autoOpenKey);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [autoOpenKey]);

  function close() {
    setOpen(false);
    if (autoOpenKey && typeof window !== "undefined") {
      window.localStorage.setItem(autoOpenKey, "1");
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Tour guiado do sistema com o Quali"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl print:hidden hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg, #00B4D8 0%, #0D3B5E 100%)" }}
        aria-label="Abrir tour guiado"
      >
        💧
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
          onClick={close}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xl flex items-center justify-center"
              aria-label="Fechar"
            >
              ×
            </button>
            <QualiMascote variant={variant} compact />
          </div>
        </div>
      )}
    </>
  );
}
