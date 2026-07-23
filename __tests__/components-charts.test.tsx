import { logger } from '@/lib/logger';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardCharts } from '../src/components/DashboardCharts';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <svg>{children}</svg>,
  Pie: ({ children }: any) => <g>{children}</g>,
  Cell: () => <g />,
  Tooltip: ({ content }: any) => {
    // Render the tooltip content directly if it's a valid React element
    if (content && typeof content !== 'function' && typeof content.type === 'function') {
      const TooltipContent = content.type;
      return <TooltipContent active={true} payload={[{ payload: { name: 'Acoes', atual: 1000, percentualAtual: 50, metaPercentual: 50, mesAno: '2026-07', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 } }]} />;
    }
    return <g />;
  },
  AreaChart: ({ children }: any) => <svg>{children}</svg>,
  Area: () => <g />,
  XAxis: () => <g />,
  YAxis: () => <g />,
  CartesianGrid: () => <g />,
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

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<DashboardCharts portfolio={portfolio} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={onRefresh} />);

    const deleteBtn = screen.getByTitle('Excluir este registro');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /^Excluir Registro$/i });
    fireEvent.click(confirmBtn);

    expect(global.fetch).toHaveBeenCalledWith('/api/historico?id=1', { method: 'DELETE' });
  });

  it('salva foto mensal lida com erro', async () => {
    const portfolio = { resumoClasses: [], patrimonioTotal: 10000, totalInvestidoTotal: 8000, lucroPrejuizoTotalR$: 2000 } as any;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    render(<DashboardCharts portfolio={portfolio} historico={[]} onOpenMetasModal={vi.fn()} onRefresh={vi.fn()} />);

    const saveBtn = screen.getByRole('button', { name: /Salvar Foto Mensal/i });
    fireEvent.click(saveBtn);
    
    // allow promise to resolve
    await Promise.resolve();
    expect(loggerSpy).toHaveBeenCalledWith('Erro ao salvar foto mensal:', expect.any(Error));
    loggerSpy.mockRestore();
  });

  it('exclui historico lida com erro', async () => {
    const historico = [{ id: '1', data: '2026-07-20', patrimonioTotal: 1000, totalInvestido: 1000, lucroPrejuizo: 0 }] as any;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    render(<DashboardCharts portfolio={{ resumoClasses: [] } as any} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={vi.fn()} />);

    const deleteBtn = screen.getByTitle('Excluir este registro');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /^Excluir Registro$/i });
    fireEvent.click(confirmBtn);

    await Promise.resolve();
    expect(loggerSpy).toHaveBeenCalledWith('Erro ao excluir histórico:', expect.any(Error));
    loggerSpy.mockRestore();
  });
});
