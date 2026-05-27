import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Equipamentos"
      subtitle="Cadastro e calibração de equipamentos do laboratório"
      features={[
        "Tipos: pHmetro, refratômetro, densímetro, carbonatômetro, balança, espectro, turbidímetro, autoclave, estufa",
        "Calibração interna (verificação diária) e externa (RBC/INMETRO)",
        "Status automático: Calibrado / Atenção (vence em 30d) / Vencido",
        "Bloqueio automático no lançamento de resultados se vencido",
        "Histórico de calibrações e manutenções",
      ]}
    />
  );
}
