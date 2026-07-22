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
      { classe: "ACOES_NACIONAIS", metaPercentual: 50 },
      { classe: "RENDA_FIXA", metaPercentual: 50 },
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
    fireEvent.click(saveBtn);

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
});
