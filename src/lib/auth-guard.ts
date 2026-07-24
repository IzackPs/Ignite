import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Valida a sessão do usuário atual.
 * Se não autenticado ou se o usuário não existir no banco (ex: pós-reset),
 * resolve com segurança para o usuário válido no banco ou retorna 401.
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

  // Verificar se o usuário da sessão existe no banco de dados
  let dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser && session.user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  if (!dbUser) {
    return {
      userId: null,
      errorResponse: NextResponse.json(
        { error: "Sessão inválida ou conta excluída. Por favor, faça login novamente." },
        { status: 401 }
      ),
    };
  }

  return { userId: dbUser.id, errorResponse: null };
}
