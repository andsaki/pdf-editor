import React from "react";
import type { LayoutItem, ShapeItem } from "../utils/types";
import { Container, Text, Divider, PropertyInput as Input, Select } from "../design-system/components";
import { spacing } from "../design-system/tokens";

interface ShapeObjectPaletteProps {
  selectedObject: ShapeItem;
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
}

export const ShapeObjectPalette: React.FC<ShapeObjectPaletteProps> = ({
  selectedObject,
  setLayout,
}) => {
  const handleShapeChange = (key: "shapeType", value: ShapeItem["shapeType"]) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "shape") {
          return { ...item, [key]: value };
        }
        return item;
      })
    );
  };

  const handleStyleChange = (newStyle: Partial<ShapeItem["style"]>) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "shape") {
          return { ...item, style: { ...item.style, ...newStyle } };
        }
        return item;
      })
    );
  };

  return (
    <Container style={{ marginTop: spacing.scale[2] }}>
      <Divider style={{ margin: `${spacing.scale[2]} 0` }} />
      <Text variant="body" style={{ marginBottom: spacing.scale[2], display: 'block' }}>
        図形オブジェクト
      </Text>
      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="図形の種類"
          value={selectedObject.shapeType}
          onChange={(e) =>
            handleShapeChange(
              "shapeType",
              e.target.value as ShapeItem["shapeType"]
            )
          }
        >
          <option value="rect">四角形</option>
          <option value="h-line">横線</option>
          <option value="v-line">縦線</option>
        </Select>
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Text as="label" variant="body" style={{ display: 'block', marginBottom: spacing.scale[1] }}>背景色</Text>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#cccccc"}
          onChange={(e) =>
            handleStyleChange({ backgroundColor: e.target.value })
          }
          style={{ width: "100%", height: "40px", boxSizing: "border-box" }}
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Text as="label" variant="body" style={{ display: 'block', marginBottom: spacing.scale[1] }}>枠線の色</Text>
        <input
          type="color"
          value={selectedObject.style?.borderColor || "#000000"}
          onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
          style={{ width: "100%", height: "40px", boxSizing: "border-box" }}
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="枠線の太さ (px)"
          type="number"
          min={0}
          max={20}
          step={1}
          value={selectedObject.style?.borderWidth || 1}
          onChange={(e) =>
            handleStyleChange({ borderWidth: Number(e.target.value) })
          }
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="枠線のスタイル"
          value={selectedObject.style?.borderStyle || "solid"}
          onChange={(e) =>
            handleStyleChange({
              borderStyle: e.target.value as "solid" | "dashed" | "dotted",
            })
          }
        >
          <option value="solid">実線</option>
          <option value="dashed">破線</option>
          <option value="dotted">点線</option>
        </Select>
      </Container>
    </Container>
  );
};
