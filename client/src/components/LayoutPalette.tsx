import React from "react";
import type {
  InvoiceData,
  LayoutItem,
  CompanyInfoGql,
  TextItem,
  TextItemStyle,
  TableCell,
} from "../utils/types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableObjectPalette } from "./TableObjectPalette";
import { ShapeObjectPalette } from "./ShapeObjectPalette";
import { Container, Text, Divider, Input, Button } from "../design-system/components";
import { spacing } from "accessibility-learning/src/design-system/tokens";

interface LayoutPaletteProps {
  invoiceData: InvoiceData;
  selectedObject: LayoutItem;
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  onMoveLayer: (direction: "up" | "down") => void;
  onDelete: () => void;
  companyInfoData: CompanyInfoGql | undefined;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  invoiceData,
  selectedObject,
  setLayout,
  onMoveLayer,
  onDelete,
  companyInfoData,
}) => {
  if (!selectedObject) {
    return null;
  }

  const handleNumericChange = (field: keyof LayoutItem, value: string) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) =>
        item.id === selectedObject.id
          ? { ...item, [field]: parseFloat(value) }
          : item
      )
    );
  };

  const handleTextContentChange = (
    key: keyof (TextItem | TableCell),
    value: any
  ) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "text") {
          return { ...item, [key]: value };
        }
        return item;
      })
    );
  };

  const handleTextStyleChange = (newStyle: Partial<TextItemStyle>) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "text") {
          return { ...item, style: { ...item.style, ...newStyle } };
        }
        return item;
      })
    );
  };

  return (
    <Container>
      <Text variant="h6" style={{ marginBottom: spacing.scale[2] }}>
        プロパティ
      </Text>

      <Divider style={{ margin: `${spacing.scale[2]} 0` }} />

      <Container style={{ display: 'flex', gap: spacing.scale[2], marginBottom: spacing.scale[2] }}>
        <Button onClick={() => onMoveLayer("up")} variant="outline" size="sm" style={{ width: '100%' }}>
          上へ
        </Button>
        <Button onClick={() => onMoveLayer("down")} variant="outline" size="sm" style={{ width: '100%' }}>
          下へ
        </Button>
      </Container>

      <Text variant="body" style={{ marginBottom: spacing.scale[2], display: 'block' }}>
        共通
      </Text>
      <Container style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.scale[2] }}>
        <Container style={{ flex: '1 1 calc(50% - 8px)' }}>
          <Input
            label="X"
            type="number"
            value={selectedObject.x}
            onChange={(e) => handleNumericChange("x", e.target.value)}
          />
        </Container>
        <Container style={{ flex: '1 1 calc(50% - 8px)' }}>
          <Input
            label="Y"
            type="number"
            value={selectedObject.y}
            onChange={(e) => handleNumericChange("y", e.target.value)}
          />
        </Container>
        <Container style={{ flex: '1 1 calc(50% - 8px)' }}>
          <Input
            label="幅"
            type="number"
            value={selectedObject.width}
            onChange={(e) => handleNumericChange("width", e.target.value)}
          />
        </Container>
        <Container style={{ flex: '1 1 calc(50% - 8px)' }}>
          <Input
            label="高さ"
            type="number"
            value={selectedObject.height}
            onChange={(e) => handleNumericChange("height", e.target.value)}
          />
        </Container>
      </Container>

      {selectedObject.type === "text" && (
        <TextObjectPalette
          selectedObject={selectedObject}
          invoiceData={invoiceData}
          companyInfoData={companyInfoData}
          onContentChange={handleTextContentChange}
          onStyleChange={handleTextStyleChange}
        />
      )}

      {selectedObject.type === "table" && (
        <TableObjectPalette
          selectedObject={selectedObject}
          setLayout={setLayout}
        />
      )}

      {selectedObject.type === "shape" && (
        <ShapeObjectPalette
          selectedObject={selectedObject}
          setLayout={setLayout}
        />
      )}

      <Button
        onClick={onDelete}
        variant="secondary"
        size="sm"
        style={{ width: '100%', marginTop: spacing.scale[2], backgroundColor: '#dc2626', color: '#ffffff' }}
      >
        削除
      </Button>
    </Container>
  );
};
