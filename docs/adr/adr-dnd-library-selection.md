ADR: ドラッグ＆ドロップおよびリサイズライブラリの選定
Context
意思決定の背景、及び目的

本アプリケーションの請求書エディタ機能では、ユーザーがテキストボックスや画像などのオブジェクトをキャンバス上で直感的に移動（ドラッグ＆ドロップ）およびリサイズできる必要があります。

このインタラクティブな機能を実現するため、パフォーマンス、アクセシビリティ、そして将来の拡張性を考慮した上で、最適なライブラリを選定することを目的とします。

References

react-rnd
dnd-kit
Considered Options
今回の意思決定をするにあたって、複数の選択が存在した場合は、ここに列挙
Comparison Table

| 項目 | react-rnd | dnd-kit |
|------|-----------|---------|
| **リサイズ機能** | ✅ 標準搭載 | ❌ 非搭載（別途実装が必要） |
| **ドラッグ&ドロップ** | ✅ 標準搭載 | ✅ 柔軟にカスタマイズ可能<br>（Sensors、Modifiers） |
| **アクセシビリティ** | 弱い（自前実装必須） | 強い（KeyboardSensor標準） |
| **画面上の操作性** | 高い（直感的） | 中〜高（センサー設定が必要） |
| **将来的拡張性** | 低（複数選択は実装困難） | 高（複数選択・グリッドスナップ等） |
| **学習コスト** | 低（APIがシンプル） | 中〜高（概念理解が必要） |
| **実装コスト（基本機能）** | 低（10分） | 高（3時間：リサイズ自前） |
| **実装コスト（複数選択含む）** | 高（4時間：状態同期が複雑） | 中（4.5時間：中央管理で実装しやすい） |
| **バンドルサイズ** | 約20kb | 約10kb |

Option A: react-rnd
👍 Pros
ドラッグ＆リサイズが標準搭載で、画面上の操作はすぐに実装可能
学習コストが低め（API がシンプル）
PDF 表示との連携は容易で、単純な操作であれば座標変換も直感的
**基本的なアクセシビリティ機能（Tab 移動、矢印キー移動、ARIA 属性）は手動実装可能**
  - `tabIndex`、`onKeyDown`、`aria-label` 等のプロパティをサポート
  - キーボード操作（矢印キーでの移動・リサイズ）を約 80 行のコードで実装可能
  - スクリーンリーダー対応（ARIA 属性、ライブリージョン）も実装可能

👎 Cons
将来的な拡張（レイヤー管理、複数選択など）に制約
**アクセシビリティ機能が標準搭載ではなく、全て手動実装が必要**
  - dnd-kit と異なり、キーボードセンサーやスクリーンリーダーサポートが組み込まれていない
  - フォーカス管理、キーボードイベント処理、ARIA 属性設定を全て自前で実装
  - 実装工数: 基本機能で約 1-2 日、完全対応で約 5 日
複雑な PDF 内部データとの同期には柔軟性が不足

Option B: dnd-kit
👍 Pros
**センサー (Sensors) で入力デバイスをカスタマイズ可能**
  - `PointerSensor`: マウス/タッチ操作（ドラッグ開始距離を5pxに設定など）
  - `KeyboardSensor`: キーボード操作（矢印キーで移動）
  - `TouchSensor`: タッチデバイス専用（スクロールとドラッグを区別）
  - 複数センサーの同時使用が可能

**モディファイア (Modifiers) でドラッグ挙動を制御**
  - `restrictToParentElement`: 親要素内に制限
  - `snapToGrid`: グリッドスナップ（10px単位など）
  - `restrictToWindowEdges`: ウィンドウ端に制限
  - カスタムモディファイアで独自ロジックも実装可能

**複数選択や一括操作が実装しやすい**
  - DndContextで全アイテムを中央管理
  - 移動量(delta)を全選択アイテムに適用するだけ
  - react-rndでは各コンポーネントの状態同期が複雑

アクセシビリティに標準対応（KeyboardSensor、ARIA属性自動設定）
将来的な拡張性が高い（ソート、レイヤー順序変更など）

👎 Cons
リサイズ機能は非搭載 → 自作実装が必要（8方向ハンドル、マウスイベント処理など）
学習コストが高く、概念（センサー/モディファイア/transform）理解が必須
座標の二重管理（ドラッグ中の仮位置 vs 実際の位置）が必要
初期実装コストが高い（基本機能で1.5時間 vs react-rndの10分）

