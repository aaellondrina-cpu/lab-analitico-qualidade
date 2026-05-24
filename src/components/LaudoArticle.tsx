import type { Laudo, Amostra, Cliente, Produto, Lote, PontoColeta, Resultado, Especificacao, ConfiguracaoLaboratorio } from "@prisma/client";
import { descreverLimite } from "@/lib/conformidade";
import { formacaoLabel } from "@/lib/configuracao-labels";

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

const CONFORMIDADE_LABEL: Record<string, string> = {
  CONFORME: "Conforme",
  NAO_CONFORME: "Não conforme",
  ATENCAO: "Atenção",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function fmtDateOnly(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

type LaudoFull = Laudo & {
  amostra: Amostra & {
    cliente: Cliente;
    produto: Produto & { especificacoes: Especificacao[] };
    lote: Lote;
    pontoColeta: PontoColeta | null;
    resultados: Resultado[];
  };
};

type Props = {
  laudo: LaudoFull;
  config: ConfiguracaoLaboratorio | null;
  verifyUrl: string;
};

export function LaudoArticle({ laudo, config, verifyUrl }: Props) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <article className="rounded-lg border border-slate-300 bg-white p-8 print:border-0 print:p-0">
      <header className="pb-4 border-b border-slate-300">
        <div className="flex justify-between items-start gap-6">
          <div className="flex items-start gap-4 flex-1">
            {config?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <div className="text-base font-bold text-slate-900">
                {config?.razaoSocial ?? "LimsQual — Controle de Qualidade"}
              </div>
              {config && (
                <div className="text-xs text-slate-600">
                  CNPJ: {config.cnpj} · {config.endereco}, {config.cidade}/{config.estado}
                </div>
              )}
              {config && (
                <div className="text-xs text-slate-600">
                  Tel: {config.telefone} · {config.email}
                </div>
              )}
              <h1 className="mt-2 text-xl font-bold text-petroleo">Laudo de Análise</h1>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Nº do laudo</div>
            <div className="font-mono text-lg font-semibold">{laudo.numero}</div>
            <div className="mt-1 text-xs text-slate-500">Emitido em {fmtDate(laudo.dataEmissao)}</div>
          </div>
        </div>
        {config && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
            <div>
              <strong>RT:</strong> {config.rtNome} — {formacaoLabel(config.rtFormacao)} · Reg.{" "}
              {config.rtRegistro}
            </div>
            <div className="flex flex-wrap gap-x-3">
              {config.mapaNumero && <span>Aut. MAPA nº {config.mapaNumero}</span>}
              {config.anvisaNumero && <span>ANVISA nº {config.anvisaNumero}</span>}
              {config.inmetroNumero && (
                <span>Acreditado INMETRO {config.inmetroNumero} — ISO/IEC 17025</span>
              )}
              {config.vigilanciaNumero && <span>Vig. Sanit. nº {config.vigilanciaNumero}</span>}
            </div>
          </div>
        )}
      </header>

      <section className="grid grid-cols-2 gap-6 mt-6 text-sm">
        <div>
          <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Cliente</h2>
          <div className="font-medium text-slate-900">{laudo.amostra.cliente.razaoSocial}</div>
          <div className="text-xs text-slate-600">CNPJ: {laudo.amostra.cliente.cnpj}</div>
          <div className="text-xs text-slate-600">Responsável: {laudo.amostra.cliente.responsavel}</div>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Amostra</h2>
          <div className="text-xs text-slate-700">
            OS: <span className="font-mono">{laudo.amostra.numeroOS}</span>
          </div>
          <div className="text-xs text-slate-700">Produto: {laudo.amostra.produto.nome}</div>
          <div className="text-xs text-slate-700">Lote: {laudo.amostra.lote.numero}</div>
          {laudo.amostra.pontoColeta && (
            <div className="text-xs text-slate-700">Ponto de coleta: {laudo.amostra.pontoColeta.nome}</div>
          )}
          <div className="text-xs text-slate-700">Coleta: {fmtDateOnly(laudo.amostra.dataColeta)}</div>
          <div className="text-xs text-slate-700">Recebimento: {fmtDateOnly(laudo.amostra.dataRecebimento)}</div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Resultados analíticos</h2>
        <table className="w-full text-sm border border-slate-300">
          <thead className="bg-slate-100 text-xs uppercase">
            <tr>
              <th className="border-b border-slate-300 px-3 py-2 text-left">Parâmetro</th>
              <th className="border-b border-slate-300 px-3 py-2 text-right">Resultado</th>
              <th className="border-b border-slate-300 px-3 py-2 text-left">Unidade</th>
              <th className="border-b border-slate-300 px-3 py-2 text-left">Especificação</th>
              <th className="border-b border-slate-300 px-3 py-2 text-left">Método</th>
              <th className="border-b border-slate-300 px-3 py-2 text-left">Conformidade</th>
            </tr>
          </thead>
          <tbody>
            {laudo.amostra.resultados.map((r) => {
              const espec = laudo.amostra.produto.especificacoes.find(
                (e) => e.parametro.toLowerCase() === r.parametro.toLowerCase(),
              );
              return (
                <tr key={r.id}>
                  <td className="border-b border-slate-200 px-3 py-2">{r.parametro}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-right font-mono">{r.valor}</td>
                  <td className="border-b border-slate-200 px-3 py-2">{r.unidade}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-xs">
                    {espec ? descreverLimite(espec.minimo, espec.maximo, espec.unidade) : "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-xs text-slate-600">
                    {r.metodo ?? espec?.metodo ?? "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-xs">
                    {CONFORMIDADE_LABEL[r.conformidade] ?? r.conformidade}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Conclusão</h2>
        <div
          className={
            "inline-block border-2 rounded-md px-4 py-2 text-base font-bold " +
            (CONCLUSAO_CLASS[laudo.conclusao] ?? "")
          }
        >
          {CONCLUSAO_LABEL[laudo.conclusao] ?? laudo.conclusao}
        </div>
        {laudo.observacoes && (
          <div className="mt-3 text-sm text-slate-700">
            <span className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Observações</span>
            {laudo.observacoes}
          </div>
        )}
      </section>

      <footer className="mt-8 pt-6 border-t border-slate-300 flex justify-between items-end">
        <div className="text-sm">
          {config?.rtAssinaturaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.rtAssinaturaUrl}
              alt="Assinatura RT"
              className="h-12 mb-1 object-contain"
            />
          )}
          <div className="border-b border-slate-400 w-64 mb-1"></div>
          <div className="font-medium text-slate-900">{laudo.emitidoPorNome}</div>
          <div className="text-xs text-slate-600">Responsável técnico · {laudo.emitidoPorRole}</div>
          {config?.rtRegistro && (
            <div className="text-xs text-slate-600">Registro: {config.rtRegistro}</div>
          )}
        </div>
        <div className="text-right">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="QR de verificação" width={120} height={120} className="border border-slate-200" />
          <div className="mt-1 text-[10px] text-slate-500">Escaneie para verificar autenticidade</div>
          <div className="text-[9px] text-slate-400 font-mono break-all max-w-[140px]">{laudo.qrToken}</div>
        </div>
      </footer>

      <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-0.5">
        <div>Este laudo só é válido na íntegra. Reprodução parcial requer autorização.</div>
        {config?.inmetroNumero && (
          <div>Laboratório acreditado pelo INMETRO conforme ABNT NBR ISO/IEC 17025.</div>
        )}
      </div>
    </article>
  );
}
