"use client";

import React from "react";
import { AtivoCalculado, ResumoClasse } from "@/lib/calculator";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Clock,
  PlusCircle,
  Pencil,
  Trash2,
  Sparkles,
  Coins,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface AssetTableProps {
  readonly ativos: AtivoCalculado[];
  readonly resumoClasse?: ResumoClasse;
  readonly classeKey: string;
  readonly nomeClasse: string;
  readonly onAddTransacao?: (ativo: AtivoCalculado) => void;
  readonly onEditAtivo?: (ativo: AtivoCalculado) => void;
  readonly onDeleteAtivo?: (id: string, simbolo: string) => void;
  readonly onNovoAtivo?: (classe: string) => void;
  readonly isBalanceVisible?: boolean;
  readonly cdiAnualFormatada?: string;
}

function formatFalta(falta: number, isVisible: boolean): string {
  if (falta <= 0) return "R$ 0,00";
  return isVisible ? formatCurrency(falta) : "R$ ••••";
}

function getAlocacaoBarColor(diff: number): string {
  if (diff < -2) return "bg-amber-400";
  if (diff > 2) return "bg-rose-400";
  return "bg-emerald-400";
}

function getDefasagemTextColor(diff: number): string {
  if (Math.abs(diff) <= 2) return "text-emerald-500 font-bold";
  if (diff < 0) return "text-amber-500 font-bold";
  return "text-rose-500 font-bold";
}

interface AssetTableRowProps {
  readonly ativo: AtivoCalculado;
  readonly isFIIsTab: boolean;
  readonly isRendaFixaTab: boolean;
  readonly isBalanceVisible: boolean;
  readonly onAddTransacao?: (ativo: AtivoCalculado) => void;
  readonly onEditAtivo?: (ativo: AtivoCalculado) => void;
  readonly onDeleteAtivo?: (id: string, simbolo: string) => void;
}

