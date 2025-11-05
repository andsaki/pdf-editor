import { Button } from "accessibility-learning/src/design-system/components";
import { colors, spacing, shadows } from "accessibility-learning/src/design-system/tokens";
import { Container, Text, Divider } from "../design-system/components";

interface EditorAppBarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  hasSelectedObject: boolean;
  hasClipboard: boolean;
  variableDisplayMode: "name" | "example";
  onToggleVariableDisplay: () => void;
  onPreviewPlaywright: () => void;
  onShowStatePreview: () => void;
  onSave: () => void;
}

/**
 * エディターのトップバー（AppBar）コンポーネント
 * 編集操作、プレビュー、保存などの主要な機能を提供
 */
export const EditorAppBar = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  hasSelectedObject,
  hasClipboard,
  variableDisplayMode,
  onToggleVariableDisplay,
  onPreviewPlaywright,
  onShowStatePreview,
  onSave,
}: EditorAppBarProps) => {
  return (
    <Container
      sx={{
        backgroundColor: colors.background.paper,
        boxShadow: shadows.boxShadow.sm,
        borderBottom: `1px solid ${colors.border.default}`,
      }}
    >
      {/* 1行目: タイトルと保存ボタン */}
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          padding: `${spacing.scale[2]} ${spacing.scale[4]} 0`,
          gap: spacing.scale[3],
        }}
      >
        <Text variant="h6" sx={{ fontWeight: 'bold' }}>
          PDF Editor
        </Text>

        <div style={{ flexGrow: 1 }} />

        <Button variant="secondary" size="sm" style={{ height: '36px' }}>キャンセル</Button>
        <Button variant="primary" size="sm" onClick={onSave} style={{ height: '36px' }}>
          保存
        </Button>
      </Container>

      {/* 2行目: 編集操作とプレビュー */}
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          padding: `${spacing.scale[2]} ${spacing.scale[4]}`,
          gap: spacing.scale[2],
        }}
      >
        <Button onClick={onUndo} disabled={!canUndo} size="sm" variant="secondary" style={{ height: '36px' }}>
          元に戻す
        </Button>
        <Button onClick={onRedo} disabled={!canRedo} size="sm" variant="secondary" style={{ height: '36px' }}>
          やり直し
        </Button>

        <Divider sx={{ height: '24px', width: '1px', margin: `0 ${spacing.scale[2]}`, backgroundColor: colors.border.default }} />

        <Button onClick={onCopy} disabled={!hasSelectedObject} size="sm" variant="secondary" style={{ height: '36px' }}>
          コピー
        </Button>
        <Button onClick={onCut} disabled={!hasSelectedObject} size="sm" variant="secondary" style={{ height: '36px' }}>
          切り取り
        </Button>
        <Button onClick={onPaste} disabled={!hasClipboard} size="sm" variant="secondary" style={{ height: '36px' }}>
          貼り付け
        </Button>
        <Button onClick={onDelete} disabled={!hasSelectedObject} size="sm" variant="secondary" style={{ height: '36px' }}>
          削除
        </Button>

        <Divider sx={{ height: '24px', width: '1px', margin: `0 ${spacing.scale[2]}`, backgroundColor: colors.border.default }} />

        <Button variant="outline" size="sm" onClick={onToggleVariableDisplay} style={{ height: '36px' }}>
          {variableDisplayMode === "name" ? "データ例で表示" : "変数で表示"}
        </Button>
        <Button variant="outline" size="sm" onClick={onPreviewPlaywright} style={{ height: '36px' }}>
          PDFプレビュー
        </Button>
        <Button variant="outline" size="sm" onClick={onShowStatePreview} style={{ height: '36px' }}>
          State Preview
        </Button>
      </Container>
    </Container>
  );
};
