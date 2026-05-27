import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Etiqueta para impressora"
      subtitle="Bloco de dados pra impressora inkjet da linha"
      features={[
        "Geração automática do bloco LOTE / FAB / VAL / REG. MAPA",
        "Formato compatível com impressora Markem / Videojet / Domino",
        "Preview da etiqueta antes de enviar",
        "Histórico de etiquetas enviadas por lote",
        "Reimpressão a qualquer momento",
      ]}
    />
  );
}
