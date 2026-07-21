import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/historico/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    historicoPatrimonio: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Historico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve retornar 400 se o corpo for invalido', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request) as any;
      expect(response.status).toBe(400);
    });

    it('deve salvar o historico com sucesso', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          patrimonioTotal: 1000,
          totalInvestido: 900,
          lucroPrejuizo: 100,
          lucroPrejuizoPercentual: 10,
        }),
      });
      
      vi.mocked(prisma.historicoPatrimonio.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.historicoPatrimonio.create).mockResolvedValueOnce({ id: '1' } as any);

      const response = await POST(request) as any;
      
      expect(prisma.historicoPatrimonio.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });
});
