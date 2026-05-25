import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/dal";
import { PontoForm } from "../_components/PontoForm";

export default async function NovoPontoPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo ponto de monitoramento" subtitle="Câmara fria, armazém, área de produção..." />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <PontoForm />
      </div>
    </>
  );
}
