import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="block mb-6">
          <Logo />
        </Link>

        <h1 className="text-xl font-semibold text-petroleo">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acesse com seu e-mail corporativo.
        </p>

        <form className="mt-6 space-y-4" action="/api/auth/callback/credentials" method="post">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          NextAuth ainda não configurado — placeholder.
        </p>
      </div>
    </div>
  );
}
