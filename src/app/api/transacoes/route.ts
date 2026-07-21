import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { transacaoSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

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
      const firstError =
        parseResult.error.issues[0]?.message || "Dados de transação inválidos";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ativoId, tipo, quantidade, precoUnitario, data } = parseResult.data;

    // Verificar que o ativo pertence ao usuário logado
    const ativo = await prisma.ativo.findFirst({ where: { id: ativoId, userId } });
    if (!ativo) {
      return NextResponse.json(
        { error: "Ativo não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

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
    logger.error("Erro ao registrar transação:", error);
    return NextResponse.json(
      { error: "Erro ao registrar transação" },
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
      return NextResponse.json(
        { error: "ID da transação é obrigatório" },
        { status: 400 }
      );
    }

    // Garantir que a transação pertence ao usuário (via join ativo)
    const transacao = await prisma.transacao.findFirst({
      where: { id, ativo: { userId } },
    });
    if (!transacao) {
      return NextResponse.json(
        { error: "Transação não encontrada ou sem permissão." },
        { status: 404 }
      );
    }

    await prisma.transacao.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erro ao excluir transação:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 }
    );
  }
}
