import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Pontos de coleta"
      subtitle="Locais de amostragem de água, swab e ambiente"
      features={[
        "Cadastro de pontos com identificação e localização",
        "Tipos: água bruta, água tratada, água de envase, swab de superfície, ar ambiente",
        "Frequência de coleta programada",
        "Vínculo com amostras coletadas (rastreabilidade)",
        "Plano de monitoramento por ponto",
      ]}
    />
  );
}
