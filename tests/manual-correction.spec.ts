import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hepai_onboarded", "true");
    window.localStorage.removeItem("hepai_manual_corrections_v3");
  });
});

test("corrects a low-confidence note and continues to analysis", async ({ page }) => {
  await page.goto("/grading/recognition");
  await expect(page.getByText("已辨識 12 個音符，請先確認")).toBeVisible();
  await expect(page.getByRole("button", { name: "第 2 小節第 3 拍辨識音符" })).toContainText("A3");
  await page.getByRole("button", { name: "辨識有誤，手動修正" }).click();
  await expect(page).toHaveURL(/\/grading\/correct$/);

  await expect(page.getByText("優先確認 1 個低信心音符")).toBeVisible();
  await expect(page.getByTestId("note-editor")).toContainText("低信心 68%");

  await page.getByRole("button", { name: "音高升半音" }).click();
  await expect(page.getByTestId("selected-note-name")).toHaveText("A♯3");

  const savedNote = await page.evaluate(() => {
    const notes = JSON.parse(window.localStorage.getItem("hepai_manual_corrections_v3") ?? "[]");
    return notes.find((note: { id: string }) => note.id === "m2b3-t");
  });
  expect(savedNote).toMatchObject({ voice: "T", midi: 58 });

  await page.getByRole("button", { name: "返回辨識結果" }).click();
  await expect(page).toHaveURL(/\/grading\/recognition$/);
  await expect(page.getByRole("button", { name: "第 2 小節第 3 拍辨識音符" })).toContainText("A♯3");

  await page.getByRole("button", { name: "音符正確，開始分析" }).click();
  await expect(page).toHaveURL(/\/grading\/analysis$/);
  await expect(page.getByText("已套用 1 項手動校正")).toBeVisible();
});
