# Document Editor

## 概要

このリポジトリは、インタラクティブなドキュメント編集アプリケーションのプロトタイプです。AI を活用した開発プロセスの実験として構築されました。

## 目的

- Design Doc と ADR の作成プラクティスの実践
- AI 駆動開発による実装プロセスの検証
- モダンなフロントエンド・バックエンド技術スタックの習得

## 注意事項

**本プロジェクトは学習・実験目的で作成されたものであり、プロダクション品質ではありません。**

- エラーハンドリングやバリデーションが不完全です
- セキュリティ対策は実装されていません
- UI/UX は [accessibility-learning](https://github.com/andsaki/accessibility-learning) のアクセシブルなデザインシステムを使用した基本的な実装です

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/) 18
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [accessibility-learning](https://github.com/andsaki/accessibility-learning) デザインシステム (WCAG準拠のアクセシブルなUIコンポーネント)
  - [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL クライアント)
  - [zod](https://zod.dev/) (バリデーション)
  - [lucide-react](https://lucide.dev/) (アイコン)
  - [react-pdf](https://react-pdf.org/) (`@react-pdf/renderer`): PDF レンダリング
  - [pdf-lib](https://pdf-lib.js.org/): PDF 生成
  - [react-rnd](https://github.com/bokuweb/react-rnd): ドラッグ＆リサイズ機能

- **バックエンド:**
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  - [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (GraphQL サーバー)
  - [Puppeteer](https://pptr.dev/) (PDF 生成)

## セットアップ

### 前提条件

- [Node.js](https://nodejs.org/) (v20+)
- npm または [pnpm](https://pnpm.io/)

### インストールと起動

#### 一括インストール

```bash
pnpm install
```

#### サーバーとクライアントの同時起動

```bash
pnpm dev
```

または個別に起動：

#### サーバー

```bash
pnpm --filter server dev
```

サーバーは `http://localhost:4000/graphql` で起動します。

#### クライアント

```bash
pnpm --filter client dev
```

クライアントは `http://localhost:5173` で起動します。

## デザインシステム

本プロジェクトでは、[accessibility-learning](https://github.com/andsaki/accessibility-learning) のデザインシステムを使用しています。

### 特徴

- **WCAG 2.1 準拠**: A/AA/AAAレベルに対応したアクセシブルなコンポーネント
- **デザイントークン**: 3層構造（プリミティブ → セマンティック → コンポーネント）で一貫性のあるデザインを実現
- **キーボード操作**: すべてのコンポーネントがキーボードで操作可能
- **スクリーンリーダー対応**: 適切なARIA属性による支援技術のサポート

### 使用しているコンポーネント

- **Button**: プライマリ/セカンダリ/アウトラインボタン
- **Tooltip**: アクセシブルなツールチップ（矢印付き）
- **デザイントークン**: colors, spacing, typography, shadows等

### ローカル実装コンポーネント

- **Container**: レイアウト用コンテナ
- **Text**: タイポグラフィコンポーネント
- **Divider**: セクション区切り
- **IconButton**: アイコンボタン

## ライセンス

本プロジェクトは調査目的のため、ライセンスは設定していません。