import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Colaboradores"
      subtitle="Equipe técnica do laboratório"
      features={[
        "Cadastro completo: nome, CPF, função, formação",
        "Máscaras CPF / Telefone",
        "Vínculo com treinamentos e qualificações",
        "Registro profissional (CRQ, CRBio, CREA, etc.)",
        "Assinatura digital para emissão de laudos",
      ]}
    />
  );
}
