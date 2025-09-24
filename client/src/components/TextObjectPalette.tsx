import React from "react";
import type { InvoiceData, TextItem } from "../types";

interface TextObjectPaletteProps {
  selectedObject: TextItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export const TextObjectPalette: React.FC<TextObjectPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const handleStyleChange = (newStyle: Partial<TextItem["style"]>) => {
    console.log("Updating style with:", newStyle); // Debug log
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
    <>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          コンテントタイプ:
        </label>
        <select
          value={selectedObject.contentType}
          onChange={(e) =>
            handleContentChange(
              "contentType",
              e.target.value as TextItem["contentType"]
            )
          }
        >
          <option value="fixed">固定文言</option>
          <option value="variable">変数</option>
          <option value="labeled-variable">ラベル付き変数</option>
        </select>
      </div>

      {selectedObject.contentType === "fixed" && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            内容:
          </label>
          <textarea
            value={selectedObject.content}
            onChange={(e) => handleContentChange("content", e.target.value)}
          />
        </div>
      )}

      {selectedObject.contentType === "variable" && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            変数:
          </label>
          <select
            value={selectedObject.content}
            onChange={(e) => handleContentChange("content", e.target.value)}
          >
            {variables.map((v) => (
              <option key={v} value={`{{${v}}}`}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedObject.contentType === "labeled-variable" && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ラベル:
            </label>
            <input
              type="text"
              value={selectedObject.label || ""}
              onChange={(e) => handleContentChange("label", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Variable:
            </label>
            <select
              value={selectedObject.content}
              onChange={(e) => handleContentChange("content", e.target.value)}
            >
              {variables.map((v) => (
                <option key={v} value={`{{${v}}}`}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          フォント:
        </label>
        <select
          value={selectedObject.style?.fontFamily || "Helvetica"}
          onChange={(e) =>
            handleStyleChange({ fontFamily: e.target.value as any })
          }
        >
          <option value="Helvetica">Helvetica</option>
          <option value="BIZ UDPGothic">BIZ UDPGothic</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          フォントサイズ:
        </label>
        <input
          type="number"
          value={selectedObject.style?.fontSize || 12}
          onChange={(e) =>
            handleStyleChange({ fontSize: parseFloat(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          行の高さ:
        </label>
        <input
          type="number"
          value={selectedObject.style?.lineHeight || 1}
          onChange={(e) =>
            handleStyleChange({ lineHeight: parseFloat(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          水平方向の配置:
        </label>
        <select
          value={selectedObject.style?.textAlign || "left"}
          onChange={(e) =>
            handleStyleChange({ textAlign: e.target.value as any })
          }
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>{" "}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          垂直方向の配置:
        </label>
        <select
          value={selectedObject.style?.verticalAlign || "top"}
          onChange={(e) =>
            handleStyleChange({ verticalAlign: e.target.value as any })
          }
        >
          <option value="top">上揃え</option>
          <option value="center">中央揃え</option>
          <option value="bottom">下揃え</option>{" "}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          色:
        </label>
        <input
          type="color"
          value={selectedObject.style?.color || "#000000"}
          onChange={(e) => handleStyleChange({ color: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          背景色:
        </label>
        <input
          type="color"
          value={selectedObject.style?.backgroundColor || "#FFFFFF"}
          onChange={(e) =>
            handleStyleChange({ backgroundColor: e.target.value })
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          テキスト影:
        </label>
        <input
          type="text"
          value={selectedObject.style?.textShadow || ""}
          onChange={(e) => handleStyleChange({ textShadow: e.target.value })}
          placeholder="e.g., 2px 2px 4px #000000"
        />
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedObject.style?.bold || false}
            onChange={(e) => handleStyleChange({ bold: e.target.checked })}
          />
          <span className="ml-2">太字</span>{" "}
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedObject.style?.italic || false}
            onChange={(e) => handleStyleChange({ italic: e.target.checked })}
          />
          <span className="ml-2">斜体</span>{" "}
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedObject.style?.wordWrap || false}
            onChange={(e) => handleStyleChange({ wordWrap: e.target.checked })}
          />
          <span className="ml-2">折り返し</span>
        </label>
      </div>

      {selectedObject.style?.isBullet && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            箇条書きの数:
          </label>
          <input
            type="number"
            min="1"
            value={selectedObject.content.split("\n").length}
            onChange={(e) => {
              const newCount = parseInt(e.target.value);
              if (isNaN(newCount) || newCount < 1) return;

              const lines = selectedObject.content.split("\n");
              let newContent = "";

              if (newCount > lines.length) {
                // Add new lines
                newContent = lines.join("\n");
                for (let i = lines.length; i < newCount; i++) {
                  newContent += `\n項目${i + 1}`;
                }
              } else if (newCount < lines.length) {
                // Remove lines
                newContent = lines.slice(0, newCount).join("\n");
              } else {
                newContent = selectedObject.content;
              }
              handleContentChange("content", newContent);
            }}
          />
        </div>
      )}
    </>
  );
};