Discussion

### dnd-kit の「柔軟なカスタマイズ」の具体例

#### 1. Sensors（センサー）によるカスタマイズ

センサーは入力デバイス（マウス、タッチ、キーボード）ごとの挙動を制御する機能です。

**PC環境でのメリット**:

1. **誤操作防止（ドラッグ開始距離の設定）**
   ```tsx
   import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 5,  // 5px移動したらドラッグ開始
       },
     })
   );
   ```
   - クリック時の微細な手ブレでドラッグが開始されるのを防ぐ
   - テキスト選択とドラッグを明確に区別できる

2. **キーボード操作の統一管理**
   ```tsx
   import { KeyboardSensor } from '@dnd-kit/core';

   const sensors = useSensors(
     useSensor(KeyboardSensor)
   );
   ```
   - 全てのドラッグ可能な要素でキーボード操作が一貫する
   - react-rndでは各`<Rnd>`で個別にキーボードイベントを実装する必要がある

3. **複数の入力デバイスの同時サポート**
   ```tsx
   const sensors = useSensors(
     useSensor(PointerSensor),      // マウス操作
     useSensor(KeyboardSensor)      // キーボード操作
   );
   ```
   - マウスユーザーとキーボードユーザーの両方に対応
   - アクセシビリティ向上

4. **ドラッグ開始条件のカスタマイズ**
   ```tsx
   useSensor(PointerSensor, {
     activationConstraint: {
       distance: 10,      // 10px移動でドラッグ開始
       delay: 100,        // 100msの遅延後にドラッグ開始
     },
   })
   ```
   - 意図しないドラッグを防止
   - UXの最適化

**react-rndの場合**:
- マウスイベント（`onMouseDown`, `onMouseMove`）を各コンポーネントで処理
- キーボード操作は完全に別実装
- 誤操作防止のための距離判定を自前で実装する必要がある

**モバイルでの例（参考）**:
```tsx
import { TouchSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,      // 250ms長押しでドラッグ開始
      tolerance: 5,    // 5px以内の移動は許容
    },
  })
);
```
- スクロールとドラッグを区別
- PCでは不要だが、タブレット対応時に有用

#### 2. Modifiers（モディファイア）によるカスタマイズ

**モディファイアとは**: ドラッグ中の座標変換（transform）を加工する関数です。ドラッグ中のマウス移動量を受け取り、実際に要素を移動させる座標を返します。

**基本的な仕組み**:
```tsx
type Modifier = (args: {
  transform: { x: number; y: number };  // ドラッグによる移動量
  draggingNodeRect: ClientRect;         // ドラッグ中の要素の位置・サイズ
  containerNodeRect: ClientRect;        // コンテナの位置・サイズ
}) => { x: number; y: number };         // 加工後の移動量
```

**PC環境での実用例**:

1. **グリッドスナップ（10px単位に吸着）**
   ```tsx
   import { snapCenterToCursor } from '@dnd-kit/modifiers';

   // 10pxグリッドにスナップするカスタムモディファイア
   const snapToGrid: Modifier = ({ transform }) => {
     return {
       x: Math.round(transform.x / 10) * 10,
       y: Math.round(transform.y / 10) * 10,
     };
   };

   <DndContext modifiers={[snapToGrid]}>
     {/* ドラッグ中、10px単位でスナップ */}
   </DndContext>
   ```
   - デザインツールでよくある機能
   - 要素を整列させやすくなる

2. **親要素の範囲内に制限**
   ```tsx
   import { restrictToParentElement } from '@dnd-kit/modifiers';

   <DndContext modifiers={[restrictToParentElement]}>
     {/* 要素がキャンバスの外に出ない */}
   </DndContext>
   ```
   - ドラッグ中に要素がキャンバスの外に出るのを防ぐ
   - react-rndでは`bounds="parent"`で実現可能

3. **ウィンドウ端への制限**
   ```tsx
   import { restrictToWindowEdges } from '@dnd-kit/modifiers';

   <DndContext modifiers={[restrictToWindowEdges]}>
     {/* 要素がブラウザウィンドウの外に出ない */}
   </DndContext>
   ```
   - モーダルやフローティングパネルで有用

