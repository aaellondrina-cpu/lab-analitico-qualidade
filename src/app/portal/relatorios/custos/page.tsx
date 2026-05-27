import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Custos de produção"
      subtitle="Relatório financeiro de insumos, embalagens e custo por lote"
      features={[
        "Custo médio por lote (últimos 30 dias)",
        "Custo por litro produzido por produto",
        "Total gasto em insumos no mês",
        "Total gasto em embalagens no mês",
        "Pizza: qual insumo mais onera a produção",
        "Evolução do custo por lote ao longo do tempo",
        "Comparativo de custo entre produtos",
      ]}
    />
  );
}
