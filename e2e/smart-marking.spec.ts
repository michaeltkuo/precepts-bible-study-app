import { expect, test } from "@playwright/test";

const TEXT = "For God so loved the world, that He gave His only Son, so that everyone who believes in Him will not perish, but have eternal life. For God did not send the Son into the world to judge the world.";

test("selecting a word suggests its key word and can mark every occurrence", async ({ page }) => {
  await page.route("**/api/verse**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: TEXT }) }),
  );
  await page.route("**/api/sessions", (route, request) =>
    request.method() === "POST"
      ? route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ session: { id: 7 } }) })
      : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ sessions: [] }) }),
  );
  await page.route("**/api/llm-guide", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: "- What did God do?" }) }),
  );

  await page.goto("/");
  await page.getByRole("textbox", { name: "Passage" }).fill("JHN.3.16-17");
  await page.getByRole("button", { name: "Load" }).click();

  const passage = page.getByLabel("Passage view");
  await expect(passage).toContainText("eternal life");

  // Select the first "world" as a reader would by dragging, then release.
  await passage.evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const at = node.textContent?.indexOf("world") ?? -1;
      if (at >= 0) {
        const range = document.createRange();
        range.setStart(node, at);
        range.setEnd(node, at + 5);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        break;
      }
    }
    document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
  });
  const toolbar = page.getByRole("dialog", { name: "Mark selection" });
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole("button", { name: /All 3/ }).first().click();

  await expect(page.getByText("3 marks")).toBeVisible();
  await expect(page.getByLabel("Key words in this passage")).toContainText("world");
});
