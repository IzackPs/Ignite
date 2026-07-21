"use client";
import { logger } from '@/lib/logger';

import React, { useState } from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Camera,
  Settings,
  Calendar,
  Layers,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface HistoricoItem {
  id: string;
  data: string | Date;
  patrimonioTotal: number;
  totalInvestido: number;
  lucroPrejuizo: number;
}

interface DashboardChartsProps {
  readonly portfolio: PortfolioCalculado;
  readonly historico: HistoricoItem[];
  readonly onOpenMetasModal: () => void;
  readonly onRefresh: () => void;
  readonly isBalanceVisible?: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  ACOES: "#3b82f6", // blue-500
  FIIS: "#a855f7", // purple-500
  ETFS: "#f59e0b", // amber-500
  RENDA_FIXA: "#10b981", // emerald-500
};

const CustomDonutTooltip = (props: any) => {
  const { isBalanceVisible = true } = props;
  return (
    <ChartTooltip {...props} titleKey="name">
      {(data) => (
        <>
          <div className="text-zinc-300">
            Valor: <strong>{isBalanceVisible ? formatCurrency(data.atual) : "R$ ••••"}</strong>
          </div>
          <div className="text-gold-main">
            Atual: <strong>{formatPercent(data.percentualAtual)}</strong>
          </div>
          <div className="text-zinc-400">
            Meta Ideal: <strong>{data.metaPercentual}%</strong>
          </div>
        </>
      )}
    </ChartTooltip>
  );
};

const CustomAreaTooltip = (props: any) => {
  const { isBalanceVisible = true } = props;
  return (
    <ChartTooltip {...props}>
      {(data) => (
        <>
          <div className="text-emerald-400 font-bold">
            Patrimônio: {isBalanceVisible ? formatCurrency(data.patrimonioTotal) : "R$ ••••"}
          </div>
          <div className="text-gold-main">
            Investido: {isBalanceVisible ? formatCurrency(data.totalInvestido) : "R$ ••••"}
          </div>
          <div className="text-zinc-400 text-[10px]">
            Lucro acumulado: {isBalanceVisible ? formatCurrency(data.lucroPrejuizo) : "R$ ••••"}
          </div>
        </>
      )}
    </ChartTooltip>
  );
};

