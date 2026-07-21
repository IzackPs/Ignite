import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { cotacaoService } from "@/lib/services/cotacao.service";

// Rate limiting simples: armazena o timestamp da última chamada por userId em memória.
// Em produção com múltiplas instâncias, substituir por Redis ou DB.
const lastCallMap = new Map<string, number>();
const COOLDOWN_MS = 30_000; // 30 segundos de cooldown server-side

export async function POST() {
  const { userId, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  // Rate limiting server-side por userId
  const agora = Date.now();
  const ultimaChamada = lastCallMap.get(userId) ?? 0;
  const tempoRestante = Math.ceil((COOLDOWN_MS - (agora - ultimaChamada)) / 1000);

  if (agora - ultimaChamada < COOLDOWN_MS) {
    return NextResponse.json(
      {
        success: false,
        cached: true,
        message: `Aguarde ${tempoRestante}s antes de atualizar novamente.`,
        cooldownRemainingSeconds: tempoRestante,
      },
      { status: 429 }
    );
  }

  lastCallMap.set(userId, agora);

  try {
    const result = await cotacaoService.atualizarCotacoesParaUsuario(userId);

    if (result.nothingToUpdate) {
      return NextResponse.json({
        message: "Nenhum ativo de renda variável para atualizar.",
        updatedCount: 0,
      });
    }

    return NextResponse.json({
      success: result.updatedCount > 0,
      cached: result.updatedCount === 0,
      message:
        result.updatedCount > 0
          ? "Cotações atualizadas com sucesso."
          : "Não foi possível atualizar as cotações. Exibindo dados em cache.",
      updatedCount: result.updatedCount,
      updatedAtivos: result.updatedAtivos,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Erro ao atualizar cotações de mercado:", error);
    return NextResponse.json({
      success: false,
      cached: true,
      message: "Não foi possível atualizar as cotações. Exibindo dados em cache.",
      updatedCount: 0,
      updatedAtivos: [],
      timestamp: new Date().toISOString(),
    });
  }
}
