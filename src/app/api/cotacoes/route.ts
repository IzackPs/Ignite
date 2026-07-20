import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Buscar ativos das classes ACOES, FIIS e ETFS
    const ativosMercado = await prisma.ativo.findMany({
      where: {
        classe: {
          in: ["ACOES", "FIIS", "ETFS"],
        },
      },
    });

    if (ativosMercado.length === 0) {
      return NextResponse.json({
        message: "Nenhum ativo de renda variável para atualizar.",
        updatedCount: 0,
      });
    }

    const tickers = ativosMercado.map((a) => a.simbolo.trim().toUpperCase());
    const tickersString = tickers.join(",");

    const pricesMap: Record<string, number> = {};

    // 1. Tentar buscar cotações da API Brapi.dev
    try {
      const brapiUrl = `https://brapi.dev/api/quote/${tickersString}?token=`;
      const res = await fetch(brapiUrl, {
        headers: { "User-Agent": "AntigravityPortfolio/1.0" },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((item: any) => {
            if (item.symbol && item.regularMarketPrice !== undefined) {
              pricesMap[item.symbol.toUpperCase()] = Number(item.regularMarketPrice);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Brapi API indisponível, tentando Yahoo Finance fallback...", e);
    }

    // 2. Fallback: Se algum ticker não foi atualizado pela Brapi, tenta Yahoo Finance (.SA)
    const missingTickers = tickers.filter((t) => !pricesMap[t]);
    if (missingTickers.length > 0) {
      try {
        const yahooTickers = missingTickers.map((t) => `${t}.SA`).join(",");
        const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooTickers}`;
        const resYahoo = await fetch(yahooUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 0 },
        });

        if (resYahoo.ok) {
          const dataYahoo = await resYahoo.json();
          const quotes = dataYahoo?.quoteResponse?.result || [];
          quotes.forEach((q: any) => {
            const cleanSymbol = q.symbol.replace(".SA", "").toUpperCase();
            if (q.regularMarketPrice !== undefined) {
              pricesMap[cleanSymbol] = Number(q.regularMarketPrice);
            }
          });
        }
      } catch (err) {
        console.warn("Erro no fallback do Yahoo Finance:", err);
      }
    }

    // 3. Atualizar no banco de dados SQLite
    const updatedAtivos: { simbolo: string; precoAntigo: number; precoNovo: number }[] = [];

    for (const ativo of ativosMercado) {
      const novoPreco = pricesMap[ativo.simbolo.toUpperCase()];
      if (novoPreco !== undefined && novoPreco > 0) {
        await prisma.ativo.update({
          where: { id: ativo.id },
          data: { precoAtual: novoPreco },
        });
        updatedAtivos.push({
          simbolo: ativo.simbolo,
          precoAntigo: ativo.precoAtual,
          precoNovo: novoPreco,
        });
      }
    }

    return NextResponse.json({
      success: updatedAtivos.length > 0,
      cached: updatedAtivos.length === 0,
      message: updatedAtivos.length > 0
        ? "Cotações atualizadas com sucesso."
        : "Não foi possível atualizar as cotações. Exibindo dados em cache.",
      updatedCount: updatedAtivos.length,
      updatedAtivos,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar cotações de mercado:", error);
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
