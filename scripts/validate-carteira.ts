import { calcularPortfolio, AtivoDTO } from "../src/lib/calculator";

function runSanityCheck() {
  console.log("=========================================");
  console.log("⚡ IGNITE - SANITY CHECK DA CARTEIRA");
  console.log("=========================================\n");

  // Mock de uma carteira para validação exata dos cálculos matemáticos
  // Cenário:
  // 1. B3SA3: 105 cotas compradas a R$ 14.41 (Custo = 1513.05). Preço Atual = 10.00
  // 2. CDB 120% CDI: 1 cota de 1000. Comprei há 5 dias úteis.

  // Precisamos mockar as datas para garantir os 5 dias úteis do CDI
  const OriginalDate = global.Date;
  const mockNow = new Date("2025-01-08T12:00:00Z"); // Hoje (Quarta)
  const transacaoData = new Date("2025-01-01T12:00:00Z"); // 7 dias antes (Quarta-feira) -> 5 dias úteis

  // @ts-ignore
  global.Date = class extends OriginalDate {
    constructor(arg?: any) {
      if (arg) {
        super(arg);
      } else {
        super("2025-01-08T12:00:00Z");
      }
    }
  };

  const ativos: AtivoDTO[] = [
    {
      id: "A1",
      simbolo: "B3SA3",
      nome: "B3",
      classe: "ACOES",
      percentualIdeal: 50,
      precoAtual: 10.0,
      transacoes: [
        { id: "t1", ativoId: "A1", data: transacaoData, tipo: "COMPRA", quantidade: 105, precoUnitario: 14.41 },
      ],
    },
    {
      id: "RF1",
      simbolo: "CDB_120",
      nome: "CDB Banco Master",
      classe: "RENDA_FIXA",
      percentualIdeal: 50,
      precoAtual: 1000.0,
      taxaRentabilidade: 120,
      transacoes: [
        { id: "t2", ativoId: "RF1", data: transacaoData, tipo: "COMPRA", quantidade: 1, precoUnitario: 1000.0 },
      ],
    },
  ];

  console.log("-> Processando motor de cálculo...");
  const portfolio = calcularPortfolio(ativos);

  global.Date = OriginalDate;

  // Expected Math:
  // Ações B3SA3: 
  // Qtd = 105, PM = 14.41, Total Invest = 1513.05
  // Valor Mercado = 105 * 10 = 1050.00
  // L/P = 1050 - 1513.05 = -463.05

  // Renda Fixa CDB:
  // Qtd = 1, PM = 1000, Total Invest = 1000.00
  // Fator CDI 5 dias = 1.002501...
  // Preco Atual = 1002.50
  // Valor Mercado = 1002.50
  // L/P = +2.50
  
  // Patrimônio Total = 1050.00 + 1002.50 = 2052.50
  // Total Investido = 1513.05 + 1000.00 = 2513.05
  // Lucro Global = 2052.50 - 2513.05 = -460.55

  console.log("\n📈 RESULTADOS DA CARTEIRA:");
  console.log("-----------------------------------------");
  console.log(`Patrimônio Total:    R$ ${portfolio.patrimonioTotal.toFixed(2)}`);
  console.log(`Total Investido:     R$ ${portfolio.totalInvestidoTotal.toFixed(2)}`);
  console.log(`Lucro / Prejuízo:    R$ ${portfolio.lucroPrejuizoTotalR$.toFixed(2)} (${portfolio.lucroPrejuizoTotalPercentual.toFixed(2)}%)`);
  console.log("-----------------------------------------");
  
  const b3 = portfolio.ativos.find(a => a.simbolo === "B3SA3")!;
  const cdb = portfolio.ativos.find(a => a.simbolo === "CDB_120")!;

  console.log("\n📊 DETALHAMENTO DOS ATIVOS:");
  console.log(`[B3SA3] Valor Mercado: R$ ${b3.valorMercado.toFixed(2)} | PM: R$ ${b3.precoMedio.toFixed(2)} | Qtd: ${b3.quantidadeAtual}`);
  console.log(`[CDB_120] Valor Mercado: R$ ${cdb.valorMercado.toFixed(2)} | Rendimento Pro-rata: R$ ${cdb.rendimentoProRataR$.toFixed(2)} | Dias Úteis: ${cdb.diasUteisDecorridos}`);

  // Assertions (Sanity check fails if these don't match)
  let falhou = false;

  if (Math.abs(portfolio.patrimonioTotal - 2052.50) > 0.1) {
    console.error(`❌ ERRO: Patrimônio Total incorreto. Esperado ~2052.50, Calculado ${portfolio.patrimonioTotal}`);
    falhou = true;
  }
  
  if (Math.abs(portfolio.totalInvestidoTotal - 2513.05) > 0.01) {
    console.error(`❌ ERRO: Total Investido incorreto. Esperado 2513.05, Calculado ${portfolio.totalInvestidoTotal}`);
    falhou = true;
  }

  if (Math.abs(cdb.rendimentoProRataR$ - 2.50) > 0.02) {
    console.error(`❌ ERRO: Rendimento Renda Fixa incorreto. Esperado ~2.50, Calculado ${cdb.rendimentoProRataR$}`);
    falhou = true;
  }

  if (falhou) {
    console.log("\n❌ SANITY CHECK FALHOU. Revisar regras de negócio no calculator.ts.");
    process.exit(1);
  } else {
    console.log("\n✅ SANITY CHECK PASSOU COM SUCESSO! Valores validados com precisão.");
    process.exit(0);
  }
}

runSanityCheck();
