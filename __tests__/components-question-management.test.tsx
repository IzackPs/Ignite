
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuestionManagementView } from "@/components/QuestionManagementView";

global.fetch = vi.fn();

describe("QuestionManagementView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e exibir os critérios de análise", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "q1", criterio: "ROE", pergunta: "O ROE é > 10%?", peso: 1.5, isDefault: true },
        { id: "q2", criterio: "DY", pergunta: "O Dividend Yield é > 6%?", peso: 2.0, isDefault: false },
      ],
    } as any);

    render(<QuestionManagementView />);

    await waitFor(() => {
      expect(screen.getByText("ROE")).toBeInTheDocument();
      expect(screen.getByText("DY")).toBeInTheDocument();
      expect(screen.getByText("O ROE é > 10%?")).toBeInTheDocument();
    });
  });

  it("deve abrir o modal para adicionar novo critério e enviar com sucesso", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "q3", criterio: "DIVIDA", pergunta: "Endividamento controlado?", peso: 1.0, isDefault: false }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "q3", criterio: "DIVIDA", pergunta: "Endividamento controlado?", peso: 1.0, isDefault: false },
        ],
      } as any);

    render(<QuestionManagementView />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum critério cadastrado. Crie um novo ou recupere os padrões.")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /Novo Critério/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Novo Critério de Análise")).toBeInTheDocument();

    const inputCriterio = screen.getByPlaceholderText("Ex: ROE, GOVERNANCA, MARGEM");
    const inputPergunta = screen.getByPlaceholderText("Ex: O ROE histórico da empresa é maior do que 5%?");

    fireEvent.change(inputCriterio, { target: { value: "DIVIDA" } });
    fireEvent.change(inputPergunta, { target: { value: "Endividamento controlled?" } });

    const submitBtn = screen.getByRole("button", { name: /Salvar Critério/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/questions", expect.objectContaining({ method: "POST" }));
    });
  });

  it("deve abrir modal de confirmação e resetar para critérios padrão", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "def1", criterio: "ROE", pergunta: "O ROE é > 5%?", peso: 1.0, isDefault: true }],
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "def1", criterio: "ROE", pergunta: "O ROE é > 5%?", peso: 1.0, isDefault: true }],
      } as any);

    render(<QuestionManagementView />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Restaurar Padrões Ignite/i })).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: /Restaurar Padrões Ignite/i });
    fireEvent.click(resetBtn);

    const confirmBtn = screen.getByRole("button", { name: /^Restaurar Padrões$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/questions/reset", expect.objectContaining({ method: "POST" }));
    });
  });
});
