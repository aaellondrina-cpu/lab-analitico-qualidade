import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="APPCC / HACCP"
      subtitle="Pontos Críticos de Controle (ISO 22000)"
      features={[
        "Cadastro de PCCs com limites críticos (mín/máx)",
        "Tipos de perigo: biológico, químico, físico",
        "Frequência de monitoramento e responsável",
        "Lançamento de leituras por turno",
        "Ação corretiva automática se ultrapassar limite",
        "Validação periódica do plano APPCC",
      ]}
    />
  );
}
