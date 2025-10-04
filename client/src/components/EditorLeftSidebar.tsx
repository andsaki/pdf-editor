import { Box } from "@mui/material";
import { LeftToolbar } from "./LeftToolbar";
import { ShapeCreationPalette } from "./ShapeCreationPalette";

interface EditorLeftSidebarProps {
  onAddText: () => void;
  onAddBullet: () => void;
  onAddTable: () => void;
  onAddShape: () => void;
  onAddImage: () => void;
  onAddPdf: () => void;
  onToggleLayers: () => void;
  onAddShapeObject: (shapeType: "rect" | "h-line" | "v-line") => void;
  activeCreationPalette: "shape" | null;
  onCloseCreationPalette: () => void;
}

/**
 * エディターの左サイドバーコンポーネント
 * ツールバーと図形作成パレットを含む
 */
export const EditorLeftSidebar = ({
  onAddText,
  onAddBullet,
  onAddTable,
  onAddShape,
  onAddImage,
  onAddPdf,
  onToggleLayers,
  onAddShapeObject,
  activeCreationPalette,
  onCloseCreationPalette,
}: EditorLeftSidebarProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 64,
          bgcolor: "background.paper",
          p: 1,
          borderRight: "1px solid",
          borderColor: "divider",
          height: "100%",
        }}
      >
        <LeftToolbar
          onAddText={onAddText}
          onAddBullet={onAddBullet}
          onAddTable={onAddTable}
          onAddShape={onAddShape}
          onAddImage={onAddImage}
          onAddPdf={onAddPdf}
          onToggleLayers={onToggleLayers}
        />
      </Box>
      {activeCreationPalette === "shape" && (
        <Box sx={{ position: "absolute", top: 0, left: "64px", zIndex: 10 }}>
          <ShapeCreationPalette
            onAddShape={(type) => {
              onAddShapeObject(type);
              onCloseCreationPalette();
            }}
          />
        </Box>
      )}
    </Box>
  );
};
