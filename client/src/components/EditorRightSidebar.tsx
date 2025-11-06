import { colors, spacing } from "../design-system/tokens";
import { Container } from "../design-system/components";
import { LayerPalette } from "./LayerPalette";
import { TextObjectPalette } from "./TextObjectPalette";
import { LayoutPalette } from "./LayoutPalette";
import { StatePreview } from "./StatePreview";
import type { LayoutItem, TableCell, InvoiceData } from "../utils/types";

interface EditorRightSidebarProps {
  activeRightPanel: "properties" | "layers";
  showStatePreview: boolean;
  layout: LayoutItem[];
  setLayout: (value: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
  selectedObjectId: string | null;
  onSelectObject: (objectId: string | null) => void;
  onMoveLayer: (direction: "up" | "down") => void;
  selectedCellObject: TableCell | null;
  invoiceData: InvoiceData;
  companyInfoData: any;
  onCellContentChange: (key: string, value: any) => void;
  onCellStyleChange: (newStyle: any) => void;
  selectedObject: LayoutItem | undefined;
  onDelete: () => void;
}

/**
 * エディターの右サイドバーコンポーネント
 * プロパティパネル、レイヤーパネル、状態プレビューを含む
 */
export const EditorRightSidebar = ({
  activeRightPanel,
  showStatePreview,
  layout,
  setLayout,
  selectedObjectId,
  onSelectObject,
  onMoveLayer,
  selectedCellObject,
  invoiceData,
  companyInfoData,
  onCellContentChange,
  onCellStyleChange,
  selectedObject,
  onDelete,
}: EditorRightSidebarProps) => {
  return (
    <Container
      style={{
        width: '320px',
        backgroundColor: colors.background.paper,
        borderLeft: `1px solid ${colors.border.default}`,
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {showStatePreview && <StatePreview data={layout} />}
      {(() => {
        if (activeRightPanel === "layers") {
          return (
            <LayerPalette
              layout={layout}
              setLayout={setLayout}
              selectedObjectId={selectedObjectId}
              onSelectObject={onSelectObject}
              onMoveLayer={onMoveLayer}
            />
          );
        }
        if (selectedCellObject) {
          return (
            <TextObjectPalette
              selectedObject={selectedCellObject as any}
              invoiceData={invoiceData}
              companyInfoData={companyInfoData}
              onContentChange={onCellContentChange}
              onStyleChange={onCellStyleChange}
            />
          );
        }
        if (selectedObject) {
          return (
            <LayoutPalette
              invoiceData={invoiceData}
              selectedObject={selectedObject}
              setLayout={setLayout}
              onMoveLayer={onMoveLayer}
              onDelete={onDelete}
              companyInfoData={companyInfoData}
            />
          );
        }
      })()}
    </Container>
  );
};
