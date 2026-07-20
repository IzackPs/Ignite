import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/metas-classes/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    metaClasse: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Metas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar erro 400 se metas forem invalidas', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ metas: 'invalido' }),
    });
    
    const response = await POST(request) as any;
    
    expect(response.status).toBe(400);
    expect(response.data.error).toBe('Metas inválidas fornecidas');
  });

  it('deve fazer upsert das metas', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ metas: { ACAO: 50, FII: 50 } }),
    });
    
    const response = await POST(request) as any;
    
    expect(prisma.metaClasse.upsert).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it('deve tratar erro 500', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ metas: { ACAO: 50 } }),
    });
    
    vi.mocked(prisma.metaClasse.upsert).mockRejectedValueOnce(new Error('DB Error'));
    
    const response = await POST(request) as any;
    
    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Erro ao atualizar metas de classe');
  });
});
