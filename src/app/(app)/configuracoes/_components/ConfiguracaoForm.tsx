"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { salvarConfiguracao, type ConfiguracaoFormState } from "../actions";
import { HeaderPreview } from "./HeaderPreview";

const initialState: ConfiguracaoFormState = {};

type ConfigData = {
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  inscricaoEstadual?: string | null;
  endereco?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;
  logoUrl?: string | null;
  rtNome?: string | null;
  rtFormacao?: string | null;
  rtRegistro?: string | null;
  rtAssinaturaUrl?: string | null;
  mapaNumero?: string | null;
  mapaValidade?: Date | string | null;
  anvisaNumero?: string | null;
  anvisaValidade?: Date | string | null;
  inmetroNumero?: string | null;
  inmetroValidade?: Date | string | null;
  inmetroEscopo?: string | null;
  vigilanciaNumero?: string | null;
  vigilanciaOrgao?: string | null;
  vigilanciaValidade?: Date | string | null;
  ibamaNumero?: string | null;
  outrosRegistros?: string | null;
};

function isoDate(v: Date | string | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 10);
  return v.toISOString().slice(0, 10);
}

export function ConfiguracaoForm({ initial }: { initial: ConfigData | null }) {
  const [state, action, pending] = useActionState(salvarConfiguracao, initialState);
  const router = useRouter();

  // Live preview state — atualiza enquanto o usuário digita
  const [live, setLive] = useState<ConfigData>(initial ?? {});

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    const t = e.target as unknown as { name?: string; value?: string };
    if (!t.name) return;
    setLive((prev) => ({ ...prev, [t.name as string]: t.value }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <form action={action} onChange={handleChange} className="lg:col-span-3 space-y-5">
        <Section title="Identificação">
          <Row>
            <Field label="Razão Social" name="razaoSocial" defaultValue={initial?.razaoSocial ?? ""} errors={state.errors?.razaoSocial} required />
            <Field label="Nome Fantasia" name="nomeFantasia" defaultValue={initial?.nomeFantasia ?? ""} />
          </Row>
          <Row>
            <Field label="CNPJ" name="cnpj" defaultValue={initial?.cnpj ?? ""} errors={state.errors?.cnpj} required />
            <Field label="Inscrição Estadual" name="inscricaoEstadual" defaultValue={initial?.inscricaoEstadual ?? ""} />
          </Row>
        </Section>

        <Section title="Endereço">
          <Field label="Logradouro" name="endereco" defaultValue={initial?.endereco ?? ""} errors={state.errors?.endereco} required />
          <Row>
            <Field label="CEP" name="cep" defaultValue={initial?.cep ?? ""} errors={state.errors?.cep} required />
            <Field label="Cidade" name="cidade" defaultValue={initial?.cidade ?? ""} errors={state.errors?.cidade} required />
            <Field label="UF" name="estado" defaultValue={initial?.estado ?? ""} errors={state.errors?.estado} required />
          </Row>
        </Section>

        <Section title="Contato">
          <Row>
            <Field label="Telefone" name="telefone" defaultValue={initial?.telefone ?? ""} errors={state.errors?.telefone} required />
            <Field label="E-mail" name="email" type="email" defaultValue={initial?.email ?? ""} errors={state.errors?.email} required />
          </Row>
          <Row>
            <Field label="Site" name="site" defaultValue={initial?.site ?? ""} />
            <Field label="URL da Logo (PNG/SVG)" name="logoUrl" defaultValue={initial?.logoUrl ?? ""} placeholder="https://..." />
          </Row>
        </Section>

        <Section title="Responsável Técnico (RT)">
          <Field label="Nome completo" name="rtNome" defaultValue={initial?.rtNome ?? ""} errors={state.errors?.rtNome} required />
          <Row>
            <SelectField
              label="Formação"
              name="rtFormacao"
              defaultValue={initial?.rtFormacao ?? "QUIMICO"}
              options={[
                { value: "FARMACEUTICO", label: "Farmacêutico" },
                { value: "QUIMICO", label: "Químico" },
                { value: "BIOLOGO", label: "Biólogo" },
                { value: "ENG_ALIMENTOS", label: "Eng. de Alimentos" },
                { value: "OUTRO", label: "Outro" },
              ]}
            />
            <Field label="Registro profissional" name="rtRegistro" defaultValue={initial?.rtRegistro ?? ""} errors={state.errors?.rtRegistro} placeholder="CRQ-IV-12345" required />
          </Row>
          <Field label="URL da Assinatura (PNG transparente)" name="rtAssinaturaUrl" defaultValue={initial?.rtAssinaturaUrl ?? ""} placeholder="https://..." />
        </Section>

        <Section title="Autorizações e Registros">
          <Row>
            <Field label="MAPA — número" name="mapaNumero" defaultValue={initial?.mapaNumero ?? ""} />
            <Field label="MAPA — validade" name="mapaValidade" type="date" defaultValue={isoDate(initial?.mapaValidade)} />
          </Row>
          <Row>
            <Field label="ANVISA — número" name="anvisaNumero" defaultValue={initial?.anvisaNumero ?? ""} />
            <Field label="ANVISA — validade" name="anvisaValidade" type="date" defaultValue={isoDate(initial?.anvisaValidade)} />
          </Row>
          <Row>
            <Field label="INMETRO/CGCRE — número (CRL)" name="inmetroNumero" defaultValue={initial?.inmetroNumero ?? ""} />
            <Field label="INMETRO — validade" name="inmetroValidade" type="date" defaultValue={isoDate(initial?.inmetroValidade)} />
          </Row>
          <Field label="INMETRO — escopo" name="inmetroEscopo" defaultValue={initial?.inmetroEscopo ?? ""} placeholder="Análises físico-químicas em refrigerantes..." />
          <Row>
            <Field label="Vig. Sanitária — número" name="vigilanciaNumero" defaultValue={initial?.vigilanciaNumero ?? ""} />
            <Field label="Vig. Sanitária — órgão" name="vigilanciaOrgao" defaultValue={initial?.vigilanciaOrgao ?? ""} />
            <Field label="Validade" name="vigilanciaValidade" type="date" defaultValue={isoDate(initial?.vigilanciaValidade)} />
          </Row>
          <Field label="IBAMA — número" name="ibamaNumero" defaultValue={initial?.ibamaNumero ?? ""} />
          <div>
            <label htmlFor="outrosRegistros" className="block text-xs font-medium text-slate-700 mb-1">
              Outros registros / certificações
            </label>
            <textarea
              id="outrosRegistros"
              name="outrosRegistros"
              defaultValue={initial?.outrosRegistros ?? ""}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
              placeholder="ISO 9001, HACCP, BPF interno..."
            />
          </div>
        </Section>

        {state.message && (
          <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {state.message}
          </p>
        )}

        {state.ok && (
          <p className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
            ✓ Configuração salva. Será aplicada em todos os próximos laudos.
          </p>
        )}

        <div className="flex gap-2 sticky bottom-0 bg-white py-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar configuração"}
          </button>
        </div>
      </form>

      <aside className="lg:col-span-2 space-y-3">
        <h3 className="text-xs uppercase tracking-wide text-slate-500">Pré-visualização — cabeçalho do laudo</h3>
        <HeaderPreview
          razaoSocial={live.razaoSocial}
          cnpj={live.cnpj}
          endereco={live.endereco}
          telefone={live.telefone}
          email={live.email}
          logoUrl={live.logoUrl}
          rtNome={live.rtNome}
          rtFormacao={live.rtFormacao}
          rtRegistro={live.rtRegistro}
          mapaNumero={live.mapaNumero}
          anvisaNumero={live.anvisaNumero}
          inmetroNumero={live.inmetroNumero}
        />
        <p className="text-[11px] text-slate-500">
          Esta pré-visualização atualiza enquanto você digita. O cabeçalho real
          é aplicado em todos os laudos e relatórios após salvar.
        </p>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-slate-200 p-4 space-y-3">
      <legend className="text-xs uppercase tracking-wide text-petroleo px-1">{title}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  name,
  errors,
  type = "text",
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  errors?: string[];
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
