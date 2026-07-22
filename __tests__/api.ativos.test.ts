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
      findUnique: vi.fn(),
    },
    assetQuestionAnswer: {
      upsert: vi.fn(),
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
          classe: 'ACOES_NACIONAIS',
        }),
      });
      const mockedAtivo = { id: '1', simbolo: 'ITUB4' };
      vi.mocked(prisma.ativo.create).mockResolvedValueOnce(mockedAtivo as any);
      vi.mocked(prisma.ativo.findUnique).mockResolvedValueOnce(mockedAtivo as any);
      
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
          classe: 'ACOES_NACIONAIS',
        }),
      });
      
      const mockedAtivo = { id: '1', simbolo: 'ITUB4', userId: 'mock-user-id' };
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce(mockedAtivo as any);
      vi.mocked(prisma.ativo.update).mockResolvedValueOnce(mockedAtivo as any);
      vi.mocked(prisma.ativo.findUnique).mockResolvedValueOnce(mockedAtivo as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.ativo.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
    it('deve retornar erro 404 se o ativo a ser atualizado não existir ou for de outro usuário', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          id: '999',
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACOES_NACIONAIS',
        }),
      });
      vi.mocked(prisma.ativo.findFirst).mockResolvedValueOnce(null);
      const response = await POST(request) as any;
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Ativo não encontrado ou sem permissão.');
    });

    it('deve retornar erro 400 em caso de P2002 (símbolo duplicado)', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACOES_NACIONAIS',
        }),
      });
      const p2002Error = new Error('Unique constraint failed') as any;
      p2002Error.code = 'P2002';
      vi.mocked(prisma.ativo.create).mockRejectedValueOnce(p2002Error);
      
      const response = await POST(request) as any;
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Já existe um ativo cadastrado com este símbolo.');
    });

    it('deve retornar erro 500 em caso de erro desconhecido no BD', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACOES_NACIONAIS',
        }),
      });
      vi.mocked(prisma.ativo.create).mockRejectedValueOnce(new Error('Fatal DB Error'));
      
      const response = await POST(request) as any;
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro interno ao salvar ativo');
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
