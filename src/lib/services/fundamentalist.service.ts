import YahooFinance from 'yahoo-finance2';
import { logger } from '@/lib/logger';

const yahooFinance = new YahooFinance();

export interface FundamentalistData {
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

function parseNum(val: unknown): number | undefined {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }
  return undefined;
}

export const fundamentalistService = {
  /**
   * Obtém indicadores fundamentalistas para um ticker (ex: WEGE3, PETR4, HGLG11, AAPL)
   */
  async getFundamentalistMetrics(simbolo: string): Promise<FundamentalistData> {
    const symbolClean = simbolo.trim().toUpperCase();
    const searchTicker = symbolClean.includes('.') || symbolClean.includes('-')
      ? symbolClean
      : `${symbolClean}.SA`;

    try {
      const summary = await yahooFinance.quoteSummary(searchTicker, {
        modules: ['financialData', 'summaryDetail', 'defaultKeyStatistics'],
      });

      const fin = summary?.financialData;
      const det = summary?.summaryDetail;
      const stat = summary?.defaultKeyStatistics;

      // ROE
      const roeDec = parseNum(fin?.returnOnEquity) ?? parseNum(stat?.returnOnEquity);
      const roe = roeDec !== undefined ? Number((roeDec * 100).toFixed(2)) : undefined;

      // Dividend Yield
      const dyDec = parseNum(det?.dividendYield) ?? parseNum(det?.trailingAnnualDividendYield);
      const dy = dyDec !== undefined ? Number((dyDec * 100).toFixed(2)) : undefined;

      // Margem Líquida
      const mlDec = parseNum(fin?.profitMargins) ?? parseNum(stat?.profitMargins);
      const margemLiquida = mlDec !== undefined ? Number((mlDec * 100).toFixed(2)) : undefined;

      // Dívida Líquida / EBITDA (ou Debt to Equity como aproximação)
      const debtToEquityDec = parseNum(fin?.debtToEquity);
      const dividaEbitda = debtToEquityDec !== undefined
        ? Number((debtToEquityDec / 100).toFixed(2))
        : undefined;

      // P/L (Trailing P/E)
      const plVal = parseNum(det?.trailingPE) ?? parseNum(stat?.trailingPE);
      const pl = plVal !== undefined ? Number(plVal.toFixed(2)) : undefined;

      // P/VP (Price to Book)
      const pvpVal = parseNum(stat?.priceToBook) ?? parseNum(det?.priceToBook);
      const pvp = pvpVal !== undefined ? Number(pvpVal.toFixed(2)) : undefined;

      // CAGR aproximado a partir dos crescimentos da receita/lucro
      const revGrowth = parseNum(fin?.revenueGrowth) ?? parseNum(stat?.revenueGrowth);
      const cagrReceita5a = revGrowth !== undefined ? Number((revGrowth * 100).toFixed(2)) : undefined;

      const earningsGrowth = parseNum(fin?.earningsGrowth) ?? parseNum(stat?.earningsGrowth);
      const cagrLucro5a = earningsGrowth !== undefined ? Number((earningsGrowth * 100).toFixed(2)) : undefined;

      // Sugestões de Respostas Automáticas baseadas nas regras fundamentalistas
      const suggestedAnswers: Record<string, boolean> = {};

      if (roe !== undefined) {
        suggestedAnswers["ROE"] = roe >= 5.0;
      }
      if (dy !== undefined) {
        suggestedAnswers["DIVIDENDOS"] = dy >= 2.0;
      }
      if (cagrReceita5a !== undefined || cagrLucro5a !== undefined) {
        suggestedAnswers["CAGR"] = (cagrReceita5a ?? 0) > 0 || (cagrLucro5a ?? 0) > 0;
      }
      if (dividaEbitda !== undefined) {
        suggestedAnswers["ENDIVIDAMENTO"] = dividaEbitda <= 3.5;
      }
      if (margemLiquida !== undefined) {
        suggestedAnswers["VANTAGENS_COMPETITIVAS"] = margemLiquida >= 10.0;
      }

      return {
        simbolo,
        roe,
        dy,
        margemLiquida,
        dividaEbitda,
        pl,
        pvp,
        cagrReceita5a,
        cagrLucro5a,
        suggestedAnswers,
      };
    } catch (err: any) {
      logger.warn(`Fundamentalist service query failed for ${simbolo}: ${err.message || String(err)}`);
      return {
        simbolo,
        suggestedAnswers: {},
      };
    }
  },
};
