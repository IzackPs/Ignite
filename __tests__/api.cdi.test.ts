import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/cdi/route";
import * as cdiService from "@/lib/services/cdi.service";

describe("GET /api/cdi", () => {
  it("deve retornar informações formatadas do CDI com sucesso", async () => {
    vi.spyOn(cdiService, "getCdiAtual").mockResolvedValueOnce({
      taxaCdiAnual: 0.1425,
      taxaCdiDiaria: 0.000529,
      fonte: "BCB_API",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      taxaCdiAnual: 0.1425,
      taxaCdiAnualPercentual: 14.25,
      taxaCdiAnualFormatada: "14,25% a.a.",
      taxaCdiDiaria: 0.000529,
      fonte: "BCB_API",
    });
  });

  it("deve retornar erro 500 se o serviço de CDI falhar", async () => {
    vi.spyOn(cdiService, "getCdiAtual").mockRejectedValueOnce(
      new Error("BCB API Fora do Ar")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Erro ao consultar taxa CDI");
  });
});
