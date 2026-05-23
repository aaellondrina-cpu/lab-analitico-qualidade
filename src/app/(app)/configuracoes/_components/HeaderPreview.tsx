import { formacaoLabel } from "@/lib/configuracao-labels";

type Props = {
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  rtNome?: string | null;
  rtFormacao?: string | null;
  rtRegistro?: string | null;
  mapaNumero?: string | null;
  anvisaNumero?: string | null;
  inmetroNumero?: string | null;
};

export function HeaderPreview(c: Props) {
  if (!c.razaoSocial) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
        Preencha os dados ao lado para visualizar como ficará o cabeçalho do laudo.
      </div>
    );
  }

  return (
    <div className="rounded-md border-2 border-slate-300 bg-white p-4 text-xs space-y-2">
      <div className="flex items-start gap-3 pb-2 border-b border-slate-300">
        {c.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.logoUrl} alt="logo" className="h-12 w-12 object-contain" />
        ) : (
          <div className="h-12 w-12 rounded bg-slate-100 grid place-items-center text-[10px] text-slate-400">
            LOGO
          </div>
        )}
        <div className="flex-1">
          <div className="font-bold text-slate-900 text-sm">{c.razaoSocial}</div>
          <div className="text-slate-600">
            {c.cnpj && <>CNPJ: {c.cnpj} · </>}
            {c.endereco}
          </div>
          <div className="text-slate-600">
            {c.telefone && <>Tel: {c.telefone}</>}
            {c.email && <> · {c.email}</>}
          </div>
        </div>
      </div>

      <div className="text-slate-700">
        RT: <span className="font-medium">{c.rtNome ?? "—"}</span>
        {c.rtFormacao && <> — {formacaoLabel(c.rtFormacao)}</>}
        {c.rtRegistro && <> · Reg. {c.rtRegistro}</>}
      </div>

      <div className="text-slate-700">
        {c.mapaNumero && <>Aut. MAPA nº {c.mapaNumero} </>}
        {c.anvisaNumero && <>| ANVISA nº {c.anvisaNumero} </>}
        {c.inmetroNumero && <>| Acreditado INMETRO {c.inmetroNumero} — ISO/IEC 17025</>}
      </div>

      <div className="pt-2 mt-2 border-t border-slate-300 text-center text-[10px] text-slate-500">
        LAUDO DE ANÁLISE Nº L-2026-XXXX · OS: OS-2026-XXXX · Emissão: DD/MM/AAAA
      </div>
    </div>
  );
}
