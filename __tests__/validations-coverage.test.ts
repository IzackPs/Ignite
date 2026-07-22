import { describe, it, expect } from "vitest";
import { transacaoSchema } from "@/lib/validations";

describe("Validations Coverage Expansion", () => {
  it("deve validar datas no transacaoSchema", () => {
    const valid = transacaoSchema.safeParse({
      ativoId: "a1",
      tipo: "COMPRA",
      quantidade: 10,
      precoUnitario: 50,
      data: "2026-01-01T12:00:00Z",
    });
    expect(valid.success).toBe(true);

    const invalidDateStr = transacaoSchema.safeParse({
      ativoId: "a1",
      tipo: "COMPRA",
      quantidade: 10,
      precoUnitario: 50,
      data: "invalid-date",
    });
    expect(invalidDateStr.success).toBe(false);

    const futureDate = transacaoSchema.safeParse({
      ativoId: "a1",
      tipo: "COMPRA",
      quantidade: 10,
      precoUnitario: 50,
      data: "2099-12-31",
    });
    expect(futureDate.success).toBe(false);
  });
});
