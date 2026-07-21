"use client";

import React, { useState, useCallback } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { ClassTabs } from "@/components/ClassTabs";
import { AssetTable } from "@/components/AssetTable";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ProventosView } from "@/components/ProventosView";
import { SimuladorAporteBar } from "@/components/SimuladorAporteBar";
import { AssetModal } from "@/components/AssetModal";
import { TransactionModal } from "@/components/TransactionModal";
import { ClassGoalsModal } from "@/components/ClassGoalsModal";
import { RefreshCw } from "lucide-react";
import { Toast } from "@/components/Toast";
import { logout } from "@/actions/auth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useCotacoes } from "@/hooks/useCotacoes";

import { WalletHeader } from "@/components/WalletHeader";

const NOMES_CLASSES: Record<string, string> = {
  ACOES: "Ações",
  FIIS: "FIIs",
  ETFS: "ETFs",
  RENDA_FIXA: "Renda Fixa",
};

export default function Home() {
  const { portfolio, loading, fetchPortfolio, handleDeleteAtivo } = usePortfolio();
  const {
    updatingPrices,
    lastPriceUpdate,
    toast,
    setToast,
    handleAtualizarCotacoes,
  } = useCotacoes(fetchPortfolio);

  // Estados
  const [activeTab, setActiveTab] = useState<string>("GERAL");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<AtivoCalculado | null>(null);
  const [initialModalClasse, setInitialModalClasse] = useState("ACOES");
  const [transacaoModalOpen, setTransacaoModalOpen] = useState(false);
  const [transacaoAtivo, setTransacaoAtivo] = useState<AtivoCalculado | null>(null);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Investidor");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.name) {
          setUserName(session.user.name);
        }
      })
      .catch(() => {});
  }, []);

  // Handlers
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

  const renderContent = () => {
    if (loading && !portfolio) {
      return (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gold-main animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">Carregando dados da conta...</p>
        </div>
      );
    }

    if (!portfolio) {
      return <div className="py-16 text-center text-zinc-500">Nenhum dado encontrado.</div>;
    }



    if (activeTab === "GERAL") {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SimuladorAporteBar portfolio={portfolio} onRefresh={fetchPortfolio} />
          
          <PortfolioOverview 
            portfolio={portfolio} 
            onSelectTab={setActiveTab} 
            isBalanceVisible={isBalanceVisible} 
            onNovoAtivo={() => handleNovoAtivo()}
            onAddTransacao={() => {
              setTransacaoAtivo(null);
              setTransacaoModalOpen(true);
            }}
            onOpenMetasModal={() => setGoalsModalOpen(true)}
            cdiAnualPercentual={portfolio.cdiInfo ? portfolio.cdiInfo.taxaCdiAnual * 100 : undefined}
          />

          <DashboardCharts
            portfolio={portfolio}
            historico={portfolio.historico || []}
            onOpenMetasModal={() => setGoalsModalOpen(true)}
            onRefresh={fetchPortfolio}
            isBalanceVisible={isBalanceVisible}
          />
        </div>
      );
    }

    if (activeTab === "PROVENTOS") {
      return <ProventosView ativos={portfolio.ativos} />;
    }

    // Se for uma aba de classe de ativo (ACOES, FIIS, etc)
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <AssetTable
          ativos={portfolio.ativos.filter((a) => a.classe.toUpperCase() === activeTab)}
          resumoClasse={portfolio.resumoClasses.find((r) => r.classe === activeTab)}
          classeKey={activeTab}
          nomeClasse={NOMES_CLASSES[activeTab] || activeTab}
          onAddTransacao={handleAddTransacao}
          onEditAtivo={handleEditAtivo}
          onDeleteAtivo={handleDeleteAtivo}
          onNovoAtivo={handleNovoAtivo}
          isBalanceVisible={isBalanceVisible}
          cdiAnualFormatada={portfolio.cdiInfo?.taxaCdiAnualFormatada ? `${portfolio.cdiInfo.taxaCdiAnualFormatada} a.a.` : undefined}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-gold-main selection:text-white pb-16 transition-colors duration-200">
      
      <WalletHeader
        userName={userName}
        patrimonioInvestido={portfolio?.patrimonioTotal || 0}
        isBalanceVisible={isBalanceVisible}
        onToggleBalance={() => setIsBalanceVisible(!isBalanceVisible)}
        lastPriceUpdate={lastPriceUpdate || undefined}
        updatingPrices={updatingPrices}
        onUpdatePrices={() => handleAtualizarCotacoes(true)}
        onLogout={() => logout()}
        onOpenSettings={() => setGoalsModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <ClassTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          portfolio={portfolio}
        />
        {renderContent()}
      </main>

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
        ativos={portfolio?.ativos}
      />
      <ClassGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        onSave={fetchPortfolio}
        resumoClasses={portfolio?.resumoClasses || []}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
