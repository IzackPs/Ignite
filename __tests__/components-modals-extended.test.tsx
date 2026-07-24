import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AssetModal } from "@/components/AssetModal";
import { TransactionModal } from "@/components/TransactionModal";

describe("AssetModal & TransactionModal Extended Coverage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("AssetModal Extended", () => {
    it("deve renderizar campos de Renda Fixa ao selecionar a classe RENDA_FIXA", () => {
      render(
        <AssetModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initialClasse="RENDA_FIXA"
        />
      );

      expect(screen.getByText("% do CDI")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex: 120")).toBeInTheDocument();
    });

    it("deve exibir banner de erro se o salvamento falhar", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (url: string) => {
          if (url.includes("/api/questions")) return { ok: true, json: async () => [] };
          if (url.includes("/api/ativos/fundamentalist")) return { ok: true, json: async () => ({}) };
          if (url.includes("/api/ativos/search")) return { ok: true, json: async () => ({}) };
          return {
            ok: false,
            json: async () => ({ error: "Erro ao salvar ativo no banco" }),
          };
        })
      );

      render(
        <AssetModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      fireEvent.change(screen.getByLabelText(/Ticker \/ Símbolo/i), {
        target: { value: "PETR4" },
      });
      fireEvent.change(screen.getByLabelText(/Nome do Ativo/i), {
        target: { value: "Petrobras" },
      });

      fireEvent.click(screen.getByText("Salvar Ativo"));

      await waitFor(() => {
        expect(screen.getByText("Erro ao salvar ativo no banco")).toBeInTheDocument();
      });
    });
  });

  describe("TransactionModal Extended", () => {
    it("deve alternar para modo VENDA e renderizar preview de venda", () => {
      const mockAtivo: any = {
        id: "1",
        simbolo: "PETR4",
        nome: "Petrobras",
        quantidadeAtual: 100,
        precoMedio: 30.0,
        precoAtual: 35.0,
        totalInvestido: 3000,
      };

      render(
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          ativo={mockAtivo}
        />
      );

      const btnVenda = screen.getByRole("button", { name: /Venda/i });
      fireEvent.click(btnVenda);

      expect(screen.getByText("Confirmar VENDA")).toBeInTheDocument();
    });

    it("deve exibir erro de validação ao tentar submeter formulário sem campos obrigatórios válidos", async () => {
      const { container } = render(
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          ativo={null}
          ativos={[]}
        />
      );

      const form = container.querySelector("form");
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText("Selecione um ativo válido para registrar a transação.")
        ).toBeInTheDocument();
      });
    });
  });
});
