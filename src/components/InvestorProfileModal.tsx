"use client";
import React from "react";

import { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/Modal";
import { ResumoClasse } from "@/lib/calculator";
import {
  PerfilRisco,
  PERFIS_RISCO_INFO,
  calcularAlocacaoRecomendada,
} from "@/lib/profile-calculator";
import {
  Compass,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Building,
  Globe,
  Coins,
  ShieldCheck,
} from "lucide-react";

interface InvestorProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly resumoClasses: ResumoClasse[];
  readonly onSave: () => void;
}

const NOMES_CLASSES: Record<string, { label: string; icon: React.ReactNode }> = {
  ACOES_NACIONAIS: {
    label: "Ações Nacionais",
    icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
  },
  ACOES_INTERNACIONAIS: {
    label: "Ações Internacionais",
    icon: <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
  },
  FIIS: {
    label: "Fundos Imobiliários",
    icon: <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
  },
  REITS: {
    label: "REITs",
    icon: <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />,
  },
  CRIPTO: {
    label: "Criptomoedas",
    icon: <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  },
  RENDA_FIXA: {
    label: "Renda Fixa",
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
  },
  RENDA_FIXA_INTERNACIONAL: {
    label: "Renda Fixa Int.",
    icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />,
  },
};

function renderDiffBadge(diferenca: number) {
  if (diferenca > 0) {
    return (
      <span className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
        +{diferenca}%
      </span>
    );
  }
  if (diferenca < 0) {
    return (
      <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
        {diferenca}%
      </span>
    );
  }
  return <span className="text-zinc-500 font-bold">=</span>;
}

