"use client";

import React, { useState, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { Modal } from "@/components/ui/Modal";
import {
  Award,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Check,
  Info,
  PieChart,
  Search,
} from "lucide-react";
import { AssetLogo } from "@/components/ui/AssetLogo";

interface Question {
  id: string;
  criterio: string;
  pergunta: string;
  peso: number;
  isDefault: boolean;
}

interface FundamentalistMetrics {
  simbolo: string;
  roe?: number;
  dy?: number;
  margemLiquida?: number;
  dividaEbitda?: number;
  pl?: number;
  pvp?: number;
  cagrReceita5a?: number;
  cagrLucro5a?: number;
  suggestedAnswers?: Record<string, boolean>;
}

interface AssetModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly initialClasse?: string;
  readonly editingAtivo?: AtivoCalculado | null;
}

const VALID_CLASSES = [
  "ACOES_NACIONAIS",
  "ACOES_INTERNACIONAIS",
  "FIIS",
  "REITS",
  "CRIPTO",
  "RENDA_FIXA",
  "RENDA_FIXA_INTERNACIONAL",
] as const;

export function sanitizeClasse(c?: string): string {
  if (!c) return "ACOES_NACIONAIS";
  if ((VALID_CLASSES as readonly string[]).includes(c as any)) return c;
  if (c === "ACOES" || c === "ETFS" || c === "ACAO") return "ACOES_NACIONAIS";
  return "ACOES_NACIONAIS";
}

interface AutoSearchSetters {
  readonly setIsSearching: (v: boolean) => void;
  readonly setNome: (v: string) => void;
  readonly setPrecoAtual: (v: number) => void;
  readonly setClasse: (v: string) => void;
  readonly setSetor: (v: string) => void;
  readonly setLogoUrl: (v: string) => void;
}

