import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Recall de produto"
      subtitle="Procedimento de retirada de produto do mercado"
      features={[
        "Abertura formal com motivo (Classe I / II / III)",
        "Lotes envolvidos (rastreabilidade automática)",
        "Lista de clientes que receberam o lote",
        "Comunicação a clientes, ANVISA/MAPA e mídia",
        "Acompanhamento de retorno e destino do produto",
        "PDF do plano de recall conforme RDC 24/2015",
      ]}
    />
  );
}
