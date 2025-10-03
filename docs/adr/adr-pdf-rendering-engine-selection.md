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
Considered Options
今回の意思決定をするにあたって、複数の選択が存在した場合は、ここに列挙
Comparison Table

@react-pdf/renderer
Puppeteer
出力方式
React コンポーネントから直接 PDF 生成
HTML/CSS をヘッドレス Chrome で PDF 化
再現性
React ベースのため Web 表示と差異あり得る
Chrome 印刷と同等、CSS そのまま反映
日本語対応
フォント組込み必要
システムフォント使用可
生成速度
高速（<500ms）
低速（2-5 秒）
パッケージサイズ
小（~2MB）
大（~300MB）
サーバー負荷
なし
高
コスト
無料
無料
学習コスト
中
<Document>, <Page>, <View>, <Text>
低
ブラウザプレビューと出力の差異
△
◎

Option A: @react-pdf/renderer
👍 Pros
クライアントサイドで完結し、サーバーリソース不要
軽量で高速な PDF 生成（~500ms）

👎 Cons -独自レイアウトエンジンによる制約（Grid、複雑な Flexbox 非対応）
プレビューと PDF 出力で見た目が異なる可能性
日本語フォント対応に手間がかかる
絶対配置の座標計算が複雑
Option B: ​​
👍 Pros
ブラウザレンダリングと完全一致（WYSIWYG 保証）
標準 CSS 完全対応（Grid、Flexbox、カスタムプロパティ等）
システムフォントを使用し、日本語が自然に表示
デバッグが容易（ブラウザ DevTools と同じ）

👎 Cons
パッケージサイズが大（~300MB）
PDF 生成に時間がかかる（2-5 秒）
サーバーメモリ消費が大（ブラウザインスタンス起動）

Discussion
技術面接での議論事項を記載
Decision
具体的に決定した内容
Consequences
