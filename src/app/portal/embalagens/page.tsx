import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Embalagens"
      subtitle="Controle de qualidade de PET, vidro, tampa e lata"
      features={[
        "Tipos: PET, vidro retornável, vidro não retornável, lata, tampa, rótulo",
        "Peso, espessura, resistência à pressão, torque da tampa",
        "Microbiológico pós-lavagem (vidro retornável)",
        "Preço unitário e valor total do lote (NF + condição de pagamento)",
        "Status: Em análise / Aprovado / Reprovado",
      ]}
    />
  );
}
