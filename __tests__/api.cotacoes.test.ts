import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/cotacoes/route';
import { cotacaoService } from '@/lib/services/cotacao.service';

vi.mock('@/lib/services/cotacao.service', () => ({
  cotacaoService: {
    atualizarCotacoesParaUsuario: vi.fn(),
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('API Cotacoes', () => {
  let _mockDateNow: any;
  let currentTime = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    // Avança 31 segundos a cada chamada para burlar o rate limit de 30s
    _mockDateNow = vi.spyOn(Date, 'now').mockImplementation(() => {
      currentTime += 31000;
      return currentTime;
    });
  });

  it('deve retornar cached message se não houver ativos', async () => {
    vi.mocked(cotacaoService.atualizarCotacoesParaUsuario).mockResolvedValueOnce({
      updatedCount: 0,
      updatedAtivos: [],
      nothingToUpdate: true,
    } as any);
    
    const response = await POST() as any;
    
    expect(response.data.message).toBe('Nenhum ativo de renda variável para atualizar.');
    expect(response.data.updatedCount).toBe(0);
  });

  it('deve atualizar cotacoes com sucesso', async () => {
    vi.mocked(cotacaoService.atualizarCotacoesParaUsuario).mockResolvedValueOnce({
      updatedCount: 1,
      updatedAtivos: [{ simbolo: 'ITUB4', precoAntigo: 10, precoNovo: 15 }],
      nothingToUpdate: false,
    } as any);
    
    const response = await POST() as any;
    
    expect(cotacaoService.atualizarCotacoesParaUsuario).toHaveBeenCalledWith('mock-user-id');
    expect(response.data.success).toBe(true);
    expect(response.data.updatedCount).toBe(1);
    expect(response.data.updatedAtivos[0].precoNovo).toBe(15);
  });

  it('deve tratar erro 500 no cálculo do portfólio', async () => {
    vi.mocked(cotacaoService.atualizarCotacoesParaUsuario).mockRejectedValueOnce(new Error('Service Error'));

    const response = await POST() as any;

    expect(response.data.success).toBe(false);
    expect(response.data.cached).toBe(true);
  });
});
