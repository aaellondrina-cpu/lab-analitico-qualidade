import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Auditorias"
      subtitle="Auditorias internas e externas (BPF / ISO / ANVISA / MAPA)"
      features={[
        "Programação anual de auditorias",
        "Equipe auditora e auditados",
        "Itens auditados com resultado (Conforme / NC / Observação)",
        "Plano de ação corretiva para NCs",
        "Acompanhamento de prazos e eficácia",
        "Relatório final em PDF",
      ]}
    />
  );
}
