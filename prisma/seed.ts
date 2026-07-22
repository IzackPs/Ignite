import { prisma } from "../src/lib/prisma";

async function main() {
  console.info("Semeando banco de dados com carteira, proventos e histórico de dividendos...");

  await prisma.assetQuestionAnswer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.provento.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.ativo.deleteMany();
  await prisma.metaClasse.deleteMany();
  await prisma.historicoPatrimonio.deleteMany();

  let user = await prisma.user.findFirst({ where: { email: "admin@ignite.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Admin Ignite",
        email: "admin@ignite.com",
      }
    });
  }
  const userId = user.id;

  // 0. Semeia as 11 perguntas padrão do Diagrama AUVP
  const defaultQuestionsData = [
    { criterio: "ROE", pergunta: "ROE historicamente maior que 5%?", peso: 1.0 },
    { criterio: "CAGR", pergunta: "Crescimento nos últimos 5 anos (CAGR Receita/Lucro) positivo?", peso: 1.0 },
    { criterio: "DIVIDENDOS", pergunta: "Paga dividendos constantes ou possui bom histórico de proventos?", peso: 1.0 },
    { criterio: "TECNOLOGIA", pergunta: "Investe em tecnologia, inovação contínua ou ganho de eficiência?", peso: 1.0 },
    { criterio: "TEMPO_DE_MERCADO", pergunta: "Possui mais de 5 anos de histórico/listagem de mercado?", peso: 1.0 },
    { criterio: "VANTAGENS_COMPETITIVAS", pergunta: "Possui vantagens competitivas claras (Moat, marca ou escala)?", peso: 1.0 },
    { criterio: "PERENIDADE", pergunta: "Atua em um setor perene e resiliente a grandes crises?", peso: 1.0 },
    { criterio: "TAMANHO_BLUE_CHIP", pergunta: "Empresa de grande porte ou consolidada em seu segmento?", peso: 1.0 },
    { criterio: "GOVERNANCA", pergunta: "Pertence ao Novo Mercado ou tem bom histórico de governança?", peso: 1.0 },
    { criterio: "INDEPENDENCIA_ESTATAL", pergunta: "Livre de interferências estatais ou governamentais nocivas?", peso: 1.0 },
    { criterio: "ENDIVIDAMENTO", pergunta: "Nível de endividamento (Dívida Líquida / EBITDA) sob controle (< 3.5x)?", peso: 1.0 },
  ];

  await prisma.question.createMany({
    data: defaultQuestionsData.map((q) => ({
      userId,
      criterio: q.criterio,
      pergunta: q.pergunta,
      peso: q.peso,
      isDefault: true,
    })),
  });

  await prisma.metaClasse.createMany({
    data: [
      { userId, classe: "ACOES_NACIONAIS", percentualIdeal: 0 },
      { userId, classe: "ACOES_INTERNACIONAIS", percentualIdeal: 0 },
      { userId, classe: "FIIS", percentualIdeal: 0 },
      { userId, classe: "REITS", percentualIdeal: 0 },
      { userId, classe: "CRIPTO", percentualIdeal: 0 },
      { userId, classe: "RENDA_FIXA", percentualIdeal: 0 },
      { userId, classe: "RENDA_FIXA_INTERNACIONAL", percentualIdeal: 0 },
    ],
  });

  // 1. AÇÕES NACIONAIS
  const petr4 = await prisma.ativo.create({
    data: {
      userId,
      simbolo: "PETR4",
      nome: "Petrobras PN",
      classe: "ACOES_NACIONAIS",
      setor: "Petróleo & Gás",
      logoUrl: "https://assets.parqet.com/logos/symbol/PETR4",
      percentualIdeal: 0,
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
      userId,
      simbolo: "VALE3",
      nome: "Vale ON",
      classe: "ACOES_NACIONAIS",
      setor: "Mineração",
      logoUrl: "https://assets.parqet.com/logos/symbol/VALE3",
      percentualIdeal: 0,
      precoAtual: 62.10,
      ultimoProvento: 2.10,
      transacoes: {
        create: [
          { data: new Date("2025-07-01"), tipo: "COMPRA", quantidade: 150, precoUnitario: 65.00 },
        ],
      },
    },
  });

  // 2. FIIs (Fundos Imobiliários)
  const hglg11 = await prisma.ativo.create({
    data: {
      userId,
      simbolo: "HGLG11",
      nome: "CSHG Logística FII",
      classe: "FIIS",
      setor: "Imobiliário - Logística",
      logoUrl: "https://assets.parqet.com/logos/symbol/HGLG11",
      percentualIdeal: 0,
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
      userId,
      simbolo: "MXRF11",
      nome: "Maxi Renda FII",
      classe: "FIIS",
      setor: "Imobiliário - Papel",
      logoUrl: "https://assets.parqet.com/logos/symbol/MXRF11",
      percentualIdeal: 0,
      precoAtual: 10.45,
      ultimoProvento: 0.10,
      transacoes: {
        create: [
          { data: new Date("2025-08-10"), tipo: "COMPRA", quantidade: 400, precoUnitario: 10.20 },
        ],
      },
    },
  });

  // 3. AÇÕES INTERNACIONAIS
  await prisma.ativo.create({
    data: {
      userId,
      simbolo: "AAPL",
      nome: "Apple Inc.",
      classe: "ACOES_INTERNACIONAIS",
      setor: "Tecnologia",
      logoUrl: "https://assets.parqet.com/logos/symbol/AAPL",
      percentualIdeal: 0,
      precoAtual: 220.00,
      ultimoProvento: 0,
      transacoes: {
        create: [
          { data: new Date("2025-05-20"), tipo: "COMPRA", quantidade: 15, precoUnitario: 190.00 },
        ],
      },
    },
  });

  // 4. RENDA FIXA
  await prisma.ativo.create({
    data: {
      userId,
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
      userId,
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
      { userId, data: new Date("2026-02-01"), patrimonioTotal: 38500.0, totalInvestido: 37000.0, lucroPrejuizo: 1500.0 },
      { userId, data: new Date("2026-03-01"), patrimonioTotal: 41200.0, totalInvestido: 40000.0, lucroPrejuizo: 1200.0 },
      { userId, data: new Date("2026-04-01"), patrimonioTotal: 45800.0, totalInvestido: 44000.0, lucroPrejuizo: 1800.0 },
      { userId, data: new Date("2026-05-01"), patrimonioTotal: 48900.0, totalInvestido: 47500.0, lucroPrejuizo: 1400.0 },
      { userId, data: new Date("2026-06-01"), patrimonioTotal: 51200.0, totalInvestido: 49000.0, lucroPrejuizo: 2200.0 },
      { userId, data: new Date("2026-07-01"), patrimonioTotal: 53875.0, totalInvestido: 51610.0, lucroPrejuizo: 2265.0 },
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
