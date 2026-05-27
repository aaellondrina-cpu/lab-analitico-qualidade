import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Treinamentos"
      subtitle="Capacitação obrigatória dos colaboradores"
      features={[
        "Cadastro de treinamentos (BPF, APPCC, ISO, segurança, primeiros socorros)",
        "Lista de presença com colaboradores treinados",
        "Validade do treinamento e alerta de reciclagem",
        "Certificado e upload de evidência (lista assinada)",
        "Matriz de qualificação por função",
      ]}
    />
  );
}
