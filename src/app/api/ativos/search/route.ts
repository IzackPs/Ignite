import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import YahooFinance from "yahoo-finance2";
import { logger } from "@/lib/logger";

const yahooFinance = new YahooFinance();

async function fetchLogoUrl(symbolClean: string): Promise<string | null> {
  try {
    const brapiRes = await fetch(`https://brapi.dev/api/quote/${symbolClean}`, {
      headers: { "User-Agent": "Antigravity/1.0" },
      signal: AbortSignal.timeout(2000) // 2s timeout
    });
    if (brapiRes.ok) {
      const brapiData = await brapiRes.json();
      const brapiLogo = brapiData.results?.[0]?.logourl;
      if (brapiLogo) return brapiLogo;
    }
  } catch {
    // Fallthrough to Parqet fallback
  }

  // Fallback padrão muito confiável
  return `https://assets.parqet.com/logos/symbol/${symbolClean}`;
}

function determineAssetClass(symbolClean: string, nameUpper: string): string {
  if (symbolClean.endsWith('11')) {
    const isEtf = nameUpper.includes('ETF') || nameUpper.includes('FUNDO DE INDICE') || nameUpper.includes('ISHARES');
    return isEtf ? "ETFS" : "FIIS";
  }
  if (symbolClean.endsWith('39')) {
    return nameUpper.includes('ETF') ? "ETFS" : "ACOES";
  }
  return "ACOES";
}

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
    const logoUrl = await fetchLogoUrl(symbolClean);

    const nameUpper = (quote.longName || quote.shortName || "").toUpperCase();
    const classe = determineAssetClass(symbolClean, nameUpper);

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
