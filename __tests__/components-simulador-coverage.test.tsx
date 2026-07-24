
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimuladorAporteBar } from "@/components/SimuladorAporteBar";

global.fetch = vi.fn();

describe("SimuladorAporteBar Coverage Expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve alternar os botões de presets (+500, +1000, +2000, +5000) e alternar o colapso", () => {
    render(
      <SimuladorAporteBar
        onRefresh={vi.fn()}
        portfolio={{
          patrimonioTotal: 10000,
          totalInvestidoTotal: 9000,
          lucroPrejuizoTotalR$: 1000,
          lucroPrejuizoTotalPercentual: 11.1,
          rendaMensalTotalEstimada: 100,
          resumoClasses: [],
          ativos: [
            {
              id: "a1",
              simbolo: "HGLG11",
              nome: "CSHG Logística",
              classe: "FIIS",
              quantidade: 10,
              precoMedio: 150,
              precoAtual: 160,
              valorMercado: 1600,
              valorTotal: 1600,
              percentualAtual: 16,
              percentualIdeal: 25,
              metaR$: 2500,
              faltaR$: 900,
              desvioPercentual: -9,
              status: "COMPRAR",
              notaIgnite: 9,
              numeroMagico: 160,
              ultimoProvento: 1.1,
            } as any,
          ],
        }}
      />
    );

    // Clicar no preset +500
    const btn500 = screen.getByRole("button", { name: /\+500$/i });
    fireEvent.click(btn500);
    expect(screen.getByText("Carrinho de Compras")).toBeInTheDocument();

    // Clicar no preset +1000
    const btn1000 = screen.getByRole("button", { name: /\+1000$/i });
    fireEvent.click(btn1000);

    // Clicar no preset +2000
    const btn2000 = screen.getByRole("button", { name: /\+2000$/i });
    fireEvent.click(btn2000);

    // Clicar no preset +5000
    const btn5000 = screen.getByRole("button", { name: /\+5000$/i });
    fireEvent.click(btn5000);

    // Clicar no cabeçalho para recolher/expandir
    const headerBtn = screen.getByRole("button", { name: /Simular Aporte Inteligente/i });
    fireEvent.click(headerBtn);
    fireEvent.click(headerBtn);
  });
});
