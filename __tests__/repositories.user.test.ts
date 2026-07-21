import { describe, it, expect, vi, beforeEach } from "vitest";
import { userRepository } from "../src/lib/repositories/user.repository";
import { prisma } from "../src/lib/prisma";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("userRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar usuário por email incluindo password", async () => {
    const userMock = {
      id: "u1",
      email: "test@test.com",
      name: "Test",
      image: "img",
      password: "hash",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(userMock as any);

    const res = await userRepository.findByEmail("test@test.com");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
      },
    });

    expect(res).toEqual(userMock);
  });

  it("deve buscar usuário por id sem password", async () => {
    const userMock = {
      id: "u1",
      email: "test@test.com",
      name: "Test",
      image: "img",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(userMock as any);

    const res = await userRepository.findById("u1");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    expect(res).toEqual(userMock);
  });
});
