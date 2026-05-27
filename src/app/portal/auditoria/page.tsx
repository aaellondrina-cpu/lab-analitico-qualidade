import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Trilha de auditoria"
      subtitle="Log de todas as alterações do sistema (ISO 17025 §7.5)"
      features={[
        "Registro automático de criar / editar / excluir em qualquer tela",
        "Quem fez, quando, o quê (antes / depois)",
        "Filtro por usuário, módulo, período",
        "Não pode ser editado ou apagado",
        "Exportação em CSV para investigação",
        "Atende ISO 17025 (rastreabilidade de alterações)",
      ]}
    />
  );
}
