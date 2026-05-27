import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Produtos"
      subtitle="Catálogo dos produtos fabricados"
      features={[
        "Cadastro com nome, código, sabor, volume, tipo de embalagem",
        "Especificações técnicas (pH, Brix, CO₂, densidade, acidez)",
        "Registro MAPA do produto",
        "Validade em dias (usada pra calcular validade do lote)",
        "Formulação (receita) com ingredientes e %",
        "Edição com histórico de versões",
      ]}
    />
  );
}
