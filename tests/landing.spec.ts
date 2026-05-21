import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders title and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Adaptive RAG Playground/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Try the Demo" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View Source" })).toBeVisible();
  });

  test("feature cards visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Graph Traversal", { exact: true })).toBeVisible();
    await expect(page.getByText("Comparison Mode", { exact: true })).toBeVisible();
    await expect(page.getByText("Decision Log", { exact: true })).toBeVisible();
  });

  test("theme toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "coffee");
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(html).toHaveAttribute("data-theme", "contrast");
  });

  test("navigates to playground", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Try the Demo" }).click();
    await expect(page).toHaveURL("/playground");
  });
});
