import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("todo-list")).toBeVisible();
});

test("full CRUD: create, update, toggle, delete + persistence", async ({ page }) => {
  // CREATE with description
  await page.getByTestId("new-todo-title").fill("Buy oat milk");
  await page.getByTestId("new-todo-desc").fill("Minimal pink run");
  await page.getByTestId("add-todo").click();
  const card = page.getByTestId("todo-list").locator("li", { hasText: "Buy oat milk" });
  await expect(card).toBeVisible();
  await expect(card.getByText("Minimal pink run")).toBeVisible();

  // UPDATE
  const id = (await card.getAttribute("data-testid"))!.replace("todo-", "");
  await page.getByTestId(`edit-${id}`).click();
  await page.getByTestId(`edit-title-${id}`).fill("Buy oat milk x2");
  await page.getByTestId(`edit-desc-${id}`).fill("Updated desc");
  await page.getByTestId(`save-${id}`).click();
  await expect(page.getByTestId(`title-${id}`)).toHaveText("Buy oat milk x2");
  await expect(page.getByTestId(`desc-${id}`)).toHaveText("Updated desc");

  // TOGGLE done
  await page.getByTestId(`toggle-${id}`).check();
  await expect(page.getByTestId(`title-${id}`)).toHaveCSS("text-decoration-line", "line-through");

  // PERSISTENCE across reload
  await page.reload();
  await expect(page.getByTestId(`title-${id}`)).toHaveText("Buy oat milk x2");

  // DELETE
  await page.getByTestId(`delete-${id}`).click();
  await expect(page.getByTestId(`title-${id}`)).toHaveCount(0);
});

test("sub-tasks: add, toggle, progress, delete (composable)", async ({ page }) => {
  const first = page.getByTestId("todo-list").locator("li").first();
  const todoId = (await first.getAttribute("data-testid"))!.replace("todo-", "");

  await page.getByTestId(`new-subtask-${todoId}`).fill("Sub A");
  await page.getByTestId(`add-subtask-${todoId}`).click();
  await expect(first.getByText("Sub A")).toBeVisible();
  await expect(page.getByTestId(`subtask-progress-${todoId}`)).toContainText("1/3");

  const subToggle = first.getByRole("checkbox", { name: /Sub A/ });
  await subToggle.check();
  await expect(page.getByTestId(`subtask-progress-${todoId}`)).toContainText("2/3");

  const subId = (await subToggle.getAttribute("id"))!.replace("sub-", "");
  await page.getByTestId(`subtask-delete-${subId}`).click();
  await expect(first.getByText("Sub A")).toHaveCount(0);
});

test("filtering + clear completed", async ({ page }) => {
  await page.getByTestId("filter-active").click();
  await expect(page.getByTestId("counts")).toContainText("active");
  const activeCount = await page.getByTestId("todo-list").locator(":scope > li").count();
  expect(activeCount).toBeGreaterThanOrEqual(1);

  await page.getByTestId("filter-done").click();
  await expect(page.getByTestId("todo-list").locator(":scope > li")).toHaveCount(0);
  await expect(page.getByTestId("empty-state")).toBeVisible();

  await page.getByTestId("filter-all").click();
  // complete one then clear
  const first = page.getByTestId("todo-list").locator("li").first();
  const todoId = (await first.getAttribute("data-testid"))!.replace("todo-", "");
  await page.getByTestId(`toggle-${todoId}`).check();
  await page.getByTestId("clear-completed").click();
  await expect(page.getByTestId(`title-${todoId}`)).toHaveCount(0);
});

