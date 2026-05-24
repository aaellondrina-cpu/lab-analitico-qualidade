import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getDemoUsage } from "./actions";
import { SignupForm } from "./SignupForm";

export default async function PortalSignupPage() {
  const usage = await getDemoUsage();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="block mb-2">
          <Logo />
        </Link>
        <div className="inline-block text-[10px] uppercase tracking-wider bg-agua/10 text-agua font-medium px-2 py-0.5 rounded-full mb-4">
          Demo · Portal do Cliente
        </div>

        <h1 className="text-xl font-semibold text-petroleo">Criar conta demo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha os dados pra testar o portal. Você verá 3 laudos de exemplo gerados
          automaticamente.
        </p>

        <div className="mt-3 mb-2 text-xs text-slate-600 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
          <span>Cadastros demo usados</span>
          <span className="font-mono">
            <strong className={usage.vagas <= 3 ? "text-amber-600" : "text-petroleo"}>
              {usage.total}
            </strong>{" "}
            / {usage.limite}
          </span>
        </div>

        {usage.vagas <= 0 ? (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            Demo cheia ({usage.limite} cadastros). Fale com o laboratório pra liberar mais.
          </div>
        ) : (
          <SignupForm />
        )}

        <p className="mt-6 text-xs text-slate-500 text-center">
          Já tem conta?{" "}
          <Link href="/portal/login" className="text-petroleo hover:underline">
            Entrar no portal
          </Link>
        </p>
      </div>
    </div>
  );
}
