import { expect, test } from "@playwright/test";

test("stale stages auto-regenerate when visiting a stale stage", async ({ page }) => {
  let llmCalls = 0;

  await page.route("**/api/verse**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        bibleId: 2692,
        usfm: "JHN.3.16-21",
        text: "For God so loved the world, that He gave His only Son.",
        fromCache: false,
      }),
    });
  });

  await page.route("**/api/sessions", async (route, request) => {
    if (request.method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          session: {
            id: 99,
            passage_ref: "JHN.3.16-21",
            bible_id: 2692,
            title: "Study JHN.3.16-21",
            passage_text: "For God so loved the world, that He gave His only Son.",
            created_at: new Date().toISOString(),
            stage_completed: 1,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sessions: [
          {
            id: 99,
            title: "Study JHN.3.16-21",
            passage_ref: "JHN.3.16-21",
            created_at: new Date().toISOString(),
            stage_completed: 1,
          },
        ],
      }),
    });
  });

  await page.route("**/api/llm-guide", async (route) => {
    llmCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: "Mocked stage guidance",
        prompt: "mock",
      }),
    });
  });

  await page.goto("/");

  await page.getByRole("textbox", { name: "Passage" }).fill("JHN.3.16-21");
  await page.getByRole("button", { name: "Load" }).click();
  await expect(page.getByText("Stage 1 Notes")).toBeVisible();

  await page.getByRole("button", { name: /^Stage 3/ }).click();
  await expect(page.getByText("Stage 3 Notes")).toBeVisible();

  await page.getByRole("button", { name: /^Stage 1/ }).click();
  await expect(page.getByText("Stage 1 Notes")).toBeVisible();

  await page.getByPlaceholder("Write your observations for this stage...").fill("Updated stage 1 observations");

  await expect(page.getByText("5 stages are out of date")).toBeVisible();

  await expect(page.getByRole("button", { name: "Stage 2: Mark (out of date)" })).toBeVisible();
  await page.getByRole("button", { name: /^Stage 2: Mark/ }).click();
  await expect(page.getByText("Stage 2 Notes")).toBeVisible();

  await expect.poll(() => llmCalls).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Stage 2: Mark (out of date)" })).toHaveCount(0);
  await expect(page.getByText("4 stages are out of date")).toBeVisible();
});
