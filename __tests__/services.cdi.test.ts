import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCdiAtual,
  getCdiFormatado,
  invalidarCacheCdi,
} from "@/lib/services/cdi.service";

describe("CDI Service", () => {
  beforeEach(() => {
    invalidarCacheCdi();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve buscar a taxa CDI com sucesso na API do BCB e calcular pro-rata diário", async () => {
    const mockBcbResponse = [{ data: "21/07/2026", valor: "14.25" }];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBcbResponse,
      })
    );

    const result = await getCdiAtual();

    expect(result.taxaCdiAnual).toBe(0.1425);
    expect(result.fonte).toBe("BCB_API");
    expect(result.taxaCdiDiaria).toBeGreaterThan(0);
    // (1 + 0.1425)^(1/252) - 1 ≈ 0.000529
    expect(result.taxaCdiDiaria).toBeCloseTo(0.000529, 5);
  });

  it("deve retornar do CACHE em chamadas subsequentes dentro do TTL de 24h", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ data: "21/07/2026", valor: "14.25" }],
    });
    vi.stubGlobal("fetch", mockFetch);

    const firstCall = await getCdiAtual();
    expect(firstCall.fonte).toBe("BCB_API");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const secondCall = await getCdiAtual();
    expect(secondCall.fonte).toBe("CACHE");
    expect(secondCall.taxaCdiAnual).toBe(0.1425);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Não chamou a API novamente
  });

  it("deve formatar o CDI corretamente em getCdiFormatado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ data: "21/07/2026", valor: "14.25" }],
      })
    );

    const formatado = await getCdiFormatado();
    expect(formatado).toBe("14,25% a.a.");
  });

  it("deve invalidar o cache ao chamar invalidarCacheCdi", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ data: "21/07/2026", valor: "14.25" }],
    });
    vi.stubGlobal("fetch", mockFetch);

    await getCdiAtual();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    invalidarCacheCdi();

    await getCdiAtual();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("deve usar o CACHE expirado caso a API falhe mas já exista cache em memória", async () => {
    // 1. Popula cache
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [{ data: "21/07/2026", valor: "14.25" }],
      })
    );
    await getCdiAtual();

    // Invalida tempo do cache ajustando fetchedAt internamente ou simulando data futura
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 25 * 60 * 60 * 1000);

    // 2. API falha na segunda chamada
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Conexão recusada"))
    );

    const fallbackResult = await getCdiAtual();
    expect(fallbackResult.fonte).toBe("CACHE");
    expect(fallbackResult.taxaCdiAnual).toBe(0.1425);

    dateSpy.mockRestore();
  });

  it("deve lançar erro se a API falhar e não houver cache em memória", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("API offline"))
    );

    await expect(getCdiAtual()).rejects.toThrow(
      "Não foi possível obter a taxa da API BCB e não há cache disponível"
    );
  });

  it("deve lançar erro se a API retornar status não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
      })
    );

    await expect(getCdiAtual()).rejects.toThrow("BCB API retornou status 503");
  });

  it("deve lançar erro se a API retornar array vazio ou resposta inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
    );

    await expect(getCdiAtual()).rejects.toThrow("Resposta vazia da API BCB");
  });

  it("deve lançar erro se o valor retornado não for numérico válido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [{ data: "21/07/2026", valor: "invalido" }],
      })
    );

    await expect(getCdiAtual()).rejects.toThrow("Valor de taxa inválido");
  });
});
