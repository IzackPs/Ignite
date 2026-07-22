import { describe, it, expect } from "vitest";
import { simularAporteGreedy, AtivoCalculado } from "../src/lib/calculator";

describe("Simulador Inteligente de Aporte (Algoritmo Greedy)", () => {
  it("deve distribuir o orçamento priorizando os ativos com maior defasagem em R$ iterativamente", () => {
    // Cenário:
    // Orçamento = R$ 2000,00
    // Ativo 1 (Ação) preco = 50.00, defasagem = 1500 (mais longe)
    // Ativo 2 (FII) preco = 100.00, defasagem = 400 (meio termo)
    // Ativo 3 (ETF) preco = 200.00, defasagem = 0 (na meta)
    
    const ativos: AtivoCalculado[] = [
      {
        id: "A1", simbolo: "PETR4", nome: "Petrobras", classe: "ACOES",
        percentualIdeal: 50, precoAtual: 50.0,
        valorMercado: 1000, // Defasagem inicial depende do Patrimonio
        // Demais props irrelevantes para o simulador
        ultimoProvento: 0, taxaRentabilidade: 100, nota: 10, rendimentoProRataR$: 0, diasUteisDecorridos: 0,
        quantidadeAtual: 20, precoMedio: 45, totalInvestido: 900, lucroPrejuizoR$: 100, lucroPrejuizoPercentual: 11,
        percentualAtual: 33.33, faltaR$: 1500, status: "COMPRAR", qtdAComprar: 30,
        numeroMagico: 0, cotasFaltantesMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0
      },
      {
        id: "F1", simbolo: "HGLG11", nome: "CSHG Logística", classe: "FIIS",
        percentualIdeal: 25, precoAtual: 100.0,
        valorMercado: 1000,
        ultimoProvento: 0, taxaRentabilidade: 100, nota: 10, rendimentoProRataR$: 0, diasUteisDecorridos: 0,
        quantidadeAtual: 10, precoMedio: 100, totalInvestido: 1000, lucroPrejuizoR$: 0, lucroPrejuizoPercentual: 0,
        percentualAtual: 33.33, faltaR$: 400, status: "COMPRAR", qtdAComprar: 4,
        numeroMagico: 0, cotasFaltantesMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0
      },
      {
        id: "E1", simbolo: "IVVB11", nome: "iShares S&P 500", classe: "ETFS",
        percentualIdeal: 25, precoAtual: 200.0,
        valorMercado: 1000, // Acima da meta
        ultimoProvento: 0, taxaRentabilidade: 100, nota: 10, rendimentoProRataR$: 0, diasUteisDecorridos: 0,
        quantidadeAtual: 5, precoMedio: 150, totalInvestido: 750, lucroPrejuizoR$: 250, lucroPrejuizoPercentual: 33,
        percentualAtual: 33.33, faltaR$: -100, status: "AGUARDAR", qtdAComprar: 0,
        numeroMagico: 0, cotasFaltantesMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0
      }
    ];

    const patrimonioAtual = 3000;
    const orcamento = 2000;

    const resultado = simularAporteGreedy(ativos, patrimonioAtual, orcamento);

    // O algoritmo deve comprar mais A1 até que a defasagem fique menor que F1, depois intercala.
    // E1 não deve receber aportes, pois a meta simulada será menor que o valor atual.
    
    expect(resultado.orcamentoInformado).toBe(2000);
    
    // O carrinho DEVE conter IVVB11 (E1) no final, pois o patrimônio cresce tanto que a meta ideal de IVVB11 supera o valor atual
    const ivvb11 = resultado.itensCarrinho.find(a => a.simbolo === "IVVB11");
    expect(ivvb11).toBeDefined();
    expect(ivvb11?.qtdSimuladaComprar).toBe(1); // Acaba comprando 1 cota

    // Validar se o troco + gasto == orcamento
    expect(resultado.totalGasto + resultado.sobraTroco).toBe(2000);

    const petr4 = resultado.itensCarrinho.find(a => a.simbolo === "PETR4");
    const hglg11 = resultado.itensCarrinho.find(a => a.simbolo === "HGLG11");

    // PETR4 deve ter mais aportes devido a maior defasagem e menor preço
    expect(petr4).toBeDefined();
    expect(petr4?.qtdSimuladaComprar).toBeGreaterThan(10);
    
    // HGLG11 também deve receber algumas cotas
    expect(hglg11).toBeDefined();
    
    // O troco deve ser menor que o menor preço disponível de qualquer ativo que ainda tem defasagem
    expect(resultado.sobraTroco).toBeLessThan(50);
  });
});
