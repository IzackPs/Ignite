import { test, expect } from "@playwright/test";

test.describe("Fluxo de Autenticação e Proteção de Rotas", () => {
  test("deve redirecionar usuário não autenticado ao tentar acessar o /dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Login/i })).toBeVisible();
  });

  test("deve permitir registrar um novo usuário e carregar o painel do dashboard", async ({ page }) => {
    const randomId = Math.floor(Math.random() * 1000000);
    const testEmail = `test.e2e.${randomId}@ignite.com`;

    await page.goto("/register");

    await page.fill("input[name='name']", "Investidor Teste");
    await page.fill("input[name='email']", testEmail);
    await page.fill("input[name='password']", "SenhaSegura123!");

    await page.click("button[type='submit']");

    // Verificar se o painel da carteira carregou com sucesso
    await expect(page.getByText(/Alocação por Classe de Ativos|Rentabilidade Histórica/i).first()).toBeVisible({ timeout: 15000 });
  });
});
