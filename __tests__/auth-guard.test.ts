import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

describe("auth-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar userId quando a sessão for válida pelo ID do usuário", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", name: "Test User" },
      expires: "2026-12-31",
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "user-123", email: "user@test.com" } as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>("@/lib/auth-guard");
    const result = await requireAuth();

    expect(result.userId).toBe("user-123");
    expect(result.errorResponse).toBeNull();
  });

  it("deve retornar erro 401 NextResponse se não houver usuário na sessão", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>("@/lib/auth-guard");
    const result = await requireAuth();

    expect(result.userId).toBeNull();
    expect(result.errorResponse?.status).toBe(401);
  });

  it("deve buscar por email se o id não for encontrado diretamente", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "old-id", email: "user@test.com" },
    } as any);

    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "new-id", email: "user@test.com" } as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>("@/lib/auth-guard");
    const result = await requireAuth();

    expect(result.userId).toBe("new-id");
  });

  it("deve usar o usuário admin de fallback se não encontrar no BD", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "unknown-id" },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: "admin-id", email: "admin@ignite.com" } as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>("@/lib/auth-guard");
    const result = await requireAuth();

    expect(result.userId).toBe("admin-id");
  });

  it("deve retornar 401 se nem o usuário fallback admin existir", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "unknown-id" },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>("@/lib/auth-guard");
    const result = await requireAuth();

    expect(result.userId).toBeNull();
    expect(result.errorResponse?.status).toBe(401);
  });
});
