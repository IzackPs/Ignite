import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patrimonioTotal, totalInvestido, lucroPrejuizo, data } = body;

    const novoSnapshot = await prisma.historicoPatrimonio.create({
      data: {
        data: data ? new Date(data) : new Date(),
        patrimonioTotal: Number(patrimonioTotal || 0),
        totalInvestido: Number(totalInvestido || 0),
        lucroPrejuizo: Number(lucroPrejuizo || 0),
      },
    });

    return NextResponse.json(novoSnapshot, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar foto de patrimônio:", error);
    return NextResponse.json(
      { error: "Erro ao salvar foto de patrimônio" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.historicoPatrimonio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover registro de histórico:", error);
    return NextResponse.json(
      { error: "Erro ao remover registro" },
      { status: 500 }
    );
  }
}
