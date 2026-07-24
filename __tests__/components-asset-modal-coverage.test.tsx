
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetModal } from "@/components/AssetModal";

global.fetch = vi.fn();

describe("AssetModal Coverage Expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar dados fundamentalistas e permitir auto-preencher checklist", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "q1", criterio: "ROE", pergunta: "ROE > 5%?", peso: 1, isDefault: true },
        ],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          simbolo: "WEGE3",
          name: "WEG SA",
          price: 40,
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          simbolo: "WEGE3",
          roe: 20,
          dy: 3,
          suggestedAnswers: { ROE: true },
        }),
      } as any);

    render(
      <AssetModal
        isOpen={true}
        onClose={vi.fn()}
        initialClasse="ACOES_NACIONAIS"
        onSave={vi.fn()}
      />
    );

    const inputTicker = screen.getByPlaceholderText("Ex: PETR4");
    fireEvent.change(inputTicker, { target: { value: "WEGE3" } });
    fireEvent.blur(inputTicker);

    await waitFor(
      () => {
        expect(screen.getByText("Auto-preencher")).toBeInTheDocument();
      },
      { timeout: 2500 }
    );

    const autoFillBtn = screen.getByText("Auto-preencher");
    fireEvent.click(autoFillBtn);

    const checkBtn = screen.getByText(/ROE > 5%/i);
    fireEvent.click(checkBtn);
  });
});
