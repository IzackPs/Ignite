"use client";
import { logger } from '@/lib/logger';

import { useState } from 'react';
import { PortfolioCalculado, simularAporteGreedy } from "@/lib/calculator";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface SimuladorAporteBarProps {
  readonly portfolio: PortfolioCalculado;
  readonly onRefresh: () => void;
}

export function SimuladorAporteBar({
  portfolio,
  onRefresh,
}: SimuladorAporteBarProps) {
  const [valorAporte, setValorAporte] = useState<number>(2000);
  const [executingOrders, setExecutingOrders] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const resultadoSimulacao = simularAporteGreedy(
    portfolio.ativos,
    portfolio.patrimonioTotal,
    valorAporte
  );

  const handleExecutarCompras = async () => {
    if (resultadoSimulacao.itensCarrinho.length === 0) return;
    setConfirmOpen(false);

    setExecutingOrders(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Registrar cada transação de compra no backend
      for (const item of resultadoSimulacao.itensCarrinho) {
        const res = await fetch("/api/transacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ativoId: item.ativoId,
            tipo: "COMPRA",
            quantidade: item.qtdSimuladaComprar,
            precoUnitario: item.precoAtual,
            data: new Date().toISOString().split("T")[0],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Erro ao registrar compra de ${item.simbolo}`);
        }
      }

      setSuccessMessage(
        `🎉 ${resultadoSimulacao.itensCarrinho.length} ordens de compra executadas com sucesso!`
      );
      onRefresh();
      setIsExpanded(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      logger.error("Erro ao executar ordens de aporte:", err);
      setErrorMessage(err.message || "Erro ao registrar compras.");
    } finally {
      setExecutingOrders(false);
    }
  };

  // Encontrar defasagem atual dos ativos para exibir a melhoria
  const getAtivoDefasagem = (ativoId: string) => {
    const ativo = portfolio.ativos.find(a => a.id === ativoId);
    if (!ativo) return { atual: 0, ideal: 0, diff: 0, qtdAtual: 0, numeroMagico: 0 };
    return {
      atual: ativo.percentualAtual,
      ideal: ativo.percentualIdeal,
      diff: ativo.percentualAtual - ativo.percentualIdeal,
      numeroMagico: ativo.numeroMagico,
      qtdAtual: ativo.quantidadeAtual,
    };
  };

  return (
    <div className="bg-gradient-to-r from-surface via-[#1a1305] to-surface border border-gold-main/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 transition-all duration-300">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Título e Toggle */}
        <button 
          type="button"
          className="flex items-center gap-3 cursor-pointer group w-full lg:w-auto text-left focus:outline-none focus:ring-2 focus:ring-gold-main/50 rounded-xl p-1 -m-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="p-2.5 bg-gold-main/10 rounded-xl group-hover:bg-gold-main/20 transition-colors">
            <Zap className="w-5 h-5 text-gold-main" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 group-hover:text-gold-main transition-colors">
              Simular Aporte Inteligente
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </h2>
            {isExpanded && (
              <p className="text-xs text-zinc-400 mt-1 max-w-md hidden sm:block">
                Algoritmo Greedy Allocation: o sistema compra automaticamente os ativos mais defasados para reequilibrar a carteira.
              </p>
            )}
          </div>
        </button>

        {/* Lado Direito: Input e Botões */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-gold-main">
              R$
            </span>
            <label htmlFor="valorAporte" className="sr-only">Valor do Aporte</label>
            <input
              id="valorAporte"
              type="number"
              step="100"
              min="0"
              placeholder="Ex: 2000"
              value={valorAporte || ""}
              onChange={(e) => {
                setValorAporte(Number(e.target.value));
                if (!isExpanded && Number(e.target.value) > 0) setIsExpanded(true);
              }}
              className="w-full sm:w-44 bg-zinc-950 border border-gold-main/50 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-gold-main focus:ring-2 focus:ring-gold-main/20 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {[500, 1000, 2000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setValorAporte(preset);
                  setIsExpanded(true);
                }}
                className={`text-[11px] font-mono font-bold px-2.5 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  valorAporte === preset
                    ? "bg-gold-main text-white border-gold-main shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                +{preset}
              </button>
            ))}
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/30 whitespace-nowrap"
              >
                Simular
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-4 rounded-xl flex items-center justify-between font-semibold animate-in fade-in">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-xl flex items-center justify-between font-semibold animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {successMessage}
          </span>
        </div>
      )}

      {/* Resultado da Simulação: Carrinho de Compras (Mostrado apenas se expandido) */}
      {isExpanded && valorAporte > 0 && (
        <div className="space-y-4 pt-4 border-t border-border-subtle animate-in slide-in-from-top-4 duration-300">
          
          {/* Header do Resumo Financeiro do Aporte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-border-subtle flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total a Investir:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatCurrency(resultadoSimulacao.totalGasto)}
              </span>
            </div>

            <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-border-subtle flex items-center justify-between">
              <span className="text-xs text-zinc-400">Sobra / Troco:</span>
              <span className="font-mono text-base font-bold text-zinc-300">
                {formatCurrency(resultadoSimulacao.sobraTroco)}
              </span>
            </div>

            <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-border-subtle flex items-center justify-between">
              <span className="text-xs text-zinc-400">Ativos Selecionados:</span>
              <span className="font-mono text-base font-bold text-gold-main">
                {resultadoSimulacao.itensCarrinho.length} ativos
              </span>
            </div>
          </div>

          {/* Carrinho de Compras Detalhado */}
          <div className="bg-zinc-950 border border-border-subtle rounded-xl overflow-hidden shadow-inner">
            <div className="p-4 bg-zinc-900/80 border-b border-border-subtle flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Carrinho de Compras</h3>
            </div>
            
            <div className="divide-y divide-zinc-800/80">
              {resultadoSimulacao.itensCarrinho.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  O orçamento de {formatCurrency(valorAporte)} é insuficiente para comprar unidades inteiras dos ativos defasados.
                </div>
              ) : (
                resultadoSimulacao.itensCarrinho.map((item) => {
                  const defasagem = getAtivoDefasagem(item.ativoId);
                  if (!defasagem) return null;

                  // Cálculo simples da nova defasagem aproximada para mostrar melhoria
                  const valorMercadoSimulado = (defasagem.qtdAtual + item.qtdSimuladaComprar) * item.precoAtual;
                  const patrimonioSimulado = portfolio.patrimonioTotal + resultadoSimulacao.totalGasto;
                  const novaAlocacao = (valorMercadoSimulado / patrimonioSimulado) * 100;
                  const novaDefasagem = novaAlocacao - defasagem.ideal;
                  
                  // Verifica impacto no número mágico (para FIIs)
                  const isFii = item.classe === "FIIS";
                  const qtdPosCompra = defasagem.qtdAtual + item.qtdSimuladaComprar;
                  const atingiuMagico = isFii && defasagem.numeroMagico > 0 && qtdPosCompra >= defasagem.numeroMagico;

                  return (
                    <div key={item.ativoId} className="p-4 hover:bg-zinc-900/40 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Ativo Info */}
                      <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center font-bold text-white border border-zinc-700">
                          {item.simbolo.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-xs">
                              {item.simbolo}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{item.classe}</span>
                          </div>
                          <div className="text-xs text-zinc-500 truncate mt-0.5 max-w-[200px]">{item.nome}</div>
                        </div>
                      </div>

                      {/* Matemática de Compra */}
                      <div className="col-span-1 md:col-span-4 flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2 text-sm font-mono">
                          <span className="text-zinc-400">{formatCurrency(item.precoAtual)}</span>
                          <span className="text-zinc-600">×</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {item.qtdSimuladaComprar} cotas
                          </span>
                          <span className="text-zinc-600">=</span>
                          <span className="font-bold text-white">{formatCurrency(item.valorTotalAporteAtivo)}</span>
                        </div>
                        
                        {/* Indicador de Número Mágico */}
                        {isFii && defasagem.numeroMagico > 0 && (
                          <div className={`text-[10px] flex items-center gap-1 mt-1 ${atingiuMagico ? "text-emerald-400" : "text-purple-400"}`}>
                            <Zap className="w-3 h-3" />
                            {atingiuMagico 
                              ? `Nº Mágico Atingido! (${qtdPosCompra}/${defasagem.numeroMagico})` 
                              : `Rumo ao Nº Mágico: ${qtdPosCompra}/${defasagem.numeroMagico} cotas`}
                          </div>
                        )}
                      </div>

                      {/* Impacto de Defasagem */}
                      <div className="col-span-1 md:col-span-4 flex flex-col items-start md:items-end justify-center">
                        <div className="text-[11px] text-zinc-400 mb-1">Impacto na Alocação</div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-amber-400">{defasagem.diff.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-zinc-600" />
                          <span className={`${Math.abs(novaDefasagem) <= 1 ? "text-emerald-400 font-bold" : "text-amber-200"}`}>
                            {novaDefasagem > 0 ? "+" : ""}{novaDefasagem.toFixed(1)}%
                          </span>
                        </div>
                        {Math.abs(novaDefasagem) <= 1 && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded mt-1 border border-emerald-500/20">META ATINGIDA</span>
                        )}
                      </div>
                      
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botão de Executar Ordem de Compras */}
          {resultadoSimulacao.itensCarrinho.length > 0 && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={executingOrders}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {executingOrders
                  ? "Executando Ordens..."
                  : `Confirmar Compras (${formatCurrency(
                      resultadoSimulacao.totalGasto
                    )})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação das Compras do Simulador */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleExecutarCompras}
        title="Confirmar Ordens de Compra"
        description={`Deseja realmente registrar a compra de ${resultadoSimulacao.itensCarrinho.length} ativo(s) totalizando ${formatCurrency(resultadoSimulacao.totalGasto)} na sua carteira?`}
        confirmText="Confirmar Compras"
        variant="emerald"
        loading={executingOrders}
      />
    </div>
  );
}
