書類のカスタムレイアウト機能 - フロントエンド設計
Context and scopes
本ドキュメントは、請求書発行機能における「書類のカスタムレイアウト」を実現するためのフロントエンドに特化した設計を記述します。ユーザーがGUI上で書類のレイアウトを自由にカスタマイズできる機能が対象です。
Goal
 ユーザーが見たままの形で請求書を編集できる、インタラクティブなキャンバスを提供すること。 
Redo・Undoやコピーペーストなどの編集状態の管理ができること。 
キャンバス上で共通のオブジェクト操作（移動、リサイズ）の仕組みを各オブジェクト（テキスト、画像、テーブルなど）に適用すること。
対象のオブジェクトの編集をプロパティパレットで詳細な設定ができること。 - 編集した請求書をPDF としてプレビューできること。 
過去編集したPDFを参照し、レイアウトプリセットとして使用すること。
Non Goals（Optional）
バックエンド側の詳細な設計
Architecture

このアプリケーションは、クライアントサーバーモデルを採用しています。

クライアントサイドはReactとTypeScriptで構築されており、ユーザーが請求書を直接編集できるインタラクティブな「キャンバス」と、各種設定を行うための「UIパネル」が主なUIです。
状態管理が中心的な役割を担っており、特に`useHistoryState`というカスタムフックを用いて、Undo/Redo（やり直し/元に戻す）機能を実現しているのが特徴です。サーバーとの通信は、Apollo Clientを利用したGraphQLで行われます。

サーバーサイドは、クライアントからのリクエストに応じてデータを操作するためのGraphQL APIを提供します。APIサーバーがリクエストを受け取り、GraphQLエンドポイントがそれを解釈して、データストア（データベース）に対するデータの保存（Mutation）や、過去の請求書データの読み込み（Query）といった処理を実行します。

この構成により、クライアントはUIとインタラクションに集中でき、サーバーはデータの永続性に責任を持つという、役割が明確に分離された設計になっています。
System context diagram

この機能は、ユーザーがブラウザ上で操作するフロントエンド（Web Browser）と、設定を保存するバックエンド（Service）およびデータベース（Database）間のやり取りが中心となります。


アーキテクチャ図

graph TD
    subgraph "Client (React)"
        User_Interactions["ユーザー操作<br/>(画面遷移, オブジェクト追加・編集, <br/>保存, プリセット読み込み, <b>PDF出力</b>)"]

        subgraph "UI層"
            Main_UI["メインUI<br/>(ツールバー, プロパティパネルなど)"]
            Canvas["請求書キャンバス<br/>(オブジェクトの描画と操作)"]
        end

        subgraph "ロジック・データ層"
            App_State["アプリケーション状態管理<br/>(<b>Undo/Redo用カスタムフック<br/>useHistoryState</b>)"]
            GraphQL_Client["GraphQLクライアント"]
            Pdf_Generator["PDF生成ライブラリ"]
        end

        User_Interactions -- "イベント発行" --> Main_UI
        User_Interactions -- "直接操作" --> Canvas

        Main_UI -- "状態更新を要求" --> App_State
        Canvas -- "状態更新を要求" --> App_State

        App_State -- "状態を提供" --> Main_UI
        App_State -- "状態を提供" --> Canvas

        %% PDF出力
        Main_UI -- "<b>PDF生成を指示</b>" --> Pdf_Generator
        App_State -- "<b>請求書データを提供</b>" --> Pdf_Generator
        Pdf_Generator -- "生成したPDFをダウンロード" --> User_Interactions

        %% データ永続化・復元
        User_Interactions -- "<b>画面遷移時にデータ取得 (Query)</b><br/>(自社情報, フォームデータ)" --> GraphQL_Client
        Main_UI -- "<b>PDFトレース/読込 (Query)</b>" --> GraphQL_Client
        Main_UI -- "<b>保存 (Mutation)</b>" --> GraphQL_Client
        GraphQL_Client -- "<b>取得・更新データで状態を更新</b>" --> App_State

        GraphQL_Client -- "GraphQLリクエスト" --> API_Server
    end

    subgraph "Server"
        API_Server["APIサーバー"]
        GraphQL_Endpoint["GraphQLエンドポイント"]
        Database["(データストア)"]

        API_Server -- "/graphql" --> GraphQL_Endpoint
        GraphQL_Endpoint -- "CRUD処理" --> Database
    end

Service Interface

