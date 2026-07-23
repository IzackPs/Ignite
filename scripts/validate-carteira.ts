import { calcularPortfolio, AtivoDTO } from "../src/lib/calculator";

function runSanityCheck() {
  console.info("=========================================");
  console.info("⚡ IGNITE - SANITY CHECK DA CARTEIRA");
  console.info("=========================================\n");

  // Mock de uma carteira para validação exata dos cálculos matemáticos
  // Cenário:
  // 1. B3SA3: 105 cotas compradas a R$ 14.41 (Custo = 1513.05). Preço Atual = 10.00
  // 2. CDB 120% CDI: 1 cota de 1000. Comprei há 5 dias úteis.

  // Precisamos mockar as datas para garantir os 5 dias úteis do CDI
  const OriginalDate = global.Date;
  const _mockNow = new Date("2025-01-09T12:00:00Z"); // Hoje (Quinta-feira)
  const transacaoData = new Date("2025-01-02T12:00:00Z"); // 7 dias depois (Quinta-feira) -> 5 dias úteis

  // @ts-expect-error mock global date
  global.Date = class extends OriginalDate {
    constructor(arg?: any) {
      if (arg) {
        super(arg);
      } else {
        super("2025-01-09T12:00:00Z");
      }
    }
  };

  const ativos: AtivoDTO[] = [
    {
      id: "A1",
      simbolo: "B3SA3",
      nome: "B3",
      classe: "ACOES_NACIONAIS",
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

  console.info("-> Processando motor de cálculo...");
  const portfolio = calcularPortfolio(ativos, undefined, 0.11);

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

  console.info("\n📈 RESULTADOS DA CARTEIRA:");
  console.info("-----------------------------------------");
  console.info(`Patrimônio Total:    R$ ${portfolio.patrimonioTotal.toFixed(2)}`);
  console.info(`Total Investido:     R$ ${portfolio.totalInvestidoTotal.toFixed(2)}`);
  console.info(`Lucro / Prejuízo:    R$ ${portfolio.lucroPrejuizoTotalR$.toFixed(2)} (${portfolio.lucroPrejuizoTotalPercentual.toFixed(2)}%)`);
  console.info("-----------------------------------------");
  
  const b3 = portfolio.ativos.find(a => a.simbolo === "B3SA3")!;
  const cdb = portfolio.ativos.find(a => a.simbolo === "CDB_120")!;

  console.info("\n📊 DETALHAMENTO DOS ATIVOS:");
  console.info(`[B3SA3] Valor Mercado: R$ ${b3.valorMercado.toFixed(2)} | PM: R$ ${b3.precoMedio.toFixed(2)} | Qtd: ${b3.quantidadeAtual}`);
  console.info(`[CDB_120] Valor Mercado: R$ ${cdb.valorMercado.toFixed(2)} | Rendimento Pro-rata: R$ ${cdb.rendimentoProRataR$.toFixed(2)} | Dias Úteis: ${cdb.diasUteisDecorridos}`);

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
    console.info("\n❌ SANITY CHECK FALHOU. Revisar regras de negócio no calculator.ts.");
    process.exit(1);
  } else {
    console.info("\n✅ SANITY CHECK PASSOU COM SUCESSO! Valores validados com precisão.");
    process.exit(0);
  }
}

runSanityCheck();
