"use client";

import React, { useState } from "react";
import { PortfolioCalculado, simularAporteGreedy } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ShoppingCart,
  CheckCircle2,
  Zap,
} from "lucide-react";

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

  const resultadoSimulacao = simularAporteGreedy(
    portfolio.ativos,
    portfolio.patrimonioTotal,
    valorAporte
  );

  const handleExecutarCompras = async () => {
    if (resultadoSimulacao.itensCarrinho.length === 0) return;

    if (
      !confirm(
        `Confirma o registro de COMPRA de ${resultadoSimulacao.itensCarrinho.length} ativo(s) totalizando ${formatCurrency(
          resultadoSimulacao.totalGasto
        )}?`
      )
    ) {
      return;
    }

    setExecutingOrders(true);
    setSuccessMessage(null);

    try {
      // Registrar cada transação de compra no backend
      for (const item of resultadoSimulacao.itensCarrinho) {
        await fetch("/api/transacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ativoId: item.ativoId,
            tipo: "COMPRA",
            quantidade: item.qtdSimuladaComprar,
            precoUnitario: item.precoAtual,
            data: new Date().toISOString(),
          }),
        });
      }

      setSuccessMessage(
        `🎉 ${resultadoSimulacao.itensCarrinho.length} ordens de compra executadas com sucesso!`
      );
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Erro ao executar ordens de aporte:", err);
    } finally {
      setExecutingOrders(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Algoritmo Guloso (Greedy Allocation Engine)
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Simulador Inteligente de Aporte
          </h2>
          <p className="text-xs text-slate-300">
            Digite o valor em R\$ que deseja aportar hoje e o algoritmo distribuirá automaticamente o orçamento comprando os ativos mais defasados da sua meta.
          </p>
        </div>

        {/* Campo de Entrada de Aporte & Botões de Atalho */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-indigo-400">
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
              onChange={(e) => setValorAporte(Number(e.target.value))}
              className="w-full sm:w-44 bg-slate-950 border border-indigo-500/50 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-1">
            {[500, 1000, 2000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValorAporte(preset)}
                className={`text-[11px] font-mono font-bold px-2.5 py-2 rounded-lg border transition-colors ${
                  valorAporte === preset
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-xl flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {successMessage}
          </span>
        </div>
      )}

      {/* Resultado da Simulação: Carrinho de Compras */}
      {valorAporte > 0 && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          {/* Header do Resumo Financeiro do Aporte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total a Investir:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatCurrency(resultadoSimulacao.totalGasto)}
              </span>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Sobra / Troco:</span>
              <span className="font-mono text-base font-bold text-slate-300">
                {formatCurrency(resultadoSimulacao.sobraTroco)}
              </span>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Ativos Selecionados:</span>
              <span className="font-mono text-base font-bold text-indigo-300">
                {resultadoSimulacao.itensCarrinho.length} ativos
              </span>
            </div>
          </div>

          {/* Tabela Temporária do Carrinho de Compras */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-2.5 px-4">Ativo</th>
                    <th className="py-2.5 px-3">Classe</th>
                    <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      Qtd. a Comprar
                    </th>
                    <th className="py-2.5 px-3 text-right font-bold text-white">
                      Subtotal (R$)
                    </th>
                    <th className="py-2.5 px-4 text-right">% do Aporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200 font-mono">
                  {resultadoSimulacao.itensCarrinho.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-slate-500 font-sans text-xs"
                      >
                        O orçamento de {formatCurrency(valorAporte)} é insuficiente para comprar unidades inteiras dos ativos defasados.
                      </td>
                    </tr>
                  ) : (
                    resultadoSimulacao.itensCarrinho.map((item) => (
                      <tr
                        key={item.ativoId}
                        className="hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-sans font-bold text-white">
                          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                            {item.simbolo}
                          </span>
                          <span className="text-slate-400 font-normal ml-2">
                            {item.nome}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">
                          {item.classe}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {formatCurrency(item.precoAtual)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-sm">
                          + {item.qtdSimuladaComprar} cotas
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {formatCurrency(item.valorTotalAporteAtivo)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-indigo-400 font-semibold">
                          {formatPercent(item.percentualDoAporte, 1)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botão de Executar Ordem de Compras */}
          {resultadoSimulacao.itensCarrinho.length > 0 && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleExecutarCompras}
                disabled={executingOrders}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {executingOrders
                  ? "Executando Ordens..."
                  : `Executar Ordem de Aporte (${formatCurrency(
                      resultadoSimulacao.totalGasto
                    )})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
