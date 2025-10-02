import React from "react";
import type {
  InvoiceData,
  TextItem,
  TextItemStyle,
  CompanyInfoGql,
  TableCell,
} from "../utils/types";
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
  ListSubheader,
} from "@mui/material";

interface TextObjectPaletteProps {
  selectedObject: TextItem | TableCell;
  invoiceData: InvoiceData;
  companyInfoData: CompanyInfoGql | undefined;
  onContentChange: (key: keyof (TextItem | TableCell), value: any) => void;
  onStyleChange: (newStyle: Partial<TextItemStyle>) => void;
}

export const TextObjectPalette: React.FC<TextObjectPaletteProps> = ({
  selectedObject,
  invoiceData,
  companyInfoData,
  onContentChange,
  onStyleChange,
}) => {
  const renderVariableOptions = () => {
    const options = [];

    if (companyInfoData && companyInfoData.companyInfo) {
      const companyVariables = Object.entries(companyInfoData.companyInfo)
        .filter(([key, entry]) => entry && key !== "__typename")
        .map(([key, entry]: [string, any]) => ({
          key: `companyInfo.${key}`,
          label: entry.label,
        }));
      options.push(<ListSubheader key="company-info">自社情報</ListSubheader>);
      options.push(
        ...companyVariables.map((v) => (
          <MenuItem key={v.key} value={`{{${v.key}.value}}`}>
            {v.label}
          </MenuItem>
        ))
      );
    }

    if (invoiceData && invoiceData.form && Object.keys(invoiceData.form).length > 0) {
      const invoiceFormVariables = Object.entries(invoiceData.form)
        .filter(
          ([key, entry]) =>
            entry && key !== "__typename" && key !== "line_items"
        )
        .map(([key, entry]: [string, any]) => ({
          key: `form.${key}`,
          label: entry.label,
        }));
      options.push(
        <ListSubheader key="invoice-data">請求書データ</ListSubheader>
      );
      options.push(
        ...invoiceFormVariables.map((v) => (
          <MenuItem key={v.key} value={`{{${v.key}.value}}`}>
            {v.label}
          </MenuItem>
        ))
      );

      if (
        invoiceData.form.line_items &&
        invoiceData.form.line_items.length > 0
      ) {
        options.push(<ListSubheader key="line-items">明細項目</ListSubheader>);
        invoiceData.form.line_items.forEach((item, index) => {
          Object.entries(item)
            .filter(([key, entry]) => entry && key !== "__typename")
            .forEach(([key, entry]: [string, any]) => {
              options.push(
                <MenuItem
                  key={`line_items.${index}.${key}`}
                  value={`{{form.line_items.${index}.${key}.value}}`}
                >
                  {`明細 ${index + 1} - ${entry.label}`}
                </MenuItem>
              );
            });
        });
      }
    }

    return options;
  };

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
            onContentChange(
              "contentType",
              e.target.value as TextItem["contentType"]
            )
          }
        >
          <MenuItem value="fixed">固定文言</MenuItem>
          <MenuItem value="variable">データ</MenuItem>
          <MenuItem value="labeled-variable">カスタマイズ</MenuItem>
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
          onChange={(e) => onContentChange("content", e.target.value)}
        />
      )}

      {selectedObject.contentType === "variable" && (
        <FormControl fullWidth margin="normal">
          <InputLabel>データ</InputLabel>
          <Select
            value={selectedObject.content}
            label="データ"
            onChange={(e) => onContentChange("content", e.target.value)}
          >
            {renderVariableOptions()}
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
            onChange={(e) => onContentChange("label", e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>変数</InputLabel>
            <Select
              value={selectedObject.content}
              label="変数"
              onChange={(e) => onContentChange("content", e.target.value)}
            >
              {renderVariableOptions()}
            </Select>
          </FormControl>
        </>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1, mt: 1 }}>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>フォント</InputLabel>
            <Select
              value={selectedObject.style?.fontFamily || "BIZ UDPGothic"}
              label="フォント"
              onChange={(e) =>
                onStyleChange({
                  fontFamily: e.target.value as TextItemStyle["fontFamily"],
                })
              }
            >
              <MenuItem value="BIZ UDPGothic">BIZ UDPGothic</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <TextField
            label="フォントサイズ"
            type="number"
            fullWidth
            value={selectedObject.style?.fontSize || 12}
            onChange={(e) =>
              onStyleChange({ fontSize: parseFloat(e.target.value) })
            }
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <TextField
            label="行の高さ"
            type="number"
            fullWidth
            value={selectedObject.style?.lineHeight || 1}
            onChange={(e) =>
              onStyleChange({ lineHeight: parseFloat(e.target.value) })
            }
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>水平方向の配置</InputLabel>
            <Select
              value={selectedObject.style?.textAlign || "left"}
              label="水平方向の配置"
              onChange={(e) =>
                onStyleChange({
                  textAlign: e.target.value as TextItemStyle["textAlign"],
                })
              }
            >
              <MenuItem value="left">左揃え</MenuItem>
              <MenuItem value="center">中央揃え</MenuItem>
              <MenuItem value="right">右揃え</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>垂直方向の配置</InputLabel>
            <Select
              value={selectedObject.style?.verticalAlign || "top"}
              label="垂直方向の配置"
              onChange={(e) =>
                onStyleChange({
                  verticalAlign: e.target
                    .value as TextItemStyle["verticalAlign"],
                })
              }
            >
              <MenuItem value="top">上揃え</MenuItem>
              <MenuItem value="center">中央揃え</MenuItem>
              <MenuItem value="bottom">下揃え</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <TextField
            label="テキスト影"
            fullWidth
            value={selectedObject.style?.textShadow || ""}
            onChange={(e) => onStyleChange({ textShadow: e.target.value })}
            placeholder="e.g., 2px 2px 4px #000000"
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <InputLabel>色</InputLabel>
          <input
            type="color"
            value={selectedObject.style?.color || "#000000"}
            onChange={(e) => onStyleChange({ color: e.target.value })}
            style={{ width: "100%", height: "40px" }}
          />
        </Box>
        <Box sx={{ width: "50%", px: 1, mb: 2 }}>
          <InputLabel>背景色</InputLabel>
          <input
            type="color"
            value={selectedObject.style?.backgroundColor || "#FFFFFF"}
            onChange={(e) =>
              onStyleChange({ backgroundColor: e.target.value })
            }
            style={{ width: "100%", height: "40px" }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.bold || false}
              onChange={(e) => onStyleChange({ bold: e.target.checked })}
            />
          }
          label="太字"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.italic || false}
              onChange={(e) => onStyleChange({ italic: e.target.checked })}
            />
          }
          label="斜体"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedObject.style?.wordWrap || false}
              onChange={(e) =>
                onStyleChange({ wordWrap: e.target.checked })
              }
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
            onContentChange("content", newContent);
          }}
        />
      )}
    </Box>
  );
};
