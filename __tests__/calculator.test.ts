import { describe, it, expect } from "vitest";
import {
  calcularPosicaoAtivo,
  calcularPortfolio,
  TransacaoDTO,
  AtivoDTO,
} from "../src/lib/calculator";

describe("Motor de Cálculo (calculator.ts)", () => {
  describe("Preço Médio Ponderado", () => {
    it("deve recalcular o preço médio corretamente em compras consecutivas e manter intacto na venda", () => {
      const transacoes: TransacaoDTO[] = [
        { id: "1", ativoId: "A", data: "2026-01-01", tipo: "COMPRA", quantidade: 10, precoUnitario: 25.0 }, // Custo 250, PM 25
        { id: "2", ativoId: "A", data: "2026-01-02", tipo: "COMPRA", quantidade: 5, precoUnitario: 30.0 }, // Custo 150. Acum 400. PM = 400/15 = 26.6667
        { id: "3", ativoId: "A", data: "2026-01-03", tipo: "VENDA", quantidade: 3, precoUnitario: 35.0 }, // Venda 3 cotas. Qtd = 12. PM mantém 26.6667
      ];

      const resultado = calcularPosicaoAtivo(transacoes);

      expect(resultado.quantidadeAtual).toBe(12);
      expect(resultado.precoMedio).toBe(26.6667);
      expect(resultado.totalInvestido).toBe(320); // 12 * 26.6667 = 320.0004 -> toFixed(2) -> 320.00
    });
  });

  describe("Status de Rebalanceamento", () => {
    it("deve retornar 'COMPRAR' quando % Atual < % Ideal e calcular qtdAComprar com Math.floor", () => {
      const ativos: AtivoDTO[] = [
        {
          id: "A1",
          simbolo: "B3SA3",
          nome: "B3",
          classe: "ACOES",
          percentualIdeal: 50, // Meta 50%
          precoAtual: 10.0,
          transacoes: [
            { id: "t1", ativoId: "A1", data: "2026-01-01", tipo: "COMPRA", quantidade: 30, precoUnitario: 10.0 }, // ValorMercado = 300
          ],
        },
        {
          id: "A2",
          simbolo: "WEGE3",
          nome: "WEG",
          classe: "ACOES",
          percentualIdeal: 50, // Meta 50%
          precoAtual: 20.0,
          transacoes: [
            { id: "t2", ativoId: "A2", data: "2026-01-01", tipo: "COMPRA", quantidade: 35, precoUnitario: 20.0 }, // ValorMercado = 700
          ],
        },
      ];

      // Patrimonio Total = 1000. Meta B3 = 50% = 500. Atual = 300. Falta 200. Preço = 10. QtdAComprar = 20.
      const portfolio = calcularPortfolio(ativos);
      const b3 = portfolio.ativos.find((a) => a.simbolo === "B3SA3");
      const weg = portfolio.ativos.find((a) => a.simbolo === "WEGE3");

      expect(portfolio.patrimonioTotal).toBe(1000);

      // Asserções para B3SA3 (Abaixo da Meta)
      expect(b3?.percentualAtual).toBe(30); // 300/1000
      expect(b3?.faltaR$).toBe(200);
      expect(b3?.status).toBe("COMPRAR");
      expect(b3?.qtdAComprar).toBe(20);

      // Asserções para WEGE3 (Acima da Meta)
      expect(weg?.percentualAtual).toBe(70); // 700/1000
      expect(weg?.faltaR$).toBe(-200);
      expect(weg?.status).toBe("AGUARDAR");
      expect(weg?.qtdAComprar).toBe(0);
    });
  });

  describe("Número Mágico (FIIs)", () => {
    it("deve arredondar para cima (ceil) as cotas necessárias para comprar uma nova cota com proventos", () => {
      const ativos: AtivoDTO[] = [
        {
          id: "FII1",
          simbolo: "MXRF11",
          nome: "Maxi Renda",
          classe: "FIIS",
          percentualIdeal: 100,
          precoAtual: 10.5,
          ultimoProvento: 0.1, // 10.5 / 0.1 = 105
          transacoes: [
            { id: "tf1", ativoId: "FII1", data: "2026-01-01", tipo: "COMPRA", quantidade: 60, precoUnitario: 10.0 },
          ],
        },
      ];

      const portfolio = calcularPortfolio(ativos);
      const mxrf = portfolio.ativos[0];

      expect(mxrf.numeroMagico).toBe(105);
      expect(mxrf.cotasFaltantesMagico).toBe(45); // 105 - 60
      // 60 / 105 = 0.5714 -> 57.14%
      expect(mxrf.progressoMagicoPercentual).toBe(57.14);
      expect(mxrf.rendaMensalEstimada).toBe(6.0); // 60 * 0.1
    });
  });

  describe("Renda Fixa (Pro-rata CDI)", () => {
    it("deve calcular a progressão diária baseada em CDI pro-rata em dias úteis", () => {
      // 11% a.a -> CDI = 0.0004134... por dia (passado explicitamente como parâmetro)
      // 120% CDI
      // Dias = 5 (seg a sex)
      
      const inicio = new Date();
      inicio.setHours(0,0,0,0);
      
      // Quarta-feira, 5 de Março de 2025 -> Quarta-feira, 12 de Março de 2025 (5 dias úteis)
      const transacaoData = new Date("2025-03-05T12:00:00Z");
      const OriginalDate = global.Date;
      
      // @ts-expect-error mock global date
      global.Date = class extends OriginalDate {
        constructor(arg?: any) {
          if (arg) {
            super(arg);
          } else {
            super("2025-03-12T12:00:00Z");
          }
        }
      };

      const ativos: AtivoDTO[] = [
        {
          id: "RF1",
          simbolo: "CDB_120",
          nome: "CDB Banco Master",
          classe: "RENDA_FIXA",
          percentualIdeal: 100,
          precoAtual: 1000,
          taxaRentabilidade: 120, // 120% do CDI
          transacoes: [
            { id: "trf1", ativoId: "RF1", data: transacaoData, tipo: "COMPRA", quantidade: 1, precoUnitario: 1000 },
          ],
        },
      ];

      // Passa CDI explicitamente como 11% a.a. (0.11) para manter o teste determinístico
      const portfolio = calcularPortfolio(ativos, undefined, 0.11);
      const cdb = portfolio.ativos[0];

      // Restaurar Date original
      global.Date = OriginalDate;

      // Assertions
      expect(cdb.diasUteisDecorridos).toBe(5);
      
      expect(cdb.precoAtual).toBeGreaterThan(1002.48);
      expect(cdb.precoAtual).toBeLessThan(1002.52);
      expect(cdb.rendimentoProRataR$).toBeGreaterThan(2.48);
      expect(cdb.rendimentoProRataR$).toBeLessThan(2.52);
    });
  });
});
