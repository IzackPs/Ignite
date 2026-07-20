import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetTable } from '../src/components/AssetTable';

describe('AssetTable', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    global.confirm = vi.fn().mockReturnValue(true);
  });

  it('renders assets and handles interactions', async () => {
    const ativos = [
      {
        id: '1',
        simbolo: 'ITUB4',
        nome: 'Itau',
        classe: 'ACOES',
        qtd: 100,
        precoMedio: 30,
        precoAtual: 35,
        valorMercado: 3500,
        lucroPrejuizoR$: 500,
        lucroPrejuizoPercent: 16.66,
        percentualAtual: 35,
        metaPercentualGeral: 50,
        status: 'COMPRAR',
        qtdAComprar: 0,
        faltaR$: 0,
        totalInvestido: 3000,
        percentualIdeal: 50,
        rendaMensalEstimada: 0,
      }
    ] as any;
    
    const resumoClasse = {
      classe: 'ACOES',
      nomeClasse: 'Acoes',
      valorMercadoTotal: 3500,
      totalInvestidoTotal: 3000,
      lucroPrejuizoTotalR$: 500,
      metaPercentual: 50,
      percentualAtual: 35
    } as any;

    const onAddTransacao = vi.fn();
    const onEditAtivo = vi.fn();
    const onDeleteAtivo = vi.fn();
    const onNovoAtivo = vi.fn();

    render(
      <AssetTable 
        ativos={ativos} 
        resumoClasse={resumoClasse} 
        classeKey="ACOES" 
        nomeClasse="Acoes"
        onAddTransacao={onAddTransacao}
        onEditAtivo={onEditAtivo}
        onDeleteAtivo={onDeleteAtivo}
        onNovoAtivo={onNovoAtivo}
      />
    );

    // Check if asset is rendered
    expect(screen.getByText('ITUB4')).toBeInTheDocument();

    // Click on Add Transaction
    const addTransBtn = screen.getByTitle('Registrar Compra/Venda');
    fireEvent.click(addTransBtn);

    // Click on Edit Asset
    const editAssetBtn = screen.getByTitle('Editar Meta/Preço/CDI');
    fireEvent.click(editAssetBtn);

    // Click on Delete Asset
    const delAssetBtn = screen.getByTitle('Excluir Ativo');
    fireEvent.click(delAssetBtn);

    expect(onDeleteAtivo).toHaveBeenCalled();

    // Open Add Asset Modal
    const addAssetBtn = screen.getByText(/Adicionar/i);
    fireEvent.click(addAssetBtn);
  });
});
