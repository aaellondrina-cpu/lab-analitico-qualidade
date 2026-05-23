// Templates de especificações analíticas para indústria de bebidas.
// Baseado em RDC ANVISA 331/2019, Portaria MS 888/2021, IN MAPA 27/2009,
// ABNT NBR 13793 e métodos AOAC/IAL/SMEWW.
// Valores são SUGESTÕES — ajuste por produto/fornecedor.

export type EspecTipo = "FISICOQUIMICO" | "MICROBIOLOGICO" | "SENSORIAL";

export type EspecTemplate = {
  parametro: string;
  tipo: EspecTipo;
  minimo: string; // string para colar em <input>
  maximo: string;
  unidade: string;
  metodo: string;
  legislacao: string;
};

export type Template = {
  id: string;
  nome: string;
  descricao: string;
  itens: EspecTemplate[];
};

// =====================================
// Refrigerante (cola/guaraná/laranja/limão)
// =====================================
const refrigerante: Template = {
  id: "refrigerante",
  nome: "Refrigerante / Bebida Não Alcoólica",
  descricao:
    "Físico-químicos + microbiológicos (RDC 331/2019) para refrigerante padrão",
  itens: [
    // Físico-químicos
    { parametro: "pH", tipo: "FISICOQUIMICO", minimo: "2.5", maximo: "4.5", unidade: "—", metodo: "AOAC 943.02", legislacao: "" },
    { parametro: "°Brix (sólidos solúveis)", tipo: "FISICOQUIMICO", minimo: "9", maximo: "13", unidade: "°Brix", metodo: "AOAC 932.12", legislacao: "" },
    { parametro: "Densidade", tipo: "FISICOQUIMICO", minimo: "1.040", maximo: "1.060", unidade: "g/mL", metodo: "AOAC 945.06", legislacao: "" },
    { parametro: "CO2 (carbonatação)", tipo: "FISICOQUIMICO", minimo: "3", maximo: "4", unidade: "volumes", metodo: "ABNT NBR 13793", legislacao: "" },
    { parametro: "Acidez total titulável", tipo: "FISICOQUIMICO", minimo: "0.05", maximo: "0.20", unidade: "g/100mL", metodo: "IAL 310/IV", legislacao: "" },
    { parametro: "Cor (absorbância)", tipo: "FISICOQUIMICO", minimo: "", maximo: "", unidade: "AU", metodo: "Espectrofotometria", legislacao: "" },
    { parametro: "Turbidez", tipo: "FISICOQUIMICO", minimo: "0", maximo: "5", unidade: "NTU", metodo: "SMEWW 2130", legislacao: "" },
    // Microbiológicos
    { parametro: "Coliformes totais", tipo: "MICROBIOLOGICO", minimo: "", maximo: "100", unidade: "NMP/mL", metodo: "SMEWW 9221", legislacao: "RDC 331/2019" },
    { parametro: "Escherichia coli", tipo: "MICROBIOLOGICO", minimo: "", maximo: "1", unidade: "NMP/mL", metodo: "SMEWW 9221F", legislacao: "RDC 331/2019" },
    { parametro: "Bolores e leveduras", tipo: "MICROBIOLOGICO", minimo: "", maximo: "100", unidade: "UFC/mL", metodo: "ISO 21527", legislacao: "RDC 331/2019" },
    { parametro: "Bactérias heterotróficas", tipo: "MICROBIOLOGICO", minimo: "", maximo: "500", unidade: "UFC/mL", metodo: "SMEWW 9215", legislacao: "" },
  ],
};

