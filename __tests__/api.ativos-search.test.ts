import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/ativos/search/route";

vi.mock("yahoo-finance2", () => {
  return {
    default: class MockYahooFinance {
      quote(ticker: string) {
        if (ticker.includes("INVALIDO")) {
          return Promise.resolve(null);
        }
        if (ticker.includes("THROWS")) {
          return Promise.reject(new Error("Erro Yahoo"));
        }
        if (ticker.includes("KNCR11")) {
          return Promise.resolve({
            longName: "Kinea Rendimentos Imobiliarios FII",
            shortName: "FII KINEA",
            regularMarketPrice: 101.5,
          });
        }
        if (ticker.includes("IVVB11")) {
          return Promise.resolve({
            longName: "ISHARES S&P 500 Fundo de Indice ETF",
            shortName: "IVVB11 ETF",
            regularMarketPrice: 280.0,
          });
        }
        if (ticker.includes("BITO39")) {
          return Promise.resolve({
            longName: "BITCOIN STRATEGY ETF",
            shortName: "BITO39 BDR",
            regularMarketPrice: 85.0,
          });
        }
        return Promise.resolve({
          longName: "Petroleo Brasileiro SA",
          shortName: "PETR4",
          regularMarketPrice: 38.5,
        });
      }

      quoteSummary(ticker: string) {
        if (ticker.includes("KNCR11")) {
          return Promise.resolve({
            assetProfile: { sector: "Real Estate" },
          });
        }
        return Promise.resolve({
          assetProfile: { industry: "Oil & Gas" },
        });
      }
    },
  };
});

describe("GET /api/ativos/search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve retornar 400 se o ticker não for informado", async () => {
    const request = new Request("http://localhost/api/ativos/search");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Ticker não informado");
  });

  it("deve retornar 404 se o ativo não for encontrado pela cotação", async () => {
    const request = new Request("http://localhost/api/ativos/search?ticker=INVALIDO");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ativo não encontrado");
  });

  it("deve buscar dados de uma ação comum com sucesso e buscar logo no fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ logourl: "https://brapi.dev/favicon.svg" }],
        }),
      })
    );

    const request = new Request("http://localhost/api/ativos/search?ticker=petr4");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      simbolo: "PETR4",
      nome: "Petroleo Brasileiro SA",
      precoAtual: 38.5,
      setor: "Oil & Gas",
      logoUrl: "https://brapi.dev/favicon.svg",
      classe: "ACOES",
    });
  });

  it("deve classificar ativos .11 como FIIS ou ETFS corretamente", async () => {
    // FII KNCR11
    const reqFii = new Request("http://localhost/api/ativos/search?ticker=KNCR11");
    const resFii = await GET(reqFii);
    const dataFii = await resFii.json();
    expect(dataFii.classe).toBe("FIIS");

    // ETF IVVB11
    const reqEtf = new Request("http://localhost/api/ativos/search?ticker=IVVB11");
    const resEtf = await GET(reqEtf);
    const dataEtf = await resEtf.json();
    expect(dataEtf.classe).toBe("ETFS");
  });

  it("deve classificar BDR / ETF terminados em 39 como ETFS ou ACOES", async () => {
    const reqBito = new Request("http://localhost/api/ativos/search?ticker=BITO39");
    const resBito = await GET(reqBito);
    const dataBito = await resBito.json();
    expect(dataBito.classe).toBe("ETFS");
  });

  it("deve ignorar falhas na API de logo (Brapi) e retornar logoUrl como null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Timeout Brapi"))
    );

    const request = new Request("http://localhost/api/ativos/search?ticker=PETR4");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.logoUrl).toBeNull();
  });

  it("deve retornar 404 em caso de erro/exceção na busca", async () => {
    const request = new Request("http://localhost/api/ativos/search?ticker=THROWS");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ativo não encontrado");
  });
});
