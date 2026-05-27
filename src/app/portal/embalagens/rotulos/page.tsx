import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Rótulos"
      subtitle="Checklist de conformidade (RDC 259/2002 + Decreto 6.871/2009)"
      features={[
        "Identificação: nome, marca, registro MAPA do produto",
        "Composição e ingredientes em ordem decrescente",
        "Declaração de alérgenos e edulcorantes",
        "Tabela nutricional conforme RDC 429/2020 (com lupa frontal)",
        "Alertas obrigatórios (Beba com moderação, Venda proibida para menores)",
        "Código de barras EAN-13 e upload da arte aprovada pelo MAPA",
        "Status final: Aprovado / Reprovado / Aprovado com ressalva",
      ]}
    />
  );
}
