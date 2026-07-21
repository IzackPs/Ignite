import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/auth";

describe("auth-guard", () => {
  it("deve retornar userId quando a sessão for válida", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", name: "Test User" },
      expires: "2026-12-31",
    } as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>(
      "@/lib/auth-guard"
    );

    const result = await requireAuth();

    expect(result.userId).toBe("user-123");
    expect(result.errorResponse).toBeNull();
  });

  it("deve retornar erro 401 NextResponse se não houver usuário na sessão", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const { requireAuth } = await vi.importActual<typeof import("@/lib/auth-guard")>(
      "@/lib/auth-guard"
    );

    const result = await requireAuth();

    expect(result.userId).toBeNull();
    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(401);

    const body = await result.errorResponse?.json();
    expect(body.error).toBe("Não autorizado. Faça login para continuar.");
  });
});
