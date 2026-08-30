import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('hepai_onboarded', 'true');
  });
});

test('opens a real past paper question, submits an answer, and shows feedback', async ({ page }) => {
  await page.goto('/questions');

  await page.getByRole('button', { name: /114學年度/ }).click();
  await expect(page).toHaveURL(/\/questions\/list\?paper=114-1$/);
  await expect(page.getByText('顯示 25 題')).toBeVisible();

  await page.getByText(/此譜例出自普賽爾/).click();
  await expect(page).toHaveURL(/\/questions\/answer\?id=114-1-01$/);
  await expect(page.getByAltText('114-1-01 題目譜例')).toBeVisible();

  await page.getByRole('button', { name: 'C 歌劇' }).click();
  await page.getByRole('button', { name: '提交答案' }).click();

  await expect(page).toHaveURL(/\/questions\/feedback\?id=114-1-01&selected=2$/);
  await expect(page.getByText('答對了！')).toBeVisible();
  await expect(page.getByText('正確答案：C. 歌劇')).toBeVisible();
});