export function DashboardCharts({
  portfolio,
  historico,
  onOpenMetasModal,
  onRefresh,
  isBalanceVisible = true,
}: DashboardChartsProps) {
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Dados para o Gráfico de Rosca (Alocação Atual vs Ideal por Classe)
  const donutData = portfolio.resumoClasses.map((r) => ({
    name: r.nomeClasse,
    atual: r.valorMercadoTotal,
    percentualAtual: r.percentualAtual,
    metaPercentual: r.metaPercentual,
  }));

  // Dados para o Gráfico de Linha / Área (Evolução Mensal do Patrimônio)
  const taxaCdiAnual = (portfolio as any).cdiInfo?.taxaCdiAnual || 0;
  const firstDate = historico.length > 0 ? new Date(historico[0].data).getTime() : 0;
  const firstTotalInvestido = historico.length > 0 ? historico[0].totalInvestido : 0;

  const lineData = historico.map((item) => {
    const d = new Date(item.data);
    const mesAno = d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    const daysDiff = (d.getTime() - firstDate) / (1000 * 60 * 60 * 24);
    // Compounded theoretical CDI starting from the initial invested amount
    const cdiAcumulado = firstTotalInvestido * Math.pow(1 + taxaCdiAnual, daysDiff / 365);

    return {
      id: item.id,
      dataOriginal: item.data,
      mesAno,
      patrimonioTotal: item.patrimonioTotal,
      totalInvestido: item.totalInvestido,
      lucroPrejuizo: item.lucroPrejuizo,
      cdiAcumulado: cdiAcumulado > 0 ? cdiAcumulado : item.totalInvestido,
    };
  });

  const handleSalvarFotoMensal = async () => {
    setSavingSnapshot(true);
    setSnapshotSuccess(false);

    try {
      const res = await fetch("/api/historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patrimonioTotal: portfolio.patrimonioTotal,
          totalInvestido: portfolio.totalInvestidoTotal,
          lucroPrejuizo: portfolio.lucroPrejuizoTotalR$,
          data: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setSnapshotSuccess(true);
        onRefresh();
        setTimeout(() => setSnapshotSuccess(false), 4000);
      }
    } catch (err: any) {
      logger.error("Erro ao salvar foto mensal:", err);
    } finally {
      setSavingSnapshot(false);
    }
  };

  const handleExcluirHistorico = async (id: string) => {
    if (!confirm("Deseja remover este registro do histórico mensal?")) return;
    try {
      const res = await fetch(`/api/historico?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err: any) {
      logger.error("Erro ao excluir histórico:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar de Ações do Dashboard */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-gold-main" />
            Dashboard & Evolução Patrimonial
          </h2>
          <p className="text-xs text-zinc-400">
            Acompanhe a distribuição por classe de ativo e o crescimento do seu patrimônio ao longo do tempo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenMetasModal}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-border-subtle text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            Editar Metas por Classe
          </button>

          <button
            type="button"
            onClick={handleSalvarFotoMensal}
            disabled={savingSnapshot}
            className={`text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg ${
              snapshotSuccess
                ? "bg-emerald-600 shadow-emerald-600/30"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25"
            }`}
          >
            {snapshotSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Foto Registrada!
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                {savingSnapshot ? "Salvando..." : "Salvar Foto Mensal"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid de 2 Gráficos Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 1: Rosca (Alocação Atual vs Ideal por Classe) */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-main" />
                Alocação por Classe (Atual vs Ideal)
              </h3>
              <p className="text-xs text-zinc-400">
                Distribuição patrimonial real comparada às metas configuradas
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="atual"
                >
                  {portfolio.resumoClasses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLASS_COLORS[entry.classe] || "#fbbf24"}
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip isBalanceVisible={isBalanceVisible} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Customizada com Comparativo Percentual */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
            {portfolio.resumoClasses.map((r, idx) => (
              <div
                key={r.classe}
                className="bg-zinc-100 dark:bg-white/5 p-3 rounded-lg border border-border-subtle flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: CLASS_COLORS[r.classe] || "#fbbf24" }}
                    />
                    <span className="font-medium text-foreground truncate">
                      {r.nomeClasse}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">
                      {formatPercent(r.percentualAtual, 1)}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      Meta: {r.metaPercentual}%
                    </span>
                  </div>
                </div>
                
                {/* Visual Progress Bar (Defasagem) */}
                <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      r.percentualAtual - r.metaPercentual < -2 ? "bg-amber-400" :
                      r.percentualAtual - r.metaPercentual > 2 ? "bg-rose-400" :
                      "bg-emerald-400"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (r.percentualAtual / (r.metaPercentual || 1)) * 100
                      )}%`,
                    }}
                  />
                  {/* Meta marker line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/40"
                    style={{ left: "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 2: Linha / Área (Evolução Mensal do Patrimônio) */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Evolução do Patrimônio Total (Mensal)
              </h3>
              <p className="text-xs text-zinc-400">
                Histórico temporal de crescimento do valor de mercado vs total investido
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                <Calendar className="w-8 h-8 opacity-40" />
                Nenhum registro histórico salvo ainda. Clique em &quot;Salvar Foto Mensal&quot; para começar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={lineData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="mesAno" stroke="#a1a1aa" fontSize={11} />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomAreaTooltip isBalanceVisible={isBalanceVisible} />} />
                  <Area
                    type="monotone"
                    dataKey="patrimonioTotal"
                    name="Patrimônio Total"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPatrimonio)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalInvestido"
                    name="Total Investido"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorInvestido)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cdiAcumulado"
                    name="Benchmark CDI"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Resumo da Linha do Tempo e opção de gerenciar */}
          {lineData.length > 0 && (
            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-zinc-400">
              <span>
                Última foto:{" "}
                <strong className="text-foreground">
                  {lineData.at(-1)?.mesAno}
                </strong>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {isBalanceVisible ? formatCurrency(lineData.at(-1)?.patrimonioTotal || 0) : "R$ •••••"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista / Histórico Registrado de Fotos Mensais */}
      {lineData.length > 0 && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-main" />
              Histórico de Fotos Registradas
            </h3>
            <span className="text-xs text-zinc-500">
              {lineData.length} foto(s) registrada(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 rounded-l-lg">Data do Snapshot</th>
                  <th className="py-2.5 px-3 text-right">Patrimônio Total</th>
                  <th className="py-2.5 px-3 text-right">Total Investido</th>
                  <th className="py-2.5 px-3 text-right">Lucro / Prejuízo</th>
                  <th className="py-2.5 px-4 text-center rounded-r-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {lineData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors font-mono"
                  >
                    <td className="py-2.5 px-4 text-zinc-700 dark:text-zinc-300 font-sans font-medium">
                      {new Date(item.dataOriginal).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {isBalanceVisible ? formatCurrency(item.patrimonioTotal) : "R$ ••••"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-500 dark:text-zinc-400">
                      {isBalanceVisible ? formatCurrency(item.totalInvestido) : "R$ ••••"}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        item.lucroPrejuizo >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isBalanceVisible ? formatCurrency(item.lucroPrejuizo) : "R$ ••••"}
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => handleExcluirHistorico(item.id)}
                        className="text-zinc-400 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Excluir este registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
