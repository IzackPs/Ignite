import { z } from "zod";

// ─────────────────────────────────────────────
// Constantes de domínio
// ─────────────────────────────────────────────
export const CLASSES_ATIVO = [
  "ACOES_NACIONAIS",
  "ACOES_INTERNACIONAIS",
  "FIIS",
  "REITS",
  "CRIPTO",
  "RENDA_FIXA",
  "RENDA_FIXA_INTERNACIONAL",
] as const;
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
    message: "A classe de ativo informada é inválida.",
  }),
  setor: z.string().max(50, "O setor deve ter no máximo 50 caracteres.").optional(),
  logoUrl: z.string().url("URL do logo inválida").optional().or(z.literal("")),
  percentualIdeal: z
    .coerce.number({ message: "O percentual ideal deve ser um número." })
    .min(0, "O percentual ideal não pode ser negativo.")
    .max(100, "O percentual ideal não pode ultrapassar 100%.")
    .default(0),
  precoAtual: z
    .coerce.number({ message: "O preço atual deve ser um número." })
    .min(0, "O preço atual não pode ser negativo.")
    .default(0),
  ultimoProvento: z
    .coerce.number({ message: "O último provento deve ser um número." })
    .min(0, "O provento não pode ser negativo.")
    .default(0),
  taxaRentabilidade: z
    .coerce.number({ message: "A taxa de rentabilidade deve ser um número." })
    .min(0, "A taxa não pode ser negativa.")
    .max(500, "A taxa de rentabilidade não pode ultrapassar 500%.")
    .default(100),
  nota: z
    .coerce.number({ message: "A nota deve ser um número." })
    .min(0, "A nota mínima é 0.")
    .max(10, "A nota máxima é 10.")
    .default(10),
  respostas: z
    .array(
      z.object({
        questionId: z.string().min(1, "ID da pergunta é obrigatório."),
        answer: z.boolean(),
      })
    )
    .optional(),
});

export type AtivoInput = z.infer<typeof ativoSchema>;

// ─────────────────────────────────────────────
// Schema: Pergunta / Critério (POST /api/questions)
// ─────────────────────────────────────────────
export const questionSchema = z.object({
  id: z.string().optional(),
  criterio: z
    .string()
    .min(1, "O critério é obrigatório.")
    .max(100, "O critério deve ter no máximo 100 caracteres."),
  pergunta: z
    .string()
    .min(1, "A pergunta é obrigatória.")
    .max(255, "A pergunta deve ter no máximo 255 caracteres."),
  peso: z
    .coerce.number({ message: "O peso deve ser um número." })
    .min(0.1, "O peso mínimo é 0.1.")
    .max(10, "O peso máximo é 10.0.")
    .default(1.0),
  isDefault: z.boolean().optional(),
});

export type QuestionInput = z.infer<typeof questionSchema>;

// ─────────────────────────────────────────────
// Schema: Transação (POST /api/transacoes)
// ─────────────────────────────────────────────
export const transacaoSchema = z.object({
  ativoId: z.string().min(1, "O ativo é obrigatório e deve ser selecionado."),
  tipo: z.enum(TIPOS_TRANSACAO, {
    message: "O tipo deve ser COMPRA ou VENDA.",
  }),
  quantidade: z
    .coerce.number({ message: "A quantidade deve ser um número válido." })
    .gt(0, "A quantidade deve ser maior que zero."),
  precoUnitario: z
    .coerce.number({ message: "O preço deve ser um número válido." })
    .gt(0, "O preço unitário deve ser um valor positivo maior que zero."),
  data: z.string().refine((val) => {
    if (!val) return false;
    const inputDate = val.includes("T") ? new Date(val) : new Date(val + "T00:00:00");
    if (Number.isNaN(inputDate.getTime())) return false;
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
    .coerce.number({ message: "O valor total deve ser um número." })
    .gt(0, "O valor total deve ser maior que zero."),
  data: z.string().optional(),
});

export type ProventoInput = z.infer<typeof proventoSchema>;

// ─────────────────────────────────────────────
// Schema: Histórico de Patrimônio (POST /api/historico)
// ─────────────────────────────────────────────
export const historicoSchema = z.object({
  patrimonioTotal: z
    .coerce.number({ message: "O patrimônio total deve ser um número." })
    .min(0, "O patrimônio total não pode ser negativo."),
  totalInvestido: z
    .coerce.number({ message: "O total investido deve ser um número." })
    .min(0, "O total investido não pode ser negativo."),
  lucroPrejuizo: z.coerce.number({ message: "O lucro/prejuízo deve ser um número." }),
  data: z.string().optional(),
});

export type HistoricoInput = z.infer<typeof historicoSchema>;

// ─────────────────────────────────────────────
// Schema: Metas por Classe (POST /api/metas-classes)
// ─────────────────────────────────────────────
const percentualMeta = z
  .coerce.number({ message: "O percentual deve ser um número." })
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
