import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../src/app/api/portfolio/route';
import { prisma } from '@/lib/prisma';
import { calcularPortfolio } from '@/lib/calculator';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    ativo: {
      findMany: vi.fn(),
    },
    metaClasse: {
      findMany: vi.fn(),
    },
    historicoPatrimonio: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/calculator', () => ({
  calcularPortfolio: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Portfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar o portfolio e historico com sucesso', async () => {
    const mockAtivos = [{ id: '1', simbolo: 'ITUB4', transacoes: [] }];
    const mockMetas = [{ classe: 'ACAO', percentualIdeal: 50 }];
    const mockHistorico = [{ id: '1', data: new Date() }];
    const mockPortfolio = { resumoClasses: [], patrimonioTotal: 1000 };

    vi.mocked(prisma.ativo.findMany).mockResolvedValueOnce(mockAtivos as any);
    vi.mocked(prisma.metaClasse.findMany).mockResolvedValueOnce(mockMetas as any);
    vi.mocked(calcularPortfolio).mockReturnValueOnce(mockPortfolio as any);
    vi.mocked(prisma.historicoPatrimonio.findMany).mockResolvedValueOnce(mockHistorico as any);

    const response = await GET() as any;

    expect(prisma.ativo.findMany).toHaveBeenCalled();
    expect(prisma.metaClasse.findMany).toHaveBeenCalled();
    expect(calcularPortfolio).toHaveBeenCalledWith(mockAtivos, { ACAO: 50 });
    expect(prisma.historicoPatrimonio.findMany).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ...mockPortfolio, historico: mockHistorico });
  });

  it('deve tratar erro 500 no cálculo do portfólio', async () => {
    vi.mocked(prisma.ativo.findMany).mockRejectedValueOnce(new Error('DB Error'));

    const response = await GET() as any;

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Erro interno ao calcular portfólio');
  });
});
