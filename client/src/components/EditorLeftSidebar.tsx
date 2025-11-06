import { colors, spacing } from "../design-system/tokens";
import { Container } from "../design-system/components";
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
    <Container
      style={{
        position: "relative",
        display: "flex",
      }}
    >
      <Container
        style={{
          width: '64px',
          backgroundColor: colors.background.paper,
          padding: spacing.scale[2],
          borderRight: `1px solid ${colors.border.default}`,
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
      </Container>
      {activeCreationPalette === "shape" && (
        <Container style={{ position: "absolute", top: 0, left: "64px", zIndex: 10 }}>
          <ShapeCreationPalette
            onAddShape={(type) => {
              onAddShapeObject(type);
              onCloseCreationPalette();
            }}
          />
        </Container>
      )}
    </Container>
  );
};
