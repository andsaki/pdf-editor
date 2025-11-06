import React, { useState } from "react";
import type { TableItem, LayoutItem } from "../utils/types";
import { TableItemSchema } from "../utils/schemas";
import { Container, Text, Divider, PropertyInput as Input } from "../design-system/components";
import { spacing } from "../design-system/tokens";

interface TableObjectPaletteProps {
  selectedObject: TableItem;
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
}

export const TableObjectPalette: React.FC<TableObjectPaletteProps> = ({
  selectedObject,
  setLayout,
}) => {
  const [tableErrors, setTableErrors] = useState<{
    rows?: string;
    cols?: string;
  }>({});

  const handleStyleChange = (newStyle: Partial<TableItem["style"]>) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          const currentStyle = item.style || {};
          return { ...item, style: { ...currentStyle, ...newStyle } };
        }
        return item;
      })
    );
  };

  const handleTableDataChange = (rows: number, cols: number) => {
    if (selectedObject.type !== "table") return;

    const newRows = Math.max(2, rows);
    const newCols = Math.max(2, cols);

    const newData = Array.from({ length: newRows }, (_, r) =>
      Array.from(
        { length: newCols },
        (_, c) => selectedObject.data[r]?.[c] || ""
      )
    );

    const validation = TableItemSchema.shape.data.safeParse(newData);
    if (!validation.success) {
      const formattedErrors: any = validation.error.flatten();
      setTableErrors({
        rows: formattedErrors.formErrors[0],
        cols: formattedErrors.fieldErrors.data?.[0],
      });
    } else {
      setTableErrors({});
    }

    setLayout((prevLayout) =>
      prevLayout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          return { ...item, data: newData };
        }
        return item;
      })
    );
  };

  return (
    <Container style={{ marginTop: spacing.scale[2] }}>
      <Divider style={{ margin: `${spacing.scale[2]} 0` }} />
      <Text variant="body" style={{ marginBottom: spacing.scale[2], display: 'block' }}>
        テーブルオブジェクト
      </Text>
      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Text as="label" variant="body" style={{ display: 'block', marginBottom: spacing.scale[1] }}>背景色</Text>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#FFFFFF"}
          onChange={(e) =>
            handleStyleChange({ backgroundColor: e.target.value })
          }
          style={{ width: "100%", height: "40px", boxSizing: "border-box" }}
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="行数"
          type="number"
          min={2}
          value={selectedObject.data.length}
          onChange={(e) =>
            handleTableDataChange(
              parseInt(e.target.value),
              selectedObject.data[0]?.length || 1
            )
          }
          error={tableErrors.rows}
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="列数"
          type="number"
          min={2}
          value={selectedObject.data[0]?.length || 1}
          onChange={(e) =>
            handleTableDataChange(
              selectedObject.data.length,
              parseInt(e.target.value)
            )
          }
          error={tableErrors.cols}
        />
      </Container>
    </Container>
  );
};