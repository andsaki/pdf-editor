# 設計書 - 請求書エディタ

## 1. 概要

本ドキュメントは、インタラクティブな請求書エディタアプリケーションの設計について記述するものです。

### 1.1. プロジェクトの目的

ユーザーが直感的なUIを通じて、テキスト、画像、テーブルなどの要素を自由に配置・編集し、カスタマイズされた請求書を作成できるWebアプリケーションを提供します。

### 1.2. 主なゴール

- **WYSIWYG編集:** ユーザーが見たままの形で請求書を編集できる、インタラクティブなキャンバスを提供する。
- **柔軟なレイアウト:** テキスト、画像、テーブルなどのオブジェクトを、キャンバス上の任意の位置に配置し、サイズを変更できる。
- **PDF出力:** 作成した請求書を、高品質なPDFとしてダウンロードまたはプレビューできる。
- **拡張性:** 将来的に新しいオブジェクト（例：図形、署名欄）を追加しやすい、堅牢なデータ構造とコンポーネント設計を実現する。

## 2. アーキテクチャ

本アプリケーションは、ReactベースのクライアントとNode.js/Expressベースのサーバーで構成されるクライアントサーバーアーキテクチャを採用します。

```mermaid
graph TD
    subgraph "Client (Browser)"
        subgraph "ユーザー操作"
            UI_ClickAdd["オブジェクト追加ボタンをクリック"]
            UI_Drag["オブジェクトをドラッグ＆リサイズ"]
            UI_Select["オブジェクトを選択"]
            UI_Edit["コンテンツを編集"]
            UI_Save["保存ボタンをクリック"]
        end

        subgraph "Reactコンポーネント"
            App["App.tsx<br/>(State: invoiceData, selectedObjectId)"]
            InvoiceForm["InvoiceForm.tsx<br/>(ツール群, 詳細フォーム)"]
            PdfPreview["PdfPreview.tsx<br/>(キャンバス)"]
            LayoutPalette["LayoutPalette.tsx<br/>(プロパティ)"]
            LayerPalette["LayerPalette.tsx<br/>(レイヤー)"]
            InvoiceDocument["InvoiceDocument.tsx<br/>(PDF定義)"]
        end

        subgraph "データフロー"
            State["useHistoryState (invoiceData)"]
            Apollo["Apollo Client"]
        end

        App -- "invoiceData, setInvoiceData" --> InvoiceForm
        App -- "..." --> PdfPreview
        App -- "selectedObject, ..." --> LayoutPalette
        App -- "..." --> LayerPalette
        App -- "invoiceData" --> InvoiceDocument

        UI_ClickAdd --> InvoiceForm
        InvoiceForm -- "setInvoiceData" --> App
        
        UI_Drag --> PdfPreview
        UI_Select --> PdfPreview
        UI_Edit --> PdfPreview
        PdfPreview -- "setInvoiceData, setSelectedObjectId" --> App

        LayoutPalette -- "setInvoiceData" --> App
        LayerPalette -- "setInvoiceData" --> App

        UI_Save --> App
        App -- "saveInvoice Mutation" --> Apollo
        Apollo -- "GraphQL Request" --> Server

        App --> State
        State --> App
    end

    subgraph "Server (Node.js)"
        Server["Express Server<br/>(index.ts)"]
        GraphQL["Apollo Server<br/>(GraphQL Endpoint)"]
        Server -- "/graphql" --> GraphQL
    end
```

