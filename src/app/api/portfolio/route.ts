import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { portfolioService } from "@/lib/services/portfolio.service";

export async function GET() {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const portfolio = await portfolioService.calcularParaUsuario(userId);
    return NextResponse.json(portfolio);
  } catch (error: any) {
    logger.error("Erro ao buscar portfólio:", error);
    return NextResponse.json(
      { error: "Erro interno ao calcular portfólio" },
      { status: 500 }
    );
  }
}
