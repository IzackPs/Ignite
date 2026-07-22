import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { DEFAULT_QUESTIONS } from "../route";
import { logger } from "@/lib/logger";

export async function POST() {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    // Exclui todas as perguntas cadastradas do usuário
    await prisma.question.deleteMany({
      where: { userId },
    });

    // Recria as 11 perguntas padrão
    await prisma.question.createMany({
      data: DEFAULT_QUESTIONS.map((q) => ({
        userId,
        criterio: q.criterio,
        pergunta: q.pergunta,
        peso: q.peso,
        isDefault: true,
      })),
    });

    const resetQuestions = await prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(resetQuestions);
  } catch (error: any) {
    logger.error("Erro ao resetar perguntas para o padrão:", error);
    return NextResponse.json(
      { error: "Erro ao restaurar perguntas padrão" },
      { status: 500 }
    );
  }
}
