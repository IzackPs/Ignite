import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { requireAuth } from "@/lib/auth-guard";
import { proventoSchema } from "@/lib/validations";

type DecimalInstance = InstanceType<typeof Decimal>;

export async function GET() {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const proventos = await prisma.provento.findMany({
      where: { ativo: { userId } },
      include: {
        ativo: {
          select: {
            simbolo: true,
            nome: true,
            classe: true,
          },
        },
      },
      orderBy: {
        data: "desc",
      },
    });

    // Calcular estatísticas e agrupamento mensal
    let totalGeralRecebidoDec = new Decimal(0);
    const agrupamentoMeses: Record<
      string,
      {
        total: DecimalInstance;
        dividendo: DecimalInstance;
        jcp: DecimalInstance;
        rendimento: DecimalInstance;
        dataRef: Date;
      }
    > = {};

    proventos.forEach((p) => {
      const valorDec = new Decimal(p.valorTotal || 0);
      totalGeralRecebidoDec = totalGeralRecebidoDec.plus(valorDec);

      const d = new Date(p.data);
      const chaveMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!agrupamentoMeses[chaveMes]) {
        agrupamentoMeses[chaveMes] = {
          total: new Decimal(0),
          dividendo: new Decimal(0),
          jcp: new Decimal(0),
          rendimento: new Decimal(0),
          dataRef: new Date(d.getFullYear(), d.getMonth(), 1),
        };
      }

      const mesItem = agrupamentoMeses[chaveMes];
      mesItem.total = mesItem.total.plus(valorDec);

      const tipoUpper = p.tipo.toUpperCase();
      if (tipoUpper === "DIVIDENDO") {
        mesItem.dividendo = mesItem.dividendo.plus(valorDec);
      } else if (tipoUpper === "JCP") {
        mesItem.jcp = mesItem.jcp.plus(valorDec);
      } else {
        mesItem.rendimento = mesItem.rendimento.plus(valorDec);
      }
    });

    const historicoMensal = Object.entries(agrupamentoMeses)
      .map(([key, value]) => {
        const mesAnoFormatado = value.dataRef.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        });
        return {
          chaveMes: key,
          mesAno: mesAnoFormatado.toUpperCase(),
          total: Number(value.total.toFixed(2)),
          dividendo: Number(value.dividendo.toFixed(2)),
          jcp: Number(value.jcp.toFixed(2)),
          rendimento: Number(value.rendimento.toFixed(2)),
          dataRef: value.dataRef,
        };
      })
      .sort((a, b) => a.dataRef.getTime() - b.dataRef.getTime());

    const totalMeses = historicoMensal.length || 1;
    const mediaMensalDec = totalGeralRecebidoDec.dividedBy(totalMeses);

    return NextResponse.json({
      totalGeralRecebido: Number(totalGeralRecebidoDec.toFixed(2)),
      mediaMensal: Number(mediaMensalDec.toFixed(2)),
      proventosCount: proventos.length,
      historicoMensal,
      proventos,
    });
  } catch (error) {
    logger.error("Erro ao buscar proventos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar extrato de proventos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parseResult = proventoSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Dados do provento inválidos";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ativoId, data, tipo, valorTotal } = parseResult.data;

    // Verificar que o ativo pertence ao usuário
    const ativo = await prisma.ativo.findFirst({ where: { id: ativoId, userId } });
    if (!ativo) {
      return NextResponse.json(
        { error: "Ativo não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    const novoProvento = await prisma.provento.create({
      data: {
        ativoId,
        data: data ? new Date(data) : new Date(),
        tipo: tipo.toUpperCase(),
        valorTotal: Number(valorTotal),
      },
    });

    return NextResponse.json(novoProvento, { status: 201 });
  } catch (error) {
    logger.error("Erro ao cadastrar provento:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar provento" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const provento = await prisma.provento.findFirst({
      where: { id, ativo: { userId } },
    });
    if (!provento) {
      return NextResponse.json(
        { error: "Provento não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    await prisma.provento.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro ao excluir provento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir provento" },
      { status: 500 }
    );
  }
}
