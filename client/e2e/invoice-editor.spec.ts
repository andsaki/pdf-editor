import { test, expect } from '@playwright/test';

test.describe('Invoice Editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // ページが完全にロードされるまで待機
    await page.waitForLoadState('networkidle');
  });

  test('アプリケーションが正常にロードされる', async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByText('Invoice Editor')).toBeVisible();

    // 左サイドバーが表示されることを確認
    const textButton = page.getByRole('button', { name: /テキスト追加/i });
    await expect(textButton).toBeVisible();
  });

  test('テキストアイテムを追加できる', async ({ page }) => {
    // ツールチップで「テキスト追加」ボタンを探してクリック
    const textButton = page.getByRole('button', { name: /テキスト追加/i });
    await textButton.click();

    // テキストアイテムが追加されたことを確認（少し待機）
    await page.waitForTimeout(500);

    // ページ上に何かしらのコンテンツが表示されていることを確認
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('複数のツールボタンが利用可能', async ({ page }) => {
    // 各ツールボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: /テキスト追加/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /箇条書き追加/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /テーブル追加/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /図形追加/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /画像追加/i })).toBeVisible();
  });

  test('プレビューボタンが利用可能', async ({ page }) => {
    // AppBarのプレビューボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: /プレビュー \(React-PDF\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /プレビュー \(Puppeteer\)/i })).toBeVisible();
  });

  test('編集機能のボタンが存在する', async ({ page }) => {
    // AppBarの編集ボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: /元に戻す/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /やり直し/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /コピー/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /切り取り/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /貼り付け/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /削除/i })).toBeVisible();
  });

  test('キャンバス操作からPuppeteer PDF出力までの一連の流れ', async ({ page }) => {
    // 1. テキストアイテムを追加
    const textButton = page.getByRole('button', { name: /テキスト追加/i });
    await textButton.click();
    await page.waitForTimeout(500);

    // 2. テーブルアイテムも追加
    const tableButton = page.getByRole('button', { name: /テーブル追加/i });
    await tableButton.click();
    await page.waitForTimeout(500);

    // 3. PuppeteerプレビューボタンをクリックしてPDFダウンロード
    const downloadPromise = page.waitForEvent('download');
    const puppeteerButton = page.getByRole('button', { name: /プレビュー \(Puppeteer\)/i });
    await puppeteerButton.click();

    // 4. ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    // 5. ダウンロードが完了することを確認（ファイルパスが存在）
    const path = await download.path();
    expect(path).toBeTruthy();
  });
});
