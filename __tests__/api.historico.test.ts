import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/historico/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    historicoPatrimonio: {
      create: vi.fn(),
      delete: vi.fn(),
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
    it('deve criar novo registro historico', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          patrimonioTotal: 1000,
          totalInvestido: 900,
          lucroPrejuizo: 100
        }),
      });
      
      const mockedSnapshot = { id: '1' };
      vi.mocked(prisma.historicoPatrimonio.create).mockResolvedValueOnce(mockedSnapshot as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.historicoPatrimonio.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockedSnapshot);
    });

    it('deve tratar erro 500 no POST', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      
      vi.mocked(prisma.historicoPatrimonio.create).mockRejectedValueOnce(new Error('DB error'));
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao salvar foto de patrimônio');
    });
  });

  describe('DELETE', () => {
    it('deve deletar registro historico', async () => {
      const request = new Request('http://localhost/api/historico?id=1');
      
      const response = await DELETE(request) as any;
      
      expect(prisma.historicoPatrimonio.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('deve retornar erro 400 se faltar id', async () => {
      const request = new Request('http://localhost/api/historico');
      
      const response = await DELETE(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('ID é obrigatório');
    });

    it('deve tratar erro 500 no DELETE', async () => {
      const request = new Request('http://localhost/api/historico?id=1');
      vi.mocked(prisma.historicoPatrimonio.delete).mockRejectedValueOnce(new Error('DB error'));
      
      const response = await DELETE(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao remover registro');
    });
  });
});