4. **スマートガイドライン（他の要素に自動吸着）**
   ```tsx
   const smartGuidelineModifier: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
     // 他のアイテムとの位置を比較して、近い場合はスナップ
     const snapThreshold = 5;  // 5px以内なら吸着
     const nearbyItems = findNearbyItems(draggingNodeRect);

     if (nearbyItems.length > 0) {
       const nearestItem = nearbyItems[0];

       // X座標が近い場合はスナップ
       if (Math.abs(draggingNodeRect.left - nearestItem.left) < snapThreshold) {
         return { ...transform, x: nearestItem.left - draggingNodeRect.left };
       }
     }

     return transform;
   };

   <DndContext modifiers={[smartGuidelineModifier]}>
     {/* Figma/Canvaのような自動吸着機能 */}
   </DndContext>
   ```
   - Figma、Canva、Adobe XDなどのデザインツールで見られる機能
   - 要素同士を整列させやすくなる

5. **複数のモディファイアを組み合わせ**
   ```tsx
   <DndContext modifiers={[
     snapToGrid,                  // まず10pxグリッドにスナップ
     restrictToParentElement,     // 次に親要素内に制限
   ]}>
     {/* モディファイアは配列順に適用される */}
   </DndContext>
   ```

**react-rndの場合**:
- `onDrag`イベント内で座標を加工する必要がある
- 各`<Rnd>`で個別に実装
- グリッドスナップは`grid={[10, 10]}`プロパティで可能だが、カスタムロジックは困難

**モディファイアの利点**:
- ドラッグ中の座標変換ロジックを一箇所で管理
- 全てのドラッグ可能要素に一貫して適用される
- 再利用可能（複数のコンポーネントで使い回せる）

#### 3. 複数選択の実装例

**react-rnd の場合（困難）**:
```tsx
// 各<Rnd>が個別に位置を管理しているため、同期が複雑
<Rnd onDragStop={(e, d) => {
  // 選択中の他のアイテムも移動する必要がある
  // しかし、各<Rnd>の位置を個別に計算・更新する必要がある
}} />
```

**dnd-kit の場合（簡単）**:
```tsx
const handleDragEnd = (event) => {
  const { delta } = event;

  // 選択中の全アイテムに移動量を適用するだけ
  selectedItems.forEach(itemId => {
    updateItem(itemId, (item) => ({
      x: item.x + delta.x,
      y: item.y + delta.y,
    }));
  });
};
```

### アクセシビリティ機能の実装可能性

**react-rnd でのアクセシビリティ実装**

react-rnd は標準的な React コンポーネントであり、以下のプロパティを受け入れるため、基本的なアクセシビリティ機能は実装可能：

- **Tab 移動**: `tabIndex={0}` を設定することでフォーカス可能
- **矢印キー移動**: `onKeyDown` ハンドラでキーボードイベントを処理
  - 矢印キー: 10px 移動（Shift で 1px 微調整）
  - Ctrl/Cmd + 矢印キー: リサイズ操作
- **ARIA 属性**: 以下の属性を設定可能
  - `aria-label`: 要素の名前・説明（例: "テキスト要素: 請求書タイトル"）
  - `aria-grabbed`: ドラッグ可能な要素が「掴まれている」状態を示す（`true`/`false`）
  - `aria-describedby`: 操作方法のヘルプテキストへの参照（ID で指定）
- **スクリーンリーダー対応**: ライブリージョン（`aria-live`）で操作フィードバックを自動読み上げ
  - `aria-live="polite"`: 座標やサイズ変更を読み上げ（現在の読み上げ終了後）
  - `aria-atomic="true"`: メッセージ全体を読み上げる
  - 例: 矢印キーで移動 → 「Y座標: 150px」と読み上げ

**実装例**:
```typescript
// ライブリージョン（画面外に配置）
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
>
  {announcement}
</div>

// キーボード操作の説明
<div id="keyboard-instructions" style={{ position: 'absolute', left: '-10000px' }}>
  矢印キーで移動、Shiftキーと矢印キーで細かく移動、
  Ctrl/Cmdキーと矢印キーでサイズ変更、EnterまたはSpaceキーで選択
</div>

// Rnd コンポーネント
<Rnd
  tabIndex={0}
  role="application"
  aria-label="テキスト要素: 請求書タイトル"
  aria-grabbed={isSelected}
  aria-describedby="keyboard-instructions"
  onKeyDown={(e) => {
    if (e.key === "ArrowUp") {
      updateItem({ y: item.y - 10 });
      setAnnouncement(`Y座標: ${item.y - 10}px`);  // スクリーンリーダーが読み上げ
    }
    // ... 他のキー処理
  }}
  ...
/>
```

