import { PageHeader } from "@/components/PageHeader";
import { ClienteForm } from "../_components/ClienteForm";
import { requireUser } from "@/lib/dal";

export default async function NovoClientePage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo cliente" subtitle="Cadastro de indústria atendida" />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <ClienteForm />
      </div>
    </>
  );
}
