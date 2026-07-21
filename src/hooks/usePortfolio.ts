"use client";

import { logger } from '@/lib/logger';
import { useState, useCallback, useEffect } from "react";
import { PortfolioComHistorico } from "@/lib/calculator";

/**
 * Hook que encapsula o estado completo e a lógica de fetch do portfólio.
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
    } catch (err: any) {
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
      } catch (err: any) {
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
