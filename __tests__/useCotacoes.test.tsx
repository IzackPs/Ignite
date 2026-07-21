import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCotacoes } from "@/hooks/useCotacoes";

describe("useCotacoes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("deve inicializar com estado padrão", () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCotacoes(onSuccess));

    expect(result.current.updatingPrices).toBe(false);
    expect(result.current.lastPriceUpdate).toBeNull();
    expect(result.current.cooldown).toBe(0);
    expect(result.current.toast).toBeNull();
    expect(result.current.getUpdateBtnText()).toBe("Atualizar Cotações");
  });

  it("deve atualizar cotações com sucesso e disparar onSuccess e cooldown no modo manual", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, updatedCount: 2 }),
      })
    );

    const { result } = renderHook(() => useCotacoes(onSuccess));

    await act(async () => {
      await result.current.handleAtualizarCotacoes(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.toast).toEqual({
      message: "Cotações atualizadas com sucesso!",
      type: "success",
    });
    expect(result.current.cooldown).toBe(60);
    expect(result.current.lastPriceUpdate).not.toBeNull();
    expect(result.current.getUpdateBtnText()).toBe("Aguarde 60s...");
  });

  it("deve decrementar o cooldown a cada 1 segundo", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, updatedCount: 1 }),
      })
    );

    const { result } = renderHook(() => useCotacoes(onSuccess));

    await act(async () => {
      await result.current.handleAtualizarCotacoes(true);
    });

    expect(result.current.cooldown).toBe(60);

    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(result.current.cooldown).toBe(0);
    expect(result.current.getUpdateBtnText()).toBe("Atualizar Cotações");
  });

  it("deve exibir aviso e bloquear chamada manual durante cooldown", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, updatedCount: 1 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useCotacoes(onSuccess));

    await act(async () => {
      await result.current.handleAtualizarCotacoes(true);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.handleAtualizarCotacoes(true);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1); // Não chamou novamente
    expect(result.current.toast?.type).toBe("warning");
    expect(result.current.toast?.message).toContain("Aguarde");
  });

  it("deve tratar status HTTP 429 (rate limit)", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: "Limite de chamadas atingido." }),
      })
    );

    const { result } = renderHook(() => useCotacoes(onSuccess));

    await act(async () => {
      await result.current.handleAtualizarCotacoes(false);
    });

    expect(result.current.toast).toEqual({
      message: "Limite de chamadas atingido.",
      type: "warning",
    });
  });

  it("deve tratar erro em caso de exceção na requisição", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Network Error"))
    );

    const { result } = renderHook(() => useCotacoes(onSuccess));

    await act(async () => {
      await result.current.handleAtualizarCotacoes(false);
    });

    expect(result.current.toast).toEqual({
      message: "Não foi possível atualizar as cotações. Exibindo dados em cache.",
      type: "warning",
    });
  });
});
