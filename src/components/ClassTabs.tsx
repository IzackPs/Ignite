"use client";

import React from "react";
import { PortfolioCalculado } from "@/lib/calculator";
import {
  TrendingUp,
  Building,
  Globe,
  ShieldCheck,
  Coins,
  PieChart,
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
      icon: <PieChart className="w-4 h-4 text-gold-main" />,
    },
    {
      key: "PROVENTOS",
      label: "Proventos",
      icon: <Coins className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: "ACOES",
      label: "Ações",
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      meta: "40%",
    },
    {
      key: "FIIS",
      label: "FIIs",
      icon: <Building className="w-4 h-4 text-purple-500" />,
      meta: "10%",
    },
    {
      key: "ETFS",
      label: "ETFs",
      icon: <Globe className="w-4 h-4 text-amber-500" />,
      meta: "10%",
    },
    {
      key: "RENDA_FIXA",
      label: "Renda Fixa",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      meta: "40%",
    },
  ];

  return (
    <div className="bg-surface/90 border border-border-subtle p-1.5 rounded-xl shadow-lg flex flex-wrap items-center gap-1.5 backdrop-blur-md">
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
                  ? "bg-gold-main text-white shadow-md shadow-gold-main/30 scale-[1.02]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>

              {tab.meta && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-gold-hover/80 text-blue-100"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  }`}
                >
                  Meta {tab.meta}
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
