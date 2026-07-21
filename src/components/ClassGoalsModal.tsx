"use client";

import React, { useState, useEffect } from "react";
import { ResumoClasse } from "@/lib/calculator";
import { Save, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ClassGoalsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly resumoClasses: ResumoClasse[];
}

export function ClassGoalsModal({
  isOpen,
  onClose,
  onSave,
  resumoClasses,
}: ClassGoalsModalProps) {
  const [metas, setMetas] = useState<Record<string, number>>({
    ACOES: 40,
    FIIS: 10,
    ETFS: 10,
    RENDA_FIXA: 40,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resumoClasses && resumoClasses.length > 0) {
      const initialMap: Record<string, number> = {};
      resumoClasses.forEach((r) => {
        initialMap[r.classe] = r.metaPercentual;
      });
      setMetas(initialMap);
    }
  }, [resumoClasses, isOpen]);

  if (!isOpen) return null;

  const somaMetas = Object.values(metas).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const isValidSoma = Math.abs(somaMetas - 100) < 0.01;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidSoma) {
      setError(`A soma das metas precisa ser exatamente 100%. Soma atual: ${somaMetas}%`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/metas-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metas }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar metas");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChangeMeta = (classeKey: string, val: number) => {
    setMetas((prev) => ({
      ...prev,
      [classeKey]: val,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Metas de Alocação (%)"
      description="Ajuste a distribuição ideal da sua carteira pelas 4 grandes classes."
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lista de Metas */}
        <div className="space-y-3">
          {(
            [
              { key: "ACOES", label: "📈 Ações", color: "text-blue-400", defaultVal: 40 },
              { key: "FIIS", label: "🏢 FIIs (Fundos Imobiliários)", color: "text-purple-400", defaultVal: 10 },
              { key: "ETFS", label: "🌐 ETFs", color: "text-amber-400", defaultVal: 10 },
              { key: "RENDA_FIXA", label: "💰 Renda Fixa", color: "text-emerald-400", defaultVal: 40 },
            ] as const
          ).map(({ key, label, color, defaultVal }) => (
            <div key={key} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <label htmlFor={`meta${key}`} className={`text-xs font-bold ${color} block`}>
                  {label}
                </label>
                <span className="text-[10px] text-slate-400">Meta Ideal (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  id={`meta${key}`}
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={metas[key] ?? defaultVal}
                  onChange={(e) => handleChangeMeta(key, Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Validador de Soma */}
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            isValidSoma
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          <span>Total da Distribuição:</span>
          <span className="font-mono text-sm font-bold">{somaMetas}% / 100%</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !isValidSoma}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {loading ? "Salvar..." : "Salvar Metas"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
