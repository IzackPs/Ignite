import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { ativoSchema } from "@/lib/validations";
import { createDeleteHandler, parseBody } from "@/lib/api-handler";

// POST: Criar ou Atualizar Ativo
export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parsed = parseBody(ativoSchema, {
      ...body,
      percentualIdeal: Number(body.percentualIdeal ?? 0),
      precoAtual: Number(body.precoAtual ?? 0),
      ultimoProvento: Number(body.ultimoProvento ?? 0),
      taxaRentabilidade: Number(body.taxaRentabilidade ?? 100),
    }, "Dados do ativo inválidos");
    if (!parsed.success) return parsed.response;

    const parseResult = parsed;

    const {
      simbolo,
      nome,
      classe,
      setor,
      logoUrl,
      percentualIdeal,
      precoAtual,
      ultimoProvento,
      taxaRentabilidade,
      nota,
      respostas,
    } = parseResult.data;

    const { id } = body;

    let targetAtivoId = id;

    if (id) {
      // Verificar que o ativo pertence ao usuário antes de atualizar
      const ativoExistente = await prisma.ativo.findFirst({
        where: { id, userId },
      });
      if (!ativoExistente) {
        return NextResponse.json(
          { error: "Ativo não encontrado ou sem permissão." },
          { status: 404 }
        );
      }

      await prisma.ativo.update({
        where: { id },
        data: {
          simbolo: simbolo.trim().toUpperCase(),
          nome,
          classe,
          setor: setor ?? null,
          logoUrl: logoUrl && logoUrl !== "" ? logoUrl : null,
          percentualIdeal,
          precoAtual,
          ultimoProvento,
          taxaRentabilidade,
          nota,
        },
      });
      targetAtivoId = id;
    } else {
      const novoAtivo = await prisma.ativo.create({
        data: {
          simbolo: simbolo.trim().toUpperCase(),
          nome,
          classe,
          setor: setor ?? null,
          logoUrl: logoUrl && logoUrl !== "" ? logoUrl : null,
          percentualIdeal,
          precoAtual,
          ultimoProvento,
          taxaRentabilidade,
          nota,
          userId,
        },
      });
      targetAtivoId = novoAtivo.id;
    }

    // Processar respostas do checklist se fornecidas
    if (respostas && respostas.length > 0 && targetAtivoId) {
      for (const r of respostas) {
        await prisma.assetQuestionAnswer.upsert({
          where: {
            ativoId_questionId: {
              ativoId: targetAtivoId,
              questionId: r.questionId,
            },
          },
          create: {
            ativoId: targetAtivoId,
            questionId: r.questionId,
            answer: r.answer,
          },
          update: {
            answer: r.answer,
          },
        });
      }
    }

    const ativoFinal = await prisma.ativo.findUnique({
      where: { id: targetAtivoId },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(ativoFinal, { status: id ? 200 : 201 });
  } catch (error: any) {
    logger.error("Erro ao salvar ativo:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um ativo cadastrado com este símbolo." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno ao salvar ativo" },
      { status: 500 }
    );
  }
}

// DELETE: Deletar Ativo (somente o dono pode excluir)
export const DELETE = createDeleteHandler({
  modelName: "ativo",
  findQuery: (id, userId) => prisma.ativo.findFirst({ where: { id, userId } }),
  deleteQuery: (id) => prisma.ativo.delete({ where: { id } }),
  missingIdMsg: "ID do ativo é necessário",
  notFoundMsg: "Ativo não encontrado ou sem permissão.",
  errorMsg: "Erro ao excluir ativo",
});
