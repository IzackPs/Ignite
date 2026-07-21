import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/transacoes/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    transacao: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
    ativo: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Transacoes', () => {
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

    it('deve salvar transacao com sucesso', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          data: '2026-07-20',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 10,
        }),
      });
      
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      vi.mocked(prisma.transacao.create).mockResolvedValueOnce({ id: '1' } as any);

      const response = await POST(request) as any;
      
      expect(prisma.transacao.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('DELETE', () => {
    it('deve retornar 400 se id faltar', async () => {
      const request = new Request('http://localhost/api/transacoes');
      const response = await DELETE(request) as any;
      expect(response.status).toBe(400);
    });

    it('deve deletar transacao com sucesso', async () => {
      const request = new Request('http://localhost/api/transacoes?id=1');
      vi.mocked(prisma.transacao.findFirst).mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      const response = await DELETE(request) as any;
      expect(prisma.transacao.delete).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