- **クライアント:**
  - **フレームワーク:** [React](https://reactjs.org/) (v18) を使用し、UIの構築と状態管理を行います。
  - **GraphQLクライアント:** [Apollo Client](https://www.apollographql.com/docs/react/) を使用し、サーバーとのデータ通信を管理します。
  - **ビルドツール:** [Vite](https://vitejs.dev/) を採用し、高速な開発サーバーと最適化されたビルドを実現します。
  - **言語:** [TypeScript](https://www.typescriptlang.org/) を全面的に採用し、型安全性を確保します。
  - **スタイリング:** [Material-UI (MUI)](https://mui.com/) を使用し、洗練されたUIコンポーネントを構築します。
  - **バリデーション:** [Zod](https://zod.dev/) を使用し、ランタイムの型安全性とスキーマバリデーションを実現します。

- **サーバー:**
  - **フレームワーク:** [Express](https://expressjs.com/) を使用し、堅牢なAPIサーバーを構築します。
  - **GraphQLサーバー:** [Apollo Server](https://www.apollographql.com/docs/apollo-server/) をExpressに統合し、GraphQL APIを提供します。
  - **PDF生成:** [Puppeteer](https://pptr.dev/) を使用し、サーバーサイドで高品質なPDFを生成します。

- **パッケージ管理:** [npm](https://www.npmjs.com/) を使用し、依存関係を管理します。

## 3. コンポーネント設計

主要なReactコンポーネントとその責務は以下の通りです。

- **`App.tsx`**
  - アプリケーションのルートコンポーネント。
  - 請求書データ (`invoiceData`) や選択中のオブジェクトID (`selectedObjectId`) など、アプリケーション全体の状態を `useHistoryState` カスタムフックで一元管理します。
  - 主要なコンポーネントのレイアウトと配置を担当し、状態とセッター関数を各コンポーネントにpropsとして渡します。

- **`PdfPreview.tsx`**
  - 請求書のライブプレビューを表示する中心的なコンポーネント。
  - `react-rnd` を利用して、キャンバス上のオブジェクトのドラッグ＆ドロップ、リサイズを可能にします。
  - オブジェクトの選択状態と`zIndex`に基づいたスタッキング順序を管理します。
  - テキスト・テーブルセルのインライン編集機能を提供します。

- **`LayoutPalette.tsx`**
  - オブジェクトが選択された際に表示されるプロパティ編集パネル。
  - 選択されたオブジェクトの種類に応じて、適切なサブパレットを表示します。
  - 共通プロパティ（位置、サイズ、zIndex）の編集機能を提供します。

- **`TextObjectPalette.tsx`**
  - テキストオブジェクト専用のプロパティ編集パネル。
  - コンテンツタイプ（`fixed`, `variable`, `labeled-variable`）の選択機能。
  - フォントスタイル（フォント、サイズ、色、太字、斜体、配置など）の編集機能。
  - 背景色、テキストシャドウ、箇条書きモードなどの高度な設定。

- **`TableObjectPalette.tsx`**
  - テーブルオブジェクト専用のプロパティ編集パネル。
  - 行・列の追加・削除機能を提供します。

- **`ShapeObjectPalette.tsx`**
  - 図形オブジェクト（矩形、水平線、垂直線）専用のプロパティ編集パネル。
  - 背景色の編集機能を提供します。

- **`LayerPalette.tsx`**
  - キャンバス上の全オブジェクトをレイヤーとして一覧表示し、管理するためのパネル。
  - レイヤーのスタッキング順序（`zIndex`）を上下に移動させる機能を提供します。
  - レイヤーの表示/非表示、ロック/アンロック機能を提供します。

- **`LeftToolbar.tsx`**
  - 左サイドバーのツールボタン群を提供します。
  - テキスト、箇条書き、テーブル、図形、画像、PDF追加のボタンを配置。
  - レイヤーパネル切り替えボタンを提供します。

- **`ShapeCreationPalette.tsx`**
  - 図形追加時に表示されるサブパレット。
  - 矩形、水平線、垂直線の選択肢を提供します。

- **`InvoiceDocument.tsx`**
  - `@react-pdf/renderer` を使用して、ダウンロード用のPDFドキュメントの構造を定義します。
  - `invoiceData` を受け取り、レイアウトオブジェクトを`zIndex`でソートしてからPDFの要素としてマッピングします。

- **`StatePreview.tsx`**
  - 開発およびデバッグ用のユーティリティコンポーネント。
  - 現在の `invoiceData` の状態をJSON形式でリアルタイムに表示します。

## 4. データモデル

データ構造の定義とバリデーションには `zod` を使用します。これにより、以下の利点が得られます。

- **ランタイムの型安全性:** APIレスポンスやフォーム入力など、外部からのデータを実行時に検証し、予期せぬエラーを防ぎます。
- **単一の情報源 (Single Source of Truth):** Zodスキーマを定義するだけで、TypeScriptの型を `z.infer` を使って自動生成できるため、型定義の二重管理を防ぎます。
- **ドキュメントとしての役割:** スキーマ自体が、期待されるデータ構造の明確なドキュメントとして機能します。

TypeScriptの型は、このZodスキーマから `z.infer` を使って自動的に生成されます。

- **`LayoutItem` (判別共用体)**
  - キャンバス上のすべてのオブジェクトを表すための中心的な型です。
  - `type` プロパティ（`'text'`, `'image'`, `'table'`）によって、オブジェクトの種類を判別します。
  - 各オブジェクトは、共通のプロパティ（`id`, `x`, `y`, `width`, `height`, `zIndex`）を持ちます。
  - `TextItem` はさらに `contentType` (`'fixed'`, `'variable'`, `'labeled-variable'`) と `label` を持ち、動的なコンテンツ表現を可能にします。

- **`InvoiceData`**
  - アプリケーションのルートとなるデータ構造です。
  - `layout` プロパティは、`LayoutItem` の配列としてすべてのオブジェクトを管理します。
  - `form` プロパティは、請求書自体のデータ（請求書番号、会社情報、宛先情報など）を保持するオブジェクトです。

```typescript
// client/src/schemas.ts の例

const BaseLayoutItemSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number(),
});

export const TextItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal('text'),
  content: z.string(),
  contentType: z.enum(["fixed", "variable", "labeled-variable"]).default("fixed"),
  label: z.string().optional(),
  // ... style properties
});

export const LayoutItemSchema = z.discriminatedUnion("type", [
  TextItemSchema,
  ImageItemSchema,
  TableItemSchema,
]);

export const InvoiceDataSchema = z.object({
  layout: z.array(LayoutItemSchema),
  form: z.object({
    issue_date: z.string().optional(),
    invoice_number: z.string().optional(),
    // ... other form fields
  }),
});
```

### 4.1. オブジェクト生成時の注意 (Note on Object Creation)

新しいレイアウトオブジェクトを生成し、`invoiceData` の `layout` 配列に追加する際は、TypeScriptの型推論の問題を回避するため、オブジェクトを `LayoutItem` 型として明示的に型付けすることが推奨されます。これにより、特に判別共用体（discriminated union）を扱う際に、より堅牢でエラーの少ない状態更新が保証されます。

## 5. 状態管理

アプリケーションの状態は、Reactのカスタムフック `useHistoryState` を用いて `App.tsx` コンポーネント内で集中的に管理されます。これにより、Undo/Redo機能を持ちながら、状態管理のロジックをコンポーネントから分離しています。

- **`invoiceData`**: `InvoiceData` 型のオブジェクトで、請求書のすべてのレイアウト情報とフォームデータの両方を含みます。
- **`selectedObjectId`**: 現在ユーザーが選択しているオブジェクトの `id`（文字列）、または何も選択されていない場合は `null`。

状態の更新は、各コンポーネントが `App.tsx` から受け取った `setInvoiceData` や `setSelectedObjectId` などのセッター関数を呼び出すことで行われます。これにより、データフローが単一方向（トップダウン）に保たれ、予測可能な状態遷移が実現されます。

### 5.1. Undo/Redo (履歴)

Undo/Redo機能は、カスタムフック `useHistoryState` を使用して実装されます。このフックは、アプリケーションの状態履歴を管理するためのロジックをカプセル化します。

- **`useHistoryState` フック:**
    - 状態のシーケンスを格納するための配列 `history` を維持します。
    - `history` 配列内の現在の状態を指す `index` を保持します。
    - **`setState`:** 状態が更新されると、現在のインデックスに新しい状態を履歴に追加し、元に戻された「将来の」状態を破棄します。
    - **`undo`:** `index` をデクリメントして、履歴内の前の状態に移動します。
    - **`redo`:** `index` をインクリメントして、履歴内の次の状態に移動します。
    - 現在の `state`、`setState` 関数、`undo` と `redo` 関数、およびボタンを有効/無効にするためのブール値フラグ `canUndo` と `canRedo` を返します。
    - メモリ消費を防ぐため、履歴の数にはデフォルトで50件の上限が設定されています。この上限は設定可能です。（参考: Adobe Photoshopのデフォルトは50件です）

- **`App.tsx` での統合:**
    - メインの `invoiceData` 状態は `useHistoryState` フックによって管理されます。
    - `undo` と `redo` 関数およびフラグは、ボタンが配置されている `InvoiceForm` コンポーネントに渡されます。

## 6. 主要機能の実装詳細

### 6.1. インタラクティブなキャンバス

- **オブジェクトの操作:** `react-rnd` ライブラリを各レイアウトオブジェクトのラッパーとして使用します。`onDragStop` と `onResizeStop` イベントをリッスンし、オブジェクトの `x`, `y`, `width`, `height` プロパティを更新します。
- **スタッキング:** 各オブジェクトの `zIndex` プロパティを `react-rnd` の `style` に渡すことで、キャンバス上での重なり順を制御します。
- **インライン編集:** テキストやテーブルセルは、通常は `<span>` や `<td>` で表示されます。ユーザーがこれらをダブルクリックすると、`editingText` や `editingCell` といったローカルステートが更新され、要素が `<input>` に切り替わります。`onBlur` イベントで編集モードを終了します。

#### 6.1.1. レイヤー管理

- **`zIndex`の採番:** 新しいオブジェクトが追加される際、既存のオブジェクトが持つ最大の `zIndex` に1を加えた値が新しい `zIndex` として採番されます。
- **UI:** `LayerPalette` コンポーネントは、全オブジェクトを `zIndex` の降順でリスト表示します。
- **順序変更:** ユーザーが「▲」または「▼」ボタンをクリックすると、`moveLayer` 関数が呼び出されます。この関数は、対象のオブジェクトと、その `zIndex` 上で隣接するオブジェクトの `zIndex` 値を交換することで、スタッキング順序を変更します。

#### 6.1.2. テキストオブジェクトの操作

- **コンテンツ種別:** `TextObjectPalette` を通じて、テキストの `contentType` を以下の3種類から選択できます。
  - **`fixed` (固定文言):** 静的なテキストを表示します。
  - **`variable` (変数):** `{{variable_name}}` の形式で変数を埋め込みます。この変数は、`invoiceData.form` の値に置き換えられて表示されます。
  - **`labeled-variable` (ラベル付き変数):** `label` プロパティと変数を組み合わせて、「請求書番号: 12345」のように表示します。
- **表示モード:** `App.tsx` のトグルボタンにより、変数表示を「変数名 (`{{...}}`)」と「実際のデータ」で切り替えることができ、レイアウト調整とプレビューを容易にします。

#### 6.1.3. PDFアップロード

- **ファイル処理:** ユーザーがPDFを選択すると、`handlePdfUpload` 関数が `FileReader` を使ってファイルを `ArrayBuffer` として読み込みます。
- **ページ変換:** `react-pdf` からインポートされた `pdfjs` ライブラリを使い、PDFドキュメントをロードします。その後、各ページをループ処理します。
- **画像化:** 各ページについて、`page.render()` を使って非表示の `<canvas>` 要素にページ内容を描画します。描画後、`canvas.toDataURL('image/png')` を呼び出して、ページをPNG画像のデータURLに変換します。
- **レイアウト追加:** 生成された画像データURLを持つ新しい `ImageItem` オブジェクトが作成され、`invoiceData.layout` に追加されます。各ページは個別の画像オブジェクトとして扱われます。

### 6.2. Service Interface

クライアントとサーバー間の通信は、明確に定義されたインターフェースを介して行われます。

#### 6.2.1. フロントエンド APIクライアント

コンポーネントの関心を分離するため、サーバー通信の詳細はAPIサービスクライアントにカプセル化します。コンポーネントは、具体的な通信プロトコル（GraphQL）を意識することなく、このクライアントを利用します。

**インターフェース定義 (TypeScript):**
```typescript
// client/src/services/api.ts (仮)
import { InvoiceData } from "../types";

export interface IInvoiceApiService {
  saveInvoice(invoiceData: InvoiceData): Promise<boolean>;
}
```

**実装:**
- このインターフェースの実装は、Apollo Clientを利用して行われます。
- `saveInvoice` メソッドは、内部で `saveInvoice` GraphQLミューテーションを呼び出します。
- その際、クライアントの `InvoiceData` 型から、GraphQLの `InvoiceDataInput` 型へのデータ変換も担当します。

#### 6.2.2. バックエンド API (GraphQL)

バックエンドは、請求書の取得・更新・PDF生成のためのGraphQL APIを公開します。

**スキーマ定義 (SDL):**
```graphql
# 請求書全体の型
type Invoice {
  id: ID!
  name: String!
  layout: [LayoutItem!]!
  form: Form!
  createdAt: String!
  updatedAt: String!
}

# 更新用の入力型
input UpdateInvoiceInput {
  name: String
  layout: [LayoutItemInput!]
  form: FormInput
}

# クエリ
type Query {
  getInvoice(id: ID!): Invoice
  getInvoices: [Invoice!]!
  getCompanyInfo: CompanyInfo
}

# ミューテーション
type Mutation {
  updateInvoice(id: ID!, input: UpdateInvoiceInput!): Invoice!
  generatePdf(html: String!): String  # Puppeteerによるサーバーサイド PDF 生成
}
```

**主要な機能:**

- **getInvoice**: 指定されたIDの請求書を取得します。現在はモックデータを返しますが、将来的にはデータベースから取得します。
- **getInvoices**: すべての請求書リストを取得します（PDFトレース用、現在は空配列）。
- **getCompanyInfo**: 自社情報を取得します。請求書の変数展開に使用されます。
- **updateInvoice**: 請求書データを更新し、更新後の請求書オブジェクトを返します。
- **generatePdf**: HTMLからPuppeteerを使ってサーバーサイドでPDFを生成し、Base64エンコードされたPDFデータを返します。

#### 6.2.3. データ永続化フロー

1.  **ユーザー操作:** ユーザーがUI上で保存ボタンをクリックします。
2.  **コンポーネント:** `App.tsx` が、現在の `invoiceData` 状態を引数に `IInvoiceApiService` の `saveInvoice` メソッドを呼び出します。
3.  **APIクライアント:** `saveInvoice` メソッドが、`invoiceData` を `InvoiceDataInput` 型に変換し、Apollo Clientを用いて `saveInvoice` ミューテーションを実行します。
4.  **サーバー:** GraphQLリクエストを受け取り、データを処理（現在はコンソール出力）し、結果を返します。
5.  **UI更新:** APIクライアントは結果を `Promise<boolean>` として返し、コンポーネントはそれに応じてUI（例: 保存成功の通知）を更新します。

### 6.3. PDF生成

本アプリケーションでは、用途に応じて2つのPDF生成方式を採用しています。

#### 6.3.1. クライアントサイドPDF生成（プレビュー用）

**使用ライブラリ:** `@react-pdf/renderer`

- **目的:** 編集中の請求書をブラウザ上で即座にプレビューする
- **実装:** `InvoiceDocument.tsx` でReactコンポーネントとしてPDF構造を定義
- **特徴:**
  - クライアントサイドで完結するため、高速なプレビューが可能
  - Reactの宣言的な構文でPDFレイアウトを記述
  - `invoiceData.layout` 配列をマップし、各オブジェクトをPDF要素に変換

**フロー:**
```mermaid
graph LR
    A[invoiceData] --> B[InvoiceDocument.tsx]
    B --> C[@react-pdf/renderer]
    C --> D[PDF Blob]
    D --> E[ブラウザでプレビュー]
```

#### 6.3.2. サーバーサイドPDF生成（最終出力用）

**使用ライブラリ:** `Puppeteer`

- **目的:** 最終的にダウンロード・保存される高品質なPDFを生成
- **実装:** クライアントがHTMLを生成し、サーバーの `generatePdf` ミューテーションに送信
- **特徴:**
  - **完全なCSS対応:** Grid、Flexbox、絶対配置など、標準CSSを完全サポート
  - **日本語フォント対応:** システムフォントを利用し、自然な日本語表示
  - **WYSIWYG保証:** ブラウザでの表示とPDF出力の一貫性を実現
  - **デバッグ性:** ブラウザ開発者ツールでスタイル調整が可能

**フロー:**
```mermaid
graph LR
    A[invoiceData] --> B[generateHtmlFromLayout]
    B --> C[HTML String]
    C --> D[GraphQL: generatePdf]
    D --> E[Puppeteer on Server]
    E --> F[PDF Buffer]
    F --> G[Base64 Encoded PDF]
    G --> H[Client: Blob & Download]
```

**実装詳細:**

1. **クライアント側** (`App.tsx`):
   - `generateHtmlFromLayout` 関数で `invoiceData` からHTMLを生成
   - レイアウトアイテムごとに絶対配置のdiv要素を作成
   - 変数を実際の値に展開

2. **サーバー側** (`server/src/index.ts`):
   - Puppeteerでヘッドレスブラウザを起動
   - 受け取ったHTMLをレンダリング
   - A4サイズのPDFとして出力
   - Base64エンコードしてクライアントに返却

**選定理由:**

- **@react-pdf/renderer**: 日本語フォント対応が不完全、CSS制約が多い → プレビューのみに使用
- **Puppeteer**: 完全なブラウザエンジンによる確実なレンダリング → 最終出力に最適