export function InvestorProfileModal({
  isOpen,
  onClose,
  resumoClasses,
  onSave,
}: InvestorProfileModalProps) {
  const [idade, setIdade] = useState<number>(30);
  const [perfil, setPerfil] = useState<PerfilRisco>("MODERADO");
  const [showExplanation, setShowExplanation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const resultado = calcularAlocacaoRecomendada(perfil, idade);

  const handleApplyGoals = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/metas-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metas: resultado.metasRecomendadas }),
      });

      if (!res.ok) {
        throw new Error("Erro ao aplicar sugestão de metas de classe");
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Falha ao salvar metas");
    } finally {
      setSaving(false);
    }
  };

  const perfilIcons: Record<PerfilRisco, React.ReactNode> = {
    CONSERVADOR: <Shield className="w-4 h-4 text-emerald-400" />,
    MODERADO: <TrendingUp className="w-4 h-4 text-amber-400" />,
    ARROJADO: <Zap className="w-4 h-4 text-purple-400" />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil de Investimento & Sugestão por Idade"
      description="Calcula a distribuição ideal por categoria de ativo (%) combinando idade e tolerância a risco."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Banner Orientativo Compacto */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/90 leading-tight">
            <strong className="text-amber-400 font-bold">Orientação por Categoria (%):</strong>{" "}
            Avalia a distribuição ideal em porcentagem por classe de ativo ajustada pela idade. 
            <em> Não analisamos e nem sugerimos ativos ou tickers individuais.</em>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-2.5 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-2.5 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Sugestão aplicada com sucesso como suas novas Metas de Classe!
          </div>
        )}

        {/* Bloco Superior Quadrado: Idade + 3 Perfis */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Seletor de Idade */}
          <div className="sm:col-span-4 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              <span>Sua Idade:</span>
              <span className="text-gold-main font-mono text-[10px]">Anos</span>
            </div>

            <div className="flex items-center gap-2 my-1">
              <input
                type="number"
                min={18}
                max={90}
                value={idade}
                onChange={(e) => setIdade(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl py-1 px-2 text-xl font-black text-gold-main font-mono text-center focus:outline-none focus:border-gold-main"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[25, 35, 50, 65].map((ageVal) => (
                <button
                  type="button"
                  key={ageVal}
                  onClick={() => setIdade(ageVal)}
                  className={`py-0.5 rounded text-[9px] font-bold font-mono transition-colors ${
                    idade === ageVal
                      ? "bg-gold-main text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {ageVal}
                </button>
              ))}
            </div>
          </div>

          {/* Perfis de Risco */}
          <div className="sm:col-span-8 grid grid-cols-3 gap-2">
            {(["CONSERVADOR", "MODERADO", "ARROJADO"] as const).map((pKey) => {
              const info = PERFIS_RISCO_INFO[pKey];
              const isSelected = perfil === pKey;

              return (
                <button
                  type="button"
                  key={pKey}
                  onClick={() => setPerfil(pKey)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-zinc-900 border-gold-main ring-1 ring-gold-main/40 shadow"
                      : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {perfilIcons[pKey]}
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-main" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{info.nome}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Como a Idade afeta o cálculo? (Acordeão Compacto) */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-2.5 space-y-1">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-300 hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-gold-main" />
              Como a Idade ajusta as porcentagens?
            </span>
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {showExplanation && (
            <div className="text-[10px] text-zinc-400 space-y-1 pt-1.5 border-t border-zinc-800/60 leading-normal animate-in fade-in">
              <p>
                <strong>Regra do Planejamento:</strong> Jovens (18-35 anos) possuem maior prazo para absorver oscilações e alavancar ganhos em Renda Variável. Conforme a idade aumenta (50-70+ anos), a parcela de <strong>Renda Fixa</strong> cresce para preservar o patrimônio acumulado.
              </p>
              <div className="bg-zinc-950 px-2 py-1 rounded font-mono text-[9.5px] text-amber-300 border border-zinc-800">
                Fórmula Renda Fixa: 
                {perfil === "CONSERVADOR" && " Idade + 15% (máx 85%)"}
                {perfil === "MODERADO" && " Idade % (entre 20% e 75%)"}
                {perfil === "ARROJADO" && " Idade - 15% (mín 10%)"}
              </div>
            </div>
          )}
        </div>

        {/* Divisão Macro Progress Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-main" />
              Divisão Macro Sugerida:
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">
              {resultado.rendaFixaPercentualTotal}% RF | {resultado.rendaVariavelPercentualTotal}% RV
            </span>
          </div>

          <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-zinc-800">
            <div
              style={{ width: `${resultado.rendaFixaPercentualTotal}%` }}
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-l-full transition-all duration-300"
              title={`Renda Fixa: ${resultado.rendaFixaPercentualTotal}%`}
            />
            <div
              style={{ width: `${resultado.rendaVariavelPercentualTotal}%` }}
              className="bg-gradient-to-r from-gold-main to-amber-500 h-full rounded-r-full transition-all duration-300"
              title={`Renda Variável: ${resultado.rendaVariavelPercentualTotal}%`}
            />
          </div>
        </div>

        {/* Grid Quadrado das 7 Categorias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(resultado.metasRecomendadas).map(([classeKey, metaSugerida]) => {
            const infoClasse = NOMES_CLASSES[classeKey];
            const metaAtual =
              resumoClasses.find((r) => r.classe === classeKey)?.metaPercentual || 0;
            const diferenca = metaSugerida - metaAtual;

            return (
              <div
                key={classeKey}
                className="bg-zinc-900/60 border border-border-subtle p-2.5 rounded-xl flex items-center justify-between hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
                    {infoClasse?.icon || <Building className="w-3.5 h-3.5 text-zinc-400" />}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs text-white truncate">
                      {infoClasse?.label || classeKey}
                    </div>
                    <div className="w-20 h-1 bg-zinc-950 rounded-full mt-0.5 overflow-hidden border border-zinc-800">
                      <div
                        style={{ width: `${metaSugerida}%` }}
                        className="h-full bg-gold-main rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block">Atual</span>
                    <span className="font-mono text-xs font-bold text-zinc-400">{metaAtual}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-gold-main block font-bold">Sugerida</span>
                    <span className="font-mono text-xs font-black text-gold-main">{metaSugerida}%</span>
                  </div>

                  <div className="w-12 text-right font-mono text-[10px]">
                    {renderDiffBadge(diferenca)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs text-zinc-400 hover:bg-zinc-900 rounded-xl"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleApplyGoals}
            disabled={saving || success}
            className="px-5 py-2.5 text-xs font-bold bg-gold-main hover:bg-gold-hover text-white rounded-xl transition-all shadow-md shadow-gold-main/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Compass className="w-4 h-4" />
            <span>{saving ? "Aplicando..." : "Aplicar Sugestão como Minhas Metas"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
