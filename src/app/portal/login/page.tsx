"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Logo";
import { QualiMascote } from "@/components/QualiMascote";

export default function PortalLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginForm />
    </Suspense>
  );
}

function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("cliente-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("E-mail ou senha inválidos. Confira com o laboratório.");
      return;
    }

    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[80vh] items-center gap-6 px-4">
      <div className="hidden lg:flex items-center justify-center">
        <QualiMascote variant="portal" compact />
      </div>
      <div className="mx-auto w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="block mb-2">
          <Logo />
        </Link>
        <div className="inline-block text-[10px] uppercase tracking-wider bg-agua/10 text-agua font-medium px-2 py-0.5 rounded-full mb-4">
          Portal do Cliente
        </div>

        <h1 className="text-xl font-semibold text-petroleo">Acessar laudos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use o e-mail cadastrado pelo laboratório.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
              placeholder="contato@suaempresa.com.br"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar no portal"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-xs text-slate-500 text-center">
          <p>
            Não tem conta?{" "}
            <Link href="/portal/signup" className="text-petroleo hover:underline font-medium">
              Criar conta demo grátis
            </Link>
          </p>
          <p>
            É colaborador do laboratório?{" "}
            <Link href="/login" className="text-petroleo hover:underline">
              Entrar pela área interna
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
