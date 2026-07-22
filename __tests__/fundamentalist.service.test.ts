import { describe, it, expect, vi } from 'vitest';
import { fundamentalistService } from '../src/lib/services/fundamentalist.service';

vi.mock('yahoo-finance2', () => {
  return {
    default: class {
      quoteSummary() {
        return Promise.resolve({
          financialData: {
            returnOnEquity: 0.25,
            profitMargins: 0.15,
            debtToEquity: 120,
            revenueGrowth: 0.10,
            earningsGrowth: 0.12,
          },
          summaryDetail: {
            dividendYield: 0.04,
            trailingPE: 15.5,
            priceToBook: 2.5,
          },
          defaultKeyStatistics: {},
        });
      }
    },
  };
});

describe('Fundamentalist Service', () => {
  it('deve buscar métricas fundamentalistas e gerar sugestões de checklist', async () => {
    const data = await fundamentalistService.getFundamentalistMetrics('WEGE3');
    expect(data).toBeDefined();
    expect(data.simbolo).toBe('WEGE3');
    expect(data.roe).toBe(25);
    expect(data.dy).toBe(4);
    expect(data.suggestedAnswers).toBeDefined();
    expect(data.suggestedAnswers?.ROE).toBe(true);
  });
});
