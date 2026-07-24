"use client";

import { useState, useMemo } from 'react';

interface AssetLogoProps {
  readonly simbolo: string;
  readonly nome?: string;
  readonly logoUrl?: string | null;
  readonly className?: string;
  readonly sizeClass?: string;
}

export function AssetLogo({
  simbolo,
  nome = "",
  logoUrl,
  className = "",
  sizeClass = "w-8 h-8 text-xs",
}: AssetLogoProps) {
  const cleanSymbol = simbolo.trim().toUpperCase().replace(".SA", "");
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const isRendaFixaSymbol =
    cleanSymbol.startsWith("TESOURO") ||
    cleanSymbol.startsWith("CDB") ||
    cleanSymbol.startsWith("LCI") ||
    cleanSymbol.startsWith("LCA") ||
    cleanSymbol.includes("+") ||
    cleanSymbol.includes("-");

  // Identificar se é ativo B3 (Ações / FIIs no Brasil)
  const isBrazilianB3 =
    simbolo.toUpperCase().endsWith(".SA") ||
    /^[A-Z0-9]{4,6}\d{1,2}$/.test(cleanSymbol);

  // Identificar se é Criptomoeda conhecida
  const isCrypto =
    ["BTC", "ETH", "SOL", "USDT", "USDC", "ADA", "DOT", "AVAX", "LINK", "XRP"].includes(
      cleanSymbol
    );

  // Lista de Fontes de Imagem Ordenada por Prioridade
  const sources = useMemo(() => {
    if (isRendaFixaSymbol) return [];

    const list: string[] = [];

    // 1. URL explícita cadastrada no banco de dados
    if (logoUrl && (logoUrl.trim().startsWith("http") || logoUrl.trim().startsWith("data:image"))) {
      const trimmedLogo = logoUrl.trim();
      list.push(trimmedLogo);
      if (isBrazilianB3 && !trimmedLogo.endsWith(".SA") && trimmedLogo.includes("parqet.com")) {
        list.push(`${trimmedLogo}.SA`);
      }
    }

    if (isBrazilianB3) {
      // Fontes de Logos para Ativos da B3 (Brasil)
      const b3Sources = [
        `https://assets.parqet.com/logos/symbol/${cleanSymbol}.SA`,
        `https://assets.parqet.com/logos/symbol/${cleanSymbol}`,
        `https://raw.githubusercontent.com/thewebartisan7/financial-assets-logos/main/logos/${cleanSymbol}.png`,
        `https://financialmodelingprep.com/image-stock/${cleanSymbol}.SA.png`,
      ];
      b3Sources.forEach((url) => {
        if (!list.includes(url)) list.push(url);
      });
    } else if (isCrypto) {
      // Fontes para Criptomoedas
      const cryptoSources = [
        `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSymbol.toLowerCase()}.png`,
        `https://assets.parqet.com/logos/symbol/${cleanSymbol}`,
      ];
      cryptoSources.forEach((url) => {
        if (!list.includes(url)) list.push(url);
      });
    } else {
      // Fontes para Ativos Internacionais (EUA - Ações, REITs e ETFs)
      const intlSources = [
        `https://assets.parqet.com/logos/symbol/${cleanSymbol}`,
        `https://financialmodelingprep.com/image-stock/${cleanSymbol}.png`,
        `https://raw.githubusercontent.com/thewebartisan7/financial-assets-logos/main/logos/${cleanSymbol}.png`,
      ];
      intlSources.forEach((url) => {
        if (!list.includes(url)) list.push(url);
      });
    }

    return list;
  }, [logoUrl, cleanSymbol, isRendaFixaSymbol, isBrazilianB3, isCrypto]);

  // Encontrar a primeira fonte que ainda não falhou
  const activeIdx = sources.findIndex((_, idx) => !failedIndices[idx]);
  const currentSrc = activeIdx !== -1 ? sources[activeIdx] : null;

  const handleImageError = () => {
    if (activeIdx !== -1) {
      setFailedIndices((prev) => ({ ...prev, [activeIdx]: true }));
    }
  };

  if (currentSrc) {
    return (
      <div
        className={`rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 border border-border-subtle shadow-sm ${sizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSrc}
          alt={nome || simbolo}
          onError={handleImageError}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  // Fallback: Exibir o TICKER completo do Ativo no lugar do Ícone quando não carregar
  return (
    <div
      title={nome || cleanSymbol}
      className={`rounded-xl bg-zinc-900 border border-gold-main/40 text-gold-main font-mono font-bold flex items-center justify-center shrink-0 shadow-sm uppercase tracking-tighter overflow-hidden px-1 text-center select-none ${sizeClass} ${className}`}
    >
      <span className="truncate leading-none text-[9px] sm:text-[10px]">
        {cleanSymbol}
      </span>
    </div>
  );
}
