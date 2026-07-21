"use client";

import React from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ShieldCheck,
  Building,
  Globe,
  Wallet,
  ArrowUpRight,
  Activity,
  PlusCircle,
  RefreshCw,
  FileText,
  Coins,
  Sparkles,
  HeartPulse,
  Target,
  AlertTriangle,
} from "lucide-react";

interface PortfolioOverviewProps {
  readonly portfolio: PortfolioCalculado;
  readonly onSelectTab: (tabKey: string) => void;
  readonly isBalanceVisible?: boolean;
  readonly onNovoAtivo?: () => void;
  readonly onAddTransacao?: () => void;
  readonly onOpenMetasModal?: () => void;
  readonly cdiAnualPercentual?: number;
}

export function PortfolioOverview({
  portfolio,
  onSelectTab,
  isBalanceVisible = true,
  onNovoAtivo,
  onAddTransacao,
  onOpenMetasModal,
  cdiAnualPercentual = 0,
}: PortfolioOverviewProps) {
  const isLucroGeral = portfolio.lucroPrejuizoTotalR$ >= 0;

  // ─── Cálculo de Saúde da Carteira ───
  const ativosComMeta = portfolio.ativos.filter((a) => a.percentualIdeal > 0);
  const ativosNaMeta = ativosComMeta.filter((a) => {
    const diff = Math.abs(a.percentualAtual - a.percentualIdeal);
    return diff <= 2; // Tolerância de ±2%
  });
  const saudeScore =
    ativosComMeta.length > 0
      ? Math.round((ativosNaMeta.length / ativosComMeta.length) * 100)
      : 100;
  const ativosDefasados = ativosComMeta.filter(
    (a) => a.status === "COMPRAR"
  ).length;

  // ─── FIIs com Número Mágico para preview ───
  const fiisComMagico = portfolio.ativos
    .filter(
      (a) =>
        a.classe.toUpperCase() === "FIIS" &&
        a.numeroMagico > 0 &&
        a.quantidadeAtual > 0
    )
    .sort((a, b) => b.progressoMagicoPercentual - a.progressoMagicoPercentual)
    .slice(0, 3);

  const classIcons: Record<string, React.ReactNode> = {
    ACOES: <TrendingUp className="w-5 h-5 text-blue-500" />,
    FIIS: <Building className="w-5 h-5 text-purple-500" />,
    ETFS: <Globe className="w-5 h-5 text-amber-500" />,
    RENDA_FIXA: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
  };

  // SVG Progress Ring para Saúde da Carteira
  const ringSize = 72;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (saudeScore / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Ações Rápidas de Investimento ─── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button type="button" onClick={onNovoAtivo} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" /> Aportar
        </button>
        <button type="button" onClick={onAddTransacao} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-zinc-700 whitespace-nowrap">
          <FileText className="w-4 h-4 text-gold-main" /> Registrar Operação
        </button>
        <button type="button" onClick={onOpenMetasModal} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-zinc-700 whitespace-nowrap">
          <RefreshCw className="w-4 h-4 text-blue-400" /> Reequilibrar Carteira
        </button>
      </div>

      {/* ─── Topo / Destaque Principal (3 Cards) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Rentabilidade Histórica */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Activity className="w-24 h-24 text-white" aria-hidden="true" />
          </div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            Rentabilidade Histórica
          </div>
          <div className={`text-3xl sm:text-4xl font-black flex items-center gap-2 ${isLucroGeral ? "text-emerald-400" : "text-rose-400"}`}>
            {isLucroGeral ? <ArrowUpRight className="w-8 h-8 shrink-0" aria-hidden="true" /> : <TrendingDown className="w-8 h-8 shrink-0" aria-hidden="true" />}
            {isBalanceVisible ? formatCurrency(portfolio.lucroPrejuizoTotalR$) : "R$ •••••"}
          </div>
          <div className={`text-sm font-semibold mt-2 flex items-center gap-1.5 ${isLucroGeral ? "text-emerald-500" : "text-rose-500"}`}>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
              {isLucroGeral ? "+" : ""}{formatPercent(portfolio.lucroPrejuizoTotalPercentual)}
            </span>
            <span className="text-zinc-500 font-normal">retorno sobre o custo</span>
          </div>
        </div>

        {/* Card 2: Renda Passiva Mensal (substitui mock "Variação do Dia") */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Coins className="w-24 h-24 text-purple-300" aria-hidden="true" />
          </div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> Renda Passiva Estimada
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-400 flex items-baseline gap-2">
            {isBalanceVisible ? (
              <>
                <span className="text-lg font-medium text-zinc-500">R$</span>
                {formatCurrency(portfolio.rendaMensalTotalEstimada).replace("R$", "").trim()}
              </>
            ) : "R$ •••••"}
          </div>
          <div className="text-sm font-semibold mt-2 text-purple-500/80">
            /mês em dividendos e rendimentos
          </div>

          {/* Mini preview dos FIIs com Número Mágico */}
          {fiisComMagico.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border-subtle/80 space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-1">
                <Target className="w-3 h-3" /> Bola de Neve — FIIs
              </div>
              {fiisComMagico.map((fii) => {
                const atingiu = fii.cotasFaltantesMagico <= 0;
                return (
                  <div key={fii.id} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono font-bold text-zinc-300 w-16 truncate">{fii.simbolo}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${atingiu ? "bg-emerald-400" : "bg-purple-500"}`}
                        style={{ width: `${Math.min(100, fii.progressoMagicoPercentual)}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold text-[10px] w-10 text-right ${atingiu ? "text-emerald-400" : "text-purple-400"}`}>
                      {atingiu ? "✨" : `${fii.progressoMagicoPercentual}%`}
                    </span>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => onSelectTab("FIIS")}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 mt-1 transition-colors"
              >
                Ver Painel do Número Mágico <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Saúde da Carteira (substitui mock "Benchmarks") */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition-all duration-300">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> Saúde da Carteira
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* SVG Progress Ring */}
            <div className="relative shrink-0">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke={saudeScore >= 80 ? "#34d399" : saudeScore >= 50 ? "#fbbf24" : "#fb7185"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-black ${saudeScore >= 80 ? "text-emerald-400" : saudeScore >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {saudeScore}%
                </span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="text-sm font-bold text-white">
                {saudeScore >= 80 ? "Excelente" : saudeScore >= 50 ? "Atenção" : "Desbalanceada"}
              </div>
              <div className="text-[11px] text-zinc-400">
                {ativosNaMeta.length}/{ativosComMeta.length} ativos dentro da meta (±2%)
              </div>

              {ativosDefasados > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 w-fit">
                  <AlertTriangle className="w-3 h-3" />
                  {ativosDefasados} ativo{ativosDefasados > 1 ? "s" : ""} para comprar
                </div>
              )}

              {ativosDefasados === 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 w-fit">
                  <CheckCircle2 className="w-3 h-3" />
                  Carteira equilibrada!
                </div>
              )}
            </div>
          </div>

          {/* CDI Benchmark no rodapé */}
          <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">CDI (a.a.)</span>
            <span className="font-mono font-bold text-zinc-300">
              {formatPercent(cdiAnualPercentual)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gold-main font-bold">Sua Carteira</span>
            <span className={`font-mono font-bold ${isLucroGeral ? "text-emerald-400" : "text-rose-400"}`}>
              {isLucroGeral ? "+" : ""}{formatPercent(portfolio.lucroPrejuizoTotalPercentual)}
            </span>
          </div>
        </div>

      </div>

      {/* ─── Visão Macro: Alocação por Classe ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gold-main" />
              Alocação por Classe de Ativos
            </h3>
            <p className="text-xs text-zinc-400">
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
                aria-label={`Ver detalhes da classe ${resumo.nomeClasse}`}
                className="bg-surface border border-border-subtle hover:border-gold-main/50 rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-gold-main focus:ring-offset-2 focus:ring-offset-background"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 w-full">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold-main/10 transition-colors">
                        {classIcons[resumo.classe]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-gold-main transition-colors">
                          {resumo.nomeClasse}
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                          Meta Ideal: {resumo.metaPercentual}%
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isComprar
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      {isComprar ? "COMPRAR" : "OK"}
                    </span>
                  </div>

                  {/* Valor de Mercado */}
                  <div className="mt-2">
                    <div className="text-xs text-zinc-400">Valor Atual</div>
                    <div className="text-xl font-bold text-white">
                      {isBalanceVisible ? formatCurrency(resumo.valorMercadoTotal) : "R$ •••••"}
                    </div>
                  </div>

                  {/* Barra de Progresso Dupla — Real vs Meta */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-400">Atual:</span>
                      <span
                        className={(() => {
                          if (diffPercent < -2) return "text-amber-400";
                          if (diffPercent > 2) return "text-gold-main";
                          return "text-emerald-400";
                        })()}
                      >
                        {formatPercent(resumo.percentualAtual)} / {resumo.metaPercentual}%
                        <span className="ml-1 text-[10px] opacity-70">
                          ({diffPercent > 0 ? "+" : ""}{diffPercent.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    {/* Barra de progresso com indicador de meta */}
                    <div className="relative w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${(() => {
                          if (diffPercent < -2) return "bg-amber-400";
                          if (diffPercent > 2) return "bg-gold-main";
                          return "bg-emerald-400";
                        })()}`}
                        style={{
                          width: `${Math.min(
                            100,
                            (resumo.percentualAtual / (resumo.metaPercentual || 1)) * 100
                          )}%`,
                        }}
                      />
                      {/* Meta marker line */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-white/30"
                        style={{ left: "100%" }}
                        title={`Meta: ${resumo.metaPercentual}%`}
                      />
                    </div>
                  </div>

                  {/* Detalhe da Falta (R$) */}
                  {resumo.faltaR$ > 0 && (
                    <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Falta para Meta:</span>
                      <span className="font-bold text-emerald-400">
                        {isBalanceVisible ? formatCurrency(resumo.faltaR$) : "R$ ••••"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 text-xs text-gold-main font-semibold flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform w-full">
                  Ver Ativos de {resumo.nomeClasse} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

