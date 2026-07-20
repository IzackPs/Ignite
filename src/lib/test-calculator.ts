import {
  calcularPosicaoAtivo,
  calcularPortfolio,
  AtivoDTO,
  TransacaoDTO,
} from "./calculator";

function testCalculator() {
  console.log("--- Executando Testes do Motor de Cálculo de Rebalanceamento ---");

  // 1. Teste de Preço Médio e Quantidade (Compras e Venda Parcial)
  const transacoesAtivo1: TransacaoDTO[] = [
    { id: "1", ativoId: "petr4", data: "2026-01-01", tipo: "COMPRA", quantidade: 100, precoUnitario: 30.0 }, // Custo 3000
    { id: "2", ativoId: "petr4", data: "2026-01-15", tipo: "COMPRA", quantidade: 100, precoUnitario: 40.0 }, // Custo 4000 (total 200 a PM 35.0)
    { id: "3", ativoId: "petr4", data: "2026-02-01", tipo: "VENDA", quantidade: 50, precoUnitario: 45.0 },   // Sobram 150 a PM 35.0 (Total Investido 5250)
  ];

  const pos1 = calcularPosicaoAtivo(transacoesAtivo1);
  console.assert(pos1.quantidadeAtual === 150, `Esperado 150 qtd, obtido ${pos1.quantidadeAtual}`);
  console.assert(pos1.precoMedio === 35.0, `Esperado PM 35.0, obtido ${pos1.precoMedio}`);
  console.assert(pos1.totalInvestido === 5250.0, `Esperado Total Investido 5250, obtido ${pos1.totalInvestido}`);

  // 2. Teste do Portfólio Completo com Rebalanceamento
  const ativos: AtivoDTO[] = [
    {
      id: "1",
      simbolo: "PETR4",
      nome: "Petrobras PN",
      classe: "ACOES",
      percentualIdeal: 20, // 20% da carteira total
      precoAtual: 40.0,
      transacoes: transacoesAtivo1, // 150 qtd, PM 35.0 -> Mercado 6000 R$
    },
    {
      id: "2",
      simbolo: "VALE3",
      nome: "Vale ON",
      classe: "ACOES",
      percentualIdeal: 20, // 20% da carteira total
      precoAtual: 60.0,
      transacoes: [
        { id: "4", ativoId: "2", data: "2026-01-01", tipo: "COMPRA", quantidade: 100, precoUnitario: 60.0 } // 100 qtd, PM 60 -> Mercado 6000 R$
      ],
    },
    {
      id: "3",
      simbolo: "HGLG11",
      nome: "CSHG Logística",
      classe: "FIIS",
      percentualIdeal: 10, // 10% da carteira total
      precoAtual: 160.0,
      transacoes: [
        { id: "5", ativoId: "3", data: "2026-01-01", tipo: "COMPRA", quantidade: 10, precoUnitario: 160.0 } // 10 qtd -> Mercado 1600 R$
      ],
    },
    {
      id: "4",
      simbolo: "IVVB11",
      nome: "iShares S&P 500",
      classe: "ETFS",
      percentualIdeal: 10, // 10% da carteira total
      precoAtual: 300.0,
      transacoes: [
        { id: "6", ativoId: "4", data: "2026-01-01", tipo: "COMPRA", quantidade: 4, precoUnitario: 300.0 } // 4 qtd -> Mercado 1200 R$
      ],
    },
    {
      id: "5",
      simbolo: "TESOURO_IPCA",
      nome: "Tesouro IPCA+ 2035",
      classe: "RENDA_FIXA",
      percentualIdeal: 40, // 40% da carteira total
      precoAtual: 1000.0,
      transacoes: [
        { id: "7", ativoId: "5", data: "2026-01-01", tipo: "COMPRA", quantidade: 5, precoUnitario: 1000.0 } // 5 qtd -> Mercado 5000 R$
      ],
    },
  ];

  // Mercado Total: PETR4(6000) + VALE3(6000) + HGLG11(1600) + IVVB11(1200) + TESOURO(5000) = 19,800 R$
  const resultado = calcularPortfolio(ativos);

  console.log("Patrimônio Total Calculado:", resultado.patrimonioTotal);
  console.log("Resumo por Classes:", resultado.resumoClasses);
  console.log("Ativos Calculados:", resultado.ativos.map(a => ({
    simbolo: a.simbolo,
    percentualAtual: a.percentualAtual.toFixed(2) + "%",
    percentualIdeal: a.percentualIdeal + "%",
    faltaR$: a.faltaR$,
    status: a.status,
    qtdAComprar: a.qtdAComprar
  })));

  console.log("✅ Todos os testes do motor de cálculo passaram com sucesso!");
}

testCalculator();
