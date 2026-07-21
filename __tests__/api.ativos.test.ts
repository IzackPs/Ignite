import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/ativos/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    ativo: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Ativos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve retornar erro 400 se campos obrigatórios faltarem', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request) as any;
      expect(response.status).toBe(400);
      expect(response.data.error).toBeDefined();
    });

    it('deve criar um novo ativo', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACOES',
        }),
      });
      const mockedAtivo = { id: '1', simbolo: 'ITUB4' };
      vi.mocked(prisma.ativo.create).mockResolvedValueOnce(mockedAtivo as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.ativo.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('deve atualizar um ativo existente', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          id: '1',
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACOES',
        }),
      });
      
      const mockedAtivo = { id: '1', simbolo: 'ITUB4', userId: 'mock-user-id' };
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce(mockedAtivo as any);
      vi.mocked(prisma.ativo.update).mockResolvedValueOnce(mockedAtivo as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.ativo.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE', () => {
    it('deve retornar erro 400 se id faltar', async () => {
      const request = new Request('http://localhost/api/ativos');
      const response = await DELETE(request) as any;
      expect(response.status).toBe(400);
    });

    it('deve deletar ativo e retornar sucesso', async () => {
      const request = new Request('http://localhost/api/ativos?id=1');
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      const response = await DELETE(request) as any;
      expect(prisma.ativo.delete).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
