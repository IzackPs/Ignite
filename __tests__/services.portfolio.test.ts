import { describe, it, expect, vi, beforeEach } from "vitest";
import { portfolioService } from "../src/lib/services/portfolio.service";
import { prisma } from "../src/lib/prisma";
import * as calculator from "../src/lib/calculator";
import * as cdiService from "../src/lib/services/cdi.service";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    ativo: {
      findMany: vi.fn(),
    },
    metaClasse: {
      findMany: vi.fn(),
    },
    historicoPatrimonio: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/calculator", () => {
  return {
    calcularPortfolio: vi.fn(),
  };
});

vi.mock("../src/lib/services/cdi.service", () => ({
  getCdiAtual: vi.fn(),
}));

describe("portfolioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve calcular portfólio de um usuário com CDI dinâmico", async () => {
    const userId = "user1";

    const ativosMock = [
      {
        id: "a1",
        userId,
        simbolo: "PETR4",
        nome: "Petrobras",
        classe: "ACOES",
        percentualIdeal: 20,
        precoAtual: 30,
        transacoes: [
          {
            id: "t1",
            ativoId: "a1",
            data: new Date("2024-01-01"),
            tipo: "COMPRA",
            quantidade: 100,
            precoUnitario: 25,
          },
        ],
      },
    ];

    const metasMock = [
      { id: "m1", userId, classe: "ACOES", percentualIdeal: 30 },
    ];

    const historicoMock = [
      {
        id: "h1",
        userId,
        data: new Date("2024-01-01"),
        patrimonioTotal: 1000,
        totalInvestido: 900,
        lucroPrejuizo: 100,
      },
    ];

    const cdiMock = {
      taxaCdiAnual: 0.1415,
      taxaCdiDiaria: 0.000525,
      fonte: "BCB_API" as const,
    };

    vi.mocked(prisma.ativo.findMany).mockResolvedValue(ativosMock as any);
    vi.mocked(prisma.metaClasse.findMany).mockResolvedValue(metasMock as any);
    vi.mocked(prisma.historicoPatrimonio.findMany).mockResolvedValue(historicoMock as any);
    vi.mocked(cdiService.getCdiAtual).mockResolvedValue(cdiMock);

    const portfolioMockResult = {
      patrimonioTotal: 3000,
      totalInvestidoTotal: 2500,
      lucroPrejuizoTotalR$: 500,
      lucroPrejuizoTotalPercentual: 20,
      rendaMensalTotalEstimada: 10,
      ativos: [],
      resumoClasses: [],
    };
    
    vi.mocked(calculator.calcularPortfolio).mockReturnValue(portfolioMockResult as any);

    const res = await portfolioService.calcularParaUsuario(userId);

    expect(prisma.ativo.findMany).toHaveBeenCalledWith({
      where: { userId },
      include: { transacoes: true, answers: true },
      orderBy: { simbolo: "asc" },
    });

    expect(prisma.metaClasse.findMany).toHaveBeenCalledWith({
      where: { userId },
    });

    expect(prisma.historicoPatrimonio.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { data: "asc" },
    });

    expect(cdiService.getCdiAtual).toHaveBeenCalled();

    expect(calculator.calcularPortfolio).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          simbolo: "PETR4",
          classe: "ACOES",
        }),
      ]),
      { ACOES: 30 },
      0.1415
    );

    expect(res).toEqual({
      ...portfolioMockResult,
      historico: historicoMock,
      cdiInfo: {
        taxaCdiAnual: 0.1415,
        taxaCdiAnualFormatada: "14,15%",
        fonte: "BCB_API",
      },
    });
  });
});

