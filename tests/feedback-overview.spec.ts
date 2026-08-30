import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hepai_onboarded", "true");
  });
});

test("shows the original score feedback and opens rewrite playback", async ({ page }) => {
  await page.goto("/grading/feedback");

  await expect(page.getByText("分析完成，發現 4 個和聲問題")).toBeVisible();
  await expect(page.locator("svg[aria-labelledby='feedback-score-title'] image")).toHaveAttribute(
    "href",
    "/score-original.png"
  );
  await expect(page.getByTestId("feedback-issue-detail")).toContainText("平行五度");

  await page
    .getByTestId("feedback-issue-navigator")
    .getByRole("button", { name: /連續八度/ })
    .click();
  await expect(page.getByTestId("feedback-issue-detail")).toContainText("連續八度");

  await page.getByRole("button", { name: "比較並播放改寫版本" }).click();
  await expect(page).toHaveURL(/\/grading\/rewrite$/);
  await expect(page.getByRole("region", { name: "四部和聲聲音播放" })).toBeVisible();
});
