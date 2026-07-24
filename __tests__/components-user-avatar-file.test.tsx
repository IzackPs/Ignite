
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserAvatarModal } from "@/components/UserAvatarModal";

describe("UserAvatarModal File Upload Coverage", () => {
  it("deve lidar com upload de arquivo via FileReader e validar tamanho", async () => {
    const { container } = render(
      <UserAvatarModal
        isOpen={true}
        onClose={vi.fn()}
        currentImage={null}
        userName="Investidor Teste"
        onSave={vi.fn()}
      />
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    if (!fileInput) return;

    // Testar arquivo muito grande (>3MB)
    const bigFile = new File(["a".repeat(4 * 1024 * 1024)], "big.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    expect(screen.getByText("A imagem deve ser menor que 3MB.")).toBeInTheDocument();
  });
});
