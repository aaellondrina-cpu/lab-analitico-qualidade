import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Documentos"
      subtitle="Gestão documental (POPs, manuais, registros)"
      features={[
        "Tipos: POP, IT, manual da qualidade, registros, formulários",
        "Controle de versões com data e responsável",
        "Documentos vigentes vs obsoletos",
        "Upload de PDF e link para visualização",
        "Distribuição controlada (quem leu, quando)",
      ]}
    />
  );
}
