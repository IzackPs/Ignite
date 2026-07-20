import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DividendModal } from '../src/components/DividendModal';

describe('DividendModal', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('deve registrar provento com sucesso', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    const ativos = [{ id: '1', simbolo: 'ITUB4', nome: 'Itau', classe: 'ACOES' } as any];

    render(
      <DividendModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        ativos={ativos}
      />
    );

    const valorInput = screen.getByLabelText(/Valor Total Recebido/i);
    fireEvent.change(valorInput, { target: { value: '45.50' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar Recebimento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proventos', expect.any(Object));
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve tratar erro na API', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Erro X' }) });

    const ativos = [{ id: '1', simbolo: 'ITUB4', nome: 'Itau', classe: 'ACOES' } as any];

    render(
      <DividendModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        ativos={ativos}
      />
    );

    const valorInput = screen.getByLabelText(/Valor Total Recebido/i);
    fireEvent.change(valorInput, { target: { value: '45.50' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar Recebimento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Erro X')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
