import { PageHeader } from "@/components/PageHeader";

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  features?: string[];
};

export function PortalPlaceholder({
  title,
  subtitle,
  description,
  features,
}: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-start gap-6">
          <div className="text-6xl shrink-0 select-none" aria-hidden>
            💧
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-petroleo mb-2">
              Olá! Aqui você vai encontrar {title.toLowerCase()}.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description ??
                `Esta área faz parte do LimsQual e mostra ${title.toLowerCase()} da sua operação. ` +
                  `Está sendo preparada com base no que foi conversado no atendimento.`}
            </p>

            {features && features.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  O que esta tela vai oferecer
                </p>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-agua mt-0.5">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-5 text-xs text-slate-500 italic">
              Quer adiantar a configuração? Clique no Quali no canto inferior
              direito — ele te conta como o módulo funciona no laboratório.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
