import { PageHeader } from "@/components/PageHeader";

export default function ProdutosPage() {
  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="Cadastro de produtos e suas especificações técnicas"
        action={
          <button className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
            + Novo produto
          </button>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
        Nenhum produto cadastrado.
      </div>
    </>
  );
}
