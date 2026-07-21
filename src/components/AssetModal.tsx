"use client";

import React, { useState, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { Modal } from "@/components/ui/Modal";

interface AssetModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly initialClasse?: string;
  readonly editingAtivo?: AtivoCalculado | null;
}

interface AutoSearchState {
  readonly nome: string;
  readonly precoAtual: number;
  readonly setor: string;
  readonly logoUrl: string;
}

interface AutoSearchSetters {
  readonly setIsSearching: (v: boolean) => void;
  readonly setNome: (v: string) => void;
  readonly setPrecoAtual: (v: number) => void;
  readonly setClasse: (v: string) => void;
  readonly setSetor: (v: string) => void;
  readonly setLogoUrl: (v: string) => void;
}

async function autoSearchAsset(
  ticker: string,
  current: AutoSearchState,
  setters: AutoSearchSetters
) {
  setters.setIsSearching(true);
  try {
    const res = await fetch(`/api/ativos/search?ticker=${encodeURIComponent(ticker)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.nome && !current.nome) setters.setNome(data.nome);
    if (data.precoAtual && !current.precoAtual) setters.setPrecoAtual(data.precoAtual);
    if (data.classe) setters.setClasse(data.classe);
    if (data.setor && !current.setor) setters.setSetor(data.setor);
    if (data.logoUrl && !current.logoUrl) setters.setLogoUrl(data.logoUrl);
  } catch {
    // Ignore silent errors during auto-typing
  } finally {
    setters.setIsSearching(false);
  }
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
  const [logoUrl, setLogoUrl] = useState("");
  const [percentualIdeal, setPercentualIdeal] = useState(0);
  const [precoAtual, setPrecoAtual] = useState(0);
  const [ultimoProvento, setUltimoProvento] = useState<number | string>("");
  const [taxaRentabilidade, setTaxaRentabilidade] = useState(100);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAtivo) {
      setSimbolo(editingAtivo.simbolo);
      setNome(editingAtivo.nome);
      setClasse(editingAtivo.classe);
      setSetor(editingAtivo.setor || "");
      setLogoUrl(editingAtivo.logoUrl || "");
      setPercentualIdeal(editingAtivo.percentualIdeal);
      setPrecoAtual(editingAtivo.precoAtual);
      setUltimoProvento(editingAtivo.ultimoProvento || 0);
      setTaxaRentabilidade(editingAtivo.taxaRentabilidade || 100);
    } else {
      setSimbolo("");
      setNome("");
      setClasse(initialClasse);
      setSetor("");
      setLogoUrl("");
      setPercentualIdeal(0);
      setPrecoAtual(0);
      setUltimoProvento("");
      setTaxaRentabilidade(100);
    }
    setError(null);
  }, [editingAtivo, initialClasse, isOpen]);

  useEffect(() => {
    if (!simbolo || simbolo.length < 4) return;
    if (editingAtivo && editingAtivo.simbolo === simbolo) return;

    const timer = setTimeout(() => {
      autoSearchAsset(
        simbolo,
        { nome, precoAtual, setor, logoUrl },
        { setIsSearching, setNome, setPrecoAtual, setClasse, setSetor, setLogoUrl }
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [simbolo, editingAtivo, nome, precoAtual, logoUrl, setor]);

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
          logoUrl,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAtivo ? `Editar Ativo (${editingAtivo.simbolo})` : "Adicionar Novo Ativo"}
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label htmlFor="simbolo" className="block text-xs font-semibold text-zinc-300 mb-1">
            Ticker / Símbolo *
          </label>
          <div className="relative">
            <input
              id="simbolo"
              type="text"
              required
              placeholder="Ex: CDB-NUBANK-100CDI, PETR4, HGLG11"
              value={simbolo}
              onChange={(e) => setSimbolo(e.target.value.toUpperCase())}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-20 py-2 text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-gold-main"
            />
            {logoUrl && (
              <div className="absolute left-2.5 top-2.5 w-5 h-5 rounded-full bg-white overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt={simbolo} className="w-full h-full object-contain" />
              </div>
            )}
            {isSearching && (
              <div className="absolute right-3 top-2.5 text-zinc-500 text-xs font-semibold animate-pulse">
                Buscando...
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="nome" className="block text-xs font-semibold text-zinc-300 mb-1">
            Nome do Ativo *
          </label>
          <input
            id="nome"
            type="text"
            required
            placeholder="Ex: CDB Nubank 120% CDI"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-gold-main"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="classe" className="block text-xs font-semibold text-zinc-300 mb-1">
              Classe *
            </label>
            <select
              id="classe"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main"
            >
              <option value="ACOES">Ações</option>
              <option value="FIIS">FIIs (Fundos Imobiliários)</option>
              <option value="ETFS">ETFs</option>
              <option value="RENDA_FIXA">Renda Fixa</option>
            </select>
          </div>

          <div>
            <label htmlFor="setor" className="block text-xs font-semibold text-zinc-300 mb-1">
              Setor / Emissor
            </label>
            <input
              id="setor"
              type="text"
              placeholder="Ex: Bancário, Governo"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-gold-main"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="percentualIdeal" className="block text-xs font-semibold text-zinc-300 mb-1">
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-gold-main"
            />
          </div>

          <div>
            <label htmlFor="precoAtual" className="block text-xs font-semibold text-zinc-300 mb-1">
              Preço Base (R$)
            </label>
            <input
              id="precoAtual"
              type="number"
              step="0.01"
              min="0"
              value={precoAtual}
              onChange={(e) => setPrecoAtual(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-gold-main"
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
                className="w-full bg-zinc-900 border border-emerald-500/50 rounded-lg px-2.5 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="ultimoProvento" className="block text-xs font-semibold text-zinc-300 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                Provento <span className="text-zinc-500 font-normal">(Opcional)</span>
              </label>
              <input
                id="ultimoProvento"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 1.10"
                value={ultimoProvento}
                onChange={(e) => setUltimoProvento(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-gold-main"
              />
            </div>
          )}
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
            className="bg-gold-main hover:bg-gold-main text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-gold-main/20"
          >
            {loading ? "Salvando..." : "Salvar Ativo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
