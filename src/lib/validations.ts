import { z } from "zod";

// ─────────────────────────────────────────────
// Constantes de domínio
// ─────────────────────────────────────────────
export const CLASSES_ATIVO = ["ACOES", "FIIS", "ETFS", "RENDA_FIXA"] as const;
export const TIPOS_TRANSACAO = ["COMPRA", "VENDA"] as const;
export const TIPOS_PROVENTO = ["DIVIDENDO", "JCP", "RENDIMENTO"] as const;

// ─────────────────────────────────────────────
// Schema: Ativo (POST /api/ativos)
// ─────────────────────────────────────────────
export const ativoSchema = z.object({
  simbolo: z
    .string()
    .min(1, "O símbolo é obrigatório.")
    .max(10, "O símbolo deve ter no máximo 10 caracteres."),
  nome: z
    .string()
    .min(1, "O nome é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  classe: z.enum(CLASSES_ATIVO, {
    message: "A classe deve ser ACOES, FIIS, ETFS ou RENDA_FIXA.",
  }),
  setor: z.string().max(50, "O setor deve ter no máximo 50 caracteres.").optional(),
  logoUrl: z.string().url("URL do logo inválida").optional().or(z.literal("")),
  percentualIdeal: z
    .number({ message: "O percentual ideal deve ser um número." })
    .min(0, "O percentual ideal não pode ser negativo.")
    .max(100, "O percentual ideal não pode ultrapassar 100%.")
    .default(0),
  precoAtual: z
    .number({ message: "O preço atual deve ser um número." })
    .min(0, "O preço atual não pode ser negativo.")
    .default(0),
  ultimoProvento: z
    .number({ message: "O último provento deve ser um número." })
    .min(0, "O provento não pode ser negativo.")
    .default(0),
  taxaRentabilidade: z
    .number({ message: "A taxa de rentabilidade deve ser um número." })
    .min(0, "A taxa não pode ser negativa.")
    .max(500, "A taxa de rentabilidade não pode ultrapassar 500%.")
    .default(100),
});

export type AtivoInput = z.infer<typeof ativoSchema>;

// ─────────────────────────────────────────────
// Schema: Transação (POST /api/transacoes)
// ─────────────────────────────────────────────
export const transacaoSchema = z.object({
  ativoId: z.string().min(1, "O ativo é obrigatório e deve ser selecionado."),
  tipo: z.enum(TIPOS_TRANSACAO, {
    message: "O tipo deve ser COMPRA ou VENDA.",
  }),
  quantidade: z
    .number({ message: "A quantidade deve ser um número válido." })
    .gt(0, "A quantidade deve ser maior que zero."),
  precoUnitario: z
    .number({ message: "O preço deve ser um número válido." })
    .gt(0, "O preço unitário deve ser um valor positivo maior que zero."),
  data: z.string().refine((val) => {
    if (!val) return false;
    const inputDate = new Date(val + "T00:00:00");
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  }, "A data da transação não pode ser no futuro."),
});

export type TransacaoInput = z.infer<typeof transacaoSchema>;

// ─────────────────────────────────────────────
// Schema: Provento (POST /api/proventos)
// ─────────────────────────────────────────────
export const proventoSchema = z.object({
  ativoId: z.string().min(1, "O ativo é obrigatório."),
  tipo: z.enum(TIPOS_PROVENTO, {
    message: "O tipo deve ser DIVIDENDO, JCP ou RENDIMENTO.",
  }),
  valorTotal: z
    .number({ message: "O valor total deve ser um número." })
    .gt(0, "O valor total deve ser maior que zero."),
  data: z.string().optional(),
});

export type ProventoInput = z.infer<typeof proventoSchema>;

// ─────────────────────────────────────────────
// Schema: Histórico de Patrimônio (POST /api/historico)
// ─────────────────────────────────────────────
export const historicoSchema = z.object({
  patrimonioTotal: z
    .number({ message: "O patrimônio total deve ser um número." })
    .min(0, "O patrimônio total não pode ser negativo."),
  totalInvestido: z
    .number({ message: "O total investido deve ser um número." })
    .min(0, "O total investido não pode ser negativo."),
  lucroPrejuizo: z.number({ message: "O lucro/prejuízo deve ser um número." }),
  data: z.string().optional(),
});

export type HistoricoInput = z.infer<typeof historicoSchema>;

// ─────────────────────────────────────────────
// Schema: Metas por Classe (POST /api/metas-classes)
// ─────────────────────────────────────────────
const percentualMeta = z
  .number({ message: "O percentual deve ser um número." })
  .min(0, "O percentual não pode ser negativo.")
  .max(100, "O percentual não pode ultrapassar 100%.");

export const metasClasseSchema = z.object({
  metas: z
    .record(z.string(), percentualMeta)
    .refine((obj) => typeof obj === "object" && obj !== null, {
      message: "Metas devem ser um objeto chave-valor.",
    }),
});

export type MetasClasseInput = z.infer<typeof metasClasseSchema>;
