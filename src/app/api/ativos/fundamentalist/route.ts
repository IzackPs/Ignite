import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { fundamentalistService } from "@/lib/services/fundamentalist.service";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
      return NextResponse.json({ error: "Ticker é obrigatório" }, { status: 400 });
    }

    const data = await fundamentalistService.getFundamentalistMetrics(ticker);
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error("Erro na busca de indicadores fundamentalistas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar indicadores fundamentalistas" },
      { status: 500 }
    );
  }
}
