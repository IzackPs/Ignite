"use client";
import { logger } from '@/lib/logger';

import React, { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { ChartTooltip } from "@/components/ui/ChartTooltip";
import { AtivoCalculado } from "@/lib/calculator";
import { DividendModal } from "@/components/DividendModal";
import {
  Coins,
  TrendingUp,
  Calendar,
  PlusCircle,
  Trash2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface ProventoItem {
  id: string;
  ativoId: string;
  data: string;
  tipo: string;
  valorTotal: number;
  ativo: {
    simbolo: string;
    nome: string;
    classe: string;
  };
}

export interface HistoricoMensalProvento {
  chaveMes: string;
  mesAno: string;
  total: number;
  dividendo: number;
  jcp: number;
  rendimento: number;
}

export interface ProventosResponse {
  totalGeralRecebido: number;
  mediaMensal: number;
  proventosCount: number;
  historicoMensal: HistoricoMensalProvento[];
  proventos: ProventoItem[];
}

const CustomProventoTooltip = (props: any) => {
  return (
    <ChartTooltip {...props}>
      {(data) => (
        <>
          <div className="text-emerald-400 font-bold text-sm">
            Total: {formatCurrency(data.total)}
          </div>
          {data.rendimento > 0 && (
            <div className="text-purple-400">
              Rendimentos (FIIs): {formatCurrency(data.rendimento)}
            </div>
          )}
          {data.dividendo > 0 && (
            <div className="text-emerald-300">
              Dividendos: {formatCurrency(data.dividendo)}
            </div>
          )}
          {data.jcp > 0 && (
            <div className="text-gold-main">
              JCP: {formatCurrency(data.jcp)}
            </div>
          )}
        </>
      )}
    </ChartTooltip>
  );
};

const getTipoProventoClass = (tipo: string) => {
  if (tipo.toUpperCase() === "RENDIMENTO") {
    return "bg-purple-500/10 text-purple-300 border-purple-500/20";
  }
  if (tipo.toUpperCase() === "DIVIDENDO") {
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  }
  return "bg-gold-main/10 text-gold-main border-gold-main/20";
};

interface ProventosViewProps {
  readonly ativos: AtivoCalculado[];
}

export function ProventosView({ ativos }: ProventosViewProps) {
  const [proventosData, setProventosData] = useState<ProventosResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingProventoId, setDeletingProventoId] = useState<string | null>(null);

  const fetchProventos = useCallback(async () => {
    try {
      const res = await fetch("/api/proventos");
      if (res.ok) {
        const data = await res.json();
        setProventosData(data);
      }
    } catch (err: any) {
      logger.error("Erro ao carregar proventos:", err);
    }
  }, []);

  useEffect(() => {
    fetchProventos();
  }, [fetchProventos]);

  const handleDeleteProvento = async () => {
    if (!deletingProventoId) return;
    const id = deletingProventoId;
    setDeletingProventoId(null);
    try {
      const res = await fetch(`/api/proventos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProventos();
      }
    } catch (err: any) {
      logger.error("Erro ao excluir provento:", err);
    }
  };

  const mesAtualChave = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;

  const rendaMesAtual =
    proventosData?.historicoMensal?.find((m: HistoricoMensalProvento) => m.chaveMes === mesAtualChave)
      ?.total || 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Métricas de Renda Passiva */}
      <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Renda Passiva Mensal
            </span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Escadinha de Proventos & Dividendos
            </h2>
            <p className="text-xs text-zinc-400">
              Acompanhe o crescimento da sua renda passiva pingando na conta mês a mês.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Provento
          </button>
        </div>

        {/* 3 Cards Indicadores Top-Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Total Acumulado */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-zinc-400">
                Total Histórico Recebido
              </div>
              <div className="text-2xl font-black text-white">
                {formatCurrency(proventosData?.totalGeralRecebido || 0)}
              </div>
            </div>
          </div>

          {/* Média Mensal */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-gold-main/10 text-gold-main rounded-xl border border-gold-main/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-zinc-400">
                Média Mensal Recebida
              </div>
              <div className="text-2xl font-black text-zinc-200">
                {formatCurrency(proventosData?.mediaMensal || 0)} /mês
              </div>
            </div>
          </div>

          {/* Renda no Mês Atual */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-zinc-400">
                Renda do Mês Atual
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(rendaMesAtual)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO ESCADINHA DE DIVIDENDOS (Barras Verticais Recharts) */}
      <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Escadinha de Dividendos Mensais (R$)
            </h3>
            <p className="text-xs text-zinc-400">
              Evolução mês a mês por categoria de provento (Rendimento, Dividendo, JCP)
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {!proventosData || proventosData.historicoMensal.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
              <Coins className="w-8 h-8 opacity-40" />
              Nenhum provento cadastrado ainda. Clique em &quot;Registrar Provento&quot; para começar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={proventosData.historicoMensal || []}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mesAno" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <Tooltip content={<CustomProventoTooltip />} />
                <Legend />
                <Bar
                  dataKey="rendimento"
                  name="Rendimento (FIIs)"
                  stackId="a"
                  fill="#a855f7"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="dividendo"
                  name="Dividendo"
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="jcp"
                  name="JCP"
                  stackId="a"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABELA DE EXTRATO DE PROVENTOS */}
      <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Extrato Detalhado de Lançamentos
          </h3>
          <span className="text-xs text-zinc-500">
            {proventosData?.proventos.length || 0} lançamento(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Data do Crédito</th>
                <th className="py-3 px-3">Ticker / Ativo</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3 text-right">Valor Creditado</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-zinc-200">
              {!proventosData || proventosData.proventos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-zinc-500 text-sm"
                  >
                    Nenhum provento cadastrado. Clique no botão acima para adicionar.
                  </td>
                </tr>
              ) : (
                proventosData.proventos.map((p: ProventoItem) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Data */}
                      <td className="py-3 px-4 font-mono">
                        {new Date(p.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Ticker */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {p.ativo?.simbolo}
                          </span>
                          <span className="text-zinc-400 truncate max-w-[150px]">
                            {p.ativo?.nome}
                          </span>
                        </div>
                      </td>

                      {/* Classe */}
                      <td className="py-3 px-3 text-zinc-400">
                        {p.ativo?.classe}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getTipoProventoClass(
                            p.tipo
                          )}`}
                        >
                          {p.tipo}
                        </span>
                      </td>

                      {/* Valor Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        + {formatCurrency(p.valorTotal)}
                      </td>

                      {/* Botão Excluir */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeletingProventoId(p.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Lançamento de Provento */}
      <DividendModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchProventos}
        ativos={ativos}
      />

      {/* Modal de Confirmação de Exclusão de Provento */}
      <ConfirmModal
        isOpen={!!deletingProventoId}
        onClose={() => setDeletingProventoId(null)}
        onConfirm={handleDeleteProvento}
        title="Excluir Lançamento de Provento"
        description="Tem certeza que deseja excluir este lançamento de provento da sua carteira?"
        confirmText="Excluir Provento"
        variant="danger"
      />
    </div>
  );
}
