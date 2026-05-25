"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Logo";
import { QualiMascote } from "@/components/QualiMascote";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Credenciais inválidas. Confira e-mail e senha.");
      return;
    }

    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-screen bg-slate-50">
      {/* Lado esquerdo — Quali */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-agua/10 via-white to-petroleo/10 p-6">
        <QualiMascote variant="lab" compact />
      </div>

      {/* Lado direito — Form */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <Link href="/" className="block mb-6">
            <Logo />
          </Link>

          <h1 className="text-xl font-semibold text-petroleo">Entrar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acesse com seu e-mail corporativo.
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
                placeholder="voce@empresa.com.br"
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
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500 text-center">
            É cliente?{" "}
            <Link href="/portal/login" className="text-petroleo hover:underline">
              Acesse o Portal do Cliente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
