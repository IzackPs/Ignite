import { prisma } from "@/lib/prisma";

/**
 * Repositório para operações de usuário.
 * Centraliza as queries de User no banco de dados, mantendo o auth.config.ts limpo.
 */
export const userRepository = {
  /**
   * Busca um usuário pelo e-mail incluindo a senha para autenticação.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
      },
    });
  },

  /**
   * Busca um usuário pelo ID.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, image: true },
    });
  },
};
