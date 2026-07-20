"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PortfolioCalculado, AtivoCalculado } from "@/lib/calculator";
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

export interface PortfolioComHistorico extends PortfolioCalculado {
  historico?: HistoricoItem[];
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioComHistorico | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("GERAL");

  // Modais
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoCalculado | null>(null);
  const [initialModalClasse, setInitialModalClasse] = useState("ACOES");

  const [transacaoModalOpen, setTransacaoModalOpen] = useState(false);
  const [transacaoAtivo, setTransacaoAtivo] = useState<AtivoCalculado | null>(null);

  const [goalsModalOpen, setGoalsModalOpen] = useState(false);

  // Toast Notificação
  const [toast, setToast] = useState<{ message: string; type: "info" | "warning" | "success" | "error" } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (res.ok) {
        setPortfolio(data);
      }
    } catch (err) {
      console.error("Erro ao carregar portfólio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAtualizarCotacoes = useCallback(async (isManual = false) => {
    if (isManual && cooldown > 0) {
      setToast({ message: `Aguarde ${cooldown}s antes de atualizar novamente.`, type: "warning" });
      return;
    }
    
    setUpdatingPrices(true);
    try {
      const res = await fetch("/api/cotacoes", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success && data.updatedCount > 0) {
        const agora = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastPriceUpdate(agora);
        await fetchPortfolio();
        if (isManual) {
          setToast({ message: "Cotações atualizadas com sucesso!", type: "success" });
        }
      } else {
        setToast({
          message: data.message || "Não foi possível atualizar as cotações. Exibindo dados em cache.",
          type: "warning",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar cotações em tempo real:", err);
      setToast({
        message: "Não foi possível atualizar as cotações. Exibindo dados em cache.",
        type: "warning",
      });
    } finally {
      setUpdatingPrices(false);
      if (isManual) {
        setCooldown(60);
      }
    }
  }, [fetchPortfolio, cooldown]);

  useEffect(() => {
    fetchPortfolio();

    const intervalId = setInterval(() => {
      handleAtualizarCotacoes();
    }, 3600000);

    return () => clearInterval(intervalId);
  }, [fetchPortfolio, handleAtualizarCotacoes]);

  const handleNovoAtivo = (classe?: string) => {
    setEditingAtivo(null);
    setInitialModalClasse(classe || "ACOES");
    setAssetModalOpen(true);
  };

  const handleEditAtivo = (ativo: AtivoCalculado) => {
    setEditingAtivo(ativo);
    setAssetModalOpen(true);
  };

  const handleAddTransacao = (ativo: AtivoCalculado) => {
    setTransacaoAtivo(ativo);
    setTransacaoModalOpen(true);
  };

  const handleDeleteAtivo = async (id: string, simbolo: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o ativo ${simbolo} e todo o seu histórico?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/ativos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error("Erro ao excluir ativo:", err);
    }
  };

  const nomesClasses: Record<string, string> = {
    ACOES: "Ações",
    FIIS: "FIIs",
    ETFS: "ETFs",
    RENDA_FIXA: "Renda Fixa",
  };

  const getUpdateBtnText = () => {
    if (updatingPrices) return "Buscando B3...";
    if (cooldown > 0) return `Aguarde ${cooldown}s...`;
    return "Atualizar Cotações";
  };

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
          nomeClasse={nomesClasses[activeTab] || activeTab}
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
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
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

          <div className="flex items-center gap-2.5">
            {/* Alternador de Tema Dark/Light */}
            <ThemeToggle />

            {/* Botão de Atualizar Cotações em Tempo Real */}
            <button
              type="button"
              onClick={() => handleAtualizarCotacoes(true)}
              disabled={updatingPrices || cooldown > 0}
              className={`bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${(updatingPrices || cooldown > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navegação por Abas de Classe */}
        <ClassTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          portfolio={portfolio}
        />

        {/* Conteúdo Principal */}
        {renderContent()}
      </main>

      {/* Modais */}
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

      {/* Toast Notification */}
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
