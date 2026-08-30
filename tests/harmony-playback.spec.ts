import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hepai_onboarded", "true");
    window.localStorage.removeItem("hepai_manual_corrections_v3");
  });
});

test("plays versions, solos a voice, loops error beats, and changes tempo", async ({ page }) => {
  await page.goto("/grading/rewrite");
  await expect(page.locator("svg[aria-labelledby='playback-score-title'] image")).toHaveAttribute(
    "href",
    "/score-original.png"
  );

  await page.getByRole("button", { name: "播放原始版本" }).click();
  await expect(page.getByText("正在播放原始版本 · SATB 全部聲部")).toBeVisible();
  await expect(page.getByText(/播放中：第 2 小節・第 1 拍/)).toBeVisible();
  await page.getByRole("button", { name: "停止原始版本" }).click();

  await page.getByRole("button", { name: "播放聲部 S" }).click();
  await page.getByRole("button", { name: /只播放發生錯誤的兩拍/ }).click();
  await page.getByRole("slider", { name: "播放速度" }).fill("120");
  await expect(page.getByText("120 BPM")).toBeVisible();
  await expect(page.getByText("準備播放 · 錯誤兩拍")).toBeVisible();

  await page.getByRole("button", { name: "播放修正版" }).click();
  await expect(page.getByText("正在播放修正版 · S 聲部")).toBeVisible();
  await expect(page.getByText("綠色＝改寫音")).toBeVisible();
  await expect(page.locator("svg[aria-labelledby='playback-score-title']")).toContainText("T B3");
  await expect(page.getByLabel("播放進度").locator("span")).toHaveCount(2);
});
