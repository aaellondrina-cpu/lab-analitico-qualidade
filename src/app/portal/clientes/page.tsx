import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Clientes"
      subtitle="Cadastro de empresas compradoras (limite demo: até 20)"
      features={[
        "Razão social, CNPJ, IE, contato",
        "CEP autocomplete via ViaCEP",
        "Máscaras CPF / CNPJ / Telefone",
        "Histórico de pedidos e laudos emitidos",
        "Indicador de % de aprovação dos produtos vendidos",
        "Acesso ao Portal do Cliente com login próprio",
      ]}
    />
  );
}
