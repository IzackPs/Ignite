import { prisma } from "../src/lib/prisma";

async function main() {
  console.info("Semeando banco de dados com carteira, proventos e histórico de dividendos...");

  await prisma.provento.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.ativo.deleteMany();
  await prisma.metaClasse.deleteMany();
  await prisma.historicoPatrimonio.deleteMany();

  await prisma.metaClasse.createMany({
    data: [
      { classe: "ACOES", percentualIdeal: 40 },
      { classe: "FIIS", percentualIdeal: 10 },
      { classe: "ETFS", percentualIdeal: 10 },
      { classe: "RENDA_FIXA", percentualIdeal: 40 },
    ],
  });

  // 1. AÇÕES
  const petr4 = await prisma.ativo.create({
    data: {
      simbolo: "PETR4",
      nome: "Petrobras PN",
      classe: "ACOES",
      setor: "Petróleo & Gás",
      percentualIdeal: 20,
      precoAtual: 38.50,
      ultimoProvento: 1.25,
      transacoes: {
        create: [
          { data: new Date("2025-06-10"), tipo: "COMPRA", quantidade: 200, precoUnitario: 32.00 },
          { data: new Date("2025-09-15"), tipo: "COMPRA", quantidade: 100, precoUnitario: 35.50 },
        ],
      },
    },
  });

  const vale3 = await prisma.ativo.create({
    data: {
      simbolo: "VALE3",
      nome: "Vale ON",
      classe: "ACOES",
      setor: "Mineração",
      percentualIdeal: 20,
      precoAtual: 62.10,
      ultimoProvento: 2.10,
      transacoes: {
        create: [
          { data: new Date("2025-07-01"), tipo: "COMPRA", quantidade: 150, precoUnitario: 65.00 },
        ],
      },
    },
  });

  // 2. FIIs
  const hglg11 = await prisma.ativo.create({
    data: {
      simbolo: "HGLG11",
      nome: "CSHG Logística FII",
      classe: "FIIS",
      setor: "Imobiliário - Logística",
      percentualIdeal: 5,
      precoAtual: 162.00,
      ultimoProvento: 1.10,
      transacoes: {
        create: [
          { data: new Date("2025-08-01"), tipo: "COMPRA", quantidade: 25, precoUnitario: 158.00 },
        ],
      },
    },
  });

  const mxrf11 = await prisma.ativo.create({
    data: {
      simbolo: "MXRF11",
      nome: "Maxi Renda FII",
      classe: "FIIS",
      setor: "Imobiliário - Papel",
      percentualIdeal: 5,
      precoAtual: 10.45,
      ultimoProvento: 0.10,
      transacoes: {
        create: [
          { data: new Date("2025-08-10"), tipo: "COMPRA", quantidade: 400, precoUnitario: 10.20 },
        ],
      },
    },
  });

  // 3. ETFs
  await prisma.ativo.create({
    data: {
      simbolo: "IVVB11",
      nome: "iShares S&P 500 ETF",
      classe: "ETFS",
      setor: "Internacional - EUA",
      percentualIdeal: 10,
      precoAtual: 315.00,
      ultimoProvento: 0,
      transacoes: {
        create: [
          { data: new Date("2025-05-20"), tipo: "COMPRA", quantidade: 12, precoUnitario: 290.00 },
        ],
      },
    },
  });

  // 4. RENDA FIXA
  await prisma.ativo.create({
    data: {
      simbolo: "TESOURO-IPCA+2035",
      nome: "Tesouro IPCA+ 2035",
      classe: "RENDA_FIXA",
      setor: "Governo Federal",
      percentualIdeal: 25,
      precoAtual: 3250.00,
      ultimoProvento: 0,
      transacoes: {
        create: [
          { data: new Date("2025-01-15"), tipo: "COMPRA", quantidade: 4, precoUnitario: 3100.00 },
        ],
      },
    },
  });

  await prisma.ativo.create({
    data: {
      simbolo: "CDB-NUBANK-100CDI",
      nome: "CDB Nubank 100% CDI",
      classe: "RENDA_FIXA",
      setor: "Bancário",
      percentualIdeal: 15,
      precoAtual: 1.00,
      ultimoProvento: 0,
      transacoes: {
        create: [
          { data: new Date("2025-01-01"), tipo: "COMPRA", quantidade: 8000, precoUnitario: 1.00 },
        ],
      },
    },
  });

  // 5. HISTÓRICO DE PROVENTOS RECEBIDOS (Escadinha de Dividendos)
  await prisma.provento.createMany({
    data: [
      { data: new Date("2026-02-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 40.0 },
      { data: new Date("2026-02-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 27.5 },
      
      { data: new Date("2026-03-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 40.0 },
      { data: new Date("2026-03-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 27.5 },
      { data: new Date("2026-03-28"), ativoId: petr4.id, tipo: "DIVIDENDO", valorTotal: 250.0 },

      { data: new Date("2026-04-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 40.0 },
      { data: new Date("2026-04-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 27.5 },
      { data: new Date("2026-04-30"), ativoId: vale3.id, tipo: "JCP", valorTotal: 315.0 },

      { data: new Date("2026-05-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 42.0 },
      { data: new Date("2026-05-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 28.6 },

      { data: new Date("2026-06-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 45.0 },
      { data: new Date("2026-06-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 30.0 },
      { data: new Date("2026-06-25"), ativoId: petr4.id, tipo: "DIVIDENDO", valorTotal: 375.0 },

      { data: new Date("2026-07-15"), ativoId: mxrf11.id, tipo: "RENDIMENTO", valorTotal: 45.0 },
      { data: new Date("2026-07-20"), ativoId: hglg11.id, tipo: "RENDIMENTO", valorTotal: 30.0 },
    ],
  });

  // 6. HISTÓRICO PATRIMONIAL
  await prisma.historicoPatrimonio.createMany({
    data: [
      { data: new Date("2026-02-01"), patrimonioTotal: 38500.0, totalInvestido: 37000.0, lucroPrejuizo: 1500.0 },
      { data: new Date("2026-03-01"), patrimonioTotal: 41200.0, totalInvestido: 40000.0, lucroPrejuizo: 1200.0 },
      { data: new Date("2026-04-01"), patrimonioTotal: 45800.0, totalInvestido: 44000.0, lucroPrejuizo: 1800.0 },
      { data: new Date("2026-05-01"), patrimonioTotal: 48900.0, totalInvestido: 47500.0, lucroPrejuizo: 1400.0 },
      { data: new Date("2026-06-01"), patrimonioTotal: 51200.0, totalInvestido: 49000.0, lucroPrejuizo: 2200.0 },
      { data: new Date("2026-07-01"), patrimonioTotal: 53875.0, totalInvestido: 51610.0, lucroPrejuizo: 2265.0 },
    ],
  });

  console.info("✅ Banco de dados semeado com proventos!");
}

main()
  .catch((e) => {
    console.error("Erro ao semear:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
