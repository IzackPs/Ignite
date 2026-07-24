"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface Question {
  id: string;
  criterio: string;
  pergunta: string;
  peso: number;
  isDefault: boolean;
}

export function QuestionManagementView() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State para criar/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [criterio, setCriterio] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [peso, setPeso] = useState(1.0);

  // Estados de confirmação
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Erro ao carregar critérios");
      const data = await res.json();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar critérios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCriterio("");
    setPergunta("");
    setPeso(1.0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingId(q.id);
    setCriterio(q.criterio);
    setPergunta(q.pergunta);
    setPeso(q.peso);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir critério");
      setSuccessMsg("Critério excluído com sucesso!");
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    setConfirmResetOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/questions/reset", { method: "POST" });
      if (!res.ok) throw new Error("Erro ao restaurar critérios padrão");
      const data = await res.json();
      setQuestions(data);
      setSuccessMsg("Critérios restaurados para o padrão com sucesso!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId || undefined,
        criterio,
        pergunta,
        peso: Number(peso),
      };

      const res = await fetch("/api/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao salvar critério");
      }

      setSuccessMsg(editingId ? "Critério atualizado!" : "Novo critério adicionado!");
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header com ações */}
      <div className="bg-surface/90 border border-border-subtle p-6 rounded-2xl shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gold-main/10 text-gold-main">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Critérios & Perguntas (Nota Ignite)
            </h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Configure os critérios de análise para pontuação dos seus ativos (nota de 0 a 10).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all border border-zinc-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Restaurar Padrões Ignite
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gold-main hover:bg-gold-hover text-white transition-all shadow-md shadow-gold-main/20 scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Novo Critério
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabela de Perguntas */}
      <div className="bg-surface/90 border border-border-subtle rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        {loading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-gold-main animate-spin mx-auto" />
            <p className="text-zinc-500 text-xs">Carregando critérios da metodologia...</p>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="py-16 text-center text-zinc-500 text-sm">
            Nenhum critério cadastrado. Crie um novo ou recupere os padrões.
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-border-subtle text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Critério</th>
                  <th className="py-3.5 px-4">Pergunta Formulada</th>
                  <th className="py-3.5 px-4 text-center">Peso</th>
                  <th className="py-3.5 px-4 text-center">Origem</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-xs">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-main">
                      {q.criterio}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-200 font-medium">
                      {q.pergunta}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-300">
                      <span className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                        <Scale className="w-3 h-3 text-gold-main" />
                        {q.peso.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          q.isDefault
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {q.isDefault ? "Padrão Ignite" : "Personalizada"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Editar Critério"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(q.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Excluir Critério"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? "Editar Critério" : "Novo Critério de Análise"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="criterioInput" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Critério / Mnemônico *
                </label>
                <input
                  id="criterioInput"
                  type="text"
                  required
                  placeholder="Ex: ROE, GOVERNANCA, MARGEM"
                  value={criterio}
                  onChange={(e) => setCriterio(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-gold-main text-xs"
                />
              </div>

              <div>
                <label htmlFor="perguntaInput" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pergunta Formulada *
                </label>
                <textarea
                  id="perguntaInput"
                  required
                  rows={2}
                  placeholder="Ex: O ROE histórico da empresa é maior do que 5%?"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold-main text-xs"
                />
              </div>

              <div>
                <label htmlFor="pesoInput" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Peso do Critério (Multiplicador de Pontuação)
                </label>
                <input
                  id="pesoInput"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={peso}
                  onChange={(e) => setPeso(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-gold-main text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-900 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold bg-gold-main hover:bg-gold-hover text-white rounded-lg transition-colors shadow-md shadow-gold-main/20 disabled:opacity-50"
                >
                  {saving ? "Salvar..." : "Salvar Critério"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Critério */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Excluir Critério de Análise"
        description="Tem certeza que deseja excluir este critério da sua lista da Nota Ignite?"
        confirmText="Excluir Critério"
        variant="danger"
      />

      {/* Modal de Confirmação de Restauração de Padrões */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleReset}
        title="Restaurar Padrões Ignite"
        description="Deseja realmente restaurar todos os critérios para o modelo padrão (11 critérios fundamentais)? Suas personalizações atuais serão substituídas."
        confirmText="Restaurar Padrões"
        variant="primary"
      />
    </div>
  );
}
