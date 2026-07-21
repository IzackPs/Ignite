import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/metas-classes/route';
import { prisma } from '@/lib/prisma';

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

  describe('POST', () => {
    it('deve retornar 400 se o corpo for invalido', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request) as any;
      expect(response.status).toBe(400);
    });

    it('deve salvar as metas com sucesso', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          metas: {
            ACOES: 40,
          },
        }),
      });
      
      vi.mocked(prisma.metaClasse.upsert).mockResolvedValueOnce({ id: '1' } as any);

      const response = await POST(request) as any;
      
      expect(prisma.metaClasse.upsert).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('deve retornar 500 em caso de erro no BD', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          metas: {
            ACOES: 40,
          },
        }),
      });
      vi.mocked(prisma.metaClasse.upsert).mockRejectedValueOnce(new Error('DB Error'));

      const response = await POST(request) as any;
      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Erro ao atualizar metas de classe');
    });
  });
});
