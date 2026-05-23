import { PageHeader } from "@/components/PageHeader";
import { EmbalagemForm } from "../_components/EmbalagemForm";
import { requireUser } from "@/lib/dal";

export default async function NovaEmbalagemPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Nova embalagem" subtitle="Registro de embalagem para controle de qualidade" />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <EmbalagemForm />
      </div>
    </>
  );
}
