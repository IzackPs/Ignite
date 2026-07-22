import { describe, it, expect } from "vitest";
import {
  calcularAlocacaoRecomendada,
  PERFIS_RISCO_INFO,
} from "@/lib/profile-calculator";

describe("Profile Calculator (Suitability & Age Allocation)", () => {
  it("deve conter as informações dos 3 perfis de risco", () => {
    expect(PERFIS_RISCO_INFO.CONSERVADOR.nome).toBe("Conservador");
    expect(PERFIS_RISCO_INFO.MODERADO.nome).toBe("Moderado");
    expect(PERFIS_RISCO_INFO.ARROJADO.nome).toBe("Arrojado");
  });

  it("deve garantir que a soma dos percentuais recomendados seja sempre 100%", () => {
    const perfis = ["CONSERVADOR", "MODERADO", "ARROJADO"] as const;
    const idades = [20, 30, 45, 60, 75];

    for (const perfil of perfis) {
      for (const idade of idades) {
        const resultado = calcularAlocacaoRecomendada(perfil, idade);
        const somaMetas = Object.values(resultado.metasRecomendadas).reduce(
          (acc, val) => acc + val,
          0
        );
        expect(somaMetas).toBe(100);
      }
    }
  });

  it("deve aumentar a alocação de Renda Fixa com o avanço da idade", () => {
    const jovem = calcularAlocacaoRecomendada("MODERADO", 25);
    const idoso = calcularAlocacaoRecomendada("MODERADO", 70);

    const rfJovem =
      jovem.metasRecomendadas.RENDA_FIXA +
      jovem.metasRecomendadas.RENDA_FIXA_INTERNACIONAL;
    const rfIdoso =
      idoso.metasRecomendadas.RENDA_FIXA +
      idoso.metasRecomendadas.RENDA_FIXA_INTERNACIONAL;

    expect(rfIdoso).toBeGreaterThan(rfJovem);
  });

  it("deve atribuir mais Renda Variável para perfil Arrojado vs Conservador na mesma idade", () => {
    const conservador = calcularAlocacaoRecomendada("CONSERVADOR", 35);
    const arrojado = calcularAlocacaoRecomendada("ARROJADO", 35);

    expect(arrojado.rendaVariavelPercentualTotal).toBeGreaterThan(
      conservador.rendaVariavelPercentualTotal
    );
  });
});
