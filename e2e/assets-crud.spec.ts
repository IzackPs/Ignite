import { test, expect } from "@playwright/test";

test.describe("Fluxo de Gestão de Ativos (CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.floor(Math.random() * 1000000);
    const email = `crud.${randomId}@ignite.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.fill("input[name='name']", "Tester CRUD");
    await page.fill("input[name='email']", email);
    await page.fill("input[name='password']", password);
    await page.click("button[type='submit']");

    await expect(page.getByText(/Alocação por Classe de Ativos|Rentabilidade Histórica/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("deve abrir o modal de novo ativo e cadastrar uma ação com sucesso", async ({ page }) => {
    const novoAtivoBtn = page.getByRole("button", { name: /Adicionar Novo Ativo|Adicionar/i }).first();
    await expect(novoAtivoBtn).toBeVisible({ timeout: 10000 });
    await novoAtivoBtn.click();

    await expect(page.getByText(/Adicionar Novo Ativo/i).first()).toBeVisible();

    await page.fill("#simbolo", "PETR4");
    await page.fill("#nome", "Petrobras PN");
    await page.fill("#precoAtual", "30.50");

    const salvarBtn = page.getByRole("button", { name: /Salvar Ativo/i });
    await salvarBtn.click();

    await expect(page.getByText("PETR4").first()).toBeVisible({ timeout: 10000 });
  });
});
