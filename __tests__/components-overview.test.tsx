import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PortfolioOverview } from "@/components/PortfolioOverview";

const mockPortfolio: any = {
  patrimonioTotal: 50000,
  totalInvestidoTotal: 45000,
  lucroPrejuizoTotalR$: 5000,
  lucroPrejuizoTotalPercentual: 11.11,
  rendaMensalTotalEstimada: 350,
  resumoClasses: [
    {
      classe: "ACOES",
      nomeClasse: "Ações",
      valorMercadoTotal: 25000,
      percentualAtual: 50,
      metaPercentual: 40,
      faltaR$: 0,
      status: "AGUARDAR",
    },
    {
      classe: "FIIS",
      nomeClasse: "FIIs",
      valorMercadoTotal: 25000,
      percentualAtual: 50,
      metaPercentual: 60,
      faltaR$: 5000,
      status: "COMPRAR",
    },
  ],
  ativos: [
    {
      id: "fii-1",
      simbolo: "HGLG11",
      nome: "CGHG Logistica",
      classe: "FIIS",
      percentualAtual: 25,
      percentualIdeal: 30,
      status: "COMPRAR",
      numeroMagico: 100,
      quantidadeAtual: 50,
      cotasFaltantesMagico: 50,
      progressoMagicoPercentual: 50,
    },
    {
      id: "fii-2",
      simbolo: "KNCR11",
      nome: "Kinea Rendimentos",
      classe: "FIIS",
      percentualAtual: 25,
      percentualIdeal: 25,
      status: "AGUARDAR",
      numeroMagico: 80,
      quantidadeAtual: 85,
      cotasFaltantesMagico: 0,
      progressoMagicoPercentual: 100,
    },
  ],
};

describe("PortfolioOverview", () => {
  it("deve renderizar os indicadores principais e cards de resumo", () => {
    render(
      <PortfolioOverview
        portfolio={mockPortfolio}
        onSelectTab={vi.fn()}
        isBalanceVisible={true}
        cdiAnualPercentual={14.25}
      />
    );

    expect(screen.getByText("Rentabilidade Histórica")).toBeInTheDocument();
    expect(screen.getByText("Renda Passiva Estimada")).toBeInTheDocument();
    expect(screen.getByText("Saúde da Carteira")).toBeInTheDocument();
    expect(screen.getByText("Alocação por Classe de Ativos")).toBeInTheDocument();
  });

  it("deve ocultar saldos quando isBalanceVisible for false", () => {
    render(
      <PortfolioOverview
        portfolio={mockPortfolio}
        onSelectTab={vi.fn()}
        isBalanceVisible={false}
      />
    );

    expect(screen.getAllByText("R$ •••••").length).toBeGreaterThan(0);
  });

  it("deve disparar os callbacks das ações rápidas ao clicar nos botões", () => {
    const onNovoAtivo = vi.fn();
    const onAddTransacao = vi.fn();
    const onOpenMetasModal = vi.fn();

    render(
      <PortfolioOverview
        portfolio={mockPortfolio}
        onSelectTab={vi.fn()}
        onNovoAtivo={onNovoAtivo}
        onAddTransacao={onAddTransacao}
        onOpenMetasModal={onOpenMetasModal}
      />
    );

    fireEvent.click(screen.getByText("Aportar"));
    expect(onNovoAtivo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Registrar Operação"));
    expect(onAddTransacao).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Reequilibrar Carteira"));
    expect(onOpenMetasModal).toHaveBeenCalledTimes(1);
  });

  it("deve alternar a aba ao clicar no card de classe de ativo", () => {
    const onSelectTab = vi.fn();
    render(
      <PortfolioOverview
        portfolio={mockPortfolio}
        onSelectTab={onSelectTab}
      />
    );

    const acoesBtn = screen.getByLabelText("Ver detalhes da classe Ações");
    fireEvent.click(acoesBtn);

    expect(onSelectTab).toHaveBeenCalledWith("ACOES");
  });
});
