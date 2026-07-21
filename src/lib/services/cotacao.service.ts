import { logger } from '@/lib/logger';
import { prisma } from "@/lib/prisma";
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Serviço de cotações — utiliza yahoo-finance2 para atualização robusta.
 */
export const cotacaoService = {
  /**
   * Atualiza os preços dos ativos de renda variável de um usuário.
   */
  async atualizarCotacoesParaUsuario(userId: string) {
    const ativosMercado = await prisma.ativo.findMany({
      where: {
        userId,
        classe: { in: ["ACOES", "FIIS", "ETFS"] },
      },
    });

    if (ativosMercado.length === 0) {
      return { updatedCount: 0, updatedAtivos: [], nothingToUpdate: true };
    }

    const updatedAtivos: { simbolo: string; precoAntigo: number; precoNovo: number }[] = [];

    for (const ativo of ativosMercado) {
      try {
        const symbolClean = ativo.simbolo.trim().toUpperCase();
        const searchTicker = symbolClean.includes('.') ? symbolClean : `${symbolClean}.SA`;
        
        const quote = await yahooFinance.quote(searchTicker);
        const novoPreco = quote?.regularMarketPrice;

        if (novoPreco !== undefined && novoPreco > 0) {
          await prisma.ativo.update({
            where: { id: ativo.id },
            data: { precoAtual: novoPreco },
          });
          updatedAtivos.push({
            simbolo: ativo.simbolo,
            precoAntigo: ativo.precoAtual,
            precoNovo: novoPreco,
          });
        }
      } catch (err: any) {
        logger.warn(`Erro ao atualizar cotação para ${ativo.simbolo}: ${err.message || String(err)}`);
      }
    }

    return { updatedCount: updatedAtivos.length, updatedAtivos, nothingToUpdate: false };
  },
};
