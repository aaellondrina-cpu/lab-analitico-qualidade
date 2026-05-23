import { PageHeader } from "@/components/PageHeader";

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Indústrias atendidas pelo laboratório"
        action={
          <button className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
            + Novo cliente
          </button>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
        Nenhum cliente cadastrado.
      </div>
    </>
  );
}
