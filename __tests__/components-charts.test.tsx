import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardCharts } from '../src/components/DashboardCharts';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: ({ content }: any) => {
    // Render the tooltip content directly if it's a valid React element
    if (content && typeof content !== 'function' && typeof content.type === 'function') {
      const TooltipContent = content.type;
      return <TooltipContent active={true} payload={[{ payload: { name: 'Acoes', atual: 1000, percentualAtual: 50, metaPercentual: 50, mesAno: '2026-07', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 } }]} />;
    }
    return <div />;
  },
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
}));

describe('DashboardCharts', () => {
  it('renderiza graficos corretamente', () => {
    const portfolio = {
      resumoClasses: [
        { nomeClasse: 'Acoes', valorMercadoTotal: 1000, percentualAtual: 50, metaPercentual: 50 },
      ]
    } as any;

    const historico = [
      { id: '1', data: '2026-07-20', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 }
    ] as any;

    const onOpenMetasModal = vi.fn();
    const onRefresh = vi.fn();

    render(<DashboardCharts portfolio={portfolio} historico={historico} onOpenMetasModal={onOpenMetasModal} onRefresh={onRefresh} />);

    expect(screen.getByText('Editar Metas por Classe')).toBeInTheDocument();
    
    // Simulate clicks
    fireEvent.click(screen.getByText('Editar Metas por Classe'));
    expect(onOpenMetasModal).toHaveBeenCalled();
  });

  it('salva foto mensal corretamente', async () => {
    const portfolio = {
      resumoClasses: [],
      patrimonioTotal: 10000,
      totalInvestidoTotal: 8000,
      lucroPrejuizoTotalR$: 2000
    } as any;

    const historico = [] as any;
    const onRefresh = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<DashboardCharts portfolio={portfolio} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={onRefresh} />);

    const saveBtn = screen.getByRole('button', { name: /Salvar Foto Mensal/i });
    fireEvent.click(saveBtn);

    expect(global.fetch).toHaveBeenCalledWith('/api/historico', expect.any(Object));
  });

  it('exclui historico corretamente', async () => {
    const portfolio = { resumoClasses: [] } as any;
    const historico = [
      { id: '1', data: '2026-07-20', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 }
    ] as any;
    const onRefresh = vi.fn();

    global.confirm = vi.fn().mockReturnValue(true);
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<DashboardCharts portfolio={portfolio} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={onRefresh} />);

    const deleteBtn = screen.getByTitle('Excluir este registro');
    fireEvent.click(deleteBtn);

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/historico?id=1', { method: 'DELETE' });
  });

  it('salva foto mensal lida com erro', async () => {
    const portfolio = { resumoClasses: [], patrimonioTotal: 10000, totalInvestidoTotal: 8000, lucroPrejuizoTotalR$: 2000 } as any;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<DashboardCharts portfolio={portfolio} historico={[]} onOpenMetasModal={vi.fn()} onRefresh={vi.fn()} />);

    const saveBtn = screen.getByRole('button', { name: /Salvar Foto Mensal/i });
    fireEvent.click(saveBtn);
    
    // allow promise to resolve
    await Promise.resolve();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar foto mensal:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('exclui historico lida com erro', async () => {
    const historico = [{ id: '1', data: '2026-07-20', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 }] as any;
    global.confirm = vi.fn().mockReturnValue(true);
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<DashboardCharts portfolio={{ resumoClasses: [] } as any} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={vi.fn()} />);

    const deleteBtn = screen.getByTitle('Excluir este registro');
    fireEvent.click(deleteBtn);
    
    await Promise.resolve();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao excluir histórico:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
