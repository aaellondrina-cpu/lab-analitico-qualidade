import { PageHeader } from "@/components/PageHeader";
import { ProdutoForm } from "../_components/ProdutoForm";
import { requireUser } from "@/lib/dal";

export default async function NovoProdutoPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo produto" subtitle="Cadastro de produto e especificações técnicas" />
      <div className="max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
        <ProdutoForm />
      </div>
    </>
  );
}
