import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/transacoes/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    transacao: {
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

describe('API Transacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve criar uma transacao valida', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 15,
          data: '2026-07-20'
        }),
      });
      
      const mockedData = { id: 't1' };
      vi.mocked(prisma.transacao.create).mockResolvedValueOnce(mockedData as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.transacao.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockedData);
    });

    it('deve retornar 400 se dados invalidos', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          tipo: 'COMPRA',
          // faltam campos e tipos errados
        }),
      });
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBeDefined();
    });

    it('deve retornar 500 se der erro no banco', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 15,
          data: '2026-07-20'
        }),
      });
      
      vi.mocked(prisma.transacao.create).mockRejectedValueOnce(new Error('DB'));
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao registrar transação');
    });
  });

  describe('DELETE', () => {
    it('deve deletar transacao', async () => {
      const request = new Request('http://localhost/api/transacoes?id=1');
      
      const response = await DELETE(request) as any;
      
      expect(prisma.transacao.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('deve retornar 400 se id faltar', async () => {
      const request = new Request('http://localhost/api/transacoes');
      
      const response = await DELETE(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('ID da transação é obrigatório');
    });

    it('deve retornar 500 se erro', async () => {
      const request = new Request('http://localhost/api/transacoes?id=1');
      
      vi.mocked(prisma.transacao.delete).mockRejectedValueOnce(new Error('DB'));
      
      const response = await DELETE(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao excluir transação');
    });
  });
});
