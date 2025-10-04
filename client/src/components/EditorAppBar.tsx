import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";

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
  onPreviewReactPdf: () => void;
  onPreviewPuppeteer: () => void;
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
  onPreviewReactPdf,
  onPreviewPuppeteer,
  onShowStatePreview,
  onSave,
}: EditorAppBarProps) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
          Invoice Editor
        </Typography>
        <Button onClick={onUndo} disabled={!canUndo} size="small">
          元に戻す
        </Button>
        <Button onClick={onRedo} disabled={!canRedo} size="small">
          やり直し
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Button onClick={onCopy} disabled={!hasSelectedObject} size="small">
          コピー
        </Button>
        <Button onClick={onCut} disabled={!hasSelectedObject} size="small">
          切り取り
        </Button>
        <Button onClick={onPaste} disabled={!hasClipboard} size="small">
          貼り付け
        </Button>
        <Button
          onClick={onDelete}
          disabled={!hasSelectedObject}
          size="small"
          color="error"
        >
          削除
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          onClick={onToggleVariableDisplay}
        >
          {variableDisplayMode === "name" ? "データ例で表示" : "変数で表示"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onPreviewReactPdf}
          sx={{ ml: 1 }}
        >
          プレビュー (React-PDF)
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onPreviewPuppeteer}
          sx={{ ml: 1 }}
        >
          プレビュー (Puppeteer)
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => alert("PDFトレース機能は未実装です")}
          sx={{ ml: 1 }}
        >
          PDFをトレース
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onShowStatePreview}
          sx={{ ml: 1 }}
        >
          State Preview
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button>キャンセル</Button>
        <Button variant="contained" onClick={onSave} sx={{ ml: 1 }}>
          保存
        </Button>
      </Toolbar>
    </AppBar>
  );
};
