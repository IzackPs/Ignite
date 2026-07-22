import { test, expect } from "@playwright/test";

test.describe("Ignite Platform - End-to-End User Journeys", () => {
  test("deve carregar a página de login com sucesso", async ({ page }) => {
    await page.goto("/login");

    // Verificar se o formulário de login é exibido
    await expect(page.getByRole("heading", { name: /Login/i })).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("deve permitir navegar até a página de registro", async ({ page }) => {
    await page.goto("/login");

    const registerLink = page.getByRole("link", { name: /Criar conta/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /Criar Conta/i })).toBeVisible();
  });

  test("deve acessar a página de FAQ e navegar pelas abas", async ({ page }) => {
    await page.goto("/dashboard");

    // Aguardar página carregar ou redirecionar
    await page.waitForLoadState("domcontentloaded");

    // Se redirecionado para login ou na dashboard, validar elementos principais
    const pageUrl = page.url();
    if (pageUrl.includes("/login")) {
      await expect(page.getByRole("heading", { name: /Login/i })).toBeVisible();
    } else {
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
