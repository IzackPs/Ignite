
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuestionManagementView } from "@/components/QuestionManagementView";

global.fetch = vi.fn();

describe("QuestionManagementView Edit & Delete Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir editar e excluir um critério", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "q1", criterio: "GOVERNANCA", pergunta: "Possui Tag Along 100%?", peso: 1.5, isDefault: false },
        ],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "q1", criterio: "GOVERNANCA", pergunta: "Possui Tag Along 100%?", peso: 1.5, isDefault: false },
        ],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

    render(<QuestionManagementView />);

    await waitFor(() => {
      expect(screen.getByText("GOVERNANCA")).toBeInTheDocument();
    });

    // Clicar em Editar
    const editBtn = screen.getByTitle("Editar Critério");
    fireEvent.click(editBtn);

    expect(screen.getByText("Editar Critério")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Salvar Critério/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/questions", expect.objectContaining({ method: "PUT" }));
    });

    // Clicar em Excluir
    await waitFor(() => {
      expect(screen.getByTitle("Excluir Critério")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle("Excluir Critério");
    fireEvent.click(deleteBtn);

    const confirmBtns = screen.getAllByRole("button", { name: /Excluir Critério/i });
    const confirmBtn = confirmBtns[confirmBtns.length - 1];
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/questions?id=q1", expect.objectContaining({ method: "DELETE" }));
    });
  });
});
