import { TipoClasse } from "@/lib/calculator";

export type PerfilRisco = "CONSERVADOR" | "MODERADO" | "ARROJADO";

export interface InfoPerfil {
  key: PerfilRisco;
  nome: string;
  descricao: string;
  badgeColor: string;
  bgGlow: string;
}

export const PERFIS_RISCO_INFO: Record<PerfilRisco, InfoPerfil> = {
  CONSERVADOR: {
    key: "CONSERVADOR",
    nome: "Conservador",
    descricao: "Prioriza previsibilidade e proteção do patrimônio, com maior alocação em renda fixa e menor exposição à volatilidade.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgGlow: "from-emerald-500/10 to-transparent",
  },
  MODERADO: {
    key: "MODERADO",
    nome: "Moderado",
    descricao: "Busca equilíbrio entre segurança e rentabilidade, mesclando renda fixa com boa participação em ativos de valorização.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bgGlow: "from-amber-500/10 to-transparent",
  },
  ARROJADO: {
    key: "ARROJADO",
    nome: "Arrojado",
    descricao: "Foco em maximização dos retornos de longo prazo com alta participação em ações, criptos e mercado internacional.",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bgGlow: "from-purple-500/10 to-transparent",
  },
};

export interface RecomendacaoAlocacao {
  perfil: PerfilRisco;
  idade: number;
  metasRecomendadas: Record<TipoClasse, number>;
  rendaFixaPercentualTotal: number;
  rendaVariavelPercentualTotal: number;
}

/**
 * Calcula a alocação recomendada em % por categoria de ativo baseando-se no perfil de risco e na idade do investidor.
 * A soma dos percentuais recomendados sempre resulta em exatamente 100%.
 */
export function calcularAlocacaoRecomendada(
  perfil: PerfilRisco,
  idadeInput: number
): RecomendacaoAlocacao {
  // Tratar limites de idade razoáveis (entre 18 e 90 anos)
  const idade = Math.min(90, Math.max(18, Math.round(idadeInput || 30)));

  let percentualRendaFixaBase = 0;

  switch (perfil) {
    case "CONSERVADOR":
      // Conservador: Idade + 15%, entre 35% e 85%
      percentualRendaFixaBase = Math.min(85, Math.max(35, idade + 15));
      break;
    case "MODERADO":
      // Moderado: Idade %, entre 20% e 75%
      percentualRendaFixaBase = Math.min(75, Math.max(20, idade));
      break;
    case "ARROJADO":
      // Arrojado: Idade - 15%, entre 10% e 60%
      percentualRendaFixaBase = Math.min(60, Math.max(10, idade - 15));
      break;
  }

  const percentualRendaFixaTotal = percentualRendaFixaBase;
  const percentualRendaVariavelTotal = 100 - percentualRendaFixaTotal;

  // Divisão interna da Renda Fixa (Nacional vs Internacional)
  let rfNacionalPct = 0;
  let rfInternacionalPct = 0;

  if (perfil === "CONSERVADOR") {
    rfNacionalPct = Math.round(percentualRendaFixaTotal * 0.85);
    rfInternacionalPct = percentualRendaFixaTotal - rfNacionalPct;
  } else if (perfil === "MODERADO") {
    rfNacionalPct = Math.round(percentualRendaFixaTotal * 0.75);
    rfInternacionalPct = percentualRendaFixaTotal - rfNacionalPct;
  } else {
    rfNacionalPct = Math.round(percentualRendaFixaTotal * 0.70);
    rfInternacionalPct = percentualRendaFixaTotal - rfNacionalPct;
  }

  // Pesos relativos da Renda Variável conforme perfil
  let pesosRV: {
    ACOES_NACIONAIS: number;
    ACOES_INTERNACIONAIS: number;
    FIIS: number;
    REITS: number;
    CRIPTO: number;
  };

  if (perfil === "CONSERVADOR") {
    pesosRV = {
      FIIS: 0.45,
      ACOES_NACIONAIS: 0.35,
      REITS: 0.10,
      ACOES_INTERNACIONAIS: 0.10,
      CRIPTO: 0.0,
    };
  } else if (perfil === "MODERADO") {
    pesosRV = {
      ACOES_NACIONAIS: 0.35,
      FIIS: 0.30,
      ACOES_INTERNACIONAIS: 0.20,
      REITS: 0.10,
      CRIPTO: 0.05,
    };
  } else {
    // ARROJADO
    pesosRV = {
      ACOES_NACIONAIS: 0.35,
      ACOES_INTERNACIONAIS: 0.25,
      FIIS: 0.15,
      REITS: 0.15,
      CRIPTO: 0.10,
    };
  }

  // Calcular valores arredondados para renda variável
  const acoesNacionais = Math.round(percentualRendaVariavelTotal * pesosRV.ACOES_NACIONAIS);
  const acoesInt = Math.round(percentualRendaVariavelTotal * pesosRV.ACOES_INTERNACIONAIS);
  const fiis = Math.round(percentualRendaVariavelTotal * pesosRV.FIIS);
  const reits = Math.round(percentualRendaVariavelTotal * pesosRV.REITS);
  const cripto = Math.round(percentualRendaVariavelTotal * pesosRV.CRIPTO);

  // Ajuste de resíduo para garantir exatamente 100%
  const somaAtual =
    rfNacionalPct +
    rfInternacionalPct +
    acoesNacionais +
    acoesInt +
    fiis +
    reits +
    cripto;

  const diferenca = 100 - somaAtual;

  // Adicionar a diferença à maior classe de Renda Variável (ou Renda Fixa se RV for 0)
  let acoesNacionaisFinal = acoesNacionais;
  let rfNacionalFinal = rfNacionalPct;

  if (percentualRendaVariavelTotal > 0) {
    acoesNacionaisFinal += diferenca;
  } else {
    rfNacionalFinal += diferenca;
  }

  const metasRecomendadas: Record<TipoClasse, number> = {
    ACOES_NACIONAIS: Math.max(0, acoesNacionaisFinal),
    ACOES_INTERNACIONAIS: Math.max(0, acoesInt),
    FIIS: Math.max(0, fiis),
    REITS: Math.max(0, reits),
    CRIPTO: Math.max(0, cripto),
    RENDA_FIXA: Math.max(0, rfNacionalFinal),
    RENDA_FIXA_INTERNACIONAL: Math.max(0, rfInternacionalPct),
  };

  return {
    perfil,
    idade,
    metasRecomendadas,
    rendaFixaPercentualTotal: percentualRendaFixaTotal,
    rendaVariavelPercentualTotal: percentualRendaVariavelTotal,
  };
}
