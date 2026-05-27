import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Não conformidades"
      subtitle="Gestão de NCs com tratativa e ação corretiva"
      features={[
        "Abertura automática (resultado fora do limite) ou manual",
        "Disposição do lote: Liberar com justificativa / Reter / Reprocessar / Descarte",
        "Análise de causa raiz (5 Porquês ou Ishikawa)",
        "Ação corretiva com responsável e prazo",
        "Verificação da eficácia da ação",
        "PDF da NC para evidência de auditoria",
      ]}
    />
  );
}
