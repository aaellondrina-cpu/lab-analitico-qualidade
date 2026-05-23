import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-cyan-50">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <Logo />
        <Link
          href="/login"
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
        >
          Entrar
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl sm:text-5xl font-semibold tracking-tight text-petroleo">
          Controle de qualidade para indústria de bebidas
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-600">
          Registro de amostras, lançamento de resultados, conformidade automática
          e rastreabilidade completa por lote — em conformidade com RDC 331/2019,
          ISO 17025 e ISO 22000.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-md bg-petroleo px-5 py-3 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            Acessar sistema
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Ver demo
          </Link>
        </div>

        <section className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full text-left">
          <Feature title="Amostras e OS" body="Registro automático com número de OS, prazo e rastreabilidade." />
          <Feature title="Conformidade" body="Compara resultado vs. especificação e sinaliza não conformidades." />
          <Feature title="Laudos PDF" body="Emissão automática com QR code de autenticidade." />
        </section>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} LimsQual · LAB-ANALITICS-AAEL
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-petroleo">{title}</h3>
      <p className="mt-1 text-xs text-slate-600">{body}</p>
    </div>
  );
}
