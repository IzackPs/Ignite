import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDeleteHandler, parseBody } from "@/lib/api-handler";
import { z } from "zod";

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-123", errorResponse: null }),
}));

describe("API Handler Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeleteHandler", () => {
    it("deve retornar erro 400 se ID não for informado", async () => {
      const handler = createDeleteHandler({
        modelName: "item",
        findQuery: vi.fn(),
        deleteQuery: vi.fn(),
      });

      const req = new Request("http://localhost/api/test");
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("ID é obrigatório");
    });

    it("deve retornar 404 se registro não for encontrado", async () => {
      const handler = createDeleteHandler({
        modelName: "item",
        findQuery: vi.fn().mockResolvedValue(null),
        deleteQuery: vi.fn(),
      });

      const req = new Request("http://localhost/api/test?id=item-999");
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("Registro não encontrado ou sem permissão.");
    });

    it("deve excluir registro com sucesso e retornar 200", async () => {
      const deleteMock = vi.fn().mockResolvedValue(true);
      const handler = createDeleteHandler({
        modelName: "item",
        findQuery: vi.fn().mockResolvedValue({ id: "item-1" }),
        deleteQuery: deleteMock,
      });

      const req = new Request("http://localhost/api/test?id=item-1");
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteMock).toHaveBeenCalledWith("item-1");
    });

    it("deve retornar 500 em caso de erro na consulta", async () => {
      const handler = createDeleteHandler({
        modelName: "item",
        findQuery: vi.fn().mockRejectedValue(new Error("DB error")),
        deleteQuery: vi.fn(),
      });

      const req = new Request("http://localhost/api/test?id=item-1");
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Erro ao excluir registro");
    });
  });

  describe("parseBody", () => {
    const schema = z.object({ name: z.string().min(3, "Nome muito curto") });

    it("deve validar body correto com sucesso", () => {
      const res = parseBody(schema, { name: "Ignite" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("Ignite");
      }
    });

    it("deve retornar erro 400 formatado quando a validação falhar", () => {
      const res = parseBody(schema, { name: "ab" });
      expect(res.success).toBe(false);
    });
  });
});
