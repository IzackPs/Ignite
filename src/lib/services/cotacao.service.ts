import { logger } from '@/lib/logger';
import { prisma } from "@/lib/prisma";

/**
 * Serviço de cotações — encapsula a lógica de fallback Brapi → Yahoo Finance
 * e a atualização dos preços no banco de dados.
 */
export const cotacaoService = {
  /**
   * Busca cotações da API Brapi.dev para os tickers informados.
   * Preenche o `pricesMap` com os preços encontrados.
   */
  async fetchBrapiPrices(
    tickersString: string,
    pricesMap: Record<string, number>
  ): Promise<void> {
    try {
      const brapiUrl = `https://brapi.dev/api/quote/${tickersString}?token=`;
      const res = await fetch(brapiUrl, {
        headers: { "User-Agent": "AntigravityPortfolio/1.0" },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((item: any) => {
            if (item.symbol && item.regularMarketPrice !== undefined) {
              pricesMap[item.symbol.toUpperCase()] = Number(item.regularMarketPrice);
            }
          });
        }
      }
    } catch (e) {
      logger.warn("Brapi API indisponível, tentando Yahoo Finance fallback...", e);
    }
  },

  /**
   * Fallback: busca cotações do Yahoo Finance (.SA) para tickers ausentes.
   */
  async fetchYahooPrices(
    missingTickers: string[],
    pricesMap: Record<string, number>
  ): Promise<void> {
    try {
      const yahooTickers = missingTickers.map((t) => `${t}.SA`).join(",");
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooTickers}`;
      const resYahoo = await fetch(yahooUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 0 },
      });

      if (resYahoo.ok) {
        const dataYahoo = await resYahoo.json();
        const quotes = dataYahoo?.quoteResponse?.result || [];
        quotes.forEach((q: any) => {
          const cleanSymbol = q.symbol.replace(".SA", "").toUpperCase();
          if (q.regularMarketPrice !== undefined) {
            pricesMap[cleanSymbol] = Number(q.regularMarketPrice);
          }
        });
      }
    } catch (err) {
      logger.warn("Erro no fallback do Yahoo Finance:", err);
    }
  },

  /**
   * Atualiza os preços dos ativos de renda variável de um usuário.
   * Tenta Brapi primeiro, Yahoo Finance como fallback.
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

    const tickers = ativosMercado.map((a) => a.simbolo.trim().toUpperCase());
    const tickersString = tickers.join(",");
    const pricesMap: Record<string, number> = {};

    await this.fetchBrapiPrices(tickersString, pricesMap);

    const missingTickers = tickers.filter((t) => !pricesMap[t]);
    if (missingTickers.length > 0) {
      await this.fetchYahooPrices(missingTickers, pricesMap);
    }

    const updatedAtivos: { simbolo: string; precoAntigo: number; precoNovo: number }[] = [];

    for (const ativo of ativosMercado) {
      const novoPreco = pricesMap[ativo.simbolo.toUpperCase()];
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
    }

    return { updatedCount: updatedAtivos.length, updatedAtivos, nothingToUpdate: false };
  },
};
