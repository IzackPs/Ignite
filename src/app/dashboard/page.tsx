"use client";

import React, { useState, useCallback } from "react";
import { AtivoCalculado, PortfolioCalculado } from "@/lib/calculator";
import { ClassTabs } from "@/components/ClassTabs";
import { AssetTable } from "@/components/AssetTable";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { DashboardCharts, HistoricoItem } from "@/components/DashboardCharts";
import { ProventosView } from "@/components/ProventosView";
import { SimuladorAporteBar } from "@/components/SimuladorAporteBar";
import { AssetModal } from "@/components/AssetModal";
import { TransactionModal } from "@/components/TransactionModal";
import { ClassGoalsModal } from "@/components/ClassGoalsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  RefreshCw,
  Plus,
  PieChart,
  Settings,
  Zap,
  Clock,
  LogOut,
} from "lucide-react";
import { Toast } from "@/components/Toast";
import { logout } from "@/actions/auth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useCotacoes } from "@/hooks/useCotacoes";

export interface PortfolioComHistorico extends PortfolioCalculado {
  historico?: HistoricoItem[];
}

const NOMES_CLASSES: Record<string, string> = {
  ACOES: "Ações",
  FIIS: "FIIs",
  ETFS: "ETFs",
  RENDA_FIXA: "Renda Fixa",
};

export default function Home() {
  // ─── Dados & Fetching ──────────────────────────────────
  const { portfolio, loading, fetchPortfolio, handleDeleteAtivo } = usePortfolio();

  // ─── Cotações & Toast ──────────────────────────────────
  const {
    updatingPrices,
    lastPriceUpdate,
    cooldown,
    toast,
    setToast,
    handleAtualizarCotacoes,
    getUpdateBtnText,
  } = useCotacoes(fetchPortfolio);

  // ─── Estado de Navegação ───────────────────────────────
  const [activeTab, setActiveTab] = useState<string>("GERAL");

  // ─── Estado dos Modais ─────────────────────────────────
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoCalculado | null>(null);
  const [initialModalClasse, setInitialModalClasse] = useState("ACOES");
  const [transacaoModalOpen, setTransacaoModalOpen] = useState(false);
  const [transacaoAtivo, setTransacaoAtivo] = useState<AtivoCalculado | null>(null);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);

  // ─── Handlers de Modal ─────────────────────────────────
  const handleNovoAtivo = useCallback((classe?: string) => {
    setEditingAtivo(null);
    setInitialModalClasse(classe || "ACOES");
    setAssetModalOpen(true);
  }, []);

  const handleEditAtivo = useCallback((ativo: AtivoCalculado) => {
    setEditingAtivo(ativo);
    setAssetModalOpen(true);
  }, []);

  const handleAddTransacao = useCallback((ativo: AtivoCalculado) => {
    setTransacaoAtivo(ativo);
    setTransacaoModalOpen(true);
  }, []);

  // ─── Renderização de Conteúdo por Aba ──────────────────
  const renderContent = () => {
    if (loading && !portfolio) {
      return (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Carregando carteira de investimentos...
          </p>
        </div>
      );
    }

    if (!portfolio) {
      return (
        <div className="py-16 text-center text-slate-500">
          Nenhum dado encontrado.
        </div>
      );
    }

    if (activeTab === "GERAL") {
      return (
        <div className="space-y-8">
          <SimuladorAporteBar portfolio={portfolio} onRefresh={fetchPortfolio} />
          <DashboardCharts
            portfolio={portfolio}
            historico={portfolio.historico || []}
            onOpenMetasModal={() => setGoalsModalOpen(true)}
            onRefresh={fetchPortfolio}
          />
          <PortfolioOverview portfolio={portfolio} onSelectTab={setActiveTab} />
        </div>
      );
    }

    if (activeTab === "PROVENTOS") {
      return <ProventosView ativos={portfolio.ativos} />;
    }

    return (
      <div className="space-y-6">
        <SimuladorAporteBar portfolio={portfolio} onRefresh={fetchPortfolio} />
        <AssetTable
          ativos={portfolio.ativos.filter((a) => a.classe.toUpperCase() === activeTab)}
          resumoClasse={portfolio.resumoClasses.find((r) => r.classe === activeTab)}
          classeKey={activeTab}
          nomeClasse={NOMES_CLASSES[activeTab] || activeTab}
          onAddTransacao={handleAddTransacao}
          onEditAtivo={handleEditAtivo}
          onDeleteAtivo={handleDeleteAtivo}
          onNovoAtivo={handleNovoAtivo}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white pb-16 transition-colors duration-200">
      {/* ─── Top Header Navigation ─────────────────────────── */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {"Ignite Finanças "}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Asset Allocation
                </span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Gestão Inteligente de Carteira</span>
                {lastPriceUpdate && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Clock className="w-3 h-3" /> Cotações: {lastPriceUpdate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => handleAtualizarCotacoes(true)}
              disabled={updatingPrices || cooldown > 0}
              className={`bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                updatingPrices || cooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Buscar cotações reais na B3 via Brapi/Yahoo Finance"
            >
              <Zap
                className={`w-4 h-4 text-amber-500 dark:text-amber-400 ${
                  updatingPrices ? "animate-bounce" : ""
                }`}
              />
              {getUpdateBtnText()}
            </button>

            <button
              type="button"
              onClick={() => setGoalsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              title="Ajustar Metas por Classe"
            >
              <Settings className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Metas
            </button>

            <button
              type="button"
              onClick={() => fetchPortfolio()}
              disabled={loading}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => handleNovoAtivo()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Ativo
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="p-2.5 ml-2 rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-200 dark:border-rose-900/50"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Container ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <ClassTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          portfolio={portfolio}
        />
        {renderContent()}
      </main>

      {/* ─── Modais ────────────────────────────────────────── */}
      <AssetModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onSave={fetchPortfolio}
        initialClasse={initialModalClasse}
        editingAtivo={editingAtivo}
      />

      <TransactionModal
        isOpen={transacaoModalOpen}
        onClose={() => setTransacaoModalOpen(false)}
        onSave={fetchPortfolio}
        ativo={transacaoAtivo}
      />

      <ClassGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        onSave={fetchPortfolio}
        resumoClasses={portfolio?.resumoClasses || []}
      />

      {/* ─── Toast Notification ────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
