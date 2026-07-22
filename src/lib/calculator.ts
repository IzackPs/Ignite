import Decimal from "decimal.js";

Decimal.config({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type TipoClasse =
  | "ACOES_NACIONAIS"
  | "ACOES_INTERNACIONAIS"
  | "FIIS"
  | "REITS"
  | "CRIPTO"
  | "RENDA_FIXA"
  | "RENDA_FIXA_INTERNACIONAL";

export type TipoTransacao = "COMPRA" | "VENDA";

export interface TransacaoDTO {
  id: string;
  ativoId: string;
  data: Date | string;
  tipo: TipoTransacao;
  quantidade: number;
  precoUnitario: number;
}

export interface AtivoDTO {
  id: string;
  simbolo: string;
  nome: string;
  classe: TipoClasse;
  setor?: string | null;
  logoUrl?: string | null;
  percentualIdeal: number; // Ex: 10 para 10%
  precoAtual: number;
  ultimoProvento?: number; // Último provento pago por cota (R$)
  taxaRentabilidade?: number; // % do CDI (ex: 120 para 120% do CDI)
  nota?: number; // Nota Ignite (0 a 10)
  answers?: { questionId: string; answer: boolean }[];
  transacoes?: TransacaoDTO[];
}

export interface AtivoCalculado {
  id: string;
  simbolo: string;
  nome: string;
  classe: string;
  setor?: string | null;
  logoUrl?: string | null;
  percentualIdeal: number;
  precoAtual: number;
  ultimoProvento: number;
  taxaRentabilidade: number;
  nota: number;
  answers?: { questionId: string; answer: boolean }[];
  rendimentoProRataR$: number; // Rendimento diário acumulado em centavos (CDI)
  diasUteisDecorridos: number;
  
  // Valores calculados por transações em Decimal (centavos exatos)
  quantidadeAtual: number;
  precoMedio: number;
  totalInvestido: number; // quantidadeAtual * precoMedio
  valorMercado: number; // quantidadeAtual * precoAtual
  lucroPrejuizoR$: number; // valorMercado - totalInvestido
  lucroPrejuizoPercentual: number; // % sobre o total investido
  
  // Rebalanceamento da Carteira
  percentualAtual: number; // % da carteira total (0 - 100)
  faltaR$: number; // (percentualIdeal * patrimonioTotal) - valorMercado
  status: "COMPRAR" | "AGUARDAR";
  qtdAComprar: number; // floor(faltaR$ / precoAtual)

  // Lógica do Número Mágico (Efeito Bola de Neve para FIIs)
  numeroMagico: number; // ceil(precoAtual / ultimoProvento)
  cotasFaltantesMagico: number; // max(0, numeroMagico - quantidadeAtual)
  progressoMagicoPercentual: number; // (quantidadeAtual / numeroMagico) * 100
  rendaMensalEstimada: number; // quantidadeAtual * ultimoProvento
}

export interface ResumoClasse {
  classe: string;
  nomeClasse: string;
  metaPercentual: number; // Meta ideal (ex: 40%, 10%, etc)
  valorMercadoTotal: number;
  percentualAtual: number;
  faltaR$: number;
  status: "COMPRAR" | "AGUARDAR";
}

export interface PortfolioCalculado {
  patrimonioTotal: number;
  totalInvestidoTotal: number;
  lucroPrejuizoTotalR$: number;
  lucroPrejuizoTotalPercentual: number;
  rendaMensalTotalEstimada: number;
  ativos: AtivoCalculado[];
  resumoClasses: ResumoClasse[];
}

export interface CdiInfo {
  taxaCdiAnual: number;
  taxaCdiAnualFormatada: string;
  fonte: "BCB_API" | "CACHE" | "FALLBACK";
}

export interface PortfolioComHistorico extends PortfolioCalculado {
  historico: {
    id: string;
    data: string | Date;
    patrimonioTotal: number;
    totalInvestido: number;
    lucroPrejuizo: number;
  }[];
  cdiInfo?: CdiInfo;
}

export interface ItemAporteSimulado {
  ativoId: string;
  simbolo: string;
  nome: string;
  classe: string;
  precoAtual: number;
  qtdSimuladaComprar: number;
  valorTotalAporteAtivo: number;
  percentualDoAporte: number;
}

export interface ResultadoSimulacaoAporte {
  orcamentoInformado: number;
  totalGasto: number;
  sobraTroco: number;
  itensCarrinho: ItemAporteSimulado[];
}

export const METAS_CLASSES_PADRAO: Record<
  TipoClasse,
  { nome: string; meta: number }
> = {
  ACOES_NACIONAIS: { nome: "Ações Nacionais", meta: 0 },
  ACOES_INTERNACIONAIS: { nome: "Ações Internacionais", meta: 0 },
  FIIS: { nome: "Fundos Imobiliários", meta: 0 },
  REITS: { nome: "REITs", meta: 0 },
  CRIPTO: { nome: "Criptomoedas", meta: 0 },
  RENDA_FIXA: { nome: "Renda Fixa", meta: 0 },
  RENDA_FIXA_INTERNACIONAL: { nome: "Renda Fixa Internacional", meta: 0 },
};

/**
 * TAXA CDI ANUAL PADRÃO (Fallback)
 * O valor real é obtido dinamicamente via API do Banco Central (cdi.service.ts).
 * Este fallback (0% a.a.) é usado apenas quando o CDI não é
 * passado como parâmetro para calcularPortfolio().
 *
 * Taxa diária útil pro-rata com base no ano comercial de 252 dias úteis:
 * (1 + CDI_anual)^(1/252) - 1
 */
const TAXA_CDI_ANUAL_FALLBACK = 0;

const FERIADOS_NACIONAIS_FIXOS = new Set([
  "01-01", // Ano Novo
  "04-21", // Tiradentes
  "05-01", // Dia do Trabalhador
  "09-07", // Independência
  "10-12", // Nossa Sra. Aparecida
  "11-02", // Finados
  "11-15", // Proclamação da República
  "12-25", // Natal
]);

/**
 * Conta o número de dias úteis (segunda a sexta) entre duas datas,
 * ignorando os feriados nacionais fixos brasileiros.
 */
export function calcularDiasUteis(dataInicio: Date, dataFim: Date): number {
  let count = 0;
  const curDate = new Date(dataInicio);
  
  // Avançar dia a dia
  while (curDate < dataFim) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const monthStr = String(curDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(curDate.getDate()).padStart(2, "0");
      const mmdd = `${monthStr}-${dayStr}`;
      
      if (!FERIADOS_NACIONAIS_FIXOS.has(mmdd)) {
        count++;
      }
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

/**
 * Processa a lista de transações de um único ativo utilizando matemática Decimal exata.
 */
export function calcularPosicaoAtivo(transacoes: TransacaoDTO[] = []): {
  quantidadeAtual: number;
  precoMedio: number;
  totalInvestido: number;
  primeiraDataCompra: Date | null;
} {
  const transacoesOrdenadas = [...transacoes].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  let quantidadeAtual = new Decimal(0);
  let custoTotalAcumulado = new Decimal(0);
  let precoMedio = new Decimal(0);
  let primeiraDataCompra: Date | null = null;

  for (const t of transacoesOrdenadas) {
    const qtd = new Decimal(t.quantidade || 0);
    const preco = new Decimal(t.precoUnitario || 0);

    if (t.tipo.toUpperCase() === "COMPRA") {
      primeiraDataCompra ??= new Date(t.data);
      custoTotalAcumulado = custoTotalAcumulado.plus(qtd.times(preco));
      quantidadeAtual = quantidadeAtual.plus(qtd);
      precoMedio = quantidadeAtual.greaterThan(0)
        ? custoTotalAcumulado.dividedBy(quantidadeAtual)
        : new Decimal(0);
    } else if (t.tipo.toUpperCase() === "VENDA") {
      quantidadeAtual = quantidadeAtual.minus(qtd);
      if (quantidadeAtual.lessThanOrEqualTo(0)) {
        quantidadeAtual = new Decimal(0);
        custoTotalAcumulado = new Decimal(0);
        precoMedio = new Decimal(0);
      } else {
        custoTotalAcumulado = quantidadeAtual.times(precoMedio);
      }
    }
  }

  const totalInvestido = quantidadeAtual.times(precoMedio);

  return {
    quantidadeAtual: quantidadeAtual.toNumber(),
    precoMedio: Number(precoMedio.toFixed(4)),
    totalInvestido: Number(totalInvestido.toFixed(2)),
    primeiraDataCompra,
  };
}

/**
 * Calcula os indicadores completos da carteira, aplicando cálculo pro-rata diário do CDI
 * para ativos da categoria Renda Fixa (ex: CDB 100% ou 120% do CDI).
 */
export function calcularPortfolio(
  ativos: AtivoDTO[],
  metasCustomizadasClasses?: Record<string, number>,
  taxaCdiAnual?: number
): PortfolioCalculado {
  const agora = new Date();
  const cdiAnual = taxaCdiAnual ?? TAXA_CDI_ANUAL_FALLBACK;
  const taxaCdiDiaria = Math.pow(1 + cdiAnual, 1 / 252) - 1;

  const ativosComPosicao = ativos.map((ativo) => {
    const { quantidadeAtual, precoMedio, totalInvestido, primeiraDataCompra } =
      calcularPosicaoAtivo(ativo.transacoes || []);

    const isRendaFixa = ativo.classe.toUpperCase().startsWith("RENDA_FIXA");
    const taxaRentabilidade = ativo.taxaRentabilidade ?? 100; // default 100% do CDI

    let precoAtualEfetivo = ativo.precoAtual || precoMedio || 0;
    let rendimentoProRataR$ = 0;
    let diasUteis = 0;

    // Se for Renda Fixa, calcula o rendimento pro-rata diário do CDI
    if (isRendaFixa && primeiraDataCompra && quantidadeAtual > 0) {
      diasUteis = calcularDiasUteis(primeiraDataCompra, agora);
      if (diasUteis > 0) {
        // Rentabilidade diária efetiva = TAXA_CDI_DIARIA * (taxaRentabilidade / 100)
        const taxaDiariaAtivoDec = new Decimal(taxaCdiDiaria).times(
          new Decimal(taxaRentabilidade).dividedBy(100)
        );
        // Fator acumulado pro-rata = (1 + taxaDiariaAtivo)^diasUteis
        const fatorAcumuladoDec = new Decimal(1)
          .plus(taxaDiariaAtivoDec)
          .pow(diasUteis);

        const precoBaseDec = new Decimal(precoMedio > 0 ? precoMedio : (ativo.precoAtual || 1));
        const precoAtualCalculadoDec = precoBaseDec.times(fatorAcumuladoDec);

        precoAtualEfetivo = Number(precoAtualCalculadoDec.toFixed(4));
        rendimentoProRataR$ = Number(
          precoAtualCalculadoDec.minus(precoBaseDec).times(quantidadeAtual).toFixed(2)
        );
      }
    }

    const precoAtualDec = new Decimal(precoAtualEfetivo);
    const quantidadeDec = new Decimal(quantidadeAtual);
    const totalInvestidoDec = new Decimal(totalInvestido);

    const valorMercadoDec = quantidadeDec.times(precoAtualDec);
    const lucroPrejuizoR$Dec = valorMercadoDec.minus(totalInvestidoDec);

    const lucroPrejuizoPercentualDec = totalInvestidoDec.greaterThan(0)
      ? lucroPrejuizoR$Dec.dividedBy(totalInvestidoDec).times(100)
      : new Decimal(0);

    return {
      ...ativo,
      precoAtual: precoAtualEfetivo,
      taxaRentabilidade,
      rendimentoProRataR$,
      diasUteisDecorridos: diasUteis,
      quantidadeAtual,
      precoMedio,
      totalInvestido: Number(totalInvestidoDec.toFixed(2)),
      valorMercado: Number(valorMercadoDec.toFixed(2)),
      lucroPrejuizoR$: Number(lucroPrejuizoR$Dec.toFixed(2)),
      lucroPrejuizoPercentual: Number(lucroPrejuizoPercentualDec.toFixed(2)),
    };
  });

  const patrimonioTotalDec = ativosComPosicao.reduce(
    (acc, a) => acc.plus(new Decimal(a.valorMercado)),
    new Decimal(0)
  );

  const totalInvestidoTotalDec = ativosComPosicao.reduce(
    (acc, a) => acc.plus(new Decimal(a.totalInvestido)),
    new Decimal(0)
  );

  const lucroPrejuizoTotalR$Dec = patrimonioTotalDec.minus(totalInvestidoTotalDec);
  const lucroPrejuizoTotalPercentualDec = totalInvestidoTotalDec.greaterThan(0)
    ? lucroPrejuizoTotalR$Dec.dividedBy(totalInvestidoTotalDec).times(100)
    : new Decimal(0);

  let rendaMensalTotalEstimadaDec = new Decimal(0);

  const ativosCalculados: AtivoCalculado[] = ativosComPosicao.map((a) => {
    const valorMercadoDec = new Decimal(a.valorMercado);
    const percentualIdealDec = new Decimal(a.percentualIdeal || 0);
    const precoAtualDec = new Decimal(a.precoAtual || 0);
    const ultimoProventoDec = new Decimal(a.ultimoProvento || 0);
    const quantidadeDec = new Decimal(a.quantidadeAtual);

    const percentualAtualDec = patrimonioTotalDec.greaterThan(0)
      ? valorMercadoDec.dividedBy(patrimonioTotalDec).times(100)
      : new Decimal(0);

    const percentualIdealDecimal = percentualIdealDec.dividedBy(100);
    const valorIdealAtivoDec = percentualIdealDecimal.times(patrimonioTotalDec);
    const faltaR$Dec = valorIdealAtivoDec.minus(valorMercadoDec);

    let status: "COMPRAR" | "AGUARDAR" = "AGUARDAR";
    let qtdAComprar = 0;

    if (faltaR$Dec.greaterThan(0) && precoAtualDec.greaterThan(0)) {
      status = "COMPRAR";
      qtdAComprar = faltaR$Dec.dividedBy(precoAtualDec).floor().toNumber();
    }

    let numeroMagico = 0;
    let cotasFaltantesMagico = 0;
    let progressoMagicoPercentual = 0;

    if (ultimoProventoDec.greaterThan(0) && precoAtualDec.greaterThan(0)) {
      numeroMagico = precoAtualDec.dividedBy(ultimoProventoDec).ceil().toNumber();
      cotasFaltantesMagico = Math.max(0, numeroMagico - a.quantidadeAtual);
      progressoMagicoPercentual = Math.min(
        100,
        Number(quantidadeDec.dividedBy(numeroMagico).times(100).toFixed(2))
      );
    }

    const rendaMensalEstimadaDec = quantidadeDec.times(ultimoProventoDec);
    rendaMensalTotalEstimadaDec = rendaMensalTotalEstimadaDec.plus(rendaMensalEstimadaDec);

    return {
      id: a.id,
      simbolo: a.simbolo,
      nome: a.nome,
      classe: a.classe,
      setor: a.setor,
      logoUrl: a.logoUrl,
      percentualIdeal: a.percentualIdeal || 0,
      precoAtual: a.precoAtual || 0,
      ultimoProvento: Number(ultimoProventoDec.toFixed(2)),
      taxaRentabilidade: a.taxaRentabilidade,
      nota: a.nota ?? 10,
      answers: a.answers,
      rendimentoProRataR$: a.rendimentoProRataR$,
      diasUteisDecorridos: a.diasUteisDecorridos,
      quantidadeAtual: a.quantidadeAtual,
      precoMedio: a.precoMedio,
      totalInvestido: a.totalInvestido,
      valorMercado: a.valorMercado,
      lucroPrejuizoR$: a.lucroPrejuizoR$,
      lucroPrejuizoPercentual: a.lucroPrejuizoPercentual,
      percentualAtual: Number(percentualAtualDec.toFixed(4)),
      faltaR$: Number(faltaR$Dec.toFixed(2)),
      status,
      qtdAComprar,
      numeroMagico,
      cotasFaltantesMagico,
      progressoMagicoPercentual,
      rendaMensalEstimada: Number(rendaMensalEstimadaDec.toFixed(2)),
    };
  });

  const metasClasses: Record<TipoClasse, number> = {
    ACOES_NACIONAIS: metasCustomizadasClasses?.ACOES_NACIONAIS ?? metasCustomizadasClasses?.ACOES ?? 0,
    ACOES_INTERNACIONAIS: metasCustomizadasClasses?.ACOES_INTERNACIONAIS ?? metasCustomizadasClasses?.ETFS ?? 0,
    FIIS: metasCustomizadasClasses?.FIIS ?? 0,
    REITS: metasCustomizadasClasses?.REITS ?? 0,
    CRIPTO: metasCustomizadasClasses?.CRIPTO ?? 0,
    RENDA_FIXA: metasCustomizadasClasses?.RENDA_FIXA ?? 0,
    RENDA_FIXA_INTERNACIONAL: metasCustomizadasClasses?.RENDA_FIXA_INTERNACIONAL ?? 0,
  };

  const classesChaves: TipoClasse[] = [
    "ACOES_NACIONAIS",
    "ACOES_INTERNACIONAIS",
    "FIIS",
    "REITS",
    "CRIPTO",
    "RENDA_FIXA",
    "RENDA_FIXA_INTERNACIONAL",
  ];

  const resumoClasses: ResumoClasse[] = classesChaves.map((key) => {
    const infoClasse = METAS_CLASSES_PADRAO[key];
    const metaPercentualDec = new Decimal(metasClasses[key]);

    const valorMercadoTotalDec = ativosCalculados
      .filter((a) => a.classe.toUpperCase() === key)
      .reduce((sum, a) => sum.plus(new Decimal(a.valorMercado)), new Decimal(0));

    const percentualAtualDec = patrimonioTotalDec.greaterThan(0)
      ? valorMercadoTotalDec.dividedBy(patrimonioTotalDec).times(100)
      : new Decimal(0);

    const valorIdealClasseDec = metaPercentualDec.dividedBy(100).times(patrimonioTotalDec);
    const faltaR$Dec = valorIdealClasseDec.minus(valorMercadoTotalDec);
    const status: "COMPRAR" | "AGUARDAR" = faltaR$Dec.greaterThan(0) ? "COMPRAR" : "AGUARDAR";

    return {
      classe: key,
      nomeClasse: infoClasse.nome,
      metaPercentual: metaPercentualDec.toNumber(),
      valorMercadoTotal: Number(valorMercadoTotalDec.toFixed(2)),
      percentualAtual: Number(percentualAtualDec.toFixed(4)),
      faltaR$: Number(faltaR$Dec.toFixed(2)),
      status,
    };
  });

  return {
    patrimonioTotal: Number(patrimonioTotalDec.toFixed(2)),
    totalInvestidoTotal: Number(totalInvestidoTotalDec.toFixed(2)),
    lucroPrejuizoTotalR$: Number(lucroPrejuizoTotalR$Dec.toFixed(2)),
    lucroPrejuizoTotalPercentual: Number(lucroPrejuizoTotalPercentualDec.toFixed(2)),
    rendaMensalTotalEstimada: Number(rendaMensalTotalEstimadaDec.toFixed(2)),
    ativos: ativosCalculados,
    resumoClasses,
  };
}

export function simularAporteGreedy(
  ativos: AtivoCalculado[],
  patrimonioTotalAtual: number,
  valorOrcamentoAporte: number
): ResultadoSimulacaoAporte {
  const orcamentoOriginalDec = new Decimal(valorOrcamentoAporte || 0);
  if (orcamentoOriginalDec.lessThanOrEqualTo(0) || ativos.length === 0) {
    return {
      orcamentoInformado: 0,
      totalGasto: 0,
      sobraTroco: 0,
      itensCarrinho: [],
    };
  }

  const candidatos = ativos
    .filter((a) => a.precoAtual > 0 && a.percentualIdeal > 0)
    .map((a) => ({
      id: a.id,
      simbolo: a.simbolo,
      nome: a.nome,
      classe: a.classe,
      precoAtualDec: new Decimal(a.precoAtual),
      percentualIdealDec: new Decimal(a.percentualIdeal).dividedBy(100),
      valorMercadoSimuladoDec: new Decimal(a.valorMercado),
      qtdSimulada: 0,
    }));

  let orcamentoRestanteDec = new Decimal(orcamentoOriginalDec);
  let patrimonioSimuladoDec = new Decimal(patrimonioTotalAtual);

  while (orcamentoRestanteDec.greaterThan(0)) {
    let melhorCandidatoIndex = -1;
    let maiorDefasagemDec = new Decimal(-Infinity);

    for (let i = 0; i < candidatos.length; i++) {
      const c = candidatos[i];
      if (c.precoAtualDec.lessThanOrEqualTo(orcamentoRestanteDec)) {
        const valorIdealSimuladoDec = c.percentualIdealDec.times(patrimonioSimuladoDec);
        const defasagemR$Dec = valorIdealSimuladoDec.minus(c.valorMercadoSimuladoDec);

        if (defasagemR$Dec.greaterThan(maiorDefasagemDec)) {
          maiorDefasagemDec = defasagemR$Dec;
          melhorCandidatoIndex = i;
        }
      }
    }

    if (melhorCandidatoIndex === -1) {
      break;
    }

    const escolhido = candidatos[melhorCandidatoIndex];
    escolhido.qtdSimulada += 1;
    escolhido.valorMercadoSimuladoDec = escolhido.valorMercadoSimuladoDec.plus(escolhido.precoAtualDec);
    
    orcamentoRestanteDec = orcamentoRestanteDec.minus(escolhido.precoAtualDec);
    patrimonioSimuladoDec = patrimonioSimuladoDec.plus(escolhido.precoAtualDec);
  }

  const totalGastoDec = orcamentoOriginalDec.minus(orcamentoRestanteDec);

  const itensCarrinho: ItemAporteSimulado[] = candidatos
    .filter((c) => c.qtdSimulada > 0)
    .map((c) => {
      const valorTotalAporteAtivoDec = c.precoAtualDec.times(c.qtdSimulada);
      const percentualDoAporteDec = totalGastoDec.greaterThan(0)
        ? valorTotalAporteAtivoDec.dividedBy(totalGastoDec).times(100)
        : new Decimal(0);

      return {
        ativoId: c.id,
        simbolo: c.simbolo,
        nome: c.nome,
        classe: c.classe,
        precoAtual: c.precoAtualDec.toNumber(),
        qtdSimuladaComprar: c.qtdSimulada,
        valorTotalAporteAtivo: Number(valorTotalAporteAtivoDec.toFixed(2)),
        percentualDoAporte: Number(percentualDoAporteDec.toFixed(2)),
      };
    })
    .sort((a, b) => b.valorTotalAporteAtivo - a.valorTotalAporteAtivo);

  return {
    orcamentoInformado: Number(orcamentoOriginalDec.toFixed(2)),
    totalGasto: Number(totalGastoDec.toFixed(2)),
    sobraTroco: Number(orcamentoRestanteDec.toFixed(2)),
    itensCarrinho,
  };
}

export interface InfoSaudeCarteira {
  score: number;
  label: "Excelente" | "Atenção" | "Desbalanceada";
  textClass: string;
  stroke: string;
  desvioTotalPercentual: number;
}

export function calcularSaudeCarteira(portfolio: PortfolioCalculado): InfoSaudeCarteira {
  if (!portfolio || portfolio.ativos.length === 0) {
    return {
      score: 100,
      label: "Excelente",
      textClass: "text-emerald-400",
      stroke: "#34d399",
      desvioTotalPercentual: 0,
    };
  }

  // 1. Desvio acumulado de metas por classe
  const desvioClasses = portfolio.resumoClasses.reduce((sum, r) => {
    return sum + Math.abs(r.percentualAtual - r.metaPercentual);
  }, 0);

  // Score de Alocação (0 a 100)
  const scoreAlocacao = Math.max(0, 100 - Math.round(desvioClasses * 0.65));

  // 2. Média das Notas Ignite dos Ativos da Carteira (escalada para 0-100)
  const notasAtivos = portfolio.ativos.map((a) => a.nota ?? 10);
  const mediaNotas =
    notasAtivos.length > 0
      ? (notasAtivos.reduce((acc, n) => acc + n, 0) / notasAtivos.length) * 10
      : 100;

  // 3. Score Final Composto (70% Alocação + 30% Qualidade/Nota)
  const scoreFinal = Math.min(
    100,
    Math.max(0, Math.round(0.7 * scoreAlocacao + 0.3 * mediaNotas))
  );

  let label: "Excelente" | "Atenção" | "Desbalanceada" = "Excelente";
  let textClass = "text-emerald-400";
  let stroke = "#34d399";

  if (scoreFinal < 50) {
    label = "Desbalanceada";
    textClass = "text-rose-400";
    stroke = "#fb7185";
  } else if (scoreFinal < 80) {
    label = "Atenção";
    textClass = "text-amber-400";
    stroke = "#fbbf24";
  }

  return {
    score: scoreFinal,
    label,
    textClass,
    stroke,
    desvioTotalPercentual: Number(desvioClasses.toFixed(2)),
  };
}
