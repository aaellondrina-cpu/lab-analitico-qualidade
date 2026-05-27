import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Controle de temperatura"
      subtitle="Monitoramento de câmaras frias e áreas de produção"
      features={[
        "Cadastro de pontos com mín/máx permitidos",
        "Frequência de registro configurável (hora em hora, 2x/dia, etc.)",
        "Lançamento de leituras com status automático",
        "Abertura automática de NC em caso de desvio",
        "Relatório mensal com gráfico de variação",
        "Conforme Portaria MAPA 1343/2025",
      ]}
    />
  );
}
