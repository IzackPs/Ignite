import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimuladorAporteBar } from '../src/components/SimuladorAporteBar';

describe('SimuladorAporteBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve simular aporte e executar ordens', async () => {
    const mockPortfolio = {
      patrimonioTotal: 10000,
      ativos: [
        { id: '1', simbolo: 'ITUB4', classe: 'ACOES', percentualAtual: 10, percentualIdeal: 20, valorMercado: 1000, faltaR$: 1000, precoAtual: 30, qtdAComprar: 33 }
      ]
    } as any;

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

    const onRefresh = vi.fn();
    render(<SimuladorAporteBar portfolio={mockPortfolio} onRefresh={onRefresh} />);

    // Change input value
    const input = screen.getByLabelText(/Valor do Aporte/i);
    fireEvent.change(input, { target: { value: '1000' } });

    // Open modal
    const execBtn = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(execBtn);

    // Confirm in modal
    const confirmModalBtn = screen.getByRole('button', { name: /^Confirmar Compras$/i });
    fireEvent.click(confirmModalBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(onRefresh).toHaveBeenCalled();
    });
  });
});
