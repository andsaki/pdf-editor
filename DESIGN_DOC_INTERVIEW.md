# 設計書 - 請求書エディタ (面接用)

## 1. 概要

本ドキュメントは、インタラクティブな請求書エディタアプリケーションの設計について、技術面接での議論に適した粒度で記述するものです。ユーザーが直感的な UI を通じて、テキスト、画像、テーブルなどの要素を自由に配置・編集し、カスタマイズされた請求書を作成できる Web アプリケーションを提供します。

### 1.1. 主なゴール

- **WYSIWYG 編集:** ユーザーが見たままの形で請求書を編集できる、インタラクティブなキャンバスを提供する。
- **柔軟なレイアウト:** テキスト、画像、テーブルなどのオブジェクトを、キャンバス上の任意の位置に配置し、サイズを変更できる。
- **PDF 出力:** 作成した請求書を、高品質な PDF としてダウンロードまたはプレビューできる。
- **拡張性:** 将来的に新しいオブジェクト（例：図形、署名欄）を追加しやすい、堅牢なデータ構造とコンポーネント設計を実現する。

## 2. アーキテクチャ

本アプリケーションは、モダンな Web 開発スタックを採用したクライアントサーバーアーキテクチャで構築されています。

- **クライアントサイド:**
  - **技術スタック:** React をベースに、TypeScript による型安全な開発、Tailwind CSS による効率的なスタイリングを採用しています。
  - **役割:** ユーザーインターフェースの構築、状態管理、サーバーとの非同期通信を担当します。
- **サーバーサイド:**
  - **技術スタック:** Node.js と Express を基盤とし、GraphQL API を提供するために Apollo Server を統合しています。
  - **役割:** クライアントからのデータ永続化リクエストの処理、ビジネスロジックの実行（将来的には）、およびデータストアとの連携（将来的には）を担当します。
- **通信プロトコル:** クライアントとサーバー間のデータ通信には GraphQL を採用しており、効率的かつ柔軟なデータ取得・更新を可能にしています。

### アーキテクチャ図

```mermaid
graph TD
    subgraph "クライアントサイド (React)"
        A[UI (コンポーネント)]
        B[状態管理 (フック)]
        C[GraphQL通信 (Apollo)]
    end

    subgraph "サーバーサイド (Node.js/Express)"
        D[GraphQL API (Apollo Server)]
        E[ビジネスロジック]
        F[(データストア)]
    end

    A -- 対話 --> B
    B -- 要求 --> C
    C -- GraphQL --> D
    D -- 処理 --> E
    E -- 永続化 --> F
```

## 3. 主要コンポーネントの役割

アプリケーションは、責務に応じた複数の React コンポーネントで構成されています。

- **アプリケーションルート:** アプリケーション全体の状態（請求書データ、選択中のオブジェクトなど）を一元管理し、主要なコンポーネントの配置と状態の伝達を行います。
- **フォーム/ツールパネル:** 新しいレイアウトオブジェクトの追加、PDF ファイルのアップロード、請求書詳細情報の入力など、ユーザー操作の起点となる UI を提供します。
- **PDF プレビューキャンバス:** 請求書のライブプレビューを表示する中心的なコンポーネントです。オブジェクトのドラッグ＆ドロップ、リサイズ、選択、インライン編集といったインタラクティブな操作を可能にします。
- **プロパティパレット:** 選択されたオブジェクトの共通プロパティ（座標、サイズ）や、オブジェクト種別ごとの固有プロパティ（テキストのフォント、テーブルの背景色など）を編集する UI を提供します。
- **レイヤーパネル:** キャンバス上の全オブジェクトをレイヤーとして一覧表示し、スタッキング順序の変更や削除といった管理機能を提供します。

## 4. データモデル

アプリケーションのデータは、請求書全体の構造と、キャンバス上の各オブジェクトのプロパティを表現するために設計されています。

- **`InvoiceData`:** アプリケーションのルートとなるデータ構造で、請求書全体のフォームデータと、すべてのレイアウトオブジェクトの配列を含みます。
- **`LayoutItem`:** キャンバス上のすべてのオブジェクト（テキスト、画像、テーブルなど）を表すための中心的な型です。`type` プロパティによってオブジェクトの種類を判別し、それぞれが固有のプロパティを持ちます。

## 5. 状態管理と履歴機能

アプリケーションの状態は、状態の性質に応じて React のフックを使い分けて管理しています。

- **`useHistoryState` (カスタムフック):** Undo/Redo が必要な請求書データ (`invoiceData`) を管理します。
- **`useState` (React 標準フック):** 選択中のオブジェクト ID など、履歴が不要な UI 関連の単純な状態を管理します。

これにより、ロジックのカプセル化と関心の分離を図りつつ、ユーザーが安心して編集作業を行える Undo/Redo 機能を提供しています。

## 6. 主要機能の技術的アプローチ

### 6.1. インタラクティブなキャンバス

- **オブジェクト操作:** サードパーティライブラリを活用し、キャンバス上のオブジェクトのドラッグ＆ドロップ、リサイズといった直感的な操作を実現しています。
- **インライン編集:** テキストやテーブルセルは、直接キャンバス上で編集可能です。
- **レイヤー管理:** 各オブジェクトの重なり順序は、`zIndex`プロパティによって制御され、専用の UI を通じて管理できます。

### 6.2. PDF 生成

アプリケーションは、目的別に異なるアプローチで PDF を生成します。

