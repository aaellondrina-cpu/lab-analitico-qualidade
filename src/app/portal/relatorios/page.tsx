import { requireCliente } from "@/lib/dal";
import { PortalPlaceholder } from "../_components/PortalPlaceholder";

export default async function Page() {
  await requireCliente();
  return (
    <PortalPlaceholder
      title="Painel de relatórios"
      subtitle="Acesso central aos relatórios da operação"
      features={[
        "Relatório de rastreabilidade por lote",
        "Boletim mensal de produção",
        "Custos de produção (insumos + embalagens)",
        "Livro de produção (registro oficial MAPA)",
        "Etiqueta para impressora inkjet da linha",
        "Exportação em PDF e CSV",
      ]}
    />
  );
}
