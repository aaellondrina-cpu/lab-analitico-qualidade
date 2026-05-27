import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="CEP / SPC — Controle Estatístico"
      subtitle="Cartas de controle e capacidade de processo"
      features={[
        "Cartas X-barra e R automáticas para pH, Brix, CO₂",
        "Cálculo de Cp e Cpk (acima de 1,33 = processo sob controle)",
        "Alertas de Regras de Nelson (tendências, ciclos, deslocamento)",
        "Detecta desvios antes de virar não conformidade",
        "Histórico para auditorias ISO 17025 §8.9",
      ]}
    />
  );
}
