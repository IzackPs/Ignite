import { logger } from '@/lib/logger';
"use client";

import { useState, useCallback, useEffect } from "react";
import { AtivoCalculado } from "@/lib/calculator";
import { PortfolioComHistorico } from "@/app/dashboard/page";

/**
 * Hook que encapsula todo o estado e lógica de fetch do portfólio.
 * Separa responsabilidades de dados do componente de página.
 */
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioComHistorico | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (res.ok) {
        setPortfolio(data);
      }
    } catch (err) {
      logger.error("Erro ao carregar portfólio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exclui um ativo após confirmação do usuário e recarrega o portfólio.
   */
  const handleDeleteAtivo = useCallback(
    async (id: string, simbolo: string) => {
      if (
        !confirm(
          `Tem certeza que deseja excluir o ativo ${simbolo} e todo o seu histórico?`
        )
      ) {
        return;
      }

      try {
        const res = await fetch(`/api/ativos?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          await fetchPortfolio();
        }
      } catch (err) {
        logger.error("Erro ao excluir ativo:", err);
      }
    },
    [fetchPortfolio]
  );

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, fetchPortfolio, handleDeleteAtivo };
}
