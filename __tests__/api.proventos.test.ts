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

    it('deve retornar 404 se o ativo não for encontrado', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '999',
          data: '2026-07-20',
          tipo: 'DIVIDENDO',
          valorTotal: 100,
        }),
      });
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce(null);

      const response = await POST(request) as any;
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Ativo não encontrado ou sem permissão.');
    });

    it('deve retornar 500 em caso de erro no BD', async () => {
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
      vi.mocked(prisma.provento.create).mockRejectedValueOnce(new Error('DB Error'));

      const response = await POST(request) as any;
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao cadastrar provento');
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
        },
        {
          id: '3',
          ativoId: 'a3',
          data: new Date('2026-07-28'),
          tipo: 'RENDIMENTO',
          valorTotal: 30,
          ativo: {
            simbolo: 'KNCR11',
            nome: 'Kinea',
            classe: 'FIIS',
          }
        }
      ];

      vi.mocked(prisma.provento.findMany).mockResolvedValueOnce(proventosMock as any);

      const response = await GET() as any;
      expect(response.status).toBe(200);
      expect(response.data.totalGeralRecebido).toBe(180);
      expect(response.data.mediaMensal).toBe(180);
      expect(response.data.historicoMensal.length).toBe(1);
      expect(response.data.proventosCount).toBe(3);
    });

    it('deve retornar 500 em caso de erro no GET', async () => {
      const { GET } = await import('../src/app/api/proventos/route');
      vi.mocked(prisma.provento.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const response = await GET() as any;
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro interno ao buscar extrato de proventos');
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
