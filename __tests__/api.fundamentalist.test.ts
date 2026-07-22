import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ativos/fundamentalist/route";
import { fundamentalistService } from "@/lib/services/fundamentalist.service";

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-123", errorResponse: null }),
}));

vi.mock("@/lib/services/fundamentalist.service", () => ({
  fundamentalistService: {
    getFundamentalistMetrics: vi.fn(),
  },
}));

describe("API /api/ativos/fundamentalist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar erro 400 se ticker não for fornecido", async () => {
    const req = new Request("http://localhost/api/ativos/fundamentalist");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Ticker é obrigatório");
  });

  it("deve retornar métricas fundamentalistas se o ticker for válido", async () => {
    vi.mocked(fundamentalistService.getFundamentalistMetrics).mockResolvedValue({
      simbolo: "WEGE3",
      roe: 25.5,
      dy: 3.2,
      suggestedAnswers: { ROE: true, DIVIDENDOS: true },
    });

    const req = new Request("http://localhost/api/ativos/fundamentalist?ticker=WEGE3");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.simbolo).toBe("WEGE3");
    expect(data.roe).toBe(25.5);
  });

  it("deve retornar 500 em caso de exceção no serviço", async () => {
    vi.mocked(fundamentalistService.getFundamentalistMetrics).mockRejectedValue(new Error("Yahoo service error"));

    const req = new Request("http://localhost/api/ativos/fundamentalist?ticker=FAIL");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Erro ao buscar indicadores fundamentalistas");
  });
});
