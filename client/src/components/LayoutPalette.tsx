import React, { useState } from "react";
import type { InvoiceData, LayoutItem } from "../types";
import { TextObjectPalette } from "./TextObjectPalette";
import { TableItemSchema } from "../schemas";

interface LayoutPaletteProps {
  selectedObject: LayoutItem;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

/**
 * 選択されたオブジェクトのプロパティを表示・編集するためのパレットコンポーネントです。
 * @param {LayoutPaletteProps} props コンポーネントのプロパティ
 * @returns {JSX.Element | null} 選択されたオブジェクトがない場合はnullを返します。
 */
export const LayoutPalette: React.FC<LayoutPaletteProps> = ({
  selectedObject,
  setInvoiceData,
}) => {
  const [tableErrors, setTableErrors] = useState<{
    rows?: string;
    cols?: string;
  }>({});

  /**
   * テーブルの行数・列数の変更を処理し、テーブルデータをリサイズします。
   * @param {number} rows 新しい行数
   * @param {number} cols 新しい列数
   */
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

  if (!selectedObject) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">レイアウトパレット</h3>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ID:
        </label>
        <p className="text-xs text-gray-500">{selectedObject.id}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Type:
        </label>
        <p>{selectedObject.type === 'text' ? 'テキスト' : selectedObject.type === 'table' ? 'テーブル' : '画像'}</p>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">X:</label>
        <input
          type="number"
          value={selectedObject.x}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              layout: prev.layout.map((item) =>
                item.id === selectedObject.id
                  ? { ...item, x: parseFloat(e.target.value) }
                  : item
              ),
            }))
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">Y:</label>
        <input
          type="number"
          value={selectedObject.y}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              layout: prev.layout.map((item) =>
                item.id === selectedObject.id
                  ? { ...item, y: parseFloat(e.target.value) }
                  : item
              ),
            }))
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">幅:</label>
        <input
          type="number"
          value={selectedObject.width}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              layout: prev.layout.map((item) =>
                item.id === selectedObject.id
                  ? { ...item, width: parseFloat(e.target.value) }
                  : item
              ),
            }))
          }
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">高さ:</label>
        <input
          type="number"
          value={selectedObject.height}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              layout: prev.layout.map((item) =>
                item.id === selectedObject.id
                  ? { ...item, height: parseFloat(e.target.value) }
                  : item
              ),
            }))
          }
        />
      </div>

      {selectedObject.type === "text" && (
        <TextObjectPalette
          selectedObject={selectedObject}
          setInvoiceData={setInvoiceData}
        />
      )}

      {selectedObject.type === "table" && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              行数:
            </label>
            <input
              type="number"
              min="2"
              value={selectedObject.data.length}
              onChange={(e) =>
                handleTableDataChange(
                  parseInt(e.target.value),
                  selectedObject.data[0]?.length || 1
                )
              }
            />
            {tableErrors.rows && (
              <span className="text-red-500 text-xs">{tableErrors.rows}</span>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              列数:
            </label>
            <input
              type="number"
              min="2"
              value={selectedObject.data[0]?.length || 1}
              onChange={(e) =>
                handleTableDataChange(
                  selectedObject.data.length,
                  parseInt(e.target.value)
                )
              }
            />
            {tableErrors.cols && (
              <span className="text-red-500 text-xs">{tableErrors.cols}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
