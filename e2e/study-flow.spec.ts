import { expect, test } from "@playwright/test";

test("create session and move through stages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Passage" }).fill("JHN.3.16-21");
  await page.getByRole("button", { name: "Load" }).click();

  await expect(page.getByText("Stage 1 Notes")).toBeVisible();

  await page.getByPlaceholder("Write your observations for this stage...").fill("Initial observations.");
  await page.getByRole("button", { name: "Stage 2" }).click();
  await expect(page.getByText("Stage 2 Notes")).toBeVisible();

  await page.getByRole("button", { name: "Stage 3" }).click();
  await expect(page.getByText("Stage 3 Notes")).toBeVisible();

  await page.getByRole("button", { name: "Stage 4" }).click();
  await expect(page.getByText("Stage 4 Notes")).toBeVisible();

  await page.getByRole("button", { name: "Stage 5" }).click();
  await expect(page.getByText("Stage 5 Notes")).toBeVisible();

  await page.getByRole("button", { name: "Stage 6" }).click();
  await expect(page.getByText("Stage 6 Notes")).toBeVisible();
});
