import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth-guard";

interface DeleteHandlerOptions {
  modelName: string;
  findQuery: (id: string, userId: string) => Promise<any>;
  deleteQuery: (id: string) => Promise<any>;
  missingIdMsg?: string;
  notFoundMsg?: string;
  errorMsg?: string;
}

export function createDeleteHandler({
  modelName,
  findQuery,
  deleteQuery,
  missingIdMsg = "ID é obrigatório",
  notFoundMsg = "Registro não encontrado ou sem permissão.",
  errorMsg = "Erro ao excluir registro",
}: DeleteHandlerOptions) {
  return async function DELETE(request: Request) {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json({ error: missingIdMsg }, { status: 400 });
      }

      const item = await findQuery(id, userId);
      if (!item) {
        return NextResponse.json({ error: notFoundMsg }, { status: 404 });
      }

      await deleteQuery(id);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      logger.error(`Erro ao excluir ${modelName}:`, error);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  };
}

export function parseBody<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } },
  body: unknown,
  defaultErrorMsg = "Dados inválidos"
): { success: true; data: T } | { success: false; response: NextResponse } {
  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || defaultErrorMsg;
    return {
      success: false,
      response: NextResponse.json(
        { error: firstError, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: parseResult.data as T };
}
