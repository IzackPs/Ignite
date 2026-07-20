import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Criar ou Atualizar Ativo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      simbolo,
      nome,
      classe,
      setor,
      percentualIdeal,
      precoAtual,
      ultimoProvento,
      taxaRentabilidade,
    } = body;

    if (!simbolo || !nome || !classe) {
      return NextResponse.json(
        { error: "Símbolo, Nome e Classe são obrigatórios" },
        { status: 400 }
      );
    }

    const simboloUpper = simbolo.trim().toUpperCase();

    if (id) {
      // Atualizar ativo existente
      const ativoAtualizado = await prisma.ativo.update({
        where: { id },
        data: {
          simbolo: simboloUpper,
          nome,
          classe: classe.toUpperCase(),
          setor: setor || null,
          percentualIdeal: Number(percentualIdeal || 0),
          precoAtual: Number(precoAtual || 0),
          ultimoProvento: Number(ultimoProvento || 0),
          taxaRentabilidade: Number(taxaRentabilidade || 100),
        },
      });
      return NextResponse.json(ativoAtualizado);
    } else {
      // Criar novo ativo
      const novoAtivo = await prisma.ativo.create({
        data: {
          simbolo: simboloUpper,
          nome,
          classe: classe.toUpperCase(),
          setor: setor || null,
          percentualIdeal: Number(percentualIdeal || 0),
          precoAtual: Number(precoAtual || 0),
          ultimoProvento: Number(ultimoProvento || 0),
          taxaRentabilidade: Number(taxaRentabilidade || 100),
        },
      });
      return NextResponse.json(novoAtivo, { status: 201 });
    }
  } catch (error: any) {
    console.error("Erro ao salvar ativo:", error);
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

// DELETE: Deletar Ativo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do ativo é necessário" },
        { status: 400 }
      );
    }

    await prisma.ativo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir ativo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir ativo" },
      { status: 500 }
    );
  }
}
