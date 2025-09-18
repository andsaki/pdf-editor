# 請求書エディタ (Invoice Editor)

請求書の作成・編集を行い、PDFとしてダウンロードできるWebアプリケーションです。テキストや画像を自由な位置に配置して、カスタマイズ性の高い請求書を作成できます。

## 主な機能

- **請求書フォーム:** 宛先、請求元、品目（説明、金額）などを簡単に入力できます。
- **ライブPDFプレビュー:** 入力内容がリアルタイムでPDFプレビューに反映されます。
- **オブジェクトの自由な配置:**
    - **テキスト:** 好きなテキストを自由な位置に追加し、内容を編集できます。
    - **画像:** PCから画像をアップロードし、ドラッグ＆ドロップで位置やサイズを自由に変更できます。
- **プロパティ編集:** 追加したテキストや画像オブジェクトのX/Y座標や幅/高さを、フォームから数値で正確に指定できます。
- **PDF出力:**
    - **ダウンロード:** 完成した請求書をPDFファイルとしてダウンロードできます。
    - **別タブで表示:** PDFをブラウザの新しいタブで開き、すぐに確認できます。
- **状態プレビュー:** 開発やデバッグに便利な、現在のデータ状態をリアルタイムで表示する機能。

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [react-pdf](https://react-pdf.org/) (`@react-pdf/renderer`): PDFのレンダリングとプレビュー
  - [pdf-lib](https://pdf-lib.js.org/): PDFの動的な生成
  - [react-rnd](https://github.com/bokuweb/react-rnd): オブジェクトのドラッグ＆リサイズ
  - [Apollo Client](https://www.apollographql.com/docs/react/)

- **バックエンド:**
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
  - [TypeScript](https://www.typescriptlang.org/)

## 使い方

1.  **基本情報の入力:** 左側のフォームに「To」（宛先）、「From」（請求元）を入力します。
2.  **品目の追加:** 「Add Item」ボタンで品目を追加し、内容と金額を入力します。
3.  **テキストオブジェクトの追加:**
    - 「Add custom text」の入力欄にテキストを入れ、「Add Text」ボタンをクリックすると、プレビューに追加されます。
    - プレビュー上のテキストオブジェクトをクリックすると、青枠が表示され、編集モードになります。
    - 左側のフォームから、選択したテキストオブジェクトの内容やX/Y座標を編集できます。
4.  **画像オブジェクトの追加:**
    - 「Add Image」ボタンをクリックし、画像ファイルを選択します。
    - プレビュー上に追加された画像は、ドラッグして移動できます。
    - 画像の隅をドラッグすることで、サイズを変更できます。
    - 左側のフォームから、画像のX/Y座標や幅/高さを数値で正確に指定することも可能です。
5.  **PDFの出力:**
    - 「Open in New Tab」でブラウザ上でプレビューを確認します。
    - 「Download PDF」でPDFファイルを保存します。

## セットアップ

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