
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClassTabs } from "@/components/ClassTabs";

describe("ClassTabs Component", () => {
  it("deve renderizar o SidebarNav e alternar abas ao clicar", () => {
    const handleChange = vi.fn();
    render(<ClassTabs activeTab="GERAL" onChangeTab={handleChange} />);

    const button = screen.getByTitle("Fundos Imobiliários");
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith("FIIS");
  });
});
