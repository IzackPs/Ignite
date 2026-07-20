"use client";

import React from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import {
  LayoutDashboard,
  TrendingUp,
  Building,
  Globe,
  ShieldCheck,
  Coins,
} from "lucide-react";

interface ClassTabsProps {
  readonly activeTab: string;
  readonly onChangeTab: (tabKey: string) => void;
  readonly portfolio?: PortfolioCalculado | null;
}

export function ClassTabs({
  activeTab,
  onChangeTab,
  portfolio,
}: ClassTabsProps) {
  const tabs = [
    {
      key: "GERAL",
      label: "Visão Geral",
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: "Dashboard",
    },
    {
      key: "PROVENTOS",
      label: "Proventos",
      icon: <Coins className="w-4 h-4 text-emerald-400" />,
      badge: "Renda Passiva",
    },
    {
      key: "ACOES",
      label: "Ações",
      icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
      meta: "40%",
    },
    {
      key: "FIIS",
      label: "FIIs",
      icon: <Building className="w-4 h-4 text-purple-400" />,
      meta: "10%",
    },
    {
      key: "ETFS",
      label: "ETFs",
      icon: <Globe className="w-4 h-4 text-amber-400" />,
      meta: "10%",
    },
    {
      key: "RENDA_FIXA",
      label: "Renda Fixa",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      meta: "40%",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg flex flex-wrap items-center gap-1.5 backdrop-blur-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const resumo = portfolio?.resumoClasses.find(
          (r) => r.classe === tab.key
        );

        return (
            <button
              type="button"
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>

              {tab.meta && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-blue-700/80 text-blue-100"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  Meta {tab.meta}
                </span>
              )}

              {tab.key === "PROVENTOS" && (
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Renda
                </span>
              )}

              {resumo?.status === "COMPRAR" && !isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
        );
      })}
    </div>
  );
}