// =====================================
// Água de processo / tratamento (Portaria MS 888/2021)
// =====================================
const aguaTratamento: Template = {
  id: "agua-tratamento",
  nome: "Água de Tratamento / Processo",
  descricao:
    "Parâmetros de água potável para uso industrial (Port. MS 888/2021)",
  itens: [
    { parametro: "pH", tipo: "FISICOQUIMICO", minimo: "6.0", maximo: "9.5", unidade: "—", metodo: "SMEWW 4500-H", legislacao: "Port. 888/2021" },
    { parametro: "Cor aparente", tipo: "FISICOQUIMICO", minimo: "", maximo: "15", unidade: "uH", metodo: "SMEWW 2120", legislacao: "Port. 888/2021" },
    { parametro: "Turbidez", tipo: "FISICOQUIMICO", minimo: "", maximo: "5", unidade: "NTU", metodo: "SMEWW 2130", legislacao: "Port. 888/2021" },
    { parametro: "Cloro residual livre", tipo: "FISICOQUIMICO", minimo: "0.2", maximo: "2.0", unidade: "mg/L", metodo: "SMEWW 4500-Cl", legislacao: "Port. 888/2021" },
    { parametro: "Ozônio residual", tipo: "FISICOQUIMICO", minimo: "", maximo: "0.4", unidade: "mg/L", metodo: "SMEWW 4500-O3", legislacao: "Port. 888/2021" },
    { parametro: "Coliformes totais", tipo: "MICROBIOLOGICO", minimo: "", maximo: "0", unidade: "/100mL", metodo: "SMEWW 9221", legislacao: "Port. 888/2021" },
    { parametro: "Escherichia coli", tipo: "MICROBIOLOGICO", minimo: "", maximo: "0", unidade: "/100mL", metodo: "SMEWW 9221F", legislacao: "Port. 888/2021" },
  ],
};

// =====================================
// Bebida alcoólica (cerveja)
// =====================================
const cerveja: Template = {
  id: "cerveja",
  nome: "Cerveja / Bebida Alcoólica",
  descricao: "Parâmetros básicos para cerveja (Lei 8.918/1994)",
  itens: [
    { parametro: "pH", tipo: "FISICOQUIMICO", minimo: "3.8", maximo: "4.7", unidade: "—", metodo: "AOAC 943.02", legislacao: "" },
    { parametro: "°Brix", tipo: "FISICOQUIMICO", minimo: "10", maximo: "16", unidade: "°Brix", metodo: "AOAC 932.12", legislacao: "" },
    { parametro: "Densidade", tipo: "FISICOQUIMICO", minimo: "1.005", maximo: "1.020", unidade: "g/mL", metodo: "AOAC 945.06", legislacao: "" },
    { parametro: "CO2", tipo: "FISICOQUIMICO", minimo: "2", maximo: "3", unidade: "volumes", metodo: "ABNT NBR 13793", legislacao: "" },
    { parametro: "Teor alcoólico", tipo: "FISICOQUIMICO", minimo: "4", maximo: "8", unidade: "% v/v", metodo: "IAL 308/IV", legislacao: "Lei 8.918/1994" },
    { parametro: "Acidez total", tipo: "FISICOQUIMICO", minimo: "", maximo: "0.3", unidade: "g/100mL", metodo: "IAL 310/IV", legislacao: "" },
    { parametro: "Bolores e leveduras", tipo: "MICROBIOLOGICO", minimo: "", maximo: "10", unidade: "UFC/mL", metodo: "ISO 21527", legislacao: "RDC 331/2019" },
  ],
};

// =====================================
// Xarope simples / composto (intermediários de produção)
// =====================================
const xaropeComposto: Template = {
  id: "xarope-composto",
  nome: "Xarope Composto (pré-envase)",
  descricao: "Análise de liberação do xarope composto antes do envase",
  itens: [
    { parametro: "pH", tipo: "FISICOQUIMICO", minimo: "2.5", maximo: "4.5", unidade: "—", metodo: "AOAC 943.02", legislacao: "" },
    { parametro: "°Brix", tipo: "FISICOQUIMICO", minimo: "45", maximo: "65", unidade: "°Brix", metodo: "AOAC 932.12", legislacao: "" },
    { parametro: "Densidade", tipo: "FISICOQUIMICO", minimo: "1.20", maximo: "1.32", unidade: "g/mL", metodo: "AOAC 945.06", legislacao: "" },
    { parametro: "Acidez", tipo: "FISICOQUIMICO", minimo: "0.3", maximo: "0.8", unidade: "g/100mL", metodo: "IAL 310/IV", legislacao: "" },
    { parametro: "Coliformes totais", tipo: "MICROBIOLOGICO", minimo: "", maximo: "10", unidade: "NMP/mL", metodo: "SMEWW 9221", legislacao: "" },
  ],
};

export const TEMPLATES: Template[] = [refrigerante, aguaTratamento, cerveja, xaropeComposto];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
