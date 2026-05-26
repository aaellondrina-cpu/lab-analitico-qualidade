import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { QualiMascote } from "@/components/QualiMascote";
import { getCurrentUser } from "@/lib/dal";

export default async function Home() {
  const user = await getCurrentUser();

  // Já logado? Manda direto pro destino correto.
  if (user?.type === "CLIENT") redirect("/portal/dashboard");
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-agua/5 via-white to-petroleo/5">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <Link
            href="/portal/login"
            className="text-xs text-slate-500 hover:text-petroleo"
          >
            Já tenho conta →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
        <div className="text-center mb-10 lg:mb-14">
          <h1 className="text-3xl lg:text-4xl font-semibold text-petroleo">
            LimsQual
          </h1>
          <p className="mt-2 text-sm lg:text-base text-slate-600 max-w-xl mx-auto">
            Sistema de gestão de qualidade para indústria de bebidas.
            Escolha abaixo como você quer entrar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
          {/* Cliente */}
          <Link
            href="/portal/signup"
            className="group rounded-xl border-2 border-agua/30 bg-white p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-agua transition flex flex-col"
          >
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider bg-agua/10 text-agua font-semibold px-2 py-1 rounded-full self-start mb-4">
              Sou cliente
            </div>
            <h2 className="text-xl font-semibold text-petroleo mb-2">
              Quero ver meus laudos
            </h2>
            <p className="text-sm text-slate-600 flex-1">
              Acompanhe o resultado das suas análises em tempo real e baixe
              os laudos em PDF. Cadastro grátis em 30 segundos — só nome,
              e-mail e senha.
            </p>
            <div className="mt-5 inline-flex items-center text-sm font-medium text-agua group-hover:text-petroleo">
              Criar minha conta →
            </div>
          </Link>

          {/* Lab */}
          <Link
            href="/login"
            className="group rounded-xl border-2 border-petroleo/20 bg-white p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-petroleo transition flex flex-col"
          >
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider bg-petroleo/10 text-petroleo font-semibold px-2 py-1 rounded-full self-start mb-4">
              Sou do laboratório
            </div>
            <h2 className="text-xl font-semibold text-petroleo mb-2">
              Acessar painel do lab
            </h2>
            <p className="text-sm text-slate-600 flex-1">
              Gestão completa: amostras, lotes, BPF, APPCC, laudos, MAPA,
              recall, equipamentos e relatórios. Acesso restrito à equipe
              técnica.
            </p>
            <div className="mt-5 inline-flex items-center text-sm font-medium text-petroleo">
              Entrar →
            </div>
          </Link>
        </div>

        <div className="mt-12 lg:mt-16 flex justify-center">
          <div className="max-w-md">
            <QualiMascote variant="lab" compact />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/60 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
          LimsQual © {new Date().getFullYear()} — controle de qualidade para bebidas
        </div>
      </footer>
    </div>
  );
}
