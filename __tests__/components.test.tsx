import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetModal } from '../src/components/AssetModal';
import { DashboardCharts } from '../src/components/DashboardCharts';
import { PortfolioOverview } from '../src/components/PortfolioOverview';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts">{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Area: () => <div />,
}));

describe('AssetModal', () => {
  it('deve renderizar botão para novo ativo', () => {
    const onSave = vi.fn();
    render(<AssetModal isOpen={true} onSave={onSave} onClose={vi.fn()} />);
    expect(screen.getByText('Adicionar Novo Ativo')).toBeInTheDocument();
  });
});

describe('DashboardCharts', () => {
  it('deve renderizar os graficos com portfolio', () => {
    const portfolio = {
      patrimonioTotal: 1000,
      totalInvestidoTotal: 800,
      lucroPrejuizoTotalR$: 200,
      lucroPrejuizoTotalPercentual: 25,
      ativos: [{
        id: '1', simbolo: 'ITUB4', nome: 'Itaú Unibanco', classe: 'ACOES', quantidadeAtual: 100, precoMedio: 30, precoAtual: 35, totalInvestido: 3000, valorMercado: 3500, lucroPrejuizoR$: 500, lucroPrejuizoPercentual: 16.6, percentualAtual: 35, percentualIdeal: 40, faltaR$: 500, status: 'COMPRAR', qtdAComprar: 10, cotasFaltantesMagico: 0, numeroMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0, rendimentoProRataR$: 0, taxaRentabilidade: 0, diasUteisDecorridos: 0, ultimoProvento: 0
      }],
      resumoClasses: [{
        classe: 'ACOES',
        nomeClasse: 'Ações',
        valorMercadoTotal: 1000,
        totalInvestido: 800,
        lucroPrejuizoR$: 200,
        lucroPrejuizoPercentual: 25,
        percentualAtual: 100,
        metaPercentual: 100,
        faltaR$: 0,
        status: 'AGUARDAR'
      }],
      historico: [],
    } as any;
    
    const historico = [
      { id: '1', data: '2026-06-01T00:00:00.000Z', patrimonioTotal: 800, totalInvestido: 800, lucroPrejuizo: 0 },
      { id: '2', data: '2026-07-01T00:00:00.000Z', patrimonioTotal: 1000, totalInvestido: 800, lucroPrejuizo: 200 },
    ];
    
    render(<DashboardCharts portfolio={portfolio} historico={historico} onOpenMetasModal={vi.fn()} onRefresh={vi.fn()} />);
    
    expect(screen.getByText('Dashboard & Evolução Patrimonial')).toBeInTheDocument();
    expect(screen.getByText('Evolução do Patrimônio Total (Mensal)')).toBeInTheDocument();
    
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    global.confirm = vi.fn().mockReturnValue(true);
    
    const saveBtn = screen.getByText('Salvar Foto Mensal');
    fireEvent.click(saveBtn);
    
    const deleteBtns = screen.getAllByTitle('Excluir este registro');
    if(deleteBtns.length > 0) fireEvent.click(deleteBtns[0]);
    

  });
});

describe('PortfolioOverview', () => {
  it('deve renderizar as abas e chamar onSelectTab', () => {
    const portfolio = {
      patrimonioTotal: 1000,
      lucroPrejuizoTotalR$: 100,
      lucroPrejuizoTotalPercentual: 10,
      resumoClasses: [
        { classe: 'ACAO', nomeClasse: 'Ações', percentualAtual: 50, metaPercentual: 50, valorAtual: 500, status: 'OK' }
      ],
      ativos: []
    } as any;
    
    const onSelectTab = vi.fn();
    render(<PortfolioOverview portfolio={portfolio} onSelectTab={onSelectTab} />);
    
    expect(screen.getAllByText('Ações')[0]).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Ver Ativos de Ações'));
    
    expect(onSelectTab).toHaveBeenCalledWith('ACAO');
  });
});
