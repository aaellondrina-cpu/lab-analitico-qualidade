import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/dal";
import { getConfiguracao } from "@/lib/configuracao";
import { ConfiguracaoForm } from "./_components/ConfiguracaoForm";

export default async function ConfiguracoesPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const config = await getConfiguracao();

  return (
    <>
      <PageHeader
        title="Configurações do laboratório"
        subtitle="Dados aplicados no cabeçalho de todos os laudos e relatórios"
      />
      <ConfiguracaoForm initial={config} />
    </>
  );
}
