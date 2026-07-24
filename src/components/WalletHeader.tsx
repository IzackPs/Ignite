"use client";


import { Eye, EyeOff, Clock, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WalletHeaderProps {
  readonly userName?: string;
  readonly patrimonioInvestido: number;
  readonly isBalanceVisible: boolean;
  readonly onToggleBalance: () => void;
  readonly lastPriceUpdate?: string;
  readonly updatingPrices?: boolean;
  readonly onUpdatePrices?: () => void;
  readonly onLogout?: () => void;
}

export function WalletHeader({
  userName = "Usuário",
  patrimonioInvestido,
  isBalanceVisible,
  onToggleBalance,
  lastPriceUpdate,
  updatingPrices,
  onUpdatePrices,
  onLogout,
}: WalletHeaderProps) {
  return (
    <header className="border-b border-border-subtle/80 bg-surface/90 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Lado Esquerdo: Saudação Olá e Hora de Atualização Menor */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Olá, <span className="text-gold-main font-black">{userName}</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium mt-0.5">
              {lastPriceUpdate && (
                <>
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Atualizado: <strong className="text-zinc-300 font-mono">{lastPriceUpdate}</strong></span>
                </>
              )}
              {onUpdatePrices && (
                <button
                  type="button"
                  onClick={onUpdatePrices}
                  disabled={updatingPrices}
                  className="ml-1 p-0.5 text-gold-main hover:text-white transition-colors"
                  title="Sincronizar"
                  aria-label="Sincronizar"
                >
                  <Zap className={`w-3.5 h-3.5 ${updatingPrices ? "animate-bounce text-amber-400" : ""}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Patrimônio Consolidado Compacto + Botões Rápidos */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-2xl shadow-inner">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                <span>Patrimônio Consolidado</span>
                <button
                  type="button"
                  onClick={onToggleBalance}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label={isBalanceVisible ? "Ocultar saldo" : "Exibir saldo"}
                  title={isBalanceVisible ? "Ocultar saldo" : "Exibir saldo"}
                >
                  {isBalanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              
              <div className="text-xl sm:text-2xl font-black text-white font-mono leading-tight tracking-tight">
                {isBalanceVisible ? (
                  formatCurrency(patrimonioInvestido)
                ) : (
                  <span className="text-zinc-500 tracking-widest text-lg">R$ •••••</span>
                )}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors hidden sm:flex"
              title="Sair"
              aria-label="Sair"
            >
              <Zap className="hidden" />
              <span className="text-xs font-semibold">Sair</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
