import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
}));

import { AssetModal } from '../src/components/AssetModal';
import { TransactionModal } from '../src/components/TransactionModal';
import { DividendModal } from '../src/components/DividendModal';
import { ClassGoalsModal } from '../src/components/ClassGoalsModal';
import { SimuladorAporteBar } from '../src/components/SimuladorAporteBar';

describe('Modals and Forms Coverage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  it('AssetModal - Preencher e salvar', async () => {
    const onSave = vi.fn();
    render(<AssetModal isOpen={true} onClose={vi.fn()} onSave={onSave} initialClasse="ACOES_NACIONAIS" />);
    
    fireEvent.change(screen.getByLabelText(/Ticker/i), { target: { value: 'B3SA3' } });
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'B3' } });
    
    const saveBtn = screen.getByRole('button', { name: /Salvar Ativo/i });
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('AssetModal - Editar', async () => {
    const editingAtivo = {
      id: '1', simbolo: 'ITUB4', nome: 'Itaú Unibanco', classe: 'ACOES_NACIONAIS'
    } as any;
    render(<AssetModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} initialClasse="ACOES_NACIONAIS" editingAtivo={editingAtivo} />);
    
    expect(screen.getByDisplayValue('ITUB4')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Ticker/i), { target: { value: 'ITUB3' } });
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Itau' } });
    
    const saveBtn = screen.getByRole('button', { name: /Salvar Ativo/i });
    fireEvent.click(saveBtn);
  });

  it('AssetModal - Preencher Renda Fixa', async () => {
    const onSave = vi.fn();
    render(<AssetModal isOpen={true} onClose={vi.fn()} onSave={onSave} initialClasse="RENDA_FIXA" />);
    
    fireEvent.change(screen.getByLabelText(/Nome do Ativo/i), { target: { value: 'CDB Banco' } });
    const selects = screen.getAllByRole('combobox');
    if (selects.length > 0) fireEvent.change(selects[0], { target: { value: 'PRE' } });
    
    const saveBtn = screen.getByRole('button', { name: /Salvar Ativo/i });
    fireEvent.click(saveBtn);
  });

  it('TransactionModal - Preencher e salvar', async () => {
    const onSave = vi.fn();
    const ativo = { id: '1', simbolo: 'ITUB4' } as any;
    render(<TransactionModal isOpen={true} onClose={vi.fn()} onSave={onSave} ativo={ativo} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    if(inputs.length >= 2) {
      fireEvent.change(inputs[0], { target: { value: '10' } });
      fireEvent.change(inputs[1], { target: { value: '35.5' } });
    }
    
    const saveBtn = screen.getAllByRole('button', { name: /Confirmar COMPRA/i })[0];
    fireEvent.click(saveBtn);
    

  });

  it('DividendModal - Preencher e salvar', async () => {
    const onSave = vi.fn();
    const ativos = [{ id: '1', simbolo: 'ITUB4', classe: 'ACOES' }] as any;
    render(<DividendModal isOpen={true} onClose={vi.fn()} onSave={onSave} ativos={ativos} />);
    
    const selects = screen.getAllByRole('combobox');
    if(selects.length > 0) fireEvent.change(selects[0], { target: { value: '1' } });
    
    const inputs = screen.getAllByRole('spinbutton');
    if(inputs.length > 0) fireEvent.change(inputs[0], { target: { value: '100' } });
    
    const saveBtn = screen.getAllByRole('button', { name: /Confirmar Recebimento/i })[0];
    fireEvent.click(saveBtn);
    

  });

  it('ClassGoalsModal - Preencher e salvar', async () => {
    const onSave = vi.fn();
    const resumoClasses = [
      { classe: 'ACOES', nomeClasse: 'Ações', metaPercentual: 50 },
      { classe: 'FIIS', nomeClasse: 'FIIs', metaPercentual: 50 }
    ] as any;
    
    render(<ClassGoalsModal isOpen={true} onClose={vi.fn()} onSave={onSave} resumoClasses={resumoClasses} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    if (inputs.length >= 2) {
      fireEvent.change(inputs[0], { target: { value: '60' } });
      fireEvent.change(inputs[1], { target: { value: '40' } });
    }
    
    const saveBtn = screen.getAllByRole('button', { name: /Salvar Metas/i })[0];
    fireEvent.click(saveBtn);
    

  });

  it('SimuladorAporteBar - Simular', async () => {
    const portfolio = {
      patrimonioTotal: 10000,
      ativos: [
        { id: '1', simbolo: 'ITUB4', classe: 'ACOES', status: 'COMPRAR', qtdAComprar: 100, precoAtual: 35, faltaR$: 3500, percentualAtual: 0, percentualIdeal: 100, valorMercado: 0 }
      ],
      resumoClasses: []
    } as any;
    
    render(<SimuladorAporteBar portfolio={portfolio} onRefresh={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ex: 2000/i);
    fireEvent.change(input, { target: { value: '3500' } });
    
    const execBtn = screen.getByRole('button', { name: /Confirmar/i });
    fireEvent.click(execBtn);
  });

  it('AssetModal - Exibe erro de API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Ticker já existe' })
    });
    render(<AssetModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} initialClasse="ACOES" />);
    
    fireEvent.change(screen.getByLabelText(/Ticker/i), { target: { value: 'PETR4' } });
    fireEvent.change(screen.getByLabelText(/Nome do Ativo/i), { target: { value: 'Petrobras' } });
    
    const saveBtn = screen.getByRole('button', { name: /Salvar Ativo/i });
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Ticker já existe')).toBeInTheDocument();
    });
  });

  it('AssetModal - troca classe para RENDA_FIXA via select', async () => {
    render(<AssetModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} initialClasse="ACOES" />);
    
    const classeSelect = screen.getByLabelText(/Classe \*/i);
    fireEvent.change(classeSelect, { target: { value: 'RENDA_FIXA' } });
    
    expect(screen.getByLabelText(/% do CDI/i)).toBeInTheDocument();
  });

  it('AssetModal - fecha ao clicar cancelar', () => {
    const onClose = vi.fn();
    render(<AssetModal isOpen={true} onClose={onClose} onSave={vi.fn()} />);
    
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('SimuladorAporteBar - Executar com confirmação', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    const portfolio = {
      patrimonioTotal: 10000,
      ativos: [
        { id: '1', simbolo: 'ITUB4', classe: 'ACOES', status: 'COMPRAR', qtdAComprar: 100, precoAtual: 35, faltaR$: 3500, percentualAtual: 0, percentualIdeal: 100, valorMercado: 0 }
      ],
      resumoClasses: []
    } as any;
    
    const onRefresh = vi.fn();
    render(<SimuladorAporteBar portfolio={portfolio} onRefresh={onRefresh} />);
    
    fireEvent.click(screen.getByRole('button', { name: /^Simular$/i }));

    const execBtn = screen.getByRole('button', { name: /Confirmar Compras/i });
    fireEvent.click(execBtn);

    const confirmModalBtn = screen.getByRole('button', { name: /^Confirmar Compras$/i });
    fireEvent.click(confirmModalBtn);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/transacoes', expect.any(Object));
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('SimuladorAporteBar - Cancelar confirmação', async () => {
    const portfolio = {
      patrimonioTotal: 10000,
      ativos: [
        { id: '1', simbolo: 'ITUB4', classe: 'ACOES', status: 'COMPRAR', qtdAComprar: 100, precoAtual: 35, faltaR$: 3500, percentualAtual: 0, percentualIdeal: 100, valorMercado: 0 }
      ],
      resumoClasses: []
    } as any;
    
    global.fetch = vi.fn();
    const onRefresh = vi.fn();
    render(<SimuladorAporteBar portfolio={portfolio} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole('button', { name: /^Simular$/i }));

    const execBtn = screen.getByRole('button', { name: /Confirmar Compras/i });
    fireEvent.click(execBtn);

    const cancelBtn = screen.getByRole('button', { name: /^Cancelar$/i });
    fireEvent.click(cancelBtn);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