**各 ARIA 属性の役割**:

| 属性 | 役割 | 例 |
|------|------|-----|
| `aria-label` | 要素の名前・説明を提供 | 「テキスト要素: 請求書タイトル」と読み上げ |
| `aria-grabbed` | ドラッグ状態を示す | `true`: 「掴まれています」、`false`: 「掴めます」 |
| `aria-describedby` | 詳細説明への参照 | ID で指定した要素の内容を読み上げ |
| `aria-live="polite"` | 内容変更を自動読み上げ | 座標変更時に「Y座標: 150px」と通知 |
| `aria-atomic="true"` | メッセージ全体を読み上げ | 変更部分だけでなく全体を読み上げる |

**実装工数**:
- 基本機能（Tab 移動、矢印キー、ARIA 属性）: **1-2 日**
- 完全対応（複雑なアクセシビリティ要件を含む）: **5 日**

**「複雑なアクセシビリティ要件」の定義**:

基本機能（1-2日）を超える以下の高度な要件：

1. **複雑なフォーカス管理**
   - モーダル内でのフォーカストラップ（Tabキーでモーダル内を循環）
   - フォーカス順序のカスタマイズ（レイヤー順序と連動）
   - フォーカス復帰（モーダルを閉じたら元の要素に戻る）

2. **高度なキーボード操作**
   - Ctrl/Cmd+クリックで複数選択
   - Shift+クリックで範囲選択
   - Ctrl/Cmd+G でグループ化/解除
   - Ctrl/Cmd+[ / ] でレイヤー順序変更

3. **スクリーンリーダー対応の最適化**
   - 操作コンテキストの詳細な説明（「5個の要素が選択されています」）
   - 複数選択時の一括操作フィードバック
   - エラー状態の明確な通知（「要素が重なっています」）
   - ドラッグの各フェーズでの自動アナウンス（dnd-kitの`announcements` APIで実現可能）

4. **アクセシビリティテスト**
   - スクリーンリーダー（NVDA、JAWS、VoiceOver）での動作確認
   - キーボードのみでの全機能操作確認
   - WCAG 2.1 AA 準拠の検証

**注**: ヘルプモーダル/チュートリアルはdnd-kit固有の機能ではなく、アプリケーション側で実装する一般的なUI機能です。

**dnd-kit との比較**:
- dnd-kit: KeyboardSensor が標準搭載、ARIA 属性も自動設定
- react-rnd: 全て手動実装だが、基本機能は約 80-100 行で十分

### dnd-kit でしか実現できない（または圧倒的に容易な）複雑なアクセシビリティ

以下の機能は、dnd-kit の標準機能で実現可能ですが、react-rnd では実装が非常に困難または不可能です：

#### 1. **複数選択時のキーボード操作（標準対応）**

**dnd-kit の場合**:
```tsx
const handleDragEnd = (event) => {
  const { active, delta } = event;

  // KeyboardSensor が自動的に矢印キー入力を delta に変換
  // 複数選択されたアイテム全てに適用するだけ
  selectedItems.forEach(itemId => {
    updateItem(itemId, (item) => ({
      x: item.x + delta.x,
      y: item.y + delta.y,
    }));
  });
};
```

**react-rnd の場合**:
- 各 `<Rnd>` が個別にキーボードイベントを受け取る
- 複数選択時、どの `<Rnd>` がフォーカスを持つか不明確
- 全ての `<Rnd>` のキーボードイベントを同期する必要があり、実装が複雑

#### 2. **ドラッグ可能な要素の自動アナウンス**

**dnd-kit の場合**:
```tsx
<DndContext
  announcements={{
    onDragStart({ active }) {
      return `${active.id} をピックアップしました`;
    },
    onDragOver({ active, over }) {
      return over ? `${active.id} を ${over.id} の上に移動中` : '';
    },
    onDragEnd({ active }) {
      return `${active.id} を配置しました`;
    },
  }}
>
```
- スクリーンリーダー用のライブリージョンが自動生成される
- ドラッグの各フェーズで適切なメッセージを読み上げ

