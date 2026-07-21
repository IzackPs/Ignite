"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { Modal } from "@/components/ui/Modal";

interface DividendModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly ativos: AtivoCalculado[];
}

export function DividendModal({
  isOpen,
  onClose,
  onSave,
  ativos,
}: DividendModalProps) {
  const [ativoId, setAtivoId] = useState("");
  const [tipo, setTipo] = useState("RENDIMENTO");
  const [valorTotal, setValorTotal] = useState<number | "">("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAtivo = useMemo(() => {
    return ativos.find((a) => a.id === ativoId) || null;
  }, [ativos, ativoId]);

  useEffect(() => {
    if (ativos && ativos.length > 0 && !ativoId) {
      setAtivoId(ativos[0].id);
    }
    setError(null);
  }, [ativos, isOpen, ativoId]);

  // Auto-detect type when asset changes
  useEffect(() => {
    if (activeAtivo) {
      if (activeAtivo.classe === "FIIS") {
        setTipo("RENDIMENTO");
      } else {
        setTipo("DIVIDENDO");
      }
    }
  }, [activeAtivo]);

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

  const estimatedDY = useMemo(() => {
    if (!valorTotal || !activeAtivo || activeAtivo.valorMercado <= 0) return 0;
    return (Number(valorTotal) / activeAtivo.valorMercado) * 100;
  }, [valorTotal, activeAtivo]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Recebimento de Provento"
      description="Adicione o valor total do dividendo/rendimento creditado na sua conta."
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm mt-4">
        <div>
          <label htmlFor="ativoId" className="block text-xs font-semibold text-zinc-300 mb-1">
            Ativo *
          </label>
          <select
            id="ativoId"
            required
            value={ativoId}
            onChange={(e) => setAtivoId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main font-mono"
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
            <label htmlFor="tipo" className="block text-xs font-semibold text-zinc-300 mb-1">
              Tipo de Provento *
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main"
            >
              <option value="RENDIMENTO">Rendimento (FII)</option>
              <option value="DIVIDENDO">Dividendo (Ação/ETF)</option>
              <option value="JCP">JCP (Juros s/ Capital)</option>
            </select>
          </div>

          <div>
            <label htmlFor="data" className="block text-xs font-semibold text-zinc-300 mb-1">
              Data do Pagamento *
            </label>
            <input
              id="data"
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main"
            />
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
          <label htmlFor="valorTotal" className="block text-xs font-semibold text-zinc-300 mb-2">
            Valor Total Recebido (R$) *
          </label>
          <input
            id="valorTotal"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="Ex: 45.00"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-3 text-white font-mono text-xl font-bold focus:outline-none focus:border-gold-main mb-2"
          />
          
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">DY Mensal Estimado:</span>
            <span className={`font-bold ${estimatedDY > 0 ? "text-emerald-400" : "text-zinc-500"}`}>
              {estimatedDY.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 transition-colors"
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
    </Modal>
  );
}
