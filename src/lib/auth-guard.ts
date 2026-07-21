import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Valida a sessão do usuário atual.
 * Se não autenticado, retorna uma NextResponse 401.
 * Caso contrário, retorna o userId da sessão.
 *
 * @example
 * const { userId, errorResponse } = await requireAuth();
 * if (errorResponse) return errorResponse;
 * // userId garantidamente definido abaixo deste ponto
 */
export async function requireAuth(): Promise<
  | { userId: string; errorResponse: null }
  | { userId: null; errorResponse: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      userId: null,
      errorResponse: NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      ),
    };
  }

  return { userId: session.user.id, errorResponse: null };
}
