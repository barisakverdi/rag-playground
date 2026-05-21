import { test, expect } from "@playwright/test";

test.describe("Playground page", () => {
  test("renders query input and mode toggle", async ({ page }) => {
    await page.goto("/en/playground");
    await expect(page.getByPlaceholder(/Ask about BrewPulse/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Single" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Compare" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ask/i })).toBeVisible();
  });

  test("prompt library shows method badges", async ({ page }) => {
    await page.goto("/en/playground");
    // Sidebar open by default — find at least one method badge
    const badge = page.locator("span").filter({ hasText: /^(graph|semantic|hybrid)$/ }).first();
    await expect(badge).toBeVisible();
  });

  test("sidebar toggle hides prompt library", async ({ page }) => {
    await page.goto("/en/playground");
    await expect(page.getByText("20 Sample Queries")).toBeVisible();
    await page.getByTitle(/Hide examples/i).click();
    await expect(page.getByText("20 Sample Queries")).not.toBeVisible();
  });

  test("clicking a prompt populates textarea", async ({ page }) => {
    await page.goto("/en/playground");
    const firstPrompt = page.locator("button").filter({ hasText: /NorthBrew Supplies/ }).first();
    await firstPrompt.click();
    const textarea = page.getByPlaceholder(/Ask about BrewPulse/i);
    await expect(textarea).not.toHaveValue("");
  });

  test("ask button disabled when textarea empty", async ({ page }) => {
    await page.goto("/en/playground");
    const askBtn = page.getByRole("button", { name: /Ask/i });
    await expect(askBtn).toBeDisabled();
  });

  test("mobile — query input visible on small screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/playground");
    await expect(page.getByPlaceholder(/Ask about BrewPulse/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Ask/i })).toBeVisible();
  });
});