**react-rnd の場合**:
- ライブリージョンを手動で実装する必要がある
- `onDragStart`, `onDrag`, `onDragStop` の各イベントで状態を更新
- 複数の `<Rnd>` 間で一貫性のあるアナウンスを管理するのが困難

#### 3. **キーボードセンサーのカスタマイズ（移動速度、加速度）**

**dnd-kit の場合**:
```tsx
import { KeyboardSensor, KeyboardCoordinateGetter } from '@dnd-kit/core';

const customKeyboardCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates }) => {
  // 矢印キー: 10px移動
  // Shift+矢印キー: 1px移動
  // Ctrl/Cmd+矢印キー: 50px移動（高速移動）
  const delta = event.shiftKey ? 1 : event.metaKey || event.ctrlKey ? 50 : 10;

  switch (event.code) {
    case 'ArrowRight':
      return { ...currentCoordinates, x: currentCoordinates.x + delta };
    case 'ArrowLeft':
      return { ...currentCoordinates, x: currentCoordinates.x - delta };
    // ... 他の方向
  }
};

const sensors = useSensors(
  useSensor(KeyboardSensor, {
    coordinateGetter: customKeyboardCoordinates,
  })
);
```

**react-rnd の場合**:
- 各 `<Rnd>` で `onKeyDown` を実装する必要がある
- 移動速度のカスタマイズは可能だが、全ての `<Rnd>` で一貫性を保つ必要がある
- 複数選択時の挙動を統一するのが困難

#### 4. **ドラッグ中の衝突検知とアナウンス**

**dnd-kit の場合**:
```tsx
const handleDragMove = (event) => {
  const { collisions } = event;

  if (collisions && collisions.length > 0) {
    // 「他の要素と重なっています」とアナウンス
    setAnnouncement(`${collisions.length}個の要素と重なっています`);
  }
};
```
- `useDraggable` と `useDroppable` で衝突検知が標準搭載
- スクリーンリーダーに即座にフィードバック可能

**react-rnd の場合**:
- 衝突検知を完全に自前で実装する必要がある
- 全ての `<Rnd>` の座標を比較し、重なりを計算
- パフォーマンスに影響を与える可能性が高い

#### 5. **ソート可能なリストのキーボード操作**

**dnd-kit の場合**:
```tsx
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<SortableContext items={items} strategy={verticalListSortingStrategy}>
  {items.map(item => <SortableItem key={item.id} id={item.id} />)}
</SortableContext>
```
- Space/Enterキーでアイテムをピックアップ
- 矢印キーで順序変更
- Space/Enterキーで配置
- 全てのARIA属性とキーボード操作が自動実装される

**react-rnd の場合**:
- react-rnd はフリー配置のみをサポート
- リスト順序の概念がないため、ソート機能は実装不可能
- 別のライブラリとの組み合わせが必要

**結論**:
- 基本的なキーボード操作（単一アイテム）: react-rnd で実装可能
- 複数選択、衝突検知、ソート: dnd-kit でしか実現困難
- dnd-kit は「アクセシビリティファースト」の設計思想で、複雑な要件に標準対応

### react-rnd vs dnd-kit の最終評価

| 項目 | react-rnd | dnd-kit |
|------|-----------|---------|
| **導入の容易さ** | ◎ 非常に簡単 | △ 学習コスト高 |
| **ドラッグ＆リサイズ** | ◎ 標準搭載 | △ リサイズは別途実装 |
| **アクセシビリティ** | ◯ 手動実装可能（1-2 日） | ◎ 標準搭載 |
| **拡張性** | △ 限定的 | ◎ 非常に高い |
| **総合工数** | 低（1-2 週間） | 高（5 週間） |

Decision

**Option A: react-rnd を採用**

### 採用理由

1. **即座に利用可能**: ドラッグ＆リサイズが標準搭載で、学習コストが低い
2. **PDF 座標系との親和性**: 直感的な座標変換で実装が容易
3. **アクセシビリティは実装可能**: 手動実装は必要だが、1-2 日で基本機能を実装できる
4. **MVP に最適**: 最小限の工数で請求書エディタの中核機能を実装可能

