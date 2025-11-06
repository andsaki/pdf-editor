import React from "react";
import type {
  InvoiceData,
  TextItem,
  TextItemStyle,
  CompanyInfoGql,
  TableCell,
} from "../utils/types";
import { Container, Text, Divider, PropertyInput as Input, Select, Checkbox, Textarea } from "../design-system/components";
import { spacing } from "../design-system/tokens";

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

    if (companyInfoData && companyInfoData.getCompanyInfo) {
      const companyVariables = Object.entries(companyInfoData.getCompanyInfo)
        .filter(([key, entry]) => entry && key !== "__typename")
        .map(([key, entry]: [string, any]) => ({
          key: `companyInfo.${key}`,
          label: entry.label,
        }));
      options.push(
        <optgroup key="company-info" label="自社情報">
          {companyVariables.map((v) => (
            <option key={v.key} value={`{{${v.key}.value}}`}>
              {v.label}
            </option>
          ))}
        </optgroup>
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
        <optgroup key="invoice-data" label="請求書データ">
          {invoiceFormVariables.map((v) => (
            <option key={v.key} value={`{{${v.key}.value}}`}>
              {v.label}
            </option>
          ))}
        </optgroup>
      );

      if (
        invoiceData.form.line_items &&
        invoiceData.form.line_items.length > 0
      ) {
        const lineItemOptions: JSX.Element[] = [];
        invoiceData.form.line_items.forEach((item, index) => {
          Object.entries(item)
            .filter(([key, entry]) => entry && key !== "__typename")
            .forEach(([key, entry]: [string, any]) => {
              lineItemOptions.push(
                <option
                  key={`line_items.${index}.${key}`}
                  value={`{{form.line_items.${index}.${key}.value}}`}
                >
                  {`明細 ${index + 1} - ${entry.label}`}
                </option>
              );
            });
        });
        options.push(
          <optgroup key="line-items" label="明細項目">
            {lineItemOptions}
          </optgroup>
        );
      }
    }

    return options;
  };

  return (
    <Container style={{ marginTop: spacing.scale[2] }}>
      <Divider style={{ margin: `${spacing.scale[2]} 0` }} />
      <Text variant="body" style={{ marginBottom: spacing.scale[2], display: 'block' }}>
        テキストオブジェクト
      </Text>
      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="コンテントタイプ"
          value={selectedObject.contentType}
          onChange={(e) =>
            onContentChange(
              "contentType",
              e.target.value as TextItem["contentType"]
            )
          }
        >
          <option value="fixed">固定文言</option>
          <option value="variable">データ</option>
          <option value="labeled-variable">カスタマイズ</option>
        </Select>
      </Container>

      {selectedObject.contentType === "fixed" && (
        <Container style={{ marginBottom: spacing.scale[2] }}>
          <Textarea
            label="内容"
            rows={4}
            value={selectedObject.content}
            onChange={(e) => onContentChange("content", e.target.value)}
            style={{ boxSizing: 'border-box' }}
          />
        </Container>
      )}

      {selectedObject.contentType === "variable" && (
        <Container style={{ marginBottom: spacing.scale[2] }}>
          <Select
            label="データ"
            value={selectedObject.content}
            onChange={(e) => onContentChange("content", e.target.value)}
          >
            {renderVariableOptions()}
          </Select>
        </Container>
      )}

      {selectedObject.contentType === "labeled-variable" && (
        <>
          <Container style={{ marginBottom: spacing.scale[2] }}>
            <Input
              label="ラベル"
              value={selectedObject.label || ""}
              onChange={(e) => onContentChange("label", e.target.value)}
            />
          </Container>
          <Container style={{ marginBottom: spacing.scale[2] }}>
            <Select
              label="変数"
              value={selectedObject.content}
              onChange={(e) => onContentChange("content", e.target.value)}
            >
              {renderVariableOptions()}
            </Select>
          </Container>
        </>
      )}

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="フォント"
          value={selectedObject.style?.fontFamily || "BIZ UDPGothic"}
          onChange={(e) =>
            onStyleChange({
              fontFamily: e.target.value as TextItemStyle["fontFamily"],
            })
          }
        >
          <option value="BIZ UDPGothic">BIZ UDPGothic</option>
        </Select>
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="フォントサイズ"
          type="number"
          value={selectedObject.style?.fontSize || 12}
          onChange={(e) =>
            onStyleChange({ fontSize: parseFloat(e.target.value) })
          }
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="行の高さ"
          type="number"
          value={selectedObject.style?.lineHeight || 1}
          onChange={(e) =>
            onStyleChange({ lineHeight: parseFloat(e.target.value) })
          }
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="水平方向の配置"
          value={selectedObject.style?.textAlign || "left"}
          onChange={(e) =>
            onStyleChange({
              textAlign: e.target.value as TextItemStyle["textAlign"],
            })
          }
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>
        </Select>
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Select
          label="垂直方向の配置"
          value={selectedObject.style?.verticalAlign || "top"}
          onChange={(e) =>
            onStyleChange({
              verticalAlign: e.target
                .value as TextItemStyle["verticalAlign"],
            })
          }
        >
          <option value="top">上揃え</option>
          <option value="center">中央揃え</option>
          <option value="bottom">下揃え</option>
        </Select>
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Input
          label="テキスト影"
          value={selectedObject.style?.textShadow || ""}
          onChange={(e) => onStyleChange({ textShadow: e.target.value })}
          placeholder="e.g., 2px 2px 4px #000000"
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Text as="label" variant="body" style={{ display: 'block', marginBottom: spacing.scale[1] }}>色</Text>
        <input
          type="color"
          value={selectedObject.style?.color || "#000000"}
          onChange={(e) => onStyleChange({ color: e.target.value })}
          style={{ width: "100%", height: "40px", boxSizing: "border-box" }}
        />
      </Container>

      <Container style={{ marginBottom: spacing.scale[2] }}>
        <Text as="label" variant="body" style={{ display: 'block', marginBottom: spacing.scale[1] }}>背景色</Text>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#FFFFFF"}
          onChange={(e) =>
            onStyleChange({ backgroundColor: e.target.value })
          }
          style={{ width: "100%", height: "40px", boxSizing: "border-box" }}
        />
      </Container>

      <Container style={{ marginTop: spacing.scale[2] }}>
        <Checkbox
          label="太字"
          checked={selectedObject.style?.bold || false}
          onChange={(e) => onStyleChange({ bold: e.target.checked })}
        />
        <Checkbox
          label="斜体"
          checked={selectedObject.style?.italic || false}
          onChange={(e) => onStyleChange({ italic: e.target.checked })}
        />
        <Checkbox
          label="折り返し"
          checked={selectedObject.style?.wordWrap || false}
          onChange={(e) =>
            onStyleChange({ wordWrap: e.target.checked })
          }
        />
      </Container>

      {selectedObject.style?.isBullet && (
        <Container style={{ marginTop: spacing.scale[2] }}>
          <Input
            label="箇条書きの数"
            type="number"
            min={1}
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
        </Container>
      )}
    </Container>
  );
};
