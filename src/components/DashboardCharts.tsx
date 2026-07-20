"use client";

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
  portfolio: PortfolioCalculado;
  historico: HistoricoItem[];
  onOpenMetasModal: () => void;
  onRefresh: () => void;
}

const COLORS = ["#3b82f6", "#a855f7", "#f59e0b", "#10b981"];

export function DashboardCharts({
  portfolio,
  historico,
  onOpenMetasModal,
  onRefresh,
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
  const lineData = historico.map((item) => {
    const d = new Date(item.data);
    const mesAno = d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    return {
      id: item.id,
      dataOriginal: item.data,
      mesAno,
      patrimonioTotal: item.patrimonioTotal,
      totalInvestido: item.totalInvestido,
      lucroPrejuizo: item.lucroPrejuizo,
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
    } catch (err) {
      console.error("Erro ao salvar foto mensal:", err);
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
    } catch (err) {
      console.error("Erro ao excluir histórico:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar de Ações do Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-400" />
            Dashboard & Evolução Patrimonial
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe a distribuição por classe de ativo e o crescimento do seu patrimônio ao longo do tempo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenMetasModal}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-md"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            Editar Metas por Classe
          </button>

          <button
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Alocação por Classe (Atual vs Ideal)
              </h3>
              <p className="text-xs text-slate-400">
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
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.name}</div>
                          <div className="text-slate-300">
                            Valor: <strong>{formatCurrency(data.atual)}</strong>
                          </div>
                          <div className="text-blue-400">
                            Atual: <strong>{formatPercent(data.percentualAtual)}</strong>
                          </div>
                          <div className="text-slate-400">
                            Meta Ideal: <strong>{data.metaPercentual}%</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Customizada com Comparativo Percentual */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            {portfolio.resumoClasses.map((r, idx) => (
              <div
                key={r.classe}
                className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-slate-300 truncate">
                    {r.nomeClasse}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {formatPercent(r.percentualAtual, 1)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Meta: {r.metaPercentual}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 2: Linha / Área (Evolução Mensal do Patrimônio) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Evolução do Patrimônio Total (Mensal)
              </h3>
              <p className="text-xs text-slate-400">
                Histórico temporal de crescimento do valor de mercado vs total investido
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mesAno" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-bold text-white">{data.mesAno}</div>
                            <div className="text-emerald-400 font-bold">
                              Patrimônio: {formatCurrency(data.patrimonioTotal)}
                            </div>
                            <div className="text-blue-400">
                              Investido: {formatCurrency(data.totalInvestido)}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              Lucro acumulado: {formatCurrency(data.lucroPrejuizo)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
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
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorInvestido)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Resumo da Linha do Tempo e opção de gerenciar */}
          {lineData.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>
                Última foto:{" "}
                <strong className="text-slate-200">
                  {lineData[lineData.length - 1].mesAno}
                </strong>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {formatCurrency(lineData[lineData.length - 1].patrimonioTotal)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista / Histórico Registrado de Fotos Mensais */}
      {lineData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Histórico de Fotos Registradas
            </h3>
            <span className="text-xs text-slate-500">
              {lineData.length} foto(s) registrada(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Data do Snapshot</th>
                  <th className="py-2.5 px-3 text-right">Patrimônio Total</th>
                  <th className="py-2.5 px-3 text-right">Total Investido</th>
                  <th className="py-2.5 px-3 text-right">Lucro / Prejuízo</th>
                  <th className="py-2.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lineData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors font-mono"
                  >
                    <td className="py-2.5 px-4 text-slate-300 font-sans font-medium">
                      {new Date(item.dataOriginal).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {formatCurrency(item.patrimonioTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatCurrency(item.totalInvestido)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        item.lucroPrejuizo >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatCurrency(item.lucroPrejuizo)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <button
                        onClick={() => handleExcluirHistorico(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
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
