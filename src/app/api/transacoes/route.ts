import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { transacaoSchema } from "@/lib/validations";
import { createDeleteHandler, parseBody } from "@/lib/api-handler";

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parsed = parseBody(transacaoSchema, {
      ativoId: body.ativoId,
      tipo: body.tipo,
      quantidade: Number(body.quantidade),
      precoUnitario: Number(body.precoUnitario),
      data: body.data,
    }, "Dados de transação inválidos");
    if (!parsed.success) return parsed.response;

    const parseResult = parsed;

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
        tipo: tipo.toUpperCase() as any,
        quantidade,
        precoUnitario,
      },
    });

    return NextResponse.json(novaTransacao, { status: 201 });
  } catch (error: any) {
    logger.error("Erro ao registrar transação:", error);
    return NextResponse.json(
      { error: "Erro ao registrar transação" },
      { status: 500 }
    );
  }
}

export const DELETE = createDeleteHandler({
  modelName: "transação",
  findQuery: (id, userId) =>
    prisma.transacao.findFirst({
      where: { id, ativo: { userId } },
    }),
  deleteQuery: (id) => prisma.transacao.delete({ where: { id } }),
  missingIdMsg: "ID da transação é obrigatório",
  notFoundMsg: "Transação não encontrada ou sem permissão.",
  errorMsg: "Erro ao excluir transação",
});
