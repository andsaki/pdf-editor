# 請求書エディタ (Invoice Editor)

ドラッグ＆ドロップ対応のインタラクティブなインターフェースで、請求書の作成・編集ができるWebアプリケーションです。

## 主な機能

- **インタラクティブWYSIWYGエディタ:** 変更がリアルタイムでPDFプレビューに反映されます。
- **レイアウトオブジェクト:** テキスト、画像、テーブルを請求書キャンバスに追加できます。
- **ドラッグ、ドロップ、リサイズ:** キャンバス上のすべてのオブジェクトを自由に移動・リサイズできます。
- **インライン編集:** テキストやテーブルのセルをプレビュー上で直接編集できます。
- **レイアウトパレット:** オブジェクトを選択すると、そのプロパティを調査・変更するためのパレットが表示されます。
- **PDFエクスポート:**
    - **ダウンロード:** 完成した請求書をPDFファイルとしてダウンロードできます。
    - **別タブで開く:** 生成されたPDFを新しいブラウザタブで素早くプレビューできます。
- **状態プレビュー:** 開発やデバッグに便利な、現在のデータ状態をリアルタイムで表示する機能。

## 使用技術

- **フロントエンド:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [zod](https://zod.dev/)
  - [react-pdf](https://react-pdf.org/) (`@react-pdf/renderer`): PDFのレンダリングとプレビュー
  - [pdf-lib](https://pdf-lib.js.org/): PDFの動的な生成
  - [react-rnd](https://github.com/bokuweb/react-rnd): オブジェクトのドラッグ＆リサイズ

## 使い方

1.  **オブジェクトの追加:** 「Add Text」、「Add Image」、「Add Table」ボタンを使って、キャンバスにオブジェクトを追加します。
2.  **オブジェクトの操作:**
    - クリック＆ドラッグでオブジェクトを移動します。
    - 角をドラッグしてオブジェクトをリサイズします。
    - テキストまたはテーブルセルをダブルクリックして、内容を編集します。
3.  **調査と変更:** オブジェクトを選択すると「レイアウトパレット」が開き、プロパティを表示・変更できます。
4.  **PDFのエクスポート:**
    - 「Open in New Tab」でPDFをプレビューします。
    - 「Download PDF」でファイルを保存します。

## セットアップ

### 前提条件

- [Node.js](https://nodejs.org/) (v18+)
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

開発サーバーを起動するには、以下を実行します:

```sh
pnpm run dev
```

アプリケーションは `http://localhost:5173` で利用可能になります。