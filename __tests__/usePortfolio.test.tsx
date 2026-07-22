import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePortfolio } from "../src/hooks/usePortfolio";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe("usePortfolio hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar o portfólio na inicialização", async () => {
    const mockData = { patrimonioTotal: 5000, ativos: [] };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => usePortfolio());

    await act(async () => {});

    expect(result.current.portfolio).toEqual(mockData);
    expect(result.current.loading).toBe(false);
  });

  it("deve tratar erro ao carregar portfólio", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => usePortfolio());

    await act(async () => {});

    expect(result.current.portfolio).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("deve excluir ativo e recarregar portfólio", async () => {
    const mockData = { patrimonioTotal: 5000, ativos: [] };
    global.fetch = vi
      .fn() // fetchPortfolio inicial
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      }) // delete
      .mockResolvedValueOnce({
        ok: true,
      }) // reload
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    const { result } = renderHook(() => usePortfolio());

    await act(async () => {});

    await act(async () => {
      await result.current.handleDeleteAtivo("ativo-1");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/ativos?id=ativo-1", {
      method: "DELETE",
    });
  });
});
