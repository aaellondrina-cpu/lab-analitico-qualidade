import { PageHeader } from "@/components/PageHeader";
import { FornecedorForm } from "../_components/FornecedorForm";
import { requireUser } from "@/lib/dal";

export default async function NovoFornecedorPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo fornecedor" subtitle="Cadastro de fornecedor de insumos / matérias-primas" />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <FornecedorForm />
      </div>
    </>
  );
}
