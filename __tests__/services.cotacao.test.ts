import { describe, it, expect, vi, beforeEach } from "vitest";
import { cotacaoService } from "../src/lib/services/cotacao.service";
import { prisma } from "../src/lib/prisma";
import { logger } from "../src/lib/logger";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    ativo: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("cotacaoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchBrapiPrices", () => {
    it("deve preencher o mapa de preços quando a API retorna sucesso", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { symbol: "PETR4", regularMarketPrice: 35.5 },
          ],
        }),
      });

      const pricesMap: Record<string, number> = {};
      await cotacaoService.fetchBrapiPrices("PETR4", pricesMap);

      expect(pricesMap["PETR4"]).toBe(35.5);
    });

    it("deve logar um aviso quando ocorre exceção na API", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      const pricesMap: Record<string, number> = {};
      await cotacaoService.fetchBrapiPrices("PETR4", pricesMap);

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("fetchYahooPrices", () => {
    it("deve preencher o mapa com cotações do Yahoo Finance", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          quoteResponse: {
            result: [
              { symbol: "VALE3.SA", regularMarketPrice: 65.2 },
            ],
          },
        }),
      });

      const pricesMap: Record<string, number> = {};
      await cotacaoService.fetchYahooPrices(["VALE3"], pricesMap);

      expect(pricesMap["VALE3"]).toBe(65.2);
    });

    it("deve logar um aviso quando ocorre exceção no Yahoo Finance", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      const pricesMap: Record<string, number> = {};
      await cotacaoService.fetchYahooPrices(["VALE3"], pricesMap);

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("atualizarCotacoesParaUsuario", () => {
    it("deve retornar immediately se não tiver ativos", async () => {
      vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([]);

      const result = await cotacaoService.atualizarCotacoesParaUsuario("u1");
      expect(result).toEqual({ updatedCount: 0, updatedAtivos: [], nothingToUpdate: true });
    });

    it("deve atualizar as cotações corretamente combinando as duas APIs", async () => {
      const ativosMock = [
        { id: "a1", simbolo: "PETR4", precoAtual: 30 },
        { id: "a2", simbolo: "VALE3", precoAtual: 60 },
      ];
      vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce(ativosMock as any);

      // Brapi returna só PETR4
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ symbol: "PETR4", regularMarketPrice: 35.5 }],
        }),
      });

      // Yahoo retorna VALE3
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          quoteResponse: { result: [{ symbol: "VALE3.SA", regularMarketPrice: 65.2 }] },
        }),
      });

      const result = await cotacaoService.atualizarCotacoesParaUsuario("u1");

      expect(prisma.ativo.update).toHaveBeenCalledTimes(2);
      expect(prisma.ativo.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { precoAtual: 35.5 },
      });
      expect(prisma.ativo.update).toHaveBeenCalledWith({
        where: { id: "a2" },
        data: { precoAtual: 65.2 },
      });

      expect(result.updatedCount).toBe(2);
      expect(result.updatedAtivos).toEqual([
        { simbolo: "PETR4", precoAntigo: 30, precoNovo: 35.5 },
        { simbolo: "VALE3", precoAntigo: 60, precoNovo: 65.2 },
      ]);
    });
  });
});
