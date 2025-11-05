import { test, expect } from '@playwright/test';

test.describe('ビジュアルリグレッションテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('PDFプレビューのブラウザ間一貫性', async ({ page, browserName }) => {
    // テキストアイテムを追加
    const textButton = page.getByRole('button', { name: /テキスト追加/i });
    await textButton.click();
    await page.waitForTimeout(500);

    // テーブルアイテムも追加
    const tableButton = page.getByRole('button', { name: /テーブル追加/i });
    await tableButton.click();
    await page.waitForTimeout(500);

    // フォント読み込み待機
    await page.waitForLoadState('networkidle');

    // ブラウザごとのスクリーンショット比較
    // chromium-pdf-preview.png, firefox-pdf-preview.png, webkit-pdf-preview.png が生成される
    await expect(page).toHaveScreenshot(`${browserName}-pdf-preview.png`, {
      maxDiffPixels: 100,  // 許容する差分ピクセル数
      threshold: 0.2,      // 許容する差分割合（0-1）
    });
  });

  test('UIコンポーネントの表示一貫性', async ({ page, browserName }) => {
    // 左サイドバーのスクリーンショット
    const leftSidebar = page.locator('aside').first();
    await expect(leftSidebar).toHaveScreenshot(`${browserName}-left-sidebar.png`, {
      maxDiffPixels: 50,
    });

    // AppBarのスクリーンショット
    const appBar = page.locator('header').first();
    await expect(appBar).toHaveScreenshot(`${browserName}-app-bar.png`, {
      maxDiffPixels: 50,
    });
  });

  test('レイアウトアイテム追加後のキャンバス表示', async ({ page, browserName }) => {
    // 複数アイテムを追加
    await page.getByRole('button', { name: /テキスト追加/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /箇条書き追加/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /テーブル追加/i }).click();
    await page.waitForTimeout(500);

    // キャンバス全体のスクリーンショット
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    await expect(page).toHaveScreenshot(`${browserName}-canvas-with-items.png`, {
      maxDiffPixels: 200,
      fullPage: true,
    });
  });
});

test.describe('レスポンシブデザインテスト', () => {
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name}サイズでの表示確認`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // テキストアイテムを追加
      await page.getByRole('button', { name: /テキスト追加/i }).click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(
        `${browserName}-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        {
          maxDiffPixels: 150,
          fullPage: true,
        }
      );
    });
  }
});
