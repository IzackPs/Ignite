import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularPortfolio, AtivoDTO } from "@/lib/calculator";

export async function GET() {
  try {
    const ativos = await prisma.ativo.findMany({
      include: {
        transacoes: true,
      },
      orderBy: {
        simbolo: "asc",
      },
    });

    // Buscar metas customizadas salvas
    const metasSalvas = await prisma.metaClasse.findMany();
    const metasMap: Record<string, number> = {};
    metasSalvas.forEach((m) => {
      metasMap[m.classe] = m.percentualIdeal;
    });

    const portfolio = calcularPortfolio(ativos as unknown as AtivoDTO[], metasMap);

    // Buscar histórico mensal de patrimônio
    const historico = await prisma.historicoPatrimonio.findMany({
      orderBy: {
        data: "asc",
      },
    });

    return NextResponse.json({
      ...portfolio,
      historico,
    });
  } catch (error) {
    console.error("Erro ao buscar portfólio:", error);
    return NextResponse.json(
      { error: "Erro interno ao calcular portfólio" },
      { status: 500 }
    );
  }
}
