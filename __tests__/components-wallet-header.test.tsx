
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { WalletHeader } from "@/components/WalletHeader";

describe("WalletHeader Component", () => {
  it("deve renderizar o nome do usuário e o patrimônio investido", () => {
    render(
      <WalletHeader
        userName="Izack"
        patrimonioInvestido={50000}
        isBalanceVisible={true}
        onToggleBalance={vi.fn()}
      />
    );

    expect(screen.getByText("Olá,")).toBeInTheDocument();
    expect(screen.getByText("Izack")).toBeInTheDocument();
    expect(screen.getByText("R$ 50.000,00")).toBeInTheDocument();
  });

  it("deve ocultar o saldo quando isBalanceVisible for false", () => {
    render(
      <WalletHeader
        userName="Izack"
        patrimonioInvestido={50000}
        isBalanceVisible={false}
        onToggleBalance={vi.fn()}
      />
    );

    expect(screen.getByText("R$ •••••")).toBeInTheDocument();
  });

  it("deve chamar onToggleBalance ao clicar no olho", () => {
    const handleToggle = vi.fn();
    render(
      <WalletHeader
        patrimonioInvestido={1000}
        isBalanceVisible={true}
        onToggleBalance={handleToggle}
      />
    );

    const toggleBtn = screen.getByTitle("Ocultar saldo");
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onUpdatePrices ao clicar no botão de sincronizar", () => {
    const handleUpdate = vi.fn();
    render(
      <WalletHeader
        patrimonioInvestido={1000}
        isBalanceVisible={true}
        onToggleBalance={vi.fn()}
        lastPriceUpdate="10:00"
        onUpdatePrices={handleUpdate}
      />
    );

    const syncBtn = screen.getByTitle("Sincronizar");
    fireEvent.click(syncBtn);
    expect(handleUpdate).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onLogout ao clicar no botão Sair", () => {
    const handleLogout = vi.fn();
    render(
      <WalletHeader
        patrimonioInvestido={1000}
        isBalanceVisible={true}
        onToggleBalance={vi.fn()}
        onLogout={handleLogout}
      />
    );

    const logoutBtn = screen.getByTitle("Sair");
    fireEvent.click(logoutBtn);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
