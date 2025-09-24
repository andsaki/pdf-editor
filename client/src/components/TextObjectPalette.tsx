import React from "react";
import type { InvoiceData, TextItem } from "../types";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
} from "@mui/material";

interface TextObjectPaletteProps {
  selectedObject: TextItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const TextObjectPalette: React.FC<TextObjectPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const handleStyleChange = (newStyle: Partial<TextItem["style"]>) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "text") {
          return { ...item, style: { ...item.style, ...newStyle } };
        }
        return item;
      }),
    }));
  };

  const handleContentChange = (key: string, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      layout: prev.layout.map((item) => {
        if (item.id === selectedObject.id && item.type === "text") {
          return { ...item, [key]: value };
        }
        return item;
      }),
    }));
  };

  const variables = [
    "issue_date",
    "due_date",
    "invoice_number",
    "company_name",
    "company_zip",
    "company_address",
    "company_tel",
    "company_email",
    "recipient_name",
    "recipient_title",
    "recipient_zip",
    "recipient_address",
    "recipient_tel",
    "recipient_email",
    "subtotal",
    "tax",
    "total",
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        テキストオブジェクト
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>コンテントタイプ</InputLabel>
        <Select
          value={selectedObject.contentType}
          label="コンテントタイプ"
          onChange={(e) =>
            handleContentChange(
              "contentType",
              e.target.value as TextItem["contentType"]
            )
          }
        >
          <MenuItem value="fixed">固定文言</MenuItem>
          <MenuItem value="variable">変数</MenuItem>
          <MenuItem value="labeled-variable">ラベル付き変数</MenuItem>
        </Select>
      </FormControl>

      {selectedObject.contentType === "fixed" && (
        <TextField
          label="内容"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={selectedObject.content}
          onChange={(e) => handleContentChange("content", e.target.value)}
        />
      )}

      {selectedObject.contentType === "variable" && (
        <FormControl fullWidth margin="normal">
          <InputLabel>変数</InputLabel>
          <Select
            value={selectedObject.content}
            label="変数"
            onChange={(e) => handleContentChange("content", e.target.value)}
          >
            {variables.map((v) => (
              <MenuItem key={v} value={`{{${v}}}`}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedObject.contentType === "labeled-variable" && (
        <>
          <TextField
            label="ラベル"
            fullWidth
            margin="normal"
            value={selectedObject.label || ""}
            onChange={(e) => handleContentChange("label", e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>変数</InputLabel>
            <Select
              value={selectedObject.content}
              label="変数"
              onChange={(e) => handleContentChange("content", e.target.value)}
            >
              {variables.map((v) => (
                <MenuItem key={v} value={`{{${v}}}`}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>フォント</InputLabel>
            <Select
              value={selectedObject.style?.fontFamily || "Helvetica"}
              label="フォント"
              onChange={(e) =>
                handleStyleChange({ fontFamily: e.target.value as any })
              }
            >
              <MenuItem value="Helvetica">Helvetica</MenuItem>
              <MenuItem value="BIZ UDPGothic">BIZ UDPGothic</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="フォントサイズ"
            type="number"
            fullWidth
            value={selectedObject.style?.fontSize || 12}
            onChange={(e) =>
              handleStyleChange({ fontSize: parseFloat(e.target.value) })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="行の高さ"
            type="number"
            fullWidth
            value={selectedObject.style?.lineHeight || 1}
            onChange={(e) =>
              handleStyleChange({ lineHeight: parseFloat(e.target.value) })
            }
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>水平方向の配置</InputLabel>
            <Select
              value={selectedObject.style?.textAlign || "left"}
              label="水平方向の配置"
              onChange={(e) =>
                handleStyleChange({ textAlign: e.target.value as any })
              }
            >
              <MenuItem value="left">左揃え</MenuItem>
              <MenuItem value="center">中央揃え</MenuItem>
              <MenuItem value="right">右揃え</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>垂直方向の配置</InputLabel>
            <Select
              value={selectedObject.style?.verticalAlign || "top"}
              label="垂直方向の配置"
              onChange={(e) =>
                handleStyleChange({ verticalAlign: e.target.value as any })
              }
            >
              <MenuItem value="top">上揃え</MenuItem>
              <MenuItem value="center">中央揃え</MenuItem>
              <MenuItem value="bottom">下揃え</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="テキスト影"
            fullWidth
            value={selectedObject.style?.textShadow || ""}
            onChange={(e) => handleStyleChange({ textShadow: e.target.value })}
            placeholder="e.g., 2px 2px 4px #000000"
          />
        </Grid>
        <Grid item xs={6}>
            <InputLabel>色</InputLabel>
            <input
              type="color"
              value={selectedObject.style?.color || "#000000"}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
              style={{ width: "100%", height: "40px" }}
            />
        </Grid>
        <Grid item xs={6}>
            <InputLabel>背景色</InputLabel>
            <input
              type="color"
              value={selectedObject.style?.backgroundColor || "#FFFFFF"}
              onChange={(e) =>
                handleStyleChange({ backgroundColor: e.target.value })
              }
              style={{ width: "100%", height: "40px" }}
            />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.bold || false}
              onChange={(e) => handleStyleChange({ bold: e.target.checked })}
            />
          }
          label="太字"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.italic || false}
              onChange={(e) => handleStyleChange({ italic: e.target.checked })}
            />
          }
          label="斜体"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.wordWrap || false}
              onChange={(e) => handleStyleChange({ wordWrap: e.target.checked })}
            />
          }
          label="折り返し"
        />
      </Box>

      {selectedObject.style?.isBullet && (
        <TextField
          label="箇条書きの数"
          type="number"
          fullWidth
          margin="normal"
          InputProps={{ inputProps: { min: 1 } }}
          value={selectedObject.content.split("\n").length}
          onChange={(e) => {
            const newCount = parseInt(e.target.value);
            if (isNaN(newCount) || newCount < 1) return;

            const lines = selectedObject.content.split("\n");
            let newContent = "";

            if (newCount > lines.length) {
              newContent = lines.join("\n");
              for (let i = lines.length; i < newCount; i++) {
                newContent += `\n項目${i + 1}`;
              }
            } else if (newCount < lines.length) {
              newContent = lines.slice(0, newCount).join("\n");
            } else {
              newContent = selectedObject.content;
            }
            handleContentChange("content", newContent);
          }}
        />
      )}
    </Box>
  );
};
