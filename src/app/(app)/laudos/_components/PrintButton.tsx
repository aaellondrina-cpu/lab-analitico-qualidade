"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-petroleo px-3 py-2 text-xs font-medium text-white hover:bg-petroleo-dark"
    >
      Imprimir / PDF
    </button>
  );
}
