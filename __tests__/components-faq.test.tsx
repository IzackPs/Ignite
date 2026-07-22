import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FaqView } from "@/components/FaqView";

describe("FaqView Component", () => {
  it("deve renderizar o cabeçalho e as seções de navegação do FAQ", () => {
    render(<FaqView />);

    expect(screen.getByText("Central de Conhecimento")).toBeInTheDocument();
    expect(screen.getByText("FAQ, Menus do Sistema & Matemática Financeira")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Menus/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Matemática/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dúvidas/i })).toBeInTheDocument();
  });

  it("deve alternar entre as abas MENUS, MATEMATICA e DUVIDAS", () => {
    render(<FaqView />);

    // Aba Matemática
    const mathBtn = screen.getByRole("button", { name: /Matemática/i });
    fireEvent.click(mathBtn);
    expect(screen.getByText(/Preço Médio Ponderado/i)).toBeInTheDocument();

    // Aba Dúvidas
    const duvidasBtn = screen.getByRole("button", { name: /Dúvidas/i });
    fireEvent.click(duvidasBtn);
    expect(screen.getByText(/Como o sistema garante a precisão matemática/i)).toBeInTheDocument();

    // Voltar para Menus
    const menusBtn = screen.getByRole("button", { name: /Menus/i });
    fireEvent.click(menusBtn);
    expect(screen.getByText(/Visão Geral/i)).toBeInTheDocument();
  });

  it("deve expandir e recolher os cards sanfona", () => {
    render(<FaqView />);

    expect(screen.getByText(/Visão Geral/i)).toBeInTheDocument();

    const accordionBtn = screen.getByRole("button", { name: /Visão Geral/i });
    fireEvent.click(accordionBtn);

    fireEvent.click(accordionBtn);
    expect(screen.getByText(/Visão Geral/i)).toBeInTheDocument();
  });
});
