import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Registro MAPA"
      subtitle="Registros do estabelecimento e produtos no MAPA"
      features={[
        "Registro do estabelecimento (Decreto 6.871/2009)",
        "Registro de cada produto (rótulo, formulação, processo)",
        "Validade e renovação programada",
        "Upload do certificado/portaria de registro",
        "Alertas de vencimento",
      ]}
    />
  );
}
