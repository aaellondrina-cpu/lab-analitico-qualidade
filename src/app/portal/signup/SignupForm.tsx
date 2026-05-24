"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signupPortalCliente } from "./actions";
import type { SignupState } from "./types";

function maskCnpj(s: string) {
  const d = (s || "").replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function maskPhone(s: string) {
  const d = (s || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const initial: SignupState = {};

export function SignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signupPortalCliente, initial);

  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    if (!state.success || autoLogin) return;
    setAutoLogin(true);
    (async () => {
      const res = await signIn("cliente-credentials", {
        email: state.success!.email,
        password: state.success!.senha,
        redirect: false,
      });
      if (res && !res.error) {
        router.replace("/portal/dashboard");
        router.refresh();
      }
    })();
  }, [state.success, autoLogin, router]);

  if (state.success) {
    return (
      <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-800">
        Cadastro criado! Entrando no portal...
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-3" action={formAction}>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Empresa *</label>
        <input
          type="text"
          name="razaoSocial"
          required
          maxLength={120}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          placeholder="Razão social"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">CNPJ *</label>
          <input
            type="text"
            name="cnpj"
            required
            value={cnpj}
            onChange={(e) => setCnpj(maskCnpj(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-agua"
            placeholder="00.000.000/0000-00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Telefone</label>
          <input
            type="text"
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Seu nome *</label>
        <input
          type="text"
          name="responsavel"
          required
          maxLength={80}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          placeholder="Como você quer ser chamado"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">E-mail *</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          placeholder="voce@suaempresa.com.br"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Senha *</label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Criando..." : "Criar conta demo"}
      </button>
    </form>
  );
}
