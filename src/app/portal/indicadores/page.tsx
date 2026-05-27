import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Indicadores da Qualidade"
      subtitle="Dashboard de KPIs (ISO 17025 §8.9)"
      features={[
        "% de aprovação de lotes (mês / trimestre / ano)",
        "Tempo médio de análise por OS",
        "NCs por causa raiz (Pareto)",
        "Reclamações recorrentes por produto",
        "Custo médio por litro produzido",
        "Evolução temporal com gráficos de linha e barra",
      ]}
    />
  );
}
