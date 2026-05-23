import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function AmostrasPage() {
  return (
    <>
      <PageHeader
        title="Amostras"
        subtitle="Lista de amostras recebidas no laboratório"
        action={
          <Link
            href="/amostras/nova"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Nova amostra
          </Link>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">OS</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Lote</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                Nenhuma amostra cadastrada ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
