import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { historicoSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parseResult = historicoSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Dados do histórico inválidos";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { patrimonioTotal, totalInvestido, lucroPrejuizo, data } =
      parseResult.data;

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
  } catch (error) {
    logger.error("Erro ao salvar foto de patrimônio:", error);
    return NextResponse.json(
      { error: "Erro ao salvar foto de patrimônio" },
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

    const snapshot = await prisma.historicoPatrimonio.findFirst({
      where: { id, userId },
    });
    if (!snapshot) {
      return NextResponse.json(
        { error: "Registro não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    await prisma.historicoPatrimonio.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro ao remover registro de histórico:", error);
    return NextResponse.json(
      { error: "Erro ao remover registro" },
      { status: 500 }
    );
  }
}
