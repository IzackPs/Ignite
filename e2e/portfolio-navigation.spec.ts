import { test, expect } from "@playwright/test";

test.describe("Navegação Básica e Elementos de Interface", () => {
  test("deve carregar a página de login com todos os campos necessários", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /Login/i })).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("deve permitir navegar da página de login até a página de registro", async ({ page }) => {
    await page.goto("/login");

    const registerLink = page.getByRole("link", { name: /Criar conta/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /Criar Conta/i })).toBeVisible();
  });
});
