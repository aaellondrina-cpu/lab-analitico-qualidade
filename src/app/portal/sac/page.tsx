import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="SAC / Reclamações"
      subtitle="Atendimento ao consumidor"
      features={[
        "Cadastro de reclamações por canal (telefone, e-mail, presencial, SAC)",
        "Tipos: Qualidade / Embalagem / Sabor / Outros",
        "Urgência (baixa, média, alta, crítica)",
        "Vínculo com lote reclamado e cliente",
        "Tratativa, retorno ao consumidor e abertura de NC se necessário",
        "Indicadores: tempo médio de resposta, recorrência por tipo",
      ]}
    />
  );
}
