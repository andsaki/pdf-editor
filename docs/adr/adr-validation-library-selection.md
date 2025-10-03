ADR: データバリデーションライブラリの選定
Context
意思決定の背景、及び目的

本アプリケーションでは、請求書エディタやフォーム入力などにおいて、
ユーザー入力データの型安全性・バリデーション が不可欠です。

References

`zod`: https://github.com/colinhacks/zod
`yup`: https://github.com/jquense/yup

Considered Options
今回の意思決定をするにあたって、複数の選択が存在した場合は、ここに列挙
Comparison Table

zod
yup
TypeScript 型推論
非常に良い(スキーマから型を自動生成)
限定的(追加の型定義が必要な場合がある)
バンドルサイズ
比較的小さい
やや大きい
パフォーマンス
高速
標準的
エコシステム
低
高
開発者体験 (DX)
非常に良い (直感的な API)
良好

Option A: zod
👍 Pros
TypeScript 型推論が非常に強力（スキーマから型を自動生成可能）
学習コストが低め（API がシンプル）
ネスト構造や条件付きバリデーションに強い

👎 Cons
エコシステムが比較的小さめ（Formik など既存ライブラリとの統合事例が少ない）
yup に比べると利用実績はまだ少ない

Option B: yup
👍 Pros
実績が豊富でエコシステムが充実（Formik など多くのライブラリと統合可能）
シンプルなスキーマ定義で学習コストが低い
非同期バリデーションに対応

👎 Cons
TypeScript との統合が限定的（型推論が弱く、型定義を二重管理する場合がある）
バンドルサイズが大きめ
DX は zod より劣る

Discussion
技術面接での議論事項を記載
Decision
具体的に決定した内容
Consequences
上記の決定による影響および懸念事項

エコシステムとは？

コントリビューターは直近一ヶ月 zod の方が多い
zod
![alt text](image.png)
yup
![alt text](image-1.png)
