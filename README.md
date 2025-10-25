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
- UI/UX は Material-UI などのコンポーネントライブラリを使用した基本的な実装です

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Material-UI](https://mui.com/) (AI 駆動開発のため既存コンポーネントを活用)
  - [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL クライアント)
  - [zod](https://zod.dev/)
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