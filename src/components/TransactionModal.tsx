"use client";

import React, { useState, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { X } from "lucide-react";
import { transacaoSchema } from "@/lib/validations";

interface TransactionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly ativo?: AtivoCalculado | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  ativo,
}: TransactionModalProps) {
  const [tipo, setTipo] = useState<"COMPRA" | "VENDA">("COMPRA");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [precoUnitario, setPrecoUnitario] = useState<number>(0);
  const [dataTransacao, setDataTransacao] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDataHoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (ativo) {
      setPrecoUnitario(ativo.precoAtual || 0);
      setQuantidade(ativo.qtdAComprar > 0 ? ativo.qtdAComprar : 1);
    }
    setError(null);
  }, [ativo, isOpen]);

  if (!isOpen || !ativo) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ativo) {
      setError("Selecione um ativo válido para registrar a transação.");
      return;
    }

    const payload = {
      ativoId: ativo.id,
      tipo,
      quantidade: Number(quantidade),
      precoUnitario: Number(precoUnitario),
      data: dataTransacao,
    };

    const validation = transacaoSchema.safeParse(payload);
    if (!validation.success) {
      const msg = validation.error.issues[0]?.message || "Preencha todos os campos corretamente.";
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar transação");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalOperacao = Number(quantidade || 0) * Number(precoUnitario || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs uppercase font-semibold text-blue-400 font-mono">
            {ativo.simbolo}
          </span>
          <h3 className="text-xl font-bold text-white">
            Registrar Transação ({ativo.simbolo})
          </h3>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Tipo Compra / Venda */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTipo("COMPRA")}
              className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                tipo === "COMPRA"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setTipo("VENDA")}
              className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                tipo === "VENDA"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Venda
            </button>
          </div>

          <div>
            <label htmlFor="dataTransacao" className="block text-xs font-semibold text-slate-300 mb-1">
              Data da Operação
            </label>
            <input
              id="dataTransacao"
              type="date"
              required
              max={maxDataHoje}
              value={dataTransacao}
              onChange={(e) => setDataTransacao(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quantidade" className="block text-xs font-semibold text-slate-300 mb-1">
                Quantidade *
              </label>
              <input
                id="quantidade"
                type="number"
                step="any"
                min="0.000001"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="precoUnitario" className="block text-xs font-semibold text-slate-300 mb-1">
                Preço Unitário (R$) *
              </label>
              <input
                id="precoUnitario"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Resumo da Operação */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total da Operação:</span>
            <span className="font-bold text-white text-sm font-mono">
              R$ {totalOperacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
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
              className={`font-semibold px-4 py-2 rounded-lg text-white transition-colors shadow-md ${
                tipo === "COMPRA"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
              }`}
            >
              {loading ? "Registrando..." : `Confirmar ${tipo}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
