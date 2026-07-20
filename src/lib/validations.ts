import { z } from "zod";

export const transacaoSchema = z.object({
  ativoId: z.string().min(1, "O ativo é obrigatório e deve ser selecionado."),
  tipo: z.enum(["COMPRA", "VENDA"], {
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
