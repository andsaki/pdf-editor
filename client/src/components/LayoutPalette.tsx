import React from "react";
import type {
  InvoiceData,
  LayoutItem,
  CompanyInfoGql,
} from "../utils/types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableObjectPalette } from "./TableObjectPalette";
import { ShapeObjectPalette } from "./ShapeObjectPalette";
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider,
} from "@mui/material";

interface LayoutPaletteProps {
  invoiceData: InvoiceData;
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onMoveLayer: (direction: "up" | "down") => void;
  onDelete: () => void;
  companyInfoData: CompanyInfoGql | undefined;
}

export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  invoiceData,
  selectedObject,
  setInvoiceData,
  onMoveLayer,
  onDelete,
  companyInfoData,
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button onClick={() => onMoveLayer("up")} fullWidth variant="outlined">
          上へ
        </Button>
        <Button onClick={() => onMoveLayer("down")} fullWidth variant="outlined">
          下へ
        </Button>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        共通
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
        <Box sx={{ width: '50%', px: 1, mb: 2 }}>
          <TextField
            label="X"
            type="number"
            size="small"
            value={selectedObject.x}
            onChange={(e) => handleNumericChange("x", e.target.value)}
            fullWidth
          />
        </Box>
        <Box sx={{ width: '50%', px: 1, mb: 2 }}>
          <TextField
            label="Y"
            type="number"
            size="small"
            value={selectedObject.y}
            onChange={(e) => handleNumericChange("y", e.target.value)}
            fullWidth
          />
        </Box>
        <Box sx={{ width: '50%', px: 1, mb: 2 }}>
          <TextField
            label="幅"
            type="number"
            size="small"
            value={selectedObject.width}
            onChange={(e) => handleNumericChange("width", e.target.value)}
            fullWidth
          />
        </Box>
        <Box sx={{ width: '50%', px: 1, mb: 2 }}>
          <TextField
            label="高さ"
            type="number"
            size="small"
            value={selectedObject.height}
            onChange={(e) => handleNumericChange("height", e.target.value)}
            fullWidth
          />
        </Box>
      </Box>

      {selectedObject.type === "text" && (
        <TextObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
          invoiceData={invoiceData}
          companyInfoData={companyInfoData}
        />
      )}

      {selectedObject.type === "table" && (
        <TableObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}

      {selectedObject.type === "shape" && (
        <ShapeObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}

      <Button
        onClick={onDelete}
        fullWidth
        variant="outlined"
        color="error"
        sx={{ mt: 2 }}
      >
        削除
      </Button>
    </Box>
  );
};
