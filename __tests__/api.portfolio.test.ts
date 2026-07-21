import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../src/app/api/portfolio/route';
import { portfolioService } from '@/lib/services/portfolio.service';

vi.mock('@/lib/services/portfolio.service', () => ({
  portfolioService: {
    calcularParaUsuario: vi.fn(),
  },
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
    const mockPortfolio = { resumoClasses: [], patrimonioTotal: 1000, historico: [] };
    vi.mocked(portfolioService.calcularParaUsuario).mockResolvedValueOnce(mockPortfolio as any);

    const response = await GET() as any;

    expect(portfolioService.calcularParaUsuario).toHaveBeenCalledWith('mock-user-id');
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockPortfolio);
  });

  it('deve tratar erro 500 no cálculo do portfólio', async () => {
    vi.mocked(portfolioService.calcularParaUsuario).mockRejectedValueOnce(new Error('Service Error'));

    const response = await GET() as any;

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Erro interno ao calcular portfólio');
  });
});
