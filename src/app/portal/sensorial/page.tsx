import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Análise sensorial"
      subtitle="Painel de degustação por lote (Decreto 6.871/2009)"
      features={[
        "Cadastro de avaliadores e painel",
        "Ficha por degustador com escala hedônica 1-9",
        "Parâmetros: aparência, cor, odor, sabor, carbonatação, corpo, impressão global",
        "Comparação com produto de referência",
        "Resultado consolidado automático (média + desvio padrão)",
        "Reprovação abre NC automaticamente",
      ]}
    />
  );
}
