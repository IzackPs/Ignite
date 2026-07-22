import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '../src/app/api/questions/route';
import { POST as RESET_POST } from '../src/app/api/questions/reset/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    question: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Perguntas e Critérios (Diagrama AUVP)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar a lista de perguntas do usuário', async () => {
      const mockQuestions = [
        { id: 'q1', criterio: 'ROE', pergunta: 'ROE > 5%?', peso: 1, isDefault: true },
      ];
      vi.mocked(prisma.question.findMany).mockResolvedValueOnce(mockQuestions as any);

      const response = await GET() as any;
      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(1);
    });

    it('deve inicializar as 11 perguntas padrão se o usuário não tiver perguntas', async () => {
      vi.mocked(prisma.question.findMany)
        .mockResolvedValueOnce([]) // Primeira busca vazia
        .mockResolvedValueOnce([
          { id: 'q1', criterio: 'ROE', pergunta: 'ROE > 5%?', peso: 1, isDefault: true },
        ] as any);

      const response = await GET() as any;
      expect(prisma.question.createMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('POST', () => {
    it('deve criar um novo critério de análise', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          criterio: 'NOVO_CRITERIO',
          pergunta: 'Pergunta teste?',
          peso: 1.5,
        }),
      });

      const mockQuestion = { id: 'q2', criterio: 'NOVO_CRITERIO', pergunta: 'Pergunta teste?', peso: 1.5 };
      vi.mocked(prisma.question.create).mockResolvedValueOnce(mockQuestion as any);

      const response = await POST(request) as any;
      expect(response.status).toBe(201);
      expect(response.data.criterio).toBe('NOVO_CRITERIO');
    });
  });

  describe('PUT', () => {
    it('deve atualizar um critério existente', async () => {
      const request = new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'q1',
          criterio: 'ROE_ALT',
          pergunta: 'ROE alterado?',
          peso: 2.0,
        }),
      });

      vi.mocked(prisma.question.findFirst).mockResolvedValueOnce({ id: 'q1', userId: 'user-1' } as any);
      vi.mocked(prisma.question.update).mockResolvedValueOnce({ id: 'q1', criterio: 'ROE_ALT' } as any);

      const response = await PUT(request) as any;
      expect(response.status).toBe(200);
      expect(prisma.question.update).toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('deve deletar um critério', async () => {
      const request = new Request('http://localhost/api/questions?id=q1');
      vi.mocked(prisma.question.findFirst).mockResolvedValueOnce({ id: 'q1', userId: 'user-1' } as any);

      const response = await DELETE(request) as any;
      expect(response.status).toBe(200);
      expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
    });
  });

  describe('RESET', () => {
    it('deve excluir todas e recriar as 11 perguntas padrão', async () => {
      vi.mocked(prisma.question.findMany).mockResolvedValueOnce([
        { id: 'q1', criterio: 'ROE', isDefault: true },
      ] as any);

      const response = await RESET_POST() as any;
      expect(prisma.question.deleteMany).toHaveBeenCalled();
      expect(prisma.question.createMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
