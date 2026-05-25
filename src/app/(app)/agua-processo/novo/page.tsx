import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/dal";
import { AguaForm } from "../_components/AguaForm";

export default async function NovoAguaPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Lançar controle de água" subtitle="Diário, mensal ou semestral (laudo externo)" />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <AguaForm />
      </div>
    </>
  );
}
