"use client";

import React from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  Building,
  Globe,
} from "lucide-react";

interface PortfolioOverviewProps {
  readonly portfolio: PortfolioCalculado;
  readonly onSelectTab: (tabKey: string) => void;
}

export function PortfolioOverview({
  portfolio,
  onSelectTab,
}: PortfolioOverviewProps) {
  const isLucroGeral = portfolio.lucroPrejuizoTotalR$ >= 0;

  const classIcons: Record<string, React.ReactNode> = {
    ACOES: <TrendingUp className="w-5 h-5 text-blue-400" />,
    FIIS: <Building className="w-5 h-5 text-purple-400" />,
    ETFS: <Globe className="w-5 h-5 text-amber-400" />,
    RENDA_FIXA: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  };

  return (
    <div className="space-y-8">
      {/* 4 Cards Principais de Indicadores Top-Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patrimônio Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Patrimônio Total
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(portfolio.patrimonioTotal)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            Valor de mercado atual de todas as classes
          </div>
        </div>

        {/* Total Investido */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Investido (Custo)
          </div>
          <div className="text-2xl font-black text-slate-200">
            {formatCurrency(portfolio.totalInvestidoTotal)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Soma ponderada dos preços médios
          </div>
        </div>

        {/* Lucro / Prejuízo R$ */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Lucro / Prejuízo R$
          </div>
          <div
            className={`text-2xl font-black flex items-center gap-1.5 ${
              isLucroGeral ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isLucroGeral ? (
              <TrendingUp className="w-6 h-6 shrink-0" />
            ) : (
              <TrendingDown className="w-6 h-6 shrink-0" />
            )}
            {formatCurrency(portfolio.lucroPrejuizoTotalR$)}
          </div>
          <div
            className={`text-xs font-semibold mt-2 ${
              isLucroGeral ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isLucroGeral ? "+" : ""}
            {formatPercent(portfolio.lucroPrejuizoTotalPercentual)} de retorno
            global
          </div>
        </div>

        {/* Status de Rebalanceamento da Carteira */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Necessidade de Aporte
          </div>
          {portfolio.resumoClasses.some((c) => c.status === "COMPRAR") ? (
            <div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                Rebalancear Aportes
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Existem classes ou ativos abaixo da meta ideal.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Carteira Balanceada
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Todas as metas ideais estão atendidas.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seção Central: As 4 Grandes Classes de Ativos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Alocação por Classe de Ativos
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento de alocação real vs. metas ideais por categoria
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {portfolio.resumoClasses.map((resumo) => {
            const isComprar = resumo.status === "COMPRAR";
            const diffPercent = resumo.percentualAtual - resumo.metaPercentual;

            return (
              <button
                type="button"
                key={resumo.classe}
                onClick={() => onSelectTab(resumo.classe)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                        {classIcons[resumo.classe]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          {resumo.nomeClasse}
                        </h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Meta Ideal: {resumo.metaPercentual}%
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isComprar
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {isComprar ? "COMPRAR" : "OK"}
                    </span>
                  </div>

                  {/* Valor de Mercado */}
                  <div className="mt-2">
                    <div className="text-xs text-slate-400">Valor Atual</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(resumo.valorMercadoTotal)}
                    </div>
                  </div>

                  {/* Barra de Progresso Real vs Meta */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Atual:</span>
                      <span
                        className={
                          diffPercent < 0 ? "text-amber-400" : "text-slate-200"
                        }
                      >
                        {formatPercent(resumo.percentualAtual)} (Meta:{" "}
                        {resumo.metaPercentual}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${(() => {
                          if (diffPercent < -2) return "bg-amber-400";
                          if (diffPercent > 2) return "bg-blue-400";
                          return "bg-emerald-400";
                        })()}`}
                        style={{
                          width: `${Math.min(
                            100,
                            (resumo.percentualAtual / (resumo.metaPercentual || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Detalhe da Falta (R$) */}
                  {resumo.faltaR$ > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Falta para Meta:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(resumo.faltaR$)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 text-xs text-blue-400 font-semibold flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                  Ver Ativos de {resumo.nomeClasse} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela Resumida de Oportunidades de Compra */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              Sugestões Prioritárias de Rebalanceamento
            </h3>
            <p className="text-xs text-slate-400">
              Ativos cuja alocação atual está abaixo da meta ideal configurada
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Ativo</th>
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3 text-right">Preço Atual</th>
                <th className="py-2.5 px-3 text-right">% Atual</th>
                <th className="py-2.5 px-3 text-right">% Ideal</th>
                <th className="py-2.5 px-3 text-right">Falta (R$)</th>
                <th className="py-2.5 px-4 text-right font-bold text-emerald-400">
                  Qtd. Sugerida a Comprar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {portfolio.ativos.filter((a) => a.status === "COMPRAR").length ===
              0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-slate-500 text-sm"
                  >
                    🎉 Todos os seus ativos estão dentro da meta ideal ou acima!
                  </td>
                </tr>
              ) : (
                portfolio.ativos
                  .filter((a) => a.status === "COMPRAR")
                  .sort((a, b) => b.faltaR$ - a.faltaR$)
                  .map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {a.simbolo}
                        <span className="font-sans font-normal text-xs text-slate-400 block">
                          {a.nome}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {a.classe}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-200">
                        {formatCurrency(a.precoAtual)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-amber-400 font-semibold">
                        {formatPercent(a.percentualAtual)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-blue-400">
                        {formatPercent(a.percentualIdeal, 1)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-emerald-400">
                        {formatCurrency(a.faltaR$)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-bold">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded">
                          + {a.qtdAComprar} uni.
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
