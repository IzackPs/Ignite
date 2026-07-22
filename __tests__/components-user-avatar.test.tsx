import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserAvatarModal } from "@/components/UserAvatarModal";

global.fetch = vi.fn();

describe("UserAvatarModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o modal com título e preview do avatar", () => {
    render(
      <UserAvatarModal
        isOpen={true}
        onClose={vi.fn()}
        currentImage="https://avatar.com/test.png"
        userName="Investidor Teste"
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText("Alterar Foto de Perfil")).toBeInTheDocument();
  });

  it("deve salvar a nova foto de perfil com sucesso ao enviar URL", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ image: "https://avatar.com/novo.png" }),
    } as any);

    render(
      <UserAvatarModal
        isOpen={true}
        onClose={handleClose}
        currentImage=""
        userName="Investidor Teste"
        onSave={handleSave}
      />
    );

    const inputUrl = screen.getByPlaceholderText("https://exemplo.com/sua-foto.jpg");
    fireEvent.change(inputUrl, { target: { value: "https://avatar.com/novo.png" } });

    const saveBtn = screen.getByRole("button", { name: /Salvar Foto/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/user/avatar", expect.anything());
      expect(handleSave).toHaveBeenCalledWith("https://avatar.com/novo.png");
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("deve remover a foto de perfil quando currentImage existir e clicar em Salvar Foto", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ image: null }),
    } as any);

    render(
      <UserAvatarModal
        isOpen={true}
        onClose={handleClose}
        currentImage="https://avatar.com/old.png"
        userName="Investidor Teste"
        onSave={handleSave}
      />
    );

    const removeBtn = screen.getByRole("button", { name: /Remover Foto/i });
    fireEvent.click(removeBtn);

    const saveBtn = screen.getByRole("button", { name: /Salvar Foto/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(null);
    });
  });
});
