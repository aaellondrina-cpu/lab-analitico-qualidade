import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="CIP (Clean-in-Place)"
      subtitle="Registros de limpeza e sanitização"
      features={[
        "Cadastro de procedimentos CIP por linha/equipamento",
        "Lançamento de ciclos (enxágue, detergência, sanitização)",
        "Tempo, temperatura e concentração validados automaticamente",
        "Análise microbiológica pós-CIP (swab de superfície)",
        "Relatório histórico para auditoria",
      ]}
    />
  );
}
