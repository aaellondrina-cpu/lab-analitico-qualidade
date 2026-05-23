import { PageHeader } from "@/components/PageHeader";

export default function NaoConformidadesPage() {
  return (
    <>
      <PageHeader
        title="Não Conformidades"
        subtitle="NCs abertas automaticamente quando resultado fica fora dos limites"
      />

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
        Nenhuma não conformidade aberta.
      </div>
    </>
  );
}
