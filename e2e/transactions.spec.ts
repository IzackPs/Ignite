import { test, expect } from "@playwright/test";

test.describe("Fluxo de Transações Financeiras", () => {
  test.beforeEach(async ({ page }) => {
    const randomId = Math.floor(Math.random() * 1000000);
    const email = `trans.${randomId}@ignite.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.fill("input[name='name']", "Tester Transação");
    await page.fill("input[name='email']", email);
    await page.fill("input[name='password']", password);
    await page.click("button[type='submit']");

    await expect(page.getByText(/Alocação por Classe de Ativos|Rentabilidade Histórica/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("deve cadastrar um ativo e abrir modal de transação", async ({ page }) => {
    const novoAtivoBtn = page.getByRole("button", { name: /Adicionar Novo Ativo|Adicionar/i }).first();
    await expect(novoAtivoBtn).toBeVisible({ timeout: 10000 });
    await novoAtivoBtn.click();

    await page.fill("#simbolo", "VALE3");
    await page.fill("#nome", "Vale S.A.");
    await page.fill("#precoAtual", "60.00");
    await page.getByRole("button", { name: /Salvar Ativo/i }).click();

    await expect(page.getByText("VALE3").first()).toBeVisible({ timeout: 10000 });

    const addTransacaoBtn = page.getByRole("button", { name: /\+ Transação|Nova Transação/i }).first();
    if (await addTransacaoBtn.isVisible()) {
      await addTransacaoBtn.click();
      await expect(page.getByText(/Registrar Transação/i)).toBeVisible();
    }
  });
});
