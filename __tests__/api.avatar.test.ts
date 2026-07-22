import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "@/app/api/user/avatar/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "user-123", errorResponse: null }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("API /api/user/avatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/user/avatar", () => {
    it("deve retornar o perfil do usuário logado", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        name: "Investidor Teste",
        email: "teste@ignite.com",
        image: "https://avatar.com/1.png",
      } as any);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe("Investidor Teste");
      expect(data.image).toBe("https://avatar.com/1.png");
    });

    it("deve retornar 404 se usuário não for encontrado", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("Usuário não encontrado");
    });

    it("deve retornar 500 em caso de erro no banco", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("Database error"));

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Erro ao buscar perfil");
    });
  });

  describe("PUT /api/user/avatar", () => {
    it("deve atualizar a imagem do perfil com sucesso", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user-123",
        name: "Investidor Teste",
        email: "teste@ignite.com",
        image: "https://avatar.com/novo.png",
      } as any);

      const req = new Request("http://localhost/api/user/avatar", {
        method: "PUT",
        body: JSON.stringify({ image: "https://avatar.com/novo.png" }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.image).toBe("https://avatar.com/novo.png");
    });

    it("deve retornar 500 se falhar a atualização", async () => {
      vi.mocked(prisma.user.update).mockRejectedValue(new Error("Update error"));

      const req = new Request("http://localhost/api/user/avatar", {
        method: "PUT",
        body: JSON.stringify({ image: "invalid" }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Erro ao atualizar avatar");
    });
  });
});
