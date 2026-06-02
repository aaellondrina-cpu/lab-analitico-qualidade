import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function formatCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "").padStart(14, "0");
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function Campo({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm text-slate-900">{value && value.trim() !== "" ? value : "—"}</div>
    </div>
  );
}

export default async function PortalMinhaEmpresaPage() {
  const user = await requireCliente();

  const cliente = await prisma.cliente.findUnique({
    where: { id: user.clienteId },
    include: { _count: { select: { amostras: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha empresa"
        subtitle="Dados cadastrais da sua empresa no LimsQual"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Estes são os dados cadastrais da sua empresa junto ao laboratório.
        Se algo estiver desatualizado, é só avisar a equipe. Tela de consulta.
      </div>

      {!cliente ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Cadastro da empresa não encontrado.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{cliente.razaoSocial}</h2>
          <p className="font-mono text-xs text-slate-500 mb-4">{formatCNPJ(cliente.cnpj)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Responsável" value={cliente.responsavel} />
            <Campo label="E-mail" value={cliente.email} />
            <Campo label="Telefone" value={cliente.telefone} />
            <Campo label="Tipo de cliente" value={cliente.tipo} />
            <Campo label="E-mail para laudos" value={cliente.contatoLaudoEmail} />
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Amostras analisadas</div>
              <div className="text-sm text-slate-900">{cliente._count.amostras}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
