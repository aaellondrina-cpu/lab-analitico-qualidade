import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Estoque & Expedição"
      subtitle="Controle de produto acabado e expedição"
      features={[
        "Entrada de lotes aprovados com localização no armazém",
        "Saída para cliente com NF, transportadora e temperatura",
        "Saldo automático por produto",
        "Alerta de produto próximo ao vencimento (30 dias)",
        "Rastreabilidade de distribuição para Recall",
        "Consolidado para Declaração Anual MAPA",
      ]}
    />
  );
}
