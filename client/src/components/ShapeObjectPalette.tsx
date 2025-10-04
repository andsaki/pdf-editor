import React from "react";
import type { LayoutItem, ShapeItem } from "../utils/types";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  TextField,
} from "@mui/material";

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

      <Box sx={{ mt: 2 }}>
        <InputLabel>枠線の色</InputLabel>
        <input
          type="color"
          value={selectedObject.style?.borderColor || "#000000"}
          onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
          style={{ width: "100%", height: "40px" }}
        />
      </Box>

      <TextField
        fullWidth
        margin="normal"
        label="枠線の太さ (px)"
        type="number"
        value={selectedObject.style?.borderWidth || 1}
        onChange={(e) =>
          handleStyleChange({ borderWidth: Number(e.target.value) })
        }
        slotProps={{ htmlInput: { min: 0, max: 20, step: 1 } }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>枠線のスタイル</InputLabel>
        <Select
          value={selectedObject.style?.borderStyle || "solid"}
          label="枠線のスタイル"
          onChange={(e) =>
            handleStyleChange({
              borderStyle: e.target.value as "solid" | "dashed" | "dotted",
            })
          }
        >
          <MenuItem value="solid">実線</MenuItem>
          <MenuItem value="dashed">破線</MenuItem>
          <MenuItem value="dotted">点線</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
