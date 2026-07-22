import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClassGoalsModal } from '../src/components/ClassGoalsModal';

describe('ClassGoalsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar soma das metas e enviar', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const initialResumo: any[] = [
      { classe: "ACOES_NACIONAIS", nomeClasse: "Ações BR", metaPercentual: 50, valorMercadoTotal: 500, percentualAtual: 50, faltaR$: 0, status: "AGUARDAR" },
      { classe: "RENDA_FIXA", nomeClasse: "Renda Fixa", metaPercentual: 50, valorMercadoTotal: 500, percentualAtual: 50, faltaR$: 0, status: "AGUARDAR" },
    ];

    render(
      <ClassGoalsModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        resumoClasses={initialResumo}
      />
    );

    // Change to make sum invalid
    const inputAcoes = screen.getByLabelText(/Ações Nacionais/i);
    fireEvent.change(inputAcoes, { target: { value: '60' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar Metas/i });
    expect(saveBtn).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();

    // Fix sum
    const inputRendaFixa = screen.getByLabelText(/^💰 Renda Fixa/i);
    fireEvent.change(inputRendaFixa, { target: { value: '40' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/metas-classes', expect.any(Object));
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagem de erro se a requisição falhar', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(
      <ClassGoalsModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        resumoClasses={[
          { classe: "ACOES_NACIONAIS", nomeClasse: "Ações BR", metaPercentual: 50, valorMercadoTotal: 500, percentualAtual: 50, faltaR$: 0, status: "AGUARDAR" },
          { classe: "RENDA_FIXA", nomeClasse: "Renda Fixa", metaPercentual: 50, valorMercadoTotal: 500, percentualAtual: 50, faltaR$: 0, status: "AGUARDAR" },
        ]}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Salvar Metas/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("Erro ao salvar metas")).toBeInTheDocument();
    });
  });
});
