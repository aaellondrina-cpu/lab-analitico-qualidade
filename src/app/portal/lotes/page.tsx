import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Lotes de produção"
      subtitle="Rastreabilidade completa de cada lote fabricado"
      features={[
        "Número de lote auto-gerado no formato ANO-SEQ-CODPROD-VOL-LINHA",
        "Data de fabricação e validade calculadas automaticamente",
        "Vínculo com insumos consumidos (rastreabilidade)",
        "Custo total do lote (insumos + embalagens) calculado",
        "Custo por unidade e por litro produzido",
        "Status: Em produção → Aguardando análise → Aprovado/Reprovado → Expedido",
        "Bloco automático pra impressora inkjet da linha (LOTE/FAB/VAL/MAPA)",
      ]}
    />
  );
}