```graphql
# 任意のJSONオブジェクトを表すカスタムスカラー型
scalar JSON

# 自社情報
type CompanyInfo {
  name: String!
  address: String!
  phoneNumber: String
  bankAccount: String
}

# 取得系のクエリ
type Query {
  getInvoice(id: ID!): Invoice
  getInvoices: [Invoice!]! #PDFトレース用
  getCompanyInfo: CompanyInfo #自社情報取得
}

# 請求書データを変更するための操作
type Mutation {
  updateInvoice(id: ID!, input: UpdateInvoiceInput!): Invoice!
  createInvoice(input: CreateInvoiceInput!): Invoice! #当該画面では使用しない
  deleteInvoice(id: ID!): Boolean! #当該画面では使用しない
}

# 請求書全体のデータ型
type Invoice {
  id: ID!
  name: String!
  layout: JSON! # キャンバス上のオブジェクト配列
  form: JSON! # 請求日や顧客名などのフォームデータ
  createdAt: String!
  updatedAt: String!
}

# 新規作成用の入力データ型
input CreateInvoiceInput {
  name: String!
  layout: JSON!
  form: JSON!
}

# 更新用の入力データ型
input UpdateInvoiceInput {
  name: String
  layout: JSON
  form: JSON
}
```



Technical Decisions
技術的な意思決定

- **主要技術スタック (Core Technology Stack)**
  - **フロントエンド**: React と TypeScript を採用し、堅牢でコンポーネントベースのUIを構築します。
  - **API通信**: GraphQL を採用し、サーバーとの通信には Apollo Client を利用します。これにより、効率的なデータ取得と強力なキャッシュ機能、型安全なAPI操作を実現します。

- **キャンバスの実装 (Canvas Implementation)**
  - **採用技術**: `react-rnd`, `pdf-lib`, `react-pdf`
  - **理由**: キャンバスは複数の技術を組み合わせたハイブリッドな実装です。
    - **インタラクティブな操作**: `react-rnd` を使用し、各オブジェクトをドラッグ・リサイズ可能にしています。
    - **静的背景の描画**: `pdf-lib` で画像などを含むPDFを動的に生成し、`react-pdf` でキャンバスの背景として描画。その上にインタラクティブなオブジェクトを重ねています。これによりWYSIWYGな編集体験とパフォーマンスを両立しています。

- **PDF生成 (PDF Generation)**
  - **採用技術**: `@react-pdf/renderer`
  - **理由**: 最終的なダウンロード用のPDFファイルは、`@react-pdf/renderer` を用いて生成します。`InvoiceDocument.tsx`がこの役割を担い、Reactコンポーネントから直接PDFを構築します。

- **状態管理 (State Management)**
  - **採用技術**: カスタムフック `useHistoryState` + Apollo Client Cache
  - **理由**: 編集中のレイアウト情報など、Undo/Redoが必要なクライアント状態は`useHistoryState`フックで管理します。これにより、状態のスナップショットを配列として保持し、過去の状態へ簡単に移動できます。一方、サーバーから取得したデータ（過去の請求書、自社情報など）やサーバーとの通信状態は、Apollo Clientが提供する正規化キャッシュ機構で管理します。これにより、UIとサーバー状態の一貫性を保ちつつ、関心事を分離します。



Alternatives Considered（Optional）
検討した代替案とその理由

- **キャンバス実装の代替案**
  - **HTML5 Canvas API (`<canvas>`)**: ピクセル単位での自由な描画が可能で高性能ですが、オブジェクトの選択、編集、レイヤ管理といったロジックを自前で実装する必要があり、開発コストが高くなります。特にテキスト編集機能の実装が複雑になるため、今回は見送りました。
  - **SVG**: ベクターベースのため拡縮に強く、オブジェクトをDOMノードとして扱える利点があります。しかし、複雑なテキストレイアウトや改ページの制御において、HTML要素に比べて制約が多いため、今回はより柔軟性の高いDOMベースのアプローチを選択しました。

Cross-cutting concerns（Optional）
システム全体に影響する非機能要件や共通処理

- **認証・認可 (Authentication/Authorization)**
  - 現状のGraphQLスキーマには認証の概念が含まれていませんが、本番運用では、ユーザーが自身の請求書のみを操作できるように制限する必要があります。対策として、ログイン時に発行されるJWT（JSON Web Token）を、以降のすべてのGraphQLリクエストの`Authorization`ヘッダーに含める方式を想定します。サーバーサイドではこのトークンを検証し、認可処理を行います。

- **エラーハンドリング (Error Handling)**
  - ネットワーク接続の切断、サーバーダウン、GraphQLの操作エラー（例: バリデーションエラー、存在しないリソースへのアクセス）など、予期せぬ事態が発生した際に、アプリケーションがクラッシュすることなく、ユーザーに状況を適切に通知する仕組みが必要です。UIのルートに近い場所でエラーバウンダリを設け、エラー内容に応じたメッセージ（例: 「データを保存できませんでした。時間をおいて再試行してください」）をトースト通知などで表示する共通処理を実装します。