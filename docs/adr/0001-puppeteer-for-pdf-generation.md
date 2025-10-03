# ADR 0001: Puppeteer統合によるサーバーサイドPDF生成

## ステータス

採用済み

## 日付

2025-10-03

## コンテキスト

請求書エディタアプリケーションでは、ユーザーが作成したレイアウトをPDF形式でエクスポートする機能が必要です。当初は `@react-pdf/renderer` をクライアント側で使用していましたが、以下の課題がありました：

1. **レンダリングの制約**: `@react-pdf/renderer`は独自のレイアウトエンジンを使用しており、標準的なCSSの一部機能（特にGrid、高度なFlexbox）に対応していない
2. **日本語フォント**: カスタムフォントの組み込みが複雑で、日本語表示の品質に課題がある
3. **プレビューとの差異**: ブラウザでのプレビュー表示とPDF出力で見た目が異なる可能性がある
4. **複雑なレイアウト**: テーブルや絶対配置を含む複雑なレイアウトの再現性に限界がある

## 決定

サーバーサイドでPuppeteerを使用したPDF生成機能を追加することを決定しました。

### 実装内容

1. **Puppeteerの導入**: サーバー側にPuppeteerをインストール
2. **GraphQL Mutation**: `generatePdf(html: String!): String` mutationを追加
3. **HTML生成**: クライアント側でレイアウトからHTMLを生成
4. **PDF生成フロー**:
   - クライアントがHTMLを生成
   - サーバーにGraphQL mutationで送信
   - Puppeteerでブラウザレンダリング後PDF化
   - Base64エンコードしてクライアントに返却

### 技術的詳細

```typescript
// サーバー側
generatePdf: async (_: any, { html }: { html: string }) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return Buffer.from(pdfBuffer).toString('base64');
}
```

## 影響

### 利点

1. **レンダリング精度**: ブラウザと完全に同じレンダリング結果
2. **CSS完全対応**: 標準的なCSS機能をすべて利用可能
3. **日本語対応**: システムフォントを使用し、日本語を正確に表示
4. **WYSIWYG**: プレビュー画面とPDF出力が完全に一致
5. **拡張性**: 将来的にスクリーンショット生成など他の機能にも活用可能

### 欠点

1. **パッケージサイズ**: Puppeteerは約300MBと大きい
2. **メモリ使用量**: ブラウザインスタンスの起動でサーバーリソースを消費
3. **レイテンシ**: PDF生成に数秒かかる可能性
4. **デプロイ考慮**: Dockerコンテナでは追加の依存関係設定が必要

### 既存機能との共存

- `@react-pdf/renderer` による既存のPDF生成機能は維持
- ユーザーは2つの方法から選択可能
  - 「プレビュー (React-PDF)」: 軽量・高速
  - 「プレビュー (Puppeteer)」: 高品質・正確

## 代替案

### 1. PDFMake
- **却下理由**: レイアウトの柔軟性が低く、絶対配置に対応していない

### 2. jsPDF
- **却下理由**: 低レベルAPIで実装コストが高い、HTML/CSSからの変換が困難

### 3. クラウドサービス (DocRaptor, PDFShift等)
- **却下理由**: コスト増加、外部依存、データプライバシーの懸念

### 4. @react-pdf/rendererの継続使用のみ
- **却下理由**: 上記のレンダリング制約を解決できない

## 今後の考慮事項

1. **パフォーマンス最適化**
   - ブラウザインスタンスのプール化
   - キャッシング戦略の検討

2. **スケーラビリティ**
   - 同時PDF生成リクエストの制限
   - キュー機構の導入

3. **Docker対応**
   - Chromeの依存関係を含むDockerイメージの作成
   - 軽量化の検討

4. **モニタリング**
   - PDF生成時間の計測
   - エラーレート追跡

## 参考資料

- [Puppeteer Documentation](https://pptr.dev/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [@react-pdf/renderer Limitations](https://react-pdf.org/advanced#limitations)
