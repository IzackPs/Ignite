import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { questionSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export const DEFAULT_QUESTIONS = [
  { criterio: "ROE", pergunta: "ROE historicamente maior que 5%?", peso: 1.0 },
  { criterio: "CAGR", pergunta: "Crescimento nos últimos 5 anos (CAGR Receita/Lucro) positivo?", peso: 1.0 },
  { criterio: "DIVIDENDOS", pergunta: "Paga dividendos constantes ou possui bom histórico de proventos?", peso: 1.0 },
  { criterio: "TECNOLOGIA", pergunta: "Investe em tecnologia, inovação contínua ou ganho de eficiência?", peso: 1.0 },
  { criterio: "TEMPO_DE_MERCADO", pergunta: "Possui mais de 5 anos de histórico/listagem de mercado?", peso: 1.0 },
  { criterio: "VANTAGENS_COMPETITIVAS", pergunta: "Possui vantagens competitivas claras (Moat, marca ou escala)?", peso: 1.0 },
  { criterio: "PERENIDADE", pergunta: "Atua em um setor perene e resiliente a grandes crises?", peso: 1.0 },
  { criterio: "TAMANHO_BLUE_CHIP", pergunta: "Empresa de grande porte ou consolidada em seu segmento?", peso: 1.0 },
  { criterio: "GOVERNANCA", pergunta: "Pertence ao Novo Mercado ou tem bom histórico de governança?", peso: 1.0 },
  { criterio: "INDEPENDENCIA_ESTATAL", pergunta: "Livre de interferências estatais ou governamentais nocivas?", peso: 1.0 },
  { criterio: "ENDIVIDAMENTO", pergunta: "Nível de endividamento (Dívida Líquida / EBITDA) sob controle (< 3.5x)?", peso: 1.0 },
];

export async function GET() {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    let questions = await prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // Se o usuário ainda não possui perguntas cadastradas, inicializa os 11 critérios padrão
    if (questions.length === 0) {
      await prisma.question.createMany({
        data: DEFAULT_QUESTIONS.map((q) => ({
          userId,
          criterio: q.criterio,
          pergunta: q.pergunta,
          peso: q.peso,
          isDefault: true,
        })),
      });

      questions = await prisma.question.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json(questions);
  } catch (error: any) {
    logger.error("Erro ao listar perguntas do usuário:", error?.message || error, error?.stack);
    return NextResponse.json({ error: error?.message || "Erro ao listar critérios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parse = questionSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { criterio, pergunta, peso } = parse.data;

    const question = await prisma.question.create({
      data: {
        userId,
        criterio: criterio.toUpperCase().trim(),
        pergunta: pergunta.trim(),
        peso: peso || 1.0,
        isDefault: false,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error: any) {
    logger.error("Erro ao criar pergunta:", error?.message || error, error?.stack);
    return NextResponse.json({ error: error?.message || "Erro ao criar critério" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parse = questionSchema.safeParse(body);
    if (!parse.success || !parse.data.id) {
      return NextResponse.json(
        { error: "ID da pergunta e dados válidos são obrigatórios" },
        { status: 400 }
      );
    }

    const { id, criterio, pergunta, peso } = parse.data;

    const existing = await prisma.question.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Critério não encontrado" }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        criterio: criterio.toUpperCase().trim(),
        pergunta: pergunta.trim(),
        peso,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    logger.error("Erro ao atualizar pergunta:", error);
    return NextResponse.json({ error: "Erro ao atualizar critério" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do critério é obrigatório" }, { status: 400 });
    }

    const existing = await prisma.question.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Critério não encontrado" }, { status: 404 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Erro ao excluir pergunta:", error);
    return NextResponse.json({ error: "Erro ao excluir critério" }, { status: 500 });
  }
}
