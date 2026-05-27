import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="BPF — Boas Práticas de Fabricação"
      subtitle="Monitoramento diário (RDC 275/2002)"
      features={[
        "Checklist diário de BPF (instalações, equipamentos, higiene, manipuladores)",
        "Itens: Conforme / Não conforme / Não aplicável",
        "Foto de evidência para itens não conformes",
        "Abertura automática de NC se item crítico",
        "Relatório mensal de % de conformidade",
        "PDF do checklist para auditoria",
      ]}
    />
  );
}
