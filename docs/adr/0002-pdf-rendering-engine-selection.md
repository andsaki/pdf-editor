# ADR 0002: PDFレンダリングエンジンの選定

## ステータス

採用済み（ハイブリッド方式）

## 日付

2025-10-03

## Context

本アプリケーションでは、ユーザーが作成した請求書レイアウトを高品質なPDFとして出力する機能が必須です。これを実現するための要件は以下です：

- ブラウザプレビューとPDF出力の見た目が一致すること（WYSIWYG）
- 複雑なレイアウト（絶対配置、テーブル、日本語テキスト）を正確に再現できること
- レスポンス速度とPDF品質のバランスが取れていること
- 開発・運用コストが許容範囲内であること

当初は `@react-pdf/renderer` を採用していましたが、以下の課題が顕在化しました：

1. **レンダリング制約**: 独自のレイアウトエンジンを使用しており、標準CSSの一部機能（Grid、高度なFlexbox）に非対応
2. **座標系の差異**: ブラウザプレビューとPDF出力で座標系が異なり、微妙なズレが発生
3. **日本語フォント**: カスタムフォントの組み込みが複雑で、デフォルトでは日本語表示に制約
4. **デバッグ困難**: PDF生成エラーの原因特定が困難

## References

- [@react-pdf/renderer](https://react-pdf.org/)
- [Puppeteer](https://pptr.dev/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [PDFMake](https://pdfmake.org/)

## Considered Options

今回の意思決定にあたり、以下のオプションを検討しました：

1. **@react-pdf/renderer のみ使用**
2. **Puppeteer のみ使用**
3. **@react-pdf/renderer + Puppeteer のハイブリッド方式**
4. **jsPDF**
5. **PDFMake**
6. **商用PDFサービス（DocRaptor、PDFShift等）**

## Comparison Table

| 比較項目 | @react-pdf/renderer | Puppeteer | ハイブリッド | jsPDF | PDFMake | 商用サービス |
|---------|---------------------|-----------|--------------|-------|---------|--------------|
| レンダリング精度 | 中 | 高 | 高 | 低 | 中 | 高 |
| CSS対応 | 部分的 | 完全 | 完全 | 低 | 低 | 完全 |
| 日本語対応 | 要フォント組込 | ネイティブ | ネイティブ | 要フォント組込 | 要フォント組込 | ネイティブ |
| 生成速度 | 高速（<500ms） | 低速（2-5秒） | 選択可能 | 高速 | 高速 | 中速 |
| パッケージサイズ | 小（~2MB） | 大（~300MB） | 大 | 小 | 小 | N/A |
| サーバー負荷 | なし | 高 | 高 | なし | なし | なし |
| コスト | 無料 | 無料 | 無料 | 無料 | 無料 | 有料 |
| WYSIWYG | △ | ◎ | ◎ | × | △ | ◎ |
| 絶対配置対応 | ◯ | ◎ | ◎ | △ | × | ◎ |
| 学習コスト | 中 | 低 | 中 | 高 | 高 | 低 |

## Discussion

### Option A: @react-pdf/renderer のみ使用

#### 👍 Pros
- クライアントサイドで完結し、サーバーリソース不要
- 軽量で高速なPDF生成（~500ms）
- Reactコンポーネントとして記述できるため、既存の開発フローに馴染む
- デプロイが簡単（追加の依存関係不要）

#### 👎 Cons
- 独自レイアウトエンジンによる制約（Grid、複雑なFlexbox非対応）
- プレビューとPDF出力で見た目が異なる可能性
- 日本語フォント対応に手間がかかる
- デバッグが困難（エラーメッセージが不明瞭）
- 絶対配置の座標計算が複雑

### Option B: Puppeteer のみ使用

#### 👍 Pros
- ブラウザレンダリングと完全一致（WYSIWYG保証）
- 標準CSS完全対応（Grid、Flexbox、カスタムプロパティ等）
- システムフォントを使用し、日本語が自然に表示
- デバッグが容易（ブラウザDevToolsと同じ）
- 将来的にスクリーンショット生成等に拡張可能

#### 👎 Cons
- パッケージサイズが大（~300MB）
- PDF生成に時間がかかる（2-5秒）
- サーバーメモリ消費が大（ブラウザインスタンス起動）
- 同時リクエスト処理に制約
- Dockerデプロイ時に追加設定必要（Chrome依存関係）

### Option C: @react-pdf/renderer + Puppeteer のハイブリッド方式（採用案）

#### 👍 Pros
- ユースケースに応じて最適な方式を選択可能
  - **高速生成が必要**: react-pdf
  - **高品質が必要**: Puppeteer
- 段階的な移行が可能（react-pdfから始めてPuppeteerを追加）
- 既存実装を破棄せず、新機能として追加できる
- ユーザーにメリット・デメリットを理解した上で選択させられる

#### 👎 Cons
- 2つのPDF生成ロジックを保守する必要がある
- コードベースが複雑化
- 初期セットアップコストが高い
- サーバーリソースは依然として必要

### Option D: jsPDF

#### 👍 Pros
- 軽量でシンプル
- クライアントサイドで完結

#### 👎 Cons
- 低レベルAPIのため実装コストが高い
- HTML/CSSからの自動変換機能がない
- 絶対配置の実装が煩雑

**却下理由**: 実装コストとメンテナンス性の観点から不適切

### Option E: PDFMake

#### 👍 Pros
- 宣言的なAPI
- テーブル生成に強い

#### 👎 Cons
- 絶対配置に対応していない
- 本アプリケーションの要件（自由なレイアウト編集）を満たせない

**却下理由**: 絶対配置非対応のため要件を満たさない

### Option F: 商用PDFサービス（DocRaptor、PDFShift等）

#### 👍 Pros
- インフラ管理不要
- 高品質なレンダリング
- スケーラビリティが高い

#### 👎 Cons
- 継続的なコスト発生（月額 $50-500+）
- 外部サービス依存によるリスク
- データプライバシー懸念（請求書データを外部送信）
- ベンダーロックイン

**却下理由**: コスト増加とデータプライバシーの懸念

## Decision

**Option C: @react-pdf/renderer + Puppeteer のハイブリッド方式** を採用します。

### 実装詳細

#### UIでの選択肢提供
```typescript
// 2つのボタンをUIに配置
<Button onClick={openPdfInNewTab}>
  プレビュー (React-PDF) - 高速
</Button>
<Button onClick={openPdfWithPuppeteer}>
  プレビュー (Puppeteer) - 高品質
</Button>
```

#### サーバーサイド実装
```typescript
// GraphQL Mutation
generatePdf: async (_: any, { html }: { html: string }) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
    return Buffer.from(pdfBuffer).toString('base64');
  } finally {
    await browser.close();
  }
}
```

#### クライアントサイド実装
```typescript
const generateHtmlFromLayout = (data: InvoiceData): string => {
  // レイアウトデータからHTMLを生成
  const itemsHtml = data.layout
    .filter(item => item.visible !== false)
    .map(item => {
      if (item.type === 'text') {
        return `<div style="position: absolute; left: ${item.x}px; top: ${item.y}px; ...">${item.content}</div>`;
      }
      // 他のアイテムタイプも同様に処理
    })
    .join('');

  return `<!DOCTYPE html>
    <html>
      <head><style>/* スタイル定義 */</style></head>
      <body><div class="page">${itemsHtml}</div></body>
    </html>`;
};
```

### 使い分けガイドライン

| ユースケース | 推奨方式 | 理由 |
|-------------|---------|------|
| クイックプレビュー | React-PDF | 高速生成でストレスなく確認 |
| 最終出力・印刷用 | Puppeteer | 高品質で正確なレンダリング |
| メール添付用 | React-PDF | ファイルサイズ小、生成高速 |
| 複雑なレイアウト | Puppeteer | CSS完全対応で確実に再現 |

## Consequences

### ポジティブな影響

1. **柔軟性**: ユースケースに応じた最適な方式選択
2. **段階的移行**: 既存実装を保持しながら新機能追加
3. **品質保証**: 重要なPDFはPuppeteerで確実に生成
4. **開発速度**: react-pdfで素早くイテレーション、Puppeteerで最終調整

### ネガティブな影響・対処法

#### 1. サーバーリソース消費
**影響**: Puppeteerによるメモリ・CPU使用量増加

**対処法**:
- ブラウザインスタンスのプール化
- 同時実行数の制限（例: 5並列まで）
- タイムアウト設定（30秒）
- メモリ監視とアラート設定

#### 2. パッケージサイズ増加
**影響**: Dockerイメージが~300MB増加

**対処法**:
- マルチステージビルドで最適化
- 本番環境のみPuppeteer同梱
- CDN経由でのブラウザバイナリ取得検討

#### 3. デプロイ複雑化
**影響**: Chrome依存関係の追加設定が必要

**対処法**:
```dockerfile
# Dockerfile例
FROM node:18-slim
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-ipafont-mincho \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

#### 4. メンテナンスコスト
**影響**: 2つのPDF生成ロジック保守が必要

**対処法**:
- 共通のレイアウトデータ構造を定義
- HTML生成ロジックを共通化
- 統合テストで両方式の出力を検証

#### 5. レスポンス時間
**影響**: Puppeteerは2-5秒かかる

**対処法**:
- ローディングインジケーター表示
- 非同期処理でUIブロックを回避
- キャッシング戦略（同一レイアウトの再生成回避）

### モニタリング指標

運用上、以下の指標を監視します：

- **PDF生成時間**: P50、P95、P99
- **サーバーメモリ使用量**: ピーク値
- **エラー率**: react-pdf vs Puppeteer
- **利用率**: 各方式の選択比率

### 今後の検討事項

1. **Puppeteerのデフォルト化**: 品質が十分であれば、Puppeteerを標準とし、react-pdfをフォールバックに
2. **サーバーレス化**: AWS Lambda + Puppeteer Layerでの実行
3. **キューイング**: 大量リクエスト時のキュー処理（Redis + Bull）
4. **プリレンダリング**: 頻繁に使われるテンプレートのキャッシュ

## 参考資料

- [Puppeteer Documentation](https://pptr.dev/)
- [@react-pdf/renderer Limitations](https://react-pdf.org/advanced#limitations)
- [Puppeteer Performance Best Practices](https://pptr.dev/guides/performance)
- [Docker + Puppeteer Setup Guide](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker)
