import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import YahooFinance from "yahoo-finance2";
import { logger } from "@/lib/logger";

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  let ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Ticker não informado" }, { status: 400 });
  }

  ticker = ticker.toUpperCase().trim();

  try {
    const searchTicker = ticker.includes('.') ? ticker : `${ticker}.SA`;
    const symbolClean = ticker.replace('.SA', '');
    
    // Buscar cotação, perfil (setor) no Yahoo Finance
    const [quotePromise, profilePromise] = await Promise.allSettled([
      yahooFinance.quote(searchTicker),
      yahooFinance.quoteSummary(searchTicker, { modules: ['assetProfile'] })
    ]);

    const quote = quotePromise.status === 'fulfilled' ? quotePromise.value : null;
    
    if (!quote) {
      return NextResponse.json({ error: "Ativo não encontrado" }, { status: 404 });
    }

    const profile = profilePromise.status === 'fulfilled' ? profilePromise.value : null;
    const setor = profile?.assetProfile?.industry || profile?.assetProfile?.sector || "";

    // Tentar buscar logo via API gratuita Brapi (fallback rápido)
    let logoUrl = null;
    try {
      const brapiRes = await fetch(`https://brapi.dev/api/quote/${symbolClean}`, {
        headers: { "User-Agent": "Antigravity/1.0" },
        signal: AbortSignal.timeout(2000) // 2s timeout
      });
      if (brapiRes.ok) {
        const brapiData = await brapiRes.json();
        if (brapiData.results?.[0]?.logourl) {
          logoUrl = brapiData.results[0].logourl;
        }
      }
    } catch (e) {
      // Ignorar falha no logo
    }

    let classe = "ACOES";
    const nameUpper = (quote.longName || quote.shortName || "").toUpperCase();
    
    if (symbolClean.endsWith('11')) {
      if (nameUpper.includes('ETF') || nameUpper.includes('FUNDO DE INDICE') || nameUpper.includes('ISHARES')) {
        classe = "ETFS";
      } else {
        classe = "FIIS";
      }
    } else if (symbolClean.endsWith('39')) {
      classe = "ETFS";
      if (nameUpper.includes('ETF')) classe = "ETFS";
      else classe = "ACOES";
    }

    return NextResponse.json({
      simbolo: symbolClean,
      nome: quote.longName || quote.shortName || symbolClean,
      precoAtual: quote.regularMarketPrice || 0,
      setor,
      logoUrl,
      classe
    });
  } catch (error: any) {
    logger.error(`Erro ao buscar cotação para ${ticker}:`, error);
    return NextResponse.json({ error: "Ativo não encontrado ou erro na busca." }, { status: 404 });
  }
}
