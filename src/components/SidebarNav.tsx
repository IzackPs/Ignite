"use client";

import React, { useState } from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Globe,
  Coins,
  Award,
  TrendingUp,
  Building,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  LogOut,
  Eye,
  EyeOff,
  Settings,
  Menu,
  X,
  Camera,
  Clock,
  HelpCircle,
  Wallet,
  Compass,
  PlusCircle,
  FileText,
} from "lucide-react";

interface SidebarNavProps {
  readonly activeTab: string;
  readonly onChangeTab: (tabKey: string) => void;
  readonly portfolio?: PortfolioCalculado | null;
  readonly userName?: string;
  readonly userImage?: string | null;
  readonly isBalanceVisible?: boolean;
  readonly onToggleBalance?: () => void;
  readonly onUpdatePrices?: () => void;
  readonly updatingPrices?: boolean;
  readonly lastPriceUpdate?: string;
  readonly onLogout?: () => void;
  readonly onOpenSettings?: () => void;
  readonly onOpenAvatarModal?: () => void;
  readonly onOpenProfileModal?: () => void;
  readonly onOpenSimuladorModal?: () => void;
  readonly onNovoAtivo?: () => void;
  readonly onAddTransacao?: () => void;
}

export function SidebarNav({
  activeTab,
  onChangeTab,
  portfolio,
  userName = "Investidor",
  userImage,
  isBalanceVisible = true,
  onToggleBalance,
  onUpdatePrices,
  updatingPrices = false,
  lastPriceUpdate,
  onLogout,
  onOpenSettings,
  onOpenAvatarModal,
  onOpenProfileModal,
  onOpenSimuladorModal,
  onNovoAtivo,
  onAddTransacao,
}: SidebarNavProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClassesOpen, setIsClassesOpen] = useState(true);

  // Lista de Categorias / Classes de Ativos para o Submenu
  const classesAtivos = [
    {
      key: "ACOES_NACIONAIS",
      label: "Ações Nacionais",
      icon: <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />,
    },
    {
      key: "ACOES_INTERNACIONAIS",
      label: "Ações Internacionais",
      icon: <Globe className="w-4 h-4 text-sky-400 shrink-0" />,
    },
    {
      key: "FIIS",
      label: "Fundos Imobiliários",
      icon: <Building className="w-4 h-4 text-purple-400 shrink-0" />,
    },
    {
      key: "REITS",
      label: "REITs",
      icon: <Building className="w-4 h-4 text-indigo-400 shrink-0" />,
    },
    {
      key: "CRIPTO",
      label: "Criptomoedas",
      icon: <Coins className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    {
      key: "RENDA_FIXA",
      label: "Renda Fixa",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    {
      key: "RENDA_FIXA_INTERNACIONAL",
      label: "Renda Fixa Int.",
      icon: <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />,
    },
  ];

  const handleSelectTab = (key: string) => {
    onChangeTab(key);
    setIsMobileOpen(false);
  };

  const isClassActive = classesAtivos.some((c) => c.key === activeTab);
  const expanded = isHovered || isMobileOpen;
  const initials = userName.charAt(0).toUpperCase();

  const patrimonioTotal = portfolio?.patrimonioTotal || 0;

  const sidebarContent = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col h-full bg-surface border-r border-border-subtle py-2.5 select-none overflow-y-auto scrollbar-hide transition-all duration-300 ease-in-out ${
        expanded ? "w-64 px-3" : "w-16 px-2 items-center"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center pt-1 pb-3 border-b border-border-subtle/80 ${
          expanded ? "justify-between px-2" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-main to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-gold-main/20 shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          {expanded && (
            <div className="animate-in fade-in duration-200">
              <div className="font-bold text-base text-white tracking-tight leading-none flex items-center gap-1">
                Ignite <span className="text-gold-main font-black">Finanças</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase mt-1">
                Gestão de Carteira
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User Info Card (Sem o botão de adicionar) */}
      <div
        className={`bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center mt-2.5 mb-2 ${
          expanded ? "p-2 justify-between" : "p-1.5 justify-center"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAvatarModal}
            title="Alterar Foto de Perfil"
            className="relative group shrink-0 focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-gold-main/20 border border-gold-main/40 flex items-center justify-center font-bold text-gold-main text-xs overflow-hidden shadow-sm transition-transform group-hover:scale-105">
              {userImage && (userImage.startsWith("http") || userImage.startsWith("data:image")) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-gold-main text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-2 h-2" />
            </div>
          </button>

          {expanded && (
            <div className="truncate animate-in fade-in duration-200">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                {userName}
              </div>
              <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget de Patrimônio Consolidado na Barra Lateral */}
      <div
        className={`bg-zinc-900/40 border border-border-subtle rounded-xl mb-2 transition-all ${
          expanded ? "p-2.5" : "p-1.5 text-center"
        }`}
      >
        {expanded ? (
          <div className="space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              <span>Patrimônio Consolidado</span>
              {onToggleBalance && (
                <button
                  type="button"
                  onClick={onToggleBalance}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label={isBalanceVisible ? "Ocultar saldo" : "Exibir saldo"}
                  title={isBalanceVisible ? "Ocultar saldo" : "Exibir saldo"}
                >
                  {isBalanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-gold-main" />}
                </button>
              )}
            </div>
            <div className="text-lg font-black text-white font-mono leading-tight">
              {isBalanceVisible ? (
                formatCurrency(patrimonioTotal)
              ) : (
                <span className="text-zinc-500 tracking-widest text-base">R$ •••••</span>
              )}
            </div>
            {lastPriceUpdate && (
              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                <span className="flex items-center gap-1 truncate">
                  <Clock className="w-2.5 h-2.5 text-zinc-400" /> {lastPriceUpdate}
                </span>
                {onUpdatePrices && (
                  <button
                    type="button"
                    onClick={onUpdatePrices}
                    disabled={updatingPrices}
                    className="p-0.5 text-gold-main hover:text-white transition-colors"
                    title="Sincronizar"
                    aria-label="Sincronizar"
                  >
                    <Zap className={`w-3 h-3 ${updatingPrices ? "animate-bounce text-amber-400" : ""}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleBalance}
            className="w-full flex flex-col items-center justify-center py-1.5 cursor-pointer text-zinc-400 hover:text-gold-main transition-colors"
            title={`Patrimônio Consolidado: ${isBalanceVisible ? formatCurrency(patrimonioTotal) : "R$ •••••"}`}
          >
            <Wallet className="w-4 h-4 text-gold-main" />
          </button>
        )}
      </div>

      {/* Botões de Ação Rápidas de Investimento */}
      {(onNovoAtivo || onAddTransacao) && (
        <div className="space-y-1 mb-2 w-full">
          {onNovoAtivo && (
            <button
              type="button"
              onClick={onNovoAtivo}
              title="Adicionar Novo Ativo"
              className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-bold transition-all ${
                expanded ? "px-3" : "px-0"
              } bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {expanded && <span>Novo Ativo</span>}
            </button>
          )}

          {onAddTransacao && (
            <button
              type="button"
              onClick={onAddTransacao}
              title="Registrar Operação (Compra/Venda)"
              className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-bold transition-all ${
                expanded ? "px-3" : "px-0"
              } bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80`}
            >
              <FileText className="w-4 h-4 text-gold-main shrink-0" />
              {expanded && <span>Registrar Operação</span>}
            </button>
          )}
        </div>
      )}

      {/* Navegação Principal */}
      <div className="space-y-0.5 w-full">
        {expanded && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-1 animate-in fade-in">
            Menu Principal
          </div>
        )}

        {/* Visão Geral (Consolidado) */}
        <button
          type="button"
          onClick={() => handleSelectTab("GERAL")}
          title="Visão Geral (Consolidado)"
          className={`w-full flex items-center py-2 rounded-xl text-xs font-semibold transition-all ${
            expanded ? "justify-between px-3" : "justify-center px-0"
          } ${
            activeTab === "GERAL"
              ? "bg-gold-main text-white shadow-md shadow-gold-main/20 font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <PieChart className="w-4 h-4 shrink-0" />
            {expanded && <span>Visão Geral</span>}
          </div>
          {expanded && portfolio?.ativos && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "GERAL"
                  ? "bg-gold-hover text-white"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}
            >
              {portfolio.ativos.length}
            </span>
          )}
        </button>

        {/* Simulador de Aporte (Modal de Sobreposição) */}
        {onOpenSimuladorModal && (
          <button
            type="button"
            onClick={onOpenSimuladorModal}
            title="Simulador Inteligente de Aporte"
            className={`w-full flex items-center py-2 rounded-xl text-xs font-semibold transition-all ${
              expanded ? "justify-between px-3" : "justify-center px-0"
            } text-zinc-400 hover:text-white hover:bg-zinc-900/80`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-gold-main shrink-0" />
              {expanded && <span>Simulador de Aporte</span>}
            </div>
            {expanded && (
              <span className="text-[9px] bg-gold-main/20 text-gold-main border border-gold-main/30 px-1.5 py-0.5 rounded-md font-bold">
                IA
              </span>
            )}
          </button>
        )}

        {/* Proventos */}
        <button
          type="button"
          onClick={() => handleSelectTab("PROVENTOS")}
          title="Proventos & Dividendos"
          className={`w-full flex items-center py-2 rounded-xl text-xs font-semibold transition-all ${
            expanded ? "justify-between px-3" : "justify-center px-0"
          } ${
            activeTab === "PROVENTOS"
              ? "bg-gold-main text-white shadow-md shadow-gold-main/20 font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
            {expanded && <span>Proventos & Dividendos</span>}
          </div>
        </button>

        {/* Nota Ignite */}
        <button
          type="button"
          onClick={() => handleSelectTab("CRITERIOS")}
          title="Nota Ignite (Critérios)"
          className={`w-full flex items-center py-2 rounded-xl text-xs font-semibold transition-all ${
            expanded ? "justify-between px-3" : "justify-center px-0"
          } ${
            activeTab === "CRITERIOS"
              ? "bg-gold-main text-white shadow-md shadow-gold-main/20 font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-purple-400 shrink-0" />
            {expanded && <span>Nota Ignite (Critérios)</span>}
          </div>
          {expanded && <Sparkles className="w-3.5 h-3.5 text-gold-main shrink-0" />}
        </button>
      </div>

      {/* Submenu: Ativos por Classe */}
      <div className="space-y-1 pt-3 border-t border-border-subtle/80 w-full mt-2">
        {expanded ? (
          <button
            type="button"
            onClick={() => setIsClassesOpen(!isClassesOpen)}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              isClassActive ? "text-gold-main" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Ativos por Classe
            </span>
            {isClassesOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="flex justify-center py-1 text-zinc-500 text-[10px] font-bold">
            <Building className="w-4 h-4 text-zinc-500" />
          </div>
        )}

        {(isClassesOpen || !expanded) && (
          <div className={`space-y-1 ${expanded ? "pl-2" : "w-full"}`}>
            {classesAtivos.map((cls) => {
              const isActive = activeTab === cls.key;
              const resumo = portfolio?.resumoClasses.find((r) => r.classe === cls.key);
              const qtdAtivos =
                portfolio?.ativos.filter((a) => a.classe.toUpperCase() === cls.key).length || 0;

              return (
                <button
                  type="button"
                  key={cls.key}
                  onClick={() => handleSelectTab(cls.key)}
                  title={cls.label}
                  className={`w-full flex items-center py-2 rounded-xl text-xs font-semibold transition-all ${
                    expanded ? "justify-between px-3" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-gold-main/20 border border-gold-main/40 text-gold-main font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {cls.icon}
                    {expanded && <span className="truncate">{cls.label}</span>}
                  </div>

                  {expanded && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {resumo?.status === "COMPRAR" && !isActive && (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                          title="Bolinha Verde: Sugestão de COMPRA (esta classe de ativos está abaixo da meta cadastrada)"
                        />
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? "bg-gold-main/30 text-gold-main font-bold"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        {qtdAtivos}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Spacer para empurrar o rodapé */}
      <div className="flex-1 min-h-[20px]" />

      {/* Rodapé / Ações Rápidas da Barra Lateral */}
      <div className="pt-3 border-t border-border-subtle space-y-1 w-full">
        {onUpdatePrices && (
          <button
            type="button"
            onClick={onUpdatePrices}
            disabled={updatingPrices}
            title="Sincronizar"
            aria-label="Sincronizar"
            className={`w-full flex items-center py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors ${
              expanded ? "justify-start px-3 gap-2" : "justify-center px-0"
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 text-gold-main shrink-0 ${
                updatingPrices ? "animate-bounce text-amber-400" : ""
              }`}
            />
            {expanded && <span>{updatingPrices ? "Sincronizando..." : "Sincronizar"}</span>}
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title="Configurar Metas"
            className={`w-full flex items-center py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors ${
              expanded ? "justify-start px-3 gap-2" : "justify-center px-0"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            {expanded && <span>Configurar Metas</span>}
          </button>
        )}

        {onOpenProfileModal && (
          <button
            type="button"
            onClick={onOpenProfileModal}
            title="Perfil de Investimento (Suitability)"
            className={`w-full flex items-center py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors ${
              expanded ? "justify-start px-3 gap-2" : "justify-center px-0"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            {expanded && <span>Perfil de Investimento</span>}
          </button>
        )}

        <button
          type="button"
          onClick={() => handleSelectTab("FAQ")}
          title="Ajuda & Matemática do Sistema"
          className={`w-full flex items-center py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors ${
            expanded ? "justify-start px-3 gap-2" : "justify-center px-0"
          } ${activeTab === "FAQ" ? "bg-gold-main/20 text-gold-main font-bold border border-gold-main/30" : ""}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          {expanded && <span>Ajuda & Matemática</span>}
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sair"
            aria-label="Sair"
            className={`w-full flex items-center py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors ${
              expanded ? "justify-start px-3 gap-2" : "justify-center px-0"
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {expanded && <span>Sair do Ignite</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Botão de Menu para Celulares/Tablets */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-12 h-12 rounded-full bg-gold-main text-white shadow-xl shadow-gold-main/40 flex items-center justify-center font-bold"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Drawer Overlay Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-surface z-50 shadow-2xl h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Sidebar Desktop Dinâmica (Expande ao passar o mouse) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 ${
          isHovered ? "w-64 shadow-2xl shadow-black/50" : "w-16"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
