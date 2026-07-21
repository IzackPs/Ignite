"use client";

import React from "react";
import { Eye, EyeOff, PieChart, Clock, Zap, LogOut, Settings } from "lucide-react";
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
  readonly onOpenSettings?: () => void;
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
  onOpenSettings,
}: WalletHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Top bar: Logo, Greeting, Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-black">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Olá, {userName}
              </h1>
              {lastPriceUpdate && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                  <Clock className="w-3 h-3" /> Atualizado: {lastPriceUpdate}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUpdatePrices && (
              <button
                type="button"
                onClick={onUpdatePrices}
                disabled={updatingPrices}
                className="p-2 rounded-full text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 hidden sm:flex"
                title="Sincronizar"
              >
                <Zap className={`w-5 h-5 ${updatingPrices ? "animate-bounce" : ""}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-full text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Balance Area */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Patrimônio Consolidado
              </h2>
              <button
                type="button"
                onClick={onToggleBalance}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
                aria-label={isBalanceVisible ? "Ocultar saldo" : "Exibir saldo"}
              >
                {isBalanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-4xl sm:text-5xl font-black text-white flex items-baseline gap-2 h-12">
              <span className="text-2xl text-zinc-500 font-medium">R$</span>
              {isBalanceVisible ? (
                formatCurrency(patrimonioInvestido).replace("R$", "").trim()
              ) : (
                <span className="translate-y-1 block tracking-[0.2em] mt-2">••••••</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
