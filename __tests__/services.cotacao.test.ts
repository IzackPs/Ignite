import { describe, it, expect, vi, beforeEach } from "vitest";
import { cotacaoService } from "@/lib/services/cotacao.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ativo: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("yahoo-finance2", () => {
  return {
    default: class MockYahooFinance {
      quote(ticker: string) {
        if (ticker.startsWith("PETR4")) {
          return Promise.resolve({ regularMarketPrice: 38.5 });
        }
        if (ticker.startsWith("VALE3")) {
          return Promise.resolve({ regularMarketPrice: 62.1 });
        }
        if (ticker.startsWith("ERRO")) {
          return Promise.reject(new Error("Ticker inválido"));
        }
        return Promise.resolve(null);
      }
    },
  };
});

describe("Cotacao Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar nada a atualizar quando o usuário não possuir ativos de renda variável", async () => {
    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([]);

    const result = await cotacaoService.atualizarCotacoesParaUsuario("user-1");

    expect(result).toEqual({
      updatedCount: 0,
      updatedAtivos: [],
      nothingToUpdate: true,
    });
    expect(prisma.ativo.update).not.toHaveBeenCalled();
  });

  it("deve atualizar os preços dos ativos de renda variável com sucesso", async () => {
    const ativosMock = [
      { id: "1", simbolo: "PETR4", precoAtual: 35.0 },
      { id: "2", simbolo: "VALE3", precoAtual: 60.0 },
    ];

    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce(ativosMock as any);
    vi.mocked(prisma.ativo.update).mockResolvedValue({} as any);

    const result = await cotacaoService.atualizarCotacoesParaUsuario("user-1");

    expect(result.nothingToUpdate).toBe(false);
    expect(result.updatedCount).toBe(2);
    expect(result.updatedAtivos).toEqual([
      { simbolo: "PETR4", precoAntigo: 35.0, precoNovo: 38.5 },
      { simbolo: "VALE3", precoAntigo: 60.0, precoNovo: 62.1 },
    ]);

    expect(prisma.ativo.update).toHaveBeenCalledTimes(2);
    expect(prisma.ativo.update).toHaveBeenNthCalledWith(1, {
      where: { id: "1" },
      data: { precoAtual: 38.5, logoUrl: "https://assets.parqet.com/logos/symbol/PETR4" },
    });
  });

  it("deve tratar erros individuais na busca de cotações sem interromper os demais ativos", async () => {
    const ativosMock = [
      { id: "1", simbolo: "ERRO3", precoAtual: 10.0 },
      { id: "2", simbolo: "PETR4", precoAtual: 35.0 },
    ];

    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce(ativosMock as any);
    vi.mocked(prisma.ativo.update).mockResolvedValue({} as any);

    const result = await cotacaoService.atualizarCotacoesParaUsuario("user-1");

    expect(result.updatedCount).toBe(1);
    expect(result.updatedAtivos).toEqual([
      { simbolo: "PETR4", precoAntigo: 35.0, precoNovo: 38.5 },
    ]);
  });
});
