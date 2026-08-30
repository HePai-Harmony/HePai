import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hepai_onboarded", "true");
  });
});

test("secondary upload actions remain available and recent work appears only after recognition", async ({ page }) => {
  await page.goto("/grading/upload");
  await page.evaluate(() => {
    window.localStorage.removeItem("hepai_demo_recent_works");
  });

  await page.getByRole("button", { name: "從相簿選擇樂譜" }).click();
  await expect(page).toHaveURL(/\/grading\/process$/);

  await page.goto("/grading");
  await expect(page.getByText("拍攝示範｜四部和聲批改")).toHaveCount(0);

  await page.goto("/grading/upload");
  await page.getByRole("button", { name: "上傳檔案或 PDF" }).click();
  await expect(page.getByText("選擇頁面")).toBeVisible();
  await page.getByRole("button", { name: "第 1 頁" }).click();
  await expect(page).toHaveURL(/\/grading\/process$/);

  await page.waitForURL(/\/grading\/recognition$/);
  await expect(page.getByText("已辨識 12 個音符，請先確認")).toBeVisible();

  await page.goto("/grading");
  await expect(page.getByText("拍攝示範｜四部和聲批改")).toBeVisible();
});