### dnd-kit を不採用とした理由

- リサイズ機能を別途実装する必要があり、総合工数が 5 週間と大幅に増加
- 本プロジェクトの要件（単純なドラッグ＆リサイズ）には過剰な機能性
- センサーやモディファイアの概念理解が必要で、学習コストが高い

Consequences

### Positive

- **迅速な開発**: 1-2 週間で請求書エディタの基本機能を実装完了
- **直感的な実装**: シンプルな API で PDF 座標系との連携が容易
- **アクセシビリティ対応済み**: キーボード操作、Tab 移動、スクリーンリーダー対応を実装

### Negative

- **将来的な拡張性**: 複数選択やレイヤー管理などの高度な機能は実装困難
- **手動実装の保守**: アクセシビリティ機能を自前で保守する必要がある
- **ライブラリ依存**: react-rnd の更新に依存（ただし、安定版でメンテナンスは良好）

### Mitigation（緩和策）

- アクセシビリティ機能は十分にテストし、ドキュメント化
- 将来的に高度な機能が必要になった場合は、dnd-kit への移行を検討
- react-rnd のバージョンを固定し、破壊的変更のリスクを軽減

## 技術的詳細

### 座標計算の違い

react-rnd と dnd-kit では、ドラッグ終了時に取得できるデータが異なります：

| ライブラリ | ドラッグ終了時のデータ | 座標更新方法 |
|-----------|---------------------|------------|
| **react-rnd** | 最終位置（絶対座標） | `x = d.x / displayScale` |
| **dnd-kit** | 移動量（相対座標） | `x = item.x + delta.x / displayScale` |

**react-rnd の例**:
```tsx
<Rnd
  onDragStop={(_e, d) => {
    updateLayoutItem(item.id, (item) => ({
      ...item,
      x: d.x / displayScale,  // ← 最終的な絶対位置
      y: d.y / displayScale,
    }));
  }}
/>
```

**dnd-kit の例**:
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { delta } = event;
  updateLayoutItem(itemId, (item) => ({
    ...item,
    x: item.x + delta.x / displayScale,  // ← 移動量を加算
    y: item.y + delta.y / displayScale,
  }));
};
```

**影響**:
- react-rnd は位置を直接設定できるため直感的
- dnd-kit は移動量を計算する必要があり、やや複雑
- ただし、複数選択の一括移動では dnd-kit の方が実装しやすい（移動量を全アイテムに加算するだけ）

### 状態管理の違い

dnd-kit では、ドラッグ中の「仮の位置」と「実際の位置」を二重管理する必要があります。

**ドラッグ中**:
```tsx
// transform で視覚的に移動（仮の位置）
style={{
  left: item.x * displayScale,  // 元の位置
  transform: CSS.Translate.toString(transform),  // + ドラッグ中のオフセット
}}
```

**ドラッグ終了**:
```tsx
// 実際の座標を更新
x: item.x + delta.x / displayScale
```

この仕組みにより：
- ✅ **メリット**: ドラッグ中の描画がスムーズ（transform は GPU アクセラレーション）
- ❌ **デメリット**: 状態が二重管理になり、PDF 生成時などで実座標を使う必要がある

**react-rnd の場合**:
- コンポーネント内部で位置を管理
- ドラッグ終了時に最終位置のみを親に通知
- 仮の位置と実際の位置の同期を気にする必要がない

### 実装コストの実測値

このブランチ（`feature/replace-react-rnd-with-dnd-kit`）での実装時間：

| 機能 | react-rnd (推定) | dnd-kit (実測) |
|------|-----------------|---------------|
| **基本ドラッグ&リサイズ** | 10分 | 1.5時間 |
| **回転機能** | 30分 | 30分 |
| **キーボード操作** | 1時間 | 1時間 |
| **複数選択** | 3時間（各`<Rnd>`の状態同期） | 1時間（中央管理のため簡単） |
| **合計** | 約5時間 | 約4時間 |

**結論**:
- MVPのみ（ドラッグ&リサイズ）: react-rnd が圧倒的に速い
- 高度な機能（複数選択）を含む: トータルでは同程度
- dnd-kit は最初の学習コストが高いが、拡張時に有利
