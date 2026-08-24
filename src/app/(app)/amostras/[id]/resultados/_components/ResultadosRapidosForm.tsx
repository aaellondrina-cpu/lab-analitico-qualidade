"use client";

import { useActionState, useState } from "react";
import { lancarResultado, type ResultadoFormState } from "../../../actions";

type Equipamento = { id: string; nome: string; status: string };
type TestePacote = { parametro: string; unidade: string; metodo: string };

const initialState: ResultadoFormState = {};

export function ResultadosRapidosForm({
  amostraId,
  pacotesEnsaios,
  equipamentos,
  defaultAnalista,
}: {
  amostraId: string;
  pacotesEnsaios: Record<string, TestePacote[]>;
  equipamentos: Equipamento[];
  defaultAnalista: string;
}) {
  const [pacoteSelecionado, setPacoteSelecionado] = useState<string>("");
  const [modoManual, setModoManual] = useState(false);
  const [resultados, setResultados] = useState<Record<string, string>>({});
  const [parametroManual, setParametroManual] = useState("");
  const [valorManual, setValorManual] = useState("");
  const [unidadeManual, setUnidadeManual] = useState("");

  const boundAction = lancarResultado.bind(null, amostraId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  const testes = pacoteSelecionado ? pacotesEnsaios[pacoteSelecionado] ?? [] : [];

  const handleResultadoChange = (parametro: string, valor: string) => {
    setResultados((prev) => ({
      ...prev,
      [parametro]: valor,
    }));
  };

  const handleLancarTeste = async (teste: TestePacote) => {
    const valor = resultados[teste.parametro];
    if (!valor) {
      alert(`Digite um valor para ${teste.parametro}`);
      return;
    }

    const formData = new FormData();
    formData.append("parametro", teste.parametro);
    formData.append("valor", valor);
    formData.append("unidade", teste.unidade);
    formData.append("metodo", teste.metodo);
    formData.append("analista", defaultAnalista);
    formData.append("equipamentoId", "");

    await action(formData);
    setResultados((prev) => ({
      ...prev,
      [teste.parametro]: "",
    }));
  };

  const handleLancarManual = async () => {
    if (!parametroManual || !valorManual) {
      alert("Preencha parâmetro e valor");
      return;
    }

    const formData = new FormData();
    formData.append("parametro", parametroManual);
    formData.append("valor", valorManual);
    formData.append("unidade", unidadeManual);
    formData.append("metodo", "");
    formData.append("analista", defaultAnalista);
    formData.append("equipamentoId", "");

    await action(formData);
    setParametroManual("");
    setValorManual("");
    setUnidadeManual("");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Entrada Rápida de Resultados</h2>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Modo:</span>
          <button
            type="button"
            onClick={() => {
              setModoManual(false);
              setPacoteSelecionado("");
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !modoManual
                ? "bg-petroleo text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Pacote de Ensaios
          </button>
          <button
            type="button"
            onClick={() => setModoManual(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              modoManual
                ? "bg-petroleo text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Adicionar Manual
          </button>
        </div>

        {!modoManual ? (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-2">Pacote de Ensaios</label>
              <select
                value={pacoteSelecionado}
                onChange={(e) => {
                  setPacoteSelecionado(e.target.value);
                  setResultados({});
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione um pacote</option>
                {Object.keys(pacotesEnsaios).map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            {pacoteSelecionado && (
              <div className="space-y-3">
                {testes.map((teste) => (
                  <div key={teste.parametro} className="flex items-end gap-3 p-3 bg-slate-50 rounded-md">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {teste.parametro}
                        <span className="text-[11px] text-slate-500 ml-2">{teste.metodo}</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Resultado (-)"
                          value={resultados[teste.parametro] ?? ""}
                          onChange={(e) => handleResultadoChange(teste.parametro, e.target.value)}
                          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <span className="text-sm text-slate-600 min-w-12">{teste.unidade || "—"}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLancarTeste(teste)}
                      disabled={pending || !resultados[teste.parametro]}
                      className="px-3 py-2 rounded-md bg-petroleo text-white text-xs font-medium hover:bg-petroleo-dark disabled:opacity-60"
                    >
                      {pending ? "..." : "✓"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 p-3 bg-slate-50 rounded-md">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parâmetro</label>
              <input
                type="text"
                placeholder="Ex: Densidade, Viscosidade"
                value={parametroManual}
                onChange={(e) => setParametroManual(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Valor</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="3.5"
                  value={valorManual}
                  onChange={(e) => setValorManual(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Unidade</label>
                <input
                  type="text"
                  placeholder="g/mL"
                  value={unidadeManual}
                  onChange={(e) => setUnidadeManual(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleLancarManual}
              disabled={pending || !parametroManual || !valorManual}
              className="w-full px-3 py-2 rounded-md bg-petroleo text-white text-sm font-medium hover:bg-petroleo-dark disabled:opacity-60"
            >
              {pending ? "Lançando..." : "Lançar resultado manual"}
            </button>
          </div>
        )}

        {state.message && (
          <p className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {state.message}
          </p>
        )}
        {state.warning && (
          <p className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            ⚠ {state.warning}
          </p>
        )}
      </section>
    </div>
  );
}