async function autoSearchAsset(
  ticker: string,
  setters: AutoSearchSetters
) {
  setters.setIsSearching(true);
  try {
    const res = await fetch(`/api/ativos/search?ticker=${encodeURIComponent(ticker)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.nome) setters.setNome(data.nome);
    if (typeof data.precoAtual === "number" && data.precoAtual > 0) setters.setPrecoAtual(data.precoAtual);
    if (data.classe) setters.setClasse(sanitizeClasse(data.classe));
    if (data.setor !== undefined) setters.setSetor(data.setor ?? "");
    if (data.logoUrl !== undefined) setters.setLogoUrl(data.logoUrl ?? "");
  } catch {
    // Ignore silent errors
  } finally {
    setters.setIsSearching(false);
  }
}

function getNotaBadgeStyle(score: number): string {
  if (score >= 8) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
  }
  if (score >= 5) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10";
  }
  return "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/10 animate-pulse";
}

export function AssetModal({
  isOpen,
  onClose,
  onSave,
  initialClasse = "ACOES_NACIONAIS",
  editingAtivo,
}: AssetModalProps) {
  const [simbolo, setSimbolo] = useState("");
  const [nome, setNome] = useState("");
  const [classe, setClasse] = useState("ACOES_NACIONAIS");
  const [setor, setSetor] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [percentualIdeal, setPercentualIdeal] = useState(0);
  const [precoAtual, setPrecoAtual] = useState(0);
  const [ultimoProvento, setUltimoProvento] = useState<number | string>("");
  const [taxaRentabilidade, setTaxaRentabilidade] = useState(100);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Critérios & Indicadores Fundamentalistas
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [fundData, setFundData] = useState<FundamentalistMetrics | null>(null);
  const [fetchingFund, setFetchingFund] = useState(false);

  // Carregar lista de perguntas cadastradas
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const lastSearchedTicker = React.useRef<string>("");

  // Busca de informações do ativo & fundamentos (onBlur, Enter, clique ou debounce ao parar de digitar)
  const handleSearchAsset = React.useCallback(
    async (tickerToSearch?: string, force = false) => {
      const searchTicker = (tickerToSearch ?? simbolo).trim().toUpperCase();
      if (!searchTicker || searchTicker.length < 3) return;
      if (!force && lastSearchedTicker.current === searchTicker) return;

      lastSearchedTicker.current = searchTicker;

      if (!editingAtivo || editingAtivo.simbolo !== searchTicker) {
        await autoSearchAsset(
          searchTicker,
          { setIsSearching, setNome, setPrecoAtual, setClasse, setSetor, setLogoUrl }
        );
      }

      setFetchingFund(true);
      try {
        const res = await fetch(`/api/ativos/fundamentalist?ticker=${encodeURIComponent(searchTicker)}`);
        if (res && typeof res.json === "function") {
          const data = await res.json();
          if (data && !data.error) {
            setFundData(data);
          }
        }
      } catch {
        // Ignore silent fetch errors
      } finally {
        setFetchingFund(false);
      }
    },
    [simbolo, editingAtivo]
  );

  useEffect(() => {
    if (!simbolo || simbolo.length < 3) return;

    const timer = setTimeout(() => {
      handleSearchAsset();
    }, 300);

    return () => clearTimeout(timer);
  }, [simbolo, handleSearchAsset]);

  useEffect(() => {
    if (editingAtivo) {
      setSimbolo(editingAtivo.simbolo ?? "");
      setNome(editingAtivo.nome ?? "");
      setClasse(sanitizeClasse(editingAtivo.classe));
      setSetor(editingAtivo.setor ?? "");
      setLogoUrl(editingAtivo.logoUrl ?? "");
      setPercentualIdeal(editingAtivo.percentualIdeal ?? 0);
      setPrecoAtual(editingAtivo.precoAtual ?? 0);
      setUltimoProvento(editingAtivo.ultimoProvento ?? "");
      setTaxaRentabilidade(editingAtivo.taxaRentabilidade ?? 100);

      // Preencher respostas salvas se existirem
      if (editingAtivo.answers && Array.isArray(editingAtivo.answers)) {
        const initialAnswers: Record<string, boolean> = {};
        editingAtivo.answers.forEach((ans) => {
          initialAnswers[ans.questionId] = ans.answer;
        });
        setAnswers(initialAnswers);
      }

      if (editingAtivo.simbolo) {
        lastSearchedTicker.current = editingAtivo.simbolo.toUpperCase();
        handleSearchAsset(editingAtivo.simbolo, true);
      }
    } else {
      setSimbolo("");
      setNome("");
      setClasse(sanitizeClasse(initialClasse));
      setSetor("");
      setLogoUrl("");
      setPercentualIdeal(0);
      setPrecoAtual(0);
      setUltimoProvento("");
      setTaxaRentabilidade(100);
      setAnswers({});
      setFundData(null);
      lastSearchedTicker.current = "";
    }
    setError(null);
  }, [editingAtivo, initialClasse, isOpen, handleSearchAsset]);

  // Cálculo Dinâmico da Nota (0 a 10) baseado na soma ponderada das perguntas SIM
  const totalPeso = questions.reduce((sum, q) => sum + (q.peso || 1.0), 0);
  const sumSim = questions.reduce((sum, q) => sum + (answers[q.id] ? (q.peso || 1.0) : 0), 0);
  const notaCalculada = totalPeso > 0
    ? Number(((sumSim / totalPeso) * 10).toFixed(1))
    : 10;

  const handleToggleAnswer = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleApplySuggestedAnswers = () => {
    if (!fundData?.suggestedAnswers) return;

    const newAnswers = { ...answers };
    questions.forEach((q) => {
      const key = q.criterio.toUpperCase();
      if (fundData.suggestedAnswers && key in fundData.suggestedAnswers) {
        newAnswers[q.id] = fundData.suggestedAnswers[key];
      }
    });

    setAnswers(newAnswers);
  };

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const respostasPayload = questions.map((q) => ({
        questionId: q.id,
        answer: !!answers[q.id],
      }));

      const res = await fetch("/api/ativos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAtivo?.id,
          simbolo,
          nome,
          classe: sanitizeClasse(classe),
          setor,
          logoUrl,
          percentualIdeal: Number(percentualIdeal),
          precoAtual: Number(precoAtual),
          ultimoProvento: Number(ultimoProvento),
          taxaRentabilidade: Number(taxaRentabilidade),
          nota: notaCalculada,
          respostas: respostasPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar ativo");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isRendaFixa = classe.startsWith("RENDA_FIXA");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAtivo ? `Editar Ativo (${editingAtivo.simbolo})` : "Adicionar Novo Ativo"}
      maxWidth="max-w-4xl"
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header com resumo da pontuação e ativo */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between gap-4 mb-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AssetLogo
            simbolo={simbolo || "ATIVO"}
            nome={nome}
            logoUrl={logoUrl}
            sizeClass="w-9 h-9 text-xs"
          />
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              {simbolo || "NOVO ATIVO"}
              {classe && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium border border-zinc-700">
                  {classe.replace("_", " ")}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate max-w-[280px]">
              {nome || "Preencha os dados do ativo abaixo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block mb-0.5">
              Nota Ignite
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-mono font-black text-xs border shadow-lg transition-all duration-300 ${getNotaBadgeStyle(notaCalculada)}`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{notaCalculada.toFixed(1)} / 10</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Layout Lado a Lado (2 Colunas) para ficar quadrado e bem distribuído */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* COLUNA ESQUERDA: Dados do Ativo & Indicadores Fundamentalistas */}
          <div className="space-y-3">
            {/* Informações Básicas */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                <PieChart className="w-4 h-4 text-gold-main" />
                <h5 className="font-bold text-white text-xs">Dados Principais</h5>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="simbolo" className="block font-semibold text-zinc-300 mb-1">
                    Ticker / Símbolo *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="simbolo"
                      type="text"
                      required
                      placeholder="Ex: PETR4"
                      value={simbolo}
                      onChange={(e) => {
                        setSimbolo(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      onBlur={() => handleSearchAsset()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchAsset();
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-8 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-gold-main transition-colors text-xs font-bold"
                    />
                    {isSearching ? (
                      <div className="absolute right-2.5 text-gold-main text-[9px] font-semibold animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSearchAsset()}
                        title="Buscar dados do ativo"
                        className="absolute right-2 text-zinc-400 hover:text-gold-main p-1 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="nome" className="block font-semibold text-zinc-300 mb-1">
                    Nome do Ativo *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    placeholder="Ex: Petrobras PN"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-main transition-colors text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="classe" className="block font-semibold text-zinc-300 mb-1">
                    Classe *
                  </label>
                  <select
                    id="classe"
                    value={classe}
                    onChange={(e) => setClasse(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-gold-main transition-colors text-xs font-medium"
                  >
                    <option value="ACOES_NACIONAIS">📈 Ações Nacionais</option>
                    <option value="ACOES_INTERNACIONAIS">🌐 Ações Internacionais</option>
                    <option value="FIIS">🏢 Fundos Imobiliários</option>
                    <option value="REITS">🏛️ REITs</option>
                    <option value="CRIPTO">🪙 Criptomoedas</option>
                    <option value="RENDA_FIXA">💰 Renda Fixa</option>
                    <option value="RENDA_FIXA_INTERNACIONAL">🛡️ Renda Fixa Internacional</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="setor" className="block font-semibold text-zinc-300 mb-1">
                    Setor / Segmento
                  </label>
                  <input
                    id="setor"
                    type="text"
                    placeholder="Ex: Petróleo"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold-main transition-colors text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div>
                  <label htmlFor="percentualIdeal" className="block font-semibold text-zinc-300 mb-1 truncate">
                    Meta (%)
                  </label>
                  <input
                    id="percentualIdeal"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={percentualIdeal}
                    onChange={(e) => setPercentualIdeal(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-gold-main text-xs font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="precoAtual" className="block font-semibold text-zinc-300 mb-1 truncate">
                    Preço (R$)
                  </label>
                  <input
                    id="precoAtual"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoAtual}
                    onChange={(e) => setPrecoAtual(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-gold-main text-xs font-bold"
                  />
                </div>

                {isRendaFixa ? (
                  <div>
                    <label htmlFor="taxaRentabilidade" className="block font-semibold text-emerald-400 mb-1 truncate">
                      % do CDI
                    </label>
                    <input
                      id="taxaRentabilidade"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 120"
                      value={taxaRentabilidade}
                      onChange={(e) => setTaxaRentabilidade(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400 text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="ultimoProvento" className="block font-semibold text-zinc-300 mb-1 truncate">
                      Provento
                    </label>
                    <input
                      id="ultimoProvento"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1.10"
                      value={ultimoProvento}
                      onChange={(e) => setUltimoProvento(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-gold-main text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumo Fundamentalista Real */}
            {fundData && (fundData.roe !== undefined || fundData.dy !== undefined || fundData.pl !== undefined) && (
              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gold-main flex items-center gap-1.5 text-xs">
                    {fetchingFund ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    Fundamentos ({simbolo})
                  </span>
                  {fundData.suggestedAnswers && (
                    <button
                      type="button"
                      onClick={handleApplySuggestedAnswers}
                      className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 transition-all hover:bg-amber-400/20"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Auto-preencher
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">ROE</span>
                    <span className="font-mono font-bold text-blue-400 text-xs">{fundData.roe !== undefined ? `${fundData.roe}%` : "-"}</span>
                  </div>
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">DY</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">{fundData.dy !== undefined ? `${fundData.dy}%` : "-"}</span>
                  </div>
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">Margem Liq.</span>
                    <span className="font-mono font-bold text-purple-400 text-xs">{fundData.margemLiquida !== undefined ? `${fundData.margemLiquida}%` : "-"}</span>
                  </div>
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">P/L</span>
                    <span className="font-mono font-bold text-zinc-200 text-xs">{fundData.pl !== undefined ? `${fundData.pl}x` : "-"}</span>
                  </div>
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">P/VP</span>
                    <span className="font-mono font-bold text-zinc-200 text-xs">{fundData.pvp !== undefined ? `${fundData.pvp}x` : "-"}</span>
                  </div>
                  <div className="bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 font-semibold block">Dív./EBITDA</span>
                    <span className="font-mono font-bold text-amber-400 text-xs">{fundData.dividaEbitda !== undefined ? `${fundData.dividaEbitda}x` : "-"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: Checklist Metodologia Ignite (Interativo por Clique) */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold-main" />
                  Checklist Nota Ignite
                </h5>
                <span className="text-[10px] font-mono text-zinc-400 font-bold">
                  {questions.filter((q) => !!answers[q.id]).length} / {questions.length} SIM
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Carregando critérios da metodologia...
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {questions.map((q) => {
                    const isChecked = !!answers[q.id];

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleToggleAnswer(q.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-start gap-2.5 select-none ${
                          isChecked
                            ? "bg-gold-main/10 border-gold-main/50 text-white shadow-md shadow-gold-main/5"
                            : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/90 hover:border-zinc-700"
                        }`}
                      >
                        {/* Indicador Checkbox Customizado */}
                        <div
                          className={`w-4 h-4 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-gold-main text-white border-gold-main shadow-md shadow-gold-main/30 scale-105"
                              : "bg-zinc-900 border-zinc-700 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`font-bold font-mono text-[10px] ${
                                isChecked ? "text-gold-main" : "text-zinc-400"
                              }`}
                            >
                              {q.criterio}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                                  isChecked
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {isChecked ? "SIM" : "NÃO"}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                (P {q.peso.toFixed(1)})
                              </span>
                            </div>
                          </div>
                          <p className="mt-0.5 text-[11px] text-zinc-300 font-medium leading-tight">
                            {q.pergunta}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 text-center pt-1 border-t border-zinc-800/60">
              Clique nas caixas acima para somar os pontos da Nota final.
            </p>
          </div>
        </div>

        {/* Botoes de Acao (Footer) */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-colors text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gold-main hover:bg-gold-hover text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-lg shadow-gold-main/20 disabled:opacity-50 scale-[1.01]"
          >
            {loading ? "Salvando..." : "Salvar Ativo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
