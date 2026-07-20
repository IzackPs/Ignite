import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../src/app/api/ativos/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    ativo: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
      expect(response.data.error).toBe('Símbolo, Nome e Classe são obrigatórios');
    });

    it('deve criar um novo ativo', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACAO',
        }),
      });
      
      const mockedAtivo = { id: '1', simbolo: 'ITUB4' };
      vi.mocked(prisma.ativo.create).mockResolvedValueOnce(mockedAtivo as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.ativo.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockedAtivo);
    });

    it('deve atualizar um ativo existente', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          id: '1',
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACAO',
        }),
      });
      
      const mockedAtivo = { id: '1', simbolo: 'ITUB4' };
      vi.mocked(prisma.ativo.update).mockResolvedValueOnce(mockedAtivo as any);
      
      const response = await POST(request) as any;
      
      expect(prisma.ativo.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockedAtivo);
    });

    it('deve tratar erro P2002 de símbolo duplicado', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACAO',
        }),
      });
      
      const error = new Error('Unique constraint') as any;
      error.code = 'P2002';
      vi.mocked(prisma.ativo.create).mockRejectedValueOnce(error);
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Já existe um ativo cadastrado com este símbolo.');
    });

    it('deve retornar 500 para outros erros', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          simbolo: 'ITUB4',
          nome: 'Itaú',
          classe: 'ACAO',
        }),
      });
      
      vi.mocked(prisma.ativo.create).mockRejectedValueOnce(new Error('Generic Error'));
      
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
      expect(response.data.error).toBe('ID do ativo é necessário');
    });

    it('deve deletar ativo e retornar sucesso', async () => {
      const request = new Request('http://localhost/api/ativos?id=1');
      
      const response = await DELETE(request) as any;
      
      expect(prisma.ativo.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('deve tratar erro 500 ao deletar', async () => {
      const request = new Request('http://localhost/api/ativos?id=1');
      
      vi.mocked(prisma.ativo.delete).mockRejectedValueOnce(new Error('Delete error'));
      
      const response = await DELETE(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao excluir ativo');
    });
  });
});
