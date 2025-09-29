import React from "react";
import type { InvoiceData, ShapeItem } from "../types";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";

interface ShapeObjectPaletteProps {
  selectedObject: ShapeItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const ShapeObjectPalette: React.FC<ShapeObjectPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const handleShapeChange = (key: "shapeType", value: ShapeItem["shapeType"]) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "shape") {
          return { ...item, [key]: value };
        }
        return item;
      }),
    }));
  };

  const handleStyleChange = (newStyle: Partial<ShapeItem["style"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "shape") {
          return { ...item, style: { ...item.style, ...newStyle } };
        }
        return item;
      }),
    }));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        図形オブジェクト
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>図形の種類</InputLabel>
        <Select
          value={selectedObject.shapeType}
          label="図形の種類"
          onChange={(e) =>
            handleShapeChange(
              "shapeType",
              e.target.value as ShapeItem["shapeType"]
            )
          }
        >
          <MenuItem value="rect">四角形</MenuItem>
          <MenuItem value="h-line">横線</MenuItem>
          <MenuItem value="v-line">縦線</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <InputLabel>背景色</InputLabel>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#cccccc"}
          onChange={(e) =>
            handleStyleChange({ backgroundColor: e.target.value })
          }
          style={{ width: "100%", height: "40px" }}
        />
      </Box>
    </Box>
  );
};
