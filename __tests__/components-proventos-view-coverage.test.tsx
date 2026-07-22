import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProventosView } from "@/components/ProventosView";

global.fetch = vi.fn();

describe("ProventosView Coverage Expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar proventos, abrir modal de registro e excluir provento", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalGeralRecebido: 500,
          mediaMensal: 50,
          proventosCount: 2,
          historicoMensal: [
            { chaveMes: "2026-01", mesAno: "Jan 2026", total: 500, dividendo: 500, jcp: 0, rendimento: 0 },
          ],
          proventos: [
            { id: "p1", ativoId: "a1", data: "2026-01-15T00:00:00Z", tipo: "DIVIDENDO", valorTotal: 500, ativo: { simbolo: "PETR4", nome: "Petrobras", classe: "ACOES_NACIONAIS" } },
          ],
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalGeralRecebido: 0,
          mediaMensal: 0,
          proventosCount: 0,
          historicoMensal: [],
          proventos: [],
        }),
      } as any);

    render(<ProventosView ativos={[]} />);

    await waitFor(() => {
      expect(screen.getByText("PETR4")).toBeInTheDocument();
      expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
    });

    // Clicar em "Novo Provento"
    const addBtn = screen.getByRole("button", { name: /Registrar Provento/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Registrar Recebimento de Provento")).toBeInTheDocument();

    // Fechar modal de provento clicando em cancelar
    const cancelBtn = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    // Clicar em excluir provento
    const deleteBtn = screen.getByTitle("Excluir lançamento");
    fireEvent.click(deleteBtn);

    // Confirmar exclusão
    const confirmBtn = screen.getByRole("button", { name: /^Excluir Provento$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/proventos?id=p1", expect.objectContaining({ method: "DELETE" }));
    });
  });
});
