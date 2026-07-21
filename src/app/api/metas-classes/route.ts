import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { metasClasseSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parseResult = metasClasseSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Metas inválidas fornecidas";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { metas } = parseResult.data;

    // Upsert das metas vinculadas ao usuário logado
    const entries = Object.entries(metas);
    for (const [classe, percentualIdeal] of entries) {
      await prisma.metaClasse.upsert({
        where: { userId_classe: { userId, classe: classe as any } },
        update: { percentualIdeal: Number(percentualIdeal) },
        create: { userId, classe: classe as any, percentualIdeal: Number(percentualIdeal) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Erro ao atualizar metas de classe:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar metas de classe" },
      { status: 500 }
    );
  }
}
