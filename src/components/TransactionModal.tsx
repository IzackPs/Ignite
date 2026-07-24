"use client";
import React from "react";

import { useState, useEffect, useMemo } from 'react';
import { AtivoCalculado } from "@/lib/calculator";
import { transacaoSchema } from "@/lib/validations";
import { Modal } from "@/components/ui/Modal";
import { AssetLogo } from "@/components/ui/AssetLogo";
import {
  TrendingUp,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TransactionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly ativo?: AtivoCalculado | null;
  readonly ativos?: AtivoCalculado[];
}

const EMPTY_ARRAY: AtivoCalculado[] = [];

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
  const [dataTransacao, setDataTransacao] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { maxDataHoje, dataOntem } = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const formatLocalDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      maxDataHoje: formatLocalDate(today),
      dataOntem: formatLocalDate(yesterday),
    };
  }, []);

  // Ativo Ativo Selecionado
  const activeAtivo = useMemo(() => {
    if (ativo) return ativo;
    return ativos.find((a) => a.id === selectedAtivoId) || null;
  }, [ativo, ativos, selectedAtivoId]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTipo("COMPRA");
      setDataTransacao(maxDataHoje);

      if (ativo) {
        setSelectedAtivoId(ativo.id);
        setPrecoUnitario(ativo.precoAtual || 0);
        setQuantidade(ativo.qtdAComprar > 0 ? ativo.qtdAComprar : "");
      } else if (ativos.length > 0) {
        setSelectedAtivoId(ativos[0].id);
        setPrecoUnitario(ativos[0].precoAtual || 0);
        setQuantidade(ativos[0].qtdAComprar > 0 ? ativos[0].qtdAComprar : "");
      } else {
        setSelectedAtivoId("");
        setPrecoUnitario("");
        setQuantidade("");
      }
    }
  }, [ativo, ativos, isOpen, maxDataHoje]);

  // Preenchimento automático ao mudar a seleção do ativo
  const handleSelectAtivoChange = (novoId: string) => {
    setSelectedAtivoId(novoId);
    const at = ativos.find((a) => a.id === novoId);
    if (at) {
      setPrecoUnitario(at.precoAtual || 0);
      setQuantidade(at.qtdAComprar > 0 ? at.qtdAComprar : "");
    }
  };

  // Cálculo do Total da Operação
  const totalOperacao = Number(quantidade || 0) * Number(precoUnitario || 0);

  // Recálculo do Novo Preço Médio e Posição Resultante
  const { novaQtd, novoPrecoMedio } = useMemo(() => {
    const qtdAtual = activeAtivo?.quantidadeAtual || 0;
    const pmAtual = activeAtivo?.precoMedio || 0;
    const totalInvestidoAtual = activeAtivo?.totalInvestido || 0;
    const qtdDigitada = Number(quantidade || 0);
    const precoDigitado = Number(precoUnitario || 0);

    if (tipo === "COMPRA") {
      const qResult = qtdAtual + qtdDigitada;
      if (qResult <= 0) return { novaQtd: 0, novoPrecoMedio: 0 };
      const novoTotalInv = totalInvestidoAtual + qtdDigitada * precoDigitado;
      return {
        novaQtd: qResult,
        novoPrecoMedio: novoTotalInv / qResult,
      };
    } else {
      // VENDA
      const qResult = Math.max(0, qtdAtual - qtdDigitada);
      // Venda reduz a posição sem alterar o Preço Médio remanescente
      return {
        novaQtd: qResult,
        novoPrecoMedio: qResult > 0 ? pmAtual : 0,
      };
    }
  }, [tipo, activeAtivo, quantidade, precoUnitario]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {activeAtivo && (
            <AssetLogo
              simbolo={activeAtivo.simbolo}
              logoUrl={activeAtivo.logoUrl}
              sizeClass="w-6 h-6 text-[10px]"
            />
          )}
          <span>Registrar Transação</span>
        </div> as any
      }
      description="Lance compras ou vendas para recalcular seu Preço Médio e patrimônio em tempo real."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Seletor do Tipo: COMPRA vs VENDA */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setTipo("COMPRA")}
              className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                tipo === "COMPRA"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Compra</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo("VENDA")}
              className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                tipo === "VENDA"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Venda</span>
            </button>
          </div>

          {/* Seleção do Ativo (exibe Somente Foto & Nome/Ticker) */}
          {!ativo && (
            <div className="space-y-1.5">
              <label htmlFor="ativoId" className="block text-xs font-bold text-zinc-300">
                Selecione o Ativo:
              </label>

              {/* Lista visual simplificada com foto e nome */}
              <div className="relative">
                <select
                  id="ativoId"
                  required
                  value={selectedAtivoId}
                  onChange={(e) => handleSelectAtivoChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-gold-main transition-colors appearance-none cursor-pointer"
                >
                  {ativos.map((a) => (
                    <option key={a.id} value={a.id} className="bg-zinc-900 text-white py-2">
                      {a.simbolo} — {a.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Badge Informativo do Ativo Selecionado */}
          {activeAtivo && (
            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AssetLogo
                  simbolo={activeAtivo.simbolo}
                  logoUrl={activeAtivo.logoUrl}
                  sizeClass="w-9 h-9 text-xs"
                />
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>{activeAtivo.simbolo}</span>
                    <span className="text-[10px] font-normal text-zinc-400">({activeAtivo.nome})</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Cotado a <strong className="text-gold-main font-bold">R$ {(activeAtivo.precoAtual || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block">Posição Atual</span>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  {activeAtivo.quantidadeAtual || 0} cotas
                </span>
                <span className="text-[10px] text-zinc-500 block font-mono">
                  PM R$ {(activeAtivo.precoMedio || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Seletor de Data Rápida */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <label htmlFor="dataTransacao" className="flex items-center gap-1 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-gold-main" /> Data da Operação:
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDataTransacao(maxDataHoje)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                    dataTransacao === maxDataHoje
                      ? "bg-gold-main text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDataTransacao(dataOntem)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                    dataTransacao === dataOntem
                      ? "bg-gold-main text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Ontem
                </button>
              </div>
            </div>

            <input
              id="dataTransacao"
              type="date"
              required
              max={maxDataHoje}
              value={dataTransacao}
              onChange={(e) => setDataTransacao(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-gold-main"
            />
          </div>

          {/* Quantidade e Preço Unitário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="quantidade" className="block text-xs font-bold text-zinc-300 mb-1">
                Quantidade *
              </label>
              <input
                id="quantidade"
                type="number"
                step="any"
                min="0.000001"
                required
                placeholder="Ex: 10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-gold-main"
              />
            </div>

            <div>
              <label htmlFor="precoUnitario" className="block text-xs font-bold text-zinc-300 mb-1">
                Preço Unitário (R$) *
              </label>
              <input
                id="precoUnitario"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ex: 35.50"
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-gold-main"
              />
            </div>
          </div>

          {/* Resumo Financeiro & Impacto na Posição */}
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 font-semibold">Total da Operação:</span>
              <span
                className={`font-black font-mono text-base ${
                  tipo === "COMPRA" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {tipo === "COMPRA" ? "-" : "+"} R${" "}
                {totalOperacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] pt-0.5">
              <div>
                <span className="text-zinc-500 block">Nova Quantidade</span>
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  <span className="text-zinc-500 line-through">
                    {activeAtivo?.quantidadeAtual || 0}
                  </span>
                  <span className="text-gold-main text-xs font-black">
                    {novaQtd}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block">Novo Preço Médio</span>
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  <span className="text-zinc-500 line-through">
                    R$ {(activeAtivo?.precoMedio || 0).toFixed(2)}
                  </span>
                  <span className="text-gold-main text-xs font-black">
                    R$ {(novoPrecoMedio || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé de Confirmação */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`font-bold text-xs px-5 py-2.5 rounded-xl text-white transition-all shadow-lg flex items-center gap-1.5 ${
                tipo === "COMPRA"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Registrando..." : `Confirmar ${tipo}`}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
