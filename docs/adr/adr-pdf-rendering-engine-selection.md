ADR: PDF の出力方式の選定
Context
意思決定の背景、及び目的

本アプリケーションでは、ユーザーが作成した請求書レイアウトを 高品質な PDF として出力する機能 が必須です。これを実現するための要件は以下です：
WYSIWYG: ブラウザプレビューと PDF 出力の見た目が一致すること
複雑レイアウトの再現: 絶対配置・テーブル・日本語テキストなどを正確に扱えること
パフォーマンス: レスポンス速度と品質のバランスが取れていること
コスト: 開発・運用コストが許容範囲内であること

@react-pdf/renderer
Puppeteer
jsPDF
Considered Options

1. **Option A:** @react-pdf/renderer のみ使用
2. **Option B:** Puppeteer のみ使用
3. **Option C:** jsPDF
Comparison Table

| 比較項目 | A: @react-pdf/renderer | B: Puppeteer | C: jsPDF |
|---------|----------------------|--------------|----------|
| **出力方式** | Reactコンポーネント | ヘッドレスChrome | JavaScript直接生成 |
| **WYSIWYG** | △ 差異あり得る | ◎ 完全一致 | × 低 |
| **日本語対応** | フォント組込必要 | システムフォント使用可 | フォント組込必要 |
| **生成速度** | ◎ 高速（<500ms） | △ 低速（2-5秒） | ◎ 高速（<300ms） |
| **パッケージサイズ** | 小（~2MB） | 大（~300MB） | 極小（~500KB） |
| **サーバー負荷** | なし | 高 | なし |
| **複雑レイアウト** | ◯ 対応 | ◎ 完全対応 | △ 制限あり |
| **学習コスト** | 中 | 低 | 高 |
| **開発工数** | 中 | 低 | 高 |
| **コスト** | 無料 | 無料 | 無料 |

Option A: @react-pdf/renderer
👍 Pros
クライアントサイドで完結し、サーバーリソース不要
軽量で高速な PDF 生成（~500ms）

👎 Cons
独自レイアウトエンジンによる制約（Grid、複雑な Flexbox 非対応）
プレビューと PDF 出力で見た目が異なる可能性
日本語フォント対応に手間がかかる
絶対配置の座標計算が複雑
Option B: Puppeteer
👍 Pros
ブラウザレンダリングと完全一致（WYSIWYG 保証）
標準 CSS 完全対応（Grid、Flexbox、カスタムプロパティ等）
システムフォントを使用し、日本語が自然に表示
デバッグが容易（ブラウザ DevTools と同じ）

👎 Cons
パッケージサイズが大（~300MB）
PDF 生成に時間がかかる（2-5 秒）
サーバーメモリ消費が大（ブラウザインスタンス起動）

Option C: jsPDF
👍 Pros
非常に軽量（~500KB）
クライアントサイドで完結
高速生成（<300ms）
低レベルAPIで細かい制御が可能

👎 Cons
低レベルAPIのため実装コストが非常に高い
座標計算、テキスト配置、改行処理など全て手動実装
HTML/CSSからの自動変換機能がない
複雑なレイアウトの実装が困難
WYSIWYGが実現困難（プレビューとPDFが別実装）

Discussion

### jsPDF却下の理由

**実装例で見る複雑さ:**

```javascript
// jsPDFの場合: 全て手動実装
const doc = new jsPDF();

// テキスト配置（Y座標を自分で計算）
doc.text('請求書', 100, 50);
doc.text('株式会社XXX 御中', 100, 70);

// 改行処理も自前
const longText = 'これは長いテキストです...';
const splitText = doc.splitTextToSize(longText, 180);
doc.text(splitText, 100, 90);

// テーブルも手動で線を引く
doc.line(20, 150, 190, 150); // 横線
doc.line(20, 150, 20, 200);  // 縦線
// ... 全ての線を個別に描画

// フォント設定も複雑
doc.addFont('path/to/font.ttf', 'CustomFont', 'normal');
doc.setFont('CustomFont');
```

**@react-pdf/rendererの場合:**

```jsx
<Document>
  <Page>
    <Text>請求書</Text>
    <Text>株式会社XXX 御中</Text>
    <Text>{longText}</Text>  {/* 自動改行 */}
    <View style={{ flexDirection: 'row' }}>  {/* テーブル */}
      <Text>項目</Text>
      <Text>金額</Text>
    </View>
  </Page>
</Document>
```

**Puppeteerの場合:**

```typescript
const html = `
  <div>
    <h1>請求書</h1>
    <p>株式会社XXX 御中</p>
    <p>${longText}</p>
    <table>
      <tr><td>項目</td><td>金額</td></tr>
    </table>
  </div>
`;
await page.setContent(html);
await page.pdf();
```

### 工数比較

| タスク | jsPDF | @react-pdf/renderer | Puppeteer |
|-------|-------|-------------------|-----------|
| テキスト配置 | 座標計算必要 | コンポーネントで配置 | HTMLで配置 |
| 改行処理 | 手動計算 | 自動 | 自動 |
| テーブル | 線を1本ずつ描画 | コンポーネント | HTMLテーブル |
| 日本語フォント | 手動組込+設定 | Font.register() | システムフォント |
| 総開発工数 | **6ヶ月** | **2ヶ月** | **1ヶ月** |

### 要件との適合性

| 要件 | jsPDF | @react-pdf | Puppeteer |
|-----|-------|-----------|-----------|
| WYSIWYG | × | △ | ◎ |
| 複雑レイアウト | △ | ◯ | ◎ |
| 開発速度 | × | ◯ | ◎ |
| 実行速度 | ◎ | ◎ | △ |

**結論:** jsPDFは軽量だが、実装コストが高すぎるため却下

Decision

**Option B: Puppeteer を採用**

### 採用理由

1. **完全なWYSIWYG**: ブラウザプレビューとPDF出力が100%一致
2. **開発効率**: HTML/CSSの知識だけで実装可能、学習コスト低
3. **高品質出力**: 標準CSS完全対応、複雑なレイアウトも正確に再現
4. **日本語対応**: システムフォントをそのまま使用、追加設定不要

### トレードオフ

- パッケージサイズ増（~300MB）は許容
- 生成速度（2-5秒）はローディング表示で対応
- サーバー負荷はスケーリングで対応
Consequences
上記の決定による影響および懸念事項
