import { prisma } from "@/lib/prisma";
import { calcularPortfolio, AtivoDTO } from "@/lib/calculator";
import { getCdiAtual } from "@/lib/services/cdi.service";

/**
 * Serviço de portfólio — orquestra acesso ao banco + cálculo financeiro.
 * Centraliza a lógica que antes estava espalhada pelo route handler.
 */
export const portfolioService = {
  /**
   * Calcula o portfólio completo de um usuário:
   * - busca ativos com transações
   * - busca metas customizadas por classe
   * - busca CDI atualizado via API BCB
   * - calcula indicadores via calculator.ts
   * - busca histórico patrimonial
   */
  async calcularParaUsuario(userId: string) {
    const [ativos, metasSalvas, historico, cdiInfo] = await Promise.all([
      prisma.ativo.findMany({
        where: { userId },
        include: { transacoes: true, answers: true },
        orderBy: { simbolo: "asc" },
      }),
      prisma.metaClasse.findMany({ where: { userId } }),
      prisma.historicoPatrimonio.findMany({
        where: { userId },
        orderBy: { data: "asc" },
      }),
      getCdiAtual(),
    ]);

    const metasMap: Record<string, number> = {};
    metasSalvas.forEach((m) => {
      metasMap[m.classe] = Number(m.percentualIdeal);
    });

    const ativosDTOS: AtivoDTO[] = ativos.map((a) => ({
      ...a,
      percentualIdeal: Number(a.percentualIdeal),
      precoAtual: Number(a.precoAtual),
      ultimoProvento: Number(a.ultimoProvento),
      taxaRentabilidade: Number(a.taxaRentabilidade),
      classe: a.classe as AtivoDTO["classe"],
      transacoes: a.transacoes.map((t) => ({
        ...t,
        quantidade: Number(t.quantidade),
        precoUnitario: Number(t.precoUnitario),
        tipo: t.tipo as "COMPRA" | "VENDA",
      })),
    }));

    const portfolio = calcularPortfolio(ativosDTOS, metasMap, cdiInfo.taxaCdiAnual);

    return {
      ...portfolio,
      historico,
      cdiInfo: {
        taxaCdiAnual: cdiInfo.taxaCdiAnual,
        taxaCdiAnualFormatada: `${(cdiInfo.taxaCdiAnual * 100).toFixed(2).replace(".", ",")}%`,
        fonte: cdiInfo.fonte,
      },
    };
  },
};

