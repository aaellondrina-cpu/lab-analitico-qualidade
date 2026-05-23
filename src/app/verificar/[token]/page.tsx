import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const CONCLUSAO_LABEL: Record<string, string> = {
  APROVADO: "APROVADO",
  REPROVADO: "REPROVADO",
  APROVADO_COM_RESTRICOES: "APROVADO COM RESTRIÇÕES",
};

const CONCLUSAO_CLASS: Record<string, string> = {
  APROVADO: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REPROVADO: "bg-red-100 text-red-800 border-red-300",
  APROVADO_COM_RESTRICOES: "bg-amber-100 text-amber-800 border-amber-300",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

export default async function VerificarLaudoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const laudo = await prisma.laudo.findUnique({
    where: { qrToken: token },
    include: {
      amostra: {
        select: {
          numeroOS: true,
          cliente: { select: { razaoSocial: true, cnpj: true } },
          produto: { select: { nome: true } },
          lote: { select: { numero: true } },
        },
      },
    },
  });

  if (!laudo) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <header className="text-center pb-6 border-b border-slate-200">
            <div className="text-xs uppercase tracking-wider text-slate-500">
              LimsQual · Laboratório AAEL
            </div>
            <h1 className="mt-2 text-2xl font-bold text-petroleo">Verificação de Laudo</h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500"></span>
              Laudo autêntico
            </div>
          </header>

          <section className="mt-6 space-y-4 text-sm">
            <Field label="Número do laudo" value={laudo.numero} mono />
            <Field label="Data de emissão" value={fmtDate(laudo.dataEmissao)} />
            <Field label="Cliente" value={laudo.amostra.cliente.razaoSocial} />
            <Field label="CNPJ" value={laudo.amostra.cliente.cnpj} mono />
            <Field label="Produto" value={laudo.amostra.produto.nome} />
            <Field label="Lote" value={laudo.amostra.lote.numero} mono />
            <Field label="Amostra (OS)" value={laudo.amostra.numeroOS} mono />
            <Field label="Responsável técnico" value={laudo.emitidoPorNome} />

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Conclusão</div>
              <div
                className={
                  "inline-block border-2 rounded-md px-4 py-2 text-base font-bold " +
                  (CONCLUSAO_CLASS[laudo.conclusao] ?? "")
                }
              >
                {CONCLUSAO_LABEL[laudo.conclusao] ?? laudo.conclusao}
              </div>
            </div>

            {laudo.observacoes && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Observações</div>
                <div className="text-sm text-slate-700">{laudo.observacoes}</div>
              </div>
            )}
          </section>

          <footer className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            Esta verificação confirma a autenticidade do laudo emitido por
            LimsQual / Laboratório AAEL.<br />
            Token: <span className="font-mono text-[10px]">{laudo.qrToken}</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className={"text-sm text-slate-900 text-right " + (mono ? "font-mono" : "")}>
        {value}
      </span>
    </div>
  );
}
