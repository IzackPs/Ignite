"use client";

import React, { useState, useEffect } from "react";
import { ResumoClasse } from "@/lib/calculator";
import { X, Save, AlertCircle } from "lucide-react";

interface ClassGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  resumoClasses: ResumoClasse[];
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-white">
            Configurar Metas de Alocação (%)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajuste a distribuição ideal da sua carteira pelas 4 grandes classes.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Ações */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-blue-400 block">
                  📈 Ações
                </label>
                <span className="text-[10px] text-slate-400">Meta Ideal (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={metas.ACOES ?? 40}
                  onChange={(e) => handleChangeMeta("ACOES", Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* FIIs */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-purple-400 block">
                  🏢 FIIs (Fundos Imobiliários)
                </label>
                <span className="text-[10px] text-slate-400">Meta Ideal (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={metas.FIIS ?? 10}
                  onChange={(e) => handleChangeMeta("FIIS", Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* ETFs */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-amber-400 block">
                  🌐 ETFs
                </label>
                <span className="text-[10px] text-slate-400">Meta Ideal (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={metas.ETFS ?? 10}
                  onChange={(e) => handleChangeMeta("ETFS", Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Renda Fixa */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-emerald-400 block">
                  💰 Renda Fixa
                </label>
                <span className="text-[10px] text-slate-400">Meta Ideal (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={metas.RENDA_FIXA ?? 40}
                  onChange={(e) => handleChangeMeta("RENDA_FIXA", Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>
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
      </div>
    </div>
  );
}
