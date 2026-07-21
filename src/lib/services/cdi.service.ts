import { logger } from "@/lib/logger";

/**
 * Serviço de consulta da taxa de juros (Meta Selic) via API pública do Banco Central do Brasil.
 *
 * Utiliza o SGS (Sistema Gerenciador de Séries Temporais) para buscar:
 * - Série 432: Taxa de juros - Meta Selic definida pelo Copom (% a.a.)
 *
 * Implementa cache em memória com TTL de 24h para evitar chamadas excessivas
 * (a taxa muda apenas nas reuniões do Copom, ~8x/ano).
 *
 * Não utiliza fallback hardcoded. Apenas valores reais da API.
 */

const BCB_SELIC_META_URL =
  "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const FETCH_TIMEOUT_MS = 8000; // 8 segundos

interface CdiCache {
  taxaCdiAnual: number; // Ex: 0.1425 para 14,25%
  taxaCdiDiaria: number; // Pro-rata: (1 + CDI)^(1/252) - 1
  fetchedAt: number; // timestamp em ms
}

let cache: CdiCache | null = null;

/**
 * Calcula a taxa diária pro-rata a partir da taxa anual.
 * Base: 252 dias úteis por ano (convenção B3).
 */
function calcularCdiDiaria(taxaAnual: number): number {
  return Math.pow(1 + taxaAnual, 1 / 252) - 1;
}

/**
 * Busca a taxa anual atualizada da API do Banco Central.
 * Retorna o valor como decimal (ex: 0.1425 para 14,25%).
 */
async function fetchTaxaFromBCB(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(BCB_SELIC_META_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store", // Evita cache do fetch
    });

    if (!response.ok) {
      throw new Error(`BCB API retornou status ${response.status}`);
    }

    const data = await response.json();

    // A API retorna um array com objetos { data: "dd/mm/yyyy", valor: "14.25" }
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Resposta vazia da API BCB");
    }

    const ultimoRegistro = data.at(-1);
    const valorString = ultimoRegistro?.valor;

    if (!valorString) {
      throw new Error("Campo 'valor' ausente na resposta da API BCB");
    }

    // O valor vem como string com vírgula ou ponto (ex: "14.25" ou "14,25")
    const valorNumerico = Number(String(valorString).replace(",", "."));

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      throw new Error(`Valor de taxa inválido: ${valorString}`);
    }

    // Converter de percentual para decimal (14.25 → 0.1425)
    return valorNumerico / 100;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retorna a taxa atualizada (anual e diária).
 * Utiliza cache em memória com TTL de 24h.
 * Sem fallbacks hardcoded: se a API falhar e não houver cache, lança um erro.
 */
export async function getCdiAtual(): Promise<{
  taxaCdiAnual: number;
  taxaCdiDiaria: number;
  fonte: "BCB_API" | "CACHE";
}> {
  // Se o cache é válido, retornar imediatamente
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      taxaCdiAnual: cache.taxaCdiAnual,
      taxaCdiDiaria: cache.taxaCdiDiaria,
      fonte: "CACHE",
    };
  }

  try {
    const taxaAnual = await fetchTaxaFromBCB();
    const taxaDiaria = calcularCdiDiaria(taxaAnual);

    cache = {
      taxaCdiAnual: taxaAnual,
      taxaCdiDiaria: taxaDiaria,
      fetchedAt: Date.now(),
    };

    logger.info(
      `Taxa atualizada via API BCB: ${(taxaAnual * 100).toFixed(2)}% a.a.`
    );

    return {
      taxaCdiAnual: taxaAnual,
      taxaCdiDiaria: taxaDiaria,
      fonte: "BCB_API",
    };
  } catch (error: any) {
    logger.warn(
      `Falha ao buscar taxa da API BCB: ${error.message}`
    );

    // Se houver cache expirado, preferir ele ao invés de quebrar a aplicação
    if (cache) {
      return {
        taxaCdiAnual: cache.taxaCdiAnual,
        taxaCdiDiaria: cache.taxaCdiDiaria,
        fonte: "CACHE",
      };
    }

    // Sem fallback hardcoded! Lança o erro para o sistema lidar.
    throw new Error(`Não foi possível obter a taxa da API BCB e não há cache disponível. Detalhes: ${error.message}`);
  }
}

/**
 * Retorna a taxa formatada para exibição na UI.
 * Ex: "14,25% a.a."
 */
export async function getCdiFormatado(): Promise<string> {
  const { taxaCdiAnual } = await getCdiAtual();
  return `${(taxaCdiAnual * 100).toFixed(2).replace(".", ",")}% a.a.`;
}

/**
 * Força a invalidação do cache (útil para testes ou recarregamento manual).
 */
export function invalidarCacheCdi(): void {
  cache = null;
}
