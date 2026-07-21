import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { usePortfolio } from "../src/hooks/usePortfolio";

const originalConfirm = global.confirm;
const originalFetch = global.fetch;

describe("usePortfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.confirm = originalConfirm;
    global.fetch = originalFetch;
  });

  it("deve fazer fetch do portfólio na montagem", async () => {
    const portfolioMock = { ativos: [] };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => portfolioMock,
    } as any);

    const { result } = renderHook(() => usePortfolio());

    expect(result.current.loading).toBe(true);
    
    // Aguardar re-render
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.portfolio).toEqual(portfolioMock);
    expect(global.fetch).toHaveBeenCalledWith("/api/portfolio");
  });

  it("deve lidar com erro no fetch do portfólio", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network erro"));

    const { result } = renderHook(() => usePortfolio());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.portfolio).toBe(null);
  });

  it("deve deletar ativo e recarregar portfólio", async () => {
    vi.mocked(global.confirm).mockReturnValueOnce(true);
    
    // 1: initial fetch
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ativos: [] }),
    } as any);

    const { result } = renderHook(() => usePortfolio());
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 2: delete call
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as any);

    // 3: re-fetch call
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ativos: [{ id: "1" }] }),
    } as any);

    await act(async () => {
      await result.current.handleDeleteAtivo("1", "PETR4");
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("/api/ativos?id=1", { method: "DELETE" });
    expect(global.fetch).toHaveBeenCalledTimes(3); // init, delete, refetch
  });

  it("não deve deletar ativo se o usuário cancelar", async () => {
    vi.mocked(global.confirm).mockReturnValueOnce(false);
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ativos: [] }),
    } as any);

    const { result } = renderHook(() => usePortfolio());
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteAtivo("1", "PETR4");
    });

    expect(global.confirm).toHaveBeenCalled();
    // 1 vez só (do initial fetch)
    expect(global.fetch).toHaveBeenCalledTimes(1); 
  });
});
