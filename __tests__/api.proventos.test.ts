import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/proventos/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    provento: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
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

describe('API Proventos', () => {
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

    it('deve salvar provento com sucesso', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          data: '2026-07-20',
          tipo: 'DIVIDENDO',
          valorTotal: 100,
        }),
      });
      
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      vi.mocked(prisma.provento.create).mockResolvedValueOnce({ id: '1' } as any);

      const response = await POST(request) as any;
      
      expect(prisma.provento.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('GET', () => {
    it('deve retornar a lista de proventos com estatísticas mensais', async () => {
      const { GET } = await import('../src/app/api/proventos/route');
      
      const proventosMock = [
        {
          id: '1',
          ativoId: 'a1',
          data: new Date('2026-07-20'),
          tipo: 'DIVIDENDO',
          valorTotal: 100,
          ativo: {
            simbolo: 'PETR4',
            nome: 'Petrobras',
            classe: 'ACOES',
          }
        },
        {
          id: '2',
          ativoId: 'a2',
          data: new Date('2026-07-25'),
          tipo: 'JCP',
          valorTotal: 50,
          ativo: {
            simbolo: 'VALE3',
            nome: 'Vale',
            classe: 'ACOES',
          }
        }
      ];

      vi.mocked(prisma.provento.findMany).mockResolvedValueOnce(proventosMock as any);

      const response = await GET() as any;
      expect(response.status).toBe(200);
      expect(response.data.totalGeralRecebido).toBe(150);
      expect(response.data.mediaMensal).toBe(150);
      expect(response.data.historicoMensal.length).toBe(1);
      expect(response.data.proventosCount).toBe(2);
    });
  });

  describe('DELETE', () => {
    it('deve retornar 400 se id faltar', async () => {
      const request = new Request('http://localhost/api/proventos');
      const response = await DELETE(request) as any;
      expect(response.status).toBe(400);
    });

    it('deve deletar provento com sucesso', async () => {
      const request = new Request('http://localhost/api/proventos?id=1');
      vi.mocked(prisma.provento.findFirst).mockResolvedValueOnce({ id: '1', userId: 'mock-user-id' } as any);
      const response = await DELETE(request) as any;
      expect(prisma.provento.delete).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
