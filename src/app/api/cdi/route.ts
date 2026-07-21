import { NextResponse } from "next/server";
import { getCdiAtual } from "@/lib/services/cdi.service";

/**
 * GET /api/cdi
 * Retorna a taxa CDI atualizada (anual e diária) com fonte de dados.
 * Não requer autenticação — o CDI é um dado público.
 */
export async function GET() {
  try {
    const cdiInfo = await getCdiAtual();

    return NextResponse.json({
      taxaCdiAnual: cdiInfo.taxaCdiAnual,
      taxaCdiAnualPercentual: Number((cdiInfo.taxaCdiAnual * 100).toFixed(2)),
      taxaCdiAnualFormatada: `${(cdiInfo.taxaCdiAnual * 100).toFixed(2).replace(".", ",")}% a.a.`,
      taxaCdiDiaria: cdiInfo.taxaCdiDiaria,
      fonte: cdiInfo.fonte,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao consultar taxa CDI" },
      { status: 500 }
    );
  }
}
