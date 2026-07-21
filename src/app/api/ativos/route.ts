import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { ativoSchema } from "@/lib/validations";

// POST: Criar ou Atualizar Ativo
export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const parseResult = ativoSchema.safeParse({
      ...body,
      percentualIdeal: Number(body.percentualIdeal ?? 0),
      precoAtual: Number(body.precoAtual ?? 0),
      ultimoProvento: Number(body.ultimoProvento ?? 0),
      taxaRentabilidade: Number(body.taxaRentabilidade ?? 100),
    });

    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Dados do ativo inválidos";
      return NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      simbolo,
      nome,
      classe,
      setor,
      percentualIdeal,
      precoAtual,
      ultimoProvento,
      taxaRentabilidade,
    } = parseResult.data;

    const { id } = body;

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

      const ativoAtualizado = await prisma.ativo.update({
        where: { id },
        data: {
          simbolo: simbolo.trim().toUpperCase(),
          nome,
          classe,
          setor: setor ?? null,
          percentualIdeal,
          precoAtual,
          ultimoProvento,
          taxaRentabilidade,
        },
      });
      return NextResponse.json(ativoAtualizado);
    } else {
      const novoAtivo = await prisma.ativo.create({
        data: {
          simbolo: simbolo.trim().toUpperCase(),
          nome,
          classe,
          setor: setor ?? null,
          percentualIdeal,
          precoAtual,
          ultimoProvento,
          taxaRentabilidade,
          userId,
        },
      });
      return NextResponse.json(novoAtivo, { status: 201 });
    }
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
export async function DELETE(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do ativo é necessário" },
        { status: 400 }
      );
    }

    const ativo = await prisma.ativo.findFirst({ where: { id, userId } });
    if (!ativo) {
      return NextResponse.json(
        { error: "Ativo não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    await prisma.ativo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Erro ao excluir ativo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir ativo" },
      { status: 500 }
    );
  }
}
