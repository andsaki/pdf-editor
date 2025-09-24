import React from "react";
import type { InvoiceData, LayoutItem } from "../types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableObjectPalette } from "./TableObjectPalette";
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Grid,
} from "@mui/material";

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onMoveLayer: (direction: "up" | "down") => void;
  onDelete: () => void;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  selectedObject,
  setInvoiceData,
  onMoveLayer,
  onDelete,
}) => {
  if (!selectedObject) {
    return null;
  }

  const handleNumericChange = (field: keyof LayoutItem, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) =>
        item.id === selectedObject.id
          ? { ...item, [field]: parseFloat(value) }
          : item
      ),
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        プロパティ
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        配置
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onMoveLayer("up")}
          >
            一つ前面へ
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onMoveLayer("down")}
          >
            一つ背面へ
          </Button>
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={onDelete}
        sx={{ mt: 1 }}
      >
        削除
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        共通
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="X"
            type="number"
            size="small"
            value={selectedObject.x}
            onChange={(e) => handleNumericChange("x", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Y"
            type="number"
            size="small"
            value={selectedObject.y}
            onChange={(e) => handleNumericChange("y", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="幅"
            type="number"
            size="small"
            value={selectedObject.width}
            onChange={(e) => handleNumericChange("width", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="高さ"
            type="number"
            size="small"
            value={selectedObject.height}
            onChange={(e) => handleNumericChange("height", e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      {selectedObject.type === "text" && (
        <TextObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}

      {selectedObject.type === "table" && (
        <TableObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}
    </Box>
  );
};
