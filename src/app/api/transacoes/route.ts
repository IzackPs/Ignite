import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transacaoSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parseResult = transacaoSchema.safeParse({
      ativoId: body.ativoId,
      tipo: body.tipo,
      quantidade: Number(body.quantidade),
      precoUnitario: Number(body.precoUnitario),
      data: body.data,
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Dados de transação inválidos";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ativoId, tipo, quantidade, precoUnitario, data } = parseResult.data;

    const novaTransacao = await prisma.transacao.create({
      data: {
        ativoId,
        data: new Date(data),
        tipo: tipo.toUpperCase(),
        quantidade,
        precoUnitario,
      },
    });

    return NextResponse.json(novaTransacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar transação:", error);
    return NextResponse.json(
      { error: "Erro ao registrar transação" },
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
        { error: "ID da transação é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.transacao.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 }
    );
  }
}
