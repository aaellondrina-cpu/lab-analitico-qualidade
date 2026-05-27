import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Livro de produção"
      subtitle="Registro oficial exigido pelo MAPA"
      features={[
        "Consolidado diário/mensal de lotes produzidos",
        "Volume produzido por linha e turno",
        "Insumos consumidos com lotes (rastreabilidade)",
        "Quebra e perdas registradas",
        "Assinatura digital do responsável",
        "Exportação em PDF e Excel",
      ]}
    />
  );
}
