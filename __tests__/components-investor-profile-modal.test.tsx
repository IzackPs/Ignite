import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InvestorProfileModal } from "@/components/InvestorProfileModal";

global.fetch = vi.fn();

describe("InvestorProfileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar dados e exibir botão de perfil", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        perfil: "MODERADO",
        idade: 30,
        horizonteAnos: 15,
        sugestao: {
          perfil: "MODERADO",
          descricao: "Equilíbrio entre valorização e segurança",
          distribuicao: {
            ACOES_NACIONAIS: 30,
            ACOES_INTERNACIONAIS: 20,
            FIIS: 20,
            REITS: 10,
            CRIPTO: 5,
            RENDA_FIXA: 15,
            RENDA_FIXA_INTERNACIONAL: 0,
          },
        },
      }),
    } as any);

    render(<InvestorProfileModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} resumoClasses={[]} />);

    await waitFor(() => {
      expect(screen.getByText("Perfil de Investimento & Sugestão por Idade")).toBeInTheDocument();
    });
  });

  it("deve permitir alterar idade e perfil de risco e aplicar sugestão", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          perfil: "CONSERVADOR",
          idade: 45,
          horizonteAnos: 10,
          sugestao: {
            perfil: "CONSERVADOR",
            descricao: "Foco em preservação de capital",
            distribuicao: {
              ACOES_NACIONAIS: 15,
              ACOES_INTERNACIONAIS: 5,
              FIIS: 20,
              REITS: 5,
              CRIPTO: 0,
              RENDA_FIXA: 50,
              RENDA_FIXA_INTERNACIONAL: 5,
            },
          },
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any);

    const handleSave = vi.fn();
    render(<InvestorProfileModal isOpen={true} onClose={vi.fn()} onSave={handleSave} resumoClasses={[]} />);

    await waitFor(() => {
      expect(screen.getByText("Perfil de Investimento & Sugestão por Idade")).toBeInTheDocument();
    });

    const arrojadoBtn = screen.getByText("Arrojado");
    fireEvent.click(arrojadoBtn);

    const applyBtn = screen.getByText("Aplicar Sugestão como Minhas Metas");
    fireEvent.click(applyBtn);

    await waitFor(
      () => {
        expect(handleSave).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });
});
