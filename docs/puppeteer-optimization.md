# Puppeteer 最適化戦略

## 目次
1. [ブラウザ間の差異問題](#ブラウザ間の差異問題)
2. [軽量化戦略](#軽量化戦略)
3. [デプロイ環境別の最適化](#デプロイ環境別の最適化)
4. [スケーラビリティ向上](#スケーラビリティ向上)
5. [推奨実装](#推奨実装)

---

## ブラウザ間の差異問題

### 課題
Puppeteer（Chromium）で生成したPDFは、Safari/Firefoxと比較して：
- フォントレンダリングの微妙な違い
- 余白・行間の計算差異
- CSS解釈の若干の相違

### 対策

#### 1. フォント埋め込み
```css
/* Web Fontsを明示的に指定 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap');

body {
  font-family: 'Noto Sans JP', 'BIZ UDPGothic', sans-serif;
}
```

#### 2. PDF専用CSS
```css
/* Puppeteer用スタイル調整 */
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .invoice-container {
    /* 余白を明示的に指定 */
    padding: 20mm 15mm;
  }
}
```

#### 3. ビジュアルリグレッションテスト（複数ブラウザ対応）

Playwrightは**Chromium、Firefox、WebKit（Safari）**の3つのブラウザエンジンでスクリーンショットを比較できます。

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('請求書PDFプレビューのブラウザ間一貫性', async ({ page, browserName }) => {
  // 請求書プレビューページを開く
  await page.goto('/invoice-preview');

  // フォント読み込み待機
  await page.waitForLoadState('networkidle');

  // ブラウザごとのスクリーンショット比較
  // chromium-invoice.png, firefox-invoice.png, webkit-invoice.png が生成される
  await expect(page).toHaveScreenshot(`${browserName}-invoice.png`, {
    maxDiffPixels: 100,  // 許容する差分ピクセル数
    threshold: 0.2,      // 許容する差分割合（0-1）
  });
});

test('Puppeteer生成PDFとブラウザ表示の差分検出', async ({ page }) => {
  await page.goto('/invoice-preview');

  // 1. ブラウザ表示のスクリーンショット
  const browserScreenshot = await page.screenshot({ fullPage: true });

  // 2. Puppeteer生成PDFをPNG変換して比較
  // （実装例は後述）
  const puppeteerPDF = await fetch('/api/generate-pdf-puppeteer', {
    method: 'POST',
    body: JSON.stringify({ invoiceId: '123' })
  });

  // pdf-lib等でPDF→PNG変換後、画像差分を計算
  // pixelmatch等のライブラリで差分ピクセル数を計測
});
```

**ブラウザ別スクリーンショットの活用例:**

```bash
# テスト実行
pnpm test:e2e

# 生成されるファイル
tests/__screenshots__/
  chromium-invoice.png        # Chromiumでの表示
  firefox-invoice.png          # Firefoxでの表示
  webkit-invoice.png           # WebKit(Safari)での表示

# 差分が出た場合
tests/__screenshots__/
  chromium-invoice-diff.png    # 差分を赤くハイライト
  chromium-invoice-actual.png  # 実際の表示
  chromium-invoice-expected.png # 期待する表示
```

**ブラウザ間の差分を可視化:**

```typescript
// ブラウザ間の差分を数値化
import { test } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';

test('ブラウザ間のフォントレンダリング差分を計測', async ({ page, browserName }) => {
  await page.goto('/invoice-preview');
  const screenshot = await page.screenshot();

  // スクリーンショットを保存
  const filename = `screenshot-${browserName}.png`;
  fs.writeFileSync(filename, screenshot);

  // Chromiumをベースラインとして他ブラウザと比較
  if (browserName !== 'chromium') {
    const baseImg = PNG.sync.read(fs.readFileSync('screenshot-chromium.png'));
    const testImg = PNG.sync.read(screenshot);
    const { width, height } = baseImg;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      baseImg.data,
      testImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    console.log(`${browserName}とChromiumの差分: ${numDiffPixels}ピクセル`);

    // 差分画像を保存
    fs.writeFileSync(`diff-${browserName}.png`, PNG.sync.write(diff));
  }
});
```

**実行結果例:**
```
✓ chromium: 請求書PDFプレビューのブラウザ間一貫性 (1.2s)
✓ firefox: 請求書PDFプレビューのブラウザ間一貫性 (1.4s)
  → firefoxとChromiumの差分: 234ピクセル（主にフォントレンダリング）
✓ webkit: 請求書PDFプレビューのブラウザ間一貫性 (1.1s)
  → webkitとChromiumの差分: 567ピクセル（フォント+余白）
```

このテストにより、Puppeteer（Chromium）で生成したPDFが他ブラウザでどう見えるか、定量的に評価できます。

---

## 軽量化戦略

### A. `puppeteer` → `puppeteer-core`

#### 通常版（Chromium同梱）
```bash
npm install puppeteer  # ~300MB
```

#### Core版（Chromium別途管理）
```bash
npm install puppeteer-core  # ~2MB
```

**使用例:**
```typescript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

**メリット:**
- バンドルサイズが劇的に削減（~98%削減）
- Chromiumバイナリを環境に応じて切り替え可能
- Dockerレイヤーキャッシュが効きやすい

---

### B. サーバーレス最適化版Chromium

#### インストール
```bash
npm install puppeteer-core @sparticuz/chromium
```

#### 使用例
```typescript
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function generatePDF(html: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
}
```

**特徴:**
- AWS Lambda/Vercel最適化済み（~50MB）
- 日本語フォント対応
- 自動で実行環境を検出

---

## デプロイ環境別の最適化

### A. Docker環境

#### Dockerfile例
```dockerfile
FROM node:18-slim

# Chromiumと依存関係を一度だけインストール（キャッシュ）
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-cjk \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Puppeteerの設定
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "dist/server.js"]
```

**メリット:**
- Chromiumバイナリをレイヤーキャッシュ（再デプロイ時にダウンロード不要）
- ビルド時間短縮
- イメージサイズ削減

#### docker-compose.yml
```yaml
version: '3.8'
services:
  server:
    build: ./server
    environment:
      - NODE_ENV=production
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    volumes:
      - ./server:/app
    ports:
      - "4000:4000"
```

---

### B. AWS Lambda

#### Lambda Layer構成
```
Layer 1: Chromium（@sparticuz/chromium）
Layer 2: node_modules（puppeteer-core）
関数コード: ビジネスロジックのみ
```

#### 実装例
```typescript
import { Handler } from 'aws-lambda';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const handler: Handler = async (event) => {
  // Chromiumの起動
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath('/opt/chromium'),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();

    // HTMLからPDF生成
    await page.setContent(event.html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    };
  } finally {
    await browser.close();
  }
};
```

#### serverless.yml例
```yaml
service: invoice-pdf-generator

provider:
  name: aws
  runtime: nodejs18.x
  memorySize: 1536  # Chromium用にメモリ増量
  timeout: 30

functions:
  generatePDF:
    handler: src/handler.generatePDF
    layers:
      - arn:aws:lambda:ap-northeast-1:xxx:layer:chromium:1

plugins:
  - serverless-offline
```

---

### C. Vercel Functions

#### Vercel Functions実装
```typescript
// api/generate-pdf.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(req.body.html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdf);
  } finally {
    await browser.close();
  }
}
```

#### vercel.json設定
```json
{
  "functions": {
    "api/generate-pdf.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**注意点:**
- Vercel Functionsは実行時間制限あり（Hobby: 10秒、Pro: 60秒）
- メモリ制限も考慮が必要

---

## スケーラビリティ向上

### A. ブラウザインスタンスの再利用

#### アンチパターン（遅い）
```typescript
// リクエスト毎にブラウザ起動 → 起動に3-5秒かかる
async function generatePDF(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf();
  await browser.close();  // 毎回閉じる
  return pdf;
}
```

#### ベストプラクティス（高速）
```typescript
// ブラウザインスタンスを再利用
class PDFGenerator {
  private browser: Browser | null = null;

  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
    }
    return this.browser;
  }

  async generatePDF(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();  // ページのみ作成（高速）

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4' });
      return pdf;
    } finally {
      await page.close();  // ページだけ閉じる（ブラウザは維持）
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// シングルトンとして使用
export const pdfGenerator = new PDFGenerator();

// アプリ終了時にクリーンアップ
process.on('SIGTERM', async () => {
  await pdfGenerator.cleanup();
});
```

**パフォーマンス比較:**
- ブラウザ起動毎: 3-5秒/リクエスト
- ブラウザ再利用: 0.3-0.5秒/リクエスト（**約10倍高速**）

---

### B. リモートブラウザサービス（本番向け）

#### Browserless.io使用例
```typescript
import puppeteer from 'puppeteer-core';

async function generatePDFWithBrowserless(html: string) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
  });

  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.disconnect();

  return pdf;
}
```

#### 主要サービス比較

| サービス | 特徴 | 価格 |
|---------|------|------|
| **Browserless.io** | Puppeteer特化、スケーラブル | $50~/月 |
| **Playwright on Lambda** | AWS Lambda統合 | AWS料金 |
| **ScrapingBee** | スクレイピング特化 | $49~/月 |

**メリット:**
- サーバーレス制約を完全回避
- 自動スケーリング
- メンテナンス不要
- 高可用性

**デメリット:**
- 外部依存が増える
- コスト（大量処理時）
- レイテンシ増加の可能性

---

## 推奨実装

### このプロジェクト向けの実装例

```typescript
// server/src/services/pdfGenerator.ts
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

class PDFGeneratorService {
  private browser: Browser | null = null;

  /**
   * ブラウザインスタンスを取得（再利用）
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    // 環境に応じてChromiumパスを切り替え
    const executablePath = process.env.NODE_ENV === 'production'
      ? await chromium.executablePath()
      : process.env.CHROMIUM_PATH || '/usr/bin/chromium';

    this.browser = await puppeteer.launch({
      args: process.env.NODE_ENV === 'production'
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
    });

    return this.browser;
  }

  /**
   * 請求書PDFを生成
   */
  async generateInvoicePDF(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // HTMLをロード（フォント読み込み待機）
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // PDF生成（A4、余白統一）
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: false,
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  /**
   * ブラウザインスタンスをクリーンアップ
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// シングルトンエクスポート
export const pdfGenerator = new PDFGeneratorService();

// プロセス終了時のクリーンアップ
process.on('SIGTERM', async () => {
  await pdfGenerator.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await pdfGenerator.cleanup();
  process.exit(0);
});
```

### GraphQL Resolver例
```typescript
// server/src/resolvers/pdfResolver.ts
import { pdfGenerator } from '../services/pdfGenerator';
import { renderInvoiceHTML } from '../services/htmlRenderer';

export const pdfResolvers = {
  Mutation: {
    generateInvoicePDF: async (_: any, { invoiceId }: { invoiceId: string }) => {
      // 1. 請求書データを取得
      const invoice = await getInvoiceById(invoiceId);

      // 2. HTMLをレンダリング
      const html = renderInvoiceHTML(invoice);

      // 3. PDFを生成
      const pdf = await pdfGenerator.generateInvoicePDF(html);

      // 4. Base64エンコードして返却
      return {
        pdf: pdf.toString('base64'),
        filename: `invoice_${invoiceId}.pdf`,
      };
    },
  },
};
```

---

## 環境別の推奨構成まとめ

| 環境 | 推奨パッケージ | Chromium | サイズ削減 | 起動速度 |
|------|--------------|----------|-----------|---------|
| **ローカル開発** | `puppeteer`（フル版） | 同梱 | - | 普通 |
| **Docker** | `puppeteer-core` + システムChromium | apt-get | ~90% | 高速 |
| **AWS Lambda** | `puppeteer-core` + `@sparticuz/chromium` | Layer | ~95% | 高速 |
| **Vercel** | `puppeteer-core` + `@sparticuz/chromium-min` | 同梱 | ~95% | 高速 |
| **大規模本番** | `puppeteer-core` + Browserless.io | リモート | ~99% | 超高速 |

---

## 次のステップ

1. **ローカル開発**: `puppeteer-core` + システムChromiumで動作確認
2. **Docker化**: Dockerfileを作成してビルド最適化
3. **本番環境選定**: Vercel/AWS Lambda/自前サーバーから選択
4. **パフォーマンステスト**: 負荷テストで最適なメモリ設定を決定
5. **監視**: PDF生成時間・成功率をモニタリング

---

## 参考リンク

- [Puppeteer公式ドキュメント](https://pptr.dev/)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)
- [Browserless.io](https://www.browserless.io/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
