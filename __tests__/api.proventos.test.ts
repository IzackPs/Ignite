import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '../src/app/api/proventos/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    provento: {
      findMany: vi.fn(),
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

describe('API Proventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar os proventos, historico e estatisticas', async () => {
      const mockProventos = [
        {
          id: '1',
          data: new Date('2026-01-15'),
          valorTotal: 10,
          tipo: 'DIVIDENDO',
          ativo: { simbolo: 'ITUB4' }
        },
        {
          id: '2',
          data: new Date('2026-01-20'),
          valorTotal: 5,
          tipo: 'JCP',
          ativo: { simbolo: 'ITUB4' }
        },
        {
          id: '3',
          data: new Date('2026-02-15'),
          valorTotal: 20,
          tipo: 'RENDIMENTO',
          ativo: { simbolo: 'HGLG11' }
        }
      ];

      vi.mocked(prisma.provento.findMany).mockResolvedValueOnce(mockProventos as any);

      const response = await GET() as any;

      expect(prisma.provento.findMany).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.data.proventosCount).toBe(3);
      expect(response.data.totalGeralRecebido).toBe(35);
      expect(response.data.historicoMensal.length).toBe(2);
      
      const janStats = response.data.historicoMensal.find((h: any) => h.chaveMes === '2026-01');
      expect(janStats.total).toBe(15);
      expect(janStats.dividendo).toBe(10);
      expect(janStats.jcp).toBe(5);
      expect(janStats.rendimento).toBe(0);

      const febStats = response.data.historicoMensal.find((h: any) => h.chaveMes === '2026-02');
      expect(febStats.total).toBe(20);
      expect(febStats.rendimento).toBe(20);
    });

    it('deve tratar erro 500 no GET', async () => {
      vi.mocked(prisma.provento.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const response = await GET() as any;

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro interno ao buscar extrato de proventos');
    });
  });

  describe('POST', () => {
    it('deve retornar 400 se campos faltando', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ativoId: '1' }),
      });

      const response = await POST(request) as any;

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Ativo, Tipo e Valor Total são obrigatórios');
    });

    it('deve cadastrar provento', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          ativoId: '1',
          data: '2026-07-20T10:00:00.000Z',
          tipo: 'DIVIDENDO',
          valorTotal: 100
        }),
      });

      const mockedProvento = { id: 'p1' };
      vi.mocked(prisma.provento.create).mockResolvedValueOnce(mockedProvento as any);

      const response = await POST(request) as any;

      expect(prisma.provento.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockedProvento);
    });

    it('deve tratar erro 500 no POST', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ativoId: '1', tipo: 'DIVIDENDO', valorTotal: 100 }),
      });

      vi.mocked(prisma.provento.create).mockRejectedValueOnce(new Error('DB error'));

      const response = await POST(request) as any;

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao cadastrar provento');
    });
  });

  describe('DELETE', () => {
    it('deve retornar 400 se id faltando', async () => {
      const request = new Request('http://localhost/api/proventos');

      const response = await DELETE(request) as any;

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('ID é obrigatório');
    });

    it('deve deletar provento', async () => {
      const request = new Request('http://localhost/api/proventos?id=1');

      const response = await DELETE(request) as any;

      expect(prisma.provento.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('deve tratar erro 500 no DELETE', async () => {
      const request = new Request('http://localhost/api/proventos?id=1');

      vi.mocked(prisma.provento.delete).mockRejectedValueOnce(new Error('DB error'));

      const response = await DELETE(request) as any;

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao excluir provento');
    });
  });
});
