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
  ativos: AtivoCalculado[];
  resumoClasse?: ResumoClasse;
  classeKey: string;
  nomeClasse: string;
  onAddTransacao?: (ativo: AtivoCalculado) => void;
  onEditAtivo?: (ativo: AtivoCalculado) => void;
  onDeleteAtivo?: (id: string, simbolo: string) => void;
  onNovoAtivo?: (classe: string) => void;
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
              <p className="text-xs text-slate-300 max-w-2xl">
                O <strong>Número Mágico</strong> é a quantidade exata de cotas que você precisa para que os dividendos mensais comprem 1 nova cota de graça todo mês!
                Fórmula: <code className="font-mono text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded">Preço Atual / Provento Mensal</code>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-xl text-right shrink-0 shadow-lg">
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
                  className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-500/30">
                        {fii.simbolo}
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
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
                      <span className="text-[10px] text-slate-400 block">
                        Cotas Atuais
                      </span>
                      <span className="font-mono font-bold text-slate-200 text-sm">
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
                      <span className="text-slate-400">Progresso do Número Mágico:</span>
                      <span className="font-bold text-purple-300 font-mono">
                        {fii.progressoMagicoPercentual}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
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

                  <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Cotas Faltantes:</span>
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
                  Renda Fixa & CDBs (CDI 11,00% a.a.)
                </h2>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Diferente de ações e FIIs, seus títulos de renda fixa (CDBs 100% ou 120% do CDI, Tesouro) rendem centavos <strong>todos os dias úteis</strong> automaticamente com base no fator acumulado do CDI pro-rata.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl text-right shrink-0 shadow-lg">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Classe de Ativos
              </span>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {nomeClasse}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Meta global da classe na carteira:{" "}
              <strong className="text-blue-300 font-semibold">
                {resumoClasse.metaPercentual}%
              </strong>{" "}
              | Alocação atual:{" "}
              <strong className="text-slate-200">
                {formatPercent(resumoClasse.percentualAtual)}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                resumoClasse.status === "COMPRAR"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
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
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      Status da Classe
                    </div>
                    <div className="text-sm font-bold">AGUARDAR</div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/80">
              <div className="text-[10px] uppercase font-medium text-slate-400">
                Total Alocado
              </div>
              <div className="text-sm font-bold text-white">
                {formatCurrency(resumoClasse.valorMercadoTotal)}
              </div>
            </div>

            <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/80">
              <div className="text-[10px] uppercase font-medium text-slate-400">
                Falta (R$) na Classe
              </div>
              <div
                className={`text-sm font-bold ${
                  resumoClasse.faltaR$ > 0 ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {resumoClasse.faltaR$ > 0
                  ? formatCurrency(resumoClasse.faltaR$)
                  : "R$ 0,00"}
              </div>
            </div>

            {onNovoAtivo && (
              <button
                onClick={() => onNovoAtivo(classeKey)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar {nomeClasse.slice(0, -1)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabela Interativa Estilo Planilha */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700/80 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Ticker / Ativo</th>
                <th className="py-3 px-3 text-right">Qtd.</th>
                <th className="py-3 px-3 text-right">Preço Médio</th>
                <th className="py-3 px-3 text-right">Total Investido</th>
                <th className="py-3 px-3 text-right">Preço Atual</th>
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
                <th className="py-3 px-3 text-right">% Atual</th>
                <th className="py-3 px-3 text-right">% Ideal</th>
                <th className="py-3 px-3 text-right">Falta (R$)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-400">
                  Qtd. Comprar
                </th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {ativos.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFIIsTab || isRendaFixaTab ? 15 : 13}
                    className="py-10 text-center text-slate-500 text-sm"
                  >
                    Nenhum ativo cadastrado nesta classe. Clique em &quot;Adicionar&quot;
                    para começar.
                  </td>
                </tr>
              ) : (
                ativos.map((ativo) => {
                  const isLucro = ativo.lucroPrejuizoR$ >= 0;
                  const isComprar = ativo.status === "COMPRAR";

                  return (
                    <tr
                      key={ativo.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Ativo / Ticker */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="font-mono font-bold text-base text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                            {ativo.simbolo}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200 text-xs truncate max-w-[140px]">
                              {ativo.nome}
                            </div>
                            {ativo.setor && (
                              <div className="text-[10px] text-slate-500">
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
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-300">
                        {formatCurrency(ativo.precoMedio)}
                      </td>

                      {/* Total Investido */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-300">
                        {formatCurrency(ativo.totalInvestido)}
                      </td>

                      {/* Preço Atual */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-white">
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
                              <span className="block text-[9px] text-slate-400 font-normal">
                                Faltam: {ativo.cotasFaltantesMagico}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-normal">-</span>
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
                          <span className="block text-[9px] text-slate-400 font-normal">
                            ({ativo.diasUteisDecorridos} d.ú.)
                          </span>
                        </td>
                      )}

                      {/* Valor de Mercado */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-slate-100">
                        {formatCurrency(ativo.valorMercado)}
                      </td>

                      {/* Lucro / Prejuízo */}
                      <td className="py-3 px-3 text-right font-mono text-xs">
                        <div
                          className={`flex items-center justify-end gap-1 ${
                            isLucro ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isLucro ? (
                            <TrendingUp className="w-3 h-3 shrink-0" />
                          ) : (
                            <TrendingDown className="w-3 h-3 shrink-0" />
                          )}
                          <span>{formatCurrency(ativo.lucroPrejuizoR$)}</span>
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

                      {/* % Atual */}
                      <td className="py-3 px-3 text-right font-mono text-xs">
                        <span className="font-semibold text-slate-200">
                          {formatPercent(ativo.percentualAtual)}
                        </span>
                      </td>

                      {/* % Ideal */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-blue-400 font-semibold bg-blue-500/5 px-2 rounded">
                        {formatPercent(ativo.percentualIdeal, 1)}
                      </td>

                      {/* Falta (R$) */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold">
                        <span
                          className={
                            ativo.faltaR$ > 0
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }
                        >
                          {ativo.faltaR$ > 0
                            ? formatCurrency(ativo.faltaR$)
                            : "R$ 0,00"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            isComprar
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
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
                              : "text-slate-500"
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
                              onClick={() => onAddTransacao(ativo)}
                              title="Registrar Compra/Venda"
                              className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}
                          {onEditAtivo && (
                            <button
                              onClick={() => onEditAtivo(ativo)}
                              title="Editar Meta/Preço/CDI"
                              className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteAtivo && (
                            <button
                              onClick={() =>
                                onDeleteAtivo(ativo.id, ativo.simbolo)
                              }
                              title="Excluir Ativo"
                              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Totais do Rodapé */}
            {ativos.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800/90 font-semibold text-slate-200 border-t-2 border-slate-700 text-xs font-mono">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    TOTAL ({ativos.length} ativos)
                  </td>
                  <td className="py-3 px-3 text-right">-</td>
                  <td className="py-3 px-3 text-right">-</td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCurrency(totalInvestido)}
                  </td>
                  <td className="py-3 px-3 text-right">-</td>
                  {isFIIsTab && (
                    <td className="py-3 px-3 text-right text-purple-300 font-bold">
                      {formatCurrency(rendaMensalTotalFIIs)}
                    </td>
                  )}
                  {isFIIsTab && <td className="py-3 px-3 text-right">-</td>}
                  {isRendaFixaTab && <td className="py-3 px-3 text-right">-</td>}
                  {isRendaFixaTab && (
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      + {formatCurrency(totalRendimentoProRata)}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {formatCurrency(totalValorMercado)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div
                      className={
                        totalLucroPrejuizoR$ >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {formatCurrency(totalLucroPrejuizoR$)}
                    </div>
                    <div className="text-[10px]">
                      {formatPercent(totalLucroPrejuizoPercent)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-white">
                    {formatPercent(totalPercentualAtual)}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-400">
                    {formatPercent(totalPercentualIdeal, 1)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                    {formatCurrency(totalFaltaR$)}
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