- **ライブプレビュー:** 編集中の請求書をリアルタイムで表示するために、軽量な PDF 操作ライブラリを使用し、動的に PDF のバイナリデータを生成して表示します。これにより、高速なフィードバックを提供します。
- **ダウンロード用 PDF:** 最終的な高品質な PDF ドキュメントを生成するためには、React コンポーネントの宣言的な構文で PDF を定義できるライブラリを使用します。これにより、複雑なレイアウトもコードベースで管理しやすくなっています。

### 6.3. Service Interfaces

アプリケーションは、責務に応じて明確に定義されたインターフェースを持っています。

#### 6.3.1. クライアント・データインターフェース (Zod)

クライアント内部のデータ構造は `zod` スキーマによって定義されます。これはアプリケーションの「単一の情報源」として機能し、ランタイムの型安全性を保証します。このスキーマから TypeScript の型が自動生成されます。

- **`InvoiceDataSchema`:** アプリケーションのルートとなるデータ構造。
- **`LayoutItemSchema`:** キャンバス上の全オブジェクト（テキスト、画像、テーブル）を表す判別共用体スキーマ。

**スキーマ (抜粋):**

```typescript
// 全オブジェクト共通の基本スキーマ
const BaseLayoutItemSchema = z.object({
  id: z.string(), // オブジェクト固有のID
  x: z.number(), // 横軸の座標 (左上が0)
  y: z.number(), // 縦軸の座標 (左上が0)
  width: z.number(), // 幅
  height: z.number(), // 高さ
  zIndex: z.number(), // 重なりの順序
});

// TextItemのスキーマ
const TextItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("text"),
  content: z.string(), // テキスト内容。'{{自社名}}'のような変数名を格納することもある
  contentType: z.enum(["fixed", "variable", "labeled-variable"]), // contentの解釈方法を定義する
  // 'labeled-variable'の場合、"label: content" のように表示される (例: "電話: {{電話番号}}")
  label: z.string().optional(), // contentTypeが'labeled-variable'の時のラベル部分 (例: "電話")
  style: z
    .object({
      fontFamily: z.enum(["Helvetica", "BIZ UDPGothic"]).optional(), // フォント
      fontSize: z.number().optional(), // フォントサイズ
      lineHeight: z.number().optional(), // 行の高さ
      textAlign: z.enum(["left", "center", "right"]).optional(), // 水平方向の配置
      verticalAlign: z.enum(["top", "center", "bottom"]).optional(), // 垂直方向の配置
      color: z.string().optional(), // 文字色
      bold: z.boolean().optional(), // 太字
      italic: z.boolean().optional(), // 斜体
      wordWrap: z.boolean().optional(), // テキストの折り返し
      backgroundColor: z.string().optional(), // 背景色
      textShadow: z.string().optional(), // 文字の影
      isBullet: z.boolean().optional(), // 箇条書き
    })
    .optional(),
});

// ImageItemのスキーマ
const ImageItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("image"),
  data: z.string(), // 画像データ (Data URL)
});

// TableItemのスキーマ
const TableItemSchema = BaseLayoutItemSchema.extend({
  type: z.literal("table"),
  data: z.array(z.array(z.string())), // テーブルの二次元配列データ
  style: z
    .object({
      backgroundColor: z.string().optional(), // 背景色
    })
    .optional(),
});

// 判別共用体として統合
export const LayoutItemSchema = z.discriminatedUnion("type", [
  TextItemSchema,
  ImageItemSchema,
  TableItemSchema,
]);
```

#### 6.3.2. サーバー API インターフェース (GraphQL)

クライアントとサーバー間の通信は、GraphQL API を介して行われます。

- **`saveInvoice` Mutation:**

  - **役割:** クライアントから送信された請求書データ全体を受け取り、永続化します。
  - **スキーマ:**

    ```graphql
    # 請求書データ全体の入力型
    input InvoiceDataInput {
      layout: [LayoutItemInput!]!
      form: FormInput!
    }

    # フォームデータの入力型
    input FormInput {
      issue_date: String
      invoice_number: String
      # ... etc.
    }

    # 各レイアウトオブジェクトを表現する入力型。
    # GraphQLのInput Unionの制約のため、各タイプのプロパティを
    # オプショナルなフィールドとして一つの型にまとめています。
    input LayoutItemInput {
      id: ID!
      type: String! # オブジェクト種別: 'text', 'image', 'table'
      x: Float! # 横軸の座標 (左上が0)
      y: Float! # 縦軸の座標 (左上が0)
      width: Float! # 幅
      height: Float! # 高さ
      zIndex: Int! # 重なりの順序
      # TextItem properties
      content: String # テキスト内容
      contentType: String # コンテンツ種別: 'fixed', 'variable', 'labeled-variable'
      label: String # ラベル付き変数のラベル
      fontFamily: String # フォント
      fontSize: Int # フォントサイズ
      color: String # 文字色
      align: String # 水平方向の配置: 'left', 'center', 'right'
      # ImageItem properties
      src: String # 画像データ (Data URL)
      # TableItem properties
      data: [[String]] # テーブルの二次元配列データ
      backgroundColor: String # 背景色
    }

    type Mutation {
      saveInvoice(invoiceData: InvoiceDataInput!): Boolean
    }
    ```

  - **データフロー:** クライアントは `InvoiceData` (Zod) オブジェクトを `InvoiceDataInput` (GraphQL) 型に変換してサーバーに送信します。

- **拡張性:** サーバーサイドは、将来的なデータベース統合や、請求書取得のためのクエリ追加に対応できるよう、スケーラブルに設計されています.
