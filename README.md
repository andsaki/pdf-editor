# 請求書エディタ (Invoice Editor)

## 概要

このリポジトリは、Design Doc と ADR（Architecture Decision Record）の作成プロセスを調査するために、AI を活用して構築した請求書編集アプリケーションです。主に Gemini CLI で開発を進め、最後の仕上げに Claude Code を使用しました。

## 目的

- Design Doc と ADR の作成手法の調査
- AI 駆動開発による実装プロセスの検証
- アーキテクチャ決定の文書化プラクティスの実践

## 注意事項

**本プロジェクトは調査目的で作成されたものであり、動作の品質は高くありません。**

- プロダクション利用を想定していません
- エラーハンドリングやバリデーションが不完全です
- セキュリティ対策は実装されていません
- AI 駆動開発のため、Material-UI などの既存コンポーネントライブラリを活用して「それっぽい」UI を構築しています

## ドキュメント

Design Doc や ADR の清書のための調査として出力したドキュメントが `docs/` 配下に入っています。

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Material-UI](https://mui.com/) (AI 駆動開発のため既存コンポーネントを活用)
  - [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL クライアント)
  - [zod](https://zod.dev/)
  - [react-pdf](https://react-pdf.org/) (`@react-pdf/renderer`): PDFのレンダリングとプレビュー
  - [pdf-lib](https://pdf-lib.js.org/): PDFの動的な生成
  - [react-rnd](https://github.com/bokuweb/react-rnd): オブジェクトのドラッグ＆リサイズ

- **バックエンド:**
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  - [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (GraphQL サーバー)
  - [Puppeteer](https://pptr.dev/) (サーバーサイド PDF 生成)

## セットアップ

### 前提条件

- [Node.js](https://nodejs.org/) (v20+)
- npm または [pnpm](https://pnpm.io/)

### インストールと起動

#### サーバー

```bash
cd server
npm install
npm run dev
```

サーバーは `http://localhost:4000/graphql` で起動します。

#### クライアント

```bash
cd client
npm install
npm run dev
```

クライアントは `http://localhost:5173` で起動します。

## ライセンス

本プロジェクトは調査目的のため、ライセンスは設定していません。