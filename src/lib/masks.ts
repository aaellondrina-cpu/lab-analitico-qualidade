// Máscaras puras — clientes e servers podem usar.
// Sempre retornam só dígitos limitados + formatação.

function digits(v: string, max: number): string {
  return v.replace(/\D/g, "").slice(0, max);
}

export function maskCNPJ(v: string): string {
  const d = digits(v, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function maskCPF(v: string): string {
  const d = digits(v, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskTelefone(v: string): string {
  const d = digits(v, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  // celular (11 dígitos) → (XX) X XXXX-XXXX  | fixo (10) → (XX) XXXX-XXXX
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function maskCEP(v: string): string {
  const d = digits(v, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export type MaskKind = "cnpj" | "cpf" | "telefone" | "cep";

export function applyMask(kind: MaskKind, v: string): string {
  switch (kind) {
    case "cnpj":
      return maskCNPJ(v);
    case "cpf":
      return maskCPF(v);
    case "telefone":
      return maskTelefone(v);
    case "cep":
      return maskCEP(v);
  }
}
