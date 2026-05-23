import { PageHeader } from "@/components/PageHeader";
import { AuditoriaForm } from "../_components/AuditoriaForm";
import { requireUser } from "@/lib/dal";

export default async function NovaAuditoriaPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Nova auditoria"
        subtitle="Registrar auditoria interna ou externa (BPF, ISO, ANVISA, MAPA…)"
      />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <AuditoriaForm />
      </div>
    </>
  );
}
