import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/dal";
import { PCCForm } from "../_components/PCCForm";

export default async function NovoPCCPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo Ponto Crítico de Controle" subtitle="Cadastro de PCC do plano APPCC" />
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <PCCForm />
      </section>
    </>
  );
}
