"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { SidebarNav } from "@/components/SidebarNav";
import { AssetTable } from "@/components/AssetTable";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ProventosView } from "@/components/ProventosView";
import { AssetModal } from "@/components/AssetModal";
import { TransactionModal } from "@/components/TransactionModal";
import { ClassGoalsModal } from "@/components/ClassGoalsModal";
import { UserAvatarModal } from "@/components/UserAvatarModal";
import { InvestorProfileModal } from "@/components/InvestorProfileModal";
import { SimuladorModal } from "@/components/SimuladorModal";
import { RefreshCw } from "lucide-react";
import { Toast } from "@/components/Toast";
import { logout } from "@/actions/auth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useCotacoes } from "@/hooks/useCotacoes";
import { QuestionManagementView } from "@/components/QuestionManagementView";
import { FaqView } from "@/components/FaqView";

const NOMES_CLASSES: Record<string, string> = {
  ACOES_NACIONAIS: "Ações Nacionais",
  ACOES_INTERNACIONAIS: "Ações Internacionais",
  FIIS: "Fundos Imobiliários",
  REITS: "REITs",
  CRIPTO: "Criptomoedas",
  RENDA_FIXA: "Renda Fixa",
  RENDA_FIXA_INTERNACIONAL: "Renda Fixa Internacional",
  TODOS_ATIVOS: "Todos os Ativos (Consolidado)",
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
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [simuladorModalOpen, setSimuladorModalOpen] = useState(false);
  const [userName, setUserName] = useState("Investidor");
  const [userImage, setUserImage] = useState<string | null>(null);

  const fetchUserProfile = useCallback(() => {
    fetch("/api/user/avatar")
      .then((res) => res.json())
      .then((user) => {
        if (user?.name) setUserName(user.name);
        if (user?.image !== undefined) setUserImage(user.image);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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

          {/* Ativos Consolidados Integrados na Visão Geral */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>Meus Ativos (Consolidado)</span>
              <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                {portfolio.ativos.length}
              </span>
            </h3>
            <AssetTable
              ativos={portfolio.ativos}
              resumoClasse={{
                classe: "TODOS_ATIVOS",
                nomeClasse: "Todos os Ativos (Consolidado)",
                metaPercentual: 100,
                valorMercadoTotal: portfolio.patrimonioTotal,
                percentualAtual: 100,
                faltaR$: 0,
                status: "AGUARDAR",
              }}
              classeKey="TODOS_ATIVOS"
              nomeClasse="Todos os Ativos (Consolidado)"
              onAddTransacao={handleAddTransacao}
              onEditAtivo={handleEditAtivo}
              onDeleteAtivo={handleDeleteAtivo}
              onNovoAtivo={handleNovoAtivo}
              isBalanceVisible={isBalanceVisible}
              cdiAnualFormatada={portfolio.cdiInfo?.taxaCdiAnualFormatada ? `${portfolio.cdiInfo.taxaCdiAnualFormatada} a.a.` : undefined}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "PROVENTOS") {
      return <ProventosView ativos={portfolio.ativos} />;
    }

    if (activeTab === "CRITERIOS") {
      return <QuestionManagementView />;
    }

    if (activeTab === "FAQ") {
      return <FaqView />;
    }

    // Se for uma aba de classe de ativo (ACOES_NACIONAIS, FIIS, etc)
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-gold-main selection:text-white flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* Barra Lateral na Esquerda (Sidebar Principal) */}
      <SidebarNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        portfolio={portfolio}
        userName={userName}
        userImage={userImage}
        isBalanceVisible={isBalanceVisible}
        onToggleBalance={() => setIsBalanceVisible(!isBalanceVisible)}
        onUpdatePrices={() => handleAtualizarCotacoes(true)}
        updatingPrices={updatingPrices}
        lastPriceUpdate={lastPriceUpdate || undefined}
        onLogout={() => logout()}
        onOpenSettings={() => setGoalsModalOpen(true)}
        onOpenAvatarModal={() => setAvatarModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenSimuladorModal={() => setSimuladorModalOpen(true)}
        onNovoAtivo={() => handleNovoAtivo()}
        onAddTransacao={() => {
          setTransacaoAtivo(null);
          setTransacaoModalOpen(true);
        }}
      />

      {/* Conteúdo Principal da Direita */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

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
      <UserAvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentImage={userImage}
        userName={userName}
        onSave={(newImg) => {
          setUserImage(newImg);
          fetchUserProfile();
        }}
      />
      <InvestorProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        resumoClasses={portfolio?.resumoClasses || []}
        onSave={fetchPortfolio}
      />
      {portfolio && (
        <SimuladorModal
          isOpen={simuladorModalOpen}
          onClose={() => setSimuladorModalOpen(false)}
          portfolio={portfolio}
          onRefresh={fetchPortfolio}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
