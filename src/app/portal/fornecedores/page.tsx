import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Fornecedores"
      subtitle="Cadastro de fornecedores qualificados"
      features={[
        "Razão social, CNPJ, contato",
        "Tipo: Insumo / Embalagem / Serviço / Equipamento",
        "Qualificação: documentos, certificados, avaliação",
        "Histórico de fornecimento e lotes recebidos",
        "% de aprovação dos lotes recebidos",
        "Avaliação anual conforme ISO 9001 / ISO 22000",
      ]}
    />
  );
}
