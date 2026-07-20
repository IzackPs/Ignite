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

    render(
      <ClassGoalsModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        resumoClasses={[]}
      />
    );

    // Initial sum is 100% (40+10+10+40)
    // Change to make sum invalid
    const inputAcoes = screen.getByLabelText(/Ações/i);
    fireEvent.change(inputAcoes, { target: { value: '50' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar Metas/i });
    fireEvent.click(saveBtn);

    expect(saveBtn).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();

    // Fix sum
    const inputRendaFixa = screen.getByLabelText(/Renda Fixa/i);
    fireEvent.change(inputRendaFixa, { target: { value: '30' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/metas-classes', expect.any(Object));
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
