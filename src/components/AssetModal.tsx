"use client";

import React, { useState, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { X } from "lucide-react";

interface AssetModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly initialClasse?: string;
  readonly editingAtivo?: AtivoCalculado | null;
}

export function AssetModal({
  isOpen,
  onClose,
  onSave,
  initialClasse = "ACOES",
  editingAtivo,
}: AssetModalProps) {
  const [simbolo, setSimbolo] = useState("");
  const [nome, setNome] = useState("");
  const [classe, setClasse] = useState("ACOES");
  const [setor, setSetor] = useState("");
  const [percentualIdeal, setPercentualIdeal] = useState(0);
  const [precoAtual, setPrecoAtual] = useState(0);
  const [ultimoProvento, setUltimoProvento] = useState(0);
  const [taxaRentabilidade, setTaxaRentabilidade] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAtivo) {
      setSimbolo(editingAtivo.simbolo);
      setNome(editingAtivo.nome);
      setClasse(editingAtivo.classe);
      setSetor(editingAtivo.setor || "");
      setPercentualIdeal(editingAtivo.percentualIdeal);
      setPrecoAtual(editingAtivo.precoAtual);
      setUltimoProvento(editingAtivo.ultimoProvento || 0);
      setTaxaRentabilidade(editingAtivo.taxaRentabilidade || 100);
    } else {
      setSimbolo("");
      setNome("");
      setClasse(initialClasse);
      setSetor("");
      setPercentualIdeal(0);
      setPrecoAtual(0);
      setUltimoProvento(0);
      setTaxaRentabilidade(100);
    }
    setError(null);
  }, [editingAtivo, initialClasse, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ativos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAtivo?.id,
          simbolo,
          nome,
          classe,
          setor,
          percentualIdeal: Number(percentualIdeal),
          precoAtual: Number(precoAtual),
          ultimoProvento: Number(ultimoProvento),
          taxaRentabilidade: Number(taxaRentabilidade),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar ativo");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isRendaFixa = classe === "RENDA_FIXA";

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

        <h3 className="text-xl font-bold text-white">
          {editingAtivo ? `Editar Ativo (${editingAtivo.simbolo})` : "Adicionar Novo Ativo"}
        </h3>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="simbolo" className="block text-xs font-semibold text-slate-300 mb-1">
              Ticker / Símbolo *
            </label>
            <input
              id="simbolo"
              type="text"
              required
              placeholder="Ex: CDB-NUBANK-100CDI, PETR4, HGLG11"
              value={simbolo}
              onChange={(e) => setSimbolo(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="nome" className="block text-xs font-semibold text-slate-300 mb-1">
              Nome do Ativo *
            </label>
            <input
              id="nome"
              type="text"
              required
              placeholder="Ex: CDB Nubank 120% CDI"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="classe" className="block text-xs font-semibold text-slate-300 mb-1">
                Classe *
              </label>
              <select
                id="classe"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ACOES">Ações</option>
                <option value="FIIS">FIIs (Fundos Imobiliários)</option>
                <option value="ETFS">ETFs</option>
                <option value="RENDA_FIXA">Renda Fixa</option>
              </select>
            </div>

            <div>
              <label htmlFor="setor" className="block text-xs font-semibold text-slate-300 mb-1">
                Setor / Emissor
              </label>
              <input
                id="setor"
                type="text"
                placeholder="Ex: Bancário, Governo"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="percentualIdeal" className="block text-xs font-semibold text-slate-300 mb-1">
                % Ideal
              </label>
              <input
                id="percentualIdeal"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={percentualIdeal}
                onChange={(e) => setPercentualIdeal(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="precoAtual" className="block text-xs font-semibold text-slate-300 mb-1">
                Preço Base (R$)
              </label>
              <input
                id="precoAtual"
                type="number"
                step="0.01"
                min="0"
                value={precoAtual}
                onChange={(e) => setPrecoAtual(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {isRendaFixa ? (
              <div>
                <label htmlFor="taxaRentabilidade" className="block text-xs font-semibold text-emerald-400 mb-1">
                  % do CDI
                </label>
                <input
                  id="taxaRentabilidade"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Ex: 120"
                  value={taxaRentabilidade}
                  onChange={(e) => setTaxaRentabilidade(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-2.5 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="ultimoProvento" className="block text-xs font-semibold text-slate-300 mb-1">
                  Provento (R$)
                </label>
                <input
                  id="ultimoProvento"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 1.10"
                  value={ultimoProvento}
                  onChange={(e) => setUltimoProvento(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
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
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-blue-600/20"
            >
              {loading ? "Salvando..." : "Salvar Ativo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
