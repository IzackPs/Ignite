import { logger } from '@/lib/logger';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProventosView } from '../src/components/ProventosView';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
}));

describe('ProventosView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar os proventos e permitir exclusao e abertura de modal', async () => {
    const mockProventos = {
      proventos: [
        { id: '1', ativoId: '1', ativo: { simbolo: 'ITUB4', nome: 'Itau', classe: 'ACOES' }, data: '2026-07-20T00:00:00.000Z', tipo: 'DIVIDENDO', valorTotal: 10 }
      ],
      historicoMensal: [
        { chaveMes: '2026-07', mesAno: 'jul. 26', total: 10, dividendo: 10, jcp: 0, rendimento: 0 }
      ],
      totalGeralRecebido: 10,
      mediaMensal: 10,
      proventosCount: 1,
    };

    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProventos),
      });
    });

    global.confirm = vi.fn().mockReturnValue(true);

    const ativos = [{ id: '1', simbolo: 'ITUB4' } as any];
    render(<ProventosView ativos={ativos} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proventos');
    });

    // We can also find an element that appears only when proventos are loaded
    // e.g. ITUB4 which is inside the Proventos table
    await waitFor(() => {
      expect(screen.getByText('ITUB4')).toBeInTheDocument();
    });

    // Click on Excluir
    const deleteBtns = screen.queryAllByTitle('Excluir lançamento');
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[0]);
      const confirmBtn = screen.getByRole('button', { name: /^Excluir Provento$/i });
      fireEvent.click(confirmBtn);
    }
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/proventos?id=1', { method: 'DELETE' });
    });

    // Click on Registrar Provento
    const registrarBtn = screen.getByText('Registrar Provento');
    fireEvent.click(registrarBtn);
    
    // Check if modal opens by checking some text inside the modal
    expect(screen.getByText('Registrar Recebimento de Provento')).toBeInTheDocument();
  });
  it('deve lidar com lista vazia e erro no fetch', async () => {
    // Empty case
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        proventos: [],
        historicoMensal: [],
        totalGeralRecebido: 0,
        mediaMensal: 0,
        proventosCount: 0,
      }),
    });

    const { unmount } = render(<ProventosView ativos={[]} />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum provento cadastrado ainda/i)).toBeInTheDocument();
    });
    
    unmount();

    // Error case
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<ProventosView ativos={[]} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('deve lidar com erro ao excluir provento', async () => {
    const mockProventos = {
      proventos: [
        { id: '1', ativoId: '1', ativo: { simbolo: 'ITUB4', nome: 'Itau', classe: 'ACOES' }, data: '2026-07-20T00:00:00.000Z', tipo: 'DIVIDENDO', valorTotal: 10 }
      ],
      historicoMensal: [],
      totalGeralRecebido: 10,
      mediaMensal: 10,
      proventosCount: 1,
    };
    
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.reject(new Error('API Delete Error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProventos),
      });
    });

    global.confirm = vi.fn().mockReturnValue(true);
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    render(<ProventosView ativos={[]} />);

    await waitFor(() => {
      expect(screen.getByText('ITUB4')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle('Excluir lançamento');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /^Excluir Provento$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(loggerSpy).toHaveBeenCalledWith('Erro ao excluir provento:', expect.any(Error));
    });
    loggerSpy.mockRestore();
  });
});
