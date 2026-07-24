import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/transacoes/route';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import type { DeepMockProxy } from 'vitest-mock-extended';

// Usar require() dentro do vi.mock falha em ES modules no Vitest, então usamos async import
vi.mock('@/lib/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    __esModule: true,
    prisma: mockDeep(),
  };
});

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

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
      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('deve salvar transacao validando o contrato estrito (NÃO é teste de vaidade)', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          data: '2026-07-20T00:00:00.000Z',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 10,
        }),
      });
      
      prismaMock.ativo.findFirst.mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      prismaMock.transacao.create.mockResolvedValueOnce({ id: '1' } as any);

      const response = await POST(request);
      
      expect(prismaMock.transacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ativoId: '1',
            tipo: 'COMPRA',
            quantidade: 10,
            precoUnitario: 10,
          })
        })
      );
      
      expect(response.status).toBe(201);
    });

    it('deve retornar 404 se o ativo não for encontrado', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '999',
          data: '2026-07-20T00:00:00.000Z',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 10,
        }),
      });
      prismaMock.ativo.findFirst.mockResolvedValueOnce(null);

      const response = await POST(request);
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.error).toBe('Ativo não encontrado ou sem permissão.');
    });

    it('deve retornar 500 em caso de erro no BD', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          data: '2026-07-20T00:00:00.000Z',
          tipo: 'COMPRA',
          quantidade: 10,
          precoUnitario: 10,
        }),
      });
      prismaMock.ativo.findFirst.mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      prismaMock.transacao.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await POST(request);
      expect(response.status).toBe(500);
      
      const json = await response.json();
      expect(json.error).toBe('Erro ao registrar transação');
    });
  });

  describe('DELETE', () => {
    it('deve retornar 400 se id faltar', async () => {
      const request = new Request('http://localhost/api/transacoes');
      const response = await DELETE(request);
      expect(response.status).toBe(400);
    });

    it('deve deletar transacao validando id enviado', async () => {
      const request = new Request('http://localhost/api/transacoes?id=999');
      prismaMock.transacao.findFirst.mockResolvedValueOnce({ id: '999', userId: 'mock-user-id' } as any);
      
      const response = await DELETE(request);
      
      expect(prismaMock.transacao.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '999' }
        })
      );
      expect(response.status).toBe(200);
    });
  });
});
