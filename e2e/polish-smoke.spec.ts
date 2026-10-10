import { expect, test } from "@playwright/test";

test("keyboard stage navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Stage 1 Notes")).toBeVisible();

  await page.keyboard.down("Meta");
  await page.keyboard.press("]");
  await page.keyboard.up("Meta");

  await expect(page.getByText("Stage 2 Notes")).toBeVisible();
});

test("bias disclosure note is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/AI questions can carry denominational assumptions/)).toBeVisible();
});
