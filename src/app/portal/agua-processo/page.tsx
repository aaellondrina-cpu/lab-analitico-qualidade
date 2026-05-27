import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Água de processo"
      subtitle="Controle da água utilizada na fabricação (Portaria GM/MS 888/2021)"
      features={[
        "Grupo 1 — microbiológica (coliformes, E. coli, cloro diário)",
        "Grupo 2 — físico-química mensal (pH, turbidez, condutividade)",
        "Grupo 3 — análise completa semestral/anual (40+ parâmetros)",
        "Status atual: APROVADA / ATENÇÃO / REPROVADA",
        "Próxima análise programada com alerta de vencimento",
        "Upload de laudo externo (PDF) para análise anual",
      ]}
    />
  );
}
