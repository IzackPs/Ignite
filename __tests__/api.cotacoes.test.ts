import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/cotacoes/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    ativo: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Cotacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar cached message se não houver ativos', async () => {
    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([]);
    
    const response = await POST() as any;
    
    expect(response.data.message).toBe('Nenhum ativo de renda variável para atualizar.');
    expect(response.data.updatedCount).toBe(0);
  });

  it('deve buscar na Brapi e atualizar', async () => {
    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([
      { id: '1', simbolo: 'ITUB4', precoAtual: 10, classe: 'ACAO' } as any
    ]);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ symbol: 'ITUB4', regularMarketPrice: 15 }]
      })
    });
    
    const response = await POST() as any;
    
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(prisma.ativo.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { precoAtual: 15 }
    });
    expect(response.data.success).toBe(true);
    expect(response.data.updatedCount).toBe(1);
  });

  it('deve buscar no Yahoo se Brapi falhar e atualizar', async () => {
    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([
      { id: '1', simbolo: 'ITUB4', precoAtual: 10, classe: 'ACAO' } as any
    ]);
    
    // Brapi falha
    mockFetch.mockRejectedValueOnce(new Error('Brapi Down'));
    // Yahoo Success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quoteResponse: { result: [{ symbol: 'ITUB4.SA', regularMarketPrice: 16 }] }
      })
    });
    
    const response = await POST() as any;
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(prisma.ativo.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { precoAtual: 16 }
    });
    expect(response.data.updatedCount).toBe(1);
  });

  it('deve retornar cached=true se falhar em ambos', async () => {
    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce([
      { id: '1', simbolo: 'ITUB4', precoAtual: 10, classe: 'ACAO' } as any
    ]);
    
    mockFetch.mockRejectedValueOnce(new Error('Brapi Down'));
    mockFetch.mockRejectedValueOnce(new Error('Yahoo Down'));
    
    const response = await POST() as any;
    
    expect(response.data.cached).toBe(true);
    expect(response.data.success).toBe(false);
  });

  it('deve tratar erro geral', async () => {
    vi.mocked(prisma.ativo.findMany).mockRejectedValueOnce(new Error('DB error'));
    
    const response = await POST() as any;
    
    expect(response.data.cached).toBe(true);
    expect(response.data.success).toBe(false);
  });
});
