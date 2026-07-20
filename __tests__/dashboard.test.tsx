import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mock recharts to avoid errors
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Legend: () => <div />,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
}));

vi.mock('@/actions/auth', () => ({
  logout: vi.fn(),
}));

import Home from '../src/app/dashboard/page';

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar tela de loading e depois o portfolio', async () => {
    const mockPortfolio = {
      patrimonioTotal: 10000,
      totalInvestidoTotal: 9000,
      lucroPrejuizoTotalR$: 1000,
      lucroPrejuizoTotalPercentual: 11.11,
      ativos: [{
        id: '1', simbolo: 'ITUB4', nome: 'Itaú Unibanco', classe: 'ACOES', quantidadeAtual: 100, precoMedio: 30, precoAtual: 35, totalInvestido: 3000, valorMercado: 3500, lucroPrejuizoR$: 500, lucroPrejuizoPercentual: 16.6, percentualAtual: 35, percentualIdeal: 40, faltaR$: 500, status: 'COMPRAR', qtdAComprar: 10, cotasFaltantesMagico: 0, numeroMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0, rendimentoProRataR$: 0, taxaRentabilidade: 0, diasUteisDecorridos: 0, ultimoProvento: 0
      }],
      resumoClasses: [{
        classe: 'ACOES',
        nomeClasse: 'Ações',
        valorMercadoTotal: 3500,
        totalInvestido: 3000,
        lucroPrejuizoR$: 500,
        lucroPrejuizoPercentual: 16.6,
        percentualAtual: 35,
        metaPercentual: 40,
        faltaR$: 500,
        status: 'COMPRAR'
      }],
      historico: [{
        id: '1', data: '2026-07-20T00:00:00.000Z', patrimonioTotal: 10000, totalInvestido: 9000, lucroPrejuizo: 1000
      }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPortfolio),
    });

    render(<Home />);
    
    // Check loading state
    expect(screen.getByText('Carregando carteira de investimentos...')).toBeInTheDocument();

    // Wait for the fetch to resolve and render DashboardCharts and others
    await waitFor(() => {
      expect(screen.getByText('Dashboard & Evolução Patrimonial')).toBeInTheDocument();
    });
  });

  it('deve renderizar erro se nao houver portfolio', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(null),
    });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum dado encontrado.')).toBeInTheDocument();
    });
  });

  it('deve simular navegacao nas abas', async () => {
    const mockPortfolio = {
      patrimonioTotal: 10000,
      totalInvestidoTotal: 9000,
      lucroPrejuizoTotalR$: 1000,
      lucroPrejuizoTotalPercentual: 11.11,
      ativos: [{
        id: '1', simbolo: 'ITUB4', nome: 'Itaú Unibanco', classe: 'ACOES', quantidadeAtual: 100, precoMedio: 30, precoAtual: 35, totalInvestido: 3000, valorMercado: 3500, lucroPrejuizoR$: 500, lucroPrejuizoPercentual: 16.6, percentualAtual: 35, percentualIdeal: 40, faltaR$: 500, status: 'COMPRAR', qtdAComprar: 10, cotasFaltantesMagico: 0, numeroMagico: 0, progressoMagicoPercentual: 0, rendaMensalEstimada: 0, rendimentoProRataR$: 0, taxaRentabilidade: 0, diasUteisDecorridos: 0, ultimoProvento: 0
      }],
      resumoClasses: [{
        classe: 'ACOES',
        nomeClasse: 'Ações',
        valorMercadoTotal: 3500,
        totalInvestido: 3000,
        lucroPrejuizoR$: 500,
        lucroPrejuizoPercentual: 16.6,
        percentualAtual: 35,
        metaPercentual: 40,
        faltaR$: 500,
        status: 'COMPRAR'
      }],
      historico: [],
    };
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/proventos') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            proventos: [{ id: '1', ativoId: '1', ativoSimbolo: 'ITUB4', data: '2026-07-20T00:00:00.000Z', valorLiquido: 10, tipo: 'DIVIDENDO' }],
            historicoMensal: [{ chaveMes: '2026-07', total: 10, dataCompleta: '2026-07-20' }]
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPortfolio),
      });
    });

    const { getByText, getAllByText, getByRole, getAllByRole } = render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard & Evolução Patrimonial')).toBeInTheDocument();
    });
    
    // Click "Metas" button
    const metasBtn = screen.getAllByRole('button', { name: /Metas/i })[0];
    fireEvent.click(metasBtn);

    // Click "Novo Ativo" button
    const novoAtivoBtn = screen.getAllByRole('button', { name: /Novo Ativo/i })[0];
    fireEvent.click(novoAtivoBtn);

    // Click "Sair" button
    const sairBtn = screen.getAllByTitle('Sair')[0];
    fireEvent.click(sairBtn);

    // Click "Recarregar Dados"
    const reloadBtn = screen.getAllByTitle('Recarregar Dados')[0];
    fireEvent.click(reloadBtn);

    // Click "Atualizar Cotações"
    const updateBtn = screen.getAllByTitle('Buscar cotações reais na B3 via Brapi/Yahoo Finance')[0];
    fireEvent.click(updateBtn);
    
    // Click "Ações" tab to show AssetTable
    const acoesTab = screen.getAllByRole('button', { name: /Ações/i })[0];
    if (acoesTab) fireEvent.click(acoesTab);
    
    // Find AssetTable action buttons
    // "Editar ativo"
    const editBtns = screen.queryAllByTitle('Editar ativo');
    if (editBtns.length > 0) fireEvent.click(editBtns[0]);

    // "Lançar Transação"
    const addTransBtns = screen.queryAllByTitle('Lançar Transação');
    if (addTransBtns.length > 0) fireEvent.click(addTransBtns[0]);

    // "Excluir ativo"
    global.confirm = vi.fn().mockReturnValue(true);
    const delBtns = screen.queryAllByTitle('Excluir ativo');
    if (delBtns.length > 0) fireEvent.click(delBtns[0]);

    // Change Tab to Proventos to cover renderContent
    const proventosTab = screen.getAllByRole('button', { name: /Proventos/i })[0];
    if (proventosTab) fireEvent.click(proventosTab);
  });
});
