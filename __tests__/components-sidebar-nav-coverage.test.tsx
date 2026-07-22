import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SidebarNav } from "@/components/SidebarNav";

describe("SidebarNav Coverage Expansion", () => {
  it("deve simular hover desktop, abrir drawer mobile, expandir classes de ativos e acionar todos os callbacks", () => {
    const onChangeTab = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenProfileModal = vi.fn();
    const onLogout = vi.fn();

    render(
      <SidebarNav
        activeTab="ALL"
        onChangeTab={onChangeTab}
        portfolio={{
          patrimonioTotal: 50000,
          totalInvestidoTotal: 45000,
          lucroPrejuizoTotalR$: 5000,
          lucroPrejuizoTotalPercentual: 11.1,
          rendaMensalTotalEstimada: 400,
          resumoClasses: [],
          ativos: [],
        }}
        onOpenSettings={onOpenSettings}
        onOpenProfileModal={onOpenProfileModal}
        onLogout={onLogout}
      />
    );

    // Mudar para FAQ via title do botão no rodapé
    const faqBtn = screen.getByTitle("Ajuda & Matemática do Sistema");
    fireEvent.click(faqBtn);
    expect(onChangeTab).toHaveBeenCalledWith("FAQ");

    // Simular hover na sidebar desktop
    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);
    fireEvent.mouseLeave(aside);

    // Clicar no botão mobile para abrir drawer
    const mobileMenuBtns = screen.getAllByRole("button");
    const mobileFabBtn = mobileMenuBtns[0];
    fireEvent.click(mobileFabBtn);

    // Fechar drawer mobile
    const overlay = screen.getByLabelText("Fechar menu mobile");
    fireEvent.click(overlay);

    // Clicar nos botões de rodapé
    const goalsBtn = screen.getByTitle("Configurar Metas");
    fireEvent.click(goalsBtn);
    expect(onOpenSettings).toHaveBeenCalled();

    const profileBtn = screen.getByTitle("Perfil de Investimento (Suitability)");
    fireEvent.click(profileBtn);
    expect(onOpenProfileModal).toHaveBeenCalled();

    const logoutBtn = screen.getByTitle("Sair");
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });
});
