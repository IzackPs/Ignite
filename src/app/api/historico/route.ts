import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { historicoSchema } from "@/lib/validations";
import { createDeleteHandler, parseBody } from "@/lib/api-handler";

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parsed = parseBody(historicoSchema, body, "Dados do histórico inválidos");
    if (!parsed.success) return parsed.response;

    const { patrimonioTotal, totalInvestido, lucroPrejuizo, data } = parsed.data;

    const novoSnapshot = await prisma.historicoPatrimonio.create({
      data: {
        data: data ? new Date(data) : new Date(),
        patrimonioTotal,
        totalInvestido,
        lucroPrejuizo,
        userId,
      },
    });

    return NextResponse.json(novoSnapshot, { status: 201 });
  } catch (error: any) {
    logger.error("Erro ao salvar foto de patrimônio:", error);
    return NextResponse.json(
      { error: "Erro ao salvar foto de patrimônio" },
      { status: 500 }
    );
  }
}

export const DELETE = createDeleteHandler({
  modelName: "registro de histórico",
  findQuery: (id, userId) =>
    prisma.historicoPatrimonio.findFirst({
      where: { id, userId },
    }),
  deleteQuery: (id) => prisma.historicoPatrimonio.delete({ where: { id } }),
  missingIdMsg: "ID é obrigatório",
  notFoundMsg: "Registro não encontrado ou sem permissão.",
  errorMsg: "Erro ao remover registro",
});
