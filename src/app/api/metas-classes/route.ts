import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metas } = body; // Objeto { ACOES: 15, FIIS: 15, ETFS: 10, RENDA_FIXA: 60 }

    if (!metas || typeof metas !== "object") {
      return NextResponse.json(
        { error: "Metas inválidas fornecidas" },
        { status: 400 }
      );
    }

    // Upsert das metas
    const entries = Object.entries(metas);
    for (const [classe, percentualIdeal] of entries) {
      await prisma.metaClasse.upsert({
        where: { classe },
        update: { percentualIdeal: Number(percentualIdeal) },
        create: { classe, percentualIdeal: Number(percentualIdeal) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar metas de classe:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar metas de classe" },
      { status: 500 }
    );
  }
}
