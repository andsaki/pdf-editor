# 請求書エディタ

請求書の作成・編集を行い、PDFとしてダウンロードできるWebアプリケーションです。

## 機能

- **請求書フォーム:** 宛先、請求元、品目（説明、金額）などを入力できる使いやすいフォームです。
- **ライブPDFプレビュー:** 入力内容がリアルタイムでPDFプレビューに反映されます。
- **PDFダウンロード:** 完成した請求書をPDFファイルとしてダウンロードできます。

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Apollo Client](https://www.apollographql.com/docs/react/)
  - [pdf-lib](https://pdf-lib.js.org/)

- **バックエンド:**
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
  - [TypeScript](https://www.typescriptlang.org/)

##はじめに

### 前提条件

- [Node.js](https://nodejs.org/) (v20.19.4 または `.nvmrc` で指定されたバージョン)
- [pnpm](https://pnpm.io/)

### インストール

1. リポジトリをクローンします:
   ```sh
   git clone https://github.com/andsaki/invoice-editor.git
   cd invoice-editor
   ```

2. pnpmを使って依存関係をインストールします:
   ```sh
   pnpm install
   ```

### 開発サーバーの起動

クライアントとサーバーの両方の開発サーバーを同時に起動するには、以下を実行します:

```sh
pnpm run dev
```

- クライアントは `http://localhost:5173` で利用可能になります。
- GraphQLサーバーは `http://localhost:4000/graphql` で利用可能になります。
