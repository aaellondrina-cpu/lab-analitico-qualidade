import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Amostras / OS"
      subtitle="Ordens de serviço de análise"
      features={[
        "OS numerada automaticamente por ano (OS-2026-0001)",
        "Tipos: matéria-prima, xarope, produto acabado, embalagem, água, swab, CIP, retenção, reclamação",
        "Vínculo com lote, produto e cliente",
        "Lançamento de resultados com comparação automática à especificação",
        "Conformidade visual: Conforme ✅ / Atenção ⚠️ / Não conforme ❌",
        "Resultado fora do limite abre NC automaticamente",
      ]}
    />
  );
}
