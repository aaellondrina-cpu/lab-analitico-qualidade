import { PageHeader } from "@/components/PageHeader";

export default function LaudosPage() {
  return (
    <>
      <PageHeader
        title="Laudos"
        subtitle="Emissão e histórico de laudos analíticos (PDF + QR Code)"
      />

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
        Nenhum laudo emitido ainda.
      </div>
    </>
  );
}
