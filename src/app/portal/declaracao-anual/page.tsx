import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Declaração anual MAPA (DAP)"
      subtitle="Declaração Anual de Produção"
      features={[
        "Consolidado automático de produção do ano",
        "Volume produzido por produto",
        "Estoque em 31/dezembro",
        "Insumos consumidos no ano",
        "Exporta no formato oficial da DAP MAPA",
        "Histórico de declarações enviadas",
      ]}
    />
  );
}
