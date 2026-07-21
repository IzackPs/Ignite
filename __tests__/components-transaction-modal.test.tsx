import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { TransactionModal } from '../src/components/TransactionModal';

describe('TransactionModal', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('deve registrar transação com sucesso', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    const ativo = { id: '1', simbolo: 'ITUB4', precoAtual: 30, qtdAComprar: 10 } as any;

    render(
      <TransactionModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        ativo={ativo}
      />
    );

    const dataInput = screen.getByLabelText(/Data da Operação/i);
    fireEvent.change(dataInput, { target: { value: '2026-07-20' } });

    const qtdInput = screen.getByLabelText(/Quantidade/i);
    fireEvent.change(qtdInput, { target: { value: '10' } });

    const precoInput = screen.getByLabelText(/Preço Unitário/i);
    fireEvent.change(precoInput, { target: { value: '30' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar COMPRA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/transacoes', expect.any(Object));
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve tratar erro na API', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Erro X' }) });

    const ativo = { id: '1', simbolo: 'ITUB4', precoAtual: 30, qtdAComprar: 10 } as any;

    render(
      <TransactionModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        ativo={ativo}
      />
    );

    const dataInput = screen.getByLabelText(/Data da Operação/i);
    fireEvent.change(dataInput, { target: { value: '2026-07-20' } });

    const qtdInput = screen.getByLabelText(/Quantidade/i);
    fireEvent.change(qtdInput, { target: { value: '10' } });

    const precoInput = screen.getByLabelText(/Preço Unitário/i);
    fireEvent.change(precoInput, { target: { value: '30' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar COMPRA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Erro X')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('deve alternar para VENDA e registrar', async () => {
    const onSave = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
    const ativo = { id: '1', simbolo: 'ITUB4', precoAtual: 30 } as any;

    render(<TransactionModal isOpen={true} onClose={vi.fn()} onSave={onSave} ativo={ativo} />);

    const sellTab = screen.getByRole('button', { name: /^Venda$/i });
    fireEvent.click(sellTab);

    const dataInput = screen.getByLabelText(/Data da Operação/i);
    fireEvent.change(dataInput, { target: { value: '2026-07-20' } });

    const qtdInput = screen.getByLabelText(/Quantidade/i);
    fireEvent.change(qtdInput, { target: { value: '50' } });

    const precoInput = screen.getByLabelText(/Preço Unitário/i);
    fireEvent.change(precoInput, { target: { value: '35' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar VENDA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalled();
    });
  });
});
