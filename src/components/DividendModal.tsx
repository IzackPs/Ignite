"use client";

import React, { useState, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { X } from "lucide-react";

interface DividendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  ativos: AtivoCalculado[];
}

export function DividendModal({
  isOpen,
  onClose,
  onSave,
  ativos,
}: DividendModalProps) {
  const [ativoId, setAtivoId] = useState("");
  const [tipo, setTipo] = useState("RENDIMENTO");
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ativos && ativos.length > 0 && !ativoId) {
      setAtivoId(ativos[0].id);
    }
    setError(null);
  }, [ativos, isOpen, ativoId]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/proventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ativoId,
          tipo,
          valorTotal: Number(valorTotal),
          data,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Erro ao registrar provento");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
            Registrar Recebimento de Provento
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione o valor total do dividendo/rendimento creditado na sua conta.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ativo *
            </label>
            <select
              required
              value={ativoId}
              onChange={(e) => setAtivoId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              {ativos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.simbolo} - {a.nome} ({a.classe})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Provento *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="RENDIMENTO">Rendimento (FII)</option>
                <option value="DIVIDENDO">Dividendo (Ação/ETF)</option>
                <option value="JCP">JCP (Juros s/ Capital)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Pagamento *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor Total Recebido (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Ex: 45.00"
              value={valorTotal || ""}
              onChange={(e) => setValorTotal(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-emerald-600/20"
            >
              {loading ? "Registrando..." : "Confirmar Recebimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
