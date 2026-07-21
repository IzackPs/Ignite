"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { transacaoSchema } from "@/lib/validations";
import { Modal } from "@/components/ui/Modal";

interface TransactionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly ativo?: AtivoCalculado | null;
  readonly ativos?: AtivoCalculado[];
}

const EMPTY_ARRAY: any[] = [];

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  ativo,
  ativos = EMPTY_ARRAY,
}: TransactionModalProps) {
  const [tipo, setTipo] = useState<"COMPRA" | "VENDA">("COMPRA");
  const [selectedAtivoId, setSelectedAtivoId] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [precoUnitario, setPrecoUnitario] = useState<number | "">("");
  const [dataTransacao, setDataTransacao] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state for combobox
  const [searchQuery, setSearchQuery] = useState("");

  const maxDataHoje = new Date().toISOString().split("T")[0];

  // Derived state for the active asset being transacted
  const activeAtivo = useMemo(() => {
    if (ativo) return ativo;
    return ativos.find((a) => a.id === selectedAtivoId) || null;
  }, [ativo, ativos, selectedAtivoId]);

  // Derived state for filtered assets in combobox
  const filteredAtivos = useMemo(() => {
    if (!searchQuery) return ativos;
    const lowerQuery = searchQuery.toLowerCase();
    return ativos.filter(
      (a) =>
        a.simbolo.toLowerCase().includes(lowerQuery) ||
        a.nome.toLowerCase().includes(lowerQuery)
    );
  }, [ativos, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      if (ativo) {
        setPrecoUnitario(ativo.precoAtual || 0);
        setQuantidade(ativo.qtdAComprar > 0 ? ativo.qtdAComprar : "");
        setSelectedAtivoId(ativo.id);
      } else if (ativos.length > 0) {
        setSelectedAtivoId(ativos[0].id);
        setPrecoUnitario(ativos[0].precoAtual || 0);
        setQuantidade(ativos[0].qtdAComprar > 0 ? ativos[0].qtdAComprar : "");
      } else {
        setSelectedAtivoId("");
        setPrecoUnitario("");
        setQuantidade("");
      }
      setError(null);
      setSearchQuery("");
      setTipo("COMPRA");
    }
  }, [ativo, ativos, isOpen]);

  // Auto-fill price when activeAtivo changes from combobox
  useEffect(() => {
    if (!ativo && activeAtivo && isOpen) {
      setPrecoUnitario(activeAtivo.precoAtual || 0);
      setQuantidade(activeAtivo.qtdAComprar > 0 ? activeAtivo.qtdAComprar : "");
    }
  }, [activeAtivo, ativo, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAtivo) {
      setError("Selecione um ativo válido para registrar a transação.");
      return;
    }

    const payload = {
      ativoId: activeAtivo.id,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-xs uppercase font-semibold text-gold-main font-mono">
            {activeAtivo ? activeAtivo.simbolo : "NOVA TRANSAÇÃO"}
          </span>
          <span>Registrar Transação {activeAtivo ? `(${activeAtivo.simbolo})` : ""}</span>
        </div> as any
      }
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Tipo Compra / Venda */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl">
          <button
            type="button"
            onClick={() => setTipo("COMPRA")}
            className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              tipo === "COMPRA"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
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
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Venda
          </button>
        </div>

        {/* Seleção de Ativo (Combobox) caso não seja passado um ativo específico */}
        {!ativo && (
          <div className="space-y-2">
            <label htmlFor="ativoId" className="block text-xs font-semibold text-zinc-300">
              Ativo *
            </label>
            <input 
              type="text" 
              placeholder="🔍 Buscar ticker (ex: PETR4)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main text-xs mb-1"
            />
            <select
              id="ativoId"
              required
              size={filteredAtivos.length > 0 ? Math.min(4, filteredAtivos.length) : 1}
              value={selectedAtivoId}
              onChange={(e) => setSelectedAtivoId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main font-mono text-sm scrollbar-thin scrollbar-thumb-zinc-700"
            >
              {filteredAtivos.map((a) => (
                <option key={a.id} value={a.id} className="py-1">
                  {a.simbolo} — {a.nome} (PM: R$ {a.precoMedio.toFixed(2)})
                </option>
              ))}
              {filteredAtivos.length === 0 && (
                <option value="" disabled>Nenhum ativo encontrado</option>
              )}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="dataTransacao" className="block text-xs font-semibold text-zinc-300 mb-1">
            Data da Operação
          </label>
          <input
            id="dataTransacao"
            type="date"
            required
            max={maxDataHoje}
            value={dataTransacao}
            onChange={(e) => setDataTransacao(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="quantidade" className="block text-xs font-semibold text-zinc-300 mb-1">
              Quantidade *
            </label>
            <input
              id="quantidade"
              type="number"
              step="any"
              min="0.000001"
              required
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-gold-main"
            />
          </div>

          <div>
            <label htmlFor="precoUnitario" className="block text-xs font-semibold text-zinc-300 mb-1">
              Preço Unitário (R$) *
            </label>
            <input
              id="precoUnitario"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={precoUnitario}
              onChange={(e) => setPrecoUnitario(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-gold-main"
            />
          </div>
        </div>

        {/* Resumo e Preview de Impacto */}
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/80 space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm pb-3 border-b border-zinc-800">
            <span className="text-zinc-400">Total da Operação:</span>
            <span className={`font-bold font-mono text-base ${tipo === "COMPRA" ? "text-emerald-400" : "text-rose-400"}`}>
              {tipo === "COMPRA" ? "-" : "+"} R$ {totalOperacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Preview de Impacto</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-0.5">Nova Quantidade:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-zinc-500 line-through">{activeAtivo?.quantidadeAtual || 0}</span>
                  <span className="text-gold-main font-bold">
                    {tipo === "COMPRA" 
                      ? (activeAtivo?.quantidadeAtual || 0) + Number(quantidade || 0)
                      : Math.max(0, (activeAtivo?.quantidadeAtual || 0) - Number(quantidade || 0))}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Novo Preço Médio:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-zinc-500 line-through">
                    R$ {(activeAtivo?.precoMedio || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-gold-main font-bold">
                    R$ {
                      tipo === "COMPRA" 
                        ? ((activeAtivo?.quantidadeAtual || 0) + Number(quantidade || 0) > 0 
                            ? ((activeAtivo?.totalInvestido || 0) + totalOperacao) / ((activeAtivo?.quantidadeAtual || 0) + Number(quantidade || 0))
                            : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                        : (activeAtivo?.precoMedio || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2">
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
    </Modal>
  );
}
