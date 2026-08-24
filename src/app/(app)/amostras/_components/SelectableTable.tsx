"use client";

import { useState } from "react";

interface SelectableTableProps {
  items: Array<{ id: string; [key: string]: any }>;
  columns: Array<{ key: string; label: string }>;
  onDeleteSelected: (ids: string[]) => Promise<void>;
  renderRow: (item: any, isSelected: boolean, onToggle: () => void) => React.ReactNode;
}

export function SelectableTable({
  items,
  columns,
  onDeleteSelected,
  renderRow,
}: SelectableTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Deletar ${selected.size} item(s)?`)) return;
    setDeleting(true);
    try {
      await onDeleteSelected(Array.from(selected));
      setSelected(new Set());
      window.location.reload();
    } catch (error) {
      alert("Erro ao deletar: " + String(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
          <span className="text-sm text-amber-800 font-medium">
            {selected.size} selecionado(s)
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {deleting ? "Deletando..." : "Deletar Selecionados"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className={selected.has(item.id) ? "bg-amber-50" : "hover:bg-slate-50"}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleOne(item.id)}
                    className="rounded"
                  />
                </td>
                {renderRow(item, selected.has(item.id), () => toggleOne(item.id))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
