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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-petroleo"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