test("drag-and-drop reorder via pointer", async ({ page }) => {
  const list = page.getByTestId("todo-list");
  const getIds = () =>
    list.locator(":scope > li").evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-testid")!.replace("todo-", "")),
    );
  const ids = await getIds();
  expect(ids.length).toBeGreaterThanOrEqual(2);
  const before = await Promise.all(ids.map((id) => page.getByTestId(`title-${id}`).textContent()));

  // drag first card's handle onto the second card (pointer sensor, 6px activation)
  const handle = page.getByTestId(`drag-${ids[0]}`);
  const target = page.getByTestId(`todo-${ids[1]}`);
  const hBox = (await handle.boundingBox())!;
  const tBox = (await target.boundingBox())!;
  await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, { steps: 20 });
  await page.mouse.up();

  await expect.poll(getIds).not.toEqual(ids);
  const idsAfter = await getIds();
  expect(idsAfter[1]).toBe(ids[0]);
  const after = await Promise.all(idsAfter.map((id) => page.getByTestId(`title-${id}`).textContent()));
  expect(after).not.toEqual(before);
});

test("responsiveness: mobile 390px stacks with no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("todo-list")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  // form stacks: Add button below input on narrow screens
  const titleBox = await page.getByTestId("new-todo-title").boundingBox();
  const addBox = await page.getByTestId("add-todo").boundingBox();
  expect(addBox!.y).toBeGreaterThanOrEqual(titleBox!.y);

  await page.setViewportSize({ width: 1280, height: 800 });
  const overflowDesktop = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflowDesktop).toBeLessThanOrEqual(1);
});

test("colours: pink light theme applied", async ({ page }) => {
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).toBe("rgb(253, 241, 245)"); // blush-100

  const cardBg = await page
    .getByTestId("todo-list")
    .locator(":scope > li")
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(cardBg).toBe("rgb(255, 249, 251)"); // blush-50

  const headingColor = await page
    .getByRole("heading", { name: /kept minimal/ })
    .evaluate((el) => getComputedStyle(el).color);
  expect(headingColor).toBe("rgb(78, 36, 51)"); // plum-900
});

test("a11y: labels, roles, focus, headings", async ({ page }) => {
  // every input has an accessible name
  const inputs = page.locator("input, textarea");
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const name = await inputs.nth(i).evaluate((el) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const labelled = (el.labels?.length ?? 0) > 0;
        const aria = el.getAttribute("aria-label");
        const labelledBy = el.getAttribute("aria-labelledby");
        return labelled || !!aria || !!labelledBy ? "ok" : el.outerHTML.slice(0, 120);
      }
      return "ok";
    });
    expect(name).toBe("ok");
  }
  await expect(page.getByRole("list", { name: "Todo list" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByRole("link", { name: /skip to todo list/i })).toBeAttached();

  // single h1
  await expect(page.locator("h1")).toHaveCount(1);

  // tab reaches Add control
  await page.getByTestId("new-todo-title").click();
  await page.getByTestId("new-todo-title").fill("focus check");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el?.getAttribute("data-testid") ?? el?.tagName;
  });
  expect(["add-todo", "new-todo-desc", "BUTTON", "TEXTAREA"]).toContain(focused);
});

test("new features: priority, category, search, and pinning", async ({ page }) => {
  // CREATE with priority and category
  await page.getByTestId("new-todo-title").fill("Gym workout");
  await page.getByTestId("category-select-health").click();
  await page.getByTestId("priority-select-high").click();
  await page.getByTestId("add-todo").click();

  const card = page.getByTestId("todo-list").locator("li", { hasText: "Gym workout" });
  await expect(card).toBeVisible();
  await expect(card.getByText("Health")).toBeVisible();
  await expect(card.getByText("high")).toBeVisible();

  // SEARCH filtering
  await page.getByTestId("search-input").fill("Gym");
  await expect(page.getByTestId("todo-list").locator("li")).toHaveCount(1);
  await page.getByTestId("search-input").fill("nonexistentquery123");
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await page.getByTestId("search-input").fill("");

  // PINNING
  const id = (await card.getAttribute("data-testid"))!.replace("todo-", "");
  await page.getByTestId(`pin-${id}`).click();
  await expect(card.getByText("📌 Pinned")).toBeVisible();
});

