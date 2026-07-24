
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionModal } from "@/components/TransactionModal";

global.fetch = vi.fn();

describe("TransactionModal Coverage Expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve lidar com mensagens de erro do servidor ao registrar transação", async () => {
    const handleClose = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Falha na transação" }),
    } as any);

    render(
      <TransactionModal
        isOpen={true}
        onClose={handleClose}
        onSave={vi.fn()}
        ativo={{ id: "a1", simbolo: "PETR4", nome: "Petrobras", quantidade: 10, precoMedio: 30, precoAtual: 35, classe: "ACOES_NACIONAIS" } as any}
      />
    );

    const qtdInput = screen.getByLabelText(/Quantidade/i);
    fireEvent.change(qtdInput, { target: { value: "10" } });

    const submitBtn = screen.getByRole("button", { name: /Confirmar COMPRA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Falha na transação")).toBeInTheDocument();
    });
  });
});
