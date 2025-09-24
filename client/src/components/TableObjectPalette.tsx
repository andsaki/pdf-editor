import React, { useState } from "react";
import type { InvoiceData, TableItem } from "../types";
import { TableItemSchema } from "../schemas";
import {
  Box,
  Typography,
  TextField,
  Divider,
  InputLabel,
} from "@mui/material";

interface TableObjectPaletteProps {
  selectedObject: TableItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const TableObjectPalette: React.FC<TableObjectPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const [tableErrors, setTableErrors] = useState<{
    rows?: string;
    cols?: string;
  }>({});

  const handleStyleChange = (newStyle: Partial<TableItem["style"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          const currentStyle = item.style || {};
          return { ...item, style: { ...currentStyle, ...newStyle } };
        }
        return item;
      }),
    }));
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
      const formattedErrors = validation.error.flatten();
      setTableErrors({
        rows: formattedErrors.formErrors[0],
        cols: (formattedErrors.fieldErrors as any)?.[0]?.[0],
      });
    } else {
      setTableErrors({});
    }

    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "table") {
          return { ...item, data: newData };
        }
        return item;
      }),
    }));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        テーブルオブジェクト
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1 }}>
        <Box sx={{ width: "100%", px: 1, mb: 2 }}>
          <InputLabel>背景色</InputLabel>
          <input
            type="color"
            value={selectedObject.style?.backgroundColor || "#FFFFFF"}
            onChange={(e) =>
              handleStyleChange({ backgroundColor: e.target.value })
            }
            style={{ width: "100%", height: "40px" }}
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <TextField
            label="行数"
            type="number"
            fullWidth
            InputProps={{ inputProps: { min: 2 } }}
            value={selectedObject.data.length}
            onChange={(e) =>
              handleTableDataChange(
                parseInt(e.target.value),
                selectedObject.data[0]?.length || 1
              )
            }
            error={!!tableErrors.rows}
            helperText={tableErrors.rows}
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <TextField
            label="列数"
            type="number"
            fullWidth
            InputProps={{ inputProps: { min: 2 } }}
            value={selectedObject.data[0]?.length || 1}
            onChange={(e) =>
              handleTableDataChange(
                selectedObject.data.length,
                parseInt(e.target.value)
              )
            }
            error={!!tableErrors.cols}
            helperText={tableErrors.cols}
          />
        </Box>
      </Box>
    </Box>
  );
};