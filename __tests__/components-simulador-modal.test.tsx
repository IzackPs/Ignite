
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimuladorModal } from '@/components/SimuladorModal';

describe('SimuladorModal', () => {
  it('renderiza o simulador quando aberto', () => {
    const portfolio = {
      patrimonioTotal: 10000,
      totalInvestidoTotal: 9000,
      lucroPrejuizoTotalR$: 1000,
      lucroPrejuizoTotalPercentual: 10,
      rendaMensalTotalEstimada: 50,
      resumoClasses: [],
      ativos: [],
    };

    render(
      <SimuladorModal
        isOpen={true}
        onClose={vi.fn()}
        portfolio={portfolio}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText(/Simulador Inteligente de Aporte/i)).toBeInTheDocument();
  });
});
