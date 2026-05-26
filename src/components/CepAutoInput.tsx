"use client";

import { useState } from "react";
import { applyMask } from "@/lib/masks";

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

type Props = {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  fields?: {
    endereco?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
};

// Auto-preenche o endereço a partir do CEP via API pública do ViaCEP.
// Quando o usuário digita 8 dígitos, busca e popula os campos irmãos do form
// (procurados por `name=` via DOM no form ancestral).
export function CepAutoInput({
  name = "cep",
  defaultValue,
  required,
  placeholder = "00000-000",
  className,
  fields,
}: Props) {
  const [value, setValue] = useState(() => applyMask("cep", defaultValue ?? ""));
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound" | "error">("idle");

  const fieldNames = {
    endereco: fields?.endereco ?? "endereco",
    bairro: fields?.bairro ?? "bairro",
    cidade: fields?.cidade ?? "cidade",
    estado: fields?.estado ?? "estado",
  };

  async function lookup(cep: string, formEl: HTMLFormElement | null) {
    const onlyDigits = cep.replace(/\D/g, "");
    if (onlyDigits.length !== 8) return;
    setStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`);
      const data = (await res.json()) as ViaCepResponse;
      if (data.erro || !data.logradouro) {
        setStatus("notfound");
        return;
      }
      setStatus("found");
      if (!formEl) return;
      const setIfEmpty = (selector: string, val?: string) => {
        if (!val) return;
        const el = formEl.querySelector<HTMLInputElement>(`[name="${selector}"]`);
        if (el && !el.value) {
          el.value = val;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      };
      setIfEmpty(fieldNames.endereco, data.logradouro);
      setIfEmpty(fieldNames.bairro, data.bairro);
      setIfEmpty(fieldNames.cidade, data.localidade);
      setIfEmpty(fieldNames.estado, data.uf);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <input
        name={name}
        value={value}
        onChange={(e) => {
          const masked = applyMask("cep", e.target.value);
          setValue(masked);
          setStatus("idle");
        }}
        onBlur={(e) => lookup(e.target.value, e.target.form)}
        required={required}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="postal-code"
        className={className}
      />
      {status === "loading" && (
        <p className="mt-1 text-[11px] text-slate-500">Buscando endereço…</p>
      )}
      {status === "notfound" && (
        <p className="mt-1 text-[11px] text-amber-600">CEP não encontrado — preencha manualmente.</p>
      )}
      {status === "error" && (
        <p className="mt-1 text-[11px] text-red-600">Falha ao buscar CEP — preencha manualmente.</p>
      )}
    </div>
  );
}