function AssetTableRow({
  ativo,
  isFIIsTab,
  isRendaFixaTab,
  isBalanceVisible,
  onAddTransacao,
  onEditAtivo,
  onDeleteAtivo,
}: AssetTableRowProps) {
  const isLucro = ativo.lucroPrejuizoR$ >= 0;
  const isComprar = ativo.status === "COMPRAR";
  const diffAlocacao = ativo.percentualAtual - ativo.percentualIdeal;

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
      {/* Ativo / Ticker */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          {ativo.logoUrl ? (
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0 border border-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ativo.logoUrl} alt={ativo.simbolo} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="font-mono font-bold text-base text-foreground bg-zinc-100 dark:bg-white/10 px-2.5 py-1 rounded border border-border-subtle group-hover:border-gold-main/50 transition-colors">
              {ativo.simbolo}
            </div>
          )}
          <div>
            <div className="font-medium text-foreground text-xs truncate max-w-[140px] flex items-center gap-2">
              {ativo.logoUrl && (
                <span className="font-mono font-bold text-zinc-400 group-hover:text-gold-main transition-colors text-[10px]">
                  {ativo.simbolo}
                </span>
              )}
              {ativo.nome}
            </div>
            {ativo.setor && (
              <div className="text-[10px] text-zinc-500">
                {ativo.setor}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Quantidade */}
      <td className="py-3 px-3 text-right font-mono text-xs">
        {formatNumber(ativo.quantidadeAtual)}
      </td>

      {/* Preço Médio */}
      <td className="py-3 px-3 text-right font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {formatCurrency(ativo.precoMedio)}
      </td>

      {/* Total Investido */}
      <td className="py-3 px-3 text-right font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {isBalanceVisible ? formatCurrency(ativo.totalInvestido) : "R$ ••••"}
      </td>

      {/* Preço Atual */}
      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-foreground">
        {formatCurrency(ativo.precoAtual)}
      </td>

      {/* Coluna Provento / Cota (se FII) */}
      {isFIIsTab && (
        <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-purple-300 bg-purple-950/20">
          {formatCurrency(ativo.ultimoProvento)}
        </td>
      )}

      {/* Coluna Número Mágico (se FII) */}
      {isFIIsTab && (
        <td className="py-3 px-3 text-right font-mono text-xs font-bold text-purple-200 bg-purple-950/20">
          {ativo.numeroMagico > 0 ? (
            <div>
              <span>{ativo.numeroMagico} cotas</span>
              <span className="block text-[9px] text-zinc-400 font-normal">
                Faltam: {ativo.cotasFaltantesMagico}
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 font-normal">-</span>
          )}
        </td>
      )}

      {/* Colunas Exclusivas de Renda Fixa Pro-Rata */}
      {isRendaFixaTab && (
        <td className="py-3 px-3 text-right font-mono text-xs font-bold text-emerald-400 bg-emerald-950/20">
          {ativo.taxaRentabilidade}% CDI
        </td>
      )}

      {isRendaFixaTab && (
        <td className="py-3 px-3 text-right font-mono text-xs font-bold text-emerald-300 bg-emerald-950/20">
          + {formatCurrency(ativo.rendimentoProRataR$)}
          <span className="block text-[9px] text-zinc-400 font-normal">
            ({ativo.diasUteisDecorridos} d.ú.)
          </span>
        </td>
      )}

      {/* Valor de Mercado */}
      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
        {isBalanceVisible ? formatCurrency(ativo.valorMercado) : "R$ ••••"}
      </td>

      {/* Lucro / Prejuízo */}
      <td className="py-3 px-3 text-right font-mono text-xs">
        <div
          className={`flex items-center justify-end gap-1 ${
            isLucro ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isLucro ? (
            <TrendingUp className="w-3 h-3 shrink-0" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3 shrink-0" aria-hidden="true" />
          )}
          <span>{isBalanceVisible ? formatCurrency(ativo.lucroPrejuizoR$) : "R$ ••••"}</span>
        </div>
        <div
          className={`text-[10px] font-semibold ${
            isLucro ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isLucro ? "+" : ""}
          {formatPercent(ativo.lucroPrejuizoPercentual)}
        </div>
      </td>

      {/* Alocação / Defasagem (Barra Visual) */}
      <td className="py-3 px-3 align-middle w-48">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-zinc-300 font-semibold">{formatPercent(ativo.percentualAtual)}</span>
            <span className="text-gold-main font-semibold">Meta: {formatPercent(ativo.percentualIdeal, 1)}</span>
          </div>
          <div className="relative w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${getAlocacaoBarColor(diffAlocacao)}`}
              style={{
                width: `${Math.min(
                  100,
                  (ativo.percentualAtual / (ativo.percentualIdeal || 1)) * 100
                )}%`,
              }}
            />
            {/* Meta marker line */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white/40"
              style={{ left: "100%" }}
              title={`Meta: ${ativo.percentualIdeal}%`}
            />
          </div>
          {/* Label de defasagem */}
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-zinc-500">Defasagem:</span>
            <span className={getDefasagemTextColor(diffAlocacao)}>
              {diffAlocacao > 0 ? "+" : ""}
              {diffAlocacao.toFixed(1)}%
            </span>
          </div>
        </div>
      </td>

      {/* Falta (R$) */}
      <td className="py-3 px-3 text-right font-mono text-xs font-semibold">
        <span
          className={
            ativo.faltaR$ > 0
              ? "text-emerald-400"
              : "text-zinc-500"
          }
        >
          {formatFalta(ativo.faltaR$, isBalanceVisible)}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-3 text-center">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
            isComprar
              ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30"
              : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-border-subtle"
          }`}
        >
          {isComprar ? (
            <>
              <ShoppingCart className="w-3 h-3" /> COMPRAR
            </>
          ) : (
            "AGUARDAR"
          )}
        </span>
      </td>

      {/* Qtd. a Comprar */}
      <td className="py-3 px-3 text-right font-mono text-sm font-bold">
        <span
          className={
            ativo.qtdAComprar > 0
              ? "text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
              : "text-zinc-500"
          }
        >
          {ativo.qtdAComprar}
        </span>
      </td>

      {/* Botões de Ação */}
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          {onAddTransacao && (
            <button
              type="button"
              onClick={() => onAddTransacao(ativo)}
              title="Registrar Compra/Venda"
              aria-label={`Registrar transação para ${ativo.simbolo}`}
              className="p-2 rounded text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {onEditAtivo && (
            <button
              type="button"
              onClick={() => onEditAtivo(ativo)}
              title="Editar Meta/Preço/CDI"
              aria-label={`Editar configurações do ativo ${ativo.simbolo}`}
              className="p-2 rounded text-zinc-400 hover:text-gold-main hover:bg-gold-main/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-main"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {onDeleteAtivo && (
            <button
              type="button"
              onClick={() =>
                onDeleteAtivo(ativo.id, ativo.simbolo)
              }
              title="Excluir Ativo"
              aria-label={`Excluir ativo ${ativo.simbolo}`}
              className="p-2 rounded text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AssetTable({
  ativos,
  resumoClasse,
  classeKey,
  nomeClasse,
  onAddTransacao,
  onEditAtivo,
  onDeleteAtivo,
  onNovoAtivo,
  isBalanceVisible = true,
  cdiAnualFormatada = "14,15% a.a.",
}: AssetTableProps) {
  const isFIIsTab = classeKey === "FIIS";
  const isRendaFixaTab = classeKey === "RENDA_FIXA";

  // Totais da tabela
  const totalInvestido = ativos.reduce((acc, a) => acc + a.totalInvestido, 0);
  const totalValorMercado = ativos.reduce((acc, a) => acc + a.valorMercado, 0);
  const totalLucroPrejuizoR$ = totalValorMercado - totalInvestido;
  const totalLucroPrejuizoPercent =
    totalInvestido > 0 ? (totalLucroPrejuizoR$ / totalInvestido) * 100 : 0;
  const totalPercentualAtual = ativos.reduce((acc, a) => acc + a.percentualAtual, 0);
  const totalPercentualIdeal = ativos.reduce((acc, a) => acc + a.percentualIdeal, 0);
  const totalFaltaR$ = ativos.reduce((acc, a) => acc + Math.max(0, a.faltaR$), 0);
  const totalQtdAComprar = ativos.reduce((acc, a) => acc + a.qtdAComprar, 0);

  // Totais de Renda Mensal (Efeito Bola de Neve FIIs)
  const rendaMensalTotalFIIs = ativos.reduce(
    (acc, a) => acc + a.rendaMensalEstimada,
    0
  );

  // Totais de Rendimento Pro-Rata Renda Fixa
  const totalRendimentoProRata = ativos.reduce(
    (acc, a) => acc + a.rendimentoProRataR$,
    0
  );

  const headerThemes: Record<string, { tag: string; button: string }> = {
    ACOES: { tag: "bg-blue-500/10 text-blue-500 border-blue-500/20", button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20" },
    FIIS: { tag: "bg-purple-500/10 text-purple-500 border-purple-500/20", button: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20" },
    ETFS: { tag: "bg-amber-500/10 text-amber-500 border-amber-500/20", button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" },
    RENDA_FIXA: { tag: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" },
  };

  const theme = headerThemes[classeKey] || { tag: "bg-gold-main/10 text-gold-main border-gold-main/20", button: "bg-gold-main hover:bg-gold-hover shadow-gold-main/20" };

  return (
    <div className="space-y-6">
      {/* Banner Exclusivo do Número Mágico para FIIs */}
      {isFIIsTab && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Efeito Bola de Neve ❄️
                </span>
                <h2 className="text-2xl font-bold text-white">
                  Painel do Número Mágico dos FIIs
                </h2>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl">
                O <strong>Número Mágico</strong> é a quantidade exata de cotas que você precisa para que os dividendos mensais comprem 1 nova cota de graça todo mês!
                Fórmula: <code className="font-mono text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded">Preço Atual / Provento Mensal</code>
              </p>
            </div>

            <div className="bg-surface/90 border border-purple-500/30 p-4 rounded-xl text-right shrink-0 shadow-lg">
              <div className="text-[11px] uppercase font-semibold text-purple-300 flex items-center justify-end gap-1">
                <Coins className="w-4 h-4 text-amber-400" /> Renda Mensal Estimada
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(rendaMensalTotalFIIs)} /mês
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {ativos.map((fii) => {
              const atingiuMagico = fii.cotasFaltantesMagico <= 0 && fii.numeroMagico > 0;

              return (
                <div
                  key={fii.id}
                  className="bg-surface/90 border border-border-subtle p-4 rounded-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-500/30">
                        {fii.simbolo}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px]">
                        {fii.nome}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        atingiuMagico
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      }`}
                    >
                      {atingiuMagico ? "✨ BOLA DE NEVE ATIVA!" : "EM PROGRESSO"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">
                        Cotas Atuais
                      </span>
                      <span className="font-mono font-bold text-zinc-200 text-sm">
                        {formatNumber(fii.quantidadeAtual)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block font-semibold">
                        Número Mágico
                      </span>
                      <span className="font-mono font-bold text-purple-200 text-sm">
                        {fii.numeroMagico > 0 ? `${fii.numeroMagico} cotas` : "N/D"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Progresso do Número Mágico:</span>
                      <span className="font-bold text-purple-300 font-mono">
                        {fii.progressoMagicoPercentual}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          atingiuMagico
                            ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                            : "bg-gradient-to-r from-purple-500 to-indigo-400"
                        }`}
                        style={{ width: `${fii.progressoMagicoPercentual}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-subtle text-xs flex items-center justify-between">
                    <span className="text-zinc-400">Cotas Faltantes:</span>
                    <span
                      className={`font-bold font-mono ${
                        fii.cotasFaltantesMagico <= 0
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {fii.cotasFaltantesMagico <= 0
                        ? "🎉 0 (Atingido!)"
                        : `Faltam ${fii.cotasFaltantesMagico} cotas`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner Exclusivo de Renda Fixa Pro-Rata (CDI) */}
      {isRendaFixaTab && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-800/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Rendimento Diário Pro-Rata
                </span>
                <h2 className="text-2xl font-bold text-white">
                  Renda Fixa & CDBs (CDI {cdiAnualFormatada})
                </h2>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl">
                Diferente de ações e FIIs, seus títulos de renda fixa (CDBs 100% ou 120% do CDI, Tesouro) rendem centavos <strong>todos os dias úteis</strong> automaticamente com base no fator acumulado do CDI pro-rata.
              </p>
            </div>

            <div className="bg-surface/90 border border-emerald-500/30 p-4 rounded-xl text-right shrink-0 shadow-lg">
              <div className="text-[11px] uppercase font-semibold text-emerald-300 flex items-center justify-end gap-1">
                <Zap className="w-4 h-4 text-emerald-400" /> Rendimento CDI Acumulado
              </div>
              <div className="text-2xl font-black text-emerald-400">
                + {formatCurrency(totalRendimentoProRata)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Resumo Padrão da Classe (caso não seja FII ou Renda Fixa) */}
      {!isFIIsTab && !isRendaFixaTab && resumoClasse && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${theme.tag}`}>
                Classe de Ativos
              </span>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {nomeClasse}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Meta global da classe na carteira:{" "}
              <strong className="text-gold-main font-semibold">
                {resumoClasse.metaPercentual}%
              </strong>{" "}
              | Alocação atual:{" "}
              <strong className="text-foreground">
                {formatPercent(resumoClasse.percentualAtual)}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
                resumoClasse.status === "COMPRAR"
                  ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-border-subtle"
              }`}
            >
              {resumoClasse.status === "COMPRAR" ? (
                <>
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      Status da Classe
                    </div>
                    <div className="text-sm font-bold">COMPRAR</div>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      Status da Classe
                    </div>
                    <div className="text-sm font-bold">AGUARDAR</div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-border-subtle">
              <div className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">
                Total Alocado
              </div>
              <div className="text-sm font-bold text-foreground">
                {isBalanceVisible ? formatCurrency(resumoClasse.valorMercadoTotal) : "R$ ••••"}
              </div>
            </div>

            <div className="bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-border-subtle">
              <div className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">
                Falta (R$) na Classe
              </div>
              <div
                className={`text-sm font-bold ${
                  resumoClasse.faltaR$ > 0 ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                {formatFalta(resumoClasse.faltaR$, isBalanceVisible)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela Interativa Estilo Planilha */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-md">
        
        {/* Barra de Ferramentas da Tabela */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-zinc-50/50 dark:bg-white-[0.02]">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span>Meus Ativos</span>
            <span className="bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {ativos.length}
            </span>
          </h3>
          
          {onNovoAtivo && (
            <button
              type="button"
              onClick={() => onNovoAtivo(classeKey)}
              className={`${theme.button} text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm`}
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar {nomeClasse.slice(0, -1)}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-b border-border-subtle text-[11px] uppercase tracking-wider font-semibold">
                <th scope="col" className="py-3 px-4">Ticker / Ativo</th>
                <th scope="col" className="py-3 px-3 text-right">Qtd.</th>
                <th scope="col" className="py-3 px-3 text-right">Preço Médio</th>
                <th scope="col" className="py-3 px-3 text-right">Total Investido</th>
                <th scope="col" className="py-3 px-3 text-right">Preço Atual</th>
                {isFIIsTab && (
                  <th className="py-3 px-3 text-right text-purple-300 font-bold">
                    Provento/Cota
                  </th>
                )}
                {isFIIsTab && (
                  <th className="py-3 px-3 text-right text-purple-300 font-bold">
                    Nº Mágico
                  </th>
                )}
                {isRendaFixaTab && (
                  <th className="py-3 px-3 text-right text-emerald-400 font-bold">
                    % do CDI
                  </th>
                )}
                {isRendaFixaTab && (
                  <th className="py-3 px-3 text-right text-emerald-400 font-bold">
                    Rendimento Pro-Rata
                  </th>
                )}
                <th className="py-3 px-3 text-right">Valor Mercado</th>
                <th className="py-3 px-3 text-right">Lucro/Prejuízo</th>
                <th className="py-3 px-3 text-left w-48">Alocação / Defasagem</th>
                <th className="py-3 px-3 text-right">Falta (R$)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-400">
                  Qtd. Comprar
                </th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-foreground">
              {ativos.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFIIsTab || isRendaFixaTab ? 15 : 13}
                    className="py-16 text-center text-zinc-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-zinc-400" aria-hidden="true" />
                      </div>
                      <p>Nenhum ativo cadastrado nesta classe. Clique em <strong className="text-foreground">Adicionar</strong> para começar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ativos.map((ativo) => (
                  <AssetTableRow
                    key={ativo.id}
                    ativo={ativo}
                    isFIIsTab={isFIIsTab}
                    isRendaFixaTab={isRendaFixaTab}
                    isBalanceVisible={isBalanceVisible}
                    onAddTransacao={onAddTransacao}
                    onEditAtivo={onEditAtivo}
                    onDeleteAtivo={onDeleteAtivo}
                  />
                ))
              )}
            </tbody>
            {/* Totais do Rodapé */}
            {ativos.length > 0 && (
              <tfoot>
                <tr className="bg-zinc-100 dark:bg-white/5 font-semibold text-foreground border-t-2 border-border-subtle text-xs font-mono">
                  <td className="py-3 px-4 font-sans font-bold text-foreground">
                    TOTAL ({ativos.length} ativos)
                  </td>
                  <td className="py-3 px-3 text-right">-</td>
                  <td className="py-3 px-3 text-right">-</td>
                  <td className="py-3 px-3 text-right text-zinc-500 dark:text-zinc-400">
                    {isBalanceVisible ? formatCurrency(totalInvestido) : "R$ ••••"}
                  </td>
                  <td className="py-3 px-3 text-right">-</td>
                  {isFIIsTab && (
                    <td className="py-3 px-3 text-right text-purple-300 font-bold">
                      {isBalanceVisible ? formatCurrency(rendaMensalTotalFIIs) : "R$ ••••"}
                    </td>
                  )}
                  {isFIIsTab && <td className="py-3 px-3 text-right">-</td>}
                  {isRendaFixaTab && <td className="py-3 px-3 text-right">-</td>}
                  {isRendaFixaTab && (
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      + {isBalanceVisible ? formatCurrency(totalRendimentoProRata) : "R$ ••••"}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    {isBalanceVisible ? formatCurrency(totalValorMercado) : "R$ ••••"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div
                      className={
                        totalLucroPrejuizoR$ >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {isBalanceVisible ? formatCurrency(totalLucroPrejuizoR$) : "R$ ••••"}
                    </div>
                    <div className="text-[10px]">
                      {formatPercent(totalLucroPrejuizoPercent)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-foreground">
                    {formatPercent(totalPercentualAtual)}
                  </td>
                  <td className="py-3 px-3 text-right text-gold-main">
                    {formatPercent(totalPercentualIdeal, 1)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                    {isBalanceVisible ? formatCurrency(totalFaltaR$) : "R$ ••••"}
                  </td>
                  <td className="py-3 px-3 text-center">-</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">
                    {totalQtdAComprar}
                  </td>
                  <td className="py-3 px-4 text-center">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
